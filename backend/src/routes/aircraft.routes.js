const express = require("express");
const router = express.Router();
const aircraftController = require("../controllers/aircraft.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Aircraft
 *   description: Aircraft management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Aircraft:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The aircraft ID
 *         capacity:
 *           type: integer
 *           description: The capacity of the aircraft
 */

/**
 * @swagger
 * /aircraft:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new aircraft (Admin only)
 *     tags: [Aircraft]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Aircraft'
 *     responses:
 *       201:
 *         description: Aircraft created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aircraft'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 */
router.post(
  "/aircraft",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAircraftInput,
  aircraftController.createAircraft
);

/**
 * @swagger
 * /aircraft:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all aircrafts
 *     tags: [Aircraft]
 *     responses:
 *       200:
 *         description: List of aircrafts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aircraft'
 *       401:
 *         description: Unauthorized, valid JWT token required
 */
router.get("/aircraft", authenticate, aircraftController.getAircrafts);

/**
 * @swagger
 * /aircraft/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get an existing aircraft
 *     tags: [Aircraft]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The aircraft ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Aircraft found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aircraft'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Aircraft not found
 */
router.get(
  "/aircraft/:id",
  authenticate,
  validationMiddleware.validateAircraftKey,
  aircraftController.getAircraft
);

/**
 * @swagger
 * /aircraft/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an existing aircraft
 *     tags: [Aircraft]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The aircraft ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               capacity:
 *                 type: integer
 *                 description: The new capacity of the aircraft
 *     responses:
 *       200:
 *         description: Aircraft updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aircraft'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Aircraft not found
 */
router.put(
  "/aircraft/:id",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAircraftInput,
  aircraftController.updateAircraft
);

/**
 * @swagger
 * /aircraft/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete an aircraft
 *     tags: [Aircraft]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The aircraft ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Aircraft deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Aircraft not found
 */
router.delete(
  "/aircraft/:id",
  authenticate,
  authorize(['ADMIN']),
  validationMiddleware.validateAircraftKey,
  aircraftController.deleteAircraft
);

module.exports = router;
