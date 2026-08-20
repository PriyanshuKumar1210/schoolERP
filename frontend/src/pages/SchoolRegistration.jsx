import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Building2, CheckCircle, Eye, EyeOff, Loader, Mail, Lock, MapPin, Phone, Users, GraduationCap } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import apiClient from '../utils/apiClient';

export default function SchoolRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('admin');
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    schoolCodeForMember: '',
    email: '',
    name: '',
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
      if (role === 'admin') {
        if (!formData.schoolName.trim()) {
          toast.error('School name is required');
          setLoading(false);
          return;
        }

        if (!formData.schoolCode.trim()) {
          toast.error('School code is required');
          setLoading(false);
          return;
        }

        if (!formData.adminName.trim()) {
          toast.error('Admin name is required');
          setLoading(false);
          return;
        }

        await apiClient.post('/schools', {
          name: formData.schoolName,
          code: formData.schoolCode,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
          },
          principalName: 'Principal',
          principalEmail: formData.email,
          adminName: formData.adminName,
          adminEmail: formData.email,
          adminPassword: formData.password,
        });

        toast.success('School registered successfully!');
      } else {
        if (!formData.schoolName.trim()) {
          toast.error('School name is required');
          setLoading(false);
          return;
        }

        if (!formData.schoolCodeForMember.trim()) {
          toast.error('School code is required');
          setLoading(false);
          return;
        }

        if (!formData.name.trim()) {
          toast.error('Name is required');
          setLoading(false);
          return;
        }

        await apiClient.post('/auth/register', {
          role,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          schoolCode: formData.schoolCodeForMember,
        });

        toast.success(`${role} registered successfully!`);
      }

      setTimeout(() => {
        navigate('/login', {
          state: {
            schoolCode: role === 'admin' ? formData.schoolCode : formData.schoolCodeForMember,
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

  return (
    <div className="min-h-screen bg-[#f4ecdf] px-4 py-10 text-[#3f2a1d] sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="rounded-[2rem] border border-[#d9c5b0] bg-gradient-hero p-8 shadow-lg shadow-[#b68c67]/15 lg:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7a4e2d] text-[#f7efe4]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#3f2a1d]">SchoolHub</p>
              <p className="text-sm text-[#7f634e]">Register a new school</p>
            </div>
          </div>

          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-[#3f2a1d] lg:text-6xl">
            Create one d account and keep the whole system under one code.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#6d4c35]">
            The admin account, school profile and access code are created together so the login flow stays simple later.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['School profile', 'Name, code, phone and location', Building2],
              ['Admin access', 'Email and password for login', Users],
              ['Communication', 'Notices and messages later', Mail],
              ['Records', 'Timetable, homework and marks', CheckCircle],
            ].map(([title, description, Icon]) => (
              <div key={title} className="rounded-3xl border border-[#d9c5b0] bg-[#fffaf3] p-4 backdrop-blur">
                <Icon className="h-5 w-5 text-[#7a4e2d]" />
                <p className="mt-3 font-semibold text-[#3f2a1d]">{title}</p>
                <p className="mt-1 text-sm text-[#6d4c35]">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-[#d9c5b0] bg-[#f7efe4] p-4 text-sm text-[#6d4c35]">
            <p className="font-semibold text-[#3f2a1d]">School registration flow</p>
            <p className="mt-2 leading-6">Fill the form once, create the school, and then login with the same school code for role-based access.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#d9c5b0] bg-[#fffaf3] p-6 text-[#3f2a1d] shadow-lg shadow-[#b68c67]/15 sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8a6a50]">New account</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#3f2a1d]">Register your School</h2>
            <p className="mt-2 text-[#6d4c35]">Create an admin account and register your school. Teachers and students are added by the admin from the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'admin' ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">School Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-[#b68c67]" />
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      placeholder="e.g. ABC Public School"
                      className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] py-3 pl-10 pr-4 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">School Code *</label>
                  <input
                    type="text"
                    name="schoolCode"
                    value={formData.schoolCode}
                    onChange={handleChange}
                    placeholder="e.g. SCHOOL001"
                    className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] px-4 py-3 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                  />
                  <p className="mt-1 text-xs text-[#8a6a50]">Used for login later.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">Admin Name *</label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="e.g. Mr. Principal"
                    className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] px-4 py-3 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">School Name *</label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="e.g. ABC Public School"
                    className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] px-4 py-3 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">School Code *</label>
                  <input
                    type="text"
                    name="schoolCodeForMember"
                    value={formData.schoolCodeForMember}
                    onChange={handleChange}
                    placeholder="e.g. SCHOOL001"
                    className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] px-4 py-3 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={role === 'teacher' ? 'e.g. Mr. Sharma' : 'e.g. Riya Patel'}
                    className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] px-4 py-3 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#b68c67]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={role === 'admin' ? 'admin@school.com' : 'name@school.com'}
                  className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] py-3 pl-10 pr-4 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                />
              </div>
            </div>

            {role === 'admin' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-[#b68c67]" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] py-3 pl-10 pr-4 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street or area name"
                    className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] px-4 py-3 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-[#b68c67]" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] py-3 pl-10 pr-4 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] px-4 py-3 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#b68c67]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] py-3 pl-10 pr-12 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[#b68c67] transition hover:text-[#7a4e2d]">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <p className="font-semibold text-[#6d4c35]">Password requirements:</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${(formData.password || '').length >= 6 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={(formData.password || '').length >= 6 ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>Min 6 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${/[A-Z]/.test(formData.password || '') ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={/[A-Z]/.test(formData.password || '') ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>1 capital letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${/[0-9]/.test(formData.password || '') ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={/[0-9]/.test(formData.password || '') ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>1 number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password || '') ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password || '') ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>1 special character</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#6d4c35]">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#b68c67]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full rounded-2xl border border-[#d9c5b0] bg-[#faf4ea] py-3 pl-10 pr-12 outline-none transition placeholder:text-[#a1876d] focus:border-[#7a4e2d] focus:bg-white"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-[#b68c67] transition hover:text-[#7a4e2d]">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7a4e2d] px-5 py-3.5 font-semibold text-[#f7efe4] transition hover:bg-[#624021] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  {role === 'admin' ? 'Register School' : `Register ${role}`}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 border-t border-[#d9c5b0] pt-5 text-center text-sm text-[#6d4c35]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#7a4e2d] hover:text-[#624021]">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}