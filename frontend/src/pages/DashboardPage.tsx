import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import BookingList from '../features/dashboard/components/BookingList';
import Sidebar from "../features/dashboard/components/Sidebar";
import NavigationBar from '../components/NavigationBar';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "user";
  const token = localStorage.getItem("token");
  
  if (!token) {
        setError("Unauthorized: No token found.");
        navigate("/login");
        return;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 p-6 mt-10">
      <div className="flex justify-start items-center mb-4">
          <h2 className="text-2xl font-bold">Your Bookings</h2>
          <span className="text-sm text-gray-500 ml-4">{user.username}</span>
        </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : <BookingList />
}
    </div>
    </div>
  );
};

export default DashboardPage;
