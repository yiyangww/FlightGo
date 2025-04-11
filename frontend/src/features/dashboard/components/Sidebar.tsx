import { Link } from "react-router-dom";

const Sidebar = ({ role }: { role: string }) => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6">FlightGo</h2>
      <Link to="/dashboard" className="mb-4 hover:text-gray-400">
        My Booking
      </Link>
      {role === "ADMIN" ? (
        <Link to="/admin" className="mb-4 hover:text-gray-400">Admin</Link>
      ) : (
        <Link to="/search" className="mb-4 hover:text-gray-400">Search</Link>
      )}
      <Link to="/settings" className="hover:text-gray-400">Settings</Link>
    </div>
  );
};

export default Sidebar;
