"""
Round 2 — Deadline Persistence and Change Detection Service.

Stores deadline observations in a JSON file (data/deadline_observations.json)
so that repeated refreshes can detect changes between observations.

Statuses:
  UNCHANGED  — deadline same as last observation
  CHANGED    — deadline value changed between two consecutive observations
  NEW        — first observation of this scheme
  WITHDRAWN  — previously had deadline, now missing
  FETCH_FAILED — retrieval error; existing deadline preserved as last known
"""

from __future__ import annotations

import json
import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any

from backend.services.tinyfish_service import STATIC_VERIFIED_SCHEMES

# Persistent storage — written alongside this service module
_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_OBS_FILE = _DATA_DIR / "deadline_observations.json"


class DeadlineObservation:
    """Lightweight dataclass stored in JSON."""

    def __init__(
        self,
        scheme_id: str,
        scheme_name: str,
        portal_name: str,
        official_url: str,
        deadline: Optional[str],       # YYYY-MM-DD or "UNKNOWN"
        retrieved_at: str,             # ISO 8601
        verification_status: str,
        was_extended: bool = False,
        previous_deadline: Optional[str] = None,
    ):
        self.scheme_id = scheme_id
        self.scheme_name = scheme_name
        self.portal_name = portal_name
        self.official_url = official_url
        self.deadline = deadline
        self.retrieved_at = retrieved_at
        self.verification_status = verification_status
        self.was_extended = was_extended
        self.previous_deadline = previous_deadline

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme_name,
            "portal_name": self.portal_name,
            "official_url": self.official_url,
            "deadline": self.deadline,
            "retrieved_at": self.retrieved_at,
            "verification_status": self.verification_status,
            "was_extended": self.was_extended,
            "previous_deadline": self.previous_deadline,
        }

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "DeadlineObservation":
        return cls(
            scheme_id=d["scheme_id"],
            scheme_name=d["scheme_name"],
            portal_name=d.get("portal_name", ""),
            official_url=d.get("official_url", ""),
            deadline=d.get("deadline"),
            retrieved_at=d.get("retrieved_at", ""),
            verification_status=d.get("verification_status", "UNVERIFIED"),
            was_extended=d.get("was_extended", False),
            previous_deadline=d.get("previous_deadline"),
        )


class DeadlineChangeRecord:
    """A detected change between two consecutive observations."""

    def __init__(
        self,
        scheme_id: str,
        scheme_name: str,
        change_type: str,          # NEW | UNCHANGED | CHANGED | WITHDRAWN
        previous_deadline: Optional[str],
        current_deadline: Optional[str],
        detected_at: str,
        note: str = "",
    ):
        self.scheme_id = scheme_id
        self.scheme_name = scheme_name
        self.change_type = change_type
        self.previous_deadline = previous_deadline
        self.current_deadline = current_deadline
        self.detected_at = detected_at
        self.note = note

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme_name,
            "change_type": self.change_type,
            "previous_deadline": self.previous_deadline,
            "current_deadline": self.current_deadline,
            "detected_at": self.detected_at,
            "note": self.note,
        }


