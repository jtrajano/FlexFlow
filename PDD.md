# 📋 Product Design Document: **FlexFlow**

**Version:** 1.0.0  
**Status:** `DRAFT`  
**Stack:** TypeScript, Next.js, tRPC, Firestore

---

## 1. Executive Summary

**FlexFlow** is a mobile-first web application designed to bridge the gap between heavy lifting and recovery. Unlike generic trackers, FlexFlow uses **AI-driven readiness scores** to suggest whether a user should push for a Personal Record (PR) or take a deload day.

---

## 2. Problem Statement

Current fitness applications suffer from:

- **Friction:** Manual logging takes too much time during a workout.
- **Silod Data:** Workout logs are disconnected from recovery data (sleep/HRV).
- **Information Overload:** Users have data but don't know _how_ to adjust their training based on it.

---

## 3. Core Feature Specifications (MVP)

### 🏋️ The "Smart" Logger

- **Reactive UI:** A tRPC-powered logging system that saves data per-set (debounced) to prevent data loss.
- **Rest Timer:** Automatic countdowns between sets with haptic feedback/notifications.
- **Exercise Library:** A searchable database of 200+ movements with video demonstrations.

### 🔋 Recovery Dashboard

- **Readiness Score:** A daily 1–100 score calculated via wearable integration (Apple Health/Google Fit).
- **The "Nudge":** AI suggestions at the start of a workout.
  > _Example: "Your sleep was low; we've reduced your squat targets by 10% today."_

### 👥 Social "Squads"

- **Private Circles:** Small groups (max 10) to view weekly volume and consistency.
- **Shared Templates:** Ability to clone a friend's workout routine with one click.

---

## 4. Technical Architecture

| Layer         | Technology         | Reason                                                 |
| :------------ | :----------------- | :----------------------------------------------------- |
| **Frontend**  | React (Next.js)    | SEO for public exercise pages + fast hydration.        |
| **API Layer** | **tRPC**           | End-to-end typesafety for complex workout schemas.     |
| **Database**  | Firestore + Prisma | Relational data is vital for tracking Set/Rep history. |
| **Auth**      | NextAuth.js        | Secure integration with Google/Apple/Passkeys.         |
| **State**     | TanStack Query     | Superior caching for "offline-first" logging.          |

---

## 5. User Journey

1. **Onboarding:** User connects wearable data and selects a training focus.
2. **Pre-Workout:** User views their **Readiness Score** on the home dashboard.
3. **Active Workout:** User logs sets; app provides **Previous Lift** data for progressive overload.
4. **Post-Workout:** A summary card highlights PRs (Personal Records) and total volume.

---

## 6. Success Metrics (KPIs)

- **Retention:** Target **40%** Week-4 retention.
- **Consistency:** Average of **3.2** workouts logged per user/week.
- **Sync Speed:** API response time for logging a set under **100ms**.

---

## 7. Future Roadmap

- [ ] **V1.1:** Direct bi-directional sync with Garmin and Oura.
- [ ] **V1.2:** Computer Vision for squat depth and form analysis.
- [ ] **V2.0:** Marketplace for professional coaches to sell premium programs.
