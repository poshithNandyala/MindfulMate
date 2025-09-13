#!/usr/bin/env python3

"""
Test API endpoints to verify everything works
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8080"

def test_connection():
    """Test basic connection"""
    print("1. Testing basic connection...")
    try:
        response = requests.get(f"{BASE_URL}/llm-status/", timeout=5)
        if response.status_code == 200:
            print("   SUCCESS: Backend is reachable")
            return True
        else:
            print(f"   ERROR: Backend returned status {response.status_code}")
    except Exception as e:
        print(f"   ERROR: Cannot connect to backend - {e}")
    return False

def test_journal_api():
    """Test journal API endpoint"""
    print("\n2. Testing journal API...")
    
    test_data = {
        "title": "API Test Journal",
        "entry": "Testing the journal API endpoint to make sure saving works correctly.",
        "username": "api_test_user"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/journal/", json=test_data, timeout=10)
        print(f"   Response status: {response.status_code}")
        print(f"   Response data: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success", False):
                print("   SUCCESS: Journal saved successfully")
                return True
            else:
                print(f"   ERROR: Journal save failed - {data}")
        else:
            print(f"   ERROR: API returned status {response.status_code}")
    except Exception as e:
        print(f"   ERROR: Journal API test failed - {e}")
    
    return False

def test_journal_retrieval():
    """Test journal retrieval"""
    print("\n3. Testing journal retrieval...")
    
    try:
        response = requests.get(f"{BASE_URL}/journal/user/api_test_user", timeout=5)
        if response.status_code == 200:
            data = response.json()
            count = data.get("count", 0)
            print(f"   SUCCESS: Retrieved {count} journals")
            return True
        else:
            print(f"   ERROR: Retrieval returned status {response.status_code}")
    except Exception as e:
        print(f"   ERROR: Journal retrieval failed - {e}")
    
    return False

def test_authentication():
    """Test authentication endpoints"""
    print("\n4. Testing authentication...")
    
    test_user = {
        "username": "test_api_user",
        "email": "test@mindfulmate.com",
        "password": "testpass123"
    }
    
    try:
        # Test registration
        response = requests.post(f"{BASE_URL}/auth/register/", json=test_user, timeout=10)
        print(f"   Registration status: {response.status_code}")
        
        # Test login
        login_response = requests.post(f"{BASE_URL}/auth/login/", json={
            "username": test_user["username"],
            "password": test_user["password"]
        }, timeout=10)
        
        print(f"   Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            data = login_response.json()
            if data.get("success", False):
                print("   SUCCESS: Authentication working")
                return True
        
    except Exception as e:
        print(f"   ERROR: Authentication test failed - {e}")
    
    return False

def main():
    print("MindfulMate API Endpoint Test")
    print("=" * 40)
    
    # Test all endpoints
    connection_ok = test_connection()
    if not connection_ok:
        print("\nERROR: Backend not reachable!")
        print("Please start the backend server:")
        print("cd backend && python simple_start.py")
        return
    
    journal_save_ok = test_journal_api()
    journal_get_ok = test_journal_retrieval()
    auth_ok = test_authentication()
    
    print("\n" + "=" * 40)
    print("TEST RESULTS:")
    print(f"Connection: {'PASS' if connection_ok else 'FAIL'}")
    print(f"Journal Save: {'PASS' if journal_save_ok else 'FAIL'}")
    print(f"Journal Retrieval: {'PASS' if journal_get_ok else 'FAIL'}")
    print(f"Authentication: {'PASS' if auth_ok else 'FAIL'}")
    
    if all([connection_ok, journal_save_ok, journal_get_ok, auth_ok]):
        print("\nALL TESTS PASSED! ✅")
        print("Backend is working correctly.")
        print("You can now start the frontend:")
        print("cd frontend && npm start")
    else:
        print("\nSome tests failed. Check the backend setup.")

if __name__ == "__main__":
    main()
