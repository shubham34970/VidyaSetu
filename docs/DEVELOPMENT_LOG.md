# VidyaSetu — Engineering Development Log
## HackIIITD 2026 | Team TwoBit

- **Institute:** KIET Group of Institutions (Ghaziabad / Delhi-NCR)
- **Project Lead:** Shubham Kumar
- **Repository:** `https://github.com/shubham34970/VidyaSetu.git`
- **Target Branch:** `main`

---

## Milestone Execution Summary

| Milestone | Description | Status | Commit Hash | Branch | Tests Passed | Notes |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **M0** | Repository Audit & Plan | Complete | `23d5326` | `main` | Environment verified | Verified empty GitHub remote repo, Python 3.13, Node 24, TinyFish CLI 0.52.1. |
| **M1** | Project Foundation | Complete | *(Pending)* | `main` | Pytest & Vite Build | Backend & Frontend scaffolds, `.gitignore`, health endpoint. |
| **M2** | Professional Frontend | Planned | - | `main` | - | React + TS + Tailwind civic-tech dashboard. |
| **M3** | FastAPI Backend | Planned | - | `main` | - | Modular REST endpoints, Pydantic v2 schemas. |
| **M4** | TinyFish Integration | Planned | - | `main` | - | CLI/API search and fetch service with cache. |
| **M5** | Structured Normalization | Planned | - | `main` | - | Pydantic data models for scholarship schemes. |
| **M6** | Eligibility Matching Engine | Planned | - | `main` | - | Multi-attribute matching with explanations. |
| **M7** | Document Pre-Flight Auditor | Planned | - | `main` | - | Pre-submission compliance & expiry verification. |
| **M8** | Deadline Tracker | Planned | - | `main` | - | Time-series deadline changes and stale alerts. |
| **M9** | End-to-End Integration | Planned | - | `main` | - | Full frontend-to-backend user flow. |
| **M10** | Security, QA & Hardening | Planned | - | `main` | - | Security audits, typecheck, production builds. |
| **M11** | Documentation & Demo | Planned | - | `main` | - | Release docs, judge walkthrough script. |

---

## Detailed Milestone Logs

### Milestone 0: Repository Audit and Planning
- **Date & Time:** 2026-10-24 13:30 IST
- **Status:** Complete
- **Activities:**
  1. Cloned target repository `https://github.com/shubham34970/VidyaSetu.git` to local workspace.
  2. Verified remote URL points to `https://github.com/shubham34970/VidyaSetu.git` on branch `main`.
  3. Inspected local toolchain:
     - Python: `3.13.2`
     - Node.js: `v24.22.1`
     - npm: `11.7.0`
     - TinyFish CLI: `0.52.1`
  4. Tested TinyFish CLI commands (`tinyfish --help`, `tinyfish search query --help`, `tinyfish fetch content get --help`, `tinyfish auth status`). Confirmed CLI operates cleanly and is ready for integration.
  5. Extracted and studied round 1 pitch specifications from `HackIIITD_2026_TwoBit_VidyaSetu_Submission.zip` for deep domain alignment.
  6. Formulated comprehensive architecture plan and milestone breakdown in `docs/IMPLEMENTATION_PLAN.md`.
- **Commit:** `23d5326148fce334259891a19cfb67ac08491d16` (pushed to `origin/main`)

### Milestone 1: Project Foundation
- **Date & Time:** 2026-10-24 13:45 IST
- **Status:** Complete
- **Activities:**
  1. Created maintainable repository structure: `backend/`, `frontend/`, `docs/`, `tests/`.
  2. Configured root `.gitignore` ensuring zero leakage of secrets, `.env`, `node_modules`, or cache directories.
  3. Created `.env.example` with clear placeholders for `TINYFISH_API_KEY`, server hosts, CORS, and cache configurations.
  4. Scaffolded FastAPI backend with Pydantic v2 settings, local CORS configuration, and `/api/health` diagnostic endpoint reporting runtime and TinyFish CLI readiness.
  5. Scaffolded React 18 + Vite + TypeScript frontend with Tailwind CSS civic-tech design system and Lucide icons.
  6. Added comprehensive `README.md` with Windows PowerShell and CMD setup guides.
  7. Automated tests:
     - `pytest tests/test_health.py`: 100% passed.
     - `vite build` production check: 100% passed (1588 modules transformed into dist bundle).
- **Commit:** *(In progress)*
