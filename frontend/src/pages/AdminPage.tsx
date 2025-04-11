import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import FlightList from '../features/admin/components/FlightList';
import { SearchData, FlightDisplay } from '../features/admin/types';
import { searchFlights, transformFlightToDisplay } from '../features/search/api/flightApi';
import FlightSearchPanel from '../features/search/components/FlightSearchPanel';
import NavigationBar from '../components/NavigationBar';
import { API_BASE_URL } from "../config";

const AdminPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [flights, setFlights] = useState<FlightDisplay[]>([]);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<FlightDisplay | null>(null);
  const [isSearchingReturn, setIsSearchingReturn] = useState(false);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const handleUpdateFlight = (flight: FlightDisplay) => {
    navigate(`/admin/update-flight/${flight.id}`, { state: { flight } });
    console.log("Updating flight:", flight);
  };

  const handleDeleteFlight = async (flightId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/flight/${flightId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.message) {
          alert(errorData.message);
        } else {
          alert("Failed to delete flight");
        }
        return;
      }
  
      alert("Flight deleted successfully!");
      setFlights((prevFlights) => prevFlights.filter((flight) => flight.id !== flightId));
    } catch (error) {
      console.error("Error deleting flight", error);
      alert("Error deleting flight");
    }
  };

  const handleSearch = async (searchData: SearchData) => {
      setIsLoading(true);
      setError("");
      setSearchData(searchData);
      setHasSearched(true);
      
      try {
        const response = await searchFlights({
          origin: searchData.route.origin,
          destination: searchData.route.destination,
          date: searchData.route.departDate,
          airlines: searchData.airline ? [searchData.airline] : undefined,
          priceMin: searchData.priceRange[0],
          priceMax: searchData.priceRange[1]
        });
        
        // Filter flights based on search parameters
        const matchedFlights = response.filter(flight => {
          const matchesRoute = flight.route.departure_airport === searchData.route.origin &&
            flight.route.destination_airport === searchData.route.destination;
          
          // If no airline is selected, show all flights
          if (!searchData.airline) {
            return matchesRoute;
          }
          
          // If airline is selected, match the airline code
          return matchesRoute && flight.airline.code === searchData.airline;
        });
  
        // Transform flights for display
        const displayFlights = matchedFlights.map(transformFlightToDisplay);
        setFlights(displayFlights);
      } catch (err) {
        setError('Failed to search flights. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Search Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <FlightSearchPanel onSearch={handleSearch} />
              </div>
            </div>
  
            {/* Flight List with Add dropdown */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {isSearchingReturn ? 'Select Return Flight' : 'Available Flights'}
                  </h2>
                  {isSearchingReturn && (
                    <div className="text-sm text-gray-600 mt-2">
                      Selected outbound flight: {selectedOutboundFlight?.airline.name} {selectedOutboundFlight?.flightNumber}
                    </div>
                  )}
                  <p className="text-gray-600 mt-1">
                    {searchData?.tripType === 'roundTrip' 
                      ? (isSearchingReturn 
                          ? 'Please select your return flight'
                          : 'Please select your outbound flight first')
                      : `${flights.length} flights found`}
                  </p>
                </div>
  
                {/* Dropdown Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    Add
                  </button>
  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-md">
                      <ul>
                        <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleNavigation("/admin/add-flight")}>
                          Add Flight
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleNavigation("/admin/add-aircraft")}>
                          Add Aircraft
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleNavigation("/admin/add-airport")}>
                          Add Airport
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleNavigation("/admin/add-airline")}>
                          Add Airline
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleNavigation("/admin/add-route")}>
                          Add Route
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Flight List */}
              {hasSearched ? (
                <FlightList
                  flights={flights}
                  onSelectFlight={() => {}}
                  onUpdateFlight={handleUpdateFlight}
                  onDeleteFlight={handleDeleteFlight}
                  isLoading={isLoading}
                  error={error}
                />
              ) : (
                <div>No flights found. Please enter search criteria.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
};

export default AdminPage;
