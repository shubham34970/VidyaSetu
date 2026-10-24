"""
Round 2 — Deadlines router with persistence, change detection, and history.
"""

import datetime
from typing import Optional
from fastapi import APIRouter, Path as PathParam

from backend.services.deadline_service import deadline_service
from backend.services.tinyfish_service import STATIC_VERIFIED_SCHEMES

router = APIRouter(prefix="/api/deadlines", tags=["Deadlines"])


@router.get("")
def get_deadlines():
    """
    Return the latest stored observation for every scheme.
    Includes stale-data warnings when observations are older than 24 hours.
    Does NOT trigger a new observation — use /refresh for that.
    """
    observations = deadline_service.get_all_latest()
    return {
        "total": len(observations),
        "observations": observations,
        "syncStatus": "Read from persisted observation store (manual refresh available)",
        "note": (
            "Stale indicators appear when more than 24 hours have elapsed since the "
            "last manual refresh. Use GET /api/deadlines/refresh to record a new observation."
        ),
    }


@router.get("/refresh")
def refresh_deadlines():
    """
    Record a fresh observation snapshot for all schemes and return a change diff.
    Change types: NEW | UNCHANGED | CHANGED | WITHDRAWN | UNKNOWN.
    A FETCH_FAILED status is never generated — no live fetch is performed here;
    the authoritative data is the validated STATIC_VERIFIED_SCHEMES store.
    """
    observations = deadline_service.snapshot_all_schemes()
    changed_count = sum(1 for o in observations if o["changeType"] == "CHANGED")
    new_count = sum(1 for o in observations if o["changeType"] == "NEW")
    return {
        "total": len(observations),
        "newCount": new_count,
        "changedCount": changed_count,
        "observations": observations,
        "refreshedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        "syncStatus": "Manual refresh completed — observations recorded to persistent store",
    }


@router.get("/{scheme_id}/history")
def get_scheme_deadline_history(scheme_id: str = PathParam(..., description="Scheme ID")):
    """
    Return the full observation history for a single scholarship scheme.
    History is sorted oldest-first and capped at 50 entries per scheme.
    """
    history = deadline_service.get_scheme_history(scheme_id)
    if not history:
        # Scheme exists but has never been observed — return empty history
        exists = any(s["id"] == scheme_id for s in STATIC_VERIFIED_SCHEMES)
        if not exists:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")
    return {
        "schemeId": scheme_id,
        "observationCount": len(history),
        "history": history,
    }
