# VidyaSetu — Explainable Eligibility Engine
## Deterministic Welfare Rule Evaluation for Indian Higher Education

---

## 1. Engine Philosophy

In welfare civic tech, opaque AI scores or probabilistic percentages are hazardous. Telling a student they have an *"82% chance of winning a scholarship"* provides no actionable recourse if they are disqualified due to an income cap violation.

**VidyaSetu replaces probabilistic guesswork with a deterministic, explainable rule engine.** It mirrors official government scrutiny, evaluating statutory conditions one by one, and returns an itemized audit of every passed and failed condition.

---

## 2. Verdict Classifications

The engine assigns one of four strictly defined verdicts:

| Verdict | Meaning | Actionable Next Step |
| :--- | :--- | :--- |
| **`ELIGIBLE`** | All statutory conditions evaluated pass without conflict. | Student can proceed with document pre-flight audit and portal registration. |
| **`POTENTIALLY_ELIGIBLE`** | Mandatory criteria pass, but certain scheme rules require documentation or verification. | Student should confirm missing fields before applying. |
| **`INELIGIBLE`** | At least one hard statutory boundary is violated (e.g., income > ₹2.00L cap). | Student should not spend time applying for this specific scheme; explore other matched options. |
| **`INSUFFICIENT_INFO`** | Profile is missing critical core parameters (e.g. unknown income or domicile). | Student must complete their profile wizard to unlock accurate matching. |

---

## 3. Evaluated Statutory Rules

### 3.1 Domicile & State Jurisdiction
- Checks `profile.stateDomicile` against `scheme.criteria.allowedDomiciles`.
- Handles national schemes (`"All States & UTs"`) as universally matched for any Indian state.

### 3.2 Social Category & Reservation
- Evaluates `profile.socialCategory` (`GENERAL`, `OBC`, `SC`, `ST`, `EWS`).
- Non-matching schemes flag an explicit restriction (e.g., *"Scheme restricted to SC, ST; student is OBC"*).

### 3.3 Statutory Family Income Boundaries
- Evaluates `profile.annualFamilyIncome` against `scheme.criteria.maxFamilyIncome`.
- Strict boundary check: Income must be `<= maxFamilyIncome`. (Tested at exact boundary `₹2,00,000 <= ₹2,00,000` -> PASS; `₹2,00,001` -> FAIL).

### 3.4 Academic Performance & Merit Cutoffs
- Evaluates `profile.marksPercentage` against `scheme.criteria.minMarksPercentage`.
- Strict boundary check: Marks must be `>= minMarksPercentage`.

### 3.5 Academic Level & Degree Program
- Evaluates `profile.academicLevel` (`UNDERGRADUATE`, `POSTGRADUATE`, `DIPLOMA`, `HIGHER_SECONDARY`).

### 3.6 Year of Study Range
- Validates `profile.yearOfStudy` against `minYearOfStudy` and `maxYearOfStudy`.
- For example, *AICTE Pragati* requires Year 1 (freshers only); 2nd-year students are flagged.

### 3.7 Institution Type
- Matches `profile.institutionType` (`GOVERNMENT`, `GOVT_AIDED`, `PRIVATE`) against scheme eligibility.

### 3.8 Gender and Special Target Groups
- Checks gender-exclusive awards (e.g., girls-only scholarships).
- Flags disability schemes and minority-focused schemes appropriately.

---

## 4. Explanation Response Structure

Each evaluation returns transparent evidence:
```json
{
  "schemeId": "up-post-matric-obc-gen",
  "schemeName": "UP Post-Matric Scholarship (Dashmottar)",
  "verdict": "ELIGIBLE",
  "matchScore": 100,
  "criteriaSatisfied": [
    "Permanent state domicile verified: Uttar Pradesh",
    "Social welfare category eligible: OBC",
    "Gender requirement satisfied (MALE)",
    "Annual income ₹180,000 within statutory ceiling of ₹200,000",
    "Academic score 76.4% meets or exceeds minimum cutoff of 50.0%",
    "Study level UNDERGRADUATE is eligible for this scheme"
  ],
  "criteriaConflicting": [],
  "missingInformation": [],
  "sourceEvidence": [
    "https://scholarship.up.gov.in"
  ]
}
```

---

## 5. Privacy & Data Handling
- **Local In-Memory Evaluation:** Matching occurs entirely on the local backend or client without transmitting profile attributes to external LLMs.
- **Stateless:** Evaluated profile requests do not write student PII to disk or database tables.
