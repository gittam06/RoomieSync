import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { User, Lock, ArrowRight, Eye, EyeOff, ArrowLeft, Mail, KeyRound, CheckCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Forgot Password State
  const [forgotMode, setForgotMode] = useState(false);
  const [resetData, setResetData] = useState({ identifier: '', new_password: '', confirm_password: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const usersRes = await api.get('/users/');
      const user = usersRes.data.find(u => u.username === formData.username);

      if (user) {
        login(user.username, user.id);

        if (user.household_id) {
          navigate('/home');
        } else {
          navigate('/setup');
        }
      } else {
        setError('User not found. Check your username.');
      }

    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (resetData.new_password.length < 4) {
      setResetError('Password must be at least 4 characters.');
      return;
    }
    if (resetData.new_password !== resetData.confirm_password) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      await api.post('/users/reset-password', {
        identifier: resetData.identifier,
        new_password: resetData.new_password
      });
      setResetSuccess(true);
    } catch (err) {
      setResetError(err.response?.data?.detail || 'No account found with that username or email.');
    } finally {
      setResetLoading(false);
    }
  };

  const exitForgotMode = () => {
    setForgotMode(false);
    setResetSuccess(false);
    setResetData({ identifier: '', new_password: '', confirm_password: '' });
    setResetError('');
  };

  // ========== FORGOT PASSWORD VIEW ==========
  if (forgotMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-600/20 rounded-full blur-[100px] animate-float pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 animate-fade-up">
            <Link to="/" className="text-3xl mb-4 inline-block">🏠 <span className="font-bold text-white">RoomieSync</span></Link>
            <h2 className="text-2xl font-bold text-white">Reset Password</h2>
            <p className="text-slate-400 mt-2">Enter your username or email to reset.</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-up" style={{ animationDelay: '0.1s' }}>

            {resetSuccess ? (
              /* ✅ Success State */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-emerald-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
                <p className="text-slate-400 text-sm mb-6">Your password has been changed. You can now log in with your new password.</p>
                <button
                  onClick={exitForgotMode}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={18} /> Back to Login
                </button>
              </div>
            ) : (
              /* 📝 Reset Form */
              <form onSubmit={handleResetPassword} className="space-y-5">

                {/* Username or Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username or Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="text"
                      name="identifier"
                      required
                      value={resetData.identifier}
                      className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                      placeholder="Enter your username or email"
                      onChange={handleResetChange}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="new_password"
                      required
                      value={resetData.new_password}
                      className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                      placeholder="Enter new password"
                      onChange={handleResetChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      name="confirm_password"
                      required
                      value={resetData.confirm_password}
                      className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                      placeholder="Confirm new password"
                      onChange={handleResetChange}
                    />
                  </div>
                </div>

                {resetError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">{resetError}</div>}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resetLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Reset Password <KeyRound size={18} /></>}
                </button>
              </form>
            )}
          </div>

          {!resetSuccess && (
            <p className="text-center mt-6 text-slate-500">
              Remember your password?{' '}
              <button onClick={exitForgotMode} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors cursor-pointer">Back to Login</button>
            </p>
          )}
        </div>
      </div>
    );
  }

  // ========== NORMAL LOGIN VIEW ==========
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden font-sans">

      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-up">
          <Link to="/" className="text-3xl mb-4 inline-block">🏠 <span className="font-bold text-white">RoomieSync</span></Link>
          <h2 className="text-2xl font-bold text-white">Welcome back!</h2>
          <p className="text-slate-400 mt-2">Log in to manage your house.</p>
        </div>

        {/* Glass Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  placeholder="Enter your username"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer bg-transparent border-none">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Log In <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-slate-500">
          Don't have a squad yet?{' '}
          <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;