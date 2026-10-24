import pytest
from backend.schemas.profile import (
    StudentProfile,
    SocialCategory,
    Gender,
    AcademicLevel,
    InstitutionType,
)
from backend.schemas.scholarship import ScholarshipScheme
from backend.services.tinyfish_service import STATIC_VERIFIED_SCHEMES
from backend.services.eligibility_service import eligibility_engine, EligibilityVerdict


@pytest.fixture
def base_schemes():
    return [ScholarshipScheme(**s) for s in STATIC_VERIFIED_SCHEMES]


def test_up_post_matric_eligible_student(base_schemes):
    profile = StudentProfile(
        fullName="Aarav Sharma",
        stateDomicile="Uttar Pradesh",
        socialCategory=SocialCategory.OBC,
        annualFamilyIncome=180000,
        courseDegree="B.Tech Computer Science",
        academicLevel=AcademicLevel.UNDERGRADUATE,
        yearOfStudy=2,
        marksPercentage=76.4,
        gender=Gender.MALE,
        institutionType=InstitutionType.GOVT_AIDED,
        hasAadhaarBankSeeding=True,
    )

    up_scheme = next(s for s in base_schemes if s.id == "up-post-matric-obc-gen")
    res = eligibility_engine.evaluate_scheme(up_scheme, profile)

    assert res.verdict == EligibilityVerdict.ELIGIBLE
    assert res.matchScore == 100
    assert any("Uttar Pradesh" in c for c in res.satisfiedConditions)
    assert any("ceiling" in c for c in res.satisfiedConditions)


def test_up_post_matric_income_ceiling_exceeded(base_schemes):
    profile = StudentProfile(
        fullName="Richa Pandey",
        stateDomicile="Uttar Pradesh",
        socialCategory=SocialCategory.GENERAL,
        annualFamilyIncome=320000,  # Exceeds 2.0L cap
        courseDegree="B.Tech",
        academicLevel=AcademicLevel.UNDERGRADUATE,
        yearOfStudy=1,
        marksPercentage=85.0,
        gender=Gender.FEMALE,
        institutionType=InstitutionType.GOVERNMENT,
        hasAadhaarBankSeeding=True,
    )

    up_scheme = next(s for s in base_schemes if s.id == "up-post-matric-obc-gen")
    res = eligibility_engine.evaluate_scheme(up_scheme, profile)

    assert res.verdict == EligibilityVerdict.INELIGIBLE
    assert any("ceiling exceeded" in c.lower() for c in res.conflictingConditions)


def test_aicte_pragati_female_requirement(base_schemes):
    pragati_scheme = next(s for s in base_schemes if s.id == "aicte-pragati-girls")

    # Female candidate with exact technical course keyword match
    female_profile = StudentProfile(
        fullName="Priya Verma",
        stateDomicile="Delhi",
        socialCategory=SocialCategory.GENERAL,
        annualFamilyIncome=350000,
        courseDegree="B.Tech in Technology Engineering",  # matches 'technology' keyword
        academicLevel=AcademicLevel.UNDERGRADUATE,
        yearOfStudy=1,
        marksPercentage=82.5,
        gender=Gender.FEMALE,
        institutionType=InstitutionType.GOVERNMENT,
        hasAadhaarBankSeeding=True,
    )
    res_female = eligibility_engine.evaluate_scheme(pragati_scheme, female_profile)
    # With all criteria met including course keyword, verdict is ELIGIBLE
    assert res_female.verdict == EligibilityVerdict.ELIGIBLE

    # Male candidate should be ineligible
    male_profile = female_profile.model_copy(update={"gender": Gender.MALE})
    res_male = eligibility_engine.evaluate_scheme(pragati_scheme, male_profile)
    assert res_male.verdict == EligibilityVerdict.INELIGIBLE
    assert any("Gender restriction" in c for c in res_male.conflictingConditions)


def test_nsp_csss_merit_cutoff(base_schemes):
    csss_scheme = next(s for s in base_schemes if s.id == "nsp-central-sector-csss")

    # Meets 80% cutoff
    high_score_profile = StudentProfile(
        fullName="Kavita Rao",
        stateDomicile="Madhya Pradesh",
        socialCategory=SocialCategory.GENERAL,
        annualFamilyIncome=280000,
        courseDegree="B.Sc Mathematics",
        academicLevel=AcademicLevel.UNDERGRADUATE,
        yearOfStudy=1,
        marksPercentage=84.0,
        gender=Gender.FEMALE,
        institutionType=InstitutionType.GOVERNMENT,
        hasAadhaarBankSeeding=True,
    )
    res_high = eligibility_engine.evaluate_scheme(csss_scheme, high_score_profile)
    assert res_high.verdict == EligibilityVerdict.ELIGIBLE

    # Below 80% cutoff
    low_score_profile = high_score_profile.model_copy(update={"marksPercentage": 74.0})
    res_low = eligibility_engine.evaluate_scheme(csss_scheme, low_score_profile)
    assert res_low.verdict == EligibilityVerdict.INELIGIBLE
    assert any("Merit cutoff not met" in c for c in res_low.conflictingConditions)
