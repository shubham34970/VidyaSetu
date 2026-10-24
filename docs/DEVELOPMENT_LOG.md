# VidyaSetu — Engineering Development Log
## HackIIITD 2026 | Team TwoBit (KIET Group of Institutions)

- **Institute:** KIET Group of Institutions (Ghaziabad / Delhi-NCR)
- **Project Lead:** Shubham Kumar
- **Repository:** [https://github.com/shubham34970/VidyaSetu.git](https://github.com/shubham34970/VidyaSetu.git)
- **Target Branch:** `main`

---

## Round 1 Commit Matrix & Execution History

| # | Commit Hash | Message / Description | Scope | Tests Passed | Remote Push Status |
| :-: | :---: | :--- | :---: | :---: | :---: |
| 1 | `23d5326` | `chore: initialize VidyaSetu repository audit and implementation plan` | Docs / Plan | Environment audited | Verified (`origin/main`) |
| 2 | `edf76e0` | `chore: setup project foundation with FastAPI health check and React dashboard scaffold` | Foundation | Pytest & Vite Build | Verified (`origin/main`) |
| 3 | `ce98739` | `feat(domain): define domain models and types for welfare intelligence` | Domain | TypeScript Types Check | Verified (`origin/main`) |
| 4 | `b038537` | `feat(ui): implement responsive civic-tech navbar and application shell` | Frontend Shell | Vite Build (0 errors) | Verified (`origin/main`) |
| 5 | `3919c95` | `feat(ui): implement interactive landing page with welfare gap impact visualizer` | UI: View 1 | Vite Build (0 errors) | Verified (`origin/main`) |
| 6 | `6a72586` | `feat(ui): add 3-step student profile intake wizard with presets` | UI: View 2 | Vite Build (0 errors) | Verified (`origin/main`) |
| 7 | `16c60dd` | `feat(ui): implement scholarship discovery view with filtering and provenance tags` | UI: View 3 | Vite Build (0 errors) | Verified (`origin/main`) |
| 8 | `e0244a1` | `feat(ui): implement scholarship detail slide-over modal` | UI: Modal | Vite Build (0 errors) | Verified (`origin/main`) |
| 9 | `2c0f150` | `feat(ui): implement document pre-flight compliance auditor view` | UI: View 4 | Vite Build (0 errors) | Verified (`origin/main`) |
| 10 | `0ee6d17` | `feat(ui): implement time-series deadline tracker with circular change detection` | UI: View 5 | Vite Build (0 errors) | Verified (`origin/main`) |
| 11 | `d61936b` | `feat(ui): add settings, data source transparency and TinyFish setup view` | UI: View 6 | Vite Build (0 errors) | Verified (`origin/main`) |
| 12 | `e35d06b` | `feat(api): define Pydantic v2 schemas for schemes, profiles, audits, and discovery` | Backend Schemas | Python Type Validation | Verified (`origin/main`) |
| 13 | `8deca80` | `feat(tinyfish): implement robust TinyFish search, fetch, and caching service` | TinyFish Service | CLI & Fallback Unit Check | Verified (`origin/main`) |
| 14 | `36195ee` | `feat(eligibility): implement explainable student eligibility matching engine` | Matching Engine | Boundary & Rule Tests | Verified (`origin/main`) |
| 15 | `d496529` | `feat(audit): implement document pre-flight compliance rules engine` | Pre-Flight Engine | Statutory 3-Yr Rule Tests | Verified (`origin/main`) |
| 16 | `c1ad710` | `feat(api): implement modular REST routers for scholarships, discovery, eligibility, audit, and deadlines` | API Routers | TestClient HTTP 200 checks | Verified (`origin/main`) |
| 17 | `4a077db` | `feat(frontend): integrate frontend API client for live backend communication and discovery flow` | API Client | End-to-end integration check | Verified (`origin/main`) |
| 18 | `6686b96` | `test(api): add comprehensive pytest test suite for eligibility, audit, and endpoints` | Test Suite | 14/14 Pytest tests PASSED | Verified (`origin/main`) |
| 19 | `2c3a2be` | `docs(round-1): create comprehensive mentor guide and architecture documentation` | Documentation | Doc links verified | Verified (`origin/main`) |
| 20 | *(Pending)* | `chore(release): final validation, lint/type checks, and release hardening for Round 1` | Release | Pytest & Vite Build Passed | In Progress |

---

## Detailed Milestone Records

### 1. Milestone 0: Repository Audit & Planning
- Audited workspace, toolchains (Python 3.13.2, Node.js v24.22.1, TinyFish CLI v0.52.1).
- Generated `IMPLEMENTATION_PLAN.md` and initial development log.
- Pushed commit `23d5326` to `origin/main`.

### 2. Milestone 1: Foundation Setup
- Created root `.gitignore`, `.env.example`, `README.md`.
- Set up FastAPI app with CORS and `/api/health` diagnostic endpoint.
- Initialized React 18 + Vite + Tailwind CSS scaffold with civic-tech color palette.
- Pushed commit `edf76e0` to `origin/main`.

### 3. Milestone 2: Six Core Dashboard Views
- Created domain models in `types.ts` and authentic data in `verifiedSchemes.ts`.
- Built Navbar shell, StatusBadge, LandingView, ProfileWizardView (with 1-click persona presets), DiscoveryView (with multi-faceted filtering), ScholarshipCard (with local deterministic evaluation), ScholarshipDetailModal (with verbatim gazette notices), DocumentAuditorView (with interactive 3-year statutory validity calculator), DeadlineTrackerView (with extension circular change logs), and SettingsView (with data source transparency and zero-Aadhaar storage guarantee).
- Pushed commits `ce98739` through `d61936b` to `origin/main`.

### 4. Milestone 3: FastAPI Backend & Pydantic v2
- Defined strict schemas across `scholarship.py`, `profile.py`, `eligibility.py`, `audit.py`, and `discovery.py`.
- Pushed commit `e35d06b` to `origin/main`.

### 5. Milestone 4: TinyFish Integration Engine
- Created `tinyfish_service.py` supporting both CLI subprocess execution and direct REST API fallback.
- Added TTL cache layer and graceful degradation to official government baseline datasets.
- Pushed commit `8deca80` to `origin/main`.

### 6. Milestone 5 & 6: Eligibility Engine & Pre-Flight Document Auditor
- Built explainable multi-attribute eligibility engine evaluating domicile, category, income cap, academic percentage, gender, and level.
- Built document compliance auditor preventing the 84% rejection trap by enforcing the 3-year validity window under UP Revenue Board G.O. and checking NPCI bank seeding.
- Pushed commits `36195ee` and `d496529` to `origin/main`.

### 7. Milestone 7: REST API Routers & Frontend Integration
- Wired modular routers for `/api/scholarships`, `/api/discovery`, `/api/student`, `/api/eligibility`, `/api/documents`, and `/api/deadlines`.
- Built typed frontend API client with offline fallback resilience in `frontend/src/services/api.ts`.
- Pushed commits `c1ad710` and `4a077db` to `origin/main`.

### 8. Milestone 8: Automated Pytest Suite & Verification
- Authored 14 automated unit and integration tests across endpoints, eligibility matching, and document compliance rules.
- 100% test pass rate (`14 passed in 2.35s`).
- Pushed commit `6686b96` to `origin/main`.
