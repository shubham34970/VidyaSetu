# VidyaSetu — Deadline Intelligence & Change Detection
## Time-Series Observations, Extension Detection, and Historical Audits

---

## 1. The Challenge of Shifting Government Deadlines

State and central scholarship portals in India routinely extend closing deadlines through gazette notices and circulars. For example, the *UP Post-Matric Scholarship* portal frequently extends submission windows from October 31 to November 15 or December 10 to accommodate university result delays.

Conversely, portals occasionally close registrations early due to budget exhaustion. Students who rely on static spreadsheets miss these changes.

**VidyaSetu implements an observable, persistent deadline intelligence service** that tracks closing dates over time, detects extensions, flags stale data, and maintains a complete historical change audit trail.

---

## 2. Persistent Storage Architecture

- **Storage Location:** `backend/data/deadline_observations.json`
- **Design:** Lightweight JSON document store that survives server reboots without needing heavy external SQL servers.
- **Data Structure:**
  ```json
  {
    "up-post-matric-obc-gen": [
      {
        "scheme_id": "up-post-matric-obc-gen",
        "scheme_name": "UP Post-Matric Scholarship & Fee Reimbursement (Dashmottar)",
        "portal_name": "UP Scholarship Portal (scholarship.up.gov.in)",
        "official_url": "https://scholarship.up.gov.in",
        "deadline": "2026-10-31",
        "retrieved_at": "2026-10-01T08:00:00",
        "verification_status": "VERIFIED_OFFICIAL",
        "was_extended": false,
        "previous_deadline": null
      },
      {
        "scheme_id": "up-post-matric-obc-gen",
        "scheme_name": "UP Post-Matric Scholarship & Fee Reimbursement (Dashmottar)",
        "portal_name": "UP Scholarship Portal (scholarship.up.gov.in)",
        "official_url": "https://scholarship.up.gov.in",
        "deadline": "2026-11-15",
        "retrieved_at": "2026-10-24T10:15:00",
        "verification_status": "VERIFIED_OFFICIAL",
        "was_extended": true,
        "previous_deadline": "2026-10-31"
      }
    ]
  }
  ```

---

## 3. Change Detection Types

Every snapshot comparison against the preceding observation yields a deterministic change type:

| Change Type | Condition | System Action |
| :--- | :--- | :--- |
| **`NEW`** | First time the scheme is observed in the database. | Records baseline observation; `previous_deadline = null`. |
| **`UNCHANGED`** | Current deadline matches the previous observation. | Appends confirmation timestamp; maintains urgency status. |
| **`CHANGED`** | Deadline differs from last observation (extended or advanced). | Flags `was_extended = True`; highlights circular notice. |
| **`WITHDRAWN`** | Previously had a deadline, but current observation is `UNKNOWN` or removed. | Flags status for manual review without assuming scheme closure. |
| **`FETCH_FAILED`** | Network or portal outage during retrieval. | **Crucial Resilience Rule:** Preserves previous observation; never interprets fetch failure as deadline closure. |

---

## 4. Stale-Data Safeguards (>24 Hours)

If more than 24 hours elapse since the last verified portal observation, the API automatically attaches a `isStale: true` indicator and a cautionary notice:
> *"Observation was recorded more than 24 hours ago. Use GET /api/deadlines/refresh to sync fresh data."*

---

## 5. Deadlines REST API

### 5.1 GET `/api/deadlines`
Returns the latest stored observation for all 14 verified schemes with urgency and stale indicators.

### 5.2 GET `/api/deadlines/refresh`
Triggers a fresh snapshot, writes changes to `deadline_observations.json`, and returns diff metrics:
```json
{
  "total": 14,
  "newCount": 0,
  "changedCount": 2,
  "observations": [ ... ],
  "refreshedAt": "2026-10-24 21:10 IST",
  "syncStatus": "Manual refresh completed — observations recorded to persistent store"
}
```

### 5.3 GET `/api/deadlines/{scheme_id}/history`
Returns chronological observation timeline (up to 50 snapshots) for visual audit trails.
