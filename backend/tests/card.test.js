const request = require('supertest');
const app = require('../server');
const path = require('path');
const fs = require('fs');

describe('Card Routes', () => {
    let token;
    let boardId;
    let cardId;
    const testEmail = `test${Date.now()}@test.com`;

    beforeAll(async () => {
        const registerRes = await request(app).post('/api/auth/register').send({ email: testEmail, password: 'password' });
        token = registerRes.body.token;
        
        const boardRes = await request(app)
            .post('/api/boards')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Board' });
        boardId = boardRes.body.id;

        const cardRes = await request(app)
            .post(`/api/boards/${boardId}/cards`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Card', listName: 'To Do' });
        cardId = cardRes.body.id;
    });

    it('should create a card', async () => {
        const res = await request(app)
            .post(`/api/boards/${boardId}/cards`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'New Card', listName: 'In Progress' });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('New Card');
        expect(res.body.listName).toEqual('In Progress');
    });

    it('should get card comments', async () => {
        const res = await request(app)
            .get(`/api/cards/${cardId}/comments`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should update a card and return 409 on conflict', async () => {
        const oldTimestamp = new Date(Date.now() - 10000).toISOString();
        
        const res = await request(app)
            .put(`/api/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated', clientUpdatedAt: oldTimestamp });
        
        expect(res.statusCode).toEqual(409);
        expect(res.body.msg).toContain('Conflict');
    });

    it('should update a card successfully with recent timestamp', async () => {
        const res = await request(app)
            .put(`/api/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Card', clientUpdatedAt: new Date().toISOString() });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual('Updated Card');
    });

    it('should add a comment', async () => {
        const res = await request(app)
            .post(`/api/cards/${cardId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Test comment', clientUpdatedAt: new Date().toISOString() });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.text).toEqual('Test comment');
    });

    it('should upload an attachment', async () => {
        const testFilePath = path.join(__dirname, 'test.jpg');
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(testFilePath, buffer);

        const res = await request(app)
            .post(`/api/cards/${cardId}/attachments`)
            .set('Authorization', `Bearer ${token}`)
            .attach('file', testFilePath);
        
        fs.unlinkSync(testFilePath);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.filename).toEqual('test.jpg');
    });

    it('should return 401 without auth token', async () => {
        const res = await request(app)
            .post(`/api/boards/${boardId}/cards`)
            .send({ title: 'Unauthorized Card', listName: 'To Do' });
        
        expect(res.statusCode).toEqual(401);
    });
});