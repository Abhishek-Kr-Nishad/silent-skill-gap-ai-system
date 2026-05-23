import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api"

def print_step(msg):
    print(f"\n[*] {msg}")

def test_api():
    unique_suffix = str(uuid.uuid4())[:8]
    test_user = {
        "username": f"testuser_{unique_suffix}",
        "email": f"test_{unique_suffix}@example.com",
        "password": "SecurePassword123!",
        "role": "STUDENT"
    }
    
    print_step("1. Testing Registration Endpoint (POST /auth/register/)")
    res = requests.post(f"{BASE_URL}/auth/register/", json=test_user)
    print(f"Status: {res.status_code}")
    
    print_step("2. Testing Login Endpoint (POST /auth/login/)")
    res = requests.post(f"{BASE_URL}/auth/login/", json={
        "username": test_user["username"],
        "password": test_user["password"]
    })
    print(f"Status: {res.status_code}")
    if res.status_code != 200:
        print("Login failed!")
        return
        
    token = res.json().get('access')
    headers = {"Authorization": f"Bearer {token}"}
    
    print_step("3. Testing Profile Auto-Creation (GET /shared/profiles/me/)")
    res = requests.get(f"{BASE_URL}/shared/profiles/me/", headers=headers)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        profile_data = res.json()
        print(f"Profile ID: {profile_data.get('id')}")
        print(f"Current Bio: {profile_data.get('bio')}")
        
    print_step("4. Testing Profile Update (PATCH /shared/profiles/me/)")
    update_data = {
        "bio": "This is a backend automated test bio!",
        "college": "Test University"
    }
    res = requests.patch(f"{BASE_URL}/shared/profiles/me/", headers=headers, json=update_data)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        print(f"Updated Bio: {res.json().get('bio')}")
        print(f"Updated College: {res.json().get('college')}")
        print("Success! Profile saving works perfectly.")

if __name__ == "__main__":
    test_api()
