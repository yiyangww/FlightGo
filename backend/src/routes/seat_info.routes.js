const express = require("express");
const router = express.Router();
const seatInfoController = require("../controllers/seat_info.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: SeatInfo
 *   description: Seat information management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SeatInfo:
 *       type: object
 *       properties:
 *         flight_id:
 *           type: integer
 *           description: The flight ID
 *         seat_number:
 *           type: integer
 *           description: The seat number
 *         seat_status:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE, BOOKED]
 *           description: The status of the seat
 *         version:
 *           type: integer
 *           description: Version for optimistic concurrency
 */

/**
 * @swagger
 * /seat:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new seat info
 *     tags: [SeatInfo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               flight_id:
 *                 type: integer
 *                 description: The flight ID
 *               seat_number:
 *                 type: integer
 *                 description: The seat number
 *               seat_status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE, BOOKED]
 *                 description: The seat status
 *     responses:
 *       201:
 *         description: Seat info created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeatInfo'
 *       400:
 *         description: Invalid input or seat number exceeds capacity
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Flight not found
 */
router.post(
  "/seat",
  authenticate,
  validationMiddleware.validateSeatInfoInput,
  seatInfoController.createSeatInfo
);

/**
 * @swagger
 * /seat:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all seat infos
 *     tags: [SeatInfo]
 *     responses:
 *       200:
 *         description: List of seat infos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SeatInfo'
 *       401:
 *         description: Unauthorized, valid JWT token required
 */
router.get("/seat", authenticate, seatInfoController.getSeatInfos);

/**
 * @swagger
 * /seat/{flight_id}/{seat_number}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get a seat info
 *     tags: [SeatInfo]
 *     parameters:
 *       - in: path
 *         name: flight_id
 *         required: true
 *         description: The flight ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: seat_number
 *         required: true
 *         description: The seat number
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seat info found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeatInfo'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Seat info not found
 */
router.get(
  "/seat/:flight_id/:seat_number",
  authenticate,
  validationMiddleware.validateSeatInfoKey,
  seatInfoController.getSeatInfo
);

/**
 * @swagger
 * /seat/{flight_id}/{seat_number}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a seat info
 *     tags: [SeatInfo]
 *     parameters:
 *       - in: path
 *         name: flight_id
 *         required: true
 *         description: The flight ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: seat_number
 *         required: true
 *         description: The seat number
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seat_status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE, BOOKED]
 *               version:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Seat info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeatInfo'
 *       400:
 *         description: Invalid input or cannot update booked seat
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Seat info not found
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
  "/seat/:flight_id/:seat_number",
  authenticate,
  validationMiddleware.validateSeatInfoKey,
  validationMiddleware.validateSeatInfoInput,
  seatInfoController.updateSeatInfo
);

/**
 * @swagger
 * /seat/{flight_id}/{seat_number}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a seat info
 *     tags: [SeatInfo]
 *     parameters:
 *       - in: path
 *         name: flight_id
 *         required: true
 *         description: The flight ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: seat_number
 *         required: true
 *         description: The seat number
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Seat info deleted successfully
 *       400:
 *         description: Cannot delete seat info with associated tickets
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Seat info not found
 */
router.delete(
  "/seat/:flight_id/:seat_number",
  authenticate,
  validationMiddleware.validateSeatInfoKey,
  seatInfoController.deleteSeatInfo
);

module.exports = router;
