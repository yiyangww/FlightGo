const prisma = require("../prisma");

exports.createPassenger = async (req, res) => {
  try {
    const { name, birth_date, gender, address, phone_number } = req.body;
    const account_id = req.user.id; // Get account ID from the authenticated user's token

    const parsedBirthDate = new Date(birth_date);

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: account_id },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const passenger = await prisma.passenger.create({
      data: {
        name,
        birth_date: parsedBirthDate,
        gender: gender.toLowerCase(),
        address,
        phone_number,
        account_id: account_id,
      },
    });

    res.status(201).json(passenger);
  } catch (error) {
    console.error("Error creating passenger:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.getPassengers = async (req, res) => {
  try {
    const account_id = req.user.id;

    const where = { account_id: account_id };  

    const passengers = await prisma.passenger.findMany({ where });

    res.status(200).json(passengers);
  } catch (error) {
    console.error("Error fetching passengers:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.getPassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    const passenger = await prisma.passenger.findUnique({
      where: { id: parsedId },
    });

    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    res.status(200).json(passenger);
  } catch (error) {
    console.error("Error fetching passenger:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.updatePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, birth_date, gender, address, phone_number } = req.body;

    const parsedId = parseInt(id, 10);
    const parsedBirthDate = birth_date ? new Date(birth_date) : undefined;

    const passenger = await prisma.passenger.findUnique({
      where: { id: parsedId },
    });

    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    const updatedPassenger = await prisma.passenger.update({
      where: { id: parsedId },
      data: {
        name,
        birth_date: parsedBirthDate,
        gender: gender?.toLowerCase(),
        address,
        phone_number,
      },
    });

    res.status(200).json(updatedPassenger);
  } catch (error) {
    console.error("Error updating passenger:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.deletePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    const passenger = await prisma.passenger.findUnique({
      where: { id: parsedId },
      include: {
        tickets: true,
      },
    });

    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    // Check if passenger has associated tickets
    if (passenger.tickets.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete passenger with associated tickets" });
    }

    await prisma.passenger.delete({
      where: { id: parsedId },
    });

    res.status(204).json({ message: "Passenger deleted successfully" });
  } catch (error) {
    console.error("Error deleting passenger:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};
