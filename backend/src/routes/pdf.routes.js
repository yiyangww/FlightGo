const express = require('express');
const router = express.Router();
const pdfUploadController = require('../controllers/pdf.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/pdf/test-upload:
 *   post:
 *     summary: Upload a test PDF file
 *     description: Uploads a predefined test PDF file to Digital Ocean Spaces storage
 *     tags:
 *       - PDF
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the uploaded PDF file
 *                       example: https://bucket-name.nyc3.digitaloceanspaces.com/pdfs/test-1234567890.pdf
 *                     key:
 *                       type: string
 *                       description: Storage path of the file
 *                       example: pdfs/test-1234567890.pdf
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error uploading PDF
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/test-upload', authenticate, pdfUploadController.uploadTestPdf);

/**
 * @swagger
 * /api/pdf/generate:
 *   get:
 *     summary: Generate and upload a ticket PDF
 *     description: Generates a ticket PDF based on passenger ID and/or ticket ID and uploads it to Digital Ocean Spaces
 *     tags:
 *       - PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: passengerId
 *         schema:
 *           type: integer
 *         description: Passenger ID (optional if ticketId is provided)
 *       - in: query
 *         name: ticketId
 *         schema:
 *           type: integer
 *         description: Ticket ID (optional if passengerId is provided)
 *     responses:
 *       200:
 *         description: PDF generated and uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the uploaded PDF file
 *                       example: https://bucket-name.nyc3.digitaloceanspaces.com/pdfs/passenger-123-1234567890.pdf
 *                     key:
 *                       type: string
 *                       description: Storage path of the file
 *                       example: pdfs/passenger-123-1234567890.pdf
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Must provide either passenger ID or ticket ID
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Data not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No data found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error generating and uploading PDF
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get('/generate', authenticate, pdfUploadController.generateAndUploadPdf);

module.exports = router;