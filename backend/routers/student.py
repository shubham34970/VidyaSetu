from fastapi import APIRouter
from backend.schemas.profile import StudentProfile, StudentProfileResponse

router = APIRouter(prefix="/api/student", tags=["Student"])


@router.post("/profile", response_model=StudentProfileResponse)
def validate_student_profile(profile: StudentProfile):
    summary = (
        f"{profile.fullName} ({profile.gender.value}) • {profile.stateDomicile} • "
        f"{profile.socialCategory.value} • Annual Income ₹{profile.annualFamilyIncome:,.0f} • "
        f"{profile.courseDegree} ({profile.academicLevel.value} Year {profile.yearOfStudy}) • "
        f"Score: {profile.marksPercentage}%"
    )
    return StudentProfileResponse(
        status="validated",
        profile=profile,
        summary=summary,
    )
