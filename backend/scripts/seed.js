const { PrismaClient } = require("@prisma/client");
const {
  minutesToTime,
  formatDuration,
  formatDate,
} = require("../src/utils/time.utils");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// Helper function to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to safely delete records
async function safeDelete(model) {
  try {
    await prisma[model].deleteMany();
    await wait(500);
    console.log(`Cleaned up ${model}`);
  } catch (error) {
    if (error.code === "P2021") {
      console.log(`Table ${model} does not exist yet, skipping cleanup`);
    } else {
      throw error;
    }
  }
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Clean up existing data in reverse order of dependencies
    console.log("Cleaning up existing data...");
    await safeDelete("ticket");
    await safeDelete("seat_info");
    await safeDelete("flight");
    await safeDelete("route");
    await safeDelete("aircraft");
    await safeDelete("airline");
    await safeDelete("airport");
    await safeDelete("passenger");
    await safeDelete("account");

    await wait(1000); // Wait for all deletions to complete
    console.log("Cleaned up existing data");

    // Create accounts
    console.log("Creating accounts...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);
    const user2Password = await bcrypt.hash("user456", 10);

    const admin = await prisma.account.create({
      data: {
        username: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
      },
    });

    const user = await prisma.account.create({
      data: {
        username: "user@example.com",
        password: userPassword,
        role: "USER",
      },
    });

    const user2 = await prisma.account.create({
      data: {
        username: "user2@example.com",
        password: user2Password,
        role: "USER",
      },
    });

    await wait(1000); // Wait for accounts to be created
    console.log("Created admin and user accounts");

    // Create passengers (depends on accounts)
    console.log("Creating passengers...");
    const passengers = await Promise.all([
      prisma.passenger.create({
        data: {
          name: "John Doe",
          birth_date: new Date("1990-01-01"),
          gender: "male",
          address: "123 Main St",
          phone_number: "1234567890",
          account_id: user.id,
        },
      }),
      prisma.passenger.create({
        data: {
          name: "Jane Smith",
          birth_date: new Date("1992-05-15"),
          gender: "female",
          address: "456 Oak Ave",
          phone_number: "0987654321",
          account_id: user.id,
        },
      }),
      prisma.passenger.create({
        data: {
          name: "Alice Johnson",
          birth_date: new Date("1985-08-20"),
          gender: "female",
          address: "789 Pine St",
          phone_number: "5556667777",
          account_id: user2.id,
        },
      }),
      prisma.passenger.create({
        data: {
          name: "Bob Wilson",
          birth_date: new Date("1988-12-10"),
          gender: "male",
          address: "321 Elm St",
          phone_number: "4443332222",
          account_id: user2.id,
        },
      }),
    ]);

    await wait(500); // Wait for passengers to be created
    console.log("Created passengers");

    // Create independent entities in parallel
    console.log("Creating airlines...");
    const airlines = await Promise.all([
      prisma.airline.create({
        data: {
          code: "AA",
          name: "American Airlines",
        },
      }),
      prisma.airline.create({
        data: {
          code: "UA",
          name: "United Airlines",
        },
      }),
      prisma.airline.create({
        data: {
          code: "DL",
          name: "Delta Airlines",
        },
      }),
      prisma.airline.create({
        data: {
          code: "WN",
          name: "Southwest Airlines",
        },
      }),
    ]);

    // Create airports
    console.log("Creating airports...");
    await prisma.airport.createMany({
      data: [
        { code: "JFK", city: "New York" },
        { code: "LAX", city: "Los Angeles" },
        { code: "ORD", city: "Chicago" },
        { code: "SFO", city: "San Francisco" },
        { code: "MIA", city: "Miami" },
        { code: "DFW", city: "Dallas" },
        { code: "SEA", city: "Seattle" },
        { code: "BOS", city: "Boston" },
      ],
    });

    // Create aircraft
    console.log("Creating aircraft...");
    const aircraft = await Promise.all([
      prisma.aircraft.create({
        data: {
          id: 1,
          capacity: 180,
        },
      }),
      prisma.aircraft.create({
        data: {
          id: 2,
          capacity: 150,
        },
      }),
      prisma.aircraft.create({
        data: {
          id: 3,
          capacity: 200,
        },
      }),
      prisma.aircraft.create({
        data: {
          id: 4,
          capacity: 120,
        },
      }),
    ]);

    await wait(1000); // Wait for all independent entities to be created
    console.log("Created airlines, airports, and aircraft");

    // Create routes (depends on airlines, airports, and aircraft)
    console.log("Creating routes...");
    const routes = await Promise.all([
      // American Airlines routes (JFK <-> LAX)
      prisma.route.create({
        data: {
          flight_number: 101,
          airline_code: "AA",
          departure_airport: "JFK",
          destination_airport: "LAX",
          departure_time: 480, // 08:00
          duration: 360, // 6 hours
          aircraft_id: 1,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
        },
      }),
      prisma.route.create({
        data: {
          flight_number: 102,
          airline_code: "AA",
          departure_airport: "LAX",
          destination_airport: "JFK",
          departure_time: 600, // 10:00
          duration: 330, // 5.5 hours
          aircraft_id: 1,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
        },
      }),

      // United Airlines routes (SFO <-> ORD)
      prisma.route.create({
        data: {
          flight_number: 201,
          airline_code: "UA",
          departure_airport: "SFO",
          destination_airport: "ORD",
          departure_time: 540, // 09:00
          duration: 240, // 4 hours
          aircraft_id: 2,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
        },
      }),
      prisma.route.create({
        data: {
          flight_number: 202,
          airline_code: "UA",
          departure_airport: "ORD",
          destination_airport: "SFO",
          departure_time: 660, // 11:00
          duration: 270, // 4.5 hours
          aircraft_id: 2,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
        },
      }),

      // Delta Airlines routes (MIA <-> BOS)
      prisma.route.create({
        data: {
          flight_number: 301,
          airline_code: "DL",
          departure_airport: "MIA",
          destination_airport: "BOS",
          departure_time: 720, // 12:00
          duration: 180, // 3 hours
          aircraft_id: 3,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
        },
      }),
      prisma.route.create({
        data: {
          flight_number: 302,
          airline_code: "DL",
          departure_airport: "BOS",
          destination_airport: "MIA",
          departure_time: 840, // 14:00
          duration: 195, // 3.25 hours
          aircraft_id: 3,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
        },
      }),

      // Southwest Airlines routes (DFW <-> SEA)
      prisma.route.create({
        data: {
          flight_number: 401,
          airline_code: "WN",
          departure_airport: "DFW",
          destination_airport: "SEA",
          departure_time: 840, // 14:00
          duration: 300, // 5 hours
          aircraft_id: 4,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
        },
      }),
      prisma.route.create({
        data: {
          flight_number: 402,
          airline_code: "WN",
          departure_airport: "SEA",
          destination_airport: "DFW",
          departure_time: 960, // 16:00
          duration: 285, // 4.75 hours
          aircraft_id: 4,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
        },
      }),
    ]);

    await wait(1000); // Wait for routes to be created
    console.log("Created routes");

    // Create flights (depends on routes)
    console.log("Creating flights...");
    const startDate = new Date("2025-04-06");
    const endDate = new Date("2025-04-12");
    const dateRange = [];

    // Create array of dates
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateRange.push(new Date(d));
    }

    const flights = await Promise.all(
      routes.flatMap((route) =>
        dateRange.map((date) => {
          // Determine if this flight should be a cheap flight
          // We'll make the first two flights of each day cheap
          const isCheapFlight =
            (route.flight_number === 101 && route.airline_code === "AA") ||
            (route.flight_number === 201 && route.airline_code === "UA");

          // Set price based on whether it's a cheap flight
          const price = isCheapFlight
            ? route.flight_number === 101
              ? 99.99
              : 169.98
            : 199.99 + Math.floor(Math.random() * 300);

          return prisma.flight.create({
            data: {
              flight_number: route.flight_number,
              airline_code: route.airline_code,
              date: new Date(date),
              available_tickets:
                route.aircraft_id === 1
                  ? 180
                  : route.aircraft_id === 2
                  ? 150
                  : route.aircraft_id === 3
                  ? 200
                  : 120,
              price: price,
            },
          });
        })
      )
    );

    await wait(1000); // Wait for flights to be created
    console.log("Created flights");

    // Group flights by date for better readability
    const flightsByDate = {};
    flights.forEach((f) => {
      const dateStr = formatDate(f.date);
      if (!flightsByDate[dateStr]) {
        flightsByDate[dateStr] = [];
      }
      flightsByDate[dateStr].push(f);
    });

    // Print flights grouped by date
    console.log("\n=== FLIGHTS BY DATE ===");
    Object.keys(flightsByDate)
      .sort()
      .forEach((date) => {
        console.log(`\nDate: ${date}`);
        flightsByDate[date]
          .sort((a, b) =>
            `${a.airline_code}${a.flight_number}`.localeCompare(
              `${b.airline_code}${b.flight_number}`
            )
          )
          .forEach((f) => {
            console.log(`   ${f.airline_code}${f.flight_number}:`);
            console.log(`      - Flight ID: ${f.id}`);
            console.log(`      - Available Seats: ${f.available_tickets}`);
            console.log(`      - Price: $${f.price}`);
          });
      });

    // Update the flight statistics in the summary section
    console.log("\n=== FLIGHT STATISTICS ===");
    console.log(
      `Total Dates: ${dateRange.length} (${formatDate(
        startDate
      )} to ${formatDate(endDate)})`
    );
    console.log(`Flights per Date: ${routes.length}`);
    console.log(`Total Flights: ${flights.length}`);

    // Print route schedule
    console.log("\n=== DAILY ROUTE SCHEDULE ===");
    routes.forEach((r) => {
      console.log(
        `\n${r.airline_code}${r.flight_number}: ${r.departure_airport} -> ${r.destination_airport}`
      );
      console.log(`   Departure: ${minutesToTime(r.departure_time)}`);
      console.log(`   Duration: ${formatDuration(r.duration)}`);
      console.log(
        `   Aircraft: ${r.aircraft_id} (${
          r.aircraft_id === 1
            ? "180"
            : r.aircraft_id === 2
            ? "150"
            : r.aircraft_id === 3
            ? "200"
            : "120"
        } seats)`
      );
    });

    // Create seat info (depends on flights)
    console.log("Creating seat information...");
    for (const flight of flights) {
      const route = await prisma.route.findUnique({
        where: {
          flight_number_airline_code: {
            flight_number: flight.flight_number,
            airline_code: flight.airline_code,
          },
        },
        include: {
          aircraft: true,
        },
      });

      if (route && route.aircraft) {
        await Promise.all(
          Array(route.aircraft.capacity)
            .fill()
            .map((_, i) =>
              prisma.seat_info.create({
                data: {
                  flight_id: flight.id,
                  seat_number: i + 1,
                  seat_status: "AVAILABLE",
                },
              })
            )
        );
      }
    }

    await wait(1000); // Wait for seat info to be created
    console.log("Created seat information");

    // Create tickets (depends on passengers, flights, and seat info)
    console.log("Creating tickets...");
    const tickets = await Promise.all([
      prisma.ticket.create({
        data: {
          passenger_id: passengers[0].id,
          flight_id: flights[0].id,
          seat_number: 1,
          price: flights[0].price,
        },
      }),
      prisma.ticket.create({
        data: {
          passenger_id: passengers[0].id,
          flight_id: flights[1].id,
          seat_number: 2,
          price: flights[1].price,
        },
      }),
      prisma.ticket.create({
        data: {
          passenger_id: passengers[1].id,
          flight_id: flights[2].id,
          seat_number: 1,
          price: flights[2].price,
        },
      }),
    ]);

    await wait(500); // Wait for tickets to be created
    console.log("Created tickets");

    console.log("\nDatabase seeding completed successfully!");
    console.log("\n=== DETAILED SUMMARY ===");

    console.log("\n=== ACCOUNTS ===");
    console.log("1. Admin Account:");
    console.log(`   - Username: ${admin.username}`);
    console.log(`   - Role: ${admin.role}`);
    console.log("2. User Accounts:");
    console.log(`   - User1: ${user.username} (${user.role})`);
    console.log(`   - User2: ${user2.username} (${user2.role})`);

    console.log("\n=== PASSENGERS ===");
    passengers.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}:`);
      console.log(`   - ID: ${p.id}`);
      console.log(`   - Birth Date: ${formatDate(p.birth_date)}`);
      console.log(`   - Gender: ${p.gender}`);
      console.log(`   - Contact: ${p.phone_number}`);
      console.log(`   - Address: ${p.address}`);
      console.log(`   - Account: ${p.account_id}`);
    });

    console.log("\n=== AIRLINES ===");
    airlines.forEach((a) => {
      console.log(`${a.code}: ${a.name}`);
    });

    console.log("\n=== AIRCRAFT ===");
    aircraft.forEach((a) => {
      console.log(`Aircraft ${a.id}:`);
      console.log(`   - Capacity: ${a.capacity} seats`);
    });

    console.log("\n=== ROUTES ===");
    routes.forEach((r) => {
      console.log(`${r.airline_code}${r.flight_number}:`);
      console.log(
        `   - From: ${r.departure_airport} to ${r.destination_airport}`
      );
      console.log(`   - Departure: ${minutesToTime(r.departure_time)}`);
      console.log(`   - Duration: ${formatDuration(r.duration)}`);
      console.log(`   - Aircraft: ${r.aircraft_id}`);
      console.log(
        `   - Operating: ${formatDate(r.start_date)} to ${formatDate(
          r.end_date
        )}`
      );
    });

    console.log("\n=== TICKETS ===");
    tickets.forEach((t) => {
      console.log(`Ticket ${t.id}:`);
      console.log(`   - Passenger ID: ${t.passenger_id}`);
      console.log(`   - Flight ID: ${t.flight_id}`);
      console.log(`   - Seat Number: ${t.seat_number}`);
      console.log(`   - Price: $${t.price}`);
    });

    console.log("\n=== STATISTICS ===");
    console.log(`Total Accounts: ${3} (1 admin, 2 users)`);
    console.log(`Total Passengers: ${passengers.length}`);
    console.log(`Total Airlines: ${airlines.length}`);
    console.log(`Total Aircraft: ${aircraft.length}`);
    console.log(
      `Total Routes: ${routes.length} (${routes.length / 2} round-trip pairs)`
    );
    console.log(`Total Flights: ${flights.length}`);
    console.log(`Total Tickets: ${tickets.length}`);

    console.log("\n=== ROUTE PAIRS ===");
    console.log("1. American Airlines (AA):");
    console.log("   JFK -> LAX: AA101 (6h 00m)");
    console.log("   LAX -> JFK: AA102 (5h 30m)");
    console.log("\n2. United Airlines (UA):");
    console.log("   SFO -> ORD: UA201 (4h 00m)");
    console.log("   ORD -> SFO: UA202 (4h 30m)");
    console.log("\n3. Delta Airlines (DL):");
    console.log("   MIA -> BOS: DL301 (3h 00m)");
    console.log("   BOS -> MIA: DL302 (3h 15m)");
    console.log("\n4. Southwest Airlines (WN):");
    console.log("   DFW -> SEA: WN401 (5h 00m)");
    console.log("   SEA -> DFW: WN402 (4h 45m)");

    console.log("\n=== TEST CREDENTIALS ===");
    console.log("Admin - username: admin@example.com, password: admin123");
    console.log("User1 - username: user@example.com, password: user123");
    console.log("User2 - username: user2@example.com, password: user456");
  } catch (error) {
    console.log("Error seeding database:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
