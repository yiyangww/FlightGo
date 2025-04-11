const prisma = require("../prisma");

exports.createTicket = async (req, res) => {
  try {
    const { passenger_id, flight_id, seat_number, price } = req.body;

    const parsedPassengerId = parseInt(passenger_id, 10);
    const parsedFlightId = parseInt(flight_id, 10);
    const parsedSeatNumber = parseInt(seat_number, 10);
    const parsedPrice = parseFloat(price);

    // Check if passenger exists
    const passenger = await prisma.passenger.findUnique({
      where: { id: parsedPassengerId },
    });

    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    // Check if flight exists and has available tickets
    const flight = await prisma.flight.findUnique({
      where: { id: parsedFlightId },
    });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    if (flight.available_tickets <= 0) {
      return res
        .status(400)
        .json({ message: "No available tickets for this flight" });
    }

    // Check if seat exists and is available
    const seatInfo = await prisma.seat_info.findUnique({
      where: {
        flight_id_seat_number: {
          flight_id: parsedFlightId,
          seat_number: parsedSeatNumber,
        },
      },
    });

    if (!seatInfo) {
      return res.status(404).json({ message: "Seat not found" });
    }

    if (seatInfo.seat_status !== "AVAILABLE") {
      return res.status(400).json({ message: "Seat is not available" });
    }

    // Create ticket and update related records in a transaction
    const ticket = await prisma.$transaction(async (prisma) => {
      // Create the ticket
      const ticket = await prisma.ticket.create({
        data: {
          passenger_id: parsedPassengerId,
          flight_id: parsedFlightId,
          seat_number: parsedSeatNumber,
          price: parsedPrice,
        },
      });

      // Update seat status
      await prisma.seat_info.update({
        where: {
          flight_id_seat_number: {
            flight_id: parsedFlightId,
            seat_number: parsedSeatNumber,
          },
        },
        data: {
          seat_status: "BOOKED",
        },
      });

      // Update available tickets
      await prisma.flight.update({
        where: { id: parsedFlightId },
        data: {
          available_tickets: {
            decrement: 1,
          },
        },
      });

      return ticket;
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany();
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    const ticket = await prisma.ticket.findUnique({
      where: { id: parsedId },
      include: {
        passenger: true,
        flight: true,
        seat_info: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { seat_number, price } = req.body;

    const parsedId = parseInt(id, 10);
    const parsedSeatNumber = seat_number
      ? parseInt(seat_number, 10)
      : undefined;
    const parsedPrice = price ? parseFloat(price) : undefined;

    const ticket = await prisma.ticket.findUnique({
      where: { id: parsedId },
      include: {
        flight: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // If changing seat, check if new seat is available
    if (parsedSeatNumber) {
      const newSeatInfo = await prisma.seat_info.findUnique({
        where: {
          flight_id_seat_number: {
            flight_id: ticket.flight_id,
            seat_number: parsedSeatNumber,
          },
        },
      });

      if (!newSeatInfo) {
        return res.status(404).json({ message: "New seat not found" });
      }

      if (newSeatInfo.seat_status !== "AVAILABLE") {
        return res.status(400).json({ message: "New seat is not available" });
      }
    }

    // Update ticket and related records in a transaction
    const updatedTicket = await prisma.$transaction(async (prisma) => {
      if (parsedSeatNumber) {
        // Update old seat to available
        await prisma.seat_info.update({
          where: {
            flight_id_seat_number: {
              flight_id: ticket.flight_id,
              seat_number: ticket.seat_number,
            },
          },
          data: {
            seat_status: "AVAILABLE",
          },
        });

        // Update new seat to booked
        await prisma.seat_info.update({
          where: {
            flight_id_seat_number: {
              flight_id: ticket.flight_id,
              seat_number: parsedSeatNumber,
            },
          },
          data: {
            seat_status: "BOOKED",
          },
        });
      }

      // Update ticket
      return await prisma.ticket.update({
        where: { id: parsedId },
        data: {
          seat_number: parsedSeatNumber,
          price: parsedPrice,
        },
      });
    });

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    const ticket = await prisma.ticket.findUnique({
      where: { id: parsedId },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Delete ticket and update related records in a transaction
    await prisma.$transaction(async (prisma) => {
      // Delete the ticket
      await prisma.ticket.delete({
        where: { id: parsedId },
      });

      // Update seat status
      await prisma.seat_info.update({
        where: {
          flight_id_seat_number: {
            flight_id: ticket.flight_id,
            seat_number: ticket.seat_number,
          },
        },
        data: {
          seat_status: "AVAILABLE",
        },
      });

      // Update available tickets
      await prisma.flight.update({
        where: { id: ticket.flight_id },
        data: {
          available_tickets: {
            increment: 1,
          },
        },
      });
    });

    res.status(204).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};

// Helper function to get tickets by passenger ID
const getTicketsByPassengerId = async (passengerId) => {
  const parsedPassengerId = parseInt(passengerId, 10);
  
  const tickets = await prisma.ticket.findMany({
    where: { passenger_id: parsedPassengerId },
    include: {
      passenger: true,
      flight: true,
      seat_info: true,
    },
    orderBy: {
      id: 'asc'
    }
  });

  return tickets;
};

// Helper function to get passengers by account ID
const getPassengersByAccountId = async (accountId) => {
  const parsedAccountId = parseInt(accountId, 10);
  
  const passengers = await prisma.passenger.findMany({
    where: { account_id: parsedAccountId },
  });
  
  return passengers;
};

exports.getMyTickets = async (req, res) => {
  try {
    const { passengerId } = req.query;
    const accountId = req.user.id; // Get account ID from the authenticated user's token
    
    let tickets = [];
    
    if (passengerId) {
      // If passengerId is provided, verify this passenger belongs to the current user
      const parsedPassengerId = parseInt(passengerId, 10);
      const passenger = await prisma.passenger.findUnique({
        where: { id: parsedPassengerId },
      });
      
      if (!passenger) {
        return res.status(404).json({ message: "Passenger not found" });
      }
      
      if (passenger.account_id !== accountId) {
        return res.status(403).json({ 
          message: "Forbidden: You can only access tickets for your own passengers" 
        });
      }
      
      // Get tickets for the specified passenger
      tickets = await getTicketsByPassengerId(parsedPassengerId);
    } else {
      // Get all passengers for the current user
      const passengers = await getPassengersByAccountId(accountId);
      
      if (passengers.length === 0) {
        return res.status(404).json({ 
          message: "No passengers found for your account" 
        });
      }
      
      // Get tickets for all passengers
      const ticketsPromises = passengers.map(passenger => 
        getTicketsByPassengerId(passenger.id)
      );
      
      const ticketsArrays = await Promise.all(ticketsPromises);
      tickets = ticketsArrays.flat();
    }
    
    if (tickets.length === 0) {
      return res.status(404).json({ 
        message: "No tickets found" 
      });
    }
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ message: "Unknown server error" });
  }
};
