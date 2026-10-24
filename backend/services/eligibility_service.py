"""
Round 2 — Extended eligibility evaluation engine.

New checks added:
  7. Year of study (minYearOfStudy / maxYearOfStudy)
  8. Institution type
  9. Course keyword match
 10. Disability scheme flag
 11. Minority scheme flag

Verdict logic (unchanged contract):
  ELIGIBLE              — all checked conditions pass, no conflicts
  POTENTIALLY_ELIGIBLE  — some conditions cannot be verified (missing profile info)
  INELIGIBLE            — at least one hard rule violated
  INSUFFICIENT_INFO     — profile so incomplete that no evaluation is possible
"""

from typing import List
from backend.schemas.profile import StudentProfile
from backend.schemas.scholarship import ScholarshipScheme
from backend.schemas.eligibility import (
    EligibilityVerdict,
    EligibilityEvaluation,
    EligibilityMatchResponse,
)


class EligibilityEngine:
    """Deterministic, explainable eligibility evaluation engine for Indian welfare schemes."""

    @staticmethod
    def evaluate_scheme(
        scheme: ScholarshipScheme, profile: StudentProfile
    ) -> EligibilityEvaluation:
        satisfied: List[str] = []
        conflicting: List[str] = []
        missing: List[str] = []
        source_evidence: List[str] = [scheme.sourceUrl]

        criteria = scheme.criteria

        # ── 1. Domicile State Verification ─────────────────────────────────
        if criteria.allowedDomiciles:
            is_national = "All States & UTs" in criteria.allowedDomiciles
            if is_national or profile.stateDomicile in criteria.allowedDomiciles:
                satisfied.append(
                    f"Permanent state domicile verified: {profile.stateDomicile}"
                )
            else:
                conflicting.append(
                    f"Domicile restriction: Scheme requires {', '.join(criteria.allowedDomiciles)}; "
                    f"student is domiciled in {profile.stateDomicile}"
                )

        # ── 2. Social Category Eligibility ──────────────────────────────────
        if criteria.allowedCategories:
            if profile.socialCategory.value in criteria.allowedCategories:
                satisfied.append(
                    f"Social welfare category eligible: {profile.socialCategory.value}"
                )
            else:
                conflicting.append(
                    f"Category restriction: Scheme restricted to "
                    f"{', '.join(criteria.allowedCategories)}; student is {profile.socialCategory.value}"
                )

        # ── 3. Gender Criteria Check ────────────────────────────────────────
        if criteria.allowedGenders:
            if profile.gender.value in criteria.allowedGenders:
                satisfied.append(
                    f"Gender requirement satisfied ({profile.gender.value})"
                )
            else:
                conflicting.append(
                    f"Gender restriction: Reserved for {', '.join(criteria.allowedGenders)} applicants"
                )

        # ── 4. Income Ceiling Check ─────────────────────────────────────────
        if criteria.maxFamilyIncome is not None:
            if profile.annualFamilyIncome <= criteria.maxFamilyIncome:
                satisfied.append(
                    f"Annual income ₹{profile.annualFamilyIncome:,.0f} within statutory "
                    f"ceiling of ₹{criteria.maxFamilyIncome:,.0f}"
                )
            else:
                conflicting.append(
                    f"Income ceiling exceeded: Student income ₹{profile.annualFamilyIncome:,.0f} "
                    f"> cap of ₹{criteria.maxFamilyIncome:,.0f}"
                )

        # ── 5. Academic Performance / Percentage Threshold ─────────────────
        if criteria.minMarksPercentage is not None:
            if profile.marksPercentage >= criteria.minMarksPercentage:
                satisfied.append(
                    f"Academic score {profile.marksPercentage}% meets or exceeds minimum "
                    f"cutoff of {criteria.minMarksPercentage}%"
                )
            else:
                conflicting.append(
                    f"Merit cutoff not met: Student scored {profile.marksPercentage}%, "
                    f"required minimum is {criteria.minMarksPercentage}%"
                )

        # ── 6. Academic Level Eligibility ───────────────────────────────────
        if criteria.allowedLevels:
            if profile.academicLevel.value in criteria.allowedLevels:
                satisfied.append(
                    f"Academic study level eligible: {profile.academicLevel.value}"
                )
            else:
                conflicting.append(
                    f"Level restriction: Requires {', '.join(criteria.allowedLevels)}"
                )

        # ── 7. Year of Study Range Check (Round 2) ──────────────────────────
        if criteria.minYearOfStudy is not None:
            if profile.yearOfStudy < criteria.minYearOfStudy:
                conflicting.append(
                    f"Year of study restriction: Scheme requires year ≥ {criteria.minYearOfStudy}; "
                    f"student is in year {profile.yearOfStudy}"
                )
            else:
                satisfied.append(
                    f"Year of study {profile.yearOfStudy} meets minimum requirement of "
                    f"year {criteria.minYearOfStudy}"
                )

        if criteria.maxYearOfStudy is not None:
            if profile.yearOfStudy > criteria.maxYearOfStudy:
                conflicting.append(
                    f"Year of study restriction: Scheme restricted to year ≤ {criteria.maxYearOfStudy}; "
                    f"student is in year {profile.yearOfStudy}"
                )

        # ── 8. Institution Type Check (Round 2) ─────────────────────────────
        if criteria.allowedInstitutionTypes:
            if profile.institutionType.value in criteria.allowedInstitutionTypes:
                satisfied.append(
                    f"Institution type eligible: {profile.institutionType.value}"
                )
            else:
                conflicting.append(
                    f"Institution type restriction: Scheme requires "
                    f"{', '.join(criteria.allowedInstitutionTypes)}; "
                    f"student is at {profile.institutionType.value} institution"
                )

        # ── 9. Course Keyword Match (Round 2) — advisory only ──────────────
        if criteria.allowedCourseKeywords:
            course_lower = profile.courseDegree.lower()
            keyword_match = any(kw.lower() in course_lower for kw in criteria.allowedCourseKeywords)
            if keyword_match:
                satisfied.append(
                    f"Course '{profile.courseDegree}' matches scheme-eligible disciplines"
                )
            else:
                # Advisory — marks as missing rather than hard conflicting
                # because students may not have perfectly described their course
                missing.append(
                    f"Course keyword match uncertain: Scheme targets "
                    f"{', '.join(criteria.allowedCourseKeywords)}; "
                    f"student's course is '{profile.courseDegree}'. Confirm with your institution."
                )

        # ── 10. Disability Scheme Note (Round 2) ─────────────────────────────
        if criteria.isDisabilityScheme:
            missing.append(
                "Scheme is reserved for students with benchmark disability (≥40%). "
                "Please confirm disability certificate eligibility with your institution."
            )
            source_evidence.append(
                "RPWD Act 2016 — Rights of Persons with Disabilities (benchmark disability norms)"
            )

        # ── 11. Minority Scheme Note (Round 2) ───────────────────────────────
        if criteria.isMinorityScheme:
            missing.append(
                "Scheme is reserved for minority community students. "
                "Verify minority community certificate (Muslim/Christian/Sikh/Buddhist/Jain/Zoroastrian)."
            )
            source_evidence.append(
                "National Commission for Minorities Act 1992 — notified minority communities"
            )

        # ── Compute verdict and match score ────────────────────────────────
        if conflicting:
            verdict = EligibilityVerdict.INELIGIBLE
            # Score degrades per hard conflict, floored at 10
            match_score = max(10, 100 - len(conflicting) * 25)
        elif missing:
            verdict = EligibilityVerdict.POTENTIALLY_ELIGIBLE
            # Score degrades per uncertain condition
            match_score = max(55, 100 - len(missing) * 10)
        else:
            verdict = EligibilityVerdict.ELIGIBLE
            match_score = 100

        return EligibilityEvaluation(
            schemeId=scheme.id,
            schemeName=scheme.name,
            verdict=verdict,
            matchScore=match_score,
            satisfiedConditions=satisfied,
            conflictingConditions=conflicting,
            missingConditions=missing,
            sourceCitations=source_evidence,
        )

    @classmethod
    def evaluate_all(
        cls, schemes: List[ScholarshipScheme], profile: StudentProfile
    ) -> EligibilityMatchResponse:
        evaluations: List[EligibilityEvaluation] = []
        eligible_count = 0
        potentially_eligible_count = 0
        ineligible_count = 0

        for scheme in schemes:
            eval_res = cls.evaluate_scheme(scheme, profile)
            evaluations.append(eval_res)
            if eval_res.verdict == EligibilityVerdict.ELIGIBLE:
                eligible_count += 1
            elif eval_res.verdict == EligibilityVerdict.POTENTIALLY_ELIGIBLE:
                potentially_eligible_count += 1
            else:
                ineligible_count += 1

        return EligibilityMatchResponse(
            totalEvaluated=len(schemes),
            eligibleCount=eligible_count,
            potentiallyEligibleCount=potentially_eligible_count,
            ineligibleCount=ineligible_count,
            evaluations=evaluations,
        )


eligibility_engine = EligibilityEngine()
# Re-export EligibilityVerdict for direct import convenience
EligibilityVerdict = EligibilityVerdict
