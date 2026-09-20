import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState("PROVIDER");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // PASSWORD VALIDATION
  // =====================================================

  const validatePassword = (value) => {
    if (value.length < 8) {
      return "Password must contain at least 8 characters";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least 1 uppercase letter";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain at least 1 lowercase letter";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain at least 1 number";
    }

    if (!/[!@#$%^&*]/.test(value)) {
      return "Password must contain at least 1 special character";
    }

    return "";
  };

  // =====================================================
  // PHONE VALIDATION
  // =====================================================

  const validatePhone = (value) => {
    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(value)) {
      return "Please enter a valid 10-digit Indian mobile number";
    }

    return "";
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleSignup = async (e) => {
    e.preventDefault();

    // ===================================================
    // PREVENT DOUBLE CLICK
    // ===================================================

    if (loading) {
      return;
    }

    // ===================================================
    // GET VALUES
    // ===================================================

    const nameValue = name.trim();
    const emailValue = email.trim().toLowerCase();
    const phoneValue = phone.trim();
    const passwordValue = password;
    const confirmPasswordValue = confirmPassword;

    // ===================================================
    // EMPTY FIELD VALIDATION
    // ===================================================

    if (
      !nameValue ||
      !emailValue ||
      !phoneValue ||
      !passwordValue ||
      !confirmPasswordValue ||
      !role
    ) {
      alert("Please fill all fields.");
      return;
    }

    // ===================================================
    // NAME VALIDATION
    // ===================================================

    if (nameValue.length < 2) {
      alert("Please enter a valid full name.");
      return;
    }

    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      alert("Please enter a valid email address.");
      return;
    }

    // ===================================================
    // PHONE VALIDATION
    // ===================================================

    const phoneError = validatePhone(phoneValue);

    if (phoneError) {
      alert(phoneError);
      return;
    }

    // ===================================================
    // PASSWORD VALIDATION
    // ===================================================

    const passwordError =
      validatePassword(passwordValue);

    if (passwordError) {
      alert(passwordError);
      return;
    }

    // ===================================================
    // CONFIRM PASSWORD
    // ===================================================

    if (passwordValue !== confirmPasswordValue) {
      alert("Passwords do not match.");
      return;
    }

    // ===================================================
    // START LOADING
    // ===================================================

    setLoading(true);

    try {
      // =================================================
      // BACKEND API
      // =================================================

      const response = await fetch(
        "http://localhost:8082/api/users/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: nameValue,
            email: emailValue,
            phone: phoneValue,
            password: passwordValue,
            role: role,
          }),
        }
      );

      // =================================================
      // READ RESPONSE
      // =================================================

      let data = null;

      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }

      // =================================================
      // BACKEND ERROR
      // =================================================

      if (!response.ok) {
        const backendMessage =
          data?.message ||
          data?.error ||
          "Registration failed.";

        alert(backendMessage);
        return;
      }

      // =================================================
      // CREATE LOCAL USER OBJECT
      // =================================================

      const registeredUser = {
        id: data?.id || null,

        name: nameValue,

        fullName: nameValue,

        email: emailValue,

        phone: phoneValue,

        role: role,
      };

      // =================================================
      // SAVE USER INFORMATION
      // =================================================

      localStorage.setItem(
        "registeredUser",
        JSON.stringify(registeredUser)
      );

      // =================================================
      // REMOVE OLD LOGIN DATA
      // =================================================

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("loggedInUserId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("googleUser");
      localStorage.removeItem("loginType");

      // =================================================
      // SUCCESS
      // =================================================

      alert(
        "Account created successfully!\n\nPlease login to continue with GramaCare."
      );

      // =================================================
      // CLEAR FORM
      // =================================================

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");

      setRole("PROVIDER");

      setShowPassword(false);
      setShowConfirmPassword(false);

      // =================================================
      // GO TO LOGIN
      // =================================================

      navigate("/login", {
        replace: true,
      });

    } catch (error) {
      // =================================================
      // NETWORK / BACKEND ERROR
      // =================================================

      console.error(
        "GramaCare Registration Error:",
        error
      );

      alert(
        "Unable to connect to GramaCare backend.\n\nPlease make sure Spring Boot is running on port 8082."
      );

    } finally {
      // =================================================
      // STOP LOADING
      // =================================================

      setLoading(false);
    }
  };

  // =====================================================
  // GO TO LOGIN
  // =====================================================

  const handleLogin = () => {
    navigate("/login");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="signup-page">

      {/* =================================================
          BACKGROUND DECORATIONS
      ================================================= */}

      <div className="signup-decoration signup-decoration-one"></div>

      <div className="signup-decoration signup-decoration-two"></div>

      <div className="signup-decoration signup-decoration-three"></div>

      {/* =================================================
          REGISTER CARD
      ================================================= */}

      <div className="signup-card">

        {/* =================================================
            GRAMACARE LOGO
        ================================================= */}

        <div className="signup-logo">

          <span className="signup-logo-icon">
            🌱
          </span>

          <span className="signup-logo-text">
            Grama<span>Care</span>
          </span>

        </div>

        {/* =================================================
            HEADING
        ================================================= */}

        <h1>
          Create Account
        </h1>

        {/* =================================================
            SUBTITLE
        ================================================= */}

        <p className="signup-subtitle">
          Join GramaCare and connect with trusted
          village services
        </p>

        {/* =================================================
            REGISTER FORM
        ================================================= */}

        <form onSubmit={handleSignup}>

          {/* =================================================
              FULL NAME
          ================================================= */}

          <div className="signup-input-group">

            <label htmlFor="signup-name">
              Full Name
            </label>

            <div className="signup-input-wrapper">

              <span className="signup-input-icon">
                👤
              </span>

              <input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                autoComplete="name"
                disabled={loading}
              />

            </div>

          </div>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="signup-input-group">

            <label htmlFor="signup-email">
              Email Address
            </label>

            <div className="signup-input-wrapper">

              <span className="signup-input-icon">
                ✉️
              </span>

              <input
                id="signup-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                disabled={loading}
              />

            </div>

          </div>

          {/* =================================================
              PHONE NUMBER
          ================================================= */}

          <div className="signup-input-group">

            <label htmlFor="signup-phone">
              Mobile Number
            </label>

            <div className="signup-input-wrapper">

              <span className="signup-input-icon">
                📱
              </span>

              <input
                id="signup-phone"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  const value =
                    e.target.value.replace(/\D/g, "");

                  if (value.length <= 10) {
                    setPhone(value);
                  }
                }}
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                disabled={loading}
              />

            </div>

          </div>

          {/* =================================================
              ROLE
          ================================================= */}

          <div className="signup-input-group">

            <label htmlFor="signup-role">
              Account Type
            </label>

            <div className="signup-input-wrapper">

              <span className="signup-input-icon">
                🏷️
              </span>

              <select
                id="signup-role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                disabled={loading}
              >

                <option value="PROVIDER">
                  Service Provider
                </option>

                <option value="USER">
                  Service User
                </option>

              </select>

            </div>

          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="signup-input-group">

            <label htmlFor="signup-password">
              Password
            </label>

            <div className="signup-password-wrapper">

              <span className="signup-input-icon">
                🔒
              </span>

              <input
                id="signup-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="signup-eye-button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>

          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div className="signup-input-group">

            <label htmlFor="signup-confirm-password">
              Confirm Password
            </label>

            <div className="signup-password-wrapper">

              <span className="signup-input-icon">
                🔐
              </span>

              <input
                id="signup-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="signup-eye-button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>

          {/* =================================================
              PASSWORD INFO
          ================================================= */}

          <div className="signup-password-info">

            <span>
              🔐
            </span>

            <p>
              Use 8+ characters with uppercase,
              lowercase, number and special character.
            </p>

          </div>

          {/* =================================================
              CREATE ACCOUNT BUTTON
          ================================================= */}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="signup-spinner"></span>

                Creating Account...
              </>
            ) : (
              <>
                Create GramaCare Account

                <span className="signup-button-arrow">
                  →
                </span>
              </>
            )}

          </button>

        </form>

        {/* =================================================
            LOGIN SECTION
        ================================================= */}

        <div className="signup-login">

          <p>
            Already have an account?
          </p>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            Login to GramaCare
          </button>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="signup-footer">

          <span>
            🌱
          </span>

          <p>
            Connecting Villages with{" "}
            <strong>
              Trusted Services
            </strong>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register; 