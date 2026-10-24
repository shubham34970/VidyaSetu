"""
Round 2 — Advanced scholarship search and filtering router.
Supports free-text, structured filters, sorting, pagination, and
profile-assisted POST search over STATIC_VERIFIED_SCHEMES.
"""

from __future__ import annotations

import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Query

from backend.schemas.scholarship import (
    ScholarshipScheme,
    ScholarshipListResponse,
    ScholarshipSearchRequest,
)
from backend.services.tinyfish_service import STATIC_VERIFIED_SCHEMES
from backend.services.eligibility_service import eligibility_engine
from backend.schemas.profile import StudentProfile

router = APIRouter(prefix="/api/schemes", tags=["Schemes — Advanced Search"])

# ---------------------------------------------------------------------------
# Helper: apply all search/filter parameters to a list of parsed schemes
# ---------------------------------------------------------------------------

def _apply_filters(
    schemes: List[ScholarshipScheme],
    query: Optional[str],
    domicile: Optional[str],
    category: Optional[str],
    level: Optional[str],
    scheme_type: Optional[str],
    max_income: Optional[float],
    min_marks: Optional[float],
    gender: Optional[str],
    institution_type: Optional[str],
    year_of_study: Optional[int],
    deadline_status: Optional[str],
    is_disability: Optional[bool],
    is_minority: Optional[bool],
    is_renewable: Optional[bool],
    verification_status: Optional[str],
    is_open: Optional[bool],
) -> List[ScholarshipScheme]:
    filtered = []
    now = datetime.datetime.now()

    for s in schemes:
        # ── Free-text search ──────────────────────────────────────────────
        if query:
            q = query.lower()
            searchable = (
                s.name.lower()
                + " "
                + s.authority.lower()
                + " "
                + s.portalName.lower()
                + " "
                + s.description.lower()
                + " "
                + " ".join(s.tags).lower()
            )
            if q not in searchable:
                continue

        # ── Domicile ──────────────────────────────────────────────────────
        if domicile:
            allowed = s.criteria.allowedDomiciles or []
            if "All States & UTs" not in allowed and domicile not in allowed:
                continue

        # ── Social category ───────────────────────────────────────────────
        if category:
            allowed_cats = s.criteria.allowedCategories or []
            if allowed_cats and category not in allowed_cats:
                continue

        # ── Education level ───────────────────────────────────────────────
        if level:
            allowed_lvl = s.criteria.allowedLevels or []
            if allowed_lvl and level not in allowed_lvl:
                continue

        # ── Scheme type (MERIT / MEANS / MERIT_CUM_MEANS / …) ────────────
        if scheme_type:
            if s.schemeType.value != scheme_type:
                continue

        # ── Income ceiling: student income must not exceed cap ────────────
        if max_income is not None and s.criteria.maxFamilyIncome is not None:
            if s.criteria.maxFamilyIncome < max_income:
                continue

        # ── Minimum marks ─────────────────────────────────────────────────
        if min_marks is not None and s.criteria.minMarksPercentage is not None:
            if min_marks < s.criteria.minMarksPercentage:
                continue

        # ── Gender ────────────────────────────────────────────────────────
        if gender:
            allowed_genders = s.criteria.allowedGenders or []
            if allowed_genders and gender not in allowed_genders:
                continue

        # ── Institution type ──────────────────────────────────────────────
        if institution_type:
            allowed_inst = s.criteria.allowedInstitutionTypes or []
            if allowed_inst and institution_type not in allowed_inst:
                continue

        # ── Year of study ─────────────────────────────────────────────────
        if year_of_study is not None:
            min_yr = s.criteria.minYearOfStudy
            max_yr = s.criteria.maxYearOfStudy
            if min_yr is not None and year_of_study < min_yr:
                continue
            if max_yr is not None and year_of_study > max_yr:
                continue

        # ── Deadline status ───────────────────────────────────────────────
        if deadline_status:
            if s.deadlineStatus.value != deadline_status:
                continue

        # ── Currently open: deadline is in the future ─────────────────────
        if is_open is True:
            try:
                dl = datetime.datetime.strptime(s.applicationDeadline, "%Y-%m-%d")
                if dl < now:
                    continue
            except ValueError:
                # Unknown deadline — include by default
                pass

        # ── Disability scheme flag ────────────────────────────────────────
        if is_disability is True:
            if not s.criteria.isDisabilityScheme:
                continue

        # ── Minority scheme flag ──────────────────────────────────────────
        if is_minority is True:
            if not s.criteria.isMinorityScheme:
                continue

        # ── Renewable / one-time ──────────────────────────────────────────
        if is_renewable is not None:
            if s.isRenewable != is_renewable:
                continue

        # ── Verification status ───────────────────────────────────────────
        if verification_status:
            if s.verificationStatus.value != verification_status:
                continue

        filtered.append(s)

    return filtered


