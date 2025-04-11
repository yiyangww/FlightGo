const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlightGo Backend API',
      version: '1.0.0',
      description: 'FlightGo Backend API',
    },
    servers: [
      {
        url: `${process.env.BACKEND_URL}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // './src/models/*.js',
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };