
import axios from 'axios';
import { describe, it, expect } from 'vitest';

// Use a random suffix to ensure uniqueness for each test run
const timestamp = Date.now();
const username = `testuser_${timestamp}`;
const email = `testuser_${timestamp}@example.com`;
const mobile = `138${timestamp.toString().slice(-8)}`;
// Ensure unique ID No
const idNo = `11010119900101${timestamp.toString().slice(-4)}`;

const API_URL = 'http://localhost:8080/api/v1';

describe('E2E Backend Integration (Real API)', () => {
  it('should register a new user successfully with full details', async () => {
    const payload = {
      username,
      password: 'password123',
      email,
      mobile,
      name: 'Test User',
      id_type: 'id_card',
      id_no: idNo,
      gender: 'male'
    };

    try {
      const response = await axios.post(`${API_URL}/auth/register`, payload);
      
      // Backend returns 201 on success
      expect(response.status).toBe(201);
      
      // Response body is { userId: "..." }
      expect(response.data).toHaveProperty('userId');
      
      console.log('Registered User ID:', response.data.userId);
    } catch (error: any) {
      if (error.response) {
        console.error('Registration error status:', error.response.status);
        console.error('Registration error data:', error.response.data);
      } else {
        console.error('Registration error:', error.message);
      }
      throw error;
    }
  });

  it('should fail to register with duplicate username', async () => {
    const payload = {
        username, // Duplicate
        password: 'password123',
        email: `other_${timestamp}@example.com`,
        mobile: `139${timestamp.toString().slice(-8)}`,
        name: 'Test User 2',
        id_type: 'id_card',
        id_no: `11010119900102${timestamp.toString().slice(-4)}`, // Different ID
        gender: 'female'
    };
    
    try {
        await axios.post(`${API_URL}/auth/register`, payload);
        throw new Error('Should have failed with 409');
    } catch (error: any) {
        if (error.response) {
            expect(error.response.status).toBe(409);
            console.log('Duplicate registration correctly failed with 409');
        } else {
            throw error;
        }
    }
  });

  it('should login with the registered user and return full profile', async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier: username,
        password: 'password123',
      });

      expect(response.status).toBe(200);
      
      // Response body is { user: { ... } }
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.username).toBe(username);
      expect(response.data.user.id_no).toBe(idNo); // Verify ID No is returned
      expect(response.data.user.id_type).toBe('id_card'); // Verify ID Type is returned
      
      console.log('Login successful. User ID No:', response.data.user.id_no);
    } catch (error: any) {
      if (error.response) {
        console.error('Login failed status:', error.response.status);
        console.error('Login failed data:', error.response.data);
      } else {
        console.error('Login failed:', error.message);
      }
      throw error;
    }
  });

  it('should search for trains (Beijing -> Shanghai)', async () => {
    try {
      const response = await axios.get(`${API_URL}/trains/search`, {
        params: {
          fromStationId: 'BJP', 
          toStationId: 'SHH',
          date: '2025-12-05' // Use a date that likely has trains (current date + small offset)
        }
      });
      
      expect(response.status).toBe(200);
      console.log('Search found trains:', response.data.length);
      // We expect at least some trains based on seed data
      // But date might need adjustment. 10-route-bjp-shh.sql seeds for current_date + 13 days
      // So '2025-12-05' is likely valid if today is 2025-12-04
    } catch (error: any) {
       console.error('Search trains failed:', error.message);
       if(error.response) console.error(error.response.data);
       throw error;
    }
  });
});
