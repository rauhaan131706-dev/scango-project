const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// DATABASE (Mock - Replace with Supabase)
let users = [];
let orders = [];
let orderId = 1000;

const PRODUCTS = [
    { id: 'PROD-001', name: 'Laptop', price: 999, icon: '💻' },
    { id: 'PROD-002', name: 'Mouse', price: 29, icon: '🖱️' },
    { id: 'PROD-003', name: 'Keyboard', price: 79, icon: '⌨️' },
    { id: 'PROD-004', name: 'Monitor', price: 299, icon: '🖥️' },
    { id: 'PROD-005', name: 'Headphones', price: 149, icon: '🎧' },
    { id: 'PROD-006', name: 'Webcam', price: 89, icon: '📹' }
];

// ==================== AUTH APIs ====================
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    // Mock authentication
    const user = {
        id: Date.now(),
        email,
        token: 'token_' + Math.random().toString(36).substr(2, 9)
    };

    users.push(user);
    res.json({ success: true, user });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

// ==================== PRODUCT APIs ====================
app.get('/api/products', (req, res) => {
    res.json({ success: true, products: PRODUCTS });
});

app.get('/api/products/:id', (req, res) => {
    const product = PRODUCTS.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, product });
});

// ==================== ORDER APIs ====================
app.post('/api/orders/create', (req, res) => {
    const { userId, email, cartItems, totalAmount, paymentMethod, paymentDetails } = req.body;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    const order = {
        orderId: 'ORD' + (orderId++),
        userId,
        email,
        items: cartItems,
        totalAmount,
        paymentMethod,
        paymentDetails: paymentMethod === 'upi' ? { upiId: paymentDetails.upiId } : { cardLast4: paymentDetails.cardLast4 },
        status: 'confirmed',
        timestamp: new Date(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };

    orders.push(order);
    res.json({ success: true, order });
});

app.get('/api/orders/:userId', (req, res) => {
    const userOrders = orders.filter(o => o.userId == req.params.userId);
    res.json({ success: true, orders: userOrders });
});

// ==================== PAYMENT APIs ====================
app.post('/api/payment/process', (req, res) => {
    const { orderId, paymentMethod, amount } = req.body;

    // Mock payment processing
    const paymentId = 'PAY_' + Math.random().toString(36).substr(2, 9);

    res.json({
        success: true,
        paymentId,
        message: 'Payment processed successfully',
        amount,
        method: paymentMethod
    });
});

// ==================== CART APIs ====================
app.post('/api/cart/validate', (req, res) => {
    const { items } = req.body;

    let total = 0;
    const validatedItems = items.map(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        if (!product) {
            throw new Error('Product not found: ' + item.id);
        }
        const itemTotal = product.price * item.qty;
        total += itemTotal;
        return { ...product, qty: item.qty, itemTotal };
    });

    const tax = (total * 0.1).toFixed(2);
    const finalTotal = (total + parseFloat(tax)).toFixed(2);

    res.json({
        success: true,
        items: validatedItems,
        subtotal: total.toFixed(2),
        tax,
        total: finalTotal
    });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server running', timestamp: new Date() });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
});

app.listen(PORT, () => {
    console.log(`✅ ScanGo Server running on http://localhost:${PORT}`);
    console.log(`📱 API: http://localhost:${PORT}/api`);
});