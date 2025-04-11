const prisma = require("../prisma");

exports.createSeatInfo = async (req, res) => {
  try {
    const { flight_id, seat_number, seat_status } = req.body;

    const parsedFlightId = parseInt(flight_id, 10);
    const parsedSeatNumber = parseInt(seat_number, 10);

    // Check if flight exists
    const flight = await prisma.flight.findUnique({
      where: { id: parsedFlightId },
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

    // Check if seat number is within aircraft capacity
    if (parsedSeatNumber > flight.route.aircraft.capacity) {
      return res.status(400).json({
        message: `Seat number cannot exceed aircraft capacity (${flight.route.aircraft.capacity})`,
      });
    }

    // Check if seat info already exists
    const existingSeatInfo = await prisma.seat_info.findUnique({
      where: {
        flight_id_seat_number: {
          flight_id: parsedFlightId,
          seat_number: parsedSeatNumber,
        },
      },
    });

    if (existingSeatInfo) {
      return res.status(400).json({ message: "Seat info already exists" });
    }

    const seatInfo = await prisma.seat_info.create({
      data: {
        flight_id: parsedFlightId,
        seat_number: parsedSeatNumber,
        seat_status: seat_status.toUpperCase(),
      },
    });

    res.status(201).json(seatInfo);
  } catch (error) {
    console.error("Error creating seat info:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.getSeatInfos = async (req, res) => {
  try {
    const seatInfos = await prisma.seat_info.findMany();
    res.status(200).json(seatInfos);
  } catch (error) {
    console.error("Error fetching seat infos:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.getSeatInfo = async (req, res) => {
  try {
    const { flight_id, seat_number } = req.params;

    const parsedFlightId = parseInt(flight_id, 10);
    const parsedSeatNumber = parseInt(seat_number, 10);

    const seatInfo = await prisma.seat_info.findUnique({
      where: {
        flight_id_seat_number: {
          flight_id: parsedFlightId,
          seat_number: parsedSeatNumber,
        },
      },
    });

    if (!seatInfo) {
      return res.status(404).json({ message: "Seat info not found" });
    }

    res.status(200).json(seatInfo);
  } catch (error) {
    console.error("Error fetching seat info:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.updateSeatInfo = async (req, res) => {
  try {
    const { flight_id, seat_number } = req.params;
    const { seat_status, version } = req.body;

    const parsedFlightId = parseInt(flight_id, 10);
    const parsedSeatNumber = parseInt(seat_number, 10);
    const parsedVersion = version ? parseInt(version, 10) : undefined;

    // Get current seat info to check version
    const currentSeatInfo = await prisma.seat_info.findUnique({
      where: {
        flight_id_seat_number: {
          flight_id: parsedFlightId,
          seat_number: parsedSeatNumber,
        },
      },
      include: {
        tickets: true,
      },
    });

    if (!currentSeatInfo) {
      return res.status(404).json({ message: "Seat info not found" });
    }

    // Check version for optimistic concurrency
    if (
      parsedVersion !== undefined &&
      currentSeatInfo.version !== parsedVersion
    ) {
      return res.status(409).json({
        message:
          "Seat info was updated by another transaction. Please refresh and try again",
        currentVersion: currentSeatInfo.version,
      });
    }

    // Check if trying to make a booked seat available
    if (
      currentSeatInfo.seat_status === "BOOKED" &&
      seat_status.toUpperCase() === "AVAILABLE" &&
      currentSeatInfo.tickets.length > 0
    ) {
      return res.status(400).json({
        message:
          "Cannot make a booked seat available when it has associated tickets",
      });
    }

    // Update seat info with version increment
    const updatedSeatInfo = await prisma.seat_info.update({
      where: {
        flight_id_seat_number: {
          flight_id: parsedFlightId,
          seat_number: parsedSeatNumber,
        },
      },
      data: {
        seat_status: seat_status.toUpperCase(),
        version: {
          increment: 1,
        },
      },
    });

    res.status(200).json(updatedSeatInfo);
  } catch (error) {
    console.error("Error updating seat info:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.deleteSeatInfo = async (req, res) => {
  try {
    const { flight_id, seat_number } = req.params;

    const parsedFlightId = parseInt(flight_id, 10);
    const parsedSeatNumber = parseInt(seat_number, 10);

    const seatInfo = await prisma.seat_info.findUnique({
      where: {
        flight_id_seat_number: {
          flight_id: parsedFlightId,
          seat_number: parsedSeatNumber,
        },
      },
      include: {
        tickets: true,
      },
    });

    if (!seatInfo) {
      return res.status(404).json({ message: "Seat info not found" });
    }

    // Check if seat has associated tickets
    if (seatInfo.tickets.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete seat info with associated tickets" });
    }

    await prisma.seat_info.delete({
      where: {
        flight_id_seat_number: {
          flight_id: parsedFlightId,
          seat_number: parsedSeatNumber,
        },
      },
    });

    res.status(204).json({ message: "Seat info deleted successfully" });
  } catch (error) {
    console.error("Error deleting seat info:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};
