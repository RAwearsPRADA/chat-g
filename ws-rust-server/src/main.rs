use axum::{
    extract::{ws::{Message, WebSocket}, Query, State, WebSocketUpgrade},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Router,
};
use dashmap::DashMap;
use futures_util::{SinkExt, StreamExt};
use hmac::{Hmac, Mac};
use redis::{AsyncCommands, Client};
use serde::{Deserialize};
use sha2::Sha256;
use sqlx::PgPool;
use std::{collections::HashSet, sync::Arc, time::{SystemTime, UNIX_EPOCH}};
use tokio::sync::mpsc;

mod config;
mod worker;
mod message_queue_worker;

type HmacSha256 = Hmac<Sha256>;
type Tx = mpsc::UnboundedSender<Message>;

struct AppState {
    rooms: DashMap<u64, Vec<Tx>>,
    users_sockets: DashMap<u64, Vec<Tx>>,
    redis_client: Client,
    ws_secret: String,
}

#[derive(Debug, Deserialize)]
struct UpgradeQuery {
    ticket: String,
}

#[derive(Debug, Deserialize)]
struct WsRequest {
    r#type: String,
    data: WsRequestData,
}

#[derive(Debug, Deserialize)]
struct WsRequestData {
    #[serde(rename = "messageTarget")]
    message_target: Option<u64>,
    user: Option<UserField>,
    nick: Option<String>,
    #[serde(rename = "lastMessageTimestamp")]
    timestamp: Option<u64>
}

#[derive(Debug, Deserialize)]
struct UserField {
    nick: String,
}

#[derive(Debug, Deserialize)]
struct ChatCreatedPayload {
    #[serde(rename = "chatId")]
    chat_id: u64,
    #[serde(rename = "participantsIds")]
    participants_ids: Vec<u64>,
}


fn subscribe_to_room(state: &AppState, chat_id: u64, ws_tx: Tx) {
    state.rooms.entry(chat_id).or_insert_with(Vec::new).push(ws_tx);
}

fn publish_to_room(state: &AppState, chat_id: u64, msg_str: String, ignore_tx: Option<&Tx>) {
    if let Some(room_txs) = state.rooms.get(&chat_id) {
        let message = Message::Text(msg_str);
        for tx in room_txs.iter() {
            if let Some(ignore) = ignore_tx {
                if tx.same_channel(ignore) { continue; }
            }
            let _ = tx.send(message.clone());
        }
    }
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    
    let config = config::init_config().await; 
    
    let mut con = config.redis_connection.clone();
    let _: Result<(), _> = con.del("users:online").await;
    println!("✅ REDIS successfully connected");

    let worker_config = config.clone();
    tokio::spawn(async move {
        worker::start_chat_read_worker(worker_config).await;
    });

    let ws_secret = std::env::var("WS_SECRET").expect("WS_SECRET must be set");
    let state = Arc::new(AppState {
        rooms: DashMap::new(),
        users_sockets: DashMap::new(),
        redis_client: Client::open(std::env::var("REDIS_HOST").expect("REDIS URL wasn't found")).unwrap(),
        ws_secret,
    });

    tokio::spawn(redis_sub_loop(state.redis_client.clone(), state.clone()));

    let app = Router::new()
        .route("/", get(ws_handler))
        .with_state(state);

    println!("🚀 Server started on port 2379");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:2379").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(query): Query<UpgradeQuery>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    if let Some((nick, id)) = verify_ticket(&query.ticket, &state.ws_secret) {
        ws.on_upgrade(move |socket| handle_socket(socket, state, nick, id))
    } else {
        StatusCode::UNAUTHORIZED.into_response()
    }
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>, nick: String, user_id: u64) {
    let (mut ws_sender, mut ws_receiver) = socket.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    state.users_sockets.entry(user_id).or_insert_with(Vec::new).push(tx.clone());

    let mut my_chats = HashSet::<u64>::new();

    let mut con = match state.redis_client.get_multiplexed_async_connection().await {
    Ok(c) => c,
    Err(e) => {
        eprintln!("❌ Error of creating multiplexed connection: {:?}", e);
        return;
    }
};


    
    let is_first_tab = {
        state.users_sockets.get(&user_id).map_or(false, |txs| txs.len() == 1)
    };
    if is_first_tab {
        let _: Result<i64, _> = con.sadd("users:online", &nick).await;
    }

    let chats_data: Vec<String> = con.smembers(format!("user:{}:chats", user_id)).await.unwrap_or_default();
    let mut participants_keys = Vec::new();

    let notification = serde_json::json!({
        "type": "new user connected",
        "data": { "nick": &nick }
    }).to_string();

    for chat_str in chats_data {
        if let Ok(chat_id) = chat_str.parse::<u64>() {
            my_chats.insert(chat_id);
            subscribe_to_room(&state, chat_id, tx.clone());
            publish_to_room(&state, chat_id, notification.clone(), Some(&tx));
            participants_keys.push(format!("chat:{}:members", chat_id));
        }
    }

    if !participants_keys.is_empty() {
        if let Ok(siblings_nicks) = con.sunion::<_, Vec<String>>(participants_keys).await {
    let siblings_filtered: Vec<String> = siblings_nicks.into_iter().filter(|n| n != &nick).collect();
    
    if !siblings_filtered.is_empty() {
        let mut cmd = redis::cmd("SMISMEMBER");
        cmd.arg("users:online");
        for s_nick in &siblings_filtered { cmd.arg(s_nick); }
        
        let online_statuses_res: Result<Vec<i32>, _> = cmd.query_async(&mut con).await;
        
        if let Ok(online_statuses) = online_statuses_res {
            let siblings_online: Vec<String> = siblings_filtered.into_iter().enumerate()
                .filter(|(idx, _)| online_statuses.get(*idx) == Some(&1))
                .map(|(_, s_nick)| s_nick)
                .collect();

            let online_msg = serde_json::json!({
                "type": "online users",
                "data": { "onlineUsers": siblings_online }
            }).to_string();
            
            let _ = tx.send(Message::Text(online_msg));
        }
    }
}
    }


    let mut send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_sender.send(msg).await.is_err() { break; }
        }
    });

    let state_clone = state.clone();
    let mut redis_recv_clone = con.clone();
    let tx_clone = tx.clone();
    let nick_clone = nick.clone();

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = ws_receiver.next().await {
            if let Ok(req) = serde_json::from_str::<WsRequest>(&text) {
                let Some(target_chat) = req.data.message_target else { continue; };
                if target_chat == 0 { continue; }
                let has_access = state_clone.rooms.get(&target_chat)
                    .map_or(false, |room_txs| room_txs.iter()
                    .any(|t| t.same_channel(&tx_clone)));

                if !has_access { continue; }

                if req.r#type == "read message" {
                    if let Some(timestamp) = req.data.timestamp {
                        let hash_key = "unread_statuses_buffer";
                        let field = format!("{}:{}", target_chat, user_id);
                        
                        let _: Result<i32, _> = redis_recv_clone.hset(hash_key, field, timestamp).await;
                    }
                }

                if req.r#type == "new message" {
                    if let Some(ref u) = req.data.user {
                        if u.nick != nick_clone { continue; }
                    } else { continue; }
                }
                if let Some(ref n) = req.data.nick {
                    if n != &nick_clone { continue; }
                }

                if ["new message", "typing", "recording message", "listening own voice message", "removed voice message", 
                    "sending voice message", "read message"]
                    .contains(&req.r#type.as_str()) 
                {
                    publish_to_room(&state_clone, target_chat, text, Some(&tx_clone));
                }
            }
        }
    });

    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    };


    let mut is_completely_offline = false;
    
    if let Some(mut txs) = state.users_sockets.get_mut(&user_id) {
        txs.retain(|t| !t.same_channel(&tx));
        if txs.is_empty() { is_completely_offline = true; }
    }
    
    if is_completely_offline {
        state.users_sockets.remove(&user_id);
        let _: Result<i64, _> = con.srem("users:online", &nick).await;

        let disconnection_notification = serde_json::json!({
            "type": "user disconnected",
            "data": { "nick": &nick }
        }).to_string();

        for chat_id in &my_chats {
            publish_to_room(&state, *chat_id, disconnection_notification.clone(), None);
        }
    }
    

    for chat_id in my_chats {
        if let Some(mut room_txs) = state.rooms.get_mut(&chat_id) {
            room_txs.retain(|t| !t.same_channel(&tx));
            if room_txs.is_empty() {
                drop(room_txs);
                state.rooms.remove(&chat_id);
            }
        }
    }
}

