const express = require("express");
const router = express.Router();
const airlineController = require("../controllers/airline.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Airline
 *   description: Airline management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Airline:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: The airline code (2 uppercase letters)
 *         name:
 *           type: string
 *           description: The name of the airline
 */

/**
 * @swagger
 * /airline:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new airline (Admin only)
 *     tags: [Airline]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Airline'
 *     responses:
 *       201:
 *         description: Airline created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airline'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 */
router.post(
  "/airline",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAirlineInput,
  airlineController.createAirline
);

/**
 * @swagger
 * /airline:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all airlines
 *     tags: [Airline]
 *     responses:
 *       200:
 *         description: List of airlines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Airline'
 *       401:
 *         description: Unauthorized, valid JWT token required
 */
router.get("/airline", authenticate, airlineController.getAirlines);

/**
 * @swagger
 * /airline/{code}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get an existing airline
 *     tags: [Airline]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: The airline code (2 uppercase letters)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Airline found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airline'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Airline not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get(
  "/airline/:code",
  authenticate,
  validationMiddleware.validateAirlineKey,
  airlineController.getAirline
);

/**
 * @swagger
 * /airline/{code}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an existing airline (Admin only)
 *     tags: [Airline]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: The airline code (2 uppercase letters)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the airline
 *     responses:
 *       200:
 *         description: Airline updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airline'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Airline not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put(
  "/airline/:code",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAirlineInput,
  airlineController.updateAirline
);

/**
 * @swagger
 * /airline/{code}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete an existing airline (Admin only)
 *     tags: [Airline]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: The airline code (2 uppercase letters)
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Airline deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Airline not found
 */
router.delete(
  "/airline/:code",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAirlineKey,
  airlineController.deleteAirline
);

module.exports = router;
