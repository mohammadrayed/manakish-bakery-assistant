# Project Charter: Manakish Bakery AI Agent System

**Document Reference:** CHARTER-241-01-SS  
**Date:** May 01, 2026  
**Status:** Approved & Finalized  

---

## Key Project Metadata

| Attribute | Value |
| :--- | :--- |
| **Project Name** | Manakish Bakery AI Agent System |
| **Contract Value** | **$29,000.00 Fixed Price** |
| **Lead Engineers** | Asmaa Hajj Chehade & Mohammad Rayed |
| **Academic Director** | Dr. Mohamad Aoude (ULFG) |
| **Execution Window** | May 01, 2026 – May 28, 2026 (4 Weeks) |
| **Baseline Budget (PV)** | $7,040.00 (384 Planned Engineering Hours) |
| **Actual Incurred Cost (AC)**| $7,454.00 (408 Realized Hours - incl. 24h OT) |
| **Realized Gross Profit** | **$21,546.00 (74.3% Gross Profit Margin)** |

---

## 1. Executive Summary & Authorization

This Charter formally authorizes the **SoftSolution Engineering Team** (Mohammad Rayed & Asmaa Hajj Chehade) under the academic supervision of **Dr. Mohamad Aoude** to develop and deploy an AI-powered automated order management system for **Manakish Bakery**.

The project delivers an end-to-end full-stack web application featuring a Node.js/Express backend, Gemini AI Agent SDK tool-calling logic, React UI dashboard, and atomic file-store persistence.

---

## 2. Business Objective & Core Scope Bounds

### Included In Scope (In-Scope):
1. **Interactive Multi-Turn AI Chat Agent:** Customer order placement via natural language powered by `@google/genai` (Gemini SDK).
2. **Deterministic Tool Invocations:** Automated backend function calls for menu searching, delivery validation, topping customization, order calculations, and status checks.
3. **Staff Operations Dashboard:** Real-time order monitoring, item status progression (Pending → In Oven → Ready → Delivered), and execution trace logging.
4. **Persistent JSON Data Engine:** Atomic lock-protected storage for orders (`data/orders.json`) and menu catalog (`data/menu.json`).
5. **Containerized Infrastructure:** Production Docker containerization deployed on Google Cloud Run.

### Excluded From Scope (Out-of-Scope):
* Payment gateway merchant credit card processing (Stripe live clearing).
* Native iOS / Android mobile application packages.
* Multi-language real-time voice translation streams.

---

## 3. Financial & Budget Summary

| Financial Metric | Amount ($) |
| :--- | :--- |
| **Client Fixed Contract Price** | **$29,000.00** |
| **Planned Engineering Baseline (PV - 384h)** | $7,040.00 |
| **Actual Realized Cost (AC - 408h)** | $7,454.00 |
| **Internal Contingency Reserve (10%)** | $704.00 |
| **Net Realized Gross Profit** | **$21,546.00 (74.3%)** |

---

## 4. Formal Approval & Sign-Off

* **Mohammad Rayed** – Tools & AI Lead Engineer
* **Asmaa Hajj Chehade** – UI & Infrastructure Lead Engineer
* **Dr. Mohamad Aoude** – Academic Director & Governance Supervisor
