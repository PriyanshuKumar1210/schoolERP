import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  GraduationCap,
  Users,
  Bell,
  MessageSquare,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const services = [
    {
      icon: Users,
      title: 'Student Records',
      text: 'Centralized data management for every student journey.',
    },
    {
      icon: GraduationCap,
      title: 'Teacher Tools',
      text: 'Streamlined workflows for attendance, grading, and planning.',
    },
    {
      icon: Bell,
      title: 'Notices & Alerts',
      text: 'Instant, reliable communication for the whole school community.',
    },
    {
      icon: MessageSquare,
      title: 'Communication',
      text: 'Seamless messaging between staff, parents, and students.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Schools' },
    { value: '1M+', label: 'Students' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#0f172a] font-sans antialiased">
      {/* Navbar */}
      {!isAuthenticated && (
        <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#064e3b] text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">SchoolHub</span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              <button onClick={() => scrollToSection('platform')} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Platform
              </button>
              <button onClick={() => scrollToSection('solutions')} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Solutions
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Pricing
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-700 transition hover:text-slate-900">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="rounded-lg bg-[#064e3b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#043e2e]">
                Get Started
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              The Operating System for Modern Schools
            </h1>
            <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
              Empower your administrators, teachers, and students with an all-in-one platform built for excellence.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button onClick={() => navigate('/register')} className="rounded-lg bg-[#064e3b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#043e2e]">
                Get Started
              </button>
              <button onClick={() => scrollToSection('platform')} className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Book a Demo
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1200"
                alt="Teacher helping students in classroom"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-200/60 bg-slate-50/50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center py-4 sm:py-0">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Services Section */}
      <section id="platform" className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Comprehensive Platform Capabilities
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
            Everything you need to run your institution efficiently, seamlessly integrated into one unified experience.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section id="solutions" className="bg-[#edf2f7] px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl bg-[#064e3b] p-8 text-white shadow-lg space-y-8">
              <div className="rounded-lg bg-white/10 p-5 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-bold">Reduced Administrative Load</h3>
                <p className="mt-2 text-sm text-emerald-100">
                  Automate repetitive tasks and free up valuable time for strategic educational initiatives.
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-5 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-bold">Enhanced Security</h3>
                <p className="mt-2 text-sm text-emerald-100">
                  Enterprise-grade role-based access control ensuring sensitive student data remains protected.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Why Choose SchoolHub?
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              We solve the complex operational challenges modern educational institutions face, replacing fragmented legacy systems with a cohesive, secure, and intuitive environment.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-slate-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Unified Ecosystem</h4>
                  <p className="text-xs text-slate-500 mt-0.5">One login for all institutional needs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-slate-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Scalable Architecture</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Grows with your institution, from single campus to multi-school networks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#043e2e] px-6 py-20 text-center text-white lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to modernize your institution?
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-emerald-100">
            Join hundreds of forward-thinking schools transforming their administrative workflows today.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate('/register')}
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#043e2e] shadow-sm transition hover:bg-emerald-50"
            >
              Register Your School
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="pricing" className="border-t border-slate-200 bg-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col justify-between gap-8 md:flex-row">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#064e3b] text-white">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-base font-bold text-slate-900">SchoolHub</span>
            </div>
            <p className="text-xs text-slate-500">
              © 2026 SchoolHub. Institutional Excellence in Administration.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Product</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><button onClick={() => scrollToSection('platform')} className="hover:text-slate-900">Platform</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-slate-900">Solutions</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-slate-900">Pricing</button></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Company</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><a href="#about" className="hover:text-slate-900">About Us</a></li>
                <li><a href="#contact" className="hover:text-slate-900">Contact</a></li>
                <li><a href="#privacy" className="hover:text-slate-900">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-slate-900">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}