# VidyaSetu — Advanced Student-Centric Scholarship Search
## Architecture, Filter Specifications, and Query Engine

---

## 1. Overview

The VidyaSetu Search Engine empowers Indian higher-education students to discover relevant scholarships, fee reimbursements, and fellowships from official government portals. Unlike generic search bars, VidyaSetu implements a **multi-dimensional, student-centric filtering matrix** combining demographic, academic, financial, institutional, and verification parameters.

---

## 2. Supported Search Dimensions & Filters

| Dimension | Filter Key | Type | Description |
| :--- | :--- | :--- | :--- |
| **Free-Text** | `query` | `str` | Substring match against name, authority, portal, description, and keywords |
| **State / Domicile** | `domicile` | `str` | Matches state or national (`All States & UTs`) schemes |
| **Social Category** | `category` | `str` | `GENERAL`, `OBC`, `SC`, `ST`, `EWS` |
| **Academic Level** | `level` | `str` | `UNDERGRADUATE`, `POSTGRADUATE`, `DIPLOMA`, `HIGHER_SECONDARY` |
| **Scheme Type** | `scheme_type` | `str` | `MERIT`, `MEANS`, `MERIT_CUM_MEANS`, `CATEGORY_SPECIFIC`, etc. |
| **Family Income Cap**| `max_income` | `float` | Student income ceiling (must satisfy scheme limit) |
| **Merit Percentage** | `min_marks` | `float` | Qualifying marks / percentile requirement |
| **Gender Specific** | `gender` | `str` | `MALE`, `FEMALE`, `OTHER` |
| **Institution Type**| `institution_type` | `str` | `GOVERNMENT`, `GOVT_AIDED`, `PRIVATE` |
| **Year of Study** | `year_of_study` | `int` | Current academic year (e.g., Year 1 for freshers) |
| **Disability Status**| `is_disability` | `bool` | Reserved for specially-abled students (>= 40% benchmark disability) |
| **Minority Welfare**| `is_minority` | `bool` | Dedicated minority community schemes |
| **Renewal Mode** | `is_renewable` | `bool` | Renewable multi-year award vs one-time disbursement |
| **Data Quality** | `verification_status` | `str` | `VERIFIED_OFFICIAL`, `CACHED_PORTAL`, `DEMO_DATA`, `UNVERIFIED` |
| **Application State**| `is_open` | `bool` | Filters schemes with active deadlines |

---

## 3. Sorting Options

Students can sort results across five distinct axes:
1. **`relevance` (Default):** Evaluates profile match scores first, followed by closing dates.
2. **`deadline`:** Approaching deadlines first (`CRITICAL` -> `OPEN` -> `UNKNOWN`).
3. **`benefit_desc`:** Highest annual award amounts.
4. **`name`:** Lexicographical sorting (A–Z).
5. **`recently_verified`:** Latest portal observation timestamp.

---

## 4. API Endpoints

### 4.1 GET `/api/schemes`
Retrieve paginated schemes with query parameters:
```http
GET /api/schemes?domicile=Uttar+Pradesh&category=OBC&max_income=200000&sort=deadline&page=1&page_size=10 HTTP/1.1
Host: 127.0.0.1:8000
```

**Response:**
```json
{
  "total": 2,
  "page": 1,
  "pageSize": 10,
  "schemes": [ ... ],
  "provenance": "OFFICIAL_GOVERNMENT_CIRCULARS",
  "cacheStatus": "VERIFIED_OFFICIAL"
}
```

### 4.2 POST `/api/schemes/search`
Perform profile-assisted search with active filter overrides:
```json
{
  "profile": {
    "stateDomicile": "Uttar Pradesh",
    "socialCategory": "OBC",
    "annualFamilyIncome": 180000,
    "courseDegree": "B.Tech",
    "academicLevel": "UNDERGRADUATE",
    "yearOfStudy": 2,
    "marksPercentage": 76.4,
    "gender": "MALE",
    "institutionType": "GOVT_AIDED"
  },
  "query": "matric",
  "sort": "relevance",
  "page": 1,
  "pageSize": 20
}
```

### 4.3 GET `/api/schemes/{scheme_id}`
Retrieves a single scheme with complete official circular notice, required document checklist, and portal links.

---

## 5. UI Features in `DiscoveryView`
- **Filter Chips:** Instant visual indication of active filters with one-click individual dismissal.
- **Clear All:** Global reset back to defaults.
- **Compare Bar:** Multi-select up to 3 scholarships for side-by-side comparison in an interactive modal.
- **Real-Time Counters:** Total matches vs total database schemes.
- **Status Provenance Badges:** Clear visual indicators for `VERIFIED_OFFICIAL`, `CACHED_PORTAL`, etc.