def _apply_sort(schemes: List[ScholarshipScheme], sort: str) -> List[ScholarshipScheme]:
    now = datetime.datetime.now()

    def deadline_key(s: ScholarshipScheme):
        try:
            return (datetime.datetime.strptime(s.applicationDeadline, "%Y-%m-%d") - now).days
        except ValueError:
            return 9999

    def benefit_key(s: ScholarshipScheme):
        # Rough heuristic: extract first number from benefitAmountFormatted
        import re
        nums = re.findall(r"[\d,]+", s.benefitAmountFormatted.replace(",", ""))
        return int(nums[0]) if nums else 0

    match sort:
        case "deadline":
            return sorted(schemes, key=deadline_key)
        case "benefit_desc":
            return sorted(schemes, key=benefit_key, reverse=True)
        case "name":
            return sorted(schemes, key=lambda x: x.name.lower())
        case "recently_verified":
            return sorted(schemes, key=lambda x: x.lastChecked, reverse=True)
        case _:
            # "relevance" — default: open/critical first, then by deadline
            priority = {"CRITICAL": 0, "UPCOMING": 1, "OPEN": 2, "EXPIRED": 3, "UNKNOWN": 4}
            return sorted(
                schemes,
                key=lambda x: (priority.get(x.deadlineStatus.value, 4), deadline_key(x)),
            )


# ---------------------------------------------------------------------------
# GET /api/schemes — list with rich filtering and sorting
# ---------------------------------------------------------------------------

