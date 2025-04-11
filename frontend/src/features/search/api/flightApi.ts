import { Flight, FlightDisplay } from '../types';
import { API_BASE_URL } from '../../../config';
import { calculateFlightTimes } from '../../../utils/flightTimeUtils';

interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  airlines?: string[];
  priceMin?: number;
  priceMax?: number;
}

export const searchFlights = async (params: SearchParams): Promise<Flight[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build required query parameters
    const queryParams = new URLSearchParams({
      departure_airport: params.origin,
      destination_airport: params.destination,
      date: params.date,
    });

    // Add optional parameters
    if (params.returnDate) {
      queryParams.append('return_date', params.returnDate);
    }
    if (params.airlines && params.airlines.length > 0) {
      //console.log('Airline codes before joining:', params.airlines);
      const airlineCodes = params.airlines.join(',');
      //console.log('Airline codes after joining:', airlineCodes);
      queryParams.append('airline.code', airlineCodes);
    }
    if (params.priceMin !== undefined) {
      queryParams.append('min_price', params.priceMin.toString());
    }
    if (params.priceMax !== undefined) {
      queryParams.append('max_price', params.priceMax.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/flight/search?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.message || 'Failed to search flights');
    }

    const flights = await response.json();
    //console.log('API Response Data:', flights);
    
    if (!Array.isArray(flights)) {
      console.error('Invalid response format. Expected array of flights:', flights);
      throw new Error('Invalid response format from server');
    }
    
    return flights;
  } catch (error) {
    console.error('Error searching flights:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the server');
    }
    throw error;
  }
};

export const transformFlightToDisplay = (flight: Flight): FlightDisplay => {
  const flightTimes = calculateFlightTimes(
    flight.route.departure_time,
    flight.route.duration,
    flight.date
  );

  return {
    id: flight.id,
    flightNumber: flight.flight_number,
    airlineCode: flight.airline_code,
    date: flight.date,
    availableTickets: flight.available_tickets,
    price: flight.price,
    airline: {
      code: flight.airline.code,
      name: flight.airline.name
    },
    departure: {
      airport: flight.route.departure_airport,
      city: flight.route.departure_airport_rel.city,
      time: flightTimes.departureTime,
      date: flightTimes.departureDate
    },
    arrival: {
      airport: flight.route.destination_airport,
      city: flight.route.destination_airport_rel.city,
      time: flightTimes.arrivalTime,
      date: flightTimes.arrivalDate
    },
    duration: flight.route.formatted_duration,
    aircraft: {
      id: flight.route.aircraft.id,
      capacity: flight.route.aircraft.capacity,
      model: flight.route.aircraft.model
    }
  };
}; 