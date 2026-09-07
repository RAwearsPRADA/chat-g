use sqlx::PgPool;
use redis::Client;

#[derive(Clone)]
pub struct AppConfig {
    pub db_pool: PgPool,
    pub redis_connection: redis::aio::MultiplexedConnection
}

pub async fn init_config() -> AppConfig {
    dotenvy::dotenv().ok();

    let db_url = std::env::var("DATABASE_URL").expect("Database url wasn't found in env");
    let redis_url = std::env::var("REDIS_HOST").expect("Redis url wasn't found in env");

    let db_pool = PgPool::connect(&db_url).await.expect("Database connection error");
    let redis_client = Client::open(redis_url).unwrap();
    let redis_connection = redis_client
    .get_multiplexed_tokio_connection()
    .await
    .unwrap();

    AppConfig {db_pool, redis_connection}
}