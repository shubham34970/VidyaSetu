from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl


class VerificationStatus(str, Enum):
    VERIFIED_OFFICIAL = "VERIFIED_OFFICIAL"
    CACHED_PORTAL = "CACHED_PORTAL"
    DEMO_DATA = "DEMO_DATA"
    UNVERIFIED = "UNVERIFIED"


class DeadlineUrgency(str, Enum):
    CRITICAL = "CRITICAL"
    UPCOMING = "UPCOMING"
    OPEN = "OPEN"
    EXPIRED = "EXPIRED"


class SchemeRuleCriteria(BaseModel):
    minMarksPercentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    maxFamilyIncome: Optional[float] = Field(None, ge=0.0)
    allowedDomiciles: Optional[List[str]] = Field(default_factory=list)
    allowedCategories: Optional[List[str]] = Field(default_factory=list)
    allowedGenders: Optional[List[str]] = Field(default_factory=list)
    allowedLevels: Optional[List[str]] = Field(default_factory=list)


class ScholarshipScheme(BaseModel):
    id: str = Field(..., description="Unique scheme identifier")
    name: str = Field(..., description="Official title of the scholarship")
    authority: str = Field(..., description="Government ministry or nodal authority")
    portalName: str = Field(..., description="Name of the official web portal")
    sourceUrl: str = Field(..., description="Direct public URL to the official scheme page")
    benefitAmountFormatted: str = Field(..., description="Human-readable benefit claim")
    benefitType: str = Field(..., description="Classification of financial aid")
    applicationDeadline: str = Field(..., description="Closing date in YYYY-MM-DD")
    deadlineStatus: DeadlineUrgency = DeadlineUrgency.OPEN
    verificationStatus: VerificationStatus = VerificationStatus.VERIFIED_OFFICIAL
    lastChecked: str = Field(..., description="Timestamp of last portal observation")
    criteria: SchemeRuleCriteria
    requiredDocuments: List[str] = Field(default_factory=list)
    description: str
    officialCircularNotice: str
    isExtensionAnnounced: Optional[bool] = False
    previousDeadline: Optional[str] = None


class ScholarshipListResponse(BaseModel):
    total: int
    schemes: List[ScholarshipScheme]
    provenance: str = "OFFICIAL_GOVERNMENT_CIRCULARS"
