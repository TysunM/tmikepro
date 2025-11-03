import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

const router = express.Router();

// Serve HTML views
router.get('/', (req, res) => res.sendFile(path.join(projectRoot, 'views', 'index.html')));
router.get('/login', (req, res) => res.sendFile(path.join(projectRoot, 'views', 'login.html')));
router.get('/signup', (req, res) => res.sendFile(path.join(projectRoot, 'views', 'signup.html')));
router.get('/dashboard', (req, res) => res.sendFile(path.join(projectRoot, 'views', 'dashboard.html')));
router.get('/admin', (req, res) => res.sendFile(path.join(projectRoot, 'views', 'admin.html')));

export default router;