async fn redis_sub_loop(client: Client, state: Arc<AppState>) {

    let mut pubsub = match client.get_async_pubsub().await {
        Ok(p) => p,
        Err(e) => {
            eprintln!("❌ Redis connection error: {:?}", e);
            return;
        }
    };

    if let Err(e) = pubsub.subscribe("chat:created").await {
        eprintln!("❌ Subscribing error on redis channel chat:created: {:?}", e);
        return;
    }

    println!("📡 Successfully subscribed on redis channel 'chat:created'");

    let mut stream = pubsub.into_on_message();

    while let Some(msg) = stream.next().await {
        let payload_str: String = msg.get_payload().unwrap_or_default();
        
        if let Ok(payload) = serde_json::from_str::<ChatCreatedPayload>(&payload_str) {
            println!("🔔Chat №{} was created", payload.chat_id);
            if let Some(txs) = state.rooms.get(&payload.chat_id) {
                println!("Count of txs {}", txs.len());
            }
            for u_id in payload.participants_ids {
                if let Some(user_txs) = state.users_sockets.get(&u_id) {
                    for tx in user_txs.iter() {
                        subscribe_to_room(&state, payload.chat_id, tx.clone());
                    }
                }
            }
        } else {
            eprintln!("⚠️ Invalid JSON {}", payload_str);
        }
    }
}


fn verify_ticket(ticket: &str, secret: &str) -> Option<(String, u64)> {
    let parts: Vec<&str> = ticket.split('-').collect();
    if parts.len() != 2 { return None; }
    let payload = parts[0];
    let signature = parts[1];

    let payload_parts: Vec<&str> = payload.split(':').collect();
    if payload_parts.len() != 3 { return None; }
    let nick = payload_parts[0].to_string();
    let id = payload_parts[1].parse::<u64>().ok()?;
    let expires_at = payload_parts[2].parse::<u64>().ok()?;

    let now = SystemTime::now().duration_since(UNIX_EPOCH).ok()?.as_millis() as u64;
    if now > expires_at { return None; }

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).ok()?;
    mac.update(payload.as_bytes());
    let expected_signature = hex::encode(mac.finalize().into_bytes());

    if expected_signature == signature { Some((nick, id)) } else { None }
}
