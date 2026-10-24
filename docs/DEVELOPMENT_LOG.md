# VidyaSetu — Engineering Development Log
## HackIIITD 2026 | Team TwoBit (KIET Group of Institutions)

- **Institute:** KIET Group of Institutions (Ghaziabad / Delhi-NCR)
- **Project Lead:** Shubham Kumar
- **Repository:** [https://github.com/shubham34970/VidyaSetu.git](https://github.com/shubham34970/VidyaSetu.git)
- **Target Branch:** `main`

---

## Round 1 Commit Matrix & Execution History

| # | Commit Hash | Message / Description | Scope | Tests Passed | Remote Push Status |
| :-: | :---: | :--- | :--- | :---: | :---: |
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
| 20 | `20da331` | `chore(release): final validation, lint/type checks, and release hardening for Round 1` | Release | Pytest & Vite Build Passed | Verified (`origin/main`) |

---

## Round 2 Commit Matrix & Execution History

| # | Commit Target / Hash | Message / Description | Scope | Tests Passed | Remote Push Status |
| :-: | :---: | :--- | :--- | :---: | :---: |
| 21 | `af80ad4` | `feat(normalization): add extended scholarship schemas and criteria models` | Normalization | Pydantic validation | Verified (`origin/main`) |
| 22 | `1b803b5` | `feat(schemes): expand verified static scholarship repository across national and state portals` | Data Expansion | 14 verified schemes | Verified (`origin/main`) |
| 23 | `d05cb57` | `feat(eligibility): implement extended multi-attribute deterministic eligibility engine` | Rule Engine | Deterministic checks | Verified (`origin/main`) |
| 24 | `f24819d` | `test(eligibility): add comprehensive tests for extended eligibility boundaries and cutoffs` | Tests | 19 boundary tests | Verified (`origin/main`) |
| 25 | `c6c8a4a` | `feat(deadlines): implement persistent deadline observation storage and change detection` | Deadlines | JSON persistence | Verified (`origin/main`) |
| 26 | `b702712` | `feat(deadlines): add deadline observation history, refresh, and stale detection endpoints` | API Router | History & refresh | Verified (`origin/main`) |
| 27 | `16645ed` | `test(deadlines): add test suite for deadline persistence, change detection, and history` | Tests | 20 persistence tests | Verified (`origin/main`) |
| 28 | `1c0fbbe` | `feat(search): implement advanced search and multi-dimensional filter router` | Search API | Multi-filter engine | Verified (`origin/main`) |
| 29 | `5b546ed` | `test(search): add comprehensive test suite for multi-filter queries, sorting, and pagination` | Tests | 55 search tests | Verified (`origin/main`) |
| 30 | `bc70f90` | `feat(ui): implement side-by-side scholarship comparison and card badges` | Frontend UI | Comparison matrix | Verified (`origin/main`) |
| 31 | `cc6fe72` | `feat(ui): implement advanced student-centric search studio and filter controls` | Frontend UI | 15+ filter controls | Verified (`origin/main`) |
| 32 | `4b28012` | `feat(frontend): integrate schemes API client with fallback and profile matching` | API Client | Backend integration | Verified (`origin/main`) |
| 33 | `b78c7ef` | `docs(round-2): create specialized guides for search, eligibility, audit, and deadlines` | Documentation | 4 specialized docs | Verified (`origin/main`) |
| 34 | *(Pending)* | `docs(round-2): add comprehensive mentor guide and update development log` | Release Docs | Mentor guide & tests | In Progress |

---

## Round 2 Engineering Achievements

1. **Multi-Faceted Search Engine (`backend/routers/schemes.py`, `DiscoveryView.tsx`):**
   - Free-text substring matching across name, authority, portal, keywords, and tags.
   - Structured multi-filters for state domicile, reservation categories, educational level, year of study, institution type, family income ceilings, merit percentages, gender, disability, minority focus, renewal mode, and source verification.
   - 5-dimensional sorting (`relevance`, `deadline`, `benefit_desc`, `name`, `recently_verified`).
   - Side-by-side comparison matrix for up to 3 chosen scholarships.

2. **Expanded Real Coverage (14 Schemes across India):**
   - Central Sector Scheme (MoE), UP Post-Matric (Gen/OBC & SC/ST), AICTE Pragati (Girls), AICTE Saksham (Specially-Abled), Delhi Higher Education Merit-cum-Means, Bihar Post-Matric (BC/EBC), Rajasthan CM Higher Education, Haryana SC Scholarship, UGC Ishan Uday (NER), Begum Hazrat Mahal (Minority Girls), UGC Single Girl Child, and UP Pre-Matric.

3. **Deterministic Explainability (`eligibility_service.py`):**
   - Evaluates all statutory conditions with exact numeric boundaries.
   - Returns clear arrays for `criteriaSatisfied`, `criteriaConflicting`, `missingInformation`, and `sourceEvidence`.

4. **Persistent Deadline Intelligence (`deadline_service.py`):**
   - Saves observation history snapshots to `backend/data/deadline_observations.json`.
   - Tracks change types (`NEW`, `UNCHANGED`, `CHANGED`, `WITHDRAWN`).
   - Flags observations older than 24 hours as stale.
   - Provides full historical audits via `/api/deadlines/{scheme_id}/history`.

5. **108/108 Automated Pytest Tests Passing:**
   - 55 search & filter tests
   - 20 deadline persistence tests
   - 19 extended eligibility boundary tests
   - 6 endpoint integration tests
   - 4 baseline eligibility tests
   - 3 statutory document audit tests
   - 1 health & diagnostic test
