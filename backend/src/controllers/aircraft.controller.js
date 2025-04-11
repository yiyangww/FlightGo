const prisma = require("../prisma");

//-----------------------------------------------------------------------------
// Aircraft CRUD Operations
//-----------------------------------------------------------------------------

// Create Aircraft
exports.createAircraft = async (req, res) => {
  try {
    const { id, capacity } = req.body;

    const parsedId = parseInt(id, 10);
    const parsedCapacity = parseInt(capacity, 10);

    const existingAircraft = await prisma.aircraft.findUnique({
      where: { id: parsedId },
    });

    if (existingAircraft) {
      return res.status(400).json({ message: "Aircraft already exists" });
    }

    const aircraft = await prisma.aircraft.create({
      data: {
        id: parsedId,
        capacity: parsedCapacity,
      },
    });

    res.status(201).json(aircraft);
  } catch (error) {
    console.error("Error creating aircraft:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get All Aircraft
exports.getAircrafts = async (req, res) => {
  try {
    const aircrafts = await prisma.aircraft.findMany();
    res.status(200).json(aircrafts);
  } catch (error) {
    console.error("Error fetching aircrafts:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get Aircraft by ID
exports.getAircraft = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    const aircraft = await prisma.aircraft.findUnique({
      where: { id: parsedId },
    });

    if (!aircraft) {
      return res.status(404).json({ message: "Aircraft not found" });
    }

    res.status(200).json(aircraft);
  } catch (error) {
    console.error("Error fetching aircraft:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Update Aircraft
exports.updateAircraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { capacity } = req.body;

    const parsedId = parseInt(id, 10);
    const parsedCapacity = parseInt(capacity, 10);

    const aircraft = await prisma.aircraft.findUnique({
      where: { id: parsedId },
      include: {
        routes: {
          include: {
            flights: true,
          },
        },
      },
    });

    if (!aircraft) {
      return res.status(404).json({ message: "Aircraft not found" });
    }

    // Check if new capacity is less than any flight's booked seats
    for (const route of aircraft.routes) {
      for (const flight of route.flights) {
        const bookedSeats = await prisma.seat_info.count({
          where: {
            flight_id: flight.id,
            seat_status: "BOOKED",
          },
        });
        if (parsedCapacity < bookedSeats) {
          return res.status(400).json({
            message: `Cannot reduce capacity below number of booked seats (${bookedSeats}) for flight ${flight.id}`,
          });
        }
      }
    }

    const updatedAircraft = await prisma.aircraft.update({
      where: { id: parsedId },
      data: { capacity: parsedCapacity },
    });

    res.status(200).json(updatedAircraft);
  } catch (error) {
    console.error("Error updating aircraft:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Delete Aircraft
exports.deleteAircraft = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    const aircraft = await prisma.aircraft.findUnique({
      where: { id: parsedId },
      include: {
        routes: true,
      },
    });

    if (!aircraft) {
      return res.status(404).json({ message: "Aircraft not found" });
    }

    // Check if aircraft has associated routes
    if (aircraft.routes.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete aircraft with associated routes" });
    }

    await prisma.aircraft.delete({
      where: { id: parsedId },
    });

    res.status(204).json({ message: "Aircraft deleted successfully" });
  } catch (error) {
    console.error("Error deleting aircraft:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};
