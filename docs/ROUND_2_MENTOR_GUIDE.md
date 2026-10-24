# VidyaSetu — Round 2 Mentor & Evaluator Guide
## HackIIITD 2026 | ESYA '26
### Advanced Scholarship Discovery, Student-Centric Search, Eligibility Intelligence, Document Audit & Deadline Detection

- **Project Title:** VidyaSetu — Welfare Intelligence Engine
- **Track:** Higher Education Civic Tech & Student Welfare
- **Team Name:** TwoBit
- **Institute:** KIET Group of Institutions, Ghaziabad (Delhi-NCR)
- **Project Lead:** Shubham Kumar
- **GitHub Repository:** [https://github.com/shubham34970/VidyaSetu.git](https://github.com/shubham34970/VidyaSetu.git)
- **Target Branch:** `main`

---

## 1. Executive Summary & Round 2 Objectives

Building upon Round 1's solid architectural foundation, **Round 2 transforms VidyaSetu into an enterprise-grade, student-centric scholarship intelligence platform**. 

Responding directly to mentor feedback, Round 2 delivers:
1. **Advanced Student-Centric Search & Multi-Dimensional Filtering:** Replaced basic discovery with a responsive search studio supporting 15+ granular criteria (domicile, social category, degree level, year of study, income thresholds, institution type, scheme type, gender, disability, minority focus, deadlines, and source verification).
2. **Profile-Assisted Scholarship Matching:** One-click automated alignment between a student's voluntary profile and official criteria, showing exact match verdicts, satisfied criteria, and missing fields.
3. **Multi-Scheme Side-by-Side Comparison:** Interactive matrix comparing award amounts, renewal rules, deadlines, required documents, and verified application portals.
4. **Expanded Official Scheme Coverage:** Increased from 4 baseline schemes to **14 officially verified scholarships** spanning Central/National portals, Uttar Pradesh, Delhi, Bihar, Rajasthan, Haryana, AICTE, NSP, UGC, and Minority Affairs.
5. **Deterministic Rule Engine with Detailed Explanations:** Evaluates domicile, income caps, reservation categories, academic percentiles, study year, and institution types without vague numerical guesses.
6. **Persistent Deadline Intelligence & Change Detection:** Tracks historical snapshot observations (`NEW`, `UNCHANGED`, `CHANGED`, `WITHDRAWN`) with stale-data warnings (>24h) and historical audit trails.
7. **Document Compliance Pre-Flight:** Statutory rule validation for income certificates (UP G.O. 4521/1-9-2015 3-year rule), caste certificates, Aadhaar NPCI seeding, and issuing authorities.
8. **Resilient Data Architecture:** Zero-PII storage, configurable caching, bounded API retries, and offline fallback ensuring continuous evaluation.

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STUDENT DISCOVERY FRONTEND                      │
│      React 18 + Vite 6 + TypeScript 5.6 + Tailwind CSS 3.4             │
│                                                                        │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│  │ Free-Text & Filters  │  │ Profile Assistant   │  │ Comparison Bar │ │
│  │ 15+ criteria inputs  │  │ One-click matching  │  │ Side-by-side   │ │
│  └──────────┬───────────┘  └──────────┬──────────┘  └────────┬───────┘ │
└─────────────┼─────────────────────────┼──────────────────────┼─────────┘
              │                         │                      │
              ▼                         ▼                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND REST API SERVICES                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ GET/POST /api/schemes                                            │  │
│  │ • Multi-filter query processor (income, marks, domicile, etc.)    │  │
│  │ • Sorting (relevance, deadline, benefit, name, verified)         │  │
│  │ • Pagination & result count metadata                             │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│  ┌─────────────────────────────────┴────────────────────────────────┐  │
│  │ DETERMINISTIC ELIGIBILITY ENGINE (eligibility_service.py)        │  │
│  │ • Domicile & Category Rules                                      │  │
│  │ • Income Boundaries & Merit Cutoffs                              │  │
│  │ • Course / Year / Institution Type Checks                        │  │
│  │ • Explainable criteria (Satisfied, Conflicting, Missing)         │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│  ┌─────────────────────────────────┴────────────────────────────────┐  │
│  │ DEADLINE PERSISTENCE & AUDITOR                                   │  │
│  │ • deadline_service.py (JSON snapshot persistence)                │  │
│  │ • document_auditor.py (Statutory date validity checks)          │  │
│  │ • tinyfish_service.py (Search/Fetch with resilient caching)     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. How the Core Capabilities Work

### 3.1 Student-Centric Search & Multi-Filter Discovery
- **Free-Text Search:** Instant keyword matching across scheme titles, administering ministries, portal names, official circular notices, and tags.
- **Combined Structured Filters:** Combine domicile state, social category (`OBC`, `SC`, `ST`, `EWS`, `GENERAL`), academic level (`UG`, `PG`, `DIPLOMA`), year of study (1 to 5), institution type (`GOVERNMENT`, `GOVT_AIDED`, `PRIVATE`), income ceilings, and merit cutoffs.
- **Specialized Welfare Filters:** Dedicated toggles for Gender-Specific (e.g. AICTE Pragati), Disability-focused (AICTE Saksham), and Minority Welfare (Begum Hazrat Mahal).
- **Sort Dimensions:** Relevance to profile, approaching deadline, highest financial award, recently verified, and alphabetical order.
- **State Management & Reset:** Clear-all filters button, active filter chips with individual removals, and result counters.

### 3.2 Explainable Eligibility Engine
Rather than returning an opaque match score, the engine computes deterministic verdicts:
- **`ELIGIBLE`:** Student satisfies all verified scheme criteria.
- **`POTENTIALLY_ELIGIBLE`:** Satisfies verified rules, but some criteria require additional documentation or confirmation.
- **`INELIGIBLE`:** Violates at least one hard statutory boundary (e.g. income exceeds statutory ceiling or non-matching domicile).
- **`INSUFFICIENT_INFO`:** Profile lacks necessary parameters to evaluate conditions.

Every verdict returns three clear lists:
1. `criteriaSatisfied`: Exact rules passed with verified numbers (e.g., *"Annual income ₹1,80,000 within statutory ceiling of ₹2,00,000"*).
2. `criteriaConflicting`: Specific violated rules citing source thresholds.
3. `missingInformation`: Clarifications needed before portal submission.

### 3.3 Pre-Flight Document Compliance Auditor
Prevents the **84% procedural rejection trap** before submitting portal applications:
- **Income Certificate Rule:** Validates issuance date against UP Revenue Board G.O. 4521/1-9-2015 and NSP rules enforcing the strict **3-year validity window**.
- **Caste/Category Verification:** Flags issuing authority requirements (SDM/Tehsildar) and DigiLocker interoperability.
- **Aadhaar NPCI Seeding:** Verifies that active bank account is linked to the Aadhaar payment bridge for Direct Benefit Transfer (DBT).
- **Remediation Directives:** Provides actionable steps (e.g., *"Renew digital income certificate on edistrict.up.gov.in"*).

### 3.4 Deadline Intelligence & Observation History
- **Persistent Snapshots:** Stored in `backend/data/deadline_observations.json` across server restarts.
- **Change Detection:** Automatically compares previous vs current observations and tags them:
  - `NEW`: Newly observed scheme.
  - `UNCHANGED`: Same deadline recorded.
  - `CHANGED`: Deadline modified or extended by official circular.
  - `WITHDRAWN`: Previously dated scheme with no active closing date.
- **Stale Data Warnings:** Flags any scheme whose observation is older than 24 hours.
- **Auditing API:** `GET /api/deadlines/{scheme_id}/history` returns the full chronological sequence of observed dates.

### 3.5 Privacy & Data Ethics
- **Zero-PII Storage:** No Aadhaar numbers, bank account numbers, or student phone numbers are stored in any database.
- **Local Profile Evaluation:** Eligibility matching runs locally in memory; student profiles are never transmitted to third-party AI models or external trackers.
- **Voluntary & Sensitive Disclosures:** Sensitive fields (caste, income, disability status) are optional and clearly marked with rationale.

---

## 4. Expanded Scholarship Coverage (14 Verified Schemes)

| Scheme ID | Scheme Title | Administering Authority | Benefit | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `nsp-central-sector-csss` | Central Sector Scheme (CSSS) | MoE, Govt of India | ₹12k–₹20k / Year | `VERIFIED_OFFICIAL` |
| `up-post-matric-obc-gen` | UP Post-Matric (General/OBC) | Social Welfare Dept, UP | Up to ₹50,000 / Yr | `VERIFIED_OFFICIAL` |
| `up-post-matric-sc-st` | UP Post-Matric (SC/ST) | Social Welfare Dept, UP | 100% Fee Waiver + Maint | `VERIFIED_OFFICIAL` |
| `aicte-pragati-girls` | AICTE Pragati Scholarship for Girls | AICTE, MoE | ₹50,000 / Year | `VERIFIED_OFFICIAL` |
| `aicte-saksham-pwd` | AICTE Saksham Scheme for Specially-Abled | AICTE, MoE | ₹50,000 / Year | `VERIFIED_OFFICIAL` |
| `delhi-merit-means-ug` | Delhi State Merit-cum-Means Scheme | Directorate of Higher Education, Delhi | 100% / 50% Fee Waiver | `VERIFIED_OFFICIAL` |
| `bihar-post-matric-bcebc` | Bihar Post-Matric Scholarship (BC/EBC) | Education Dept, Govt of Bihar | Up to ₹15,000 / Year | `VERIFIED_OFFICIAL` |
| `rajasthan-cm-sarvjan` | Rajasthan CM Higher Education Scholarship | College Education Dept, Rajasthan | ₹5,000 / Year | `VERIFIED_OFFICIAL` |
| `haryana-post-matric-sc` | Haryana Post-Matric Scholarship for SC | Higher Education Dept, Haryana | Full Fee + ₹13,500 Allowance | `VERIFIED_OFFICIAL` |
| `nsp-ishan-uday-ner` | Ishan Uday Special Scholarship for NER | UGC / Ministry of Education | ₹5,400–₹7,800 / Month | `VERIFIED_OFFICIAL` |
| `nsp-begum-hazrat-mahal` | Begum Hazrat Mahal National Scholarship | Maulana Azad Education Foundation | ₹5,000–₹6,000 / Year | `VERIFIED_OFFICIAL` |
| `nsp-pg-single-girl-child` | UGC PG Indira Gandhi Single Girl Child | University Grants Commission | ₹36,200 / Year | `VERIFIED_OFFICIAL` |
| `nsp-post-matric-minorities` | Post-Matric Scholarship for Minorities | Ministry of Minority Affairs | Up to ₹20,000 / Year | `VERIFIED_OFFICIAL` |
| `up-pre-matric-all` | UP Pre-Matric Scholarship (Class 9-10) | Social Welfare Dept, UP | ₹3,000 / Year | `VERIFIED_OFFICIAL` |

---

## 5. Live Demonstration Script for Mentors (5 Minutes)

### Stop 1: Advanced Search Studio & Filters
1. Open the application at `http://localhost:5173`.
2. Click on **Scholarship Discovery**.
3. **Free-Text Search:** Type `"AICTE"` into the search box.
   - *Result:* Shows 2 schemes: *AICTE Pragati for Girls* and *AICTE Saksham for Specially-Abled*.
4. **Clear Search:** Click Clear to restore all 14 schemes.
5. **Multi-Filter Test:**
   - Select Domicile: `"Uttar Pradesh"`.
   - Select Category: `"OBC"`.
   - Set Max Family Income: `"₹2,00,000"`.
   - *Result:* Notice the result count updates immediately, showing *UP Post-Matric (General/OBC)* and *CSSS (National)*.

### Stop 2: Profile-Assisted Search & Explainable Verdicts
1. Click the preset profile or use the **"Match My Profile"** toggle.
2. Observe how cards display:
   - Green badge: **"Eligible (Satisfies All Rules)"**.
   - Red badge: **"Ineligible (Criteria Conflict)"**.
3. Click **"Rules & Details"** on *UP Post-Matric*:
   - Read the exact satisfied criteria: income within ₹2,00,000, domicile verified, previous marks 76.4% >= 50.0%.
   - Notice the official circular notice: *G.O. No. 102/2026/SW-2*.

### Stop 3: Side-by-Side Scheme Comparison
1. On *UP Post-Matric*, click **"Add to Compare"**.
2. On *Central Sector Scheme (CSSS)*, click **"Add to Compare"**.
3. A floating bar appears: **"2 scholarships selected for comparison"**.
4. Click **"Compare Selected (2)"**.
5. Inspect the side-by-side modal comparing award amounts, application deadlines, criteria, documents, and verified application URLs.

### Stop 4: Pre-Flight Document Compliance
1. Switch to the **Document Pre-Flight** tab.
2. Notice the **Income Certificate Date** validator.
3. Enter a date from 4 years ago (e.g., `2022-01-15`):
   - Notice the status immediately changes to **WARNING (Expired)** citing *UP Revenue Board G.O. 4521/1-9-2015 (3-year validity)*.
4. Enter a recent date (e.g., `2025-06-10`):
   - Status changes to **PASS (Compliant)** with remaining validity calculated.

### Stop 5: Deadline History & Persistent Change Tracking
1. Switch to **Deadlines**.
2. Review the timeline of active scholarship deadlines.
3. Click **"Force Portal Sync / Refresh"**:
   - The backend records a snapshot in `deadline_observations.json` and returns change metrics (`newCount`, `changedCount`).

---

## 6. Test Suite & Verification Results

### Automated Test Summary: **108/108 Tests Passing**

| Test Module | Coverage | Status |
| :--- | :--- | :--- |
| `tests/test_search_filters.py` | Free-text, domicile, category, level, year, income, marks, pagination, combined queries, invalid inputs, edge cases | **55/55 PASS** |
| `tests/test_deadline_persistence.py` | First snapshot (NEW), unchanged dates, changed dates, withdrawn info, stale warning, history API | **20/20 PASS** |
| `tests/test_eligibility_extended.py` | Income boundaries, marks cutoffs, year of study, gender, disability, minority, multiple rule conflicts | **19/19 PASS** |
| `tests/test_scholarship_endpoints.py` | REST API routes, parameter validation, 404 responses | **6/6 PASS** |
| `tests/test_document_auditor.py` | 3-year certificate validity, future dates, caste authority, NPCI bank seeding | **3/3 PASS** |
| `tests/test_health.py` | Health check, TinyFish CLI status, API key detection | **1/1 PASS** |
| `tests/test_eligibility.py` | Core baseline eligibility matching | **4/4 PASS** |

### Frontend Production Build:
- Bundled via `vite build`: **1,601 modules transformed in 54s** with zero errors (`dist/index.html`, `dist/assets/index.css`, `dist/assets/index.js`).

---

## 7. Known Limitations & Roadmap for Round 3

1. **OCR of Uploaded Scans:** Current pre-flight auditing validates structured metadata (issuance dates, certificate numbers, issuing authorities). Real-time OCR of scanned image files is architected for Round 3 using Tesseract/Vision API.
2. **Automated Cron Daemon:** Deadline change detection runs on-demand via manual refresh or API invocation. Continuous headless background scraping requires an active daemon worker.
3. **Application Form Autofill:** Direct submission into state portals is restricted by CAPTCHA and OTP requirements; VidyaSetu provides direct links to verified login endpoints.
