# Project Management Plan: Manakish Bakery AI Agent System

**Document Reference:** PMP-241-01-SS  
**Date:** May 01, 2026  
**Status:** Baseline Plan Approved  

---

## 1. Work Breakdown Structure (WBS)

1. **1.0 Governance & Requirements Alignment**
   * 1.1 Project Charter & Architecture Specifications (24h)
   * 1.2 Weekly Stakeholder Audit & Milestone Reviews (40h)
2. **2.0 Engineering Implementation**
   * 2.1 Backend Domain Data Schemas & Express API Routes (48h)
   * 2.2 React UI Component Hierarchy & Telemetry Inspector (48h)
   * 2.3 File Persistence Store Wrapper & Mutex Lock Safeguards (34h)
   * 2.4 Gemini AI Agent Integration & Tool Invocations (56h)
3. **3.0 Quality Assurance & Verification**
   * 3.1 QA Test Matrix, Edge Case Audits & Linter Pass (48h)
4. **4.0 Deployment & Handover**
   * 4.1 Multi-Stage Dockerization & Cloud Run Container Health Probe (16h)
   * 4.2 System Testing, Documentation & Final Handover (20h)

---

## 2. Resource Allocation & Baseline Costing

| Resource Name | Role | Standard Rate | Planned Hours | Planned Cost ($) |
| :--- | :--- | :--- | :--- | :--- |
| **Project Lead** | Governance & PM | $20.00 / h | 160 h | $3,200.00 |
| **Mohammad Rayed** | Tools & Backend Engineer | $18.00 / h | 104 h | $1,872.00 |
| **Mohammad Rayed** | Agent Logic Engineer | $18.00 / h | 40 h | $720.00 |
| **Asmaa Hajj Chehade** | Platform & UI Engineer | $16.00 / h | 48 h | $768.00 |
| **Asmaa Hajj Chehade** | QA / Infra Specialist | $15.00 / h | 32 h | $480.00 |
| **Total Baseline** | | | **384 h** | **$7,040.00** |

---

## 3. Communication & Risk Matrix

### High Severity Risks Managed:
1. **Concurrency File Corruption Risk:** Race conditions on `data/orders.json` during concurrent AI orders. *Mitigation:* Implemented synchronous mutex locks and atomic write operations.
2. **Gemini Tool Argument Hallucination:** Agent passing non-schema arguments to backend tools. *Mitigation:* Strict JSON schema parameters and system prompt boundary rules.
3. **Docker Volume Non-Root Write Permission:** Alpine linux container permission failure. *Mitigation:* Set explicit UID 1000 ownership scripts in multi-stage Docker build.
