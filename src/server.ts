import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 8080;
const SYSTEM_PASSWORD = process.env.NEXUS_PASSWORD || 'nexus2026'; // Default fallback

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet({
    contentSecurityPolicy: false // Disabled temporarily for iFrame media compatibility
}));

// Authentication Middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies.nexus_auth === 'authorized' || req.path === '/login' || req.path === '/auth' || req.path.startsWith('/css')) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.use(requireAuth);

// Auth Endpoints
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.post('/auth', (req, res) => {
    const { password } = req.body;
    if (password === SYSTEM_PASSWORD) {
        res.cookie('nexus_auth', 'authorized', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        res.redirect('/');
    } else {
        res.redirect('/login?error=1');
    }
});

// Serve Static App
app.use(express.static(path.join(__dirname, '../public')));

// System Health Endpoint
app.get('/healthz', (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "spom-nexus",
        version: "1.0.0",
        timestamp: Date.now()
    });
});

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`[SYSTEM] SPOM NEXUS OS Online | PORT: ${PORT}`);
});
