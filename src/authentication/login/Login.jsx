// src/Pages/Login/Login.jsx
import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { LoginValidation } from "./LoginValidation";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import NavBar from "../../components/NavBar";

const initialValues = {
  email: "",
  password: "",
};

function Login() {
  const { loginUser, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      <NavBar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Welcome Back
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={LoginValidation}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={async (values, { setSubmitting }) => {
              const result = await loginUser(
                values.email,
                values.password
              );

              console.log("Login Result:", result);

              if (!result.success) {
                toast.error(result.message || "Login Failed");
                setSubmitting(false);
                return;
              }

              if (result.role === "admin") {
                toast.success("Admin Login Successful");
                navigate("/admin/dashboard", { replace: true });
              } else {
                toast.success("Login Successful");
                navigate("/", { replace: true });
              }

              setSubmitting(false);
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className={`w-full border p-3 rounded ${errors.email && touched.email
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className={`w-full border p-3 rounded ${errors.password && touched.password
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-sm text-center mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 font-semibold hover:text-blue-600"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;