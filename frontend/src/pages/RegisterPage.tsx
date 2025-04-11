import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("USER");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Register Failed');
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/dashboard');
        } catch (err: any) {
          setError(err.message);
        }
      };
  
    return (
      <div className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border mb-2" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border mb-2" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border mb-4">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">Register</button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600">Already have an account?</p>
          <button 
            onClick={() => navigate("/login")} 
            className="w-full py-2 mt-2 rounded text-white bg-blue-500 hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    );
  };
  
  export default RegisterPage;