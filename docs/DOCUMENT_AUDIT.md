# VidyaSetu — Pre-Flight Document Compliance Auditor
## Eliminating the 84% Technical Disqualification Trap in Scholarship Portals

---

## 1. Problem Statement

Field audits across Indian welfare administration reveal that **over 84% of rejected higher education scholarship applications are disqualified not due to basic eligibility, but because of procedural document defects**:
- Submitting an income certificate that has crossed its 3-year statutory validity.
- Submitting a caste certificate issued by an unauthorized official or lacking digital verification.
- Having a valid bank account that is NOT seeded on the **NPCI Aadhaar Payment Bridge (APB)**.
- Mismatched name spellings between Aadhaar, Class 10 marksheet, and college enrollment records.

The **VidyaSetu Pre-Flight Auditor** performs proactive statutory validation before the student ever submits their form on portals like NSP, UP Scholarship, or MahaDBT.

---

## 2. Core Audit Modules & Statutory Standards

### 2.1 Income Certificate Audit (3-Year Rule)
- **Governing Rule:** *Uttar Pradesh Revenue Board G.O. 4521/1-9-2015* and *Central National Scholarship Portal Guidelines*.
- **Standard:** Digital income certificates issued by Revenue Authorities (Tehsildar/SDM) are strictly valid for **3 financial years** from the date of issue.
- **Audit Logic:**
  - `issueDate > today`: **`FAIL`** (*Invalid future issuance timestamp*).
  - `age <= 3.0 years`: **`PASS`** (*Compliant; displays valid-until date*).
  - `age > 3.0 years`: **`WARNING` / `FAIL`** (*Expired certificate; must renew on eDistrict*).
  - Missing date: **`WARNING`** (*Cannot verify certificate currency*).

### 2.2 Domicile / Niwas Praman Patra
- **Governing Rule:** State Citizen Service Guidelines & DigiLocker Verifiable Credential standard.
- **Standard:** Permanent resident certificates have lifetime validity unless cancelled for cause.
- **Audit:** Verifies issuing authority (SDM / District Magistrate) and eDistrict verification format.

### 2.3 Caste & Category Certificates
- **Categories Checked:** `OBC`, `SC`, `ST`, `EWS`.
- **EWS Specifics:** Valid for 1 single financial year (issued after April 1 of current assessment year).
- **OBC Specifics:** Non-creamy layer certificate validity checked against current income thresholds.
- **General Category:** Exempted from caste certificate requirements.

### 2.4 Aadhaar NPCI Bank Account Seeding
- **Standard:** Ministry of Finance & PFMS Direct Benefit Transfer (DBT) mandates.
- **Standard:** Having a bank account linked to an Aadhaar card is NOT sufficient; it must be mapped in the **NPCI mapper** to receive government DBT payments.
- **Audit Status:** Flags unmapped accounts with remediation instructions to visit the bank branch with an NPCI mandate form.

---

## 3. Audit Response Structure

Endpoint: `POST /api/documents/audit`
```json
{
  "studentState": "Uttar Pradesh",
  "studentCategory": "OBC",
  "annualIncome": 180000,
  "overallReadinessScore": 85,
  "items": [
    {
      "id": "doc-income",
      "name": "Annual Family Income Certificate",
      "category": "INCOME",
      "status": "PASS",
      "issueDate": "2025-06-10",
      "findings": "Compliant: Certificate issued 1.4 years ago. Comfortably within statutory 3-year validity window (valid until 2028-06-09).",
      "actionRequired": null,
      "officialRuleSource": "UP Revenue Board G.O. 4521/1-9-2015 & NSP Income Verification Guidelines"
    },
    {
      "id": "doc-npci",
      "name": "Aadhaar NPCI Bank Account Seeding",
      "category": "BANK_ACCOUNT",
      "status": "PASS",
      "findings": "Aadhaar NPCI seeding confirmed active for DBT transfers.",
      "actionRequired": null,
      "officialRuleSource": "PFMS DBT Mandate"
    }
  ]
}
```

---

## 4. Privacy & Zero-Retention Policy
- **No Document Storage:** The auditor inspects issuance dates and status flags; it does NOT store personal PDFs, Aadhaar biometric numbers, or sensitive financial documents on disk or database.
