from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


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
    UNKNOWN = "UNKNOWN"


class SchemeType(str, Enum):
    MERIT = "MERIT"
    MEANS = "MEANS"
    MERIT_CUM_MEANS = "MERIT_CUM_MEANS"
    CATEGORY_SPECIFIC = "CATEGORY_SPECIFIC"
    GENDER_SPECIFIC = "GENDER_SPECIFIC"
    DISABILITY = "DISABILITY"
    MINORITY = "MINORITY"
    FELLOWSHIP = "FELLOWSHIP"


class SchemeRuleCriteria(BaseModel):
    minMarksPercentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    maxFamilyIncome: Optional[float] = Field(None, ge=0.0)
    allowedDomiciles: Optional[List[str]] = Field(default_factory=list)
    allowedCategories: Optional[List[str]] = Field(default_factory=list)
    allowedGenders: Optional[List[str]] = Field(default_factory=list)
    allowedLevels: Optional[List[str]] = Field(default_factory=list)
    # Round 2 additions
    minYearOfStudy: Optional[int] = Field(None, ge=1, le=6)
    maxYearOfStudy: Optional[int] = Field(None, ge=1, le=6)
    allowedInstitutionTypes: Optional[List[str]] = Field(default_factory=list)
    isDisabilityScheme: Optional[bool] = False
    isMinorityScheme: Optional[bool] = False
    allowedCourseKeywords: Optional[List[str]] = Field(default_factory=list)
    notes: Optional[str] = None


class ScholarshipScheme(BaseModel):
    id: str = Field(..., description="Unique scheme identifier")
    name: str = Field(..., description="Official title of the scholarship")
    authority: str = Field(..., description="Government ministry or nodal authority")
    portalName: str = Field(..., description="Name of the official web portal")
    sourceUrl: str = Field(..., description="Direct public URL to the official scheme page")
    applicationUrl: Optional[str] = Field(None, description="Direct application URL if distinct from sourceUrl")
    benefitAmountFormatted: str = Field(..., description="Human-readable benefit claim")
    benefitType: str = Field(..., description="Classification of financial aid")
    applicationDeadline: str = Field(..., description="Closing date in YYYY-MM-DD or UNKNOWN")
    openingDate: Optional[str] = Field(None, description="Application opening date YYYY-MM-DD if known")
    deadlineStatus: DeadlineUrgency = DeadlineUrgency.OPEN
    verificationStatus: VerificationStatus = VerificationStatus.VERIFIED_OFFICIAL
    lastChecked: str = Field(..., description="Timestamp of last portal observation")
    schemeType: SchemeType = SchemeType.MEANS
    isRenewable: Optional[bool] = None
    applicationMode: Optional[str] = None
    criteria: SchemeRuleCriteria
    requiredDocuments: List[str] = Field(default_factory=list)
    description: str
    officialCircularNotice: str
    isExtensionAnnounced: Optional[bool] = False
    previousDeadline: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class ScholarshipListResponse(BaseModel):
    total: int
    page: int = 1
    pageSize: int = 20
    schemes: List[ScholarshipScheme]
    provenance: str = "OFFICIAL_GOVERNMENT_CIRCULARS"
    cacheStatus: str = "VERIFIED_OFFICIAL"
    lastSyncedAt: Optional[str] = None


class ScholarshipSearchRequest(BaseModel):
    profile: Optional[dict] = None
    query: Optional[str] = None
    filters: Optional[dict] = None
    sort: Optional[str] = "relevance"
    page: int = Field(default=1, ge=1)
    pageSize: int = Field(default=20, ge=1, le=100)
