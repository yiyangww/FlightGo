import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingForm from '../features/booking/components/BookingForm';
import { createPassenger, createTicket, getPassenger } from '../features/booking/api/bookingApi';
import { updateSeatStatus } from '../features/seatSelection/api/seatApi';
import { FlightDisplay } from '../features/search/types';
import NavigationBar from '../components/NavigationBar';

interface BookingState {
  outboundFlight: FlightDisplay;
  outboundSeat: { 
    seatNumber: string; 
    price: number;
    version: number;
  };
  returnFlight?: FlightDisplay;
  returnSeat?: { 
    seatNumber: string; 
    price: number;
    version: number;
  };
  isRoundTrip: boolean;
}

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get flight and seat info from location state
  const state = location.state as BookingState;

  if (!state?.outboundFlight || !state?.outboundSeat || (state.isRoundTrip && (!state.returnFlight || !state.returnSeat))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">Invalid Booking</h2>
          <p className="mt-2 text-gray-600">
            Please select {state?.isRoundTrip ? 'both flights and seats' : 'a flight and seat'} first.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (passengerData: {
    id?: number;
    name: string;
    birth_date: string;
    gender: 'male' | 'female';
    address?: string;
    phone_number?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get or create passenger based on whether it's a new or existing one
      const passenger = passengerData.id 
        ? await getPassenger(passengerData.id)
        : await createPassenger(passengerData);

      // Create outbound ticket
      const outboundTicketData = {
        passenger_id: passenger.id,
        flight_id: parseInt(state.outboundFlight.id.toString()),
        seat_number: parseInt(state.outboundSeat.seatNumber),
        price: parseFloat(state.outboundFlight.price)
      };

      const outboundTicket = await createTicket(outboundTicketData);

      // Update outbound seat status to BOOKED
      await updateSeatStatus(
        state.outboundFlight.id.toString(),
        parseInt(state.outboundSeat.seatNumber),
        'BOOKED',
        state.outboundSeat.version
      );

      let returnTicket = null;
      if (state.isRoundTrip && state.returnFlight && state.returnSeat) {
        // Create return ticket
        const returnTicketData = {
          passenger_id: passenger.id,
          flight_id: parseInt(state.returnFlight.id.toString()),
          seat_number: parseInt(state.returnSeat.seatNumber),
          price: parseFloat(state.returnFlight.price)
        };

        returnTicket = await createTicket(returnTicketData);

        // Update return seat status to BOOKED
        await updateSeatStatus(
          state.returnFlight.id.toString(),
          parseInt(state.returnSeat.seatNumber),
          'BOOKED',
          state.returnSeat.version
        );
      }

      // Navigate to confirmation page
      navigate('/booking-confirmation', {
        state: {
          outboundFlight: state.outboundFlight,
          outboundTicket: {
            ...outboundTicket,
            passenger,
            passenger_id: passenger.id
          },
          returnFlight: state.returnFlight,
          returnTicket: returnTicket ? {
            ...returnTicket,
            passenger,
            passenger_id: passenger.id
          } : null,
          isRoundTrip: state.isRoundTrip
        }
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete booking. Please try again.';
      setError(errorMessage);
      console.error('Booking error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Complete Your Booking</h1>
          </div>

          <BookingForm
            outboundFlight={state.outboundFlight}
            returnFlight={state.returnFlight}
            outboundSeatNumber={state.outboundSeat.seatNumber}
            returnSeatNumber={state.returnSeat?.seatNumber}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 