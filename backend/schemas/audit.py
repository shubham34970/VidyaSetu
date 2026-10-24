from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class AuditCategory(str, Enum):
    IDENTITY = "IDENTITY"
    INCOME = "INCOME"
    ACADEMIC = "ACADEMIC"
    DOMICILE = "DOMICILE"
    BANK = "BANK"


class AuditStatus(str, Enum):
    PASS = "PASS"
    WARNING = "WARNING"
    FAIL = "FAIL"
    PENDING = "PENDING"


class DocumentPreFlightItem(BaseModel):
    id: str
    name: str
    category: AuditCategory
    status: AuditStatus
    issueDate: Optional[str] = None
    validUntil: Optional[str] = None
    issuingAuthority: Optional[str] = None
    findings: str
    actionRequired: Optional[str] = None
    officialRuleSource: str


class DocumentAuditRequest(BaseModel):
    studentState: str
    studentCategory: str
    annualIncome: float
    incomeCertIssueDate: Optional[str] = None
    casteCertIssueDate: Optional[str] = None
    casteCertAuthority: Optional[str] = None
    domicileState: Optional[str] = None
    hasAadhaarBankSeeding: bool = True
    feeReceiptAvailable: bool = True


class DocumentAuditResponse(BaseModel):
    overallReadinessScore: int = Field(..., ge=0, le=100)
    passCount: int
    warningCount: int
    failCount: int
    items: List[DocumentPreFlightItem]
    statutoryNotice: str
