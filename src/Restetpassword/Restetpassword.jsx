
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Restetpassword.css";

function Restetpassword() {

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleResetPassword = (e) => {

    e.preventDefault();

    setMessage("");


    // =====================================================
    // CHECK OTP VERIFICATION
    // =====================================================

    const otpVerified =
      localStorage.getItem("otpVerified");

    if (otpVerified !== "true") {

      alert("Please verify OTP first.");

      return;
    }


    // =====================================================
    // EMPTY FIELDS
    // =====================================================

    if (!password || !confirmPassword) {

      alert("Please fill all fields.");

      return;
    }


    // =====================================================
    // PASSWORD LENGTH
    // =====================================================

    if (password.length < 6) {

      alert(
        "Password must contain at least 6 characters."
      );

      return;
    }


    // =====================================================
    // PASSWORD MUST CONTAIN LETTER
    // =====================================================

    if (!/[A-Za-z]/.test(password)) {

      alert(
        "Password must contain at least one letter."
      );

      return;
    }


    // =====================================================
    // PASSWORD MUST CONTAIN NUMBER
    // =====================================================

    if (!/\d/.test(password)) {

      alert(
        "Password must contain at least one number."
      );

      return;
    }


    // =====================================================
    // PASSWORD MATCH
    // =====================================================

    if (password !== confirmPassword) {

      alert(
        "Passwords do not match."
      );

      return;
    }


    // =====================================================
    // GET REGISTERED USER
    // =====================================================

    const savedUser =
      JSON.parse(
        localStorage.getItem("user") || "null"
      );


    if (!savedUser) {

      alert(
        "User account not found. Please register first."
      );

      return;
    }


    // =====================================================
    // UPDATE PASSWORD
    // =====================================================

    const updatedUser = {

      ...savedUser,

      password: password

    };


    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );


    // =====================================================
    // CLEAR RESET DATA
    // =====================================================

    localStorage.removeItem("otpVerified");

    localStorage.removeItem("resetOTP");

    localStorage.removeItem("resetOTPExpiry");

    localStorage.removeItem("resetEmail");

    localStorage.removeItem("resetUserId");


    // =====================================================
    // LOGOUT
    // =====================================================

    localStorage.removeItem("isLoggedIn");


    // =====================================================
    // SUCCESS
    // =====================================================

    setMessage(
      "✓ Password changed successfully!"
    );


    // =====================================================
    // GO TO LOGIN
    // =====================================================

    setTimeout(() => {

      navigate("/login");

    }, 1200);

  };


  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  const handleBackToLogin = () => {

    localStorage.removeItem("otpVerified");

    localStorage.removeItem("resetOTP");

    localStorage.removeItem("resetOTPExpiry");

    localStorage.removeItem("resetEmail");

    localStorage.removeItem("resetUserId");

    localStorage.removeItem("isLoggedIn");

    navigate("/login");

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="reset-page">

      <div className="reset-card">


        {/* =================================================
            LOGO
        ================================================= */}

        <div className="reset-logo">

          Trade<span>X</span>

        </div>


        {/* =================================================
            TITLE
        ================================================= */}

        <h1>
          Reset Password
        </h1>


        <p className="reset-subtitle">

          Create a new password for your
          TradeX account.

        </p>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleResetPassword}
        >


          {/* =================================================
              NEW PASSWORD
          ================================================= */}

          <div className="reset-input-group">

            <label>
              New Password
            </label>


            <div className="reset-password-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                placeholder="Enter new password"

                value={password}

                onChange={(e) =>
                  setPassword(e.target.value)
                }

              />


              {/* =================================================
                  EYE BUTTON
              ================================================= */}

              <button
                type="button"
                className="reset-eye-button"

                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }

                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }

              >

                👁️

              </button>

            </div>

          </div>


          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div className="reset-input-group">

            <label>
              Confirm Password
            </label>


            <div className="reset-password-wrapper">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }

                placeholder="Confirm new password"

                value={confirmPassword}

                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }

              />


              {/* =================================================
                  EYE BUTTON
              ================================================= */}

              <button
                type="button"
                className="reset-eye-button"

                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }

                title={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }

              >

                👁️

              </button>

            </div>

          </div>


          {/* =================================================
              SUCCESS / MESSAGE
          ================================================= */}

          {message && (

            <div className="reset-message success">

              {message}

            </div>

          )}


          {/* =================================================
              CHANGE PASSWORD BUTTON
          ================================================= */}

          <button
            type="submit"
            className="reset-button"
          >

            Change Password

          </button>

        </form>


        {/* =================================================
            BACK TO LOGIN
        ================================================= */}

        <button
          type="button"
          className="reset-back-button"
          onClick={handleBackToLogin}
        >

          ← Back to Login

        </button>


        {/* =================================================
            DEMO
        ================================================= */}

        <p className="reset-demo">

          Demo Trading Platform

        </p>


      </div>

    </div>

  );

}

export default Restetpassword;

