import React, { useState, useEffect } from "react";
import {
  Wrench,
  Clock,
  UserCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { toast } from "react-toastify";

// Water theme palette (shared with OrderPage / ProductsPage / CheckoutPage)
const colors = {
  primary: "#00A9FF",
  deep: "#0077B6",
  secondary: "#89CFF3",
  accent: "#A0E9FF",
  background: "#CDF5FD",
  text: "#0B0C10",
};


const SERVICES_ENDPOINT = "/services";
const cancelServiceEndpoint = (id) => `/services/${id}/cancel`;


const STATUS_FLOW = ["Pending", "Assigned", "On The Way", "Completed"];
const CANCELLABLE_STATUSES = ["Pending", "Assigned"];

function ServicePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const statusColors = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Assigned: "bg-blue-100 text-blue-800 border-blue-200",
    "On The Way": "bg-indigo-100 text-indigo-800 border-indigo-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(SERVICES_ENDPOINT);
      setServices(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch service requests:", err);
      setError("Failed to load your service requests. Please try again.");
      toast.error("Failed to load service requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "On The Way":
        return <Wrench className="w-5 h-5 text-indigo-500" />;
      case "Assigned":
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      case "Pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleCancelService = async (serviceId) => {
    const service = services.find((s) => s._id === serviceId);
    if (!service) return;

    if (!window.confirm("Are you sure you want to cancel this service request?")) return;

    setCancellingId(serviceId);
    try {
      const response = await api.patch(cancelServiceEndpoint(serviceId));
      toast.success(response.data?.message || "Service request cancelled successfully");
      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? { ...s, status: "Cancelled" } : s))
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel service request. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Purely presentational status stepper — derived from service.status only.
  const StatusStepper = ({ status }) => {
    const stepIndex = STATUS_FLOW.indexOf(status);
    if (stepIndex === -1) return null;

    return (
      <div className="flex items-center w-full mt-4">
        {STATUS_FLOW.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i <= stepIndex ? "shadow-[0_0_0_4px_rgba(0,169,255,0.18)]" : ""
                }`}
                style={{ backgroundColor: i <= stepIndex ? colors.deep : "#E2ECF2" }}
              />
              <span
                className={`text-[10px] sm:text-xs font-body whitespace-nowrap ${
                  i <= stepIndex ? "font-semibold" : "font-medium"
                }`}
                style={{ color: i <= stepIndex ? colors.deep : "#9FB2BC" }}
              >
                {step}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div
                className="flex-1 h-[2px] mx-1 sm:mx-2 -mt-4 rounded-full"
                style={{ backgroundColor: i < stepIndex ? colors.deep : "#E2ECF2" }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const fontStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap');
      .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; letter-spacing: -0.01em; }
      .font-body { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }
      .glass-card {
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.6);
      }
      .aqua-ripple {
        position: absolute;
        border-radius: 9999px;
        background: radial-gradient(circle at 30% 30%, rgba(160,233,255,0.5), rgba(0,169,255,0.06) 70%);
        filter: blur(2px);
        pointer-events: none;
      }
      @keyframes floatSlow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .float-slow { animation: floatSlow 8s ease-in-out infinite; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-up { animation: fadeUp 0.45s ease-out both; }
    `}</style>
  );

  if (!user) {
    return (
      <div className="min-h-screen font-body relative overflow-hidden flex flex-col items-center justify-center px-4" style={{ background: `linear-gradient(180deg, ${colors.background}, #ffffff)` }}>
        {fontStyles}
        <div className="aqua-ripple w-72 h-72 -top-20 -left-20 float-slow" />
        <div className="aqua-ripple w-96 h-96 -bottom-32 -right-24 float-slow" style={{ animationDelay: "1.5s" }} />
        <div className="relative text-center space-y-6 max-w-sm glass-card rounded-3xl px-8 py-12 shadow-xl">
          <div className="text-6xl">🔐</div>
          <h2 className="text-2xl font-display font-semibold" style={{ color: colors.text }}>
            Please login to view your service requests
          </h2>
          <Link
            to="/login"
            className="inline-block w-full sm:w-auto px-8 py-3 text-white font-semibold rounded-full shadow-lg transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.deep})` }}
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-body relative overflow-hidden py-8 sm:py-12 px-4" style={{ background: `linear-gradient(180deg, ${colors.background}, #ffffff)` }}>
        {fontStyles}
        <div className="aqua-ripple w-72 h-72 -top-20 -right-20 float-slow" />
        <div className="relative max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6 transition-colors hover:opacity-100"
            style={{ color: colors.text, opacity: 0.7 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="text-center py-16 px-4 glass-card rounded-3xl shadow-lg">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2" style={{ color: colors.text }}>
              Error Loading Service Requests
            </h3>
            <p className="mb-6" style={{ color: colors.text, opacity: 0.7 }}>{error}</p>
            <button
              onClick={fetchServices}
              className="px-7 py-2.5 text-white rounded-full font-semibold shadow-lg transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.deep})` }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body relative overflow-hidden py-8 sm:py-14 px-3 sm:px-4" style={{ background: `linear-gradient(180deg, ${colors.background} 0%, #eefbff 40%, #ffffff 100%)` }}>
      {fontStyles}

      <div className="aqua-ripple w-80 h-80 -top-24 -left-24 float-slow" />
      <div className="aqua-ripple w-[26rem] h-[26rem] top-1/3 -right-40 float-slow" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6 transition-colors hover:opacity-100 group"
          style={{ color: colors.text, opacity: 0.7 }}
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="mb-8 sm:mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: colors.deep, opacity: 0.7 }}>
              Support
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold" style={{ color: colors.text }}>
              My Service Requests
            </h1>
          </div>
          {services.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium" style={{ color: colors.deep }}>
              <Wrench className="w-5 h-5" />
              {services.length} request{services.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="space-y-5 sm:space-y-7">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block">
                <Loader2 className="w-11 h-11 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
                <p className="font-medium" style={{ color: colors.text, opacity: 0.6 }}>Loading your service requests...</p>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-4 glass-card rounded-3xl shadow-lg">
              <Wrench className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
              <h3 className="text-xl font-display font-semibold mb-2" style={{ color: colors.text }}>
                No service requests yet
              </h3>
              <p className="mb-7" style={{ color: colors.text, opacity: 0.65 }}>
                Need an installation, repair, or maintenance visit? Book one and track it here.
              </p>
              <button
                onClick={() => navigate("/services")}
                className="px-7 py-3 text-white rounded-full font-semibold shadow-lg transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.deep})` }}
              >
                Book a Service
              </button>
            </div>
          ) : (
            services.map((service, idx) => {
              const isCancellable = CANCELLABLE_STATUSES.includes(service.status);
              const isCancelling = cancellingId === service._id;

              return (
                <div
                  key={service._id}
                  className="fade-up glass-card rounded-3xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="p-5 sm:p-7 pb-4 sm:pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-display font-semibold tracking-wide" style={{ color: colors.text }}>
                          {service.serviceType || "Service Request"}
                        </h3>
                        <p className="text-xs sm:text-sm mt-0.5" style={{ color: colors.text, opacity: 0.55 }}>
                          Request #{service._id?.slice(-8).toUpperCase()} · Requested {formatDate(service.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border whitespace-nowrap ${
                          statusColors[service.status] || "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {getStatusIcon(service.status)}
                        <span className="ml-1">{service.status}</span>
                      </span>
                    </div>

                    {service.status !== "Cancelled" && <StatusStepper status={service.status} />}
                    {service.status === "Cancelled" && (
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600">
                        <XCircle className="w-4 h-4" />
                        This request was cancelled
                      </div>
                    )}
                  </div>

                  <div className="h-px mx-5 sm:mx-7" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)` }} />

                  <div className="p-5 sm:p-7 pt-4 sm:pt-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="rounded-2xl p-4" style={{ backgroundColor: `${colors.background}90` }}>
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: colors.deep }}>
                          <Calendar className="w-4 h-4" />
                          Preferred Date
                        </h4>
                        <p className="text-sm font-medium" style={{ color: colors.text, opacity: 0.85 }}>
                          {formatDate(service.preferredDate)}
                        </p>
                      </div>

                      <div className="rounded-2xl p-4" style={{ backgroundColor: `${colors.background}90` }}>
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: colors.deep }}>
                          <MapPin className="w-4 h-4" />
                          Service Address
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: colors.text, opacity: 0.75 }}>
                          {service.address || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {service.description && (
                      <div className="mt-4 sm:mt-5 rounded-2xl p-4" style={{ backgroundColor: `${colors.background}60` }}>
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: colors.deep }}>
                          Notes
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: colors.text, opacity: 0.75 }}>
                          {service.description}
                        </p>
                      </div>
                    )}

                    {isCancellable && (
                      <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleCancelService(service._id)}
                          disabled={isCancelling}
                          className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
                        >
                          {isCancelling ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Cancel Request
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ServicePage;