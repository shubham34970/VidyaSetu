from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_list_scholarships():
    response = client.get("/api/scholarships")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    assert len(data["schemes"]) >= 3


def test_get_single_scholarship():
    response = client.get("/api/scholarships/up-post-matric-obc-gen")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "up-post-matric-obc-gen"
    assert "Dashmottar" in data["name"]


def test_get_nonexistent_scholarship():
    response = client.get("/api/scholarships/non-existent-random-id")
    assert response.status_code == 404


def test_deadlines_endpoint():
    response = client.get("/api/deadlines")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    assert len(data["observations"]) >= 3


def test_validate_student_profile():
    payload = {
        "fullName": "Aarav Sharma",
        "stateDomicile": "Uttar Pradesh",
        "socialCategory": "OBC",
        "annualFamilyIncome": 180000,
        "courseDegree": "B.Tech Computer Science",
        "academicLevel": "UNDERGRADUATE",
        "yearOfStudy": 2,
        "marksPercentage": 76.4,
        "gender": "MALE",
        "institutionType": "GOVT_AIDED",
        "hasAadhaarBankSeeding": True,
    }
    response = client.post("/api/student/profile", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "validated"
    assert "Aarav Sharma" in data["summary"]


def test_discovery_search():
    response = client.post("/api/discovery/search", json={"query": "UP scholarship"})
    assert response.status_code == 200
    data = response.json()
    assert data["totalFound"] >= 1
    assert "schemes" in data
