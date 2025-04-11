const prisma = require("../prisma");
const { timeToMinutes } = require("../utils/time.utils");
const {
  formatRouteResponse,
  formatRouteResponses,
} = require("../utils/response.utils");

//-----------------------------------------------------------------------------
// Route CRUD Operations
//-----------------------------------------------------------------------------

// Create Route
exports.createRoute = async (req, res) => {
  try {
    const {
      flight_number,
      airline_code,
      departure_airport,
      destination_airport,
      departure_time,
      duration,
      aircraft_id,
      start_date,
      end_date,
    } = req.body;

    // Parse incoming data to correct types
    const parsedFlightNumber = parseInt(flight_number, 10);
    const parsedDepartureTime = timeToMinutes(departure_time);
    const parsedDuration = parseInt(duration, 10);
    const parsedAircraftId = parseInt(aircraft_id, 10);
    const parsedStartDate = new Date(start_date);
    const parsedEndDate = end_date ? new Date(end_date) : null;

    const existingRoute = await prisma.route.findUnique({
      where: {
        flight_number_airline_code: {
          flight_number: parsedFlightNumber,
          airline_code,
        },
      },
      include: {
        flights: true,
      },
    });

    if (existingRoute) {
      return res.status(400).json({ message: "Route already exists" });
    }

    // Check if the aircraft exists
    const aircraft = await prisma.aircraft.findUnique({
      where: { id: parsedAircraftId },
    });
    if (!aircraft) {
      return res.status(404).json({ message: "Aircraft not found" });
    }

    // Check if the departure airport exists
    const departureAirport = await prisma.airport.findUnique({
      where: { code: departure_airport },
    });
    if (!departureAirport) {
      return res.status(404).json({ message: "Departure airport not found" });
    }

    // Check if the destination airport exists
    const destinationAirport = await prisma.airport.findUnique({
      where: { code: destination_airport },
    });
    if (!destinationAirport) {
      return res.status(404).json({ message: "Destination airport not found" });
    }

    // Check if departure and destination airports are different
    if (departure_airport === destination_airport) {
      return res.status(400).json({
        message: "Departure and destination airports must be different",
      });
    }

    // Check if end_date is after start_date if provided
    if (end_date && parsedEndDate <= parsedStartDate) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // Create the route
    const route = await prisma.route.create({
      data: {
        flight_number: parsedFlightNumber,
        airline_code,
        departure_airport,
        destination_airport,
        departure_time: parsedDepartureTime,
        duration: parsedDuration,
        aircraft_id: parsedAircraftId,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
      },
      include: {
        airline: true,
        aircraft: true,
        departure_airport_rel: true,
        destination_airport_rel: true,
      },
    });

    res.status(201).json(formatRouteResponse(route));
  } catch (error) {
    console.error("Error creating route:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get All Routes
exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        airline: true,
        aircraft: true,
        departure_airport_rel: true,
        destination_airport_rel: true,
      },
    });

    res.status(200).json(formatRouteResponses(routes));
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get Route by Flight Number and Airline Code
exports.getRoute = async (req, res) => {
  try {
    const { flight_number, airline_code } = req.params;

    const parsedFlightNumber = parseInt(flight_number, 10);

    const route = await prisma.route.findUnique({
      where: {
        flight_number_airline_code: {
          flight_number: parsedFlightNumber,
          airline_code,
        },
      },
      include: {
        airline: true,
        aircraft: true,
        departure_airport_rel: true,
        destination_airport_rel: true,
      },
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json(formatRouteResponse(route));
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Update Route
exports.updateRoute = async (req, res) => {
  try {
    const { flight_number, airline_code } = req.params;
    const {
      departure_airport,
      destination_airport,
      departure_time,
      duration,
      aircraft_id,
      start_date,
      end_date,
    } = req.body;

    // Parse incoming data to correct types
    const parsedFlightNumber = parseInt(flight_number, 10);
    const parsedDepartureTime = departure_time
      ? timeToMinutes(departure_time)
      : undefined;
    const parsedDuration = duration ? parseInt(duration, 10) : undefined;
    const parsedAircraftId = aircraft_id
      ? parseInt(aircraft_id, 10)
      : undefined;
    const parsedStartDate = start_date ? new Date(start_date) : undefined;
    const parsedEndDate = end_date ? new Date(end_date) : undefined;

    const route = await prisma.route.findUnique({
      where: {
        flight_number_airline_code: {
          flight_number: parsedFlightNumber,
          airline_code,
        },
      },
      include: {
        flights: true,
      },
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // If changing aircraft, check capacity
    if (aircraft_id) {
      const aircraft = await prisma.aircraft.findUnique({
        where: { id: parsedAircraftId },
      });

      if (!aircraft) {
        return res.status(404).json({ message: "Aircraft not found" });
      }

      // Check if new aircraft has enough capacity for existing flights
      for (const flight of route.flights) {
        const bookedSeats = await prisma.seat_info.count({
          where: {
            flight_id: flight.id,
            seat_status: "BOOKED",
          },
        });
        if (aircraft.capacity < bookedSeats) {
          return res.status(400).json({
            message: `New aircraft capacity (${aircraft.capacity}) is less than booked seats (${bookedSeats}) for flight ${flight.id}`,
          });
        }
      }
    }

    // Check if departure and destination airports are different
    if (
      departure_airport &&
      destination_airport &&
      departure_airport === destination_airport
    ) {
      return res.status(400).json({
        message: "Departure and destination airports must be different",
      });
    }

    // Check if the departure airport exists
    const departureAirport = await prisma.airport.findUnique({
      where: { code: departure_airport },
    });
    if (!departureAirport) {
      return res.status(404).json({ message: "Departure airport not found" });
    }

    // Check if the destination airport exists
    const destinationAirport = await prisma.airport.findUnique({
      where: { code: destination_airport },
    });
    if (!destinationAirport) {
      return res.status(404).json({ message: "Destination airport not found" });
    }

    // Check if end_date is after start_date if both are provided
    if (start_date && end_date && parsedEndDate <= parsedStartDate) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // Update the route
    const updatedRoute = await prisma.route.update({
      where: {
        flight_number_airline_code: {
          flight_number: parsedFlightNumber,
          airline_code,
        },
      },
      data: {
        departure_airport,
        destination_airport,
        departure_time: parsedDepartureTime,
        duration: parsedDuration,
        aircraft_id: parsedAircraftId,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
      },
      include: {
        airline: true,
        aircraft: true,
        departure_airport_rel: true,
        destination_airport_rel: true,
      },
    });

    res.status(200).json(formatRouteResponse(updatedRoute));
  } catch (error) {
    console.error("Error updating route:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Delete Route
exports.deleteRoute = async (req, res) => {
  try {
    const { flight_number, airline_code } = req.params;

    const parsedFlightNumber = parseInt(flight_number, 10);

    const route = await prisma.route.findUnique({
      where: {
        flight_number_airline_code: {
          flight_number: parsedFlightNumber,
          airline_code,
        },
      },
      include: {
        flights: true,
      },
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Check if route has associated flights
    if (route.flights.length > 0) {
      return res.status(400).json({
        message: "Cannot delete route with associated flights",
      });
    }

    await prisma.route.delete({
      where: {
        flight_number_airline_code: {
          flight_number: parsedFlightNumber,
          airline_code,
        },
      },
    });

    res.status(204).json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Error deleting route:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};
