# 🛠️ Technical Design Document: **FlexFlow**

**Version:** 1.0.0
**Status:** `DRAFT`
**Architecture:** Monorepo (Turborepo)
**Date:** 2026-02-09

---

## 1. System Overview

**FlexFlow** is a high-performance, mobile-first web application for strength training and recovery. The system is architected as a **monorepo** to share types and logic between the frontend and backend, maximizing the benefits of **tRPC** and **TypeScript**.

### 1.1 High-Level Architecture

The system follows a client-server architecture where the client communicates directly with the server via tRPC procedures.

- **Client:** React (Vite) Single Page Application (SPA).
- **Server:** Node.js backend exposing tRPC router.
- **Shared:** Common UI components and Zod schemas.

[Image of Turborepo monorepo architecture diagram]

---

## 2. Technology Stack

| Category            | Technology         | Purpose                                                   |
| :------------------ | :----------------- | :-------------------------------------------------------- |
| **Monorepo**        | **Turborepo**      | Orchestrates builds and tasks across packages.            |
| **Package Manager** | **pnpm**           | Efficient dependency management (workspace protocol).     |
| **Frontend**        | **React + Vite**   | High-performance SPA with fast HMR.                       |
| **Language**        | **TypeScript**     | Strict type safety across the entire stack.               |
| **Styling**         | **Tailwind CSS**   | Utility-first styling.                                    |
| **UI Library**      | **Shadcn UI**      | Accessible, copy-paste component primitives.              |
| **API Layer**       | **tRPC**           | End-to-end typesafe APIs without schemas.                 |
| **Validation**      | **Zod**            | Runtime schema validation for inputs/env vars.            |
| **State/Async**     | **TanStack Query** | Server state management, caching, and optimistic updates. |
| **Testing**         | **Vitest**         | Unit and integration testing.                             |

---

## 3. Monorepo Structure (Workspace Layout)

We will use a standard Turborepo structure to isolate concerns while allowing code sharing.

```text
flexflow/
├── apps/
│   ├── web/                 # React + Vite application (The Client)
│   └── api/                 # Node.js server (tRPC Router + Context)
├── packages/
│   ├── ui/                  # Shared Shadcn UI components + Tailwind config
│   ├── db/                  # Prisma schema and client instantiation
│   ├── api-client/          # Shared tRPC client types (AppRouter)
│   └── config/              # Shared TSConfig, Eslint, Prettier settings
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```
