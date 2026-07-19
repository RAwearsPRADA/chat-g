use sqlx::{PgPool, QueryBuilder};
use redis::{AsyncCommands, Commands, Client};
use tokio::time::{sleep, Duration};
use crate::config::AppConfig;

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all="camelCase")]
pub struct Message {
    pub id: u64,
    pub content: String,
    pub conversation_id: u64,
    pub sender_id: u64,
    pub created_at: u64,
    pub is_read: bool,
    pub r#type: MessageType
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "UPPERCASE")] 
pub enum MessageType {
    TEXT,
    VOICE,
    ATTACHMENT,
    FORWARDED
}

// Реализуем перевод энума в &str для sqlx вручную (это нулевая стоимость, работает мгновенно)
impl MessageType {
    pub fn as_str(&self) -> &'static str {
        match self {
            MessageType::TEXT => "TEXT",
            MessageType::VOICE => "VOICE",
            MessageType::ATTACHMENT => "ATTACHMENT",
            MessageType::FORWARDED => "FORWARDED",
        }
    }
}


pub struct MessageQueueWorker {
    db: PgPool,
    redis: Client
}

impl MessageQueueWorker {
    pub fn new(config: AppConfig) -> Self {
        Self {
            db: config.db_pool,
            redis: Client::open(std::env::var("REDIS_HOST").expect("REDIS_HOST wasn't found")).unwrap()
        }
    }
    
    pub async fn start(self) {
        loop {
            match self.start_message_queue_worker().await {
                Ok(inserted_count) => {
                    if inserted_count == 0 {
                        sleep(Duration::from_secs(1)).await;
                    }
                }
                Err(error) => {
                    println!("Error: {}", error);
                    sleep(Duration::from_secs(2)).await;
                }
            }
        }
    }

    pub async fn start_message_queue_worker(&self) -> Result<usize, String> {
        let mut redis_conn = self.redis.get_multiplexed_tokio_connection()
            .await
            .map_err(|e| e.to_string())?;
        let redis_query: Option<Vec<String>> = redis_conn.lpop("queue:messages", std::num::NonZero::new(1000))
            .await
            .map_err(|e| e.to_string())?;
        let messages_json = match redis_query {
            Some(vector) => {
                vector
            },
            _ => {
                return Ok(0)
            }
        };
        if messages_json.is_empty() {
            return Ok(0);
        }
        
        let mut parsed_messages = Vec::new();
        for str in messages_json {
            if let Ok(parsed_msg) = serde_json::from_str::<Message>(&str) {
                parsed_messages.push(parsed_msg);
            }
        }
        if parsed_messages.is_empty() {
            return Ok(0)
        }
        
        let mut sql = String::from(
        "INSERT INTO \"Message\" (content, \"conversationId\", \"senderId\", \"createdAt\", \"isRead\", type) VALUES "
    );

    let mut placeholders = Vec::new();
    let fields_count = 6; // Сколько полей вставляем

    for i in 0..parsed_messages.len() {
        let base = i * fields_count;
        placeholders.push(format!(
            "(${}, ${}, ${}, ${}, ${}, ${}::\"MessageType\")",
            base + 1, base + 2, base + 3, base + 4, base + 5, base + 6
        ));
    }
    sql.push_str(&placeholders.join(", "));

    let mut query = sqlx::query(&sql);
    let inserted_len = parsed_messages.len();

    for msg in parsed_messages {
        query = query
            .bind(msg.content)
            .bind(msg.conversation_id as i64)
            .bind(msg.sender_id as i64)
            .bind(msg.created_at as i64)
            .bind(msg.is_read)
            .bind(msg.r#type.as_str()); 
    }

    query.execute(&self.db)
        .await
        .map_err(|e| e.to_string())?;

    println!("🎰 Успешно записано в Postgres пакетом через каст: {} шт.", inserted_len);
    Ok(inserted_len)
    }
}

pub async fn start_message_queue_worker(config: AppConfig) {
    let worker = MessageQueueWorker::new(config);

    worker.start().await;
}