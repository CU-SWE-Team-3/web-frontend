# SoundCloud Clone (web-frontend)

## 1. Frontend Architecture & Documentation

The application follows a modular, feature-centric architecture heavily inspired by **Feature-Sliced Design (FSD)**. This ensures separation of concerns, high maintainability, and scalability for a team-based environment. 

The application is built on:
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, SCSS Modules, and CSS Variables
- **UI Components:** Customized `shadcn/ui` and a bespoke Shared UI library
- **Data Fetching:** TanStack Query (React Query) v5 + Axios

## 1.2 Design Patterns
We employ several core design patterns to keep the codebase clean:

- **Feature-Sliced Architecture:** Code is co-located by business domain (`src/features/...`) rather than technical role (e.g., separating all components, all hooks, all api calls globally). 
- **Repository Pattern:** API calls are abstracted into repository objects (e.g., `blockRepository`), decoupling the UI and custom hooks from the direct HTTP client implementation.
- **Custom Hooks Pattern:** All React Query logic and data fetching orchestration are encapsulated in domain-specific hooks (e.g., `useBlockedUsers`, `useUnblockUser`) to keep React components pure and focused on presentation.
- **Atomic UI Design:** Universal, reusable UI elements are strictly maintained in `src/shared/ui` to guarantee a consistent design system (SoundCloud dark theme).
- **Barrel Exports:** Features and shared modules use `index.ts` files to cleanly expose public APIs and encapsulate internal logic.

## 1.3 State Management Strategy
State is categorized and managed based on its lifecycle and scope:

- **Server State (TanStack Query):** Manages asynchronous operations, caching, background updates, and optimistic UI mutations. This is the primary source of truth for remote data (e.g., fetching tracks, user profiles, blocked lists).
- **Global UI State (Context API / Zustand):** Used sparingly for application-wide transient state, such as active audio player status, themes, or global modals.
- **Local Form/UI State (React `useState` / `useReducer`):** Kept as close to the relevant component as possible for controlled inputs, dropdown toggles, and local interactions.
- **URL State (Next.js routing):** Query parameters and routes are used to manage shareable state like search queries or active active tabs.

## 3.1 App Base Setup
The application is strictly configured to use the Next.js App Router paradigm:

- **`src/app/layout.tsx`:** The root layout containing global standard UI (e.g., standard dark header, navigation links, search bar, promotional banners) and the `Providers` wrapper.
- **`src/app/providers.tsx`:** Consolidates all application context providers, primarily setting up the `QueryClientProvider` for TanStack Query config.
- **Global Styles:** Controlled primarily via `src/app/globals.scss`, which imports Tailwind CSS, followed by global design token CSS variables mapped from `src/shared/ui/tokens/globals.scss`.

## 4. Code Style & Standards
To ensure a consistent codebase across all contributors, the following standards are enforced:

- **Strict TypeScript:** All components, props, and API responses must have well-defined interfaces/types (e.g., `BlockedUser`). `any` is strictly prohibited.
- **Shared UI Mandate:** Developers must *never* build raw HTML UI elements (buttons, inputs, avatars) from scratch in feature folders. Always import from `@/shared/ui`.
- **CSS Variable Tokens:** Hardcoded hex colors (e.g., `#ff5500`) are banned. All styling must use semantic CSS variables defined in the design system (e.g., `var(--sc-primary)`).
- **Icons:** All icons must be imported from the central `@/shared/ui/icons` barrel, utilizing `lucide-react`. No direct external icon library imports or emojis.
- **Colocation:** Tests, interfaces, and specific components should live alongside the feature they support.

## 5. Project Folder Structure
```text
src/
├── app/                  # Next.js App configuration (routing, global styles, providers)
│   ├── layout.tsx        # Root layout and Header
│   ├── page.tsx          # Root entry point
│   ├── globals.scss      # Global core Tailwind and base styles
│   └── settings/         # App routes (e.g., /settings/blocked)
│
├── features/             # Business logic modules (Feature-Sliced Design)
│   └── social-graph/     # Example feature area
│       ├── api/          # Repository patterns and HTTP requests
│       ├── model/        # Types, interfaces, and React Query custom hooks
│       ├── ui/           # Feature-specific composite React components
│       └── index.ts      # Public API for the feature module
│
├── shared/               # Reusable project-wide utilities and configuration
│   ├── api/              # Axios client instances and interceptors
│   └── ui/               # The central Component Design System
│       ├── AppButton/    # Standardized components with SCSS modules
│       ├── UserAvatar/
│       ├── icons/        # Centralized Lucide icon aliases
│       ├── tokens/       # Global CSS variable mapping (globals.scss)
│       └── index.ts      # UI barrel export
```