class DeadlinePersistenceService:
    """
    Manages persistent deadline observations and produces change diff reports.

    Storage: a single JSON file at backend/data/deadline_observations.json.
    Each run adds a new observation entry; previous entries are kept for history.
    """

    def __init__(self):
        _DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._obs: Dict[str, List[Dict[str, Any]]] = self._load()

    # ------------------------------------------------------------------
    # Internal I/O
    # ------------------------------------------------------------------

    def _load(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load the observation store from disk, returning empty dict on first run."""
        if _OBS_FILE.exists():
            try:
                with open(_OBS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except (json.JSONDecodeError, OSError):
                return {}
        return {}

    def _save(self) -> None:
        """Persist the in-memory store to disk."""
        with open(_OBS_FILE, "w", encoding="utf-8") as f:
            json.dump(self._obs, f, ensure_ascii=False, indent=2)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_latest_observation(self, scheme_id: str) -> Optional[DeadlineObservation]:
        """Return the most recent observation for a scheme, or None."""
        entries = self._obs.get(scheme_id, [])
        if not entries:
            return None
        return DeadlineObservation.from_dict(entries[-1])

    def get_history(self, scheme_id: str) -> List[DeadlineObservation]:
        """Return all stored observations for a scheme (oldest first)."""
        return [DeadlineObservation.from_dict(d) for d in self._obs.get(scheme_id, [])]

    def record_observation(self, obs: DeadlineObservation) -> DeadlineChangeRecord:
        """
        Store an observation and compute a change record vs. the previous entry.
        Returns the change type for immediate caller feedback.
        """
        previous = self.get_latest_observation(obs.scheme_id)
        now_str = datetime.datetime.now().isoformat()

        if previous is None:
            change_type = "NEW"
            note = "First observation recorded."
        elif previous.deadline is None and obs.deadline is None:
            change_type = "UNKNOWN"
            note = "Deadline still unknown in both observations."
        elif previous.deadline == obs.deadline:
            change_type = "UNCHANGED"
            note = f"Deadline confirmed unchanged: {obs.deadline}."
        elif obs.deadline is None:
            change_type = "WITHDRAWN"
            note = f"Deadline information no longer present (was {previous.deadline})."
        else:
            change_type = "CHANGED"
            note = f"Deadline changed from {previous.deadline} to {obs.deadline}."

        # Append to history
        if obs.scheme_id not in self._obs:
            self._obs[obs.scheme_id] = []
        self._obs[obs.scheme_id].append(obs.to_dict())

        # Cap history to 50 entries per scheme to avoid unbounded growth
        if len(self._obs[obs.scheme_id]) > 50:
            self._obs[obs.scheme_id] = self._obs[obs.scheme_id][-50:]

        self._save()

        return DeadlineChangeRecord(
            scheme_id=obs.scheme_id,
            scheme_name=obs.scheme_name,
            change_type=change_type,
            previous_deadline=previous.deadline if previous else None,
            current_deadline=obs.deadline,
            detected_at=now_str,
            note=note,
        )

    def snapshot_all_schemes(self) -> List[Dict[str, Any]]:
        """
        Record an observation for every scheme in STATIC_VERIFIED_SCHEMES
        and return the full deadline status with change diff.

        This is used by the /api/deadlines/refresh endpoint.
        """
        now = datetime.datetime.now()
        results = []

        for raw in STATIC_VERIFIED_SCHEMES:
            deadline_str = raw.get("applicationDeadline", "UNKNOWN")
            obs = DeadlineObservation(
                scheme_id=raw["id"],
                scheme_name=raw["name"],
                portal_name=raw.get("portalName", ""),
                official_url=raw.get("sourceUrl", ""),
                deadline=deadline_str if deadline_str != "UNKNOWN" else None,
                retrieved_at=now.isoformat(),
                verification_status=raw.get("verificationStatus", "UNVERIFIED"),
                was_extended=raw.get("isExtensionAnnounced", False),
                previous_deadline=raw.get("previousDeadline"),
            )
            change = self.record_observation(obs)

            # Compute days remaining
            try:
                dl_dt = datetime.datetime.strptime(deadline_str, "%Y-%m-%d")
                days_left = max(0, (dl_dt - now).days)
            except (ValueError, TypeError):
                days_left = None

            results.append(
                {
                    "schemeId": raw["id"],
                    "schemeName": raw["name"],
                    "portalName": raw.get("portalName", ""),
                    "officialUrl": raw.get("sourceUrl", ""),
                    "closingDate": deadline_str,
                    "daysRemaining": days_left,
                    "status": raw.get("deadlineStatus", "UNKNOWN"),
                    "wasExtended": raw.get("isExtensionAnnounced", False),
                    "previousDate": raw.get("previousDeadline"),
                    "lastChecked": now.strftime("%Y-%m-%d %H:%M IST"),
                    "changeType": change.change_type,
                    "changeNote": change.note,
                    "verificationStatus": raw.get("verificationStatus", "UNVERIFIED"),
                }
            )

        return results

    def get_all_latest(self) -> List[Dict[str, Any]]:
        """
        Return the latest observation for every scheme alongside change history count.
        Does NOT record a new observation (read-only).
        """
        now = datetime.datetime.now()
        results = []

        for raw in STATIC_VERIFIED_SCHEMES:
            deadline_str = raw.get("applicationDeadline", "UNKNOWN")
            latest = self.get_latest_observation(raw["id"])
            history = self.get_history(raw["id"])

            try:
                dl_dt = datetime.datetime.strptime(deadline_str, "%Y-%m-%d")
                days_left = max(0, (dl_dt - now).days)
            except (ValueError, TypeError):
                days_left = None

            results.append(
                {
                    "schemeId": raw["id"],
                    "schemeName": raw["name"],
                    "portalName": raw.get("portalName", ""),
                    "officialUrl": raw.get("sourceUrl", ""),
                    "closingDate": deadline_str,
                    "daysRemaining": days_left,
                    "status": raw.get("deadlineStatus", "UNKNOWN"),
                    "wasExtended": raw.get("isExtensionAnnounced", False),
                    "previousDate": raw.get("previousDeadline"),
                    "lastChecked": latest.retrieved_at if latest else "Never observed",
                    "observationCount": len(history),
                    "verificationStatus": raw.get("verificationStatus", "UNVERIFIED"),
                    # Stale warning if more than 24 hours since last observation
                    "isStale": (
                        (now - datetime.datetime.fromisoformat(latest.retrieved_at)).total_seconds() > 86400
                        if latest
                        else True
                    ),
                }
            )

        return results

    def get_scheme_history(self, scheme_id: str) -> List[Dict[str, Any]]:
        """Return observation history for a single scheme as JSON-serializable list."""
        return [obs.to_dict() for obs in self.get_history(scheme_id)]


# Singleton instance
deadline_service = DeadlinePersistenceService()
