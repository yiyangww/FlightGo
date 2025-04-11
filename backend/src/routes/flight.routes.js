const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flight.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Flight
 *   description: Flight management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Flight:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The flight ID
 *         flight_number:
 *           type: integer
 *           description: The route flight number
 *         airline_code:
 *           type: string
 *           description: The airline code (2 uppercase letters)
 *         date:
 *           type: string
 *           format: date
 *           description: The flight date (YYYY-MM-DD)
 *         available_tickets:
 *           type: integer
 *           description: Number of available tickets
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the flight
 *         version:
 *           type: integer
 *           description: Version for optimistic concurrency
 */

/**
 * @swagger
 * /flight:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new flight (Admin only)
 *     tags: [Flight]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Flight'
 *     responses:
 *       201:
 *         description: Flight created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flight'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Route not found
 */
router.post(
  "/flight",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateFlightInput,
  flightController.createFlight
);

/**
 * @swagger
 * /flight:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all flights
 *     tags: [Flight]
 *     responses:
 *       200:
 *         description: List of flights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Flight'
 *       401:
 *         description: Unauthorized, valid JWT token required
 */
router.get("/flight", authenticate, flightController.getFlights);

/**
 * @swagger
 * /flight/search:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Search flights with filters
 *     tags: [Flight]
 *     parameters:
 *       - in: query
 *         name: departure_airport
 *         schema:
 *           type: string
 *         description: Departure airport code (3 uppercase letters)
 *       - in: query
 *         name: destination_airport
 *         schema:
 *           type: string
 *         description: Destination airport code (3 uppercase letters)
 *       - in: query
 *         name: min_departure_time
 *         schema:
 *           type: string
 *         description: Minimum departure time (HH:mm)
 *       - in: query
 *         name: max_departure_time
 *         schema:
 *           type: string
 *         description: Maximum departure time (HH:mm)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Flight date (YYYY-MM-DD)
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: min_duration
 *         schema:
 *           type: integer
 *         description: Minimum flight duration in minutes
 *       - in: query
 *         name: max_duration
 *         schema:
 *           type: integer
 *         description: Maximum flight duration in minutes
 *     responses:
 *       200:
 *         description: List of matching flights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Flight'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized, valid JWT token required
 */
router.get(
  "/flight/search",
  authenticate,
  validationMiddleware.validateFlightSearchParams,
  flightController.searchFlights
);

/**
 * @swagger
 * /flight/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get an existing flight
 *     tags: [Flight]
 *     parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: The flight ID
 *          schema:
 *            type: integer
 *     responses:
 *       200:
 *         description: Flight found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flight'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Flight not found
 */
router.get(
  "/flight/:id",
  authenticate,
  validationMiddleware.validateFlightKey,
  flightController.getFlight
);

/**
 * @swagger
 * /flight/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an existing flight (Admin only)
 *     tags: [Flight]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The flight ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               available_tickets:
 *                 type: integer
 *               price:
 *                 type: number
 *                 format: float
 *               version:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Flight updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flight'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Flight not found
 *       409:
 *         description: Version conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 currentVersion:
 *                   type: integer
 */
router.put(
  "/flight/:id",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateFlightKey,
  validationMiddleware.validateFlightInput,
  flightController.updateFlight
);

/**
 * @swagger
 * /flight/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a flight (Admin only)
 *     tags: [Flight]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The flight ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Flight deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Flight not found
 */
router.delete(
  "/flight/:id",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateFlightKey,
  flightController.deleteFlight
);

module.exports = router;
