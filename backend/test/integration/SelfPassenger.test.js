
import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from '../../src/routes/auth';
import passengerRoutes from '../../src/routes/passengers';

// Re-create app for isolation or import from index if possible. 
// Using isolation here to mock middleware easier.
const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Mock authentication middleware
app.use((req, res, next) => {
    // Mock user for passenger routes
    if (req.headers['mock-user-id']) {
        req.user = { id: parseInt(req.headers['mock-user-id'], 10) };
    }
    next();
});

app.use('/api/passengers', passengerRoutes);

describe('Self Passenger Feature', () => {
    const testUser = {
        username: 'testself_' + Date.now(),
        password: 'password123',
        realName: 'Test Self',
        idType: '1',
        idNumber: '11010119900101' + Math.floor(Math.random() * 10000), // Random ID
        phone: '1380013' + Math.floor(Math.random() * 10000),
        passengerType: '成人',
        smsCode: '123456'
    };

    let userId;
    let selfPassengerId;

    beforeAll(async () => {
        // Request SMS first
        await request(app).post('/api/auth/send-sms').send({ phone: testUser.phone });
    });

    it('should auto-create passenger upon registration', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        expect(res.status).toBe(200);
        userId = res.body.userId;
        expect(userId).toBeDefined();

        // Check passengers
        const pRes = await request(app)
            .get('/api/passengers')
            .set('mock-user-id', userId);
        
        expect(pRes.status).toBe(200);
        expect(pRes.body.data.length).toBe(1);
        const passenger = pRes.body.data[0];
        expect(passenger.name).toBe(testUser.realName);
        expect(passenger.id_number).toBe(testUser.idNumber);
        
        selfPassengerId = passenger.id;
    });

    it('should prevent deleting self passenger', async () => {
        const res = await request(app)
            .delete(`/api/passengers/${selfPassengerId}`)
            .set('mock-user-id', userId);
        
        expect(res.status).toBe(403);
        expect(res.body.message).toContain('本人乘车人不可删除');
    });

    it('should allow adding and deleting other passengers', async () => {
        // Add other
        const otherPassenger = {
            name: 'Other Person',
            idType: '1',
            idNumber: '110101199001019999',
            phone: '13900000000',
            type: '成人'
        };

        const addRes = await request(app)
            .post('/api/passengers')
            .set('mock-user-id', userId)
            .send(otherPassenger);
        
        expect(addRes.status).toBe(201);
        const otherId = addRes.body.data.id;

        // Verify count is 2
        const listRes = await request(app)
            .get('/api/passengers')
            .set('mock-user-id', userId);
        expect(listRes.body.data.length).toBe(2);

        // Delete other
        const delRes = await request(app)
            .delete(`/api/passengers/${otherId}`)
            .set('mock-user-id', userId);
        
        expect(delRes.status).toBe(200);

        // Verify count is 1 again
        const listRes2 = await request(app)
            .get('/api/passengers')
            .set('mock-user-id', userId);
        expect(listRes2.body.data.length).toBe(1);
    });
});
