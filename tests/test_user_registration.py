import pytest
import requests
from unittest.mock import patch, MagicMock


class TestUserRegistration:
    """Integration tests for user registration flow"""
    
    def setup_method(self):
        """Setup for each test method"""
        self.base_url = "http://localhost:8000"
        self.registration_endpoint = f"{self.base_url}/api/users/register"
        
    def test_user_registration_success(self):
        """Test successful user registration"""
        # Arrange
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
        
        # Mock successful registration response
        with patch('requests.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 201
            mock_response.json.return_value = {
                "id": 1,
                "username": "testuser",
                "email": "test@example.com",
                "message": "User registered successfully"
            }
            mock_post.return_value = mock_response
            
            # Act
            response = requests.post(self.registration_endpoint, json=user_data)
            
            # Assert
            assert response.status_code == 201
            response_data = response.json()
            assert response_data["username"] == "testuser"
            assert response_data["email"] == "test@example.com"
            assert "message" in response_data
            
    def test_user_registration_duplicate_email(self):
        """Test user registration failure with duplicate email"""
        # Arrange
        user_data = {
            "username": "testuser2",
            "email": "existing@example.com",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
        
        # Mock duplicate email error response
        with patch('requests.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 400
            mock_response.json.return_value = {
                "error": "Email already exists",
                "field": "email"
            }
            mock_post.return_value = mock_response
            
            # Act
            response = requests.post(self.registration_endpoint, json=user_data)
            
            # Assert
            assert response.status_code == 400
            response_data = response.json()
            assert "error" in response_data
            assert "Email already exists" in response_data["error"]
            
    def test_user_registration_invalid_password(self):
        """Test user registration failure with invalid password"""
        # Arrange
        user_data = {
            "username": "testuser3",
            "email": "test3@example.com",
            "password": "weak",
            "confirm_password": "weak"
        }
        
        # Mock invalid password error response
        with patch('requests.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 400
            mock_response.json.return_value = {
                "error": "Password must be at least 8 characters long",
                "field": "password"
            }
            mock_post.return_value = mock_response
            
            # Act
            response = requests.post(self.registration_endpoint, json=user_data)
            
            # Assert
            assert response.status_code == 400
            response_data = response.json()
            assert "error" in response_data
            assert "Password must be at least 8 characters long" in response_data["error"]
            
    def test_user_registration_password_mismatch(self):
        """Test user registration failure with password mismatch"""
        # Arrange
        user_data = {
            "username": "testuser4",
            "email": "test4@example.com",
            "password": "SecurePass123!",
            "confirm_password": "DifferentPass123!"
        }
        
        # Mock password mismatch error response
        with patch('requests.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 400
            mock_response.json.return_value = {
                "error": "Passwords do not match",
                "field": "confirm_password"
            }
            mock_post.return_value = mock_response
            
            # Act
            response = requests.post(self.registration_endpoint, json=user_data)
            
            # Assert
            assert response.status_code == 400
            response_data = response.json()
            assert "error" in response_data
            assert "Passwords do not match" in response_data["error"]
            
    def test_user_registration_missing_fields(self):
        """Test user registration failure with missing required fields"""
        # Arrange
        user_data = {
            "username": "testuser5",
            "email": "test5@example.com"
            # Missing password fields
        }
        
        # Mock missing fields error response
        with patch('requests.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 400
            mock_response.json.return_value = {
                "error": "Missing required fields",
                "missing_fields": ["password", "confirm_password"]
            }
            mock_post.return_value = mock_response
            
            # Act
            response = requests.post(self.registration_endpoint, json=user_data)
            
            # Assert
            assert response.status_code == 400
            response_data = response.json()
            assert "error" in response_data
            assert "Missing required fields" in response_data["error"]
            assert "missing_fields" in response_data
