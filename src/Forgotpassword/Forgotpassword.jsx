import { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "./Forgotpassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // SEND OTP
  // =====================================================
  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Empty email
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    // Clean email
    const emailValue = email.trim().toLowerCase();

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      alert("Please enter a valid email address.");
      return;
    }

    // =====================================================
    // GET USERS
    // =====================================================
    const users = JSON.parse(
      localStorage.getItem("users") || "[]"
    );

    // =====================================================
    // FIND USER
    // =====================================================
    let registeredUser = users.find(
      (user) =>
        user.email?.toLowerCase() === emailValue
    );

    // =====================================================
    // CHECK SINGLE USER
    // =====================================================
    if (!registeredUser) {
      const savedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (
        savedUser &&
        savedUser.email?.toLowerCase() === emailValue
      ) {
        registeredUser = savedUser;
      }
    }

    // =====================================================
    // USER NOT FOUND
    // =====================================================
    if (!registeredUser) {
      alert(
        "This email is not registered. Please create a GramaCare account first."
      );
      return;
    }

    // =====================================================
    // GENERATE 6 DIGIT OTP
    // =====================================================
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log("Generated OTP:", otp);

    // =====================================================
    // SAVE OTP
    // =====================================================
    localStorage.setItem("resetOTP", otp);

    // =====================================================
    // SAVE EMAIL
    // =====================================================
    localStorage.setItem(
      "resetEmail",
      emailValue
    );

    // =====================================================
    // OTP EXPIRY - 15 MINUTES
    // =====================================================
    const expiryTime =
      Date.now() + 15 * 60 * 1000;

    localStorage.setItem(
      "resetOTPExpiry",
      expiryTime.toString()
    );

    // =====================================================
    // SAVE USER ID
    // =====================================================
    if (registeredUser.id) {
      localStorage.setItem(
        "resetUserId",
        registeredUser.id.toString()
      );
    }

    // =====================================================
    // EMAILJS PARAMETERS
    // =====================================================
    const templateParams = {
      email: emailValue,
      passcode: otp,
      time: "15 minutes",
      name:
        registeredUser.name ||
        registeredUser.fullName ||
        "GramaCare User",
    };

    // =====================================================
    // SEND EMAIL
    // =====================================================
    try {
      setLoading(true);

      // EmailJS Public Key
      emailjs.init(
        "acu-D5P21dGPIRx7B"
      );

      const response = await emailjs.send(
        "service_ajt7m0r",
        "template_6g3frb4",
        templateParams
      );

      console.log(
        "Email Sent Successfully:",
        response
      );

      // ===================================================
      // SUCCESS
      // ===================================================
      alert(
        "OTP sent successfully to your registered email."
      );

      // Go to OTP page
      navigate("/otp");

    } catch (error) {
      console.error(
        "EmailJS Error:",
        error
      );

      // Remove reset data if email failed
      localStorage.removeItem("resetOTP");
      localStorage.removeItem("resetOTPExpiry");
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetUserId");

      alert(
        "OTP sending failed. Please check your EmailJS configuration and try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK TO LOGIN
  // =====================================================
  const handleBackToLogin = () => {
    navigate("/login");
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="forgot-page">

      {/* Background Decorations */}
      <div className="forgot-decoration forgot-decoration-one"></div>
      <div className="forgot-decoration forgot-decoration-two"></div>

      {/* =================================================
          CARD
      ================================================= */}
      <div className="forgot-card">

        {/* =================================================
            LOGO
        ================================================= */}
        <div className="forgot-logo">

          <span className="forgot-logo-icon">
            🌱
          </span>

          <span className="forgot-logo-grama">
            Grama
          </span>

          <span className="forgot-logo-care">
            Care
          </span>

        </div>

        {/* =================================================
            ICON
        ================================================= */}
        <div className="forgot-icon">
          🔐
        </div>

        {/* =================================================
            TITLE
        ================================================= */}
        <h1>
          Forgot Password?
        </h1>

        {/* =================================================
            SUBTITLE
        ================================================= */}
        <p className="forgot-subtitle">
          No worries! Enter your registered email
          address and we will send you a secure
          OTP to reset your GramaCare password.
        </p>

        {/* =================================================
            FORM
        ================================================= */}
        <form onSubmit={handleSendOtp}>

          {/* EMAIL */}
          <div className="forgot-input-group">

            <label htmlFor="forgot-email">
              Email Address
            </label>

            <div className="forgot-input-wrapper">

              <span className="forgot-input-icon">
                ✉️
              </span>

              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                autoComplete="email"
              />

            </div>

          </div>

          {/* =================================================
              SEND OTP BUTTON
          ================================================= */}
          <button
            type="submit"
            className="forgot-reset-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="forgot-spinner"></span>
                Sending OTP...
              </>
            ) : (
              <>
                Send OTP
                <span className="forgot-button-arrow">
                  →
                </span>
              </>
            )}
          </button>

        </form>

        {/* =================================================
            BACK TO LOGIN
        ================================================= */}
        <button
          type="button"
          className="back-login-button"
          onClick={handleBackToLogin}
          disabled={loading}
        >
          ← Back to Login
        </button>

        {/* =================================================
            SECURITY BOX
        ================================================= */}
        <div className="forgot-security">

          <div className="forgot-security-icon">
            🛡️
          </div>

          <div>
            <strong>
              Secure Verification
            </strong>

            <p>
              Your OTP is valid for 15 minutes.
              Never share your OTP with anyone.
            </p>
          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}
        <p className="forgot-footer">
          🌱 Connecting Villages with Trusted Services
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword; 