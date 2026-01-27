// frontend/src/components/Signup.jsx
import { useState } from 'react';
import api from '../api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Creating user...');
    
    try {
      // This calls your Python Backend!
      const response = await api.post('/users/', formData);
      setStatus(`Success! User created with ID: ${response.data.id}`);
      setFormData({ username: '', email: '', password: '' }); // Clear form
    } catch (error) {
      console.error(error);
      setStatus('Error: Could not create user (Email might be taken)');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Join RoomieSync</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-1">Username</label>
          <input 
            type="text" 
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-1">Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-1">Password</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Sign Up
        </button>
      </form>

      {status && (
        <p className={`mt-4 text-center ${status.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
          {status}
        </p>
      )}
    </div>
  );
};

export default Signup;