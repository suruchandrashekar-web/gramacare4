import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./OtpPassword.css";

function OtpPassword() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOTP = (e) => {
    e.preventDefault();

    setMessage("");

    // -------------------------------------------------
    // EMPTY OTP
    // -------------------------------------------------

    if (!otp.trim()) {
      setMessage("Please enter the OTP.");
      return;
    }

    // -------------------------------------------------
    // OTP LENGTH
    // -------------------------------------------------

    if (otp.length !== 6) {
      setMessage("OTP must contain 6 digits.");
      return;
    }

    // -------------------------------------------------
    // GET SAVED OTP
    // -------------------------------------------------

    const savedOTP = localStorage.getItem("resetOTP");

    if (!savedOTP) {
      setMessage(
        "OTP not found. Please request a new OTP."
      );
      return;
    }

    // -------------------------------------------------
    // CHECK OTP EXPIRY
    // -------------------------------------------------

    const expiryTime = localStorage.getItem(
      "resetOTPExpiry"
    );

    if (
      expiryTime &&
      Date.now() > Number(expiryTime)
    ) {
      localStorage.removeItem("resetOTP");
      localStorage.removeItem("resetOTPExpiry");

      setMessage(
        "OTP expired. Please request a new OTP."
      );

      return;
    }

    // -------------------------------------------------
    // CHECK OTP
    // -------------------------------------------------

    if (otp !== savedOTP) {
      setMessage(
        "Invalid OTP. Please enter the correct OTP."
      );
      return;
    }

    // =================================================
    // OTP CORRECT
    // =================================================

    setLoading(true);

    setMessage(
      "✓ OTP verified successfully!"
    );

    // -------------------------------------------------
    // SAVE VERIFIED STATUS
    // -------------------------------------------------

    localStorage.setItem(
      "otpVerified",
      "true"
    );

    // -------------------------------------------------
    // REMOVE USED OTP
    // -------------------------------------------------

    localStorage.removeItem(
      "resetOTP"
    );

    localStorage.removeItem(
      "resetOTPExpiry"
    );

    // =================================================
    // GO TO RESET PASSWORD
    // =================================================

    setTimeout(() => {
      navigate("/reset-password");
    }, 800);
  };

  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  const handleBackToLogin = () => {
    localStorage.removeItem("resetOTP");
    localStorage.removeItem("resetOTPExpiry");
    localStorage.removeItem("otpVerified");
    localStorage.removeItem("resetEmail");
    localStorage.removeItem("resetUserId");

    navigate("/login");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="otp-page">

      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <div className="otp-decoration otp-decoration-one"></div>

      <div className="otp-decoration otp-decoration-two"></div>

      {/* =================================================
          OTP CARD
      ================================================= */}

      <div className="otp-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="otp-logo">
          <span className="otp-logo-icon">🌱</span>
          <span>Grama</span>
          <span className="otp-logo-highlight">
            Care
          </span>
        </div>

        {/* =================================================
            SECURITY ICON
        ================================================= */}

        <div className="otp-icon">
          🔐
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h1>
          Verify OTP
        </h1>

        {/* =================================================
            SUBTITLE
        ================================================= */}

        <p className="otp-subtitle">
          Enter the 6-digit verification code
          sent to your registered email address.
        </p>

        {/* =================================================
            EMAIL INFO
        ================================================= */}

        {localStorage.getItem("resetEmail") && (
          <div className="otp-email-info">
            <span className="otp-email-icon">
              ✉️
            </span>

            <span>
              Code sent to{" "}
              <strong>
                {localStorage.getItem("resetEmail")}
              </strong>
            </span>
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleVerifyOTP}>

          {/* =================================================
              OTP INPUT
          ================================================= */}

          <div className="otp-input-group">

            <label htmlFor="otp">
              Enter Verification Code
            </label>

            <div className="otp-input-wrapper">

              <span className="otp-input-icon">
                🔢
              </span>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                disabled={loading}
                autoComplete="one-time-code"
                onChange={(e) => {

                  const value =
                    e.target.value.replace(/\D/g, "");

                  setOtp(value);
                  setMessage("");
                }}
              />

            </div>

          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div
              className={
                message.startsWith("✓")
                  ? "otp-message otp-success"
                  : "otp-message otp-error"
              }
            >
              {message}
            </div>
          )}

          {/* =================================================
              VERIFY BUTTON
          ================================================= */}

          <button
            type="submit"
            className="otp-verify-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="otp-spinner"></span>
                Verifying...
              </>
            ) : (
              <>
                Verify OTP
                <span className="otp-button-arrow">
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
          <span>←</span>
          Back to Login
        </button>

        {/* =================================================
            SECURITY NOTE
        ================================================= */}

        <div className="otp-security-note">
          <span>🛡️</span>

          <p>
            For your security, never share your
            OTP with anyone.
          </p>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <p className="otp-footer">
          🌱 Connecting Villages with Trusted Services
        </p>

      </div>
    </div>
  );
}

export default OtpPassword;