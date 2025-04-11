const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const PDFDocument = require('pdfkit');
const { PrismaClient } = require('@prisma/client');
const { minutesToTime, formatDuration } = require('../utils/time.utils');
const prisma = new PrismaClient();

class PdfUploadController {
  constructor() {
    // Set up AWS S3 client for Digital Ocean Spaces
    this.s3Client = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: process.env.DO_SPACES_REGION,
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET
      },
      forcePathStyle: false 
    });
    
    this.bucketName = process.env.DO_SPACES_BUCKET;
    
    this.uploadTestPdf = this.uploadTestPdf.bind(this);
    this.generateAndUploadPdf = this.generateAndUploadPdf.bind(this);
    this.getTicketData = this.getTicketData.bind(this);
    this.getPassengerData = this.getPassengerData.bind(this);
    this.uploadPdfToStorage = this.uploadPdfToStorage.bind(this);
    this.generateTicketPdf = this.generateTicketPdf.bind(this);
  }

  /**
   * Upload test PDF file
   */
  async uploadTestPdf(req, res) {
    try {
      // Get the path to the test PDF file
      const testPdfPath = path.join(__dirname, '../../testpdf/testpdf.pdf');
      const fileContent = await readFileAsync(testPdfPath);
      
      // Generate a unique file name
      const fileName = `test-${Date.now()}.pdf`;
      
      // Upload the file
      const uploadResult = await this.uploadPdfToStorage(fileContent, fileName);
      
      return res.status(200).json({
        success: true,
        data: uploadResult
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading PDF',
        error: error.message
      });
    }
  }
  
  /**
   * Generate a PDF ticket based on passenger ID and/or ticket ID and upload it
   */
  async generateAndUploadPdf(req, res) {
    try {
      const passengerId = req.query.passengerId ? parseInt(req.query.passengerId) : null;
      const ticketId = req.query.ticketId ? parseInt(req.query.ticketId) : null;
      
      // Check if at least one ID is provided
      if (!passengerId && !ticketId) {
        return res.status(400).json({
          success: false,
          message: 'At least one of passengerId or ticketId must be provided'
        });
      }

      // Get data based on the provided parameters
      let data;
      if (ticketId) {
        data = await this.getTicketData(ticketId, passengerId);
      } else {
        data = await this.getPassengerData(passengerId);
      }
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'No ticket found for the provided passengerId or ticketId'
        });
      }

      // Generate PDF
      const pdfBuffer = await this.generateTicketPdf(data);
      
      // Generate a unique file name
      const idPart = ticketId ? `ticket-${ticketId}` : `passenger-${passengerId}`;
      const fileName = `${idPart}-${Date.now()}.pdf`;
      
      // Upload PDF
      const uploadResult = await this.uploadPdfToStorage(pdfBuffer, fileName);
      
      return res.status(200).json({
        success: true,
        data: uploadResult
      });
    } catch (error) {
      console.error('Error generating and uploading PDF:', error);
      return res.status(500).json({
        success: false,
        message: 'Error generating and uploading PDF',
        error: error.message
      });
    }
  }

  /**
   * Get the data of a single ticket
   * @param {number} ticketId - Ticket ID
   * @param {number|null} passengerId - Optional passenger ID, used to verify ticket ownership
   * @returns {Promise<Object|null>} - Ticket data or null
   */
  async getTicketData(ticketId, passengerId = null) {
    const whereClause = { id: ticketId };
    
    // If passenger ID is provided, verify ticket ownership
    if (passengerId) {
      whereClause.passenger_id = passengerId;
    }
    
    const ticket = await prisma.ticket.findFirst({
      where: whereClause,
      include: {
        passenger: true,
        flight: {
          include: {
            route: {
              include: {
                airline: true,
                departure_airport_rel: true,
                destination_airport_rel: true,
                aircraft: true
              }
            }
          }
        },
        seat_info: true
      }
    });
    
    if (!ticket) return null;
    
    // Construct data structure in the same format as getPassengerData
    return {
      ...ticket.passenger,
      tickets: [ticket]
    };
  }

  /**
   * Get all ticket data for a passenger
   * @param {number} passengerId - Passenger ID
   * @returns {Promise<Object|null>} - Passenger data or null
   */
  async getPassengerData(passengerId) {
    const passenger = await prisma.passenger.findUnique({
      where: { id: passengerId },
      include: {
        tickets: {
          include: {
            flight: {
              include: {
                route: {
                  include: {
                    airline: true,
                    departure_airport_rel: true,
                    destination_airport_rel: true,
                    aircraft: true
                  }
                }
              }
            },
            seat_info: true
          }
        }
      }
    });
    
    if (!passenger || passenger.tickets.length === 0) return null;
    
    return passenger;
  }

  /**
   * Upload PDF to storage service
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @param {string} fileName - File name
   * @returns {Promise<Object>} - Upload result
   */
  async uploadPdfToStorage(pdfBuffer, fileName) {
    // Set upload parameters
    const params = {
      Bucket: this.bucketName,
      Key: `pdfs/${fileName}`,
      Body: pdfBuffer,
      ACL: 'public-read',
      ContentType: 'application/pdf'
    };
    
    // Use Upload class to upload
    const upload = new Upload({
      client: this.s3Client,
      params: params
    });

    const uploadResult = await upload.done();
    
    // Build URL
    const spacesEndpoint = process.env.DO_SPACES_ENDPOINT.replace('https://', '');
    const fileUrl = `https://${this.bucketName}.${spacesEndpoint}/pdfs/${fileName}`;
    
    return {
      url: fileUrl,
      key: uploadResult.Key
    };
  }

  /**
   * Generate a ticket PDF
   * @param {Object} data - Passenger information and its tickets
   * @returns {Promise<Buffer>} - PDF file buffer
   */
  async generateTicketPdf(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];

        // Collect PDF data blocks
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', err => reject(err));

        // Add title
        doc.fontSize(20).text('Flight Ticket', { align: 'center' });
        doc.moveDown();

        // Add passenger information
        doc.fontSize(16).text('Passenger Information');
        doc.fontSize(12).text(`Name: ${data.name}`);
        doc.text(`Birth Date: ${data.birth_date.toISOString().split('T')[0]}`);
        doc.text(`Gender: ${data.gender}`);
        if (data.address) doc.text(`Address: ${data.address}`);
        if (data.phone_number) doc.text(`Phone Number: ${data.phone_number}`);
        doc.moveDown();

        // Add information for each ticket
        data.tickets.forEach((ticket, index) => {
          const flight = ticket.flight;
          const route = flight.route;
          
          doc.fontSize(16).text(`Ticket #${index + 1}`);
          doc.fontSize(12).text(`Airline: ${route.airline.name} (${route.airline_code})`);
          doc.text(`Flight Number: ${route.flight_number}`);
          doc.text(`Departure Airport: ${route.departure_airport_rel.city} (${route.departure_airport})`);
          doc.text(`Destination Airport: ${route.destination_airport_rel.city} (${route.destination_airport})`);
          doc.text(`Departure Date: ${flight.date.toISOString().split('T')[0]}`);
          doc.text(`Departure Time: ${minutesToTime(route.departure_time)}`);
          doc.text(`Flight Duration: ${formatDuration(route.duration)}`);
          doc.text(`Seat Number: ${ticket.seat_number}`);
          doc.text(`Price: $${ticket.price}`);
          doc.moveDown();
        });

        // Add footer
        doc.fontSize(10).text(`Generated on: ${new Date().toISOString()}`, { align: 'right' });

        // Complete PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PdfUploadController();