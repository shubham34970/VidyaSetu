from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from backend.schemas.profile import StudentProfile
from backend.schemas.scholarship import ScholarshipScheme


class EligibilityVerdict(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    POTENTIALLY_ELIGIBLE = "POTENTIALLY_ELIGIBLE"
    INELIGIBLE = "INELIGIBLE"
    INSUFFICIENT_INFO = "INSUFFICIENT_INFO"


class EligibilityEvaluation(BaseModel):
    schemeId: str
    schemeName: str
    verdict: EligibilityVerdict
    matchScore: int = Field(..., ge=0, le=100)
    satisfiedConditions: List[str]
    conflictingConditions: List[str]
    missingConditions: List[str]
    sourceCitations: List[str]


class EligibilityMatchRequest(BaseModel):
    profile: StudentProfile
    scheme_ids: Optional[List[str]] = None


class EligibilityMatchResponse(BaseModel):
    totalEvaluated: int
    eligibleCount: int
    potentiallyEligibleCount: int
    ineligibleCount: int
    evaluations: List[EligibilityEvaluation]
