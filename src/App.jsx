import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect,useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SplashScreen from "./animation/SplashScreen";
// Authentication
import Login from "./authentication/login/Login";
import Register from "./authentication/register/Registration";

// User Pages
import Home from "./pages/Home";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckOutPage";
import OrderPage from "./pages/OrderPage";
import UserPage from "./pages/UserPage";
import Services from "./pages/Services";
import About from "./pages/About";
import ServicePage from "./pages/ServicePage"; 


// Admin
import AdminProtectedRoute from "./admin/ProtectedRoute";
import AdminLayout from "./admin/layout/AdminLayout";
import DashboardPage from "./admin/Dashboard";
import ProductsPageadmin from "./admin/Products";
import OrdersPage from "./admin/Orders";
import UsersPage from "./admin/Users";
import ServicesPage from "./admin/ServicesPage";

// Common
import NotFoundPage from "./components/NotFoundPage";
import { initializeForegroundNotifications } from "./firebase/foregroundNotification";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initializeForegroundNotifications();
  }, []);

  return (
    <>
    {showSplash && (
      <SplashScreen
      logoSrc="/ChatGPT Image Aug 3, 2026, 01_43_46 PM.png"
      appName="Everlast Water Solution"
      tagline="Pure water, perfected"
      onFinish={() => setShowSplash(false)}
      />
    )}

      <div style={{ visibility: showSplash ? "hidden" : "visible" }}></div>
    <BrowserRouter>
  

  
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        />
      

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/userpage" element={<UserPage />} />

        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/services/status" element={<ServicePage />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
          >
          <Route
            index
            element={<Navigate to="/admin/dashboard" replace />}
            />

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPageadmin />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="services" element={<ServicesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Routes>

    </BrowserRouter>
  </>
  );
}

export default App;