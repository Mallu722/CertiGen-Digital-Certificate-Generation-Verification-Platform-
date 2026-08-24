import os
import time
import requests
import io
from PIL import Image

BASE_URL = "http://localhost:8000/api"

def create_mock_image():
    img = Image.new('RGB', (100, 100), color = 'blue')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr

def run_tests():
    print("Starting API Integration Tests...\n")
    
    # 1. Register a new user
    username = f"mentor_{int(time.time())}"
    email = f"{username}@example.com"
    password = "password123"
    
    register_payload = {
        "email": email,
        "username": username,
        "first_name": "Test",
        "last_name": "Mentor",
        "password": password,
        "password_confirm": password
    }
    
    print(f"1. Registering user: {email}...")
    r = requests.post(f"{BASE_URL}/accounts/register/", json=register_payload)
    assert r.status_code == 201, f"Failed register: {r.text}"
    register_data = r.json()
    print("   Success! Access token retrieved.")
    
    # 2. Login
    login_payload = {
        "email": email,
        "password": password
    }
    print(f"2. Logging in: {email}...")
    r = requests.post(f"{BASE_URL}/accounts/login/", json=login_payload)
    assert r.status_code == 200, f"Failed login: {r.text}"
    auth_data = r.json()
    access_token = auth_data["access"]
    refresh_token = auth_data["refresh"]
    print("   Success! Login working.")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    # 3. Get Profile
    print("3. Getting profile details...")
    r = requests.get(f"{BASE_URL}/accounts/profile/", headers=headers)
    assert r.status_code == 200, f"Failed profile: {r.text}"
    print(f"   Success! Logged in user: {r.json()['email']}")
    
    # 4. Token Refresh
    print("4. Testing token refresh...")
    r = requests.post(f"{BASE_URL}/accounts/refresh/", json={"refresh": refresh_token})
    assert r.status_code == 200, f"Failed refresh: {r.text}"
    new_access_token = r.json()["access"]
    headers["Authorization"] = f"Bearer {new_access_token}"
    print("   Success! Token refreshed.")
    
    # 5. Create Category
    category_name = f"Category {int(time.time())}"
    category_payload = {
        "name": category_name,
        "description": "API Test Category"
    }
    print(f"5. Creating category: {category_name}...")
    r = requests.post(f"{BASE_URL}/categories/", json=category_payload, headers=headers)
    assert r.status_code == 201, f"Failed category create: {r.text}"
    category_data = r.json()
    category_id = category_data["id"]
    print(f"   Success! Category created with ID: {category_id}")
    
    # 6. Create Template
    print("6. Creating Certificate Template with image upload...")
    mock_image = create_mock_image()
    template_payload = {
        "name": "Gold Achievement Certificate",
        "description": "An elegant gold certificate for achievements",
        "category": category_id,
        "is_active": True
    }
    files = {
        "image": ("test_template.png", mock_image, "image/png")
    }
    r = requests.post(f"{BASE_URL}/templates/", data=template_payload, files=files, headers=headers)
    assert r.status_code == 201, f"Failed template create: {r.text}"
    template_data = r.json()
    template_id = template_data["id"]
    print(f"   Success! Template created with ID: {template_id}, active status: {template_data['is_active']}")
    
    # 7. Update Template - Activate/Deactivate
    print("7. Testing Template Deactivation...")
    r = requests.patch(f"{BASE_URL}/templates/{template_id}/", json={"is_active": False}, headers=headers)
    assert r.status_code == 200, f"Failed template update: {r.text}"
    print(f"   Success! Template status updated to: {r.json()['is_active']}")
    
    print("   Re-activating Template...")
    r = requests.patch(f"{BASE_URL}/templates/{template_id}/", json={"is_active": True}, headers=headers)
    assert r.status_code == 200, f"Failed template update: {r.text}"
    
    # 8. Create Certificate
    cert_num = f"CERT-{int(time.time())}"
    certificate_payload = {
        "certificate_number": cert_num,
        "title": "Outstanding Performance",
        "description": "Awarded for exceptional performance in Django APIs",
        "template": template_id,
        "recipient_name": "Alice Smith",
        "recipient_email": "alice@example.com"
    }
    print(f"8. Issuing certificate: {cert_num}...")
    r = requests.post(f"{BASE_URL}/certificates/", json=certificate_payload, headers=headers)
    assert r.status_code == 201, f"Failed certificate create: {r.text}"
    certificate_data = r.json()
    certificate_id = certificate_data["id"]
    verification_id = certificate_data["verification_id"]
    print(f"   Success! Certificate issued with Verification ID: {verification_id}")
    
    # 9. Public Verification
    print(f"9. Verifying certificate publicly (Unauthenticated) using verification ID: {verification_id}...")
    r = requests.get(f"{BASE_URL}/verify/{verification_id}/")
    assert r.status_code == 200, f"Failed certificate verification: {r.text}"
    verification_result = r.json()
    assert verification_result["valid"] == True, "Verification failed"
    print("   Success! Certificate verified as valid:")
    print(f"   - Certificate Number: {verification_result['certificate']['certificate_number']}")
    print(f"   - Recipient Name: {verification_result['certificate']['recipient_name']}")
    print(f"   - Valid: {verification_result['valid']}")
    
    print("\nAll integration tests passed successfully!")

if __name__ == "__main__":
    run_tests()
