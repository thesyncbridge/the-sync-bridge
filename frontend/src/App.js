import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Triangle, Hexagon, Activity, Zap, Globe, ChevronRight, Clock, Users, Award, Play, ExternalLink, Mail, Check } from "lucide-react";

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
          <span className="font-heading font-bold text-xl tracking-wider text-white">
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
        </div>
        <NavLink
          to="/register"
          className="btn-primary hidden md:block"
          data-testid="nav-cta"
        >
          Become Guardian
        </NavLink>
      </div>
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
            to="/transmissions"
            className="text-[#94A3B8] hover:text-[#00CCFF] text-sm transition-colors"
          >
            Transmissions
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
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
