"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const models_1 = require("../models");
const jwtSecret = process.env.SESSION_SECRET || 'dev_secret_key';
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8)
    })
});
exports.registerSchema = registerSchema;
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string()
    })
});
exports.loginSchema = loginSchema;
const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email already exists' } });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await models_1.User.create({ email, password: hashedPassword });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json({
            success: true,
            data: { id: user.id, email: user.email, createdAt: user.createdAt }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({
            success: true,
            data: { id: user.id, email: user.email, createdAt: user.createdAt }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        res.clearCookie('auth_token');
        res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const user = await models_1.User.findByPk(req.user.id, { attributes: ['id', 'email', 'createdAt'] });
        if (!user) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
