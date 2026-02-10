# 📋 Product Design Document: **FlexFlow**

**Version:** 2.0.0  
**Status:** `DRAFT`  
**Stack:** TypeScript, React, Vite, Firestore, Firebase Auth

---

## 1. Executive Summary

**FlexFlow** is a mobile-first web application designed to bridge the gap between heavy lifting and recovery. All business logic and data access are handled in the frontend React app, leveraging Firebase Authentication and Firestore for secure, scalable, serverless data management. No custom backend or server functions are used; all access is controlled via Firestore security rules and Firebase Auth.

---

## 2. Problem Statement

Current fitness applications suffer from:

- **Friction:** Manual logging takes too much time during a workout.
- **Silod Data:** Workout logs are disconnected from recovery data (sleep/HRV).
- **Information Overload:** Users have data but don't know _how_ to adjust their training based on it.

---

## 3. Core Feature Specifications (MVP)

### 🏋️ The "Smart" Logger

- **Reactive UI:** Logging system that saves data per-set (debounced) to prevent data loss, directly to Firestore.
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

| Layer        | Technology     | Reason                                          |
| :----------- | :------------- | :---------------------------------------------- |
| **Frontend** | React (Vite)   | SPA, fast HMR, all logic in frontend.           |
| **Database** | Firestore      | Serverless, scalable, real-time NoSQL database. |
| **Auth**     | Firebase Auth  | Secure integration with Google/Apple/Email.     |
| **State**    | TanStack Query | Superior caching for "offline-first" logging.   |

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
- **Sync Speed:** Data write to Firestore under **100ms**.

---

## 7. Future Roadmap

- [ ] **V1.1:** Direct bi-directional sync with Garmin and Oura.
- [ ] **V1.2:** Computer Vision for squat depth and form analysis.
- [ ] **V2.0:** Marketplace for professional coaches to sell premium programs.
