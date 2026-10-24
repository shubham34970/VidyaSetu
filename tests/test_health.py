from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "version" in data
    assert "tinyfish" in data
    assert "cli_installed" in data["tinyfish"]
    assert "api_key_configured" in data["tinyfish"]
