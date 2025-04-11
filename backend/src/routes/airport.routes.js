const express = require("express");
const router = express.Router();
const airportController = require("../controllers/airport.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Airport
 *   description: Airport management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Airport:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: The airport code (3 uppercase letters)
 *         city:
 *           type: string
 *           description: The city where the airport is located
 */

/**
 * @swagger
 * /airport:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new airport (Admin only)
 *     tags: [Airport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Airport'
 *     responses:
 *       201:
 *         description: Airport created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airport'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 */
router.post(
  "/airport",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAirportInput,
  airportController.createAirport
);

/**
 * @swagger
 * /airport:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all airports
 *     tags: [Airport]
 *     responses:
 *       200:
 *         description: List of airports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Airport'
 *       401:
 *         description: Unauthorized, valid JWT token required
 */
router.get("/airport", authenticate, airportController.getAirports);

/**
 * @swagger
 * /airport/{code}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get an existing airport
 *     tags: [Airport]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: The airport code (3 uppercase letters)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Airport found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airport'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Airport not found
 */
router.get(
  "/airport/:code",
  authenticate,
  validationMiddleware.validateAirportKey,
  airportController.getAirport
);

/**
 * @swagger
 * /airport/{code}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an existing airport (Admin only)
 *     tags: [Airport]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: The airport code (3 uppercase letters)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *                 description: The new city of the airport
 *     responses:
 *       200:
 *         description: Airport updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airport'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Airport not found
 */
router.put(
  "/airport/:code",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAirportInput,
  airportController.updateAirport
);

/**
 * @swagger
 * /airport/{code}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete an airport (Admin only)
 *     tags: [Airport]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: The airport code (3 uppercase letters)
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Airport deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Airport not found
 */
router.delete(
  "/airport/:code",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAirportKey,
  airportController.deleteAirport
);

module.exports = router;
