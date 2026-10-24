from typing import List, Optional
from pydantic import BaseModel, Field
from backend.schemas.scholarship import ScholarshipScheme


class DiscoverySearchRequest(BaseModel):
    query: str = Field(default="scholarship circulars higher education")
    domains: Optional[List[str]] = Field(
        default_factory=lambda: [
            "scholarships.gov.in",
            "scholarship.up.gov.in",
            "aicte-india.org",
            "vidyalakshmi.co.in",
        ]
    )
    forceLive: bool = Field(default=False)


class DiscoverySearchResponse(BaseModel):
    query: str
    totalFound: int
    source: str  # "TINYFISH_LIVE" | "CACHED_PORTAL" | "VERIFIED_OFFICIAL"
    queryTimeMs: float
    tinyfishStatus: str
    schemes: List[ScholarshipScheme]
