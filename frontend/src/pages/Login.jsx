import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, BookOpen, Building2, Eye, EyeOff, GraduationCap, Loader, Mail, Lock, ShieldCheck, Users, BarChart2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { setUser, setSchool } from '../store/authSlice';
import apiClient from '../utils/apiClient';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userRole = user?.role;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(`/${userRole}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  // Views: 'login', 'forgot', 'verify', 'reset'
  const [view, setView] = useState('login');
  
  // Login Form Data (kept blank by default)
  const [formData, setFormData] = useState({
    schoolCode: location.state?.schoolCode || '',
    email: location.state?.email || '',
    password: '',
  });

  // Forgot Password Flow States
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer states for verification code expiration (1 minute = 60s)
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown hook
  useEffect(() => {
    let interval = null;
    if (view === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'schoolCode' ? value.toUpperCase() : value,
    }));
  };

  const validateLoginForm = () => {
    if (!formData.schoolCode.trim()) {
      toast.error('School code is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }

    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        schoolCode: formData.schoolCode,
      });
      const { user, school, accessToken, refreshToken, role } = response.data;
      const loggedInUser = user || {
        name: response.data.userName,
        email: response.data.userEmail,
        phone: response.data.phone,
        role,
      };
      const loggedInRole = loggedInUser.role || role;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Clear the loggedOut guard so this fresh login is trusted
      sessionStorage.removeItem('loggedOut');

      dispatch(setUser(loggedInUser));
      dispatch(setSchool(school));

      toast.success('Login successful!');

      switch (loggedInRole) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'teacher':
            navigate('/teacher/dashboard', { replace: true });
            break;
          case 'student':
            navigate('/student/dashboard', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password step 1: Request OTP code
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!forgotEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('Verification code sent to your email.');
      setTimer(60);
      setCanResend(false);
      setView('verify');
    } catch (error) {
      toast.error(error.response?.data?.message || "User doesn't exist");
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('A new verification code has been sent to your email.');
      setResetCode('');
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password step 2: Verify OTP code
  const handleVerifyCodeSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      toast.error('Verification code is required');
      return;
    }
    if (resetCode.length !== 5) {
      toast.error('Code must be exactly 5 characters');
      return;
    }

    if (timer === 0) {
      toast.error('Verification code has expired. Please resend code.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/verify-reset-code', { email: forgotEmail, code: resetCode });
      toast.success('Code verified successfully.');
      setView('reset');
    } catch (error) {
      toast.error('wrong code');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password step 3: Reset password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    const pwd = newPassword || '';
    const hasMinLength = pwd.length >= 6;
    const hasCapital = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);

    if (!hasMinLength || !hasCapital || !hasNumber || !hasSpecial) {
      toast.error('Password does not meet validation requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match. Please try again.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: forgotEmail,
        code: resetCode,
        newPassword,
      });
      toast.success('Password reset successfully!');
      // Reset forms
      setNewPassword('');
      setConfirmPassword('');
      setForgotEmail('');
      setResetCode('');
      setView('login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-8 antialiased">
      <Toaster position="top-right" />

      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Info Panel */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#eff6ff] p-8 lg:p-12">
          <div>
            {/* Logo */}
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-2 shadow-sm border border-slate-200/60">
                <GraduationCap className="h-6 w-6 text-slate-800" />
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 leading-tight">SchoolHub</span>
                <span className="block text-xs font-medium text-slate-500">Login portal</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              Login is the gate for the school system.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Enter your school credentials to open the dashboard. The system will identify your role automatically.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ['JWT auth', 'Token based login flow', ShieldCheck],
              ['Role access', 'Automatic from credentials', Users],
              ['School code', 'Keeps each school separate', Building2],
              ['Reports', 'PDF and Excel exports later', BarChart2],
            ].map(([title, description, Icon]) => (
              <div key={title} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                <Icon className="h-5 w-5 text-teal-600" />
                <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-col justify-center rounded-2xl bg-white p-8 shadow-sm border border-slate-100 lg:p-12">
          
          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Welcome back</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Login to your dashboard</h2>
                <p className="mt-2 text-sm text-slate-500">Use the school code generated during registration.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">School Code *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="schoolCode"
                      value={formData.schoolCode}
                      onChange={handleChange}
                      placeholder="E.G. SCHOOL001"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white uppercase placeholder:text-slate-400 placeholder:normal-case"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@school.edu"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">Password *</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white placeholder:text-slate-400"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#063d31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#042d24] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {view === 'forgot' && (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security Access</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Forgot Password</h2>
                <p className="mt-2 text-sm text-slate-500">Enter your registered email address to receive a verification code.</p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@school.edu"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#063d31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#042d24] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setView('login')}
                className="mt-4 w-full text-center text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Back to Login
              </button>
            </>
          )}

          {/* VIEW: VERIFY OTP CODE */}
          {view === 'verify' && (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Code Sent</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Enter Reset Code</h2>
                <p className="mt-2 text-sm text-slate-500">
                  We sent a 5-character verification code to <strong>{forgotEmail}</strong>. Code is valid for 1 minute.
                </p>
              </div>

              <form onSubmit={handleVerifyCodeSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">5-Character Code *</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={5}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="A1#B2"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-center font-bold tracking-widest text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white uppercase placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  <span className="text-xs font-semibold text-slate-600">
                    {timer > 0 ? (
                      <span className="flex items-center gap-1.5 font-bold text-amber-700">
                        Time remaining: 00:{timer < 10 ? '0' + timer : timer}
                      </span>
                    ) : (
                      <span className="font-bold text-red-600">Code has expired!</span>
                    )}
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!canResend || loading}
                    className={`mt-2 text-xs font-bold underline transition ${
                      canResend
                        ? 'cursor-pointer text-slate-800 hover:text-black'
                        : 'cursor-not-allowed text-slate-400 opacity-50'
                    }`}
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#063d31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#042d24] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setView('login')}
                className="mt-4 w-full text-center text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Back to Login
              </button>
            </>
          )}

          {/* VIEW: RESET PASSWORD */}
          {view === 'reset' && (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reset Security</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create New Password</h2>
                <p className="mt-2 text-sm text-slate-500">Choose a secure password meeting all guidelines below.</p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white placeholder:text-slate-400"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)} 
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password requirement visual check indicators */}
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="font-semibold text-slate-600">Password requirements:</p>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${(newPassword || '').length >= 6 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={(newPassword || '').length >= 6 ? 'font-medium text-emerald-700' : 'font-medium text-red-600'}>Min 6 characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(newPassword || '') ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={/[A-Z]/.test(newPassword || '') ? 'font-medium text-emerald-700' : 'font-medium text-red-600'}>1 capital letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${/[0-9]/.test(newPassword || '') ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={/[0-9]/.test(newPassword || '') ? 'font-medium text-emerald-700' : 'font-medium text-red-600'}>1 number</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword || '') ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword || '') ? 'font-medium text-emerald-700' : 'font-medium text-red-600'}>1 special char</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white placeholder:text-slate-400"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#063d31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#042d24] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setView('login')}
                className="mt-4 w-full text-center text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Back to Login
              </button>
            </>
          )}

          {/* Bottom links (Register & Home) */}
          {view === 'login' && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
              <p>
                Don&apos;t have a school account?{' '}
                <Link to="/register" className="font-semibold text-slate-800 hover:underline">
                  Register here
                </Link>
              </p>
              <p>
                <Link to="/" className="text-slate-500 hover:text-slate-800 transition">
                  Back to home
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
