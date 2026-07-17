use sqlx::{PgPool, QueryBuilder};
use redis::{AsyncCommands, Commands};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};
use serde::Deserialize;
use crate::config::AppConfig;

#[derive(serde::Deserialize, Debug)]
#[serde(rename_all="camelCase")]
pub struct WsMessage {
    message: Message,
    is_typing: bool,
    message_target: u64,
    user: User
}

#[derive(serde::Deserialize, Debug)]
#[serde(rename_all="camelCase")]
pub struct Message {
    pub id: u64,
    pub content: String,
    pub chat_id: u64,
    pub sender_id: u64,
    pub created_at: u64,
    pub is_read: bool,
    pub r#type: String
}

#[derive(serde::Deserialize, Debug)]
pub struct User {
    pub nick: String,
    pub name: String,
    pub email: String,
    pub avatar: String,
    pub id: u64
}

pub struct MessageQueueWorker {
    db: PgPool,
    redis: redis::aio::MultiplexedConnection
}

impl MessageQueueWorker {
    pub fn new(config: AppConfig) -> Self {
        Self {
            db: config.db_pool,
            redis: config.redis_connection
        }
    }
    
    pub async fn start(mut self) {
        loop {
            sleep(Duration::from_secs(1)).await;
            if let Err(_kal) = self.start_message_queue_worker().await {
                eprintln!("Butching messages error");
            }
        }
    }

    pub async fn start_message_queue_worker(&mut self) -> Result<(), String> {
        let messages_json: Vec<String> = self.redis.lrange("queue:messages", 0, 999)
            .await
            .map_err(|e| e.to_string())?;

        if messages_json.is_empty() {
            return Ok(());
        }
        
        let messages_len = messages_json.len() as isize;
        let _: () = self.redis.ltrim("queue:messages", messages_len, -1)
            .await
            .map_err(|e| e.to_string())?;
        
        let mut parsed_messages: Vec<WsMessage> = Vec::new();
        for str in messages_json {
            if let Ok(msg) = serde_json::from_str::<WsMessage>(&str) {
                parsed_messages.push(msg);
            }
        }
        if parsed_messages.is_empty() {
            return Ok(());
        }
        
        let mut query_builder = QueryBuilder::new(
            "INSERT INTO messages (content, chat_id, sender_id, created_at, is_read, type) "
        );

        query_builder.push_values(parsed_messages, |mut b, msg| {
            b
             .push_bind(msg.message.content)
             .push_bind(msg.message.chat_id as i64)
             .push_bind(msg.message.sender_id as i64)
             .push_bind(msg.message.created_at as i64)
             .push_bind(msg.message.is_read)
             .push_bind(msg.message.r#type);
        });

        let query = query_builder.build();
        
        query.execute(&self.db)
            .await
            .map_err(|e| e.to_string())?;

        println!("💾 Worker successfully wrote messages butch in DB!");
        Ok(())
    }
}