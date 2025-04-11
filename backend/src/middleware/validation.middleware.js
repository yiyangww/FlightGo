//-----------------------------------------------------------------------------
// Shared util functions
//-----------------------------------------------------------------------------

// Validate airline code (must be exactly 2 uppercase letters)
const isValidAirlineCode = (str) => {
  if (typeof str !== "string") return false;
  const airlineCodeRegex = /^[A-Z]{2}$/;
  return airlineCodeRegex.test(str);
};

// Validate airport code (must be exactly 3 uppercase letters)
const isValidAirportCode = (str) => {
  if (typeof str !== "string") return false;
  const airportCodeRegex = /^[A-Z]{3}$/;
  return airportCodeRegex.test(str);
};

// Validate positive integer
const isPositiveInteger = (str) => {
  if (str === undefined || str === null) return false;
  const num = Number(str);
  return Number.isInteger(num) && num > 0;
};

// Validate non-empty string
const isNonEmptyString = (str) => {
  if (typeof str !== "string") return false;
  return str.trim().length > 0;
};

// Validate time in HH:mm format
const isValidTime = (str) => {
  if (typeof str !== "string") return false;
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(str);
};

// Validate date in YYYY-MM-DD format
const isValidDate = (str) => {
  if (typeof str !== "string") return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(str);
};

// Validate non-negative integer
const isNonNegativeInteger = (str) => {
  if (str === undefined || str === null) return false;
  const num = Number(str);
  return Number.isInteger(num) && num >= 0;
};

// Validate non-negative decimal
const isNonNegativeDecimal = (str) => {
  if (str === undefined || str === null) return false;
  const num = Number(str);
  return !isNaN(num) && num >= 0;
};

// Validate gender (must be 'male' or 'female')
const isValidGender = (str) => {
  if (typeof str !== "string") return false;
  return ["male", "female"].includes(str.toLowerCase());
};

// Validate seat status (must be 'AVAILABLE', 'UNAVAILABLE', or 'BOOKED')
const isValidSeatStatus = (str) => {
  if (typeof str !== "string") return false;
  return ["AVAILABLE", "UNAVAILABLE", "BOOKED"].includes(str.toUpperCase());
};

// Validate string length
const isValidStringLength = (str, maxLength = 255) => {
  if (str === undefined || str === null) return true; // Optional strings are valid
  if (typeof str !== "string") return false;
  return str.length <= maxLength;
};

//-----------------------------------------------------------------------------
// Middlewares for input validations
//-----------------------------------------------------------------------------

// Middlewares to validate input for Airline CRUD operations
exports.validateAirlineInput = (req, res, next) => {
  const code = req.params.code || req.body.code;
  const { name } = req.body;

  // Check if airline code and name are provided
  if (!code || !name) {
    return res
      .status(400)
      .json({ message: "Airline code and name are required" });
  }

  // Validate airline code (must be exactly 2 uppercase letters)
  if (!isValidAirlineCode(code)) {
    return res
      .status(400)
      .json({ message: "Airline code must be exactly 2 uppercase letters" });
  }

  // Validate name (must be a non-empty string)
  if (!isNonEmptyString(name)) {
    return res
      .status(400)
      .json({ message: "Airline name must be a non-empty string" });
  }

  next();
};

exports.validateAirlineKey = (req, res, next) => {
  const { code } = req.params;

  // Validate airline code (must be exactly 2 uppercase letters)
  if (!isValidAirlineCode(code)) {
    return res
      .status(400)
      .json({ message: "Airline code must be exactly 2 uppercase letters" });
  }

  next();
};

// Middlewares to validate input for Airport CRUD operations
exports.validateAirportInput = (req, res, next) => {
  const code = req.params.code || req.body.code;
  const { city } = req.body;

  // Check if airport code and city are provided
  if (!code || !city) {
    return res
      .status(400)
      .json({ message: "Airport code and city are required" });
  }

  // Validate airport code (must be exactly 3 uppercase letters)
  if (!isValidAirportCode(code)) {
    return res
      .status(400)
      .json({ message: "Airport code must be exactly 3 uppercase letters" });
  }

  // Validate city (must be a non-empty string)
  if (!isNonEmptyString(city)) {
    return res
      .status(400)
      .json({ message: "City name must be a non-empty string" });
  }

  next();
};

exports.validateAirportKey = (req, res, next) => {
  const { code } = req.params;

  // Validate airport code (must be exactly 3 uppercase letters)
  if (!isValidAirportCode(code)) {
    return res
      .status(400)
      .json({ message: "Airport code must be exactly 3 uppercase letters" });
  }

  next();
};

