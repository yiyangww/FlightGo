const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const airlineRoutes = require("./routes/airline.routes");
const airportRoutes = require("./routes/airport.routes");
const aircraftRoutes = require("./routes/aircraft.routes");
const routeRoutes = require("./routes/route.routes");
const flightRoutes = require("./routes/flight.routes");
const passengerRoutes = require("./routes/passenger.routes");
const ticketRoutes = require("./routes/ticket.routes");
const seatInfoRoutes = require("./routes/seat_info.routes");
const { specs, swaggerUi } = require("./swagger");
const requestLogger = require("./middleware/request.logger");
const passport = require("./config/passport");
const pdfUploadRoutes = require("./routes/pdf.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/auth", authRoutes);

app.use("", airlineRoutes);
app.use("", airportRoutes);
app.use("", aircraftRoutes);
app.use("", routeRoutes);
app.use("", flightRoutes);
app.use("", passengerRoutes);
app.use("", ticketRoutes);
app.use("", seatInfoRoutes);
app.use("/pdf", pdfUploadRoutes);

app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.get("/", (req, res) => {
  res.send("Airline Booking System API is running");
});

// Start the server only if this file is executed directly (not imported elsewhere)
// This prevents potential port conflicts during testing or when the file is used as a module
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
