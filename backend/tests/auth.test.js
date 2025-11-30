const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
    const testEmail = `test${Date.now()}@test.com`;
    const testPassword = 'password123';

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.token).toBeDefined();
    });

    it('should not register duplicate user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toContain('already exists');
    });

    it('should login with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: testPassword });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
    });

    it('should not login with invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'wrongpassword' });
        
        expect(res.statusCode).toEqual(401);
        expect(res.body.msg).toContain('Invalid');
    });

    it('should not register without email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ password: testPassword });
        
        expect(res.statusCode).toEqual(400);
    });

    it('should not register without password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: `new${Date.now()}@test.com` });
        
        expect(res.statusCode).toEqual(400);
    });
});
