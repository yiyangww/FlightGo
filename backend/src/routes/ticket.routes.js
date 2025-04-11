const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const validationMiddleware = require("../middleware/validation.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Ticket
 *   description: Ticket management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ticket ID
 *         passenger_id:
 *           type: integer
 *           description: The passenger ID
 *         flight_id:
 *           type: integer
 *           description: The flight ID
 *         seat_number:
 *           type: integer
 *           description: The seat number
 *         price:
 *           type: number
 *           format: float
 *           description: The ticket price
 */

/**
 * @swagger
 * /ticket:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new ticket
 *     tags: [Ticket]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input, no available tickets, or seat not available
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Passenger, flight, or seat not found
 */
router.post(
  "/ticket",
  authenticate,
  validationMiddleware.validateTicketInput,
  ticketController.createTicket
);

/**
 * @swagger
 * /ticket/mytickets:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get current user's tickets or tickets by passenger ID
 *     tags: [Ticket]
 *     parameters:
 *       - in: query
 *         name: passengerId
 *         schema:
 *           type: integer
 *         description: Optional passenger ID to filter tickets (if not provided, returns all tickets for the authenticated user)
 *     responses:
 *       200:
 *         description: List of tickets for the user or specified passenger
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden You can only access tickets for your own passengers
 *       404:
 *         description: No tickets found
 */
router.get(
  "/ticket/mytickets",
  authenticate,
  ticketController.getMyTickets
);

/**
 * @swagger
 * /ticket:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all tickets (admin only)
 *     tags: [Ticket]
 *     responses:
 *       200:
 *         description: List of all tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       403:
 *         description: Forbidden, admin access required
 */
router.get("/ticket", authenticate, authorize(['ADMIN']), ticketController.getTickets);

/**
 * @swagger
 * /ticket/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get a ticket by ID
 *     tags: [Ticket]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ticket ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Ticket not found
 */
router.get(
  "/ticket/:id",
  authenticate,
  validationMiddleware.validateTicketKey,
  ticketController.getTicket
);

/**
 * @swagger
 * /ticket/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a ticket
 *     tags: [Ticket]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ticket ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seat_number:
 *                 type: integer
 *                 description: The new seat number
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The new ticket price
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input or new seat not available
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Ticket or new seat not found
 */
router.put(
  "/ticket/:id",
  authenticate,
  validationMiddleware.validateTicketKey,
  validationMiddleware.validateTicketInput,
  ticketController.updateTicket
);

/**
 * @swagger
 * /ticket/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a ticket
 *     tags: [Ticket]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ticket ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Ticket deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized, valid JWT token required
 *       404:
 *         description: Ticket not found
 */
router.delete(
  "/ticket/:id",
  authenticate,
  validationMiddleware.validateTicketKey,
  ticketController.deleteTicket
);

module.exports = router;
