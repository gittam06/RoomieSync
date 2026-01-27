// frontend/src/components/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '' // Note: We aren't checking password strictly yet for simplicity
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // We will search for the user by email
      // Note: In a real app, use a dedicated /login endpoint with hashing
      const response = await api.get(`/users/?skip=0&limit=100`);
      
      const users = response.data;
      const user = users.find(u => u.email === formData.email);

      if (user) {
        // SAVE USER TO BROWSER (So we know who is logged in)
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('username', user.username);
        
        // Go to Dashboard
        navigate('/dashboard');
      } else {
        setError('User not found. Please sign up first.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-1">Email</label>
          <input 
            type="email" name="email"
            value={formData.email} onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600 focus:border-blue-500 outline-none"
            required
          />
        </div>
        
        {/* Fake Password field for UI (since we are just checking email for now) */}
        <div>
          <label className="block text-slate-300 mb-1">Password</label>
          <input 
            type="password" name="password"
            value={formData.password} onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded transition">
          Log In
        </button>
      </form>

      {error && <p className="mt-4 text-center text-red-400">{error}</p>}
    </div>
  );
};

export default Login;