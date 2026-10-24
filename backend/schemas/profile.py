from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SocialCategory(str, Enum):
    GENERAL = "GENERAL"
    OBC = "OBC"
    SC = "SC"
    ST = "ST"
    EWS = "EWS"


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class AcademicLevel(str, Enum):
    UNDERGRADUATE = "UNDERGRADUATE"
    POSTGRADUATE = "POSTGRADUATE"
    DIPLOMA = "DIPLOMA"
    HIGHER_SECONDARY = "HIGHER_SECONDARY"


class InstitutionType(str, Enum):
    GOVERNMENT = "GOVERNMENT"
    GOVT_AIDED = "GOVT_AIDED"
    PRIVATE = "PRIVATE"


class StudentProfile(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100)
    stateDomicile: str = Field(..., min_length=2)
    socialCategory: SocialCategory
    annualFamilyIncome: float = Field(..., ge=0.0)
    courseDegree: str = Field(..., min_length=2)
    academicLevel: AcademicLevel
    yearOfStudy: int = Field(..., ge=1, le=6)
    marksPercentage: float = Field(..., ge=0.0, le=100.0)
    gender: Gender
    institutionType: InstitutionType
    hasAadhaarBankSeeding: bool = Field(default=True)


class StudentProfileResponse(BaseModel):
    status: str = "validated"
    profile: StudentProfile
    summary: str
