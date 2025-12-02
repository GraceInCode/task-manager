const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) return res.status(400).json({ msg: 'Email, username, and password are required' });

    try {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) return res.status(400).json({ msg: 'Email already exists' });

        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) return res.status(400).json({ msg: 'Username already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { email, username, password: hashed } });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (error) {
        console.error('Registration error:', error.message, error.stack);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (error) {
        console.error('Login error:', error.message, error.stack);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
};

exports.updateUsername = async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ msg: 'Username is required' });

    try {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing && existing.id !== req.user.id) {
            return res.status(400).json({ msg: 'Username already taken' });
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { username },
            select: { id: true, email: true, username: true }
        });
        res.json(user);
    } catch (error) {
        console.error('Update username error:', error.message, error.stack);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, username: true }
        });
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error.message, error.stack);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
}