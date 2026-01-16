
import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import bodyParser from 'body-parser';
import orderRoutes from '../../src/routes/orders';
import authRoutes from '../../src/routes/auth';
import passengerRoutes from '../../src/routes/passengers';

const app = express();
app.use(bodyParser.json());

// Mock Auth
app.use((req, res, next) => {
    if (req.headers['mock-user-id']) {
        req.user = { id: parseInt(req.headers['mock-user-id'], 10) };
    }
    next();
});

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes); // Needed? No, mocking user.
app.use('/api/passengers', passengerRoutes); // Needed for creating passenger first.

describe('Order Refund Feature', () => {
    let userId;
    let passengerId;
    let orderId;

    // 1. Setup User and Passenger
    // We can just assume a userId 999 for test if we don't need real DB constraints on foreign key user_id?
    // SQLite enforces FK if enabled. init_db.js does not explicitly enable PRAGMA foreign_keys = ON; by default in some versions, but better be safe.
    // Actually, init_db.js does NOT enable foreign keys explicitly in the connection callback.
    // But let's create a real user via a helper or direct SQL if possible, or just register one.
    // Since we mock auth middleware, we can just register a user via API first to get a valid ID.

    beforeAll(async () => {
        // We need the auth route to register a user properly to satisfy FK
        const appForAuth = express();
        appForAuth.use(bodyParser.json());
        appForAuth.use('/api/auth', authRoutes);
        
        // Register User
        const userRes = await request(appForAuth).post('/api/auth/send-sms').send({ phone: '13911112222' });
        const regRes = await request(appForAuth).post('/api/auth/register').send({
            username: 'refund_test_user',
            password: 'password',
            realName: 'Refund User',
            idType: '1',
            idNumber: '110101199001018888',
            phone: '13911112222',
            smsCode: '123456'
        });
        userId = regRes.body.userId;

        // Create Passenger (Self passenger is auto-created now! So we can fetch it)
        // Or just create a new one.
        const appForPassenger = express();
        appForPassenger.use(bodyParser.json());
        appForPassenger.use((req, res, next) => { req.user = { id: userId }; next(); });
        appForPassenger.use('/api/passengers', passengerRoutes);

        const pRes = await request(appForPassenger).get('/api/passengers');
        passengerId = pRes.body.data[0].id;
    });

    it('should create an order successfully', async () => {
        const orderData = {
            trainId: 1, // Assuming seeded
            fromStationId: 1,
            toStationId: 2,
            departureDate: '2023-12-01',
            passengers: [
                { passengerId: passengerId, seatType: 'second', price: 100 }
            ]
        };

        const res = await request(app)
            .post('/api/orders')
            .set('mock-user-id', userId)
            .send(orderData);
        
        expect(res.status).toBe(201);
        orderId = res.body.data.orderId;
    });

    it('should fail to refund unpaid order', async () => {
        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .set('mock-user-id', userId)
            .send({ status: 'refunded' });
        
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Cannot refund');
    });

    it('should pay the order', async () => {
        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .set('mock-user-id', userId)
            .send({ status: 'paid' });
        
        expect(res.status).toBe(200);
    });

    it('should refund the paid order successfully', async () => {
        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .set('mock-user-id', userId)
            .send({ status: 'refunded' });
        
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('退票成功');
    });

    it('should fail to refund already refunded order', async () => {
        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .set('mock-user-id', userId)
            .send({ status: 'refunded' });
        
        expect(res.status).toBe(400);
    });
});
