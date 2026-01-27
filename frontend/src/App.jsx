// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Route: Shows Login/Signup options */}
        <Route path="/" element={
          <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
             <div className="text-center mb-10">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
                  RoomieSync
                </h1>
                <p className="text-slate-400 text-lg">The Ultimate Bachelor Pad OS</p>
              </div>
              
              <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl border border-slate-700">
                <div className="flex justify-center gap-4 mb-6">
                  {/* Tabs to toggle between Login and Signup */}
                  <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                  <span className="text-slate-500">|</span>
                  <Link to="/signup" className="text-blue-400 hover:underline">Sign Up</Link>
                </div>
                
                {/* Default to Login view if on home page */}
                <Login />
              </div>
          </div>
        } />

        <Route path="/signup" element={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
             <Signup />
          </div>
        } />

        <Route path="/login" element={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
             <Login />
          </div>
        } />

        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App