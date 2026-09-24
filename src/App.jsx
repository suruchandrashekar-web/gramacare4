import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// LOCATION
// =====================================================

import Location from "./Location.jsx";

// =====================================================
// PROVIDER PAGES
// =====================================================

import ProviderDashboard from "./Provider/ProviderDashBoard.jsx";
import AddServices from "./Provider/AddServices.jsx";
import MyServices from "./Provider/MyServices.jsx";
import ProviderRequest from "./Provider/ProviderRequest.jsx";
import ProviderProfile from "./Provider/ProviderProfile.jsx";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./Login/Login.jsx";
import Register from "./Register/Register.jsx";
import ForgotPassword from "./Forgotpassword/Forgotpassword.jsx";
import OtpPassword from "./OtpPassword/OtpPassword.jsx";
import Restetpassword from "./Restetpassword/Restetpassword.jsx";

// =====================================================
// ADMIN PAGE
// =====================================================

import AdminDashboard from "./Adimin/AdminDashboard.jsx";

// =====================================================
// FOOTER
// =====================================================

import Footer from "./footer/Footer.jsx";

// =====================================================
// PAGE WITH FOOTER
// =====================================================

function PageWithFooter({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <>
      {/* =================================================
          LOCATION PERMISSION
      ================================================= */}

      <Location />

      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* =================================================
            OTP VERIFICATION
        ================================================= */}

        <Route
          path="/otp"
          element={<OtpPassword />}
        />

        {/* =================================================
            RESET PASSWORD
        ================================================= */}

        <Route
          path="/reset-password"
          element={<Restetpassword />}
        />

        {/* =================================================
            HOME
            Redirect to Login
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* =================================================
            PROVIDER DASHBOARD
        ================================================= */}

        <Route
          path="/provider/dashboard"
          element={
            <PageWithFooter>
              <ProviderDashboard />
            </PageWithFooter>
          }
        />

        {/* =================================================
            MY SERVICES
        ================================================= */}

        <Route
          path="/provider/services"
          element={
            <PageWithFooter>
              <MyServices />
            </PageWithFooter>
          }
        />

        {/* =================================================
            ADD SERVICE
        ================================================= */}

        <Route
          path="/provider/services/add"
          element={
            <PageWithFooter>
              <AddServices />
            </PageWithFooter>
          }
        />

        {/* =================================================
            PROVIDER REQUESTS
        ================================================= */}

        <Route
          path="/provider/requests"
          element={
            <PageWithFooter>
              <ProviderRequest />
            </PageWithFooter>
          }
        />

        {/* =================================================
            PROVIDER PROFILE
        ================================================= */}

        <Route
          path="/provider/profile"
          element={
            <PageWithFooter>
              <ProviderProfile />
            </PageWithFooter>
          }
        />

        {/* =================================================
            UNKNOWN URL
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </>
  );
}

export default App;