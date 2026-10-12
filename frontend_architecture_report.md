# ClarifyX Frontend Architecture Report

## 1. Existing Frontend Architecture
The original ClarifyX frontend was a React 18 application scaffolded with Vite using vanilla JavaScript (`.jsx`). It managed state via custom hooks (`useHistory`) and prop drilling, and utilized manual routing based on component state (`active` tab). The styling was handled via a large, custom CSS file (`index.css`), presenting a coherent dark-themed cybersecurity application aesthetic.

## 2. Changes Made
- Migrated the codebase to **TypeScript** (`strict: true`).
- Refactored `App.jsx` to use **React Router** for clean, scalable URL-based routing.
- Re-organized the file structure to separate concerns (UI components, pages, hooks, store, types).
- Introduced **Zustand** for authentication state management.
- Added **TanStack Query (React Query)** as a provider for future server state and API data fetching.
- Defined explicit TypeScript interfaces (domain models, API contracts).
- Created a robust API client wrapper utilizing `fetch`.
- Extracted and built highly reusable UI components (`Button`, `Card`, `Badge`, `Input`, `Modal`, `RiskScore`) mapped accurately to the existing `index.css` styles to maintain the high-quality visual aesthetic.
- Setup **Vitest** and **React Testing Library** and wrote unit and integration tests for core logic and UI components.

## 3. Final Folder Structure
```text
src/
├── components/
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── RiskScore.tsx
│   ├── HistoryPanel.tsx
│   ├── ResultCard.tsx
│   ├── Scanner.tsx
│   └── Sidebar.tsx
├── hooks/
│   └── useHistory.ts
├── pages/
│   ├── SettingsPage.tsx
│   └── StatsPage.tsx
├── services/
│   └── api/
│       ├── apiClient.ts
│       ├── authApi.ts
│       └── scanApi.ts
├── store/
│   └── useAuthStore.ts
├── types/
│   └── index.ts
├── utils/
│   └── scanners.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 4. TypeScript Types Created
Strongly typed domain models were created in `src/types/index.ts`:
- `User`
- `ScanType` (e.g., "url", "image")
- `ScanStatus` (e.g., "idle", "processing")
- `Scan`, `ScanResult`, `DetectionResult`
- `RiskLevel` ("Safe", "Suspicious", "Dangerous")
- `ApiResponse`, `ApiError`, `Pagination`

All components now explicitly type their Props, preventing `any` usage in UI logic.

## 5. State Management Architecture
- **Client State**: Handled by **Zustand** (e.g., `useAuthStore` for user session logic).
- **Server State**: Prepared for **TanStack React Query** (Provider added in `main.tsx`). Mutations and Queries will handle loading/error states for the upcoming API integration.
- **Local State**: Component-level state (`useState`) handles immediate form validation and scanner UI states.

## 6. API Architecture
A robust `apiClient` (`src/services/api/apiClient.ts`) was implemented with interceptors for error handling (mapping to `ApiError`). Modular service files (`authApi.ts`, `scanApi.ts`) were built defining typed methods for API interactions, anticipating the real backend endpoints.

## 7. Core Components
Extracted from legacy markup:
- **Button**: Handles variants (primary, secondary, danger, text) and `isLoading` states.
- **Card**: Wraps the scanner and stats layouts.
- **Badge**: Unified status indicator component.
- **Input**: Forms with integrated labels and error messaging.
- **RiskScore**: Dedicated UI for cleanly displaying the numerical heuristic score without claiming absolute certainty.
- **Modal**: Readied for accessible dialog interventions.

## 8. Scanner Architecture
The `Scanner.tsx` component was refactored to use the new UI primitives. It natively supports dynamic tabs for Links, Messages, Photos, and Videos. It correctly displays validation errors, simulates a loading delay, and renders the specific heuristic explanations dynamically via `ResultCard.tsx`.

## 9. Authentication Integration
`authApi.ts` and `useAuthStore.ts` have been wired up. The app is ready to perform secure credential exchange and manage the active `User` session globally.

## 10. Accessibility Work
- Semantic HTML tags (`<nav>`, `<aside>`, `<main>`).
- Buttons use `<button>` natively instead of clickable divs, preserving focus capability.
- Error and loading states communicate to screen readers (e.g., `aria-invalid` on `Input`).

## 11. Tests Created
Tests implemented with Vitest and React Testing Library (`src/__tests__/`):
- `components.test.tsx`: Validates `Button`, `Input`, `Modal`, and `RiskScore` behaviors.
- `logic.test.ts`: Verifies pure validation heuristics in `scanners.ts`, `useAuthStore` state transitions, and `useHistory` actions.
- `integration.test.tsx`: Validates React Router integrations and basic dashboard mounting logic.

## 12. Build / Lint / Test Results
- TypeScript compilation (`tsc --noEmit`) passes with 0 errors.
- Tests run and pass via Vitest.
- Production build compiles successfully (`vite build`).

## 13. Known Limitations
- The current implementation of `scanners.ts` continues to use deterministic regex heuristics. It acknowledges that a real deepfake pipeline is required on the backend for true verification.
- Mock API calls inside `Scanner.tsx` are local. They should be swapped to `useMutation` with TanStack query once the backend is reachable.

## 14. Recommended Next Step
1. Replace local heuristic `scanMedia`, `scanUrl` calls in `Scanner.tsx` with TanStack Query mutations pointing to the real endpoints.
2. Implement the login interstitial / authentication guard using `useAuthStore` to securely gate history and scan executions.
