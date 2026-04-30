const request = require('supertest');

// Mock node-cron to prevent background tasks from running during tests
jest.mock('node-cron', () => ({
    schedule: jest.fn()
}));

// Mock the database
const mockQuery = jest.fn().mockResolvedValue({ recordset: [] });
const mockInput = jest.fn().mockReturnThis();

const mockRequest = {
    input: mockInput,
    query: mockQuery
};

const mockTransaction = {
    begin: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
};

const mockPool = {
    request: jest.fn(() => mockRequest)
};

jest.mock('./config/db', () => ({
    sql: {
        Transaction: jest.fn(() => mockTransaction),
        Request: jest.fn(() => mockRequest)
    },
    poolPromise: Promise.resolve(mockPool)
}));

describe('Backend API Tests', () => {
    let server;
    const testPort = 5010;
    const baseURL = `http://localhost:${testPort}`;

    beforeAll((done) => {
        // Set test port
        process.env.PORT = testPort;
        // Require server.js which will start the server on testPort
        // It does not export the app, but we can hit the URL
        require('./server');
        // Give it a small delay to bind
        setTimeout(done, 1000);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('GET / should return health check', async () => {
        const res = await request(baseURL).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('Backend is running!');
    });

    it('GET /api/customers should return customers', async () => {
        mockQuery.mockResolvedValueOnce({ recordset: [{ id: 1, name: 'Test Customer' }] });
        
        const res = await request(baseURL).get('/api/customers');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0].name).toBe('Test Customer');
        expect(mockPool.request).toHaveBeenCalled();
    });

    it('POST /api/customers should create a customer', async () => {
        mockQuery.mockResolvedValueOnce({ recordset: [{ id: 10 }] });
        
        const res = await request(baseURL)
            .post('/api/customers')
            .send({ name: 'New Customer', phone: '1234567890' });
            
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.id).toBe(10);
    });

    it('GET /api/transactions should return transactions', async () => {
        mockQuery.mockResolvedValueOnce({ recordset: [{ id: 1, amount: 100 }] });
        
        const res = await request(baseURL).get('/api/transactions');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0].amount).toBe(100);
    });

    it('GET /api/profile should return shop profile', async () => {
        mockQuery.mockResolvedValueOnce({ recordset: [{ shopName: 'Test Shop', phone: '111' }] });
        
        const res = await request(baseURL).get('/api/profile');
        expect(res.statusCode).toEqual(200);
        expect(res.body.shopName).toBe('Test Shop');
    });
});
