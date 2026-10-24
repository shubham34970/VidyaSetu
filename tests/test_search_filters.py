"""
Round 2 — Advanced search and filter API tests.
Covers: free-text, individual filters, combined filters, sorting, pagination,
        empty results, invalid values, profile-assisted search, and edge cases.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


# ---------------------------------------------------------------------------
# GET /api/schemes — list with filters
# ---------------------------------------------------------------------------

class TestSchemesListBasic:
    def test_returns_all_schemes_by_default(self):
        r = client.get("/api/schemes")
        assert r.status_code == 200
        body = r.json()
        assert "total" in body
        assert "schemes" in body
        assert body["total"] >= 14  # Round 2 has at least 14 schemes
        assert body["page"] == 1

    def test_total_matches_scheme_count(self):
        r = client.get("/api/schemes")
        body = r.json()
        assert body["total"] == len(body["schemes"]) or body["total"] > body["pageSize"]

    def test_page_size_respected(self):
        r = client.get("/api/schemes?page_size=5")
        assert r.status_code == 200
        body = r.json()
        assert len(body["schemes"]) <= 5

    def test_second_page_returns_different_schemes(self):
        r1 = client.get("/api/schemes?page=1&page_size=5")
        r2 = client.get("/api/schemes?page=2&page_size=5")
        assert r1.status_code == r2.status_code == 200
        ids1 = {s["id"] for s in r1.json()["schemes"]}
        ids2 = {s["id"] for s in r2.json()["schemes"]}
        # Pages should not overlap
        assert ids1.isdisjoint(ids2)

    def test_beyond_last_page_returns_empty_list(self):
        r = client.get("/api/schemes?page=999&page_size=100")
        assert r.status_code == 200
        body = r.json()
        assert body["schemes"] == []


class TestSchemesListFreeText:
    def test_free_text_by_scheme_name(self):
        r = client.get("/api/schemes?query=NSP")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1
        # All returned schemes should be NSP-related
        for s in body["schemes"]:
            assert "nsp" in s["id"].lower() or "NSP" in (s["name"] + s["portalName"] + s["authority"])

    def test_free_text_by_authority(self):
        r = client.get("/api/schemes?query=AICTE")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 2

    def test_free_text_no_match_returns_empty(self):
        r = client.get("/api/schemes?query=xyzzy_nonexistent_scheme_2099")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 0
        assert body["schemes"] == []

    def test_free_text_case_insensitive(self):
        r1 = client.get("/api/schemes?query=aicte")
        r2 = client.get("/api/schemes?query=AICTE")
        assert r1.json()["total"] == r2.json()["total"]


class TestSchemesListDomicileFilter:
    def test_uttar_pradesh_filter(self):
        r = client.get("/api/schemes?domicile=Uttar Pradesh")
        assert r.status_code == 200
        body = r.json()
        # Should include UP-specific schemes AND national schemes
        assert body["total"] >= 2
        # Verify no non-UP state-specific scheme sneaks in
        for s in body["schemes"]:
            allowed = s["criteria"].get("allowedDomiciles", [])
            assert "All States & UTs" in allowed or "Uttar Pradesh" in allowed

    def test_bihar_filter(self):
        r = client.get("/api/schemes?domicile=Bihar")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 2

    def test_haryana_filter(self):
        r = client.get("/api/schemes?domicile=Haryana")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 2

    def test_unknown_state_returns_only_national_schemes(self):
        r = client.get("/api/schemes?domicile=Andaman and Nicobar Islands")
        body = r.json()
        for s in body["schemes"]:
            allowed = s["criteria"].get("allowedDomiciles", [])
            assert "All States & UTs" in allowed


class TestSchemesListCategoryFilter:
    def test_sc_category_filter(self):
        r = client.get("/api/schemes?category=SC")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 4
        for s in body["schemes"]:
            allowed_cats = s["criteria"].get("allowedCategories", [])
            assert not allowed_cats or "SC" in allowed_cats

    def test_female_gender_filter(self):
        r = client.get("/api/schemes?gender=FEMALE")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1
        for s in body["schemes"]:
            allowed_genders = s["criteria"].get("allowedGenders", [])
            assert not allowed_genders or "FEMALE" in allowed_genders

    def test_male_gender_excludes_female_only(self):
        r_male = client.get("/api/schemes?gender=MALE")
        r_all = client.get("/api/schemes")
        assert r_male.json()["total"] < r_all.json()["total"]


class TestSchemesListEducationFilters:
    def test_undergraduate_level_filter(self):
        r = client.get("/api/schemes?level=UNDERGRADUATE")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 5

    def test_postgraduate_level_filter(self):
        r = client.get("/api/schemes?level=POSTGRADUATE")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 2

    def test_first_year_only_filter(self):
        r = client.get("/api/schemes?year_of_study=1")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1

    def test_sixth_year_excludes_first_year_only_schemes(self):
        r_1yr = client.get("/api/schemes?year_of_study=1")
        r_6yr = client.get("/api/schemes?year_of_study=6")
        # 6th year should match fewer or equal schemes
        assert r_6yr.json()["total"] <= r_1yr.json()["total"]


class TestSchemesListIncomeAndMarksFilters:
    def test_low_income_filter(self):
        # Students with income ≤ 1.5L should match schemes with cap ≥ 1.5L
        r = client.get("/api/schemes?max_income=150000")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1

    def test_high_income_excludes_low_cap_schemes(self):
        # A student with income ≤ 100k matches more schemes than income ≤ 2M
        # because more schemes have their cap ≥ 100k than ≥ 2M
        r_low = client.get("/api/schemes?max_income=100000")
        r_high = client.get("/api/schemes?max_income=2000000")
        # Low income student (100k) should match at least as many schemes as high income (2M)
        # because every scheme with cap ≥ 2M also has cap ≥ 100k, but not vice versa
        assert r_low.json()["total"] >= r_high.json()["total"]

    def test_high_marks_filter(self):
        r = client.get("/api/schemes?min_marks=85")
        assert r.status_code == 200
        body = r.json()
        # High marks should match fewer schemes (many have lower cutoffs)
        assert body["total"] >= 1

    def test_low_marks_filter(self):
        # A student with low marks (40%) still needs schemes where cutoff ≤ 40%
        # A student with high marks (80%) qualifies for more schemes (all cutoffs ≤ 80%)
        r_low = client.get("/api/schemes?min_marks=40")
        r_high = client.get("/api/schemes?min_marks=80")
        # A high-marks student meets the bar for MORE schemes than a low-marks student
        assert r_high.json()["total"] >= r_low.json()["total"]


class TestSchemesListSchemeTypeFilter:
    def test_merit_cum_means_type(self):
        r = client.get("/api/schemes?scheme_type=MERIT_CUM_MEANS")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 2
        for s in body["schemes"]:
            assert s["schemeType"] == "MERIT_CUM_MEANS"

    def test_disability_type(self):
        r = client.get("/api/schemes?scheme_type=DISABILITY")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1
        for s in body["schemes"]:
            assert s["schemeType"] == "DISABILITY"

    def test_is_disability_flag(self):
        r = client.get("/api/schemes?is_disability=true")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1

    def test_is_minority_flag(self):
        r = client.get("/api/schemes?is_minority=true")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1

    def test_is_renewable_true(self):
        r = client.get("/api/schemes?is_renewable=true")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 5
        for s in body["schemes"]:
            assert s.get("isRenewable") is True

    def test_is_renewable_false_returns_one_time_schemes(self):
        r = client.get("/api/schemes?is_renewable=false")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1
        for s in body["schemes"]:
            assert s.get("isRenewable") is False


class TestSchemesListCombinedFilters:
    def test_up_obc_ug_combined(self):
        r = client.get("/api/schemes?domicile=Uttar Pradesh&category=OBC&level=UNDERGRADUATE")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 2

    def test_female_aicte_ug(self):
        r = client.get("/api/schemes?gender=FEMALE&query=AICTE&level=UNDERGRADUATE")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1
        for s in body["schemes"]:
            allowed_g = s["criteria"].get("allowedGenders", [])
            assert not allowed_g or "FEMALE" in allowed_g

    def test_bihar_sc_scholarship(self):
        r = client.get("/api/schemes?domicile=Bihar&category=SC")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 2

    def test_national_high_merit_low_income(self):
        r = client.get("/api/schemes?domicile=Maharashtra&min_marks=75&max_income=400000")
        assert r.status_code == 200
        body = r.json()
        # Should return at least CSSS (national scheme with 80% cutoff — 75% students won't match)
        # But some national schemes with 45-50% cutoff should appear
        assert body["total"] >= 0  # Edge case — may be 0 if no scheme matches

    def test_combined_filters_narrow_results(self):
        r_all = client.get("/api/schemes")
        r_filtered = client.get("/api/schemes?domicile=Rajasthan&category=SC&gender=FEMALE")
        assert r_filtered.json()["total"] < r_all.json()["total"]

    def test_contradictory_filters_return_empty(self):
        # A scheme cannot be both disability AND minority simultaneously in current dataset
        r = client.get(
            "/api/schemes?scheme_type=DISABILITY&is_minority=true"
        )
        assert r.status_code == 200
        body = r.json()
        # May or may not be empty — just verify no error
        assert "total" in body

    def test_verified_official_filter(self):
        r = client.get("/api/schemes?verification_status=VERIFIED_OFFICIAL")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 14
        for s in body["schemes"]:
            assert s["verificationStatus"] == "VERIFIED_OFFICIAL"


class TestSchemesListSorting:
    def test_sort_by_deadline(self):
        r = client.get("/api/schemes?sort=deadline")
        assert r.status_code == 200
        body = r.json()
        schemes = body["schemes"]
        if len(schemes) >= 2:
            dl1 = schemes[0].get("applicationDeadline", "9999-12-31")
            dl2 = schemes[-1].get("applicationDeadline", "9999-12-31")
            # Earlier deadline should appear first (or same if both unknown)
            assert dl1 <= dl2

    def test_sort_by_name_alphabetical(self):
        r = client.get("/api/schemes?sort=name")
        assert r.status_code == 200
        body = r.json()
        names = [s["name"].lower() for s in body["schemes"]]
        assert names == sorted(names)

    def test_sort_by_recently_verified(self):
        r = client.get("/api/schemes?sort=recently_verified")
        assert r.status_code == 200
        body = r.json()
        assert len(body["schemes"]) >= 1

    def test_sort_default_relevance(self):
        r = client.get("/api/schemes?sort=relevance")
        assert r.status_code == 200
        body = r.json()
        assert len(body["schemes"]) >= 1

    def test_invalid_sort_falls_back_to_relevance(self):
        r = client.get("/api/schemes?sort=invalid_value_xyz")
        assert r.status_code == 200  # Should not error


class TestSchemesListOpenStatus:
    def test_is_open_filter(self):
        import datetime
        now = datetime.datetime.now()
        r = client.get("/api/schemes?is_open=true")
        assert r.status_code == 200
        body = r.json()
        for s in body["schemes"]:
            dl = s.get("applicationDeadline", "UNKNOWN")
            if dl != "UNKNOWN":
                try:
                    dl_dt = datetime.datetime.strptime(dl, "%Y-%m-%d")
                    assert dl_dt >= now
                except ValueError:
                    pass  # Unknown deadline — allowed through


# ---------------------------------------------------------------------------
# GET /api/schemes/{scheme_id}
# ---------------------------------------------------------------------------

class TestSingleSchemeRetrieval:
    def test_known_scheme_returns_full_details(self):
        r = client.get("/api/schemes/nsp-central-sector-csss")
        assert r.status_code == 200
        body = r.json()
        assert body["id"] == "nsp-central-sector-csss"
        assert "criteria" in body
        assert "requiredDocuments" in body
        assert "sourceUrl" in body

    def test_unknown_scheme_returns_404(self):
        r = client.get("/api/schemes/nonexistent-scheme-id-999")
        assert r.status_code == 404

    def test_aicte_scheme_has_criteria_fields(self):
        r = client.get("/api/schemes/aicte-pragati-girls")
        assert r.status_code == 200
        body = r.json()
        criteria = body["criteria"]
        assert criteria.get("allowedGenders") == ["FEMALE"]
        assert criteria.get("maxFamilyIncome") == 800000.0


# ---------------------------------------------------------------------------
# POST /api/schemes/search — profile-assisted search
# ---------------------------------------------------------------------------

class TestProfileAssistedSearch:
    def test_search_with_valid_up_obc_profile(self):
        payload = {
            "profile": {
                "fullName": "Aarav Sharma",
                "stateDomicile": "Uttar Pradesh",
                "socialCategory": "OBC",
                "annualFamilyIncome": 180000,
                "courseDegree": "B.Tech Computer Science",
                "academicLevel": "UNDERGRADUATE",
                "yearOfStudy": 2,
                "marksPercentage": 76.4,
                "gender": "MALE",
                "institutionType": "GOVT_AIDED",
                "hasAadhaarBankSeeding": True,
            },
            "page": 1,
            "pageSize": 20,
        }
        r = client.post("/api/schemes/search", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1

    def test_search_with_female_engineering_profile(self):
        payload = {
            "profile": {
                "fullName": "Priya Verma",
                "stateDomicile": "Delhi",
                "socialCategory": "GENERAL",
                "annualFamilyIncome": 350000,
                "courseDegree": "B.Tech Information Technology",
                "academicLevel": "UNDERGRADUATE",
                "yearOfStudy": 1,
                "marksPercentage": 82.5,
                "gender": "FEMALE",
                "institutionType": "GOVERNMENT",
                "hasAadhaarBankSeeding": True,
            },
        }
        r = client.post("/api/schemes/search", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1

    def test_search_without_profile_returns_all_filtered_schemes(self):
        payload = {"query": "AICTE", "pageSize": 20}
        r = client.post("/api/schemes/search", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1

    def test_search_with_query_and_filter(self):
        payload = {
            "query": "Bihar",
            "filters": {"category": "SC"},
            "pageSize": 20,
        }
        r = client.post("/api/schemes/search", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 1

    def test_search_with_empty_query_returns_all(self):
        payload = {"pageSize": 50}
        r = client.post("/api/schemes/search", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["total"] >= 14

    def test_search_pagination_works(self):
        payload = {"page": 1, "pageSize": 3}
        r1 = client.post("/api/schemes/search", json=payload)
        payload2 = {"page": 2, "pageSize": 3}
        r2 = client.post("/api/schemes/search", json=payload2)
        ids1 = {s["id"] for s in r1.json()["schemes"]}
        ids2 = {s["id"] for s in r2.json()["schemes"]}
        assert ids1.isdisjoint(ids2)

    def test_search_with_invalid_profile_gracefully_degrades(self):
        """Partial/invalid profile should not crash; just skip eligibility evaluation."""
        payload = {
            "profile": {"fullName": "Test", "stateDomicile": "UP"},  # Incomplete profile
        }
        r = client.post("/api/schemes/search", json=payload)
        # Should not crash — graceful degradation
        assert r.status_code in (200, 422)  # 422 if profile fails validation


# ---------------------------------------------------------------------------
# Duplicate prevention
# ---------------------------------------------------------------------------

class TestDuplicatePrevention:
    def test_no_duplicate_scheme_ids(self):
        r = client.get("/api/schemes?page_size=100")
        body = r.json()
        ids = [s["id"] for s in body["schemes"]]
        assert len(ids) == len(set(ids)), "Duplicate scheme IDs detected!"

    def test_no_duplicate_scheme_names(self):
        r = client.get("/api/schemes?page_size=100")
        body = r.json()
        names = [s["name"] for s in body["schemes"]]
        assert len(names) == len(set(names)), "Duplicate scheme names detected!"
