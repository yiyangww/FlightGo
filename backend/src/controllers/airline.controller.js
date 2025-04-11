const prisma = require("../prisma");

//-----------------------------------------------------------------------------
// Airline CRUD Operations
//-----------------------------------------------------------------------------

// Create Airline
exports.createAirline = async (req, res) => {
  try {
    const { code, name } = req.body;

    // Check if airline already exists
    const existingAirline = await prisma.airline.findUnique({
      where: { code },
    });

    if (existingAirline) {
      return res.status(400).json({ message: "Airline already exists" });
    }

    const airline = await prisma.airline.create({
      data: { code, name },
    });

    res.status(201).json(airline);
  } catch (error) {
    console.error("Error creating airline:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get All Airlines
exports.getAirlines = async (req, res) => {
  try {
    const airlines = await prisma.airline.findMany();
    res.status(200).json(airlines);
  } catch (error) {
    console.error("Error fetching airlines:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Get Airline by Code
exports.getAirline = async (req, res) => {
  try {
    const { code } = req.params;

    const airline = await prisma.airline.findUnique({
      where: { code },
    });

    if (!airline) {
      return res.status(404).json({ message: "Airline not found" });
    }

    res.status(200).json(airline);
  } catch (error) {
    console.error("Error fetching airline:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Update Airline
exports.updateAirline = async (req, res) => {
  try {
    const { code } = req.params;
    const { name } = req.body;

    const airline = await prisma.airline.findUnique({
      where: { code },
    });

    if (!airline) {
      return res.status(404).json({ message: "Airline not found" });
    }

    const updatedAirline = await prisma.airline.update({
      where: { code },
      data: { name },
    });

    res.status(200).json(updatedAirline);
  } catch (error) {
    console.error("Error updating airline:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Delete Airline
exports.deleteAirline = async (req, res) => {
  try {
    const { code } = req.params;

    const airline = await prisma.airline.findUnique({
      where: { code },
      include: {
        routes: true,
      },
    });

    if (!airline) {
      return res.status(404).json({ message: "Airline not found" });
    }

    // Check if airline has associated routes
    if (airline.routes.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete airline with associated routes" });
    }

    await prisma.airline.delete({
      where: { code },
    });

    res.status(204).json({ message: "Airline deleted successfully" });
  } catch (error) {
    console.error("Error deleting airline:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};
