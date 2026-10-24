# VidyaSetu — Round 1 Mentor & Evaluator Guide
## HackIIITD 2026 | ESYA '26

- **Project Title:** VidyaSetu — Welfare Intelligence Engine
- **Track:** Higher Education Civic Tech & Student Welfare
- **Team Name:** TwoBit
- **Institute:** KIET Group of Institutions, Ghaziabad (Delhi-NCR)
- **Project Lead:** Shubham Kumar
- **GitHub Repository:** [https://github.com/shubham34970/VidyaSetu.git](https://github.com/shubham34970/VidyaSetu.git)
- **Target Branch:** `main`

---

## 1. Problem Statement & Civic Impact

Higher education scholarships and fee reimbursements in India represent over **₹4,200+ Crores in annual unspent budget allocations**. Beneficiaries—particularly rural students, first-generation scholars, and underrepresented communities—face three systemic bottlenecks:
1. **Fragmented Silos:** Over 30+ disparate portals (NSP, UP Scholarship Portal, MahaDBT, PM-USP) with shifting PDF notices, broken UI forms, and zero centralized tracking.
2. **The 84% Technical Rejection Trap:** More than 84% of disqualified applications stem from minor procedural defects: expired income certificates (past 3-year statutory validity), non-matching caste certificate issuing authorities, or missing Aadhaar NPCI seeding.
3. **Information Asymmetry:** Students discover schemes after official deadlines have closed or fail to navigate complex eligibility matrices.

---

## 2. Solution Overview

**VidyaSetu** is an autonomous civic-tech intelligence platform that:
- **Discovers Scheme Circulars:** Autonomously crawls official state and central portals using **TinyFish API**.
- **Normalizes Rules:** Converts unstructured government circulars into deterministic Pydantic v2 schemas.
- **Explains Eligibility:** Multi-factor matching engine transparently explains why a student qualifies or what conditions conflict.
- **Audits Document Pre-Flight:** Validates certificate validity dates, issuing authorities, and NPCI bank seeding before portal submission.
- **Tracks Deadlines:** Maintains time-series observations of closing windows and circular extensions.

---

## 3. Technology Stack & Architecture

- **Frontend:** React 18, Vite 6, TypeScript 5.6, Tailwind CSS 3.4 (Civic-Tech Theme: Deep Navy `#0B192C`, Slate `#1E3E62`, Vibrant Teal `#008080`, and Emerald `#10B981`), Lucide React icons.
- **Backend:** Python 3.13.2, FastAPI, Uvicorn, Pydantic v2, HTTPX, Python-dotenv.
- **Web Extraction Engine:** TinyFish CLI (v0.52.1) + TinyFish REST API fallback.
- **Testing:** Pytest (14 automated unit & integration tests), Vite production bundler check.

---

## 4. TinyFish Integration: Search vs Fetch

VidyaSetu integrates TinyFish across two distinct operations:

| Operation | Purpose | CLI / API Command | Fallback Strategy |
| :--- | :--- | :--- | :--- |
| **TinyFish Search** | Discovers new circulars restricted to official government domains | `tinyfish search query "<query>" --include-domains "scholarships.gov.in,scholarship.up.gov.in"` | Serves verified official scheme baseline from local cache |
| **TinyFish Fetch** | Extracts clean content, tables, and deadlines from dynamic portal SPAs | `tinyfish fetch content get <url> --format json` | Asynchronous HTTPX client with 5-second timeout budget |

### Provenance Classification Badges:
- **`VERIFIED_OFFICIAL`**: Cross-referenced against gazette circulars on official government servers.
- **`CACHED_PORTAL`**: Served from local high-speed TTL cache.
- **`DEMO_DATA`**: Clearly labelled persona datasets for offline evaluation.
- **`UNVERIFIED`**: Raw web extraction awaiting nodal authority confirmation.

---

## 5. Live Hackathon Demonstration Script (3-Minute Walkthrough)

1. **Step 1 — Overview & Impact Visualizer:**
   - Open VidyaSetu at `http://localhost:5173`.
   - Highlight the **₹4,200+ Crore** unspent budget counter and the **84% technical rejection trap** visualizer.
2. **Step 2 — Student Profile Intake Wizard:**
   - Navigate to **Profile Wizard**.
   - Click the preset: **"UP B.Tech Scholar (OBC)"** (Family income: ₹1.80L, UP Domicile, 76.4% marks).
   - Walk through the 3-step wizard and click **Save Profile & Discover Schemes**.
3. **Step 3 — Explainable Eligibility Matching:**
   - View **Scholarships**: Notice **UP Post-Matric (Dashmottar)** is tagged as **High Match (Eligible)** with satisfied rules highlighted.
   - Contrast with **AICTE Pragati for Girls**, which correctly flags **Gender Criteria Mismatch** for male students.
   - Click **Details & Rules** on any card to inspect the verbatim official gazette citation and required documents.
4. **Step 4 — Pre-Flight Document Auditor:**
   - Navigate to **Document Pre-Flight**.
   - Observe the **80% Readiness Meter**.
   - Point out the **Warning** on the OBC Certificate (over 3 years old) with actionable guidance to renew on `edistrict.up.gov.in`.
   - Test the interactive **Income Certificate Validity Calculator** with different dates to prove compliance enforcement.
5. **Step 5 — Time-Series Deadline Tracker:**
   - Navigate to **Deadlines**.
   - Show the detected extension circular on UP Post-Matric (extended to Nov 15) with Gazette reference.
6. **Step 6 — Transparency & Privacy:**
   - Navigate to **Sources & Setup**.
   - Emphasize our **Zero Aadhaar / Personal ID Storage** guarantee.

---

## 6. Test Suite & Verification Records

- **Backend Pytest Suite:** 14/14 tests passing (`tests/test_health.py`, `tests/test_eligibility.py`, `tests/test_document_auditor.py`, `tests/test_scholarship_endpoints.py`).
- **Frontend Production Build:** `tsc -b && vite build` compiled 1,600 modules into static bundle without warnings.
- **Security Check:** Zero API secrets committed; `.env` strictly ignored by `.gitignore`.

---

## 7. Known Limitations & Next-Round Roadmap

- **Current Limitations:**
  - TinyFish live API calls depend on external network stability; offline cached baseline ensures uninterrupted judging.
  - Multi-state scholarship portal coverage currently prioritizes UP Post-Matric, NSP CSSS, and AICTE Pragati.
- **Round 2 Priorities:**
  - Automated WhatsApp webhook alerts for deadline extensions.
  - Institutional Nodal Officer batch verification console.
  - DigiLocker direct credential verification via OAuth 2.0.
