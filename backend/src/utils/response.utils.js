const { minutesToTime, formatDuration, formatDate } = require("./time.utils");

exports.formatRouteResponse = (route) => {
  return {
    ...route,
    departure_time: minutesToTime(route.departure_time),
    formatted_duration: formatDuration(route.duration),
    start_date: formatDate(route.start_date),
    end_date: formatDate(route.end_date),
  };
};

exports.formatRouteResponses = (routes) => {
  return routes.map(exports.formatRouteResponse);
};

exports.formatFlightResponse = (flight) => {
  if (!flight) return flight;

  const formattedFlight = {
    ...flight,
    date: formatDate(flight.date),
  };

  if (flight.route) {
    formattedFlight.route = {
      ...flight.route,
      departure_time: minutesToTime(flight.route.departure_time),
      formatted_duration: formatDuration(flight.route.duration),
      start_date: formatDate(flight.route.start_date),
      end_date: formatDate(flight.route.end_date),
    };
  }

  return formattedFlight;
};

exports.formatFlightResponses = (flights) => {
  return flights.map(exports.formatFlightResponse);
};
