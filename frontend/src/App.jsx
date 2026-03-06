import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// --- LAYOUTS ---
import AppLayout from './layouts/AppLayout';

// --- PAGES ---
import Landing from './pages/Landing';
import Login from './components/Login'; // Ensure this path matches your folder structure
import Register from './pages/Register';
import Setup from './pages/Setup';

// --- THE NEW APP PAGES ---
import Home from './pages/Home';
import Money from './pages/Money';
import Tasks from './pages/Tasks';
import Social from './pages/Social';
import Settings from './pages/Settings';

// --- AUTH GUARD ---
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  // If we have a token, render the child routes. If not, go to Landing.
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. PUBLIC ROUTES (No Login Needed) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 2. PROTECTED ROUTES (Login Required) */}
          <Route element={<ProtectedRoute />}>
            
            {/* Onboarding Page */}
            <Route path="/setup" element={<Setup />} />

            {/* THE MAIN APP (Uses the AppLayout Shell) */}
            <Route element={<AppLayout />}>
              {/* If they go to /dashboard (old link), send them to /home */}
              <Route path="/dashboard" element={<Navigate to="/home" replace />} />
              
              <Route path="/home" element={<Home />} />
              <Route path="/money" element={<Money />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/social" element={<Social />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* 3. CATCH ALL (Prevents Blank Page on 404) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;