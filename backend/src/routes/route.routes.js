const express = require("express");
const router = express.Router();
const routeController = require("../controllers/route.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Route
 *   description: Route management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Route:
 *       type: object
 *       properties:
 *         flight_number:
 *           type: integer
 *           description: The route flight number
 *         airline_code:
 *           type: string
 *           description: The airline code (2 uppercase letters)
 *         departure_airport:
 *           type: string
 *           description: The departure airport code (3 uppercase letters)
 *         destination_airport:
 *           type: string
 *           description: The destination airport code (3 uppercase letters)
 *         departure_time:
 *           type: string
 *           description: The departure time (HH:mm)
 *         duration:
 *           type: integer
 *           description: Flight duration in minutes
 *         aircraft_id:
 *           type: integer
 *           description: The aircraft ID
 *         start_date:
 *           type: string
 *           format: date
 *           description: Route start date (YYYY-MM-DD)
 *         end_date:
 *           type: string
 *           format: date
 *           description: Route end date (YYYY-MM-DD)
 */

/**
 * @swagger
 * /route:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new route (Admin only)
 *     tags: [Route]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       201:
 *         description: Route created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Airline, airports or aircraft not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post(
  "/route",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateRouteInput,
  routeController.createRoute
);

/**
 * @swagger
 * /route:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all routes
 *     tags: [Route]
 *     responses:
 *       200:
 *         description: List of routes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Route'
 *       401:
 *         description: Unauthorized, valid JWT token required
 */
router.get("/route", authenticate, routeController.getRoutes);

/**
 * @swagger
 * /route/{flight_number}/{airline_code}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get an existing route
 *     tags: [Route]
 *     parameters:
 *       - in: path
 *         name: flight_number
 *         required: true
 *         description: The flight number
 *         schema:
 *           type: integer
 *       - in: path
 *         name: airline_code
 *         required: true
 *         description: The airline code (2 uppercase letters)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Route found
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Route'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Route not found
 */
router.get(
  "/route/:flight_number/:airline_code",
  authenticate,
  validationMiddleware.validateRouteKey,
  routeController.getRoute
);

/**
 * @swagger
 * /route/{flight_number}/{airline_code}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an existing route (Admin only)
 *     tags: [Route]
 *     parameters:
 *       - in: path
 *         name: flight_number
 *         required: true
 *         description: The flight number
 *         schema:
 *           type: integer
 *       - in: path
 *         name: airline_code
 *         required: true
 *         description: The airline code (2 uppercase letters)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       200:
 *         description: Route updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Route not found
 */
router.put(
  "/route/:flight_number/:airline_code",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateRouteKey,
  validationMiddleware.validateRouteInput,
  routeController.updateRoute
);

/**
 * @swagger
 * /route/{flight_number}/{airline_code}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a route (Admin only)
 *     tags: [Route]
 *     parameters:
 *       - in: path
 *         name: flight_number
 *         required: true
 *         description: The flight number
 *         schema:
 *           type: integer
 *       - in: path
 *         name: airline_code
 *         required: true
 *         description: The airline code (2 uppercase letters)
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Route deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Route not found
 */
router.delete(
  "/route/:flight_number/:airline_code",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateRouteKey,
  routeController.deleteRoute
);

module.exports = router;
