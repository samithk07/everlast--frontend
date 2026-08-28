import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api"
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Water theme palette (shared with OrderPage, Navbar, Footer)
const colors = {
  primary: "#00A9FF",
  deep: "#0077B6",
  secondary: "#89CFF3",
  accent: "#A0E9FF",
  background: "#CDF5FD",
  text: "#0B0C10",
};


function CheckoutItemImage({ item }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl =
    imgError
      ? "https://via.placeholder.com/80x80?text=Perfume"
      : item.image?.url || "https://via.placeholder.com/80x80?text=Perfume";

  return (
    <div
      className="w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: `${colors.accent}30` }}
    >
      <img
        src={imageUrl}
        alt={item.name || "Product image"}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
}

function CheckOutPage() {
  const [method, setMethod] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { user } = useAuth();

  const location = useLocation();

  const productId = location.state?.productId;
  const quantity = location.state?.quantity || 1;

  const isBuyNow = !!productId;

  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  // formData fields
  const [formData, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    state: "",
    pincode: "",
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const { total, loadUserCart, items, isloading } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setBuyNowLoading(true);

      try {
        const res = await api.get(`/products/${productId}`);
        const product = res.data.Product;
        setBuyNowProduct({ ...product, price: product.salePrice });
      } catch (e) {
        console.error("BuyNow fetch error", e);
        toast.error("Failed to load product. Please try again.");
      } finally {
        setBuyNowLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const displayItems = isBuyNow
    ? buyNowProduct
      ? [{ ...buyNowProduct, quantity }]
      : []
    : items;

  const displayTotal = isBuyNow
    ? buyNowProduct
      ? buyNowProduct.price * quantity
      : 0
    : total || 0;

  // ---------- Validation ----------

  const validateField = (field, value) => {
    const v = (value || "").trim();

    switch (field) {
      case "fullName":
        if (!v) return "Full name is required";
        if (v.length < 2) return "Name must be at least 2 characters";
        if (v.length > 50) return "Name is too long";
        return "";

      case "phone":
        if (!v) return "Phone number is required";
        if (!/^[6-9]\d{9}$/.test(v.replace(/\s/g, ""))) {
          return "Enter a valid 10-digit Indian mobile number";
        }
        return "";

      case "address":
        if (!v) return "address / house no. is required";
        if (v.length < 5) return "Address is too short";
        if (v.length > 100) return "Address is too long";
        return "";

      case "state":
        if (!v) return "state is required";
        if (v.length < 2) return "state name is too short";
        if (v.length > 50) return "state name is too long";
        return "";

      case "pincode":
        if (!v) return "Pincode is required";
        if (!/^\d{6}$/.test(v)) return "Enter a valid 6-digit pincode";
        return "";

      case "city":
        if (!v) return "City is required";
        if (v.length < 2) return "City name is too short";
        return "";

      default:
        return "";
    }
  };

  const validateAddress = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  const isAddressValid = () => Object.keys(validateAddress()).length === 0;

  const handleFieldBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    const error = validateField(field, formData[field]);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));

    if (touchedFields[name]) {
      const error = validateField(name, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) next[name] = error;
        else delete next[name];
        return next;
      });
    }
  };

  const inputClass = (field) =>
    `w-full p-4 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-white ${errors[field]
      ? "border-red-400 focus:ring-red-300"
      : touchedFields[field] && !errors[field]
        ? "border-green-400 focus:ring-green-300"
        : "border-gray-300"
    }`;

  // ---------- Order placement ----------

  const handleOrder = async () => {
    // Validate formData fields
    const addressErrors = validateAddress();

    if (Object.keys(addressErrors).length > 0) {
      setErrors(addressErrors);

      const allTouched = {};
      Object.keys(formData).forEach((field) => {
        allTouched[field] = true;
      });
      setTouchedFields(allTouched);

      const firstErrorField = Object.keys(addressErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }

      toast.warn("Please fix the errors in your formData before continuing.");
      return;
    }

    if (!method) {
      toast.warn("Please select a payment method.");
      return;
    }

    if (displayItems.length === 0) {
      toast.warn("No items to order!");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const paymentMethod = method === "online" ? "ONLINE" : "COD";



      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        paymentMethod,
      };
      // console.log("Payload:", payload);
      // Step 1: Create Order
      const orderResponse = await api.post("/orders", payload);

      // COD Flow
      if (paymentMethod === "COD") {
        toast.success(orderResponse.data.message);

        await loadUserCart();

        navigate("/orders");

        return;
      }

      // Step 2: Create Razorpay Order
      const paymentResponse = await api.post("/payment/create", {
        orderId: orderResponse.data.data.orderId,
      });

      const { razorpayOrder, key } = paymentResponse.data.data;

      const options = {
        key: key,
        amount: razorpayOrder.amount,
        currency: "INR",
        order_id: razorpayOrder.id,

        name: "everlastwatersolutions",
        description: `Order Payment - ₹${displayTotal}`,

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },

        handler: async function (res) {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            });

            toast.success("Payment Successful !");
            navigate("/orders");

            if (!isBuyNow) await loadUserCart();
            if (isBuyNow) setBuyNowProduct(null);
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },

        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email || "",
        },

        theme: {
          color: colors.primary,
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment Cancelled");
          },
        },
      };

      if (!window.Razorpay) {
        toast.error("Payment service is loading. Please try again.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(
        err.response?.data?.Message ||
        "Failed to place order. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.warn("Please login to continue");
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Pre-fill formData if available in user data
  useEffect(() => {
    if (user && user.shippingAddress) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.name || "",
        ...user.shippingAddress,
      }));
    }
  }, [user]);

  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div
          className="flex-1 flex flex-col items-center justify-center px-4"
          style={{ background: `linear-gradient(to bottom, ${colors.background}, #ffffff)` }}
        >
          <div className="text-center space-y-6">
            <div className="text-6xl">🛒</div>
            <h2 className="text-2xl font-light" style={{ color: colors.text, opacity: 0.7 }}>
              Your cart is empty
            </h2>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: colors.primary }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.deep)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div
        className="flex-1 py-8 md:py-12 px-4"
        style={{ background: `linear-gradient(to bottom, ${colors.background}, #ffffff)` }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div
              className="py-6 px-5 md:py-8 md:px-8 text-white"
              style={{ background: `linear-gradient(to right, ${colors.deep}, ${colors.primary})` }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider">CHECKOUT</h1>
                  <p className="font-light mt-1 md:mt-2 text-sm md:text-base" style={{ opacity: 0.85 }}>
                    Complete your purchase with confidence
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-light text-sm" style={{ opacity: 0.8 }}>Order Total</p>
                  <p className="text-2xl md:text-3xl font-light">₹{displayTotal}</p>
                  <p className="text-xs md:text-sm" style={{ opacity: 0.85 }}>
                    {displayItems.length} item(s)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Left Column - formData Form */}
                <div>
                  <div className="flex items-center mb-6 md:mb-8">
                    <div
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full text-white flex items-center justify-center font-light mr-3 md:mr-4 flex-shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    >
                      1
                    </div>
                    <h3 className="text-xl md:text-2xl font-light tracking-wide" style={{ color: colors.text }}>
                      Delivery formData
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2 font-light tracking-wide" style={{ color: colors.text, opacity: 0.8 }}>
                        Full Name *
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        className={inputClass("fullName")}
                        value={formData.fullName}
                        onChange={handleAddressChange}
                        onBlur={() => handleFieldBlur("fullName")}
                        required
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 font-light tracking-wide" style={{ color: colors.text, opacity: 0.8 }}>
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        className={inputClass("phone")}
                        value={formData.phone}
                        onChange={handleAddressChange}
                        onBlur={() => handleFieldBlur("phone")}
                        maxLength={10}
                        required
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 font-light tracking-wide" style={{ color: colors.text, opacity: 0.8 }}>
                        address / House No. *
                      </label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        placeholder="Enter address formData"
                        className={inputClass("address")}
                        value={formData.address}
                        onChange={handleAddressChange}
                        onBlur={() => handleFieldBlur("address")}
                        required
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 font-light tracking-wide" style={{ color: colors.text, opacity: 0.8 }}>
                        state *
                      </label>
                      <input
                        id="state"
                        type="text"
                        name="state"
                        placeholder="state"
                        className={inputClass("state")}
                        value={formData.state}
                        onChange={handleAddressChange}
                        onBlur={() => handleFieldBlur("state")}
                        required
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-2 font-light tracking-wide" style={{ color: colors.text, opacity: 0.8 }}>
                          city *
                        </label>
                        <input
                          id="city"
                          type="text"
                          name="city"
                          placeholder="city"
                          className={inputClass("city")}
                          value={formData.city}
                          onChange={handleAddressChange}
                          onBlur={() => handleFieldBlur("city")}
                          required
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 font-light tracking-wide" style={{ color: colors.text, opacity: 0.8 }}>
                          Pincode *
                        </label>
                        <input
                          id="pincode"
                          type="text"
                          name="pincode"
                          placeholder="Pincode"
                          className={inputClass("pincode")}
                          value={formData.pincode}
                          onChange={handleAddressChange}
                          onBlur={() => handleFieldBlur("pincode")}
                          maxLength={6}
                          required
                        />
                        {errors.pincode && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-8 pt-8 border-t" style={{ borderColor: colors.accent }}>
                    <h4 className="text-lg font-medium mb-4 font-light tracking-wide" style={{ color: colors.text }}>
                      Order Items
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {displayItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{ backgroundColor: `${colors.background}80` }}
                        >
                          <CheckoutItemImage item={item} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                              {item.name}
                            </p>
                            <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                              {item.ml}ml • Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium" style={{ color: colors.text }}>
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Payment */}
                <div>
                  <div className="flex items-center mb-6 md:mb-8">
                    <div
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full text-white flex items-center justify-center font-light mr-3 md:mr-4 flex-shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    >
                      2
                    </div>
                    <h3 className="text-xl md:text-2xl font-light tracking-wide" style={{ color: colors.text }}>
                      Payment Method
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* Online Payment via Razorpay - no UPI input needed */}
                    <div
                      className="p-4 sm:p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer"
                      style={{
                        borderColor: method === "online" ? colors.primary : colors.accent,
                        backgroundColor: method === "online" ? `${colors.accent}30` : `${colors.background}60`,
                      }}
                    >
                      <label className="flex items-center gap-4 cursor-pointer">
                        <div className="relative flex-shrink-0">
                          <input
                            type="radio"
                            name="payment"
                            value="online"
                            onChange={() => setMethod("online")}
                            className="w-5 h-5 appearance-none border-2 rounded-full focus:ring-2"
                            style={{
                              borderColor: colors.primary,
                              backgroundColor: method === "online" ? colors.primary : "transparent",
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {method === "online" && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-base sm:text-lg font-medium" style={{ color: colors.text }}>Online Payment</span>
                          <p className="text-xs sm:text-sm mt-1" style={{ color: colors.text, opacity: 0.6 }}>
                            UPI, Cards, Net Banking via Razorpay
                          </p>
                        </div>
                        <div className="w-14 sm:w-16 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent }}>
                          <span className="text-xs font-medium" style={{ color: colors.deep }}>
                            Razorpay
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* COD */}
                    <div
                      className="p-4 sm:p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer"
                      style={{
                        borderColor: method === "cod" ? colors.primary : colors.accent,
                        backgroundColor: method === "cod" ? `${colors.accent}30` : `${colors.background}60`,
                      }}
                    >
                      <label className="flex items-center gap-4 cursor-pointer">
                        <div className="relative flex-shrink-0">
                          <input
                            type="radio"
                            name="payment"
                            value="cod"
                            onChange={() => setMethod("cod")}
                            className="w-5 h-5 appearance-none border-2 rounded-full focus:ring-2"
                            style={{
                              borderColor: colors.primary,
                              backgroundColor: method === "cod" ? colors.primary : "transparent",
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {method === "cod" && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-base sm:text-lg font-medium" style={{ color: colors.text }}>
                            Cash on Delivery
                          </span>
                          <p className="text-xs sm:text-sm mt-1" style={{ color: colors.text, opacity: 0.6 }}>
                            Pay when your order arrives
                          </p>
                        </div>
                        <div className="w-12 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-800 text-sm font-medium">
                            COD
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* formData validation summary */}
                  {Object.keys(errors).length > 0 && (
                    <div className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50">
                      <p className="text-sm font-medium text-red-700 mb-1">
                        Please fix the following:
                      </p>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {Object.values(errors).map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="mt-8 md:mt-12 p-5 sm:p-6 rounded-2xl border" style={{ backgroundColor: `${colors.background}60`, borderColor: colors.accent }}>
                    <h4 className="text-lg font-medium mb-4 font-light tracking-wide" style={{ color: colors.text }}>
                      Order Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm sm:text-base" style={{ color: colors.text, opacity: 0.7 }}>
                        <span>Subtotal ({displayItems.length} items)</span>
                        <span>₹{displayTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base" style={{ color: colors.text, opacity: 0.7 }}>
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base" style={{ color: colors.text, opacity: 0.7 }}>
                        <span>Tax (8%)</span>
                        <span>₹{(displayTotal * 0.08).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3 mt-3" style={{ borderColor: colors.accent }}>
                        <div className="flex justify-between text-base sm:text-lg font-medium" style={{ color: colors.text }}>
                          <span>Total Amount</span>
                          <span style={{ color: colors.deep }}>₹{(displayTotal * 1.08).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t" style={{ borderColor: colors.accent }}>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-5">
                  <div style={{ color: colors.text, opacity: 0.7 }} className="text-center sm:text-left">
                    <p className="text-sm">
                      By placing your order, you agree to our Terms of Service
                    </p>
                    <p className="text-xs mt-1">
                      30-day return policy • Secure checkout • Authenticity
                      guaranteed
                    </p>
                  </div>
                  <button
                    onClick={handleOrder}
                    disabled={isPlacingOrder || (Object.keys(touchedFields).length > 0 && !isAddressValid())}
                    className={`w-full sm:w-auto px-8 sm:px-12 py-4 text-white rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-light tracking-wider text-base sm:text-lg ${isPlacingOrder || (Object.keys(touchedFields).length > 0 && !isAddressValid())
                      ? "opacity-75 cursor-not-allowed"
                      : ""
                      }`}
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.deep} 100%)`,
                    }}
                  >
                    {isPlacingOrder ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        PLACING ORDER...
                      </span>
                    ) : (
                      "PLACE ORDER →"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CheckOutPage;