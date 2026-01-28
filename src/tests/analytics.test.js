import request from 'supertest';
import app from '../app.js';

describe('Analytics API', () => {
  
  describe('GET /analytics/user', () => {
    
    test('debería retornar 400 si falta el parámetro id', async () => {
      const response = await request(app).get('/analytics/user');
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid or missing 'id' parameter." });
    });

    test('debería retornar 200 y datos del usuario con id válido', async () => {
      const response = await request(app).get('/analytics/user?id=44322889');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('login');
      expect(response.body).toHaveProperty('display_name');
    }, 10000)

    test('debería retornar 404 si el usuario no existe', async () => {
      const response = await request(app).get('/analytics/user?id=999999999999');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found." });
    }, 10000);
  });

  describe('GET /analytics/streams', () => {
    
    test('debería retornar 200 y lista de streams con paginación', async () => {
      const response = await request(app).get('/analytics/streams');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('title');
        expect(response.body.data[0]).toHaveProperty('user_name');
      }
    }, 10000);

    test('debería soportar el parámetro first', async () => {
      const response = await request(app).get('/analytics/streams?first=5');
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    }, 10000);
  });
});