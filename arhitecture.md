### 7.1. High-Throughput Message Status Buffer (Redis Queue)
To protect the main database from write-lock bottlenecks during messaging spikes, message statuses (ACK_DELIVERED / ACK_READ) are buffered:

1.  Queue Injection: When a client returns an acknowledgment frame, the Axum thread pipes the status payload straight into a high-speed Redis Queue using atomic LPUSH routines.
2.  Batch Write Worker: An independent background thread polls the Redis Queue asynchronously. It fetches records in bulk chunks and executes highly optimized SQL batch updates against the primary database table.

### 7.2. High-Efficiency Voice Messages (Audio Framework)
*   Audio Compacting: Audio feeds are recorded natively via the client browser MediaRecorder API, compressed using the lightweight Opus codec, and transmitted inside a .webm/.ogg wrapper.
*   Local Disk Allocation: File uploads hit a dedicated HTTP POST endpoint that saves data directly onto the server's local storage array, utilizing a controlled 20 GB quota for near-zero infrastructure overhead during MVP launch.
*   Database Mapping: The local path string is tracked inside the persistent database under the target message row metadata.

---

## 8. MVP Constraints & Infrastructure Scope

*   Deployment Pipeline: Next.js Responsive Web Engine (Fully PWA-ready for responsive mobile execution, completely bypassing app store delays).
*   Hardware Mapping: The entire stack (Next.js server, Rust binary, Redis cluster node, database engine) is provisioned to execute inside a single, scalable, cost-effective Linux VPS instance.