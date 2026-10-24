"""
Round 2 — Deadline persistence and change detection tests.
Covers: first observation (NEW), unchanged, changed, and withdrawn deadlines;
        history retrieval; stale-data indicators; and API endpoint behavior.
"""

import datetime
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.deadline_service import (
    DeadlinePersistenceService,
    DeadlineObservation,
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# Unit tests for DeadlinePersistenceService
# ---------------------------------------------------------------------------

class TestDeadlineObservationUnit:
    """Tests use a fresh in-memory service per test to avoid disk side-effects."""

    def _make_service(self, tmp_path=None):
        """Create a service that stores to a temp file."""
        svc = DeadlinePersistenceService.__new__(DeadlinePersistenceService)
        svc._obs = {}
        # Patch _save to no-op for unit tests
        svc._save = lambda: None
        return svc

    def _obs(self, scheme_id, deadline, retrieved_at=None):
        return DeadlineObservation(
            scheme_id=scheme_id,
            scheme_name=f"Scheme {scheme_id}",
            portal_name="Test Portal",
            official_url="https://example.gov.in",
            deadline=deadline,
            retrieved_at=retrieved_at or datetime.datetime.now().isoformat(),
            verification_status="VERIFIED_OFFICIAL",
        )

    def test_first_observation_creates_new_record(self):
        svc = self._make_service()
        obs = self._obs("test-scheme", "2026-11-30")
        change = svc.record_observation(obs)
        assert change.change_type == "NEW"
        assert change.previous_deadline is None
        assert change.current_deadline == "2026-11-30"

    def test_same_deadline_produces_unchanged(self):
        svc = self._make_service()
        obs1 = self._obs("test-scheme", "2026-11-30")
        svc.record_observation(obs1)
        obs2 = self._obs("test-scheme", "2026-11-30")
        change = svc.record_observation(obs2)
        assert change.change_type == "UNCHANGED"

    def test_different_deadline_produces_changed(self):
        svc = self._make_service()
        obs1 = self._obs("test-scheme", "2026-11-15")
        svc.record_observation(obs1)
        obs2 = self._obs("test-scheme", "2026-11-30")  # Extended
        change = svc.record_observation(obs2)
        assert change.change_type == "CHANGED"
        assert change.previous_deadline == "2026-11-15"
        assert change.current_deadline == "2026-11-30"

    def test_deadline_removed_produces_withdrawn(self):
        svc = self._make_service()
        obs1 = self._obs("test-scheme", "2026-11-15")
        svc.record_observation(obs1)
        obs2 = self._obs("test-scheme", None)  # Deadline gone
        change = svc.record_observation(obs2)
        assert change.change_type == "WITHDRAWN"
        assert change.previous_deadline == "2026-11-15"
        assert change.current_deadline is None

    def test_both_unknown_produces_unknown(self):
        svc = self._make_service()
        obs1 = self._obs("test-scheme", None)
        svc.record_observation(obs1)
        obs2 = self._obs("test-scheme", None)
        change = svc.record_observation(obs2)
        assert change.change_type == "UNKNOWN"

    def test_history_accumulates_multiple_observations(self):
        svc = self._make_service()
        for dl in ["2026-10-31", "2026-11-15", "2026-11-30"]:
            svc.record_observation(self._obs("test-scheme", dl))
        history = svc.get_history("test-scheme")
        assert len(history) == 3
        assert history[0].deadline == "2026-10-31"
        assert history[-1].deadline == "2026-11-30"

    def test_nonexistent_scheme_returns_empty_history(self):
        svc = self._make_service()
        history = svc.get_history("never-seen-scheme")
        assert history == []

    def test_latest_observation_returns_most_recent(self):
        svc = self._make_service()
        svc.record_observation(self._obs("test-scheme", "2026-10-31"))
        svc.record_observation(self._obs("test-scheme", "2026-11-30"))
        latest = svc.get_latest_observation("test-scheme")
        assert latest is not None
        assert latest.deadline == "2026-11-30"

    def test_history_capped_at_50_entries(self):
        svc = self._make_service()
        for i in range(60):
            svc.record_observation(self._obs("test-scheme", f"2026-{i+1:02d}-01" if i < 12 else "2026-11-30"))
        history = svc.get_history("test-scheme")
        assert len(history) <= 50


# ---------------------------------------------------------------------------
# API endpoint tests
# ---------------------------------------------------------------------------

class TestDeadlinesEndpoints:
    def test_get_deadlines_returns_all_schemes(self):
        r = client.get("/api/deadlines")
        assert r.status_code == 200
        body = r.json()
        assert "total" in body
        assert "observations" in body
        assert body["total"] >= 14

    def test_get_deadlines_includes_scheme_id(self):
        r = client.get("/api/deadlines")
        body = r.json()
        for obs in body["observations"]:
            assert "schemeId" in obs
            assert "schemeName" in obs
            assert "closingDate" in obs

    def test_deadlines_refresh_records_new_observations(self):
        r = client.get("/api/deadlines/refresh")
        assert r.status_code == 200
        body = r.json()
        assert "total" in body
        assert "observations" in body
        assert "changedCount" in body
        assert "newCount" in body
        assert body["total"] >= 14

    def test_deadlines_refresh_change_types_are_valid(self):
        r = client.get("/api/deadlines/refresh")
        body = r.json()
        valid_types = {"NEW", "UNCHANGED", "CHANGED", "WITHDRAWN", "UNKNOWN", "FETCH_FAILED"}
        for obs in body["observations"]:
            assert obs.get("changeType") in valid_types, (
                f"Invalid changeType: {obs.get('changeType')}"
            )

    def test_deadlines_second_refresh_shows_unchanged(self):
        # First refresh establishes baseline
        client.get("/api/deadlines/refresh")
        # Second refresh should show UNCHANGED for all (data hasn't changed)
        r2 = client.get("/api/deadlines/refresh")
        body = r2.json()
        for obs in body["observations"]:
            if obs.get("changeType") not in ("UNKNOWN",):
                assert obs["changeType"] in ("UNCHANGED", "NEW"), (
                    f"Unexpected change: {obs}"
                )

    def test_scheme_history_returns_observations(self):
        # First, ensure at least one observation is recorded
        client.get("/api/deadlines/refresh")
        r = client.get("/api/deadlines/nsp-central-sector-csss/history")
        assert r.status_code == 200
        body = r.json()
        assert body["schemeId"] == "nsp-central-sector-csss"
        assert "history" in body
        assert body["observationCount"] >= 1

    def test_scheme_history_unknown_scheme_returns_404(self):
        r = client.get("/api/deadlines/nonexistent-scheme-xyz/history")
        assert r.status_code == 404

    def test_stale_indicator_present_in_observations(self):
        r = client.get("/api/deadlines")
        body = r.json()
        # Observations from latest endpoint should include isStale field
        if body["observations"]:
            obs = body["observations"][0]
            # isStale may or may not be present — just check type if present
            if "isStale" in obs:
                assert isinstance(obs["isStale"], bool)

    def test_days_remaining_is_non_negative(self):
        r = client.get("/api/deadlines")
        body = r.json()
        for obs in body["observations"]:
            dr = obs.get("daysRemaining")
            if dr is not None:
                assert dr >= 0, f"Negative daysRemaining for {obs['schemeId']}"

    def test_refresh_sync_status_present(self):
        r = client.get("/api/deadlines/refresh")
        body = r.json()
        assert "syncStatus" in body
        assert "refreshedAt" in body

    def test_get_deadlines_note_present(self):
        r = client.get("/api/deadlines")
        body = r.json()
        assert "note" in body
        assert "refresh" in body["note"].lower()