// Middlewares to validate input for Aircraft CRUD operations
exports.validateAircraftInput = (req, res, next) => {
  const id = req.params.id || req.body.id;
  const { capacity } = req.body;

  // Check if aircraft id and capacity are provided
  if (!id || !capacity) {
    return res
      .status(400)
      .json({ message: "Aircraft id and capacity are required" });
  }

  // Validate aircraft id (must be a positive integer)
  if (!isPositiveInteger(id)) {
    return res
      .status(400)
      .json({ message: "Aircraft id must be a positive integer" });
  }

  // Validate capacity (must be a positive integer)
  if (!isPositiveInteger(capacity)) {
    return res
      .status(400)
      .json({ message: "Aircraft capacity must be a positive integer" });
  }

  next();
};

exports.validateAircraftKey = (req, res, next) => {
  const { id } = req.params;

  // Validate aircraft id (must be a positive integer)
  if (!isPositiveInteger(id)) {
    return res
      .status(400)
      .json({ message: "Aircraft id must be a positive integer" });
  }

  next();
};

// Middlewares to validate input for Route CRUD operations
exports.validateRouteInput = (req, res, next) => {
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

  // For PUT requests, at least one field to update are required
  if (req.method === "PUT") {
    if (
      !departure_airport &&
      !destination_airport &&
      !departure_time &&
      !duration &&
      !aircraft_id &&
      !start_date &&
      !end_date
    ) {
      return res
        .status(400)
        .json({ message: "At least one field to update is required" });
    }
  } else {
    // For POST requests, all fields except end_date are required
    if (
      !flight_number ||
      !airline_code ||
      !departure_airport ||
      !destination_airport ||
      !departure_time ||
      !duration ||
      !aircraft_id ||
      !start_date
    ) {
      return res.status(400).json({
        message: "All fields except end_date are required",
      });
    }
  }

  // Validate flight number (must be a positive integer)
  if (!isPositiveInteger(flight_number)) {
    return res
      .status(400)
      .json({ message: "Flight number must be a positive integer" });
  }

  // Validate airline code (must be exactly 2 uppercase letters)
  if (!isValidAirlineCode(airline_code)) {
    return res
      .status(400)
      .json({ message: "Airline code must be exactly 2 uppercase letters" });
  }

  // Validate departure airport code (must be exactly 3 uppercase letters)
  if (departure_airport && !isValidAirportCode(departure_airport)) {
    return res.status(400).json({
      message: "Departure airport code must be exactly 3 uppercase letters",
    });
  }

  // Validate destination airport code (must be exactly 3 uppercase letters)
  if (destination_airport && !isValidAirportCode(destination_airport)) {
    return res.status(400).json({
      message: "Destination airport code must be exactly 3 uppercase letters",
    });
  }

  // Validate departure time (must be a valid time format HH:mm)
  if (departure_time && !isValidTime(departure_time)) {
    return res
      .status(400)
      .json({ message: "Departure time must be in the format HH:mm" });
  }

  // Validate duration (must be a positive integer representing minutes)
  if (duration && !isPositiveInteger(duration)) {
    return res.status(400).json({
      message: "Duration must be a positive integer representing minutes",
    });
  }

  // Validate aircraft id (must be a positive integer)
  if (aircraft_id && !isPositiveInteger(aircraft_id)) {
    return res
      .status(400)
      .json({ message: "Aircraft id must be a positive integer" });
  }

  // Validate start date (must be a valid date format YYYY-MM-DD)
  if (start_date && !isValidDate(start_date)) {
    return res.status(400).json({
      message: "Start date must be a valid date in YYYY-MM-DD format",
    });
  }

  // Validate end date (must be a valid date format YYYY-MM-DD)
  if (end_date && !isValidDate(end_date)) {
    return res
      .status(400)
      .json({ message: "End date must be a valid date in YYYY-MM-DD format" });
  }

  next();
};

exports.validateRouteKey = (req, res, next) => {
  const { flight_number, airline_code } = req.params;

  // Validate flight number (must be a positive integer)
  if (!isPositiveInteger(flight_number)) {
    return res
      .status(400)
      .json({ message: "Flight number must be a positive integer" });
  }

  // Validate airline code (must be exactly 2 uppercase letters)
  if (!isValidAirlineCode(airline_code)) {
    return res
      .status(400)
      .json({ message: "Airline code must be exactly 2 uppercase letters" });
  }

  next();
};

