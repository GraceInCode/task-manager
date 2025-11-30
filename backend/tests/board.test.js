const request = require('supertest');
const app = require('../server');

describe('Board Routes', () => {
    let token;
    let boardId;
    const testEmail = `test${Date.now()}@test.com`;

    beforeAll(async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: 'password' });
        token = registerRes.body.token;
    });

    it('should create a board', async () => {
        const res = await request(app)
            .post('/api/boards')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Board' });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('Test Board');
        boardId = res.body.id;
    });

    it('should get all boards', async () => {
        const res = await request(app)
            .get('/api/boards')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get a specific board', async () => {
        const res = await request(app)
            .get(`/api/boards/${boardId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toEqual(boardId);
    });

    it('should update a board', async () => {
        const res = await request(app)
            .put(`/api/boards/${boardId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Board' });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual('Updated Board');
    });

    it('should delete a board', async () => {
        const res = await request(app)
            .delete(`/api/boards/${boardId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
    });

    it('should return 401 without auth token', async () => {
        const res = await request(app)
            .get('/api/boards');
        
        expect(res.statusCode).toEqual(401);
    });
});
