# 💬 chat-g — High-Performance Real-Time Messenger Architecture

<p align="center">
  <img src="https://shields.io" />&nbsp;&nbsp;
  <img src="https://shields.io" />&nbsp;&nbsp;
  <img src="https://shields.io" />&nbsp;&nbsp;
  <img src="https://shields.io" />&nbsp;&nbsp;
  <img src="https://shields.io" />
</p>

A scalable, event-driven hybrid messaging application engineered to sustain high-throughput concurrent WebSocket transactions. The architecture decouples durable persistent states from reactive streaming pipelines to bypass standard database write-locking bottlenecks.

---

## 🏗️ Architectural Core Overview

For a detailed breakdown of the complete system data-flow, network topology, and concurrency mechanics, check out the dedicated specification file:
👉 **[Read the Full Architecture Documentation (architecture.md)](./architecture.md)**

### Key Highlights:
*   **Data Plane Plane Isolation:** Heavy business logic (auth, CRUD, history) is managed via an optimized **Next.js App Router** HTTP plane, while high-frequency messaging I/O runs inside a compiled native **Rust Axum** engine.
*   **Memory Efficiency:** Thread-safe, non-blocking client mapping leveraging **sharded `DashMap` storage arrays** in the Rust memory runtime to eliminate global thread starvation.
*   **Micro-Batching Ingestion:** Asynchronous background Tokio threads utilizing high-speed **Redis atomic `LPOP` buffers** to collapse hundreds of individual mutations into single PostgreSQL CTE bulk-writes.
*   **Handshake Optimization:** Zero-database stateless connection upgrading using presigned **HMAC-SHA256 authorization tokens** issued dynamically via Next.js.
*   **Frontend Design:** Client codebase strictly follows the **Feature-Sliced Design (FSD)** methodology with isolated **Zustand** state slices for deterministic cache sync.

---

## ⚙️ Local Development & Quick Start

### 1. Requirements
Ensure you have the following services provisioned on your local machine:
*   **Node.js** (v18+ recommended)
*   **Rust Compiler** (Cargo runtime toolchain)
*   **Redis Server** (Active cluster node or standalone instance)
*   **PostgreSQL СУБД**

### 2. Infrastructure Spin-up

#### Frontend & API Plane
```bash
# Install package node dependencies
npm install

# Initialize local development environment
npm run dev
```

#### Real-Time Engine (Rust Backend)
```bash
# Navigate to backend source root
cd ws-rust-server

# Set required runtime context flags
export REDIS_HOST="redis://127.0.0.1:6379"

# Execute asynchronous server loop
cargo run --release
```

---

## 📬 Contacts & R&D Inquiries
*   **Developer:** [@RAwearsPRADA](https://t.me)
*   **Focus:** Available for Junior+ / Middle roles, backend engineering pipelines, highload design, and systems programming internships.
