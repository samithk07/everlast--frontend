import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { toast } from "react-toastify";

// Water theme palette (shared with CheckoutPage)
const colors = {
  primary: "#00A9FF",
  deep: "#0077B6",
  secondary: "#89CFF3",
  accent: "#A0E9FF",
  background: "#CDF5FD",
  text: "#0B0C10",
};

// Purely presentational — maps a linear order journey to a step index.
// Cancelled orders fall outside this flow and get their own treatment.
const STATUS_FLOW = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Status colors kept semantic (not tied to the brand theme)
  const statusColors = {
    Pending: "bg-orange-100 text-orange-800 border-orange-200",
    Processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Shipped: "bg-blue-100 text-blue-800 border-blue-200",
    Delivered: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Confirmed: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/orders");
      if (res.data?.data) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load your orders. Please try again.");
      toast.error("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "Shipped":
        return <TruckIcon className="w-5 h-5 text-blue-500" />;
      case "Processing":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "Pending":
        return <ClockIcon className="w-5 h-5 text-orange-500" />;
      case "Cancelled":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "Confirmed":
        return <CheckCircleIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
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

  const formatAddress = (address) => {
    if (!address) return "Address not available";

    return `${address.fullName},
${address.address},
${address.city},
${address.state} - ${address.pincode}
Phone: ${address.phone}`;
  };

  const handleCancelOrder = async (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      //  fixed: send id in URL params, not body
      const response = await api.put(`/orders/${orderId}/cancel`);
      toast.success(response.data.message || "Order cancelled successfully");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: "Cancelled", paymentStatus: "Failed" }
            : o
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel order. Please try again."
      );
    }
  };

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [orders]);

  const OrderItemImage = ({ item }) => {
    const [imgError, setImgError] = useState(false);
    const product = item.product || {};
    const imageUrl =
      imgError
        ? "https://via.placeholder.com/80"
        : product.image?.url || "https://via.placeholder.com/80";

    return (
      <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] flex-shrink-0 rounded-2xl overflow-hidden ring-1 ring-white/70 shadow-[0_4px_14px_-4px_rgba(0,119,182,0.25)]">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${colors.accent}55, ${colors.secondary}30)` }}
        />
        <img
          src={imageUrl}
          alt={product.name || "Product image"}
          className="relative w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  };

  // Purely presentational status stepper — derived from order.orderStatus only.
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
                style={{
                  backgroundColor: i <= stepIndex ? colors.deep : "#E2ECF2",
                }}
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
                style={{
                  backgroundColor: i < stepIndex ? colors.deep : "#E2ECF2",
                }}
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
        background: rgba(255, 255, 255, 0.72);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.6);
      }
      .aqua-ripple {
        position: absolute;
        border-radius: 9999px;
        background: radial-gradient(circle at 30% 30%, rgba(160,233,255,0.55), rgba(0,169,255,0.08) 70%);
        filter: blur(2px);
        pointer-events: none;
      }
      @keyframes floatSlow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .float-slow { animation: floatSlow 7s ease-in-out infinite; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-up { animation: fadeUp 0.5s ease-out both; }
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
            Please login to view your orders
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
        <div className="relative max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6 transition-colors hover:opacity-100"
            style={{ color: colors.text, opacity: 0.7 }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="text-center py-16 px-4 glass-card rounded-3xl shadow-lg">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2" style={{ color: colors.text }}>
              Error Loading Orders
            </h3>
            <p className="mb-6" style={{ color: colors.text, opacity: 0.7 }}>{error}</p>
            <button
              onClick={fetchOrders}
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

      {/* Ambient decoration */}
      <div className="aqua-ripple w-80 h-80 -top-24 -left-24 float-slow" />
      <div className="aqua-ripple w-[26rem] h-[26rem] top-1/3 -right-40 float-slow" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 mb-6 transition-colors hover:opacity-100 group"
          style={{ color: colors.text, opacity: 0.7 }}
        >
          <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-8 sm:mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: colors.deep, opacity: 0.7 }}>
              Order history
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold" style={{ color: colors.text }}>
              Your Orders
            </h1>
          </div>
          {orders.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium" style={{ color: colors.deep }}>
              <ShoppingBagIcon className="w-5 h-5" />
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-5 sm:space-y-7">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block">
                <ClockIcon className="w-11 h-11 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
                <p className="font-medium" style={{ color: colors.text, opacity: 0.6 }}>Loading your orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-4 glass-card rounded-3xl shadow-lg">
              <SparklesIcon className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
              <h3 className="text-xl font-display font-semibold mb-2" style={{ color: colors.text }}>
                No orders yet
              </h3>
              <p className="mb-7" style={{ color: colors.text, opacity: 0.65 }}>
                Everything you order will show up here, ready to track.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-7 py-3 text-white rounded-full font-semibold shadow-lg transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.deep})` }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((order, orderIdx) => (
              <div
                key={order._id}
                className="fade-up glass-card rounded-3xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
                style={{ animationDelay: `${orderIdx * 60}ms` }}
              >
                {/* Order Header */}
                <div className="p-5 sm:p-7 pb-4 sm:pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-display font-semibold tracking-wide" style={{ color: colors.text }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-xs sm:text-sm mt-0.5" style={{ color: colors.text, opacity: 0.55 }}>
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border whitespace-nowrap ${
                          statusColors[order.orderStatus] || "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">{order.orderStatus}</span>
                      </span>
                      <p className="text-lg sm:text-xl font-display font-semibold" style={{ color: colors.deep }}>
                        ₹{order.totalAmount?.toLocaleString("en-IN") || 0}
                      </p>
                    </div>
                  </div>

                  {/* Status journey — decorative but truthful to order.orderStatus */}
                  <StatusStepper status={order.orderStatus} />
                </div>

                <div className="h-px mx-5 sm:mx-7" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)` }} />

                {/* Order Items */}
                <div className="p-5 sm:p-7 pt-4 sm:pt-5">
                  <div className="space-y-1">
                    {order.items?.map((item, itemIndex) => {
                      const product = item.product || {};
                      return (
                        <div
                          key={`${order._id}-${product._id || itemIndex}`}
                          className="flex items-center gap-3 sm:gap-4 py-3 rounded-xl transition-colors hover:bg-white/50 -mx-2 px-2"
                        >
                          <OrderItemImage item={item} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold truncate" style={{ color: colors.text }}>
                              {product.name || "Unnamed Product"}
                            </h4>
                            <p className="text-xs sm:text-sm mt-0.5" style={{ color: colors.text, opacity: 0.55 }}>
                              Size: {product.brand || "N/A"}ml · Qty: {item.quantity || 1}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            {/* ✅ fixed: use item.price which is stored in order */}
                            <p className="text-sm font-bold" style={{ color: colors.text }}>
                              ₹{item.price?.toLocaleString("en-IN") || 0}
                            </p>
                            {product.originalPrice && (
                              <p className="text-xs font-medium text-gray-400 line-through decoration-red-400">
                                ₹{product.originalPrice?.toLocaleString("en-IN")}
                              </p>
                            )}
                            {product.discount ? (
                              <span className="text-[11px] font-bold text-green-600">
                                {product.discount}% OFF
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping + Payment */}
                  <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="rounded-2xl p-4" style={{ backgroundColor: `${colors.background}90` }}>
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: colors.deep }}>
                        <MapPinIcon className="w-4 h-4" />
                        Shipping Address
                      </h4>
                      <p
                        className="text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words"
                        style={{ color: colors.text, opacity: 0.75 }}
                      >
                        {formatAddress(order.shippingAddress)}
                      </p>
                    </div>

                    <div className="rounded-2xl p-4" style={{ backgroundColor: `${colors.background}90` }}>
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: colors.deep }}>
                        <CreditCardIcon className="w-4 h-4" />
                        Payment
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm" style={{ color: colors.text, opacity: 0.6 }}>Method</span>
                          <span className="text-xs sm:text-sm font-semibold capitalize" style={{ color: colors.text }}>
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm" style={{ color: colors.text, opacity: 0.6 }}>Status</span>
                          <span className="text-xs sm:text-sm font-semibold capitalize" style={{ color: colors.text }}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  {(order.orderStatus === "Pending" ||
                    order.orderStatus === "Processing") && (
                    <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {orders.length > 0 && (
          <div className="mt-7 sm:mt-9 relative overflow-hidden rounded-3xl shadow-xl p-6 sm:p-8" style={{ background: `linear-gradient(135deg, ${colors.deep}, ${colors.primary})` }}>
            <div className="aqua-ripple w-56 h-56 -bottom-20 -right-10" style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), rgba(255,255,255,0.02) 70%)" }} />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-display font-semibold text-white mb-1">
                  Order Summary
                </h3>
                <p className="text-xs sm:text-sm text-white/75">
                  Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-white/75 mb-1">Total Spent</p>
                <p className="text-2xl sm:text-3xl font-display font-semibold text-white">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderPage;