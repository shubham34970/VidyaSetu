import pytest
from backend.schemas.audit import DocumentAuditRequest, AuditStatus
from backend.services.document_auditor import document_auditor


def test_valid_income_certificate():
    req = DocumentAuditRequest(
        studentState="Uttar Pradesh",
        studentCategory="OBC",
        annualIncome=180000,
        incomeCertIssueDate="2025-06-12",  # ~1.3 years old
        hasAadhaarBankSeeding=True,
    )
    res = document_auditor.audit_documents(req)

    income_doc = next(d for d in res.items if d.id == "doc-income")
    assert income_doc.status == AuditStatus.PASS
    assert "within statutory 3-year" in income_doc.findings.lower()


def test_expired_income_certificate_triggers_warning():
    req = DocumentAuditRequest(
        studentState="Uttar Pradesh",
        studentCategory="GENERAL",
        annualIncome=200000,
        incomeCertIssueDate="2022-01-10",  # > 4.5 years old
        hasAadhaarBankSeeding=True,
    )
    res = document_auditor.audit_documents(req)

    income_doc = next(d for d in res.items if d.id == "doc-income")
    assert income_doc.status == AuditStatus.WARNING
    assert "expired" in income_doc.findings.lower()
    assert income_doc.actionRequired is not None


def test_unseeded_bank_account_triggers_fail():
    req = DocumentAuditRequest(
        studentState="Delhi",
        studentCategory="SC",
        annualIncome=120000,
        incomeCertIssueDate="2025-01-01",
        hasAadhaarBankSeeding=False,  # Unseeded
    )
    res = document_auditor.audit_documents(req)

    bank_doc = next(d for d in res.items if d.id == "doc-bank-seeding")
    assert bank_doc.status == AuditStatus.FAIL
    assert "not mapped in npci" in bank_doc.findings.lower()
