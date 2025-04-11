import React, { useState, useEffect } from 'react';
import { BookingFormProps, PassengerInfo, Flight } from '../types';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Passenger, getMyPassengers, getPassenger } from '../api/bookingApi';

const BookingForm: React.FC<BookingFormProps> = ({
  outboundFlight,
  outboundSeatNumber,
  returnFlight,
  returnSeatNumber,
  onSubmit,
  isLoading = false,
}) => {
  const [existingPassengers, setExistingPassengers] = useState<Passenger[]>([]);
  const [selectedPassengerId, setSelectedPassengerId] = useState<number | 'new'>();
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [formData, setFormData] = useState<PassengerInfo>({
    name: '',
    birth_date: '',
    gender: 'male',
    address: '',
    phone_number: ''
  });
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const passengers = await getMyPassengers();
        setExistingPassengers(passengers);
      } catch (error) {
        console.error('Failed to fetch passengers:', error);
      }
    };

    fetchPassengers();
  }, []);

  useEffect(() => {
    const fetchPassengerDetails = async () => {
      if (selectedPassengerId && selectedPassengerId !== 'new') {
        try {
          const passenger = await getPassenger(selectedPassengerId);
          setSelectedPassenger(passenger);
          setFormData({
            name: passenger.name,
            birth_date: passenger.birth_date,
            gender: passenger.gender,
            address: passenger.address || '',
            phone_number: passenger.phone_number || ''
          });
        } catch (error) {
          console.error('Failed to fetch passenger details:', error);
        }
      } else {
        setSelectedPassenger(null);
      }
    };

    fetchPassengerDetails();
  }, [selectedPassengerId]);

  const handlePassengerSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedPassengerId(value === 'new' ? 'new' : Number(value));
    
    if (value === 'new') {
      setFormData({
        name: '',
        birth_date: '',
        gender: 'male',
        address: '',
        phone_number: ''
      });
      setSelectedPassenger(null);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setPhoneNumber('');
      setPhoneError(null);
      return;
    }

    // Check if the input is a valid integer
    if (/^\d+$/.test(value)) {
      setPhoneNumber(value);
      setPhoneError(null);
    } else {
      setPhoneError('Please enter numbers only');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPassengerId === 'new') {
      // Format birth_date to match backend's expected format (YYYY-MM-DD)
      const formattedData = {
        ...formData,
        birth_date: formData.birth_date.split('T')[0],
        ...(formData.address ? { address: formData.address } : {}),
        ...(formData.phone_number ? { phone_number: formData.phone_number } : {}),
        ...(phoneNumber ? { phone_number: phoneNumber } : {})
      };
      await onSubmit(formattedData);
    } else if (selectedPassenger) {
      // If using existing passenger, submit their data with ID
      await onSubmit({
        id: selectedPassenger.id,
        name: selectedPassenger.name,
        birth_date: selectedPassenger.birth_date.split('T')[0],
        gender: selectedPassenger.gender,
        address: selectedPassenger.address,
        phone_number: selectedPassenger.phone_number
      });
    }
  };

  const totalPrice = parseFloat(outboundFlight.price) + (returnFlight ? parseFloat(returnFlight.price) : 0);

  interface FlightSummaryCardProps {
    flight: Flight;
    seatNumber: string;
    isReturn?: boolean;
  }

  const FlightSummaryCard: React.FC<FlightSummaryCardProps> = ({ flight, seatNumber, isReturn = false }) => (
    <Card className="mb-4">
      <CardHeader>
        <h3 className="text-xl font-semibold">{isReturn ? 'Return Flight' : 'Outbound Flight'}</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground">
              {flight.airline.name} ({flight.airline.code})
            </div>
            <div className="text-sm">
              {flight.departure.airport} ({flight.departure.city}) → {flight.arrival.airport} ({flight.arrival.city})
            </div>
            <div className="text-sm text-muted-foreground">
              Date: {flight.departure.date}
            </div>
            <div className="text-sm text-muted-foreground">
              Time: {flight.departure.time}
            </div>
            <div className="text-sm">
              Seat Number: {seatNumber}
            </div>
            <div className="text-lg font-bold text-primary">
              Price: ${flight.price}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-full sm:max-w-2xl mx-auto">
      {/* Flight Summary */}
      <div className="mb-6">
        <FlightSummaryCard flight={outboundFlight} seatNumber={outboundSeatNumber} />
        {returnFlight && returnSeatNumber && (
          <FlightSummaryCard flight={returnFlight} seatNumber={returnSeatNumber} isReturn />
        )}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="text-xl font-bold text-primary">
              Total Price: ${totalPrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Passenger Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Passenger Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Passenger
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedPassengerId}
            onChange={handlePassengerSelect}
          >
            <option value="">Select a passenger</option>
            <option value="new">Create New Passenger</option>
            {existingPassengers.map(passenger => (
              <option key={passenger.id} value={passenger.id}>
                {passenger.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Passenger Details */}
        {selectedPassenger && selectedPassengerId !== 'new' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Selected Passenger Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Birth Date:</span> {selectedPassenger.birth_date.split('T')[0]}</p>
              <p><span className="font-medium">Gender:</span> {selectedPassenger.gender}</p>
            </div>
          </div>
        )}

        {/* New Passenger Form */}
        {selectedPassengerId === 'new' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                required
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full p-2 border rounded-md"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-600">{phoneError}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !selectedPassengerId}
        className="w-full mt-6"
      >
        {isLoading ? 'Processing...' : 'Confirm Booking'}
      </Button>
    </div>
  );
};

export default BookingForm; 