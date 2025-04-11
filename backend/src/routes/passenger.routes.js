const express = require("express");
const router = express.Router();
const passengerController = require("../controllers/passenger.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Passenger
 *   description: Passenger management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PassengerInput:
 *       type: object
 *       required:
 *         - name
 *         - birth_date
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           description: The passenger name (max 255 characters)
 *         birth_date:
 *           type: string
 *           format: date
 *           description: The passenger birth date (YYYY-MM-DD)
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: The passenger gender
 *         address:
 *           type: string
 *           description: The passenger address (optional, max 255 characters)
 *         phone_number:
 *           type: string
 *           description: The passenger phone number (optional, max 255 characters)
 *     Passenger:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The passenger ID (auto-generated)
 *         name:
 *           type: string
 *           description: The passenger name
 *         birth_date:
 *           type: string
 *           format: date
 *           description: The passenger birth date (YYYY-MM-DD)
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: The passenger gender
 *         address:
 *           type: string
 *           description: The passenger address (optional)
 *         phone_number:
 *           type: string
 *           description: The passenger phone number (optional)
 *         account_id:
 *           type: integer
 *           description: The associated account ID (automatically set from authentication token)
 */

/**
 * @swagger
 * /passenger:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new passenger for the authenticated user
 *     tags: [Passenger]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PassengerInput'
 *     responses:
 *       201:
 *         description: Passenger created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Passenger'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Account not found
 */
router.post(
  "/passenger",
  authenticate,
  validationMiddleware.validatePassengerInput,
  passengerController.createPassenger
);

/**
 * @swagger
 * /passenger/mypassengers:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all passengers based on the authenticated account (JWT token)
 *     tags: [Passenger]
 *     responses:
 *       200:
 *         description: List of all passengers belong to the authenticated account
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Passenger'
 *       400:
 *         description: Invalid account_id format
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Account not found
 */
router.get(
  "/passenger/mypassengers",
  authenticate,
  validationMiddleware.validatePassengerQuery,
  passengerController.getPassengers
);

/**
 * @swagger
 * /passenger/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get a passenger by ID
 *     tags: [Passenger]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The passenger ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Passenger found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Passenger'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Passenger not found
 */
router.get(
  "/passenger/:id",
  authenticate,
  validationMiddleware.validatePassengerKey,
  passengerController.getPassenger
);

/**
 * @swagger
 * /passenger/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a passenger
 *     tags: [Passenger]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The passenger ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The passenger name (max 255 characters)
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 description: The passenger birth date (YYYY-MM-DD)
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: The passenger gender
 *               address:
 *                 type: string
 *                 description: The passenger address (optional, max 255 characters)
 *               phone_number:
 *                 type: string
 *                 description: The passenger phone number (optional, max 255 characters)
 *     responses:
 *       200:
 *         description: Passenger updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Passenger not found
 */
router.put(
  "/passenger/:id",
  authenticate,
  validationMiddleware.validatePassengerKey,
  validationMiddleware.validatePassengerInput,
  passengerController.updatePassenger
);

/**
 * @swagger
 * /passenger/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a passenger
 *     tags: [Passenger]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The passenger ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Passenger deleted successfully
 *       400:
 *         description: Cannot delete passenger with tickets
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Passenger not found
 */
router.delete(
  "/passenger/:id",
  authenticate,
  validationMiddleware.validatePassengerKey,
  passengerController.deletePassenger
);

module.exports = router;
