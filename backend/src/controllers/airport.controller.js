const prisma = require("../prisma");

//-----------------------------------------------------------------------------
// Airport CRUD Operations
//-----------------------------------------------------------------------------

// Create Airport
exports.createAirport = async (req, res) => {
  try {
    const { code, city } = req.body;

    const existingAirport = await prisma.airport.findUnique({
      where: { code },
    });

    if (existingAirport) {
      return res.status(400).json({ message: "Airport already exists" });
    }

    const airport = await prisma.airport.create({
      data: { code, city },
    });

    res.status(201).json(airport);
  } catch (error) {
    console.error("Error creating airport:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get All Airports
exports.getAirports = async (req, res) => {
  try {
    const airports = await prisma.airport.findMany();
    res.status(200).json(airports);
  } catch (error) {
    console.error("Error fetching airports:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get Airport by Code
exports.getAirport = async (req, res) => {
  try {
    const { code } = req.params;

    const airport = await prisma.airport.findUnique({
      where: { code },
    });

    if (!airport) {
      return res.status(404).json({ message: "Airport not found" });
    }

    res.status(200).json(airport);
  } catch (error) {
    console.error("Error fetching airport:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Update Airport
exports.updateAirport = async (req, res) => {
  try {
    const { code } = req.params;
    const { city } = req.body;

    const airport = await prisma.airport.findUnique({
      where: { code },
    });

    if (!airport) {
      return res.status(404).json({ message: "Airport not found" });
    }

    const updatedAirport = await prisma.airport.update({
      where: { code },
      data: { city },
    });

    res.status(200).json(updatedAirport);
  } catch (error) {
    console.error("Error updating airport:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Delete Airport
exports.deleteAirport = async (req, res) => {
  try {
    const { code } = req.params;

    const airport = await prisma.airport.findUnique({
      where: { code },
      include: {
        departureRoutes: true,
        destinationRoutes: true,
      },
    });

    if (!airport) {
      return res.status(404).json({ message: "Airport not found" });
    }

    // Check if airport has associated routes
    if (
      airport.departureRoutes.length > 0 ||
      airport.destinationRoutes.length > 0
    ) {
      return res
        .status(400)
        .json({ message: "Cannot delete airport with associated routes" });
    }

    await prisma.airport.delete({
      where: { code },
    });

    res.status(204).json({ message: "Airport deleted successfully" });
  } catch (error) {
    console.error("Error deleting airport:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};
