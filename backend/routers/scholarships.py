from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from backend.schemas.scholarship import ScholarshipScheme, ScholarshipListResponse
from backend.services.tinyfish_service import STATIC_VERIFIED_SCHEMES

router = APIRouter(prefix="/api/scholarships", tags=["Scholarships"])


@router.get("", response_model=ScholarshipListResponse)
def list_scholarships(
    domicile: Optional[str] = Query(None, description="Filter by state domicile"),
    category: Optional[str] = Query(None, description="Filter by social category (OBC, SC, ST, GENERAL, EWS)"),
    max_income: Optional[float] = Query(None, description="Filter by maximum annual family income"),
):
    schemes = [ScholarshipScheme(**s) for s in STATIC_VERIFIED_SCHEMES]

    filtered = []
    for s in schemes:
        if domicile and s.criteria.allowedDomiciles:
            if "All States & UTs" not in s.criteria.allowedDomiciles and domicile not in s.criteria.allowedDomiciles:
                continue

        if category and s.criteria.allowedCategories:
            if category not in s.criteria.allowedCategories:
                continue

        if max_income is not None and s.criteria.maxFamilyIncome is not None:
            if s.criteria.maxFamilyIncome < max_income:
                continue

        filtered.append(s)

    return ScholarshipListResponse(
        total=len(filtered),
        schemes=filtered,
        provenance="OFFICIAL_GOVERNMENT_PORTALS",
    )


@router.get("/{scheme_id}", response_model=ScholarshipScheme)
def get_scholarship(scheme_id: str):
    for s in STATIC_VERIFIED_SCHEMES:
        if s["id"] == scheme_id:
            return ScholarshipScheme(**s)

    raise HTTPException(status_code=404, detail=f"Scholarship with id '{scheme_id}' not found.")
