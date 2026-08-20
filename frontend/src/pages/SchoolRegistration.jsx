import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Building2, 
  Check, 
  Eye, 
  EyeOff, 
  Loader, 
  Mail, 
  Lock, 
  MapPin, 
  Phone, 
  Users, 
  FileText 
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { authService } from '../services/api';

export default function SchoolRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }

    const password = formData.password || '';
    const hasMinLength = password.length >= 6;
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    if (!hasMinLength || !hasCapital || !hasNumber || !hasSpecial) {
      toast.error('Password must be at least 6 characters, contain 1 capital letter, 1 number, and 1 special character');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!formData.schoolName.trim()) {
        toast.error('School name is required');
        setLoading(false);
        return;
      }

      if (!formData.adminName.trim()) {
        toast.error('Admin name is required');
        setLoading(false);
        return;
      }

      const response = await authService.register({
        schoolName: formData.schoolName,
        userName: formData.adminName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'admin',
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
        },
      });

      toast.success(response.data?.message || 'School registered successfully!');

      setTimeout(() => {
        navigate('/login', {
          state: {
            schoolCode: response.data?.school?.schoolCode || '',
            email: formData.email,
          },
        });
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper checks for password strength indicators
  const password = formData.password || '';
  const reqs = {
    minLen: password.length >= 6,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  };

  const passedCount = Object.values(reqs).filter(Boolean).length;

  return (
    <div className="flex min-h-screen w-full bg-[#0d213a]">
      <Toaster position="top-right" />

      <div className="mx-auto flex w-full flex-col lg:flex-row">
        {/* Left Side Section */}
        <div className="flex flex-1 flex-col justify-between p-8 sm:p-12 lg:p-16 text-white">
          <div>
            {/* Header Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">SchoolHub</span>
            </div>

            {/* Main Title & Subtitle */}
            <div className="mt-16 max-w-xl">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
                Empower your institution with SchoolHub
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                Streamline management, enhance communication, and simplify records with our all-in-one platform.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-base">School Profile</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Manage name, code, and location.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-base">Admin Access</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Secure login for school admin.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-base">Communication</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Send notices and messages easily.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-base">Records</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Organize timetables, homework, and marks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Section - Form Panel */}
        <div className="flex flex-1 items-center justify-center bg-[#f2f5f8] p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
            <h2 className="text-center text-3xl font-extrabold text-slate-900">
              Register your School
            </h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* Row 1: School Name & Admin Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      placeholder="e.g. ABC Public School"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Admin Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="e.g. Mr. Principal"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="namo.andhbhakt@gmail.com"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Address */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street or area name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Row 4: City & State */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3 flex gap-1.5">
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${passedCount >= 1 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${passedCount >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${passedCount >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                  <div className={`h-1.5 flex-1 rounded-full transition-all ${passedCount >= 4 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                </div>

                {/* Password requirements list */}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Check className={`h-3 w-3 ${reqs.minLen ? 'text-emerald-600' : 'text-slate-400'}`} />
                    Min 6 characters
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className={`h-3 w-3 ${reqs.capital ? 'text-emerald-600' : 'text-slate-400'}`} />
                    1 capital letter
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className={`h-3 w-3 ${reqs.number ? 'text-emerald-600' : 'text-slate-400'}`} />
                    1 number
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className={`h-3 w-3 ${reqs.special ? 'text-emerald-600' : 'text-slate-400'}`} />
                    1 special character
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#146338] py-3 text-sm font-semibold text-white transition hover:bg-[#0f4d2b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register School
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-slate-900 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}