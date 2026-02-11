import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Triangle, Hexagon, Activity, Zap, Globe, ChevronRight, Clock, Users, Award, Play, ExternalLink, Mail, Check, Menu, X, ShoppingBag, Trash2, Plus, Lock, Package, Shirt } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Sacred Geometry Logo Component
const SyncBridgeLogo = ({ size = 80, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`logo-animated ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer hexagon */}
    <polygon
      points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
      stroke="#00CCFF"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
    />
    {/* Inner triangles - Star of David pattern */}
    <polygon
      points="50,15 85,67.5 15,67.5"
      stroke="#00CCFF"
      strokeWidth="1.5"
      fill="none"
    />
    <polygon
      points="50,85 85,32.5 15,32.5"
      stroke="#00CCFF"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Bridge in center */}
    <path
      d="M25,55 Q37.5,40 50,40 Q62.5,40 75,55"
      stroke="#00CCFF"
      strokeWidth="2"
      fill="none"
    />
    <line x1="30" y1="55" x2="30" y2="48" stroke="#00CCFF" strokeWidth="1.5" />
    <line x1="40" y1="55" x2="40" y2="43" stroke="#00CCFF" strokeWidth="1.5" />
    <line x1="50" y1="55" x2="50" y2="40" stroke="#00CCFF" strokeWidth="1.5" />
    <line x1="60" y1="55" x2="60" y2="43" stroke="#00CCFF" strokeWidth="1.5" />
    <line x1="70" y1="55" x2="70" y2="48" stroke="#00CCFF" strokeWidth="1.5" />
    {/* Bridge deck */}
    <line x1="25" y1="55" x2="75" y2="55" stroke="#00CCFF" strokeWidth="2" />
    {/* Center point */}
    <circle cx="50" cy="50" r="3" fill="#00CCFF" opacity="0.8" />
  </svg>
);

// Navigation Component
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-3" : "bg-transparent py-6"
      }`}
      data-testid="main-navigation"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <SyncBridgeLogo size={40} />
          <span className="font-heading font-bold text-xl tracking-wider text-white hidden sm:block">
            THESYNCBRIDGE
          </span>
        </NavLink>
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className="nav-link" data-testid="nav-home">
            Mission
          </NavLink>
          <NavLink to="/register" className="nav-link" data-testid="nav-register">
            Join
          </NavLink>
          <NavLink to="/transmissions" className="nav-link" data-testid="nav-transmissions">
            Transmissions
          </NavLink>
          <NavLink to="/registry" className="nav-link" data-testid="nav-registry">
            Registry
          </NavLink>
          <NavLink to="/store" className="nav-link" data-testid="nav-store">
            Store
          </NavLink>
        </div>
        <NavLink
          to="/register"
          className="btn-primary hidden md:block"
          data-testid="nav-cta"
        >
          Become Guardian
        </NavLink>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#00CCFF]"
          data-testid="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass mt-2 mx-4 p-4 fade-in-up" data-testid="mobile-menu">
          <div className="flex flex-col gap-4">
            <NavLink
              to="/"
              className="nav-link text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mission
            </NavLink>
            <NavLink
              to="/register"
              className="nav-link text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Join
            </NavLink>
            <NavLink
              to="/transmissions"
              className="nav-link text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Transmissions
            </NavLink>
            <NavLink
              to="/registry"
              className="nav-link text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Registry
            </NavLink>
            <NavLink
              to="/store"
              className="nav-link text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Store
            </NavLink>
            <NavLink
              to="/register"
              className="btn-primary text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Become Guardian
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

// Mission Clock Component
const MissionClock = ({ missionStatus }) => {
  if (!missionStatus) return null;

  return (
    <div className="text-center" data-testid="mission-clock">
      <div className="font-mono text-sm text-[#94A3B8] uppercase tracking-widest mb-2">
        The 325-Day Crossing
      </div>
      <div className="mission-clock" data-testid="mission-day">
        DAY {missionStatus.current_day} / {missionStatus.total_days}
      </div>
      <div className="mt-6 max-w-xs mx-auto">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${missionStatus.progress_percent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#475569] font-mono">
          <span>START: {missionStatus.mission_start}</span>
          <span>{missionStatus.progress_percent}%</span>
        </div>
      </div>
    </div>
  );
};

// Home/Landing Page
const Home = () => {
  const [missionStatus, setMissionStatus] = useState(null);
  const [guardianCount, setGuardianCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, countRes] = await Promise.all([
          axios.get(`${API}/mission/status`),
          axios.get(`${API}/guardians/count`),
        ]);
        setMissionStatus(statusRes.data);
        setGuardianCount(countRes.data.count);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto fade-in-up">
          <SyncBridgeLogo size={120} className="mx-auto mb-8" />
          <h1 className="font-heading font-bold text-5xl md:text-7xl tracking-wide mb-4 text-white">
            THE<span className="text-[#00CCFF]">SYNC</span>BRIDGE
          </h1>
          <p className="text-[#94A3B8] text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light">
            Bridging Plasma Physics and Spiritual Intuition. A 325-day mission
            to decode the universe and translate raw frequency into grounded truth.
          </p>
          <MissionClock missionStatus={missionStatus} />
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="btn-primary flex items-center justify-center gap-2"
              data-testid="hero-cta"
            >
              <Zap size={18} />
              Enter The Registry
            </button>
            <button
              onClick={() => navigate("/transmissions")}
              className="px-8 py-3 text-[#94A3B8] hover:text-white transition-colors font-heading uppercase tracking-widest text-sm"
              data-testid="hero-secondary"
            >
              View Transmissions
              <ChevronRight size={16} className="inline ml-1" />
            </button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border border-[#00CCFF]/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#00CCFF] rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-base p-8 text-center corner-brackets" data-testid="stat-guardians">
            <Users className="w-10 h-10 text-[#00CCFF] mx-auto mb-4" />
            <div className="font-mono text-4xl text-[#00CCFF] glow-text mb-2">
              {guardianCount}
            </div>
            <div className="text-[#94A3B8] font-heading uppercase tracking-wider">
              Blue Guardians
            </div>
          </div>
          <div className="card-base p-8 text-center corner-brackets" data-testid="stat-days">
            <Clock className="w-10 h-10 text-[#00CCFF] mx-auto mb-4" />
            <div className="font-mono text-4xl text-[#00CCFF] glow-text mb-2">
              {missionStatus?.current_day || 0}
            </div>
            <div className="text-[#94A3B8] font-heading uppercase tracking-wider">
              Days Into Mission
            </div>
          </div>
          <div className="card-base p-8 text-center corner-brackets" data-testid="stat-transmissions">
            <Activity className="w-10 h-10 text-[#00CCFF] mx-auto mb-4" />
            <div className="font-mono text-4xl text-[#00CCFF] glow-text mb-2">
              325
            </div>
            <div className="text-[#94A3B8] font-heading uppercase tracking-wider">
              Total Transmissions
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6 sacred-bg">
        <div className="max-w-4xl mx-auto text-center">
          <Triangle className="w-8 h-8 text-[#00CCFF] mx-auto mb-6" />
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 uppercase tracking-wide">
            The Translation Layer
          </h2>
          <p className="text-[#94A3B8] text-lg leading-relaxed mb-8">
            Converting raw metaphysical frequency into grounded, authoritative logic.
            Each day brings a new transmission — 61 seconds of high-density content
            designed to bridge the gap between what you feel and what you know.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-white/10 hover:border-[#00CCFF]/50 transition-colors">
              <Hexagon className="w-8 h-8 text-[#00CCFF] mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2 uppercase">
                Morning Download
              </h3>
              <p className="text-[#94A3B8] text-sm">
                Unfiltered signal input from the Translator
              </p>
            </div>
            <div className="p-6 border border-white/10 hover:border-[#00CCFF]/50 transition-colors">
              <Activity className="w-8 h-8 text-[#00CCFF] mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2 uppercase">
                Technical Synthesis
              </h3>
              <p className="text-[#94A3B8] text-sm">
                Translating signal into transmissions
              </p>
            </div>
            <div className="p-6 border border-white/10 hover:border-[#00CCFF]/50 transition-colors">
              <Globe className="w-8 h-8 text-[#00CCFF] mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2 uppercase">
                Purity Filter
              </h3>
              <p className="text-[#94A3B8] text-sm">
                Intuitive approval for content release
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#0A0A0A] relative overflow-hidden">
        <div className="geo-corner-tl" />
        <div className="geo-corner-br" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 uppercase tracking-wide">
            Claim Your <span className="text-[#00CCFF]">Scroll ID</span>
          </h2>
          <p className="text-[#94A3B8] mb-8">
            Enter the registry. Receive your unique identifier. Join the global
            frequency network of Blue Guardians.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="btn-primary pulse-glow"
            data-testid="cta-register"
          >
            Register Now
          </button>
        </div>
      </section>
    </div>
  );
};

// Registration Page
const Register = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [guardian, setGuardian] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/guardians/register`, { email });
      setGuardian(response.data);
      toast.success("Welcome to the Registry, Guardian!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (guardian) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6" data-testid="registration-success">
        <div className="max-w-xl mx-auto text-center fade-in-up">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-[#00CCFF] flex items-center justify-center glow-box">
              <Check className="w-10 h-10 text-[#00CCFF]" />
            </div>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 uppercase tracking-wide">
            Registration <span className="text-[#00CCFF]">Complete</span>
          </h1>
          <p className="text-[#94A3B8] mb-8">
            You have been added to the Blue Guardian Registry.
          </p>

          <div className="card-base p-8 mb-8">
            <div className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">
              Your Scroll ID
            </div>
            <div
              className="scroll-id text-4xl font-bold glow-text"
              data-testid="scroll-id-display"
            >
              {guardian.scroll_id}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-[#475569] text-sm font-mono">
                Registered: {new Date(guardian.registered_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(`/certificate/${guardian.scroll_id}`)}
              className="btn-primary flex items-center justify-center gap-2"
              data-testid="view-certificate-btn"
            >
              <Award size={18} />
              View Certificate
            </button>
            <button
              onClick={() => navigate("/transmissions")}
              className="px-8 py-3 border border-white/20 text-white hover:border-[#00CCFF]/50 transition-colors font-heading uppercase tracking-widest text-sm"
              data-testid="view-transmissions-btn"
            >
              View Transmissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="registration-page">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <SyncBridgeLogo size={80} className="mx-auto mb-6" />
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 uppercase tracking-wide">
            Join The <span className="text-[#00CCFF]">Registry</span>
          </h1>
          <p className="text-[#94A3B8]">
            Enter your email to receive your unique Scroll ID and become a Blue Guardian.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="card-base p-8 relative fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="geo-corner-tl" />
          <div className="geo-corner-br" />

          <div className="mb-6">
            <label className="block text-[#94A3B8] text-sm uppercase tracking-wider mb-3 font-heading">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@syncbridge.com"
                className="input-base pl-12"
                data-testid="email-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
            data-testid="register-submit"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#00CCFF] border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap size={18} />
                Generate Scroll ID
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#475569] text-sm">
            Already registered?{" "}
            <button
              onClick={() => navigate("/lookup")}
              className="text-[#00CCFF] hover:underline"
              data-testid="lookup-link"
            >
              Look up your Scroll ID
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Lookup Page
const Lookup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [guardian, setGuardian] = useState(null);
  const navigate = useNavigate();

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API}/guardians/lookup?email=${email}`);
      setGuardian(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Guardian not found. Please register first.");
      } else {
        toast.error("Lookup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="lookup-page">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-3xl mb-4 uppercase tracking-wide">
            Scroll ID <span className="text-[#00CCFF]">Lookup</span>
          </h1>
          <p className="text-[#94A3B8]">
            Enter your email to retrieve your Scroll ID.
          </p>
        </div>

        {guardian ? (
          <div className="card-base p-8 text-center fade-in-up">
            <div className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">
              Your Scroll ID
            </div>
            <div className="scroll-id text-4xl font-bold glow-text mb-6">
              {guardian.scroll_id}
            </div>
            <button
              onClick={() => navigate(`/certificate/${guardian.scroll_id}`)}
              className="btn-primary"
              data-testid="view-cert-from-lookup"
            >
              View Certificate
            </button>
          </div>
        ) : (
          <form onSubmit={handleLookup} className="card-base p-8">
            <div className="mb-6">
              <label className="block text-[#94A3B8] text-sm uppercase tracking-wider mb-3 font-heading">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@syncbridge.com"
                className="input-base"
                data-testid="lookup-email-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              data-testid="lookup-submit"
            >
              {loading ? "Searching..." : "Find My Scroll ID"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Certificate Page
const Certificate = () => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollId = window.location.pathname.split("/").pop();

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await axios.get(`${API}/certificate/${scrollId}`);
        setCertificate(response.data);
      } catch (error) {
        toast.error("Certificate not found");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [scrollId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00CCFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen pt-24 px-6 text-center">
        <h1 className="font-heading text-2xl text-[#94A3B8]">Certificate not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="certificate-page">
      <div className="max-w-3xl mx-auto">
        <div className="certificate p-8 md:p-12 fade-in-up" data-testid="certificate-display">
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <SyncBridgeLogo size={60} />
              <div className="text-right">
                <div className="font-mono text-[#475569] text-sm">
                  {certificate.organization}
                </div>
                <div className="font-mono text-[#00CCFF] text-sm">
                  {certificate.mission}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8 pb-8 border-b border-white/10">
              <h1 className="font-heading font-bold text-2xl md:text-3xl uppercase tracking-widest text-white mb-2">
                Certificate of Guardianship
              </h1>
              <div className="text-[#94A3B8]">Official Registration Document</div>
            </div>

            {/* Scroll ID */}
            <div className="text-center mb-8">
              <div className="text-[#94A3B8] text-sm uppercase tracking-wider mb-3">
                Scroll ID
              </div>
              <div
                className="scroll-id text-5xl md:text-6xl font-bold glow-text"
                data-testid="certificate-scroll-id"
              >
                {certificate.scroll_id}
              </div>
            </div>

            {/* Description */}
            <div className="text-center mb-8 max-w-lg mx-auto">
              <p className="text-[#94A3B8] leading-relaxed">
                This certifies that the holder of Scroll ID{" "}
                <span className="text-[#00CCFF]">{certificate.scroll_id}</span> has been
                officially registered in TheSyncBridge Guardian Registry, crossing from
                physics to spirit as part of the 325-Day Mission.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <div>
                <div className="text-[#475569] text-xs uppercase tracking-wider">
                  Registered
                </div>
                <div className="font-mono text-[#94A3B8] text-sm">
                  {new Date(certificate.registered_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#475569] text-xs uppercase tracking-wider">
                  Status
                </div>
                <div className="flex items-center gap-2 text-[#00CCFF]">
                  <div className="w-2 h-2 rounded-full bg-[#00CCFF] animate-pulse" />
                  <span className="font-heading uppercase tracking-wider text-sm">
                    Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Transmissions Page
const Transmissions = () => {
  const [transmissions, setTransmissions] = useState([]);
  const [missionStatus, setMissionStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, statusRes] = await Promise.all([
          axios.get(`${API}/transmissions`),
          axios.get(`${API}/mission/status`),
        ]);
        setTransmissions(transRes.data);
        setMissionStatus(statusRes.data);
      } catch (error) {
        console.error("Failed to fetch transmissions");
      }
    };
    fetchData();
  }, []);

  // Placeholder transmissions if none exist
  const placeholderTransmissions = [
    {
      id: "1",
      day_number: 1,
      title: "The Crossing Begins",
      description:
        "Day 1 of our 325-day mission. The bridge between plasma physics and spiritual intuition opens.",
      video_url: null,
    },
    {
      id: "2",
      day_number: 2,
      title: "Frequency Calibration",
      description:
        "Tuning into the raw signal. Understanding the translation layer between what we feel and what we know.",
      video_url: null,
    },
    {
      id: "3",
      day_number: 3,
      title: "The Guardian Protocol",
      description:
        "Activating the guardian network. Each scroll ID is a node in the global frequency grid.",
      video_url: null,
    },
  ];

  const displayTransmissions =
    transmissions.length > 0 ? transmissions : placeholderTransmissions;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="transmissions-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <Activity className="w-10 h-10 text-[#00CCFF] mx-auto mb-4" />
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 uppercase tracking-wide">
            Daily <span className="text-[#00CCFF]">Transmissions</span>
          </h1>
          <p className="text-[#94A3B8] max-w-xl mx-auto">
            61 seconds of high-density content. Each day, a new transmission to decode
            the universe.
          </p>
          {missionStatus && (
            <div className="mt-6">
              <MissionClock missionStatus={missionStatus} />
            </div>
          )}
        </div>

        {/* Transmissions Grid */}
        <div className="space-y-6">
          {displayTransmissions.map((transmission, index) => (
            <div
              key={transmission.id}
              className="transmission-card p-6 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`transmission-${transmission.day_number}`}
            >
              <div className="flex items-start gap-6">
                {/* Day Number */}
                <div className="flex-shrink-0 w-20 h-20 border border-[#00CCFF]/30 flex flex-col items-center justify-center">
                  <span className="font-mono text-xs text-[#475569] uppercase">Day</span>
                  <span className="font-mono text-2xl text-[#00CCFF]">
                    {transmission.day_number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="font-heading font-semibold text-xl uppercase tracking-wide mb-2">
                    {transmission.title}
                  </h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
                    {transmission.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4">
                    {transmission.video_url ? (
                      <a
                        href={transmission.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#00CCFF] hover:underline text-sm font-heading uppercase tracking-wider"
                      >
                        <Play size={16} />
                        Watch Transmission
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-[#475569] text-sm font-heading uppercase tracking-wider">
                        <Clock size={16} />
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Placeholder */}
        <div className="text-center mt-12">
          <p className="text-[#475569] text-sm">
            New transmissions released daily. Check back tomorrow.
          </p>
        </div>
      </div>
    </div>
  );
};

// Registry Page
const Registry = () => {
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        const response = await axios.get(`${API}/guardians/registry`);
        setGuardians(response.data);
      } catch (error) {
        console.error("Failed to fetch registry");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistry();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="registry-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <Users className="w-10 h-10 text-[#00CCFF] mx-auto mb-4" />
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 uppercase tracking-wide">
            Guardian <span className="text-[#00CCFF]">Registry</span>
          </h1>
          <p className="text-[#94A3B8]">
            The global network of Blue Guardians. Each ID represents a node in the
            frequency grid.
          </p>
          <div className="mt-4 font-mono text-[#00CCFF]">
            Total Guardians: {guardians.length}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-2 border-[#00CCFF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : guardians.length === 0 ? (
          <div className="text-center card-base p-12">
            <Globe className="w-16 h-16 text-[#475569] mx-auto mb-4" />
            <h3 className="font-heading text-xl text-[#94A3B8] mb-2">
              Registry Empty
            </h3>
            <p className="text-[#475569] mb-6">
              Be the first to join the Guardian network.
            </p>
            <a href="/register" className="btn-primary inline-block">
              Register Now
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guardians.map((guardian, index) => (
              <div
                key={guardian.id}
                className="card-base p-4 fade-in-up hover:glow-border transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
                data-testid={`guardian-${guardian.scroll_id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-[#00CCFF]/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#00CCFF]" />
                  </div>
                  <div>
                    <div className="scroll-id text-lg font-bold">
                      {guardian.scroll_id}
                    </div>
                    <div className="text-[#475569] text-xs font-mono">
                      {new Date(guardian.registered_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Merchandise Preview Component
const MerchPreview = ({ type, scrollId }) => {
  const colors = {
    hoodie: "#0A0A0A",
    shirt: "#0A0A0A", 
    hat: "#0A0A0A"
  };
  
  return (
    <div className="relative w-full aspect-square bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
      {/* Sacred geometry background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#00CCFF" strokeWidth="0.5"/>
        </svg>
      </div>
      
      {type === "hoodie" && (
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Hoodie shape */}
            <path d="M60,60 L60,180 L140,180 L140,60 L120,40 L80,40 Z" fill="#111" stroke="#00CCFF" strokeWidth="1"/>
            {/* Hood */}
            <path d="M80,40 Q100,20 120,40" fill="none" stroke="#00CCFF" strokeWidth="1"/>
            {/* Logo on chest */}
            <circle cx="100" cy="100" r="20" fill="none" stroke="#00CCFF" strokeWidth="1"/>
            <polygon points="100,85 115,107 85,107" fill="none" stroke="#00CCFF" strokeWidth="1"/>
            <polygon points="100,115 115,93 85,93" fill="none" stroke="#00CCFF" strokeWidth="1"/>
          </svg>
          {/* Scroll ID on sleeve */}
          <div className="absolute right-6 top-20 transform rotate-90">
            <span className="font-mono text-[#00CCFF] text-xs tracking-wider">{scrollId}</span>
          </div>
        </div>
      )}
      
      {type === "shirt" && (
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* T-shirt shape */}
            <path d="M40,50 L40,160 L140,160 L140,50 L120,30 L100,40 L80,30 L60,50 Z" fill="#111" stroke="#00CCFF" strokeWidth="1"/>
            {/* Sleeves */}
            <path d="M40,50 L20,70 L30,80 L40,70" fill="#111" stroke="#00CCFF" strokeWidth="1"/>
            <path d="M140,50 L160,70 L150,80 L140,70" fill="#111" stroke="#00CCFF" strokeWidth="1"/>
            {/* Logo on chest */}
            <circle cx="90" cy="90" r="18" fill="none" stroke="#00CCFF" strokeWidth="1"/>
            <polygon points="90,77 103,97 77,97" fill="none" stroke="#00CCFF" strokeWidth="1"/>
            <polygon points="90,103 103,83 77,83" fill="none" stroke="#00CCFF" strokeWidth="1"/>
          </svg>
          <div className="absolute right-8 top-16">
            <span className="font-mono text-[#00CCFF] text-xs tracking-wider">{scrollId}</span>
          </div>
        </div>
      )}
      
      {type === "hat" && (
        <div className="relative">
          <svg width="180" height="140" viewBox="0 0 180 140">
            {/* Cap shape */}
            <ellipse cx="90" cy="100" rx="70" ry="20" fill="#111" stroke="#00CCFF" strokeWidth="1"/>
            <path d="M30,100 Q30,50 90,40 Q150,50 150,100" fill="#111" stroke="#00CCFF" strokeWidth="1"/>
            {/* Brim */}
            <path d="M20,100 Q90,130 160,100" fill="none" stroke="#00CCFF" strokeWidth="1"/>
            {/* Logo on front */}
            <circle cx="90" cy="70" r="15" fill="none" stroke="#00CCFF" strokeWidth="1"/>
            <polygon points="90,58 100,75 80,75" fill="none" stroke="#00CCFF" strokeWidth="0.8"/>
            <polygon points="90,82 100,65 80,65" fill="none" stroke="#00CCFF" strokeWidth="0.8"/>
          </svg>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span className="font-mono text-[#00CCFF] text-xs tracking-wider">{scrollId}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Store Page
const Store = () => {
  const [scrollId, setScrollId] = useState("");
  const [verifiedGuardian, setVerifiedGuardian] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [merchandise, setMerchandise] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/merchandise`);
        setMerchandise(response.data);
      } catch (error) {
        // Fallback to defaults
        setMerchandise({
          hoodie: { name: "Guardian Hoodie", price: 65.00, description: "Premium black hoodie with sacred geometry logo and your personalized Scroll ID", sizes: ["S", "M", "L", "XL", "XXL"], image_type: "hoodie" },
          shirt: { name: "Guardian T-Shirt", price: 35.00, description: "Classic black t-shirt with sacred geometry logo and your personalized Scroll ID", sizes: ["S", "M", "L", "XL", "XXL"], image_type: "shirt" },
          hat: { name: "Guardian Cap", price: 30.00, description: "Black fitted cap with sacred geometry logo and your personalized Scroll ID", sizes: null, image_type: "hat" }
        });
      }
    };
    fetchProducts();
  }, []);

  const verifyGuardian = async () => {
    if (!scrollId) {
      toast.error("Please enter your Scroll ID");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API}/guardians/${scrollId.toUpperCase()}`);
      setVerifiedGuardian(response.data);
      toast.success("Guardian verified!");
    } catch (error) {
      toast.error("Scroll ID not found. Please register first.");
      setVerifiedGuardian(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (type, size = null) => {
    const existing = cart.find(item => item.type === type && item.size === size);
    if (existing) {
      setCart(cart.map(item => 
        item.type === type && item.size === size 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { type, size, quantity: 1, price: merchandise[type].price }]);
    }
    toast.success(`Added ${merchandise[type].name} to cart`);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "USA"
  });

  const submitOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zip) {
      toast.error("Please fill in all shipping details");
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        scroll_id: verifiedGuardian.scroll_id,
        email: shippingInfo.email,
        items: cart.map(item => ({
          product_type: item.type,
          size: item.size,
          quantity: item.quantity
        })),
        shipping_name: shippingInfo.name,
        shipping_address: shippingInfo.address,
        shipping_city: shippingInfo.city,
        shipping_state: shippingInfo.state,
        shipping_zip: shippingInfo.zip,
        shipping_country: shippingInfo.country
      };
      
      const response = await axios.post(`${API}/orders`, orderData);
      setOrderComplete(response.data);
      setCart([]);
      setShowCheckout(false);
      toast.success("Order submitted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit order");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6" data-testid="order-complete">
        <div className="max-w-xl mx-auto text-center fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 border-2 border-[#00CCFF] flex items-center justify-center glow-box">
            <Check className="w-10 h-10 text-[#00CCFF]" />
          </div>
          <h1 className="font-heading font-bold text-3xl mb-4 uppercase tracking-wide">
            Order <span className="text-[#00CCFF]">Submitted</span>
          </h1>
          <p className="text-[#94A3B8] mb-6">
            Your order has been received and will be processed shortly.
          </p>
          <div className="card-base p-6 text-left mb-6">
            <div className="text-[#475569] text-sm uppercase mb-2">Order ID</div>
            <div className="font-mono text-[#00CCFF] mb-4">{orderComplete.id}</div>
            <div className="text-[#475569] text-sm uppercase mb-2">Total</div>
            <div className="font-mono text-2xl text-white">${orderComplete.total_amount.toFixed(2)}</div>
          </div>
          <p className="text-[#475569] text-sm mb-6">
            We'll contact you at {orderComplete.email} with payment and shipping details.
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="store-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <ShoppingBag className="w-10 h-10 text-[#00CCFF] mx-auto mb-4" />
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 uppercase tracking-wide">
            Guardian <span className="text-[#00CCFF]">Vault</span>
          </h1>
          <p className="text-[#94A3B8] max-w-xl mx-auto">
            Official merchandise personalized with your Scroll ID. Wear your guardian identity.
          </p>
        </div>

        {/* Verify Guardian */}
        {!verifiedGuardian ? (
          <div className="max-w-md mx-auto card-base p-8 fade-in-up">
            <h2 className="font-heading font-semibold text-xl mb-4 uppercase tracking-wide text-center">
              Enter Your Scroll ID
            </h2>
            <p className="text-[#94A3B8] text-sm text-center mb-6">
              Your Scroll ID will be printed on your merchandise
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={scrollId}
                onChange={(e) => setScrollId(e.target.value.toUpperCase())}
                placeholder="SB-0001"
                className="input-base flex-grow"
                data-testid="scroll-id-input"
              />
              <button
                onClick={verifyGuardian}
                disabled={loading}
                className="btn-primary whitespace-nowrap"
                data-testid="verify-btn"
              >
                {loading ? "..." : "Verify"}
              </button>
            </div>
            <p className="text-[#475569] text-xs text-center mt-4">
              Don't have a Scroll ID?{" "}
              <button onClick={() => navigate("/register")} className="text-[#00CCFF] hover:underline">
                Register here
              </button>
            </p>
          </div>
        ) : (
          <>
            {/* Verified Badge */}
            <div className="text-center mb-8 fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#00CCFF]/30 bg-[#00CCFF]/5">
                <Check className="w-4 h-4 text-[#00CCFF]" />
                <span className="font-mono text-[#00CCFF]">{verifiedGuardian.scroll_id}</span>
                <span className="text-[#94A3B8]">verified</span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {Object.entries(merchandise).map(([type, product]) => (
                <div key={type} className="card-base p-6 fade-in-up" data-testid={`product-${type}`}>
                  <MerchPreview type={type} scrollId={verifiedGuardian.scroll_id} />
                  <h3 className="font-heading font-semibold text-lg uppercase tracking-wide mt-4 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-[#94A3B8] text-sm mb-4">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl text-[#00CCFF]">${product.price}</span>
                  </div>
                  {product.sizes ? (
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => addToCart(type, size)}
                          className="py-2 border border-white/20 text-sm hover:border-[#00CCFF] hover:text-[#00CCFF] transition-colors"
                          data-testid={`add-${type}-${size}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(type)}
                      className="btn-primary w-full"
                      data-testid={`add-${type}`}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div className="card-base p-6 max-w-2xl mx-auto fade-in-up" data-testid="cart">
                <h3 className="font-heading font-semibold text-xl uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#00CCFF]" />
                  Your Cart
                </h3>
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-white/10">
                      <div>
                        <span className="font-heading uppercase">{merchandise[item.type].name}</span>
                        {item.size && <span className="text-[#94A3B8] ml-2">Size: {item.size}</span>}
                        <span className="text-[#94A3B8] ml-2">× {item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[#00CCFF]">${(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(index)} className="text-[#FF3B30] hover:text-red-400">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-heading uppercase text-lg">Total</span>
                  <span className="font-mono text-2xl text-[#00CCFF]">${cartTotal.toFixed(2)}</span>
                </div>
                
                {!showCheckout ? (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="btn-primary w-full"
                    data-testid="checkout-btn"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="space-y-4" data-testid="checkout-form">
                    <h4 className="font-heading uppercase tracking-wide text-[#94A3B8]">Shipping Information</h4>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                      className="input-base"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="input-base"
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="input-base"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="input-base"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        className="input-base"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
                      className="input-base"
                    />
                    <button
                      onClick={submitOrder}
                      disabled={loading}
                      className="btn-primary w-full"
                      data-testid="submit-order-btn"
                    >
                      {loading ? "Submitting..." : "Submit Order Request"}
                    </button>
                    <p className="text-[#475569] text-xs text-center">
                      We'll contact you with payment details after reviewing your order.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Admin Login Page
const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/admin/login`, {}, {
        auth: { username: "admin", password }
      });
      sessionStorage.setItem("adminAuth", btoa(`admin:${password}`));
      toast.success("Login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center" data-testid="admin-login">
      <div className="max-w-md w-full card-base p-8">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-[#00CCFF] mx-auto mb-4" />
          <h1 className="font-heading font-bold text-2xl uppercase tracking-wide">
            Admin <span className="text-[#00CCFF]">Access</span>
          </h1>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="input-base mb-6"
            data-testid="admin-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
            data-testid="admin-login-btn"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const [transmissions, setTransmissions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("transmissions");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransmission, setNewTransmission] = useState({
    title: "",
    description: "",
    video_url: "",
    day_number: 1
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const authHeader = sessionStorage.getItem("adminAuth");
  
  useEffect(() => {
    if (!authHeader) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [authHeader, navigate]);

  const fetchData = async () => {
    try {
      const [transRes, ordersRes] = await Promise.all([
        axios.get(`${API}/transmissions`),
        axios.get(`${API}/orders`, {
          headers: { Authorization: `Basic ${authHeader}` }
        })
      ]);
      setTransmissions(transRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        sessionStorage.removeItem("adminAuth");
        navigate("/admin");
      }
    }
  };

  const addTransmission = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/transmissions`, newTransmission, {
        headers: { Authorization: `Basic ${authHeader}` }
      });
      toast.success("Transmission added");
      setNewTransmission({ title: "", description: "", video_url: "", day_number: 1 });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to add transmission");
    } finally {
      setLoading(false);
    }
  };

  const deleteTransmission = async (id) => {
    if (!window.confirm("Delete this transmission?")) return;
    try {
      await axios.delete(`${API}/transmissions/${id}`, {
        headers: { Authorization: `Basic ${authHeader}` }
      });
      toast.success("Transmission deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status?status=${status}`, {}, {
        headers: { Authorization: `Basic ${authHeader}` }
      });
      toast.success("Order status updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="admin-dashboard">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading font-bold text-2xl uppercase tracking-wide">
            Admin <span className="text-[#00CCFF]">Dashboard</span>
          </h1>
          <button onClick={logout} className="text-[#94A3B8] hover:text-white text-sm">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("transmissions")}
            className={`pb-3 px-4 font-heading uppercase tracking-wider text-sm transition-colors ${
              activeTab === "transmissions" ? "text-[#00CCFF] border-b-2 border-[#00CCFF]" : "text-[#94A3B8]"
            }`}
          >
            Transmissions ({transmissions.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-4 font-heading uppercase tracking-wider text-sm transition-colors ${
              activeTab === "orders" ? "text-[#00CCFF] border-b-2 border-[#00CCFF]" : "text-[#94A3B8]"
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* Transmissions Tab */}
        {activeTab === "transmissions" && (
          <div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary mb-6 flex items-center gap-2"
              data-testid="add-transmission-btn"
            >
              <Plus size={18} />
              Add Transmission
            </button>

            {showAddForm && (
              <form onSubmit={addTransmission} className="card-base p-6 mb-6" data-testid="add-transmission-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="number"
                    placeholder="Day Number"
                    value={newTransmission.day_number}
                    onChange={(e) => setNewTransmission({...newTransmission, day_number: parseInt(e.target.value)})}
                    className="input-base"
                    min="1"
                    max="325"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={newTransmission.title}
                    onChange={(e) => setNewTransmission({...newTransmission, title: e.target.value})}
                    className="input-base"
                    required
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={newTransmission.description}
                  onChange={(e) => setNewTransmission({...newTransmission, description: e.target.value})}
                  className="input-base mb-4 min-h-[100px]"
                  required
                />
                <input
                  type="url"
                  placeholder="Video URL (YouTube, Vimeo, etc.)"
                  value={newTransmission.video_url}
                  onChange={(e) => setNewTransmission({...newTransmission, video_url: e.target.value})}
                  className="input-base mb-4"
                />
                <div className="flex gap-4">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Adding..." : "Add Transmission"}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-[#94A3B8]">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {transmissions.map((t) => (
                <div key={t.id} className="card-base p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-[#00CCFF]/30 flex items-center justify-center">
                      <span className="font-mono text-[#00CCFF]">{t.day_number}</span>
                    </div>
                    <div>
                      <h3 className="font-heading uppercase">{t.title}</h3>
                      <p className="text-[#94A3B8] text-sm truncate max-w-md">{t.description}</p>
                      {t.video_url && (
                        <a href={t.video_url} target="_blank" rel="noreferrer" className="text-[#00CCFF] text-xs flex items-center gap-1">
                          <Play size={12} /> Video Link
                        </a>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteTransmission(t.id)} className="text-[#FF3B30] hover:text-red-400 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {transmissions.length === 0 && (
                <p className="text-[#475569] text-center py-8">No transmissions yet. Add your first one!</p>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card-base p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono text-[#00CCFF] text-sm">{order.id}</div>
                    <div className="font-heading text-lg">{order.shipping_name}</div>
                    <div className="text-[#94A3B8] text-sm">{order.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl text-[#00CCFF]">${order.total_amount.toFixed(2)}</div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="mt-2 bg-transparent border border-white/20 text-sm px-2 py-1 text-white"
                    >
                      <option value="pending" className="bg-[#0A0A0A]">Pending</option>
                      <option value="processing" className="bg-[#0A0A0A]">Processing</option>
                      <option value="shipped" className="bg-[#0A0A0A]">Shipped</option>
                      <option value="delivered" className="bg-[#0A0A0A]">Delivered</option>
                      <option value="cancelled" className="bg-[#0A0A0A]">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="text-[#475569] text-xs uppercase mb-2">Items (Scroll ID: {order.scroll_id})</div>
                  {order.items.map((item, i) => (
                    <div key={i} className="text-sm text-[#94A3B8]">
                      {item.product_name} {item.size && `(${item.size})`} × {item.quantity} - ${item.item_total.toFixed(2)}
                    </div>
                  ))}
                  <div className="mt-3 text-xs text-[#475569]">
                    Ship to: {order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-[#475569] text-center py-8">No orders yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => (
  <footer className="py-12 px-6 border-t border-white/10 bg-[#050505]">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <SyncBridgeLogo size={32} />
          <span className="font-heading font-semibold text-sm tracking-wider">
            THESYNCBRIDGE
          </span>
        </div>
        <div className="text-[#475569] text-sm font-mono">
          325-Day Mission • 2026
        </div>
        <div className="flex items-center gap-6">
          <NavLink
            to="/register"
            className="text-[#94A3B8] hover:text-[#00CCFF] text-sm transition-colors"
          >
            Join Registry
          </NavLink>
          <NavLink
            to="/store"
            className="text-[#94A3B8] hover:text-[#00CCFF] text-sm transition-colors"
          >
            Store
          </NavLink>
          <NavLink
            to="/admin"
            className="text-[#475569] hover:text-[#00CCFF] text-sm transition-colors"
          >
            Admin
          </NavLink>
        </div>
      </div>
    </div>
  </footer>
);

// Main App
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0A0A0A",
              border: "1px solid rgba(0, 204, 255, 0.3)",
              color: "#fff",
              fontFamily: "Space Grotesk, sans-serif",
            },
          }}
        />
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/certificate/:scrollId" element={<Certificate />} />
          <Route path="/transmissions" element={<Transmissions />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/store" element={<Store />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
