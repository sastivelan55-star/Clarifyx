# ClarifyX Backend Architecture Report (Phase 4)

## 1. Final Backend Architecture
The backend was significantly fortified, adopting a modular service-oriented architecture. Controllers were stripped of heavy logic, delegating to specialized services. We introduced robust abstractions for file storage, asynchronous job queues, detection providers, and risk calculation.

## 2. Scan Lifecycle
- **Sync Scans (URL, Message, Fake News)**: PENDING -> PROCESSING -> COMPLETED (or FAILED). Analyzed inline and returned synchronously.
- **Async Scans (Image, Video, Voice)**: PENDING -> QUEUED. Handled via the JobQueue abstraction and executed asynchronously to prevent blocking the API. Polling `GET /api/scans/:id` resolves status.

## 3. API Endpoints
- `POST /api/scans/` — Sync scan submission.
- `POST /api/scans/media` — Async media file uploads.
- `GET /api/scans/` — Retrieve scan history.
- `GET /api/scans/:id` — Polling & retrieval.
- `DELETE /api/scans/:id` — Cleanup.

## 4. Scanner Services & 5. Detector Providers
- **ScanOrchestrator**: Central nervous system directing traffic to the right scanner.
- **MessageScanner**: Abstracts logic into `MessageDetectionProvider`. Uses local `HeuristicMessageProvider` pattern but allows future LLM injection.
- **UrlScanner**: Heuristic regex/logic scanner enforcing SSRF safety by not blindly visiting URLs.
- **MediaScanners (Image, Video, Voice, Fake News)**: Safely compartmentalized, currently restricted to `DEMO_MODE` or `NOT_IMPLEMENTED`.

## 6. Risk Engine
A dedicated `RiskEngine` class takes unified `DetectionSignal` objects and impacts a configurable base score. It ensures standard risk levels (`SAFE`, `SUSPICIOUS`, `DANGEROUS`) and caps scoring logic out of 100 globally, removing arbitrary scoring from individual scanners.

## 7. File Security
`FileValidationService` explicitly validates `mimeType`, `size`, and ensures the file extension is safe. Uploads are strictly controlled and constrained via Multer middleware.

## 8. Storage Architecture
Implemented the `IStorageProvider` interface. The `LocalStorageProvider` writes to isolated `temp_uploads` directories, securing files off the public web root. Ready to swap to S3 in production.

## 9. Async Processing Architecture
`JobQueue` abstraction implemented. It utilizes an event-driven `setImmediate` local execution for now, structured specifically so it can be cleanly swapped to `BullMQ` + `Redis` when deployed to production.

## 10. Rate Limiting
Configured `express-rate-limit`:
- `generalLimiter`: 100 reqs/15m.
- `scanLimiter`: 30 reqs/15m.
- `uploadLimiter`: 10 reqs/15m.

## 11. Security Controls
- **Helmet**: `securityHeaders` injected for basic protection (CSP, X-Content-Type-Options).
- File size strict caps enforced before reading bodies.
- CORS restricted via ENV `FRONTEND_ORIGIN`.

## 12. Database Changes
No destructive database changes were made. The existing `Scan` and `Result` Sequelize tables seamlessly ingest the unified `RiskResult` formats emitted by the new `RiskEngine`.

## 13. Tests Performed
- **riskEngine.test.ts**: Logic verification for bounding scores and applying thresholds.
- **fileValidation.test.ts**: Size, MIME, and extension manipulation tests.
- **scanners.test.ts**: Logic for heuristics in `UrlScanner` and `MessageScanner`.

## 14. Tests Not Run
- Database integration tests requiring active PostgreSQL connection (skipped natively to avoid environmental failure).

## 15. Detector Availability (Production Reality Check)
- **URL**: HEURISTIC
- **MESSAGE**: HEURISTIC
- **IMAGE**: DEMO_MODE (External Service needed)
- **VIDEO**: DEMO_MODE (External Service needed)
- **FAKE NEWS**: NOT IMPLEMENTED (External Service needed)
- **VOICE**: DEMO_MODE (External Service needed)

## 16. Known Limitations
We do not possess a real deepfake ML model natively. Media scans explicitly report `DEMO_MODE` or `NOT_IMPLEMENTED`. We do not falsely claim to provide AI generation results.

## 17. Files Changed
- Updated `app.ts`, `scan.controller.ts`, `scan.routes.ts`.
- Created `services/scanning/` directory, `RiskEngine`, `StorageProvider`, `JobQueue`, `fileSecurity`, `rateLimit`, and `securityHeaders`.

## 18. Recommended Next Phase
Deploy the backend on a staging environment and configure the initial LLM connection (OpenAI / Anthropic) into a new `ExternalAIMessageProvider` for authentic message context analysis.