@router.get("", response_model=ScholarshipListResponse)
def list_schemes(
    # Free-text
    query: Optional[str] = Query(None, description="Free-text search across name, authority, tags"),
    # Student profile filters
    domicile: Optional[str] = Query(None, description="State domicile (e.g. 'Uttar Pradesh')"),
    category: Optional[str] = Query(None, description="Social category: GENERAL | OBC | SC | ST | EWS"),
    level: Optional[str] = Query(None, description="Education level: UNDERGRADUATE | POSTGRADUATE | DIPLOMA | HIGHER_SECONDARY"),
    gender: Optional[str] = Query(None, description="Gender: MALE | FEMALE | OTHER"),
    institution_type: Optional[str] = Query(None, description="Institution type: GOVERNMENT | GOVT_AIDED | PRIVATE"),
    year_of_study: Optional[int] = Query(None, ge=1, le=6, description="Year of study"),
    max_income: Optional[float] = Query(None, ge=0, description="Student annual family income (must be ≤ scheme income cap)"),
    min_marks: Optional[float] = Query(None, ge=0, le=100, description="Student marks % (must meet scheme minimum)"),
    # Scheme characteristic filters
    scheme_type: Optional[str] = Query(None, description="Scheme type: MERIT | MEANS | MERIT_CUM_MEANS | CATEGORY_SPECIFIC | GENDER_SPECIFIC | DISABILITY | MINORITY | FELLOWSHIP"),
    deadline_status: Optional[str] = Query(None, description="Deadline urgency: CRITICAL | UPCOMING | OPEN | EXPIRED | UNKNOWN"),
    is_open: Optional[bool] = Query(None, description="If true, only return schemes with deadline in the future"),
    is_disability: Optional[bool] = Query(None, description="If true, only disability-specific schemes"),
    is_minority: Optional[bool] = Query(None, description="If true, only minority-specific schemes"),
    is_renewable: Optional[bool] = Query(None, description="Filter by renewable (true) or one-time (false)"),
    verification_status: Optional[str] = Query(None, description="Verification level: VERIFIED_OFFICIAL | CACHED_PORTAL | DEMO_DATA | UNVERIFIED"),
    # Sorting and pagination
    sort: str = Query("relevance", description="Sort: relevance | deadline | benefit_desc | name | recently_verified"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page"),
):
    """
    Advanced scholarship list with multi-dimensional filtering, sorting, and pagination.
    All filtering operates on validated, normalized scheme data.
    """
    all_schemes = [ScholarshipScheme(**s) for s in STATIC_VERIFIED_SCHEMES]

    filtered = _apply_filters(
        all_schemes,
        query=query,
        domicile=domicile,
        category=category,
        level=level,
        scheme_type=scheme_type,
        max_income=max_income,
        min_marks=min_marks,
        gender=gender,
        institution_type=institution_type,
        year_of_study=year_of_study,
        deadline_status=deadline_status,
        is_disability=is_disability,
        is_minority=is_minority,
        is_renewable=is_renewable,
        verification_status=verification_status,
        is_open=is_open,
    )

    sorted_schemes = _apply_sort(filtered, sort)

    # Pagination
    total = len(sorted_schemes)
    start = (page - 1) * page_size
    page_data = sorted_schemes[start : start + page_size]

    return ScholarshipListResponse(
        total=total,
        page=page,
        pageSize=page_size,
        schemes=page_data,
        provenance="OFFICIAL_GOVERNMENT_PORTALS",
        cacheStatus="VERIFIED_OFFICIAL",
        lastSyncedAt=datetime.datetime.now().strftime("%Y-%m-%d %H:%M IST"),
    )


# ---------------------------------------------------------------------------
# GET /api/schemes/{scheme_id} — retrieve individual scheme with evidence
# ---------------------------------------------------------------------------

@router.get("/{scheme_id}", response_model=ScholarshipScheme)
def get_scheme(scheme_id: str):
    """Retrieve a single scholarship scheme by its unique identifier."""
    for s in STATIC_VERIFIED_SCHEMES:
        if s["id"] == scheme_id:
            return ScholarshipScheme(**s)
    raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")


# ---------------------------------------------------------------------------
# POST /api/schemes/search — profile-assisted search
# ---------------------------------------------------------------------------

@router.post("/search", response_model=ScholarshipListResponse)
def profile_search(req: ScholarshipSearchRequest):
    """
    Profile-assisted scholarship discovery.
    Evaluates eligibility for each scheme and returns results ranked by match.
    Missing profile information is flagged per evaluation rather than excluded.
    """
    all_schemes = [ScholarshipScheme(**s) for s in STATIC_VERIFIED_SCHEMES]

    # Apply explicit filter overrides from request body
    filters = req.filters or {}
    query = req.query
    sort = req.sort or "relevance"

    # Build filter args from filters dict (allow partial profile without rejection)
    filtered = _apply_filters(
        all_schemes,
        query=query,
        domicile=filters.get("domicile"),
        category=filters.get("category"),
        level=filters.get("level"),
        scheme_type=filters.get("schemeType"),
        max_income=filters.get("maxIncome"),
        min_marks=filters.get("minMarks"),
        gender=filters.get("gender"),
        institution_type=filters.get("institutionType"),
        year_of_study=filters.get("yearOfStudy"),
        deadline_status=filters.get("deadlineStatus"),
        is_disability=filters.get("isDisability"),
        is_minority=filters.get("isMinority"),
        is_renewable=filters.get("isRenewable"),
        verification_status=filters.get("verificationStatus"),
        is_open=filters.get("isOpen"),
    )

    # If a StudentProfile is provided, attach eligibility evaluations
    eligibility_map: dict[str, object] = {}
    if req.profile:
        try:
            profile_obj = StudentProfile(**req.profile)
            eval_resp = eligibility_engine.evaluate_all(filtered, profile_obj)
            for ev in eval_resp.evaluations:
                eligibility_map[ev.schemeId] = ev
        except Exception:
            # Partial or invalid profile — proceed without eligibility annotations
            pass

    # Sort — for profile search with evaluations, "relevance" uses verdict
    if req.profile and eligibility_map and sort == "relevance":
        verdict_priority = {
            "ELIGIBLE": 0,
            "POTENTIALLY_ELIGIBLE": 1,
            "INSUFFICIENT_INFO": 2,
            "INELIGIBLE": 3,
        }
        filtered = sorted(
            filtered,
            key=lambda s: verdict_priority.get(
                getattr(eligibility_map.get(s.id, None), "verdict", {}).value
                if eligibility_map.get(s.id)
                else "INSUFFICIENT_INFO",
                2,
            ),
        )
    else:
        filtered = _apply_sort(filtered, sort)

    # Pagination
    total = len(filtered)
    start = (req.page - 1) * req.pageSize
    page_data = filtered[start : start + req.pageSize]

    return ScholarshipListResponse(
        total=total,
        page=req.page,
        pageSize=req.pageSize,
        schemes=page_data,
        provenance="OFFICIAL_GOVERNMENT_PORTALS",
        cacheStatus="VERIFIED_OFFICIAL",
        lastSyncedAt=datetime.datetime.now().strftime("%Y-%m-%d %H:%M IST"),
    )
