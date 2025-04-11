import React, { useState, useEffect, useRef } from 'react';
import { TripType, Route, SearchData } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getAirlines, Airline } from '../api/airlineApi';
import { getAirports, Airport } from '../api/airportApi';

interface FlightSearchPanelProps {
  onSearch: (searchData: SearchData) => void;
  disabled?: boolean;
  initialSearchData?: SearchData | null;
}

const MAX_PRICE = 100000;
const MAX_DISPLAYED_AIRLINES = 10;

const FlightSearchPanel: React.FC<FlightSearchPanelProps> = ({ 
  onSearch, 
  disabled = false,
  initialSearchData = null 
}) => {
  const [tripType, setTripType] = useState<TripType>(initialSearchData?.tripType || 'oneWay');
  const [route, setRoute] = useState<Route>(initialSearchData?.route || { 
    origin: '', 
    destination: '', 
    departDate: new Date().toISOString().split('T')[0] 
  });
  const [returnDate, setReturnDate] = useState<string>(initialSearchData?.returnDate || '');
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [airline, setAirline] = useState<string>(initialSearchData?.airline || '');
  const [priceRange, setPriceRange] = useState<[number, number]>(initialSearchData?.priceRange || [0, MAX_PRICE]);
  const [error, setError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // New states for suggestions
  const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Airport[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Refs for handling click outside
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [airlinesData, airportsData] = await Promise.all([
          getAirlines(),
          getAirports()
        ]);
        setAirlines(airlinesData);
        setAirports(airportsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load necessary data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Handle click outside to close suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const findAirportCode = (input: string): string => {
    // First, check if the input is already an airport code (3 uppercase letters)
    if (/^[A-Z]{3}$/.test(input)) {
      return input;
    }

    // If not, search for a city match
    const airport = airports.find(
      airport => airport.city.toLowerCase() === input.toLowerCase()
    );

    return airport ? airport.code : input;
  };

  const handleTripTypeChange = (value: string) => {
    const newType = value as TripType;
    setTripType(newType);
    if (newType !== 'roundTrip') {
      setReturnDate('');
    }
  };

  const handleRouteChange = (
    field: 'origin' | 'destination' | 'departDate',
    value: string
  ) => {
    setRoute(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filterAirports = (input: string): Airport[] => {
    const searchTerm = input.toLowerCase();
    return airports.filter(airport => 
      airport.city.toLowerCase().includes(searchTerm) || 
      airport.code.toLowerCase().includes(searchTerm)
    ).slice(0, 5); // Limit to 5 suggestions
  };

  const handleOriginInput = (value: string) => {
    handleRouteChange('origin', value);
    if (value.length > 0) {
      setOriginSuggestions(filterAirports(value));
      setShowOriginSuggestions(true);
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
    }
  };

  const handleDestinationInput = (value: string) => {
    handleRouteChange('destination', value);
    if (value.length > 0) {
      setDestinationSuggestions(filterAirports(value));
      setShowDestinationSuggestions(true);
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  };

  const handleSuggestionClick = (type: 'origin' | 'destination', airport: Airport) => {
    handleRouteChange(type, airport.code);
    if (type === 'origin') {
      setShowOriginSuggestions(false);
      setOriginSuggestions([]);
    } else {
      setShowDestinationSuggestions(false);
      setDestinationSuggestions([]);
    }
  };

  const handlePriceChange = (index: 0 | 1, value: string) => {
    const numValue = Number(value);
    
    // Check for negative values
    if (numValue < 0) {
      setPriceError('Price cannot be negative');
      return;
    }

    // Check if min price is greater than max price
    if (index === 0 && numValue > priceRange[1]) {
      setPriceError('Minimum price cannot be greater than maximum price');
      return;
    }

    // Check if max price is less than min price
    if (index === 1 && numValue < priceRange[0]) {
      setPriceError('Maximum price cannot be less than minimum price');
      return;
    }

    setPriceError(null);
    setPriceRange([index === 0 ? numValue : priceRange[0], index === 1 ? numValue : priceRange[1]]);
  };

  const handleSearch = () => {
    // Reset errors
    setError(null);
    setDateError(null);

    // Validate dates
    if (!route.departDate) {
      setDateError('Please select a departure date');
      return;
    }

    if (tripType === 'roundTrip' && !returnDate) {
      setDateError('Please select a return date for round trip');
      return;
    }

    // Convert city names to airport codes if necessary
    const originCode = findAirportCode(route.origin);
    const destinationCode = findAirportCode(route.destination);

    // Check if valid airport codes were found
    if (!/^[A-Z]{3}$/.test(originCode)) {
      setError(`Could not find airport for origin: ${route.origin}`);
      return;
    }
    if (!/^[A-Z]{3}$/.test(destinationCode)) {
      setError(`Could not find airport for destination: ${route.destination}`);
      return;
    }

    const searchData: SearchData = {
      tripType,
      route: {
        ...route,
        origin: originCode,
        destination: destinationCode
      },
      returnDate: tripType === 'roundTrip' ? returnDate : null,
      airline,
      priceRange,
    };
    onSearch(searchData);
  };

  // Get displayed airlines (first 10 + Others if more than 10)
  const displayedAirlines = airlines.length > MAX_DISPLAYED_AIRLINES
    ? [
        ...airlines.slice(0, MAX_DISPLAYED_AIRLINES),
        { code: 'OTHERS', name: 'Others' }
      ]
    : airlines;

  return (
    <div className="border border-gray-200 rounded-lg p-4 max-w-2xl bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Flight Search</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {dateError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {dateError}
        </div>
      )}

      {/* Trip Type Dropdown */}
      <div className="mb-4">
        <label className="block mb-2">Trip Type: </label>
        <Select 
          onValueChange={handleTripTypeChange} 
          defaultValue={tripType}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select trip type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oneWay">One Way</SelectItem>
            <SelectItem value="roundTrip">Round Trip</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Route Information */}
      <div className="space-y-4">
        <div className="mb-3 relative" ref={originRef}>
          <label className="block mb-1">Origin: </label>
          <Input
            type="text"
            value={route.origin}
            placeholder="Enter city name or airport"
            onChange={(e) => handleOriginInput(e.target.value)}
            onFocus={() => setShowOriginSuggestions(true)}
            disabled={disabled}
          />
          {showOriginSuggestions && originSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
              {originSuggestions.map(airport => (
                <div
                  key={airport.code}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick('origin', airport)}
                >
                  <div className="font-medium">{airport.city}</div>
                  <div className="text-sm text-gray-500">{airport.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-3 relative" ref={destinationRef}>
          <label className="block mb-1">Destination: </label>
          <Input
            type="text"
            value={route.destination}
            placeholder="Enter city name or airport"
            onChange={(e) => handleDestinationInput(e.target.value)}
            onFocus={() => setShowDestinationSuggestions(true)}
            disabled={disabled}
          />
          {showDestinationSuggestions && destinationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
              {destinationSuggestions.map(airport => (
                <div
                  key={airport.code}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick('destination', airport)}
                >
                  <div className="font-medium">{airport.city}</div>
                  <div className="text-sm text-gray-500">{airport.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="block mb-1">Departure Date: </label>
          <Input
            type="date"
            value={route.departDate}
            onChange={(e) => handleRouteChange('departDate', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Show "Return Date" only if it's a round-trip */}
        {tripType === 'roundTrip' && (
          <div className="mb-3">
            <label className="block mb-1">Return Date: </label>
            <Input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={disabled}
              min={route.departDate}
            />
          </div>
        )}
      </div>

      {/* Airlines Dropdown Selection */}
      <div className="mb-4">
        <label className="block mb-1">Airlines: </label>
        <Select 
          onValueChange={setAirline} 
          defaultValue={airline}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="-- Please Select --" />
          </SelectTrigger>
          <SelectContent>
            {displayedAirlines.map((opt) => (
              <SelectItem value={opt.code} key={opt.code}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="block mb-1">Price Range: </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) => handlePriceChange(0, e.target.value)}
            placeholder="Min price"
            className="w-full"
            min="0"
          />
          <span>-</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) => handlePriceChange(1, e.target.value)}
            placeholder="Max price"
            className="w-full"
            min="0"
          />
        </div>
        {priceError && (
          <div className="mt-1 text-sm text-red-500">
            {priceError}
          </div>
        )}
      </div>

      {/* Search Button */}
      <div className="mt-6">
        <Button 
          onClick={handleSearch}
          variant="default"
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default FlightSearchPanel;
