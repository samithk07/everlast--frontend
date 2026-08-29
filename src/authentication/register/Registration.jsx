// src/Pages/Register/Register.jsx
import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { RegisterValidation } from "./RegisterValidation";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import NavBar from "../../components/NavBar";

const initialValues = {
  name: "",
  email: "",
  password: "",
  cpassword: "",
};

function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showComPassword, setShowComPassword] = useState(false);

  return (
    <>
      <NavBar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create Account
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={RegisterValidation}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const result = await registerUser({
                  name: values.name,
                  email: values.email,
                  password: values.password,
                });

                if (result.success) {
                  toast.success(result.message);
                  navigate("/home", { state: { email: values.email } });
                } else {
                  toast.error(result.message);
                }
              } catch (err) {
                console.error("Error Registering User:", err);
                toast.error("Failed to Create Account!");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className={`w-full border p-3 rounded ${
                      errors.name && touched.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.name && touched.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className={`w-full border p-3 rounded ${
                      errors.email && touched.email
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
                    className={`w-full border p-3 rounded ${
                      errors.password && touched.password
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

                <div className="relative">
                  <Field
                    type={showComPassword ? "text" : "password"}
                    name="cpassword"
                    placeholder="Confirm Password"
                    className={`w-full border p-3 rounded ${
                      errors.cpassword && touched.cpassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowComPassword(!showComPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showComPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  {errors.cpassword && touched.cpassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cpassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Sending OTP..." : "Create Account"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 font-semibold hover:text-blue-600"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;