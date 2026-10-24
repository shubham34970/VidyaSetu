from typing import List, Dict, Any, Optional
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

        criteria = scheme.criteria

        # 1. Domicile State Verification
        if criteria.allowedDomiciles:
            is_national = "All States & UTs" in criteria.allowedDomiciles
            if is_national or profile.stateDomicile in criteria.allowedDomiciles:
                satisfied.append(f"Permanent state domicile verified: {profile.stateDomicile}")
            else:
                conflicting.append(
                    f"Domicile restriction: Scheme requires {', '.join(criteria.allowedDomiciles)}; student is domiciled in {profile.stateDomicile}"
                )

        # 2. Social Category Eligibility
        if criteria.allowedCategories:
            if profile.socialCategory.value in criteria.allowedCategories:
                satisfied.append(f"Social welfare category eligible: {profile.socialCategory.value}")
            else:
                conflicting.append(
                    f"Category restriction: Scheme restricted to {', '.join(criteria.allowedCategories)}; student is {profile.socialCategory.value}"
                )

        # 3. Gender Criteria Check
        if criteria.allowedGenders:
            if profile.gender.value in criteria.allowedGenders:
                satisfied.append(f"Gender requirement satisfied ({profile.gender.value})")
            else:
                conflicting.append(
                    f"Gender restriction: Reserved for {', '.join(criteria.allowedGenders)} applicants"
                )

        # 4. Income Ceiling Check
        if criteria.maxFamilyIncome is not None:
            if profile.annualFamilyIncome <= criteria.maxFamilyIncome:
                satisfied.append(
                    f"Annual income ₹{profile.annualFamilyIncome:,.0f} within statutory ceiling of ₹{criteria.maxFamilyIncome:,.0f}"
                )
            else:
                conflicting.append(
                    f"Income ceiling exceeded: Student income ₹{profile.annualFamilyIncome:,.0f} > cap of ₹{criteria.maxFamilyIncome:,.0f}"
                )

        # 5. Academic Performance / Percentage Threshold
        if criteria.minMarksPercentage is not None:
            if profile.marksPercentage >= criteria.minMarksPercentage:
                satisfied.append(
                    f"Academic score {profile.marksPercentage}% meets or exceeds minimum cutoff of {criteria.minMarksPercentage}%"
                )
            else:
                conflicting.append(
                    f"Merit cutoff not met: Student scored {profile.marksPercentage}%, required minimum is {criteria.minMarksPercentage}%"
                )

        # 6. Academic Level Eligibility
        if criteria.allowedLevels:
            if profile.academicLevel.value in criteria.allowedLevels:
                satisfied.append(f"Academic study level eligible: {profile.academicLevel.value}")
            else:
                conflicting.append(
                    f"Level restriction: Requires {', '.join(criteria.allowedLevels)}"
                )

        # Compute Verdict and Match Score
        verdict = EligibilityVerdict.ELIGIBLE
        match_score = 100

        if conflicting:
            verdict = EligibilityVerdict.INELIGIBLE
            match_score = max(15, 100 - (len(conflicting) * 30))
        elif missing:
            verdict = EligibilityVerdict.POTENTIALLY_ELIGIBLE
            match_score = 75

        return EligibilityEvaluation(
            schemeId=scheme.id,
            schemeName=scheme.name,
            verdict=verdict,
            matchScore=match_score,
            satisfiedConditions=satisfied,
            conflictingConditions=conflicting,
            missingConditions=missing,
            sourceCitations=[scheme.sourceUrl],
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
