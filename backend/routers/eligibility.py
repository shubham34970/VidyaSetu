from fastapi import APIRouter
from backend.schemas.eligibility import EligibilityMatchRequest, EligibilityMatchResponse
from backend.schemas.scholarship import ScholarshipScheme
from backend.services.tinyfish_service import STATIC_VERIFIED_SCHEMES
from backend.services.eligibility_service import eligibility_engine

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility"])


@router.post("/match", response_model=EligibilityMatchResponse)
def match_student_eligibility(req: EligibilityMatchRequest):
    all_schemes = [ScholarshipScheme(**s) for s in STATIC_VERIFIED_SCHEMES]

    if req.scheme_ids:
        target_schemes = [s for s in all_schemes if s.id in req.scheme_ids]
    else:
        target_schemes = all_schemes

    return eligibility_engine.evaluate_all(target_schemes, req.profile)
