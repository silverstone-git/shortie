import { describe, it } from 'node:test';
import request from 'supertest';
import app from '../index.ts';


describe('URL Shortener API', () => {
  it('should create a new short URL', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://example.com' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('shortUrl');
  });
});


