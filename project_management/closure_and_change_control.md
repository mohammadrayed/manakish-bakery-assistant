# Project Closure & Change Control Report: Manakish Bakery AI Agent System

**Document Reference:** PCR-241-01-SS  
**Date:** May 28, 2026  
**Status:** Approved & Accepted  

---

## Key Project Summary

| Attribute | Value |
| :--- | :--- |
| **Project Name** | Manakish Bakery AI Agent System |
| **Fixed Price Contract** | **$29,000.00** |
| **Lead Engineers** | Asmaa Hajj Chehade & Mohammad Rayed |
| **Academic Supervisor** | Dr. Mohamad Aoude (ULFG) |
| **Baseline Cost (PV)** | $7,040.00 (384 Planned Hours) |
| **Actual Cost Incurred (AC)** | $7,454.00 (408 Realized Hours) |
| **Cost Overrun Variance** | -$414.00 (+5.88% / CPI 0.94) |
| **Realized Gross Profit** | **$21,546.00 (74.3% Profitability)** |

---

## 1. Change Control Management Log

| CR ID | Title | Technical Rationale & Root Cause | Hours Impact | Cost Impact |
| :--- | :--- | :--- | :--- | :--- |
| **CR-01** | Atomic File Store Mutex Locks | Concurrent order race condition hazards in `data/orders.json`. Implemented synchronous mutex queues and temp swaps. | +10 h (M. Rayed) | $180.00 |
| **CR-02** | Gemini Tool Schema Bounds | Loose AI model parameters in multi-turn dialogues. Applied strict JSON schema validation and system prompt rules. | +8 h (M. Rayed) | $144.00 |
| **CR-03** | Alpine Docker Permissions | Cloud Run non-root `node` user (UID 1000) volume mount write error on `/app/data`. Resolved in Docker build script. | +6 h (A. Chehade) | $90.00 |
| **Total Variance** | | **3 Technical Scope Adjustments** | **+24 h Technical OT** | **+$414.00 (Covered by Reserve)** |

---

## 2. Deliverable Acceptance Matrix

| WBS | Deliverable Description | Owner | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1.1** | Project Charter & Specs | Mohammad Rayed | Doc Review | **Accepted** |
| **2.1** | Express Data Schemas & Routes | Mohammad Rayed | API Integration Tests | **Accepted** |
| **2.2** | React UI & Telemetry View | Asmaa Hajj Chehade | UI Walkthrough | **Accepted** |
| **2.3** | Atomic Persistence Store | Mohammad Rayed | Load & Concurrency Test | **Accepted** |
| **2.4** | Gemini AI Agent Integration | Mohammad Rayed | Multi-turn Dialog Testing | **Accepted** |
| **3.1** | QA Test Matrix & Linter Pass | Asmaa Hajj Chehade | Automated Build / Lint | **Accepted** |
| **4.1** | Dockerization & Cloud Run | Asmaa Hajj Chehade | Container Health Audit | **Accepted** |
| **4.2** | PM Documentation Package | Asmaa & Mohammad | Formal Governance Review | **Accepted** |

---

## 3. Formal Sign-Off

* **Mohammad Rayed** – Tools & AI Logic Lead Engineer (Date: May 28, 2026)
* **Asmaa Hajj Chehade** – UI Platform & Infrastructure Lead Engineer (Date: May 28, 2026)
* **Manakish Bakery Operations** – Client Product Owner (Date: May 28, 2026)
* **Dr. Mohamad Aoude** – Academic Director & Governance Supervisor (Date: May 28, 2026)
