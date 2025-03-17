var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { describe, it } from 'node:test';
import request from 'supertest';
import app from '../index.js';
describe('URL Shortener API', () => {
    it('should create a new short URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app)
            .post('/api/shorten')
            .send({ longUrl: 'https://example.com' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('shortUrl');
    }));
});
