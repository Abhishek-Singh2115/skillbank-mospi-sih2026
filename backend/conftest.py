import os
import pytest

# Task 12 requirement: conftest.py must set these BEFORE importing the app
os.environ["GOOGLE_CLIENT_ID"] = "test-client-id"
os.environ["SESSION_SECRET"] = "this-is-a-very-secure-test-secret-key-that-is-at-least-32-chars"
os.environ["GEMINI_API_KEY"] = "test-gemini-key"

# Now we can safely import the app and router dependencies
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    return TestClient(app)
