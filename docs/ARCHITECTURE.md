# VidyaSetu — System Architecture & Technical Specifications
## HackIIITD 2026 | Team TwoBit (KIET Group of Institutions)

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph ClientLayer [Client Tier - React 18 + TS + Tailwind]
        Nav[Navbar & Global Shell]
        Landing[Landing & Impact Visualizer]
        Wizard[Student Profile Intake Wizard]
        Discovery[Scholarship Discovery & Filtering]
        Modal[Scheme Rules & Circular Slide-Over]
        Auditor[Document Pre-Flight Compliance Inspector]
        Deadlines[Time-Series Deadline Tracker]
        Settings[Sources & Privacy Transparency]
    end

    subgraph APILayer [API Gateway Tier - FastAPI + Uvicorn]
        RouterHealth[/api/health]
        RouterScholarships[/api/scholarships]
        RouterDiscovery[/api/discovery/search & fetch]
        RouterProfile[/api/student/profile]
        RouterEligibility[/api/eligibility/match]
        RouterAudit[/api/documents/audit]
        RouterDeadlines[/api/deadlines]
    end

    subgraph ServiceLayer [Core Intelligence Engines]
        EngineElig[Eligibility Engine - Multi-Factor Matcher]
        EngineAudit[Document Compliance Auditor - 3-Yr Rule & NPCI]
        EngineTinyFish[TinyFish Service - Subprocess CLI & HTTPX]
    end

    subgraph ExternalTier [External Portals & Services]
        TinyFishCLI[TinyFish CLI v0.52.1]
        PortalNSP[National Scholarship Portal - scholarships.gov.in]
        PortalUP[UP Scholarship Portal - scholarship.up.gov.in]
        PortalAICTE[AICTE Pragati Portal - aicte-india.org]
    end

    ClientLayer -->|HTTP REST / JSON| APILayer
    APILayer --> ServiceLayer
    EngineTinyFish -->|Subprocess Execution| TinyFishCLI
    TinyFishCLI -->|Dynamic Traversal| PortalNSP
    TinyFishCLI -->|DOM Extraction| PortalUP
    TinyFishCLI -->|Circular Monitoring| PortalAICTE
```

---

## 2. Directory Layout

```
VidyaSetu/
├── backend/
│   ├── main.py                  # FastAPI entry point & CORS configuration
│   ├── config.py                # Pydantic Settings & environment variables
│   ├── requirements.txt         # Python dependencies
│   ├── schemas/                 # Pydantic v2 data models
│   │   ├── scholarship.py
│   │   ├── profile.py
│   │   ├── eligibility.py
│   │   ├── audit.py
│   │   └── discovery.py
│   ├── services/                # Business logic engines
│   │   ├── tinyfish_service.py  # Web extraction & caching
│   │   ├── eligibility_service.py # Deterministic matching
│   │   └── document_auditor.py  # Pre-flight compliance validator
│   └── routers/                 # Modular REST API endpoints
│       ├── scholarships.py
│       ├── discovery.py
│       ├── student.py
│       ├── eligibility.py
│       ├── audit.py
│       └── deadlines.py
├── frontend/
│   ├── index.html               # Entry HTML with Google Fonts
│   ├── package.json             # Vite + React 18 dependencies
│   ├── tailwind.config.js       # Civic-Tech color theme
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx              # Main shell & state coordination
│   │   ├── types.ts             # Domain contracts
│   │   ├── components/          # Reusable UI widgets
│   │   │   ├── Navbar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ScholarshipCard.tsx
│   │   │   └── ScholarshipDetailModal.tsx
│   │   ├── views/               # 6 core dashboard views
│   │   │   ├── LandingView.tsx
│   │   │   ├── ProfileWizardView.tsx
│   │   │   ├── DiscoveryView.tsx
│   │   │   ├── DocumentAuditorView.tsx
│   │   │   ├── DeadlineTrackerView.tsx
│   │   │   └── SettingsView.tsx
│   │   ├── services/
│   │   │   └── api.ts           # Typed API client with fallback
│   │   └── data/
│   │       └── verifiedSchemes.ts # Verified baseline data
├── tests/                       # Automated Pytest suite
│   ├── test_health.py
│   ├── test_eligibility.py
│   ├── test_document_auditor.py
│   └── test_scholarship_endpoints.py
├── docs/                        # Architecture & logs
│   ├── IMPLEMENTATION_PLAN.md
│   ├── DEVELOPMENT_LOG.md
│   ├── ROUND_1_MENTOR_GUIDE.md
│   └── ARCHITECTURE.md
├── .env.example                 # Configuration template
├── .gitignore                   # Secret & asset filters
└── README.md                    # Primary setup guide
```

---

## 3. Data Flow & Request Lifecycle

1. **Intake:** Student completes the 3-step wizard in `ProfileWizardView`. Data is validated against `StudentProfile` schema.
2. **Matching:** `eligibility_engine` compares profile parameters against active rules:
   - State Domicile check (State match or "All States & UTs").
   - Social Category check (General, OBC, SC, ST, EWS).
   - Income Ceiling comparison with boundary validation.
   - Academic Percentage cutoff comparison.
   - Gender and course level matching.
3. **Auditing:** `document_auditor` validates certificate dates:
   - Calculates exact certificate age against statutory rules (e.g. UP 3-year cutoff).
   - Checks issuing authority and Aadhaar NPCI seeding prerequisite.
4. **Observation:** `tinyfish_service` checks cache; if TTL expired, executes `tinyfish search query` to detect live updates and circular extensions.
