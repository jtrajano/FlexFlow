# 🚀 Agile Project Breakdown: **FlexFlow**

**Project Goal:** Build a high-performance strength & recovery intelligence application.
**Methodology:** Agile / Scrum
**Cadence:** 2-Week Sprints

---

## 1. Hierarchy Overview

The project is divided into **Epics** (High-level themes) and **User Stories** (Shippable units of value).

---

## 2. The Epics (High-Level Roadmap)

| ID       | Epic Name                  | Description                                               | Priority    |
| :------- | :------------------------- | :-------------------------------------------------------- | :---------- |
| **E-01** | **Foundation & Identity**  | Monorepo setup, Database schema, Auth, and CI/CD.         | 🔴 Critical |
| **E-02** | **The Workout Engine**     | The core logging interface, exercise database, and timer. | 🔴 Critical |
| **E-03** | **Readiness Intelligence** | The algorithm, wearable integration, and manual survey.   | 🟡 High     |
| **E-04** | **Progress Analytics**     | Visualizing volume, PRs, and history.                     | 🟢 Medium   |
| **E-05** | **Social & Settings**      | User profiles, settings, and basic sharing.               | 🔵 Low      |

---

## 3. Detailed User Stories

### 🏗️ Epic 01: Foundation & Identity

#### **US-1.1: Monorepo & Stack Initialization**

> **As a** Developer,
> **I want** to initialize a Turborepo with Next.js (Web), tRPC (API), and Prisma (DB),
> **So that** I have a typesafe development environment to build features upon.

- **Acceptance Criteria:**
  - [ ] `pnpm build` passes for all workspaces.
  - [ ] tRPC router responds to a "hello world" query.
  - [ ] ESLint and Prettier are configured.

#### **US-1.2: User Authentication**

> **As a** User,
> **I want** to sign up using Google or Apple via NextAuth.js,
> **So that** my workout data is securely saved and accessible across devices.

- **Acceptance Criteria:**
  - [ ] User can log in via OAuth provider.
  - [ ] Session persists on page refresh.
  - [ ] User record is created in Firestore `User` table.

#### **US-1.3: Database Schema Design**

> **As a** Developer,
> **I want** to define the Prisma schema for `User`, `Workout`, `Exercise`, and `Set`,
> **So that** we can store complex relational data efficiently.

- **Acceptance Criteria:**
  - [ ] Schema migration runs successfully.
  - [ ] Relations (e.g., One User -> Many Workouts) work as expected.

---

### 🏋️ Epic 02: The Workout Engine

#### **US-2.1: Exercise Library & Search**

> **As a** User,
> **I want** to search for exercises (e.g., "Bench Press") from a pre-loaded list,
> **So that** I can add them to my current workout routine.

- **Acceptance Criteria:**
  - [ ] Search bar filters list instantly (client-side).
  - [ ] "Add" button places exercise into the active workout state.

#### **US-2.2: Real-Time Set Logging**

> **As a** User,
> **I want** to input weight, reps, and RPE for a set and mark it as "Complete",
> **So that** I can track my volume during the session.

- **Acceptance Criteria:**
  - [ ] Input fields validate numbers (Zod).
  - [ ] "Save" triggers an optimistic UI update.
  - [ ] Data persists to DB via tRPC mutation.

#### **US-2.3: The Rest Timer**

> **As a** User,
> **I want** a timer to automatically start when I finish a set,
> **So that** I maintain consistent rest periods between lifts.

- **Acceptance Criteria:**
  - [ ] Timer overlay appears on "Set Complete".
  - [ ] Timer persists if I navigate to a different tab/exercise.

#### **US-2.4: Offline Logging Support**

> **As a** User in a basement gym,
> **I want** to log sets without an internet connection,
> **So that** I don't lose data when the Wi-Fi drops.

- **Acceptance Criteria:**
  - [ ] TanStack Query configured with `persistQueryClient`.
  - [ ] Mutations queue up and retry when connection returns.

---

### 🧠 Epic 03: Readiness Intelligence

#### **US-3.1: The "No-Wearable" Survey (Fallback)**

> **As a** User without a smart watch,
> **I want** to answer a quick 3-question survey (Sleep, Soreness, Mood) before I train,
> **So that** the app can calculate my readiness score manually.

- **Acceptance Criteria:**
  - [ ] Survey modal appears if no wearable data is found.
  - [ ] Score (0-100) is generated from answers.

#### **US-3.2: Wearable Data Ingestion**

> **As a** User with an Apple Watch/Oura,
> **I want** my sleep and HRV data to sync automatically,
> **So that** I don't have to manually enter data.

- **Acceptance Criteria:**
  - [ ] Backend service successfully pulls/receives webhooks.
  - [ ] Data is normalized into `ReadinessScore`.

#### **US-3.3: The "Pre-Workout" Advice Card**

> **As a** User,
> **I want** to see a specific recommendation (e.g., "Reduce volume by 10%") based on my score,
> **So that** I can adjust my workout intensity intelligently.

- **Acceptance Criteria:**
  - [ ] Logic exists to map Score Ranges -> Advice Strings.
  - [ ] Advice is displayed prominently on the dashboard.

---

### 📈 Epic 04: Progress Analytics

#### **US-4.1: Personal Record (PR) Celebration**

> **As a** User,
> **I want** to be notified immediately if a set I just logged is a new 1-Rep Max or Volume PR,
> **So that** I feel a sense of accomplishment.

- **Acceptance Criteria:**
  - [ ] Confetti animation on log.
  - [ ] "New PR" badge appears next to the set.

#### **US-4.2: Volume History Chart**

> **As a** User,
> **I want** to see a graph of my total tonnage lifted over the last 4 weeks,
> **So that** I can ensure I am applying Progressive Overload.

- **Acceptance Criteria:**
  - [ ] Recharts/Visx graph showing volume trend.
  - [ ] Toggle between "Weekly" and "Monthly" views.

---

### ⚙️ Epic 05: Social & Settings

#### **US-5.1: Profile Configuration**

> **As a** User,
> **I want** to set my preferred units (kg/lbs) and training goal (Strength/Hypertrophy),
> **So that** the app interface matches my mental model.

- **Acceptance Criteria:**
  - [ ] Toggle switch changes all displayed weights.
  - [ ] Settings persist in DB.

#### **US-5.2: Workout Summary Share**

> **As a** User,
> **I want** to generate a shareable image of my workout summary,
> **So that** I can post it to Instagram or send it to a friend.

- **Acceptance Criteria:**
  - [ ] "Share" button generates a clean image card with Stats + Branding.

---

## 🏃‍♂️ Suggested Sprint 1 (The "Walking Skeleton")

**Goal:** Establish a working end-to-end prototype where a user can log in and save a single number to the database.

1.  **US-1.1:** Repo Setup
2.  **US-1.2:** Auth (NextAuth)
3.  **US-1.3:** DB Schema (Prisma)
4.  **US-2.2:** Real-Time Set Logging (Basic version, no offline support yet)
