use sqlx::PgPool;
use redis::{AsyncCommands, Commands};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};
use crate::config::AppConfig;

pub struct DbFlushWorker{
    db: PgPool,
    redis: redis::aio::MultiplexedConnection
}

impl DbFlushWorker {
    pub fn new(config: AppConfig) -> Self {
        Self {
            db: config.db_pool,
            redis: config.redis_connection
        }
    }

    pub async fn start(mut self) {
        loop {
            sleep(Duration::from_secs(1)).await;
             if let Err(e) = self.flush_buffer_to_postgres().await {
                eprintln!("[ERROR] Flush buffer routine failed: {}", e);
            }
        }
    }

    async fn flush_buffer_to_postgres(&mut self) -> Result<(), String> {
        let hash_key = "unread_statuses_buffer";

        let mut pipe = redis::pipe();
        pipe.hgetall(hash_key).del(hash_key);

        let (updates, _): (HashMap<String, String>, u32) = pipe
            .query_async(&mut self.redis)
            .await
            .map_err(|e| e.to_string())?;

        if updates.is_empty() {
            return Ok(());
        }

        println!("[INFO] Extracted {} participant updates from Redis. Running UNNEST...", updates.len());

        let mut conversation_ids: Vec<i32> = Vec::with_capacity(updates.len());
        let mut user_ids: Vec<i32> = Vec::with_capacity(updates.len());         
        let mut timestamps: Vec<i64> = Vec::with_capacity(updates.len());       

        for (conv_user_key, timestamp_str) in updates {
            let parts: Vec<&str> = conv_user_key.split(':').collect();
            if parts.len() != 2 { continue; }

            let conversation_id: i32 = parts[0].parse().unwrap_or(0);
            let user_id: i32 = parts[1].parse().unwrap_or(0);
            let last_message_time: i64 = timestamp_str.parse().unwrap_or(0);

            conversation_ids.push(conversation_id);
            user_ids.push(user_id);
            timestamps.push(last_message_time);
        }

        sqlx::query!(
            r#"
            UPDATE "Message" AS m
            SET "isRead" = true
            FROM (
                SELECT 
                    unnest($1::integer[]) AS c_id,
                    unnest($2::integer[]) AS u_id,
                    unnest($3::bigint[]) AS read_ts
            ) AS data
            WHERE m."conversationId" = data.c_id 
              AND m."senderId" != data.u_id    
              AND m."isRead" = false           
              AND m."createdAt" <= data.read_ts    
            "#,
            &conversation_ids[..],
            &user_ids[..],
            &timestamps[..]
        )
        .execute(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        sqlx::query!(
            r#"
            UPDATE "ConversationParticipant" AS p
            SET "lastMessageIsRead" = true
            FROM (
                SELECT 
                    unnest($1::integer[]) AS c_id,
                    unnest($2::bigint[]) AS read_ts -- $2 ссылается на второй переданный аргумент (&timestamps)
            ) AS data
            WHERE p."conversationId" = data.c_id 
              AND p."lastMessageTime" <= data.read_ts
              AND p."lastMessageIsRead" = false
            "#,
            &conversation_ids[..],
            &timestamps[..]
        )
        .execute(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        println!("[INFO] Successfully bulk-updated {} participants in Postgres!", conversation_ids.len());
        Ok(())
}
}

pub async fn start_chat_read_worker(config: AppConfig) {
    let worker = DbFlushWorker::new(config);
    
    worker.start().await;
}