const prisma = require("../prisma");
const { timeToMinutes } = require("../utils/time.utils");
const {
  formatFlightResponse,
  formatFlightResponses,
} = require("../utils/response.utils");

//-----------------------------------------------------------------------------
// Flight CRUD Operations
//-----------------------------------------------------------------------------

// Create Flight
exports.createFlight = async (req, res) => {
  try {
    const { flight_number, airline_code, date, available_tickets, price } =
      req.body;

    // Parse incoming data to the correct types
    const parsedFlightNumber = parseInt(flight_number, 10);
    const parsedDate = new Date(date);
    const parsedAvailableTickets = parseInt(available_tickets, 10);
    const parsedPrice = parseFloat(price);

    // Check if route exists
    const route = await prisma.route.findUnique({
      where: {
        flight_number_airline_code: {
          flight_number: parsedFlightNumber,
          airline_code,
        },
      },
      include: {
        aircraft: true,
      },
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Check if flight already exists for this route and date
    const existingFlight = await prisma.flight.findFirst({
      where: {
        flight_number: parsedFlightNumber,
        airline_code,
        date: parsedDate,
      },
    });

    if (existingFlight) {
      return res.status(400).json({
        message: "Flight already exists for this route and date",
      });
    }

    // Check if flight date is within route's valid dates
    const flightDate = new Date(date);
    if (
      flightDate < route.start_date ||
      (route.end_date && flightDate > route.end_date)
    ) {
      return res.status(400).json({
        message: "Flight date must be within route's valid dates",
      });
    }

    // Check if available tickets doesn't exceed aircraft capacity
    if (parseInt(available_tickets, 10) > route.aircraft.capacity) {
      return res.status(400).json({
        message: `Available tickets cannot exceed aircraft capacity (${route.aircraft.capacity})`,
      });
    }

    // Create the flight entry
    const flight = await prisma.flight.create({
      data: {
        flight_number: parsedFlightNumber,
        airline_code,
        date: parsedDate,
        available_tickets: parsedAvailableTickets,
        price: parsedPrice,
      },
    });

    // Create seat info for the flight
    const seatInfoData = Array.from(
      { length: route.aircraft.capacity },
      (_, i) => ({
        flight_id: flight.id,
        seat_number: i + 1,
        seat_status: "AVAILABLE",
      })
    );

    await prisma.seat_info.createMany({
      data: seatInfoData,
    });

    res.status(201).json(flight);
  } catch (error) {
    console.error("Error creating flight:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get All Flights
exports.getFlights = async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      include: {
        route: {
          include: {
            departure_airport_rel: true,
            destination_airport_rel: true,
            aircraft: true,
          },
        },
        airline: true,
      },
      orderBy: [{ date: "asc" }, { route: { departure_time: "asc" } }],
    });
    res.status(200).json(formatFlightResponses(flights));
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get Flight by ID
exports.getFlight = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the id is parsed as an integer
    const parsedId = parseInt(id, 10);

    const flight = await prisma.flight.findUnique({
      where: { id: parsedId },
      include: {
        route: {
          include: {
            departure_airport_rel: true,
            destination_airport_rel: true,
            aircraft: true,
          },
        },
        airline: true,
      },
    });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.status(200).json(formatFlightResponse(flight));
  } catch (error) {
    console.error("Error fetching flight:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Update Flight
exports.updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { available_tickets, price, version } = req.body;

    // Parse incoming data to the correct types
    const parsedId = parseInt(id, 10);
    const parsedAvailableTickets = available_tickets
      ? parseInt(available_tickets, 10)
      : undefined;
    const parsedPrice = price ? parseFloat(price) : undefined;
    const parsedVersion = version ? parseInt(version, 10) : undefined;

    const flight = await prisma.flight.findUnique({
      where: { id: parsedId },
      include: {
        route: {
          include: {
            aircraft: true,
          },
        },
      },
    });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Handle optimistic concurrency
    if (parsedVersion !== undefined && parsedVersion !== flight.version) {
      return res.status(409).json({
        message: "Flight has been modified by another request",
      });
    }

    // Check if new available tickets doesn't exceed aircraft capacity
    if (
      available_tickets &&
      parsedAvailableTickets > flight.route.aircraft.capacity
    ) {
      return res.status(400).json({
        message: `Available tickets cannot exceed aircraft capacity (${flight.route.aircraft.capacity})`,
      });
    }

    // Check if new available tickets isn't less than booked seats
    if (available_tickets) {
      const bookedSeats = await prisma.seat_info.count({
        where: {
          flight_id: parseInt(id, 10),
          seat_status: "BOOKED",
        },
      });

      if (parsedAvailableTickets < bookedSeats) {
        return res.status(400).json({
          message: `Available tickets cannot be less than booked seats (${bookedSeats})`,
        });
      }
    }

    const updatedFlight = await prisma.flight.update({
      where: { id: parsedId },
      data: {
        available_tickets: parsedAvailableTickets,
        price: parsedPrice,
        version: { increment: 1 },
      },
    });

    res.status(200).json(updatedFlight);
  } catch (error) {
    console.error("Error updating flight:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Delete Flight
exports.deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the id is parsed as an integer
    const parsedId = parseInt(id, 10);

    const flight = await prisma.flight.findUnique({
      where: { id: parsedId },
      include: {
        tickets: true,
      },
    });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Check if flight has booked tickets
    if (flight.tickets.length > 0) {
      return res.status(400).json({
        message: "Cannot delete flight with booked tickets",
      });
    }

    await prisma.flight.delete({
      where: { id: parsedId },
    });

    res.status(204).json({ message: "Flight deleted successfully" });
  } catch (error) {
    console.error("Error deleting flight:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Search Flights
exports.searchFlights = async (req, res) => {
  try {
    const {
      departure_airport,
      destination_airport,
      min_departure_time,
      max_departure_time,
      date,
      min_price,
      max_price,
      min_duration,
      max_duration,
    } = req.query;

    // Build the where clause for the query
    const where = {
      route: {},
    };

    // Add date filter if provided
    if (date) {
      where.date = new Date(date);
    }

    // Add price range filters if provided
    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) {
        where.price.gte = parseFloat(min_price);
      }
      if (max_price !== undefined) {
        where.price.lte = parseFloat(max_price);
      }
    }

    // Add airport filters if provided
    if (departure_airport) {
      where.route.departure_airport = departure_airport;
    }
    if (destination_airport) {
      where.route.destination_airport = destination_airport;
    }

    // Add duration range filters if provided
    if (min_duration !== undefined || max_duration !== undefined) {
      where.route.duration = {};
      if (min_duration !== undefined) {
        where.route.duration.gte = parseInt(min_duration, 10);
      }
      if (max_duration !== undefined) {
        where.route.duration.lte = parseInt(max_duration, 10);
      }
    }

    // Add departure time range filters if provided
    if (min_departure_time || max_departure_time) {
      where.route.departure_time = {};
      if (min_departure_time) {
        where.route.departure_time.gte = timeToMinutes(min_departure_time);
      }
      if (max_departure_time) {
        where.route.departure_time.lte = timeToMinutes(max_departure_time);
      }
    }

    // Query flights with all the filters
    const flights = await prisma.flight.findMany({
      where,
      include: {
        route: {
          include: {
            departure_airport_rel: true,
            destination_airport_rel: true,
            aircraft: true,
          },
        },
        airline: true,
        seat_infos: {
          orderBy: {
            seat_number: "asc",
          },
        },
      },
      orderBy: [{ date: "asc" }, { route: { departure_time: "asc" } }],
    });

    res.status(200).json(formatFlightResponses(flights));
  } catch (error) {
    console.error("Error searching flights:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};
