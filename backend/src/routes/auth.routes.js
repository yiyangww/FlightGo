const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const passport = require('../config/passport');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *                 description: Username (must be in email format)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *               role:
 *                 type: string
 *                 description: User role (optional, defaults to USER)
 *                 enum: [USER, ADMIN]
 *                 default: USER
 *           example:
 *             username: "user@example.com"
 *             password: "password123"
 *             role: "USER"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       example: "USER"
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *                 description: Username (must be in email format)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *           example:
 *             username: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       example: "USER"
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/myinfo:
 *   get:
 *     summary: Test endpoint accessible by both USER and ADMIN roles
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       example: "USER"
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 */
router.get('/myinfo', authenticate, authorize(['USER', 'ADMIN']), authController.getCurrentUser);

/**
 * @swagger
 * /auth/authUser:
 *   get:
 *     summary: Endpoint accessible only by USER role
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       example: "USER"
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions (ADMIN role cannot access this endpoint)
 */
router.get('/authUser', authenticate, authorize(['USER']), authController.getCurrentUser);

/**
 * @swagger
 * /auth/authAdmin:
 *   get:
 *     summary: Endpoint accessible only by ADMIN role
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "admin@example.com"
 *                     role:
 *                       type: string
 *                       example: "ADMIN"
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions (USER role cannot access this endpoint)
 */
router.get('/authAdmin', authenticate, authorize(['ADMIN']), authController.getCurrentUser);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Auth]
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 */
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      req.authInfo = info || {};
      req.authError = err;
      req.authUser = user;
      
      authController.googleCallback(req, res, next);
    })(req, res, next);
  });

module.exports = router;