// Middlewares to validate input for Flight CRUD operations
exports.validateFlightInput = (req, res, next) => {
  const {
    flight_number,
    airline_code,
    date,
    available_tickets,
    price,
    version,
  } = req.body;

  // For PUT requests, version and at least one field to update are required
  if (req.method === "PUT") {
    if (!available_tickets && !price) {
      return res
        .status(400)
        .json({ message: "At least one field to update is required" });
    }
  } else {
    // For POST requests, all fields are required except version
    if (
      !flight_number ||
      !airline_code ||
      !date ||
      !available_tickets ||
      !price
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required except version" });
    }
  }

  // Validate flight number (must be a positive integer)
  if (flight_number && !isPositiveInteger(flight_number)) {
    return res
      .status(400)
      .json({ message: "Flight number must be a positive integer" });
  }

  // Validate airline code (must be exactly 2 uppercase letters)
  if (airline_code && !isValidAirlineCode(airline_code)) {
    return res
      .status(400)
      .json({ message: "Airline code must be exactly 2 uppercase letters" });
  }

  // Validate date (must be a valid date format YYYY-MM-DD)
  if (date && !isValidDate(date)) {
    return res.status(400).json({
      message: "Date must be a valid date in YYYY-MM-DD format",
    });
  }

  // Validate available tickets (must be a non-negative integer)
  if (available_tickets && !isNonNegativeInteger(available_tickets)) {
    return res
      .status(400)
      .json({ message: "Available tickets must be a non-negative integer" });
  }

  // Validate price (must be a non-negative decimal)
  if (price && !isNonNegativeDecimal(price)) {
    return res
      .status(400)
      .json({ message: "Price must be a non-negative decimal" });
  }

  // Validate version if it exists (must be a non-negative integer)
  if (version && !isNonNegativeInteger(version)) {
    return res
      .status(400)
      .json({ message: "Version must be a non-negative integer" });
  }

  next();
};

exports.validateFlightKey = (req, res, next) => {
  const { id } = req.params;

  // Validate flight id (must be a positive integer)
  if (!isPositiveInteger(id)) {
    return res
      .status(400)
      .json({ message: "Flight id must be a positive integer" });
  }

  next();
};

// Middlewares to validate input for Passenger CRUD operations
exports.validatePassengerInput = (req, res, next) => {
  const { name, birth_date, gender, address, phone_number } = req.body;

  // For PUT requests, at least one field should be provided
  if (req.method === "PUT") {
    if (!name && !birth_date && !gender && !address && !phone_number) {
      return res
        .status(400)
        .json({ message: "At least one field to update is required" });
    }
  } else {
    // For POST requests, required fields
    if (!name || !birth_date || !gender) {
      return res.status(400).json({ 
        message: "Name, birth_date, and gender are required" 
      });
    }
  }

  if (name && !isNonEmptyString(name)) {
    return res.status(400).json({ message: "Name must be non-empty" });
  }

  if (name && !isValidStringLength(name)) {
    return res.status(400).json({ 
      message: "Name must be less than 255 characters" 
    });
  }

  if (birth_date && !isValidDate(birth_date)) {
    return res
      .status(400)
      .json({ message: "Birth date must be in YYYY-MM-DD format" });
  }

  if (gender && !isValidGender(gender)) {
    return res
      .status(400)
      .json({ message: "Gender must be either 'male' or 'female'" });
  }

  if (address && !isValidStringLength(address)) {
    return res.status(400).json({ 
      message: "Address must be less than 255 characters" 
    });
  }

  if (phone_number && !isValidStringLength(phone_number)) {
    return res.status(400).json({ 
      message: "Phone number must be less than 255 characters" 
    });
  }

  if (req.user.id && !isPositiveInteger(req.user.id)) {
    return res
      .status(400)
      .json({ message: "Account id must be a positive integer" });
  }

  next();
};

exports.validatePassengerQuery = (req, res, next) => {
  const { account_id } = req.query;

  if (account_id && !isPositiveInteger(account_id)) {
    return res
      .status(400)
      .json({ message: "Account id must be a positive integer" });
  }

  next();
};

exports.validatePassengerKey = (req, res, next) => {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res
      .status(400)
      .json({ message: "Passenger id must be a positive integer" });
  }

  next();
};

// Middlewares to validate input for SeatInfo CRUD operations
exports.validateSeatInfoInput = (req, res, next) => {
  const { flight_id, seat_number, seat_status, version } = req.body;

  // For PUT requests, version and seat status are required
  if (req.method === "PUT") {
    if (!seat_status) {
      return res
        .status(400)
        .json({ message: "Seat status is required for update" });
    }
  } else if (req.method === "POST") {
    // For POST requests, all fields except version are required
    if (!flight_id || !seat_number || !seat_status) {
      return res
        .status(400)
        .json({ message: "All fields except version are required" });
    }
  }

  if (flight_id && !isPositiveInteger(flight_id)) {
    return res
      .status(400)
      .json({ message: "Flight id must be a positive integer" });
  }

  if (seat_number && !isPositiveInteger(seat_number)) {
    return res
      .status(400)
      .json({ message: "Seat number must be a positive integer" });
  }

  if (seat_status && !isValidSeatStatus(seat_status)) {
    return res.status(400).json({
      message: "Seat status must be 'AVAILABLE', 'UNAVAILABLE', or 'BOOKED'",
    });
  }

  // Validate version (must be a positive integer)
  if (version && !isPositiveInteger(version)) {
    return res
      .status(400)
      .json({ message: "Version must be a positive integer" });
  }

  next();
};

