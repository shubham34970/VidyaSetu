import datetime
from typing import List
from fastapi import APIRouter
from backend.services.tinyfish_service import STATIC_VERIFIED_SCHEMES

router = APIRouter(prefix="/api/deadlines", tags=["Deadlines"])


@router.get("")
def get_deadlines():
    results = []
    now = datetime.datetime.now()

    for s in STATIC_VERIFIED_SCHEMES:
        try:
            deadline_dt = datetime.datetime.strptime(s["applicationDeadline"], "%Y-%m-%d")
            days_left = max(0, (deadline_dt - now).days)
        except Exception:
            days_left = 30

        results.append(
            {
                "schemeId": s["id"],
                "schemeName": s["name"],
                "portalName": s["portalName"],
                "officialUrl": s["sourceUrl"],
                "closingDate": s["applicationDeadline"],
                "daysRemaining": days_left,
                "status": s["deadlineStatus"],
                "wasExtended": s.get("isExtensionAnnounced", False),
                "previousDate": s.get("previousDeadline"),
                "lastChecked": s["lastChecked"],
            }
        )

    return {
        "total": len(results),
        "observations": results,
        "syncStatus": "Observed from official portal announcements",
    }
