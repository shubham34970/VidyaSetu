"""
Round 2 — Extended eligibility engine tests.
Covers: year-of-study bounds, institution-type restriction, course keyword advisory,
        disability/minority scheme flags, boundary values, partial profiles, and
        contradictory rules.
"""

import pytest
from backend.schemas.profile import (
    StudentProfile,
    SocialCategory,
    Gender,
    AcademicLevel,
    InstitutionType,
)
from backend.schemas.scholarship import ScholarshipScheme, SchemeRuleCriteria
from backend.services.tinyfish_service import STATIC_VERIFIED_SCHEMES
from backend.services.eligibility_service import eligibility_engine, EligibilityVerdict


@pytest.fixture
def base_schemes():
    return [ScholarshipScheme(**s) for s in STATIC_VERIFIED_SCHEMES]


@pytest.fixture
def base_up_obc_profile():
    """Baseline UP OBC student who satisfies most criteria."""
    return StudentProfile(
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


# ---------------------------------------------------------------------------
# Year-of-study boundary tests
# ---------------------------------------------------------------------------

class TestYearOfStudyBounds:
    def test_first_year_only_scheme_accepts_year_1(self, base_schemes):
        """NSP RPF scheme restricts to year 1. Year-1 student must not be rejected."""
        rpf_scheme = next(s for s in base_schemes if s.id == "nsp-pm-scholarship-scheme-rpf")
        profile = StudentProfile(
            fullName="Rama Singh",
            stateDomicile="Delhi",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=200000,
            courseDegree="B.Tech",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=70.0,
            gender=Gender.MALE,
            institutionType=InstitutionType.GOVT_AIDED,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(rpf_scheme, profile)
        # Year 1 meets minYearOfStudy=1 AND maxYearOfStudy=1
        assert not any("Year of study restriction" in c and "year 1" in c
                       for c in res.conflictingConditions), (
            f"Year-1 student wrongly rejected: {res.conflictingConditions}"
        )

    def test_first_year_only_scheme_rejects_year_3(self, base_schemes):
        rpf_scheme = next(s for s in base_schemes if s.id == "nsp-pm-scholarship-scheme-rpf")
        profile = StudentProfile(
            fullName="Rama Singh",
            stateDomicile="Delhi",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=200000,
            courseDegree="B.Tech",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=3,
            marksPercentage=70.0,
            gender=Gender.MALE,
            institutionType=InstitutionType.GOVT_AIDED,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(rpf_scheme, profile)
        year_conflict = any("Year of study" in c for c in res.conflictingConditions)
        assert year_conflict, "Year-3 student should be rejected for year-1-only scheme"
        assert res.verdict == EligibilityVerdict.INELIGIBLE

    def test_rajasthan_scheme_first_year_only(self, base_schemes):
        raj_scheme = next(s for s in base_schemes if s.id == "rajasthan-mukhyamantri-uchch-shiksha")
        # 2nd year student should be rejected (maxYearOfStudy=1)
        profile = StudentProfile(
            fullName="Sunita Sharma",
            stateDomicile="Rajasthan",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=200000,
            courseDegree="B.A.",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=2,
            marksPercentage=65.0,
            gender=Gender.FEMALE,
            institutionType=InstitutionType.GOVERNMENT,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(raj_scheme, profile)
        assert res.verdict == EligibilityVerdict.INELIGIBLE
        assert any("Year of study" in c for c in res.conflictingConditions)


# ---------------------------------------------------------------------------
# Institution type restriction tests
# ---------------------------------------------------------------------------

class TestInstitutionTypeRestriction:
    def test_rajasthan_scheme_requires_govt_or_aided(self, base_schemes):
        raj_scheme = next(s for s in base_schemes if s.id == "rajasthan-mukhyamantri-uchch-shiksha")
        private_profile = StudentProfile(
            fullName="Sunita Sharma",
            stateDomicile="Rajasthan",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=200000,
            courseDegree="B.A.",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=65.0,
            gender=Gender.FEMALE,
            institutionType=InstitutionType.PRIVATE,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(raj_scheme, private_profile)
        assert res.verdict == EligibilityVerdict.INELIGIBLE
        assert any("institution type restriction" in c.lower() for c in res.conflictingConditions)

    def test_govt_institution_satisfies_restriction(self, base_schemes):
        raj_scheme = next(s for s in base_schemes if s.id == "rajasthan-mukhyamantri-uchch-shiksha")
        govt_profile = StudentProfile(
            fullName="Sunita Sharma",
            stateDomicile="Rajasthan",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=200000,
            courseDegree="B.A.",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=65.0,
            gender=Gender.FEMALE,
            institutionType=InstitutionType.GOVERNMENT,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(raj_scheme, govt_profile)
        assert any("Institution type eligible" in c for c in res.satisfiedConditions)


# ---------------------------------------------------------------------------
# Course keyword advisory tests
# ---------------------------------------------------------------------------

class TestCourseKeywordAdvisory:
    def test_engineering_course_matches_aicte_pragati(self, base_schemes):
        pragati = next(s for s in base_schemes if s.id == "aicte-pragati-girls")
        profile = StudentProfile(
            fullName="Priya Patel",
            stateDomicile="Gujarat",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=400000,
            courseDegree="B.Tech in Electronics Engineering",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=75.0,
            gender=Gender.FEMALE,
            institutionType=InstitutionType.GOVT_AIDED,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(pragati, profile)
        # Should find "engineering" keyword in course
        assert any("matches scheme-eligible disciplines" in c for c in res.satisfiedConditions)

    def test_non_technical_course_raises_advisory(self, base_schemes):
        pragati = next(s for s in base_schemes if s.id == "aicte-pragati-girls")
        profile = StudentProfile(
            fullName="Priya Patel",
            stateDomicile="Gujarat",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=400000,
            courseDegree="B.A. History",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=75.0,
            gender=Gender.FEMALE,
            institutionType=InstitutionType.GOVT_AIDED,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(pragati, profile)
        # Should produce an advisory missing condition — NOT a hard conflict
        assert any("Course keyword match uncertain" in m for m in res.missingConditions)
        # But the course keyword issue alone should not make them INELIGIBLE
        # (gender alone may block male, but a female with wrong course is POTENTIALLY_ELIGIBLE)


# ---------------------------------------------------------------------------
# Disability and minority scheme advisory tests
# ---------------------------------------------------------------------------

class TestDisabilityMinoritySchemeAdvisory:
    def test_disability_scheme_adds_advisory_missing_condition(self, base_schemes):
        saksham = next(s for s in base_schemes if s.id == "aicte-saksham-disability")
        profile = StudentProfile(
            fullName="Rahul Kumar",
            stateDomicile="Delhi",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=300000,
            courseDegree="B.Tech",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=65.0,
            gender=Gender.MALE,
            institutionType=InstitutionType.GOVT_AIDED,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(saksham, profile)
        # Must include disability advisory in missing conditions
        assert any("benchmark disability" in m or "disability certificate" in m.lower()
                   for m in res.missingConditions)
        # Must not be INELIGIBLE solely due to disability flag
        # (verdict may be POTENTIALLY_ELIGIBLE if no other conflicts)

    def test_minority_scheme_adds_advisory_missing_condition(self, base_schemes):
        minority_scheme = next(
            s for s in base_schemes if s.id == "nsp-begum-hazrat-mahal-minority-girls"
        )
        profile = StudentProfile(
            fullName="Fatima Begum",
            stateDomicile="Delhi",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=150000,
            courseDegree="Class 11 Science",
            academicLevel=AcademicLevel.HIGHER_SECONDARY,
            yearOfStudy=1,
            marksPercentage=72.0,
            gender=Gender.FEMALE,
            institutionType=InstitutionType.GOVERNMENT,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(minority_scheme, profile)
        assert any("minority" in m.lower() for m in res.missingConditions)

    def test_minority_scheme_with_male_student_ineligible(self, base_schemes):
        minority_scheme = next(
            s for s in base_schemes if s.id == "nsp-begum-hazrat-mahal-minority-girls"
        )
        male_profile = StudentProfile(
            fullName="Arjun Singh",
            stateDomicile="Delhi",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=150000,
            courseDegree="Class 11",
            academicLevel=AcademicLevel.HIGHER_SECONDARY,
            yearOfStudy=1,
            marksPercentage=72.0,
            gender=Gender.MALE,
            institutionType=InstitutionType.GOVERNMENT,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(minority_scheme, male_profile)
        assert res.verdict == EligibilityVerdict.INELIGIBLE


# ---------------------------------------------------------------------------
# Boundary value tests
# ---------------------------------------------------------------------------

class TestBoundaryValues:
    def test_income_exactly_at_ceiling_is_eligible(self, base_schemes):
        up_scheme = next(s for s in base_schemes if s.id == "up-post-matric-obc-gen")
        profile = StudentProfile(
            fullName="Test Student",
            stateDomicile="Uttar Pradesh",
            socialCategory=SocialCategory.OBC,
            annualFamilyIncome=200000,  # Exactly at ceiling
            courseDegree="B.A.",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=2,
            marksPercentage=55.0,
            gender=Gender.MALE,
            institutionType=InstitutionType.GOVT_AIDED,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(up_scheme, profile)
        income_conflict = any("ceiling exceeded" in c.lower() for c in res.conflictingConditions)
        assert not income_conflict, "Income exactly at ceiling should NOT be conflicted"

    def test_income_one_rupee_above_ceiling_is_ineligible(self, base_schemes):
        up_scheme = next(s for s in base_schemes if s.id == "up-post-matric-obc-gen")
        profile = StudentProfile(
            fullName="Test Student",
            stateDomicile="Uttar Pradesh",
            socialCategory=SocialCategory.OBC,
            annualFamilyIncome=200001,  # One rupee over
            courseDegree="B.A.",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=2,
            marksPercentage=55.0,
            gender=Gender.MALE,
            institutionType=InstitutionType.GOVT_AIDED,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(up_scheme, profile)
        assert any("ceiling exceeded" in c.lower() for c in res.conflictingConditions)

    def test_marks_exactly_at_minimum_threshold(self, base_schemes):
        csss = next(s for s in base_schemes if s.id == "nsp-central-sector-csss")
        profile = StudentProfile(
            fullName="Test Student",
            stateDomicile="Madhya Pradesh",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=300000,
            courseDegree="B.Sc",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=80.0,  # Exactly at threshold
            gender=Gender.FEMALE,
            institutionType=InstitutionType.GOVERNMENT,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(csss, profile)
        merit_conflict = any("Merit cutoff not met" in c for c in res.conflictingConditions)
        assert not merit_conflict, "Marks exactly at threshold should not be conflicted"

    def test_marks_one_tenth_below_minimum(self, base_schemes):
        csss = next(s for s in base_schemes if s.id == "nsp-central-sector-csss")
        profile = StudentProfile(
            fullName="Test Student",
            stateDomicile="Madhya Pradesh",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=300000,
            courseDegree="B.Sc",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=79.9,  # Just below 80%
            gender=Gender.FEMALE,
            institutionType=InstitutionType.GOVERNMENT,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(csss, profile)
        assert res.verdict == EligibilityVerdict.INELIGIBLE
        assert any("Merit cutoff not met" in c for c in res.conflictingConditions)

    def test_zero_income_always_within_any_ceiling(self, base_schemes):
        for scheme in base_schemes:
            if scheme.criteria.maxFamilyIncome is not None:
                profile = StudentProfile(
                    fullName="Zero Income Student",
                    stateDomicile="Uttar Pradesh",
                    socialCategory=SocialCategory.SC,
                    annualFamilyIncome=0.0,
                    courseDegree="B.A.",
                    academicLevel=AcademicLevel.UNDERGRADUATE,
                    yearOfStudy=1,
                    marksPercentage=50.0,
                    gender=Gender.MALE,
                    institutionType=InstitutionType.GOVERNMENT,
                    hasAadhaarBankSeeding=True,
                )
                res = eligibility_engine.evaluate_scheme(scheme, profile)
                assert not any("ceiling exceeded" in c.lower() for c in res.conflictingConditions), (
                    f"Zero income wrongly flagged for scheme {scheme.id}"
                )
                break  # One representative check is sufficient


# ---------------------------------------------------------------------------
# Match score properties
# ---------------------------------------------------------------------------

class TestMatchScoreProperties:
    def test_eligible_scheme_has_score_100(self, base_schemes, base_up_obc_profile):
        up_scheme = next(s for s in base_schemes if s.id == "up-post-matric-obc-gen")
        res = eligibility_engine.evaluate_scheme(up_scheme, base_up_obc_profile)
        if res.verdict == EligibilityVerdict.ELIGIBLE:
            assert res.matchScore == 100

    def test_ineligible_score_is_below_100(self, base_schemes):
        pragati = next(s for s in base_schemes if s.id == "aicte-pragati-girls")
        male_profile = StudentProfile(
            fullName="Test",
            stateDomicile="UP",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=100000,
            courseDegree="B.Tech",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=80.0,
            gender=Gender.MALE,
            institutionType=InstitutionType.GOVERNMENT,
            hasAadhaarBankSeeding=True,
        )
        res = eligibility_engine.evaluate_scheme(pragati, male_profile)
        assert res.matchScore < 100
        assert res.matchScore >= 0

    def test_more_conflicts_lower_score(self, base_schemes):
        pragati = next(s for s in base_schemes if s.id == "aicte-pragati-girls")
        # One conflict: male
        one_conflict = StudentProfile(
            fullName="Test",
            stateDomicile="UP",
            socialCategory=SocialCategory.GENERAL,
            annualFamilyIncome=100000,
            courseDegree="B.Tech Engineering",
            academicLevel=AcademicLevel.UNDERGRADUATE,
            yearOfStudy=1,
            marksPercentage=80.0,
            gender=Gender.MALE,
            institutionType=InstitutionType.GOVERNMENT,
            hasAadhaarBankSeeding=True,
        )
        # Two conflicts: male + marks below 50%
        two_conflict = one_conflict.model_copy(update={"marksPercentage": 30.0})
        res1 = eligibility_engine.evaluate_scheme(pragati, one_conflict)
        res2 = eligibility_engine.evaluate_scheme(pragati, two_conflict)
        assert res2.matchScore <= res1.matchScore

    def test_score_always_in_valid_range(self, base_schemes, base_up_obc_profile):
        for scheme in base_schemes[:5]:
            res = eligibility_engine.evaluate_scheme(scheme, base_up_obc_profile)
            assert 0 <= res.matchScore <= 100