exports.validateSeatInfoKey = (req, res, next) => {
  const { flight_id, seat_number } = req.params;

  if (!isPositiveInteger(flight_id)) {
    return res
      .status(400)
      .json({ message: "Flight id must be a positive integer" });
  }

  if (!isPositiveInteger(seat_number)) {
    return res
      .status(400)
      .json({ message: "Seat number must be a positive integer" });
  }

  next();
};

// Middlewares to validate input for Ticket CRUD operations
exports.validateTicketInput = (req, res, next) => {
  const { id, passenger_id, flight_id, seat_number, price } = req.body;

  // For PUT requests, at least one field should be provided
  if (req.method === "PUT") {
    if (!seat_number && !price) {
      return res
        .status(400)
        .json({ message: "At least one field to update is required" });
    }
  } else {
    // For POST requests, all fields are required
    if (!passenger_id || !flight_id || !seat_number || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
  }

  if (id && !isPositiveInteger(id)) {
    return res
      .status(400)
      .json({ message: "Ticket id must be a positive integer" });
  }

  if (passenger_id && !isPositiveInteger(passenger_id)) {
    return res
      .status(400)
      .json({ message: "Passenger id must be a positive integer" });
  }

  if (flight_id && !isPositiveInteger(flight_id)) {
    return res
      .status(400)
      .json({ message: "Flight id must be a positive integer" });
  }

  if (seat_number && !isPositiveInteger(seat_number)) {
    return res
      .status(400)
      .json({ message: "Seat number must be a positive integer" });
  }

  if (price && !isNonNegativeDecimal(price)) {
    return res
      .status(400)
      .json({ message: "Price must be a non-negative number" });
  }

  next();
};

exports.validateTicketKey = (req, res, next) => {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res
      .status(400)
      .json({ message: "Ticket id must be a positive integer" });
  }

  next();
};

// Validate flight search parameters
exports.validateFlightSearchParams = (req, res, next) => {
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

  // Validate airport codes if provided
  if (departure_airport && !isValidAirportCode(departure_airport)) {
    return res.status(400).json({
      message: "Invalid departure airport code (must be 3 uppercase letters)",
    });
  }
  if (destination_airport && !isValidAirportCode(destination_airport)) {
    return res.status(400).json({
      message: "Invalid destination airport code (must be 3 uppercase letters)",
    });
  }

  // Validate time format if provided
  if (min_departure_time && !isValidTime(min_departure_time)) {
    return res.status(400).json({
      message: "Invalid min_departure_time format (must be HH:mm)",
    });
  }
  if (max_departure_time && !isValidTime(max_departure_time)) {
    return res.status(400).json({
      message: "Invalid max_departure_time format (must be HH:mm)",
    });
  }

  // Validate date format if provided
  if (date && !isValidDate(date)) {
    return res.status(400).json({
      message: "Invalid date format (must be YYYY-MM-DD)",
    });
  }

  // Validate numeric values if provided
  if (min_price && !isNonNegativeDecimal(min_price)) {
    return res.status(400).json({
      message: "Invalid min_price (must be a non-negative number)",
    });
  }
  if (max_price && !isNonNegativeDecimal(max_price)) {
    return res.status(400).json({
      message: "Invalid max_price (must be a non-negative number)",
    });
  }
  if (min_duration && !isNonNegativeInteger(min_duration)) {
    return res.status(400).json({
      message: "Invalid min_duration (must be a non-negative integer)",
    });
  }
  if (max_duration && !isNonNegativeInteger(max_duration)) {
    return res.status(400).json({
      message: "Invalid max_duration (must be a non-negative integer)",
    });
  }

  // Validate ranges if both min and max are provided
  if (min_price && max_price && parseFloat(min_price) > parseFloat(max_price)) {
    return res.status(400).json({
      message: "min_price cannot be greater than max_price",
    });
  }
  if (
    min_duration &&
    max_duration &&
    parseInt(min_duration) > parseInt(max_duration)
  ) {
    return res.status(400).json({
      message: "min_duration cannot be greater than max_duration",
    });
  }
  if (
    min_departure_time &&
    max_departure_time &&
    min_departure_time > max_departure_time
  ) {
    return res.status(400).json({
      message: "min_departure_time cannot be later than max_departure_time",
    });
  }

  next();
};
