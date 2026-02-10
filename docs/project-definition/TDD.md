# 🛠️ Technical Design Document: **FlexFlow**

**Version:** 2.0.0
**Status:** `DRAFT`
**Architecture:** Frontend-centric, Firebase-powered SPA
**Date:** 2026-02-09

---

## 1. System Overview

**FlexFlow** is a high-performance, mobile-first web application for strength training and recovery. All business logic and data access are handled in the frontend React app, leveraging Firebase Authentication and Firestore for secure, scalable, serverless data management. No custom backend or server functions are used; all access is controlled via Firestore security rules and Firebase Auth.

### 1.1 High-Level Architecture

- **Client:** React (Vite) Single Page Application (SPA)
- **Database:** Firestore (NoSQL, serverless, real-time)
- **Auth:** Firebase Authentication (Google, Apple, Email/Password, etc.)
- **Security:** Firestore Security Rules
- **Shared:** UI components and TypeScript types

---

## 2. Technology Stack

| Category            | Technology         | Purpose                                                    |
| :------------------ | :----------------- | :--------------------------------------------------------- |
| **Monorepo**        | **Turborepo**      | Orchestrates builds and tasks across packages.             |
| **Package Manager** | **pnpm**           | Efficient dependency management (workspace protocol).      |
| **Frontend**        | **React + Vite**   | High-performance SPA with fast HMR.                        |
| **Language**        | **TypeScript**     | Strict type safety across the entire stack.                |
| **Styling**         | **Tailwind CSS**   | Utility-first styling.                                     |
| **UI Library**      | **Shadcn UI**      | Accessible, copy-paste component primitives.               |
| **Database**        | **Firestore**      | Serverless, scalable, real-time NoSQL database.            |
| **Auth**            | **Firebase Auth**  | Secure, scalable authentication.                           |
| **Validation**      | **Zod**            | Runtime schema validation for forms.                       |
| **State/Async**     | **TanStack Query** | Client-side state management, caching, optimistic updates. |
| **Testing**         | **Vitest**         | Unit and integration testing.                              |

---

## 3. Monorepo Structure (Workspace Layout)

```text
flexflow/
├── apps/
│   └── web/                 # React + Vite application (all logic here)
├── packages/
│   ├── ui/                  # Shared Shadcn UI components + Tailwind config
│   └── config/              # Shared TSConfig, Eslint, Prettier settings
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```
