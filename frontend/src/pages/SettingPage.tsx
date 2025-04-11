import { useNavigate } from "react-router-dom";
import NavigationBar from '../components/NavigationBar';

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
    <div className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Settings</h2>
      <button
        onClick={handleLogout}
        className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
    </div>
  );
};

export default SettingsPage;
