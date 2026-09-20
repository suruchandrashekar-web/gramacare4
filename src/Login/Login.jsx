import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE_URL = "http://localhost:8082";

const ADMIN_EMAIL = "chandrasekarsuru@gmail.com";

const GOOGLE_CLIENT_ID =
  "883844461147-bsa59ljqe1l4g7u3jlk0mt65l7iteo5u.apps.googleusercontent.com";

function Login() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // GOOGLE REFS
  // =====================================================

  const googleInitializedRef = useRef(false);
  const googleRenderedRef = useRef(false);

  // =====================================================
  // CLEAR OLD LOGIN DATA
  // =====================================================

  const clearLoginData = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("loginType");
    localStorage.removeItem("googleUser");
  };

  // =====================================================
  // BLOCKED ACCOUNT HANDLER
  // =====================================================

  const handleBlockedAccount = () => {
    clearLoginData();

    alert(
      "🚫 Account Blocked\n\n" +
        "Your GramaCare account has been blocked by the administrator.\n\n" +
        "You cannot login or use GramaCare services until your account is unblocked."
    );
  };

  // =====================================================
  // CHECK GOOGLE ACCOUNT IN BACKEND
  // =====================================================

  const checkGoogleAccountStatus = async (googleEmail) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/by-email?email=${encodeURIComponent(
          googleEmail
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }

      console.log(
        "Google Account Status API:",
        response.status,
        data
      );

      // ===================================================
      // ACCOUNT FOUND
      // ===================================================

      if (response.ok && data) {
        if (data.blocked === true) {
          handleBlockedAccount();

          return {
            allowed: false,
            user: data,
          };
        }

        return {
          allowed: true,
          user: data,
        };
      }

      // ===================================================
      // ACCOUNT NOT FOUND / BACKEND RESPONSE
      // ===================================================

      return {
        allowed: true,
        user: null,
      };
    } catch (error) {
      console.error(
        "Google Account Status Check Error:",
        error
      );

      /*
       * Do not stop Google login just because the
       * account-status API is temporarily unavailable.
       *
       * Backend protected APIs will still need to
       * enforce blocked status separately.
       */

      return {
        allowed: true,
        user: null,
      };
    }
  };

  // =====================================================
  // NORMAL EMAIL + PASSWORD LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailValue = email.trim().toLowerCase();
    const passwordValue = password.trim();

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!emailValue || !passwordValue) {
      alert("Please enter your email and password.");
      return;
    }

    // ===================================================
    // REMEMBER ME
    // ===================================================

    if (!rememberMe) {
      alert("Please select Remember me before login.");
      return;
    }

    setLoading(true);

    try {
      // =================================================
      // LOGIN API
      // =================================================

      const response = await fetch(
        `${API_BASE_URL}/api/users/login`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: emailValue,
            password: passwordValue,
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

      console.log(
        "Login API Status:",
        response.status
      );

      console.log(
        "Login API Response:",
        data
      );

      // =================================================
      // LOGIN FAILED
      // =================================================

      if (!response.ok) {
        clearLoginData();

        const errorMessage =
          data?.message ||
          data?.error ||
          "Invalid email or password.";

        if (
          errorMessage
            .toLowerCase()
            .includes("blocked")
        ) {
          handleBlockedAccount();
          return;
        }

        alert(errorMessage);

        return;
      }

      // =================================================
      // INVALID RESPONSE
      // =================================================

      if (!data) {
        clearLoginData();

        alert("Invalid response from backend.");

        return;
      }

      // =================================================
      // EXTRA BLOCK CHECK
      // =================================================

      if (data.blocked === true) {
        handleBlockedAccount();

        return;
      }

      // =================================================
      // CLEAR PREVIOUS LOGIN DATA
      // =================================================

      clearLoginData();

      // =================================================
      // SAVE LOGIN STATUS
      // =================================================

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // =================================================
      // SAVE EMAIL
      // =================================================

      localStorage.setItem(
        "userEmail",
        data.email || emailValue
      );

      // =================================================
      // SAVE PHONE
      // =================================================

      if (data.phone) {
        localStorage.setItem(
          "userPhone",
          data.phone
        );
      }

      // =================================================
      // SAVE COMPLETE USER
      // =================================================

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(data)
      );

      // =================================================
      // SAVE USER ID
      // =================================================

      if (data.id) {
        localStorage.setItem(
          "loggedInUserId",
          String(data.id)
        );
      }

      // =================================================
      // SAVE ROLE
      // =================================================

      const backendRole = String(
        data.role || ""
      ).toUpperCase();

      localStorage.setItem(
        "userRole",
        backendRole
      );

      // =================================================
      // REMEMBER ME
      // =================================================

      localStorage.setItem(
        "rememberMe",
        "true"
      );

      // =================================================
      // LOGIN TYPE
      // =================================================

      localStorage.setItem(
        "loginType",
        "normal"
      );

      // =================================================
      // REMOVE GOOGLE USER
      // =================================================

      localStorage.removeItem(
        "googleUser"
      );

      // =================================================
      // FIXED ADMIN EMAIL
      // =================================================

      const isFixedAdminEmail =
        emailValue ===
        ADMIN_EMAIL.toLowerCase();

      if (isFixedAdminEmail) {
        const adminUser = {
          ...data,
          email: ADMIN_EMAIL,
          role: "ADMIN",
          blocked: false,
          loginType: "normal",
        };

        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(adminUser)
        );

        localStorage.setItem(
          "userEmail",
          ADMIN_EMAIL
        );

        localStorage.setItem(
          "userRole",
          "ADMIN"
        );

        localStorage.setItem(
          "loginType",
          "normal"
        );

        if (data.id) {
          localStorage.setItem(
            "loggedInUserId",
            String(data.id)
          );
        }

        console.log(
          "ADMIN LOGIN SUCCESS:",
          ADMIN_EMAIL
        );

        alert(
          `Welcome Admin!\n\n${ADMIN_EMAIL}`
        );

        navigate(
          "/admin/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      // =================================================
      // NORMAL USER LOGIN
      // =================================================

      console.log(
        "Normal Login Successful"
      );

      console.log(
        "Logged-in User:",
        data
      );

      console.log(
        "User Role:",
        backendRole
      );

      alert(
        `Welcome to GramaCare!\n\n${
          data.email || emailValue
        }`
      );

      // =================================================
      // PROVIDER
      // =================================================

      if (backendRole === "PROVIDER") {
        navigate(
          "/provider/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      // =================================================
      // USER
      // =================================================

      if (backendRole === "USER") {
        navigate(
          "/provider/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      // =================================================
      // OTHER ROLES
      // =================================================

      navigate(
        "/provider/dashboard",
        {
          replace: true,
        }
      );

    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      alert(
        "Unable to connect to GramaCare backend.\n\n" +
          "Please make sure Spring Boot is running on port 8082."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE LOGIN RESPONSE
  // =====================================================

  const handleGoogleResponse = async (
    response
  ) => {
    console.log(
      "Google Response:",
      response
    );

    if (
      !response ||
      !response.credential
    ) {
      alert("Google Login Failed.");
      return;
    }

    try {
      // =================================================
      // GOOGLE JWT
      // =================================================

      const parts =
        response.credential.split(".");

      if (parts.length !== 3) {
        throw new Error(
          "Invalid Google credential."
        );
      }

      // =================================================
      // GET PAYLOAD
      // =================================================

      const base64Url = parts[1];

      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const paddedBase64 =
        base64.padEnd(
          base64.length +
            ((4 -
              (base64.length % 4)) %
              4),
          "="
        );

      const payload = JSON.parse(
        window.atob(paddedBase64)
      );

      // =================================================
      // GOOGLE USER DATA
      // =================================================

      const googleEmail =
        payload.email
          ?.trim()
          .toLowerCase() || "";

      const googleName =
        payload.name ||
        "GramaCare User";

      const googlePicture =
        payload.picture || "";

      if (!googleEmail) {
        alert(
          "Google email was not found."
        );

        return;
      }

      // =================================================
      // IMPORTANT:
      // CHECK ACCOUNT BLOCK STATUS
      // BEFORE CREATING LOGIN SESSION
      // =================================================

      console.log(
        "Checking Google account:",
        googleEmail
      );

      const accountStatus =
        await checkGoogleAccountStatus(
          googleEmail
        );

      // =================================================
      // BLOCKED ACCOUNT
      // =================================================

      if (!accountStatus.allowed) {
        console.log(
          "Google login stopped because account is blocked."
        );

        return;
      }

      // =================================================
      // BACKEND USER DATA
      // =================================================

      const backendUser =
        accountStatus.user;

      // =================================================
      // FIXED ADMIN EMAIL
      // =================================================

      const isFixedAdminEmail =
        googleEmail ===
        ADMIN_EMAIL.toLowerCase();

      if (isFixedAdminEmail) {

        // If backend account exists and is blocked,
        // checkGoogleAccountStatus() already stopped login.

        const adminUser = {
          id:
            backendUser?.id ||
            payload.sub ||
            null,

          fullName:
            backendUser?.fullName ||
            googleName,

          name:
            backendUser?.fullName ||
            googleName,

          email: ADMIN_EMAIL,

          picture: googlePicture,

          role: "ADMIN",

          blocked: false,

          loginType: "google",
        };

        clearLoginData();

        localStorage.setItem(
          "isLoggedIn",
          "true"
        );

        localStorage.setItem(
          "userEmail",
          ADMIN_EMAIL
        );

        localStorage.setItem(
          "userRole",
          "ADMIN"
        );

        localStorage.setItem(
          "loginType",
          "google"
        );

        localStorage.setItem(
          "rememberMe",
          "true"
        );

        localStorage.setItem(
          "googleUser",
          JSON.stringify(adminUser)
        );

        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(adminUser)
        );

        if (
          backendUser?.id ||
          payload.sub
        ) {
          localStorage.setItem(
            "loggedInUserId",
            String(
              backendUser?.id ||
                payload.sub
            )
          );
        }

        console.log(
          "GOOGLE ADMIN LOGIN SUCCESS:",
          ADMIN_EMAIL
        );

        alert(
          `Welcome Admin!\n\n${ADMIN_EMAIL}`
        );

        navigate(
          "/admin/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      // =================================================
      // NORMAL GOOGLE USER
      // =================================================

      const googleUser = {
        id:
          backendUser?.id ||
          null,

        name:
          backendUser?.fullName ||
          googleName,

        fullName:
          backendUser?.fullName ||
          googleName,

        email: googleEmail,

        picture: googlePicture,

        role:
          backendUser?.role ||
          "PROVIDER",

        blocked: false,

        loginType: "google",
      };

      // =================================================
      // CLEAR OLD LOGIN
      // =================================================

      clearLoginData();

      // =================================================
      // SAVE LOGIN STATUS
      // =================================================

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // =================================================
      // SAVE EMAIL
      // =================================================

      localStorage.setItem(
        "userEmail",
        googleEmail
      );

      // =================================================
      // SAVE GOOGLE USER
      // =================================================

      localStorage.setItem(
        "googleUser",
        JSON.stringify(googleUser)
      );

      // =================================================
      // SAVE COMPLETE USER
      // =================================================

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(googleUser)
      );

      // =================================================
      // SAVE USER ID
      // =================================================

      if (backendUser?.id) {
        localStorage.setItem(
          "loggedInUserId",
          String(backendUser.id)
        );
      }

      // =================================================
      // SAVE ROLE
      // =================================================

      localStorage.setItem(
        "userRole",
        String(
          backendUser?.role ||
            "PROVIDER"
        ).toUpperCase()
      );

      // =================================================
      // LOGIN TYPE
      // =================================================

      localStorage.setItem(
        "loginType",
        "google"
      );

      // =================================================
      // REMEMBER ME
      // =================================================

      localStorage.setItem(
        "rememberMe",
        "true"
      );

      // =================================================
      // PHONE
      // =================================================

      if (backendUser?.phone) {
        localStorage.setItem(
          "userPhone",
          backendUser.phone
        );
      }

      console.log(
        "Google Login Successful:",
        googleUser
      );

      alert(
        `Welcome to GramaCare!\n\n${googleEmail}`
      );

      // =================================================
      // NAVIGATE
      // =================================================

      navigate(
        "/provider/dashboard",
        {
          replace: true,
        }
      );

    } catch (error) {
      console.error(
        "Google Login Error:",
        error
      );

      alert(
        "Unable to process Google Login."
      );
    }
  };

  // =====================================================
  // GOOGLE IDENTITY SERVICES
  // =====================================================

  useEffect(() => {
    let intervalId = null;

    let isMounted = true;

    const renderGoogleButton = () => {

      if (!isMounted) {
        return false;
      }

      if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id
      ) {
        return false;
      }

      const googleButton =
        document.getElementById(
          "googleBtn"
        );

      if (!googleButton) {
        return false;
      }

      const availableWidth =
        Math.floor(
          googleButton
            .getBoundingClientRect()
            .width
        );

      const googleWidth =
        Math.max(
          200,
          Math.min(
            400,
            availableWidth || 278
          )
        );

      // =================================================
      // INITIALIZE GOOGLE ONLY ONCE
      // =================================================

      if (
        !googleInitializedRef.current
      ) {

        window.google.accounts.id.initialize(
          {
            client_id:
              GOOGLE_CLIENT_ID,

            callback:
              handleGoogleResponse,

            auto_select: false,

            cancel_on_tap_outside:
              true,
          }
        );

        googleInitializedRef.current =
          true;
      }

      // =================================================
      // RENDER BUTTON ONLY ONCE
      // =================================================

      if (
        googleRenderedRef.current
      ) {
        return true;
      }

      googleButton.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButton,
        {
          type: "standard",

          theme: "outline",

          size: "large",

          text: "continue_with",

          shape: "rectangular",

          width: googleWidth,

          logo_alignment: "left",
        }
      );

      googleRenderedRef.current =
        true;

      console.log(
        "Google button rendered:",
        googleWidth + "px"
      );

      return true;
    };

    // ===================================================
    // FIRST ATTEMPT
    // ===================================================

    if (!renderGoogleButton()) {

      intervalId = setInterval(() => {

        if (
          isMounted &&
          renderGoogleButton()
        ) {
          clearInterval(
            intervalId
          );

          intervalId = null;
        }

      }, 300);
    }

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {

      isMounted = false;

      if (intervalId) {
        clearInterval(
          intervalId
        );

        intervalId = null;
      }

      googleRenderedRef.current =
        false;

      googleInitializedRef.current =
        false;

      const googleButton =
        document.getElementById(
          "googleBtn"
        );

      if (googleButton) {
        googleButton.innerHTML =
          "";
      }
    };

  }, []);

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = () => {
    navigate(
      "/forgot-password"
    );
  };

  // =====================================================
  // CREATE ACCOUNT
  // =====================================================

  const handleCreateAccount = () => {
    navigate("/register");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="login-page">

      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================= */}

      <div
        className="
          login-decoration
          login-decoration-one
        "
      ></div>

      <div
        className="
          login-decoration
          login-decoration-two
        "
      ></div>

      <div
        className="
          login-decoration
          login-decoration-three
        "
      ></div>

      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div className="login-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">

          <span className="login-logo-icon">
            🌱
          </span>

          <span className="login-logo-text">
            Grama
            <span>
              Care
            </span>
          </span>

        </div>

        {/* =================================================
            HEADING
        ================================================= */}

        <h1>
          Welcome Back
        </h1>

        {/* =================================================
            SUBTITLE
        ================================================= */}

        <p className="login-subtitle">
          Login to continue with GramaCare
        </p>

        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form
          onSubmit={
            handleLogin
          }
        >

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="login-input-group">

            <label htmlFor="login-email">
              Email Address
            </label>

            <div className="login-input-wrapper">

              <span className="login-input-icon">
                ✉️
              </span>

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                autoComplete="email"
                required
              />

            </div>

          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="login-input-group">

            <label htmlFor="login-password">
              Password
            </label>

            <div className="login-password-wrapper">

              <span className="login-input-icon">
                🔒
              </span>

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-eye-button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
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
              REMEMBER + FORGOT
          ================================================= */}

          <div className="login-options">

            <label className="remember-label">

              <input
                type="checkbox"
                checked={
                  rememberMe
                }
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              <span>
                Remember me
              </span>

            </label>

            <button
              type="button"
              className="forgot-btn"
              onClick={
                handleForgotPassword
              }
            >
              Forgot Password?
            </button>

          </div>

          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="login-button"
            disabled={
              loading
            }
          >

            <span>
              {loading
                ? "Logging in..."
                : "Login to GramaCare"}
            </span>

            {!loading && (
              <span className="login-button-arrow">
                →
              </span>
            )}

          </button>

        </form>

        {/* =================================================
            OR DIVIDER
        ================================================= */}

        <div className="login-divider">

          <span></span>

          <p>
            OR
          </p>

          <span></span>

        </div>

        {/* =================================================
            GOOGLE LOGIN
        ================================================= */}

        <div className="google-login-section">

          <p className="google-login-title">
            Continue with
          </p>

          <div className="google-login-wrapper">

            <div
              id="googleBtn"
            ></div>

          </div>

        </div>

        {/* =================================================
            CREATE ACCOUNT
        ================================================= */}

        <div className="create-account-section">

          <p>
            New to GramaCare?
          </p>

          <button
            type="button"
            className="create-account-button"
            onClick={
              handleCreateAccount
            }
          >
            Create New Account
          </button>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="login-footer">

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

export default Login;