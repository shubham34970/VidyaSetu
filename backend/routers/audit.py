from fastapi import APIRouter
from backend.schemas.audit import DocumentAuditRequest, DocumentAuditResponse
from backend.services.document_auditor import document_auditor

router = APIRouter(prefix="/api/documents", tags=["Document Compliance"])


@router.post("/audit", response_model=DocumentAuditResponse)
def audit_documents(req: DocumentAuditRequest):
    return document_auditor.audit_documents(req)
