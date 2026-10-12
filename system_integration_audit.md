# ClarifyX System Integration Audit

## A. Frontend Architecture
- React 18, Vite, TypeScript.
- State: Zustand (`useAuthStore`), TanStack Query.
- Styling: Plain CSS (`index.css`) matching the original design.
- Components: Reusable UI components (`Button`, `Input`, `Card`, `Badge`, `Modal`, `RiskScore`) replacing raw HTML from original prototype.
- Scanners: Managed in `Scanner.tsx`, supporting URL, Message, Image, Video, Voice. Fake heuristics previously handled locally.

## B. Backend Architecture
- Express, TypeScript, Sequelize (PostgreSQL).
- Scan services abstracted: `ScanOrchestrator`, `RiskEngine`, `JobQueue` (in-memory for now), `StorageProvider` (local).
- Basic security: Helmet, express-rate-limit.
- Modularized: Separated models, controllers, services, middleware, and utils.

## C. API Endpoints
Currently implemented in Backend:
- `GET /api/health`
- `POST /api/scans/` (Sync scans: URL, MESSAGE, FAKE_NEWS)
- `POST /api/scans/media` (Async scans: IMAGE, VIDEO, VOICE)
- `GET /api/scans/`
- `GET /api/scans/:id`
- `DELETE /api/scans/:id`
- **MISSING**: Authentication endpoints (`/api/auth/register`, `/login`, `/me`, `/logout`) are entirely missing.

## D. Database Models
- `User`: id (UUID), email, timestamps. (Missing password hashes, sessions, names).
- `Scan`: id (UUID), userId, scanType, status, riskScore, verdict, timestamps.
- `Result`: id (UUID), scanId, data (JSONB), metadata (JSONB).
- Relationships are set (User hasMany Scans, Scan hasOne Result).

## E. Authentication Flow
- **Frontend**: `useAuthStore` manages state natively. `authApi.ts` uses local promises (fakes).
- **Backend**: No auth routes or middleware exist. Controller mocks `userId = null`.
- **Verdict**: Fully disconnected. Needs backend implementation (JWT/cookie).

## F. Scanner Flow
- **Frontend**: Currently executes local functions in `utils/scanners.ts`. Does not call backend.
- **Backend**: Ready to process using Orchestrator. `UrlScanner` and `MessageScanner` are heuristic; others are `DEMO_MODE`.
- **Verdict**: Completely disconnected. Frontend must be refactored to call `scanApi.ts` endpoints instead of local utils.

## G. File Upload Flow
- **Frontend**: No multipart/form-data logic currently wired to the API in `Scanner.tsx`.
- **Backend**: Ready via Multer and `StorageProvider`. 
- **Verdict**: Needs frontend implementation of `FormData` handling.

## H. Error Handling
- **Frontend**: Error Boundaries missing. UI components support error strings (e.g., `Input`).
- **Backend**: Generic `errorHandler.ts` exists.
- **Verdict**: Needs standardized Error response mapping on the frontend `apiClient.ts`.

## I. Environment Variables
- Handled properly via `.env.example` placeholders on both ends.

## J. Known Bugs
- Frontend `Scanner.tsx` calls local fake logic.
- Authentication state is completely mocked in frontend.
- `userId` is `null` in backend creations.
- Test suites integration fail when PostgreSQL is not running.

## K. Missing Integrations
- Backend `auth.routes.ts` & Auth Controllers.
- Password hashing (bcrypt) and JWT/Session generation.
- Connecting frontend `scanApi.ts` to backend routes instead of local heuristic files.

## L. Dead/Unused Code
- `src/utils/scanners.ts` on frontend is about to become dead code once integrated.
- `src/hooks/useHistory.ts` using local storage should be killed.

## M. Mock/Demo Implementations
- Backend Voice, Video, Image, and Fake News scanners explicitly return `DEMO_MODE`. 
- Frontend `authApi.ts` is fully mocked.

## N. Security Concerns
- Backend controllers currently bypass `req.user` since auth isn't integrated.
- Frontend must not send credentials improperly.

## O. Type Mismatches
- Frontend models might differ slightly from the backend `RiskResult` structure. Needs normalization layer.

## P. API Contract Mismatches
- Backend returns `{ success: true, data: { ... } }`. Frontend might expect raw data.
