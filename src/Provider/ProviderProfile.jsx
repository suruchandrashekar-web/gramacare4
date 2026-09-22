import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProviderProfile.css";

function ProviderProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // =========================================================
  // BACKEND
  // =========================================================

  const API_BASE_URL = "https://gramacare4.onrender.com";

  // =========================================================
  // STATES
  // =========================================================

  const [profileImage, setProfileImage] = useState("");

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");

  const [work, setWork] = useState("");
  const [experience, setExperience] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [availability, setAvailability] = useState(true);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // USE EFFECT
  // =========================================================

  useEffect(() => {
    loadProviderProfile();
  }, []);

  // =========================================================
  // CLEAN PHONE NUMBER
  // =========================================================

  const cleanPhoneNumber = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .trim()
      .replace(/[^\d+]/g, "");
  };

  // =========================================================
  // VALIDATE PHONE NUMBER
  // =========================================================

  const isValidPhoneNumber = (value) => {
    const phone = cleanPhoneNumber(value);

    // India 10 digit number
    if (/^[6-9]\d{9}$/.test(phone)) {
      return true;
    }

    // +91XXXXXXXXXX
    if (/^\+91[6-9]\d{9}$/.test(phone)) {
      return true;
    }

    // 91XXXXXXXXXX
    if (/^91[6-9]\d{9}$/.test(phone)) {
      return true;
    }

    return false;
  };

  // =========================================================
  // LOAD PROVIDER PROFILE
  // =========================================================

  const loadProviderProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setMessage("");

      const loggedInUserId =
        localStorage.getItem("loggedInUserId");

      const loggedInUser =
        localStorage.getItem("loggedInUser");

      const userEmail =
        localStorage.getItem("userEmail");

      // -------------------------------------------------------
      // LOGIN CHECK
      // -------------------------------------------------------

      if (
        !loggedInUserId &&
        !userEmail &&
        !loggedInUser
      ) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      // -------------------------------------------------------
      // GET PROVIDERS
      // -------------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/api/users/providers`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load providers. Status: ${response.status}`
        );
      }

      const providers = await response.json();

      console.log(
        "Providers from backend:",
        providers
      );

      // -------------------------------------------------------
      // FIND CURRENT PROVIDER
      // -------------------------------------------------------

      let currentProvider = null;

      if (loggedInUserId) {
        currentProvider = providers.find(
          (provider) =>
            String(provider.id) ===
            String(loggedInUserId)
        );
      }

      // -------------------------------------------------------
      // FALLBACK BY EMAIL
      // -------------------------------------------------------

      if (
        !currentProvider &&
        userEmail
      ) {
        currentProvider = providers.find(
          (provider) =>
            String(provider.email || "")
              .trim()
              .toLowerCase() ===
            String(userEmail)
              .trim()
              .toLowerCase()
        );
      }

      // -------------------------------------------------------
      // FALLBACK FROM loggedInUser
      // -------------------------------------------------------

      if (
        !currentProvider &&
        loggedInUser
      ) {
        try {
          const savedUser =
            JSON.parse(loggedInUser);

          if (savedUser?.id) {
            currentProvider =
              providers.find(
                (provider) =>
                  String(provider.id) ===
                  String(savedUser.id)
              );
          }

          if (
            !currentProvider &&
            savedUser?.email
          ) {
            currentProvider =
              providers.find(
                (provider) =>
                  String(
                    provider.email || ""
                  )
                    .trim()
                    .toLowerCase() ===
                  String(
                    savedUser.email
                  )
                    .trim()
                    .toLowerCase()
              );
          }
        } catch (error) {
          console.log(
            "Unable to parse loggedInUser:",
            error
          );
        }
      }

      // -------------------------------------------------------
      // PROVIDER NOT FOUND
      // -------------------------------------------------------

      if (!currentProvider) {
        throw new Error(
          "Logged-in provider profile was not found."
        );
      }

      console.log(
        "Current provider:",
        currentProvider
      );

      // -------------------------------------------------------
      // SAVE USER ID
      // -------------------------------------------------------

      if (currentProvider.id) {
        localStorage.setItem(
          "loggedInUserId",
          String(currentProvider.id)
        );
      }

      // -------------------------------------------------------
      // SET PROFILE DATA
      // -------------------------------------------------------

      setFullName(
        currentProvider.fullName ||
          currentProvider.name ||
          ""
      );

      // IMPORTANT:
      // Read phone first.
      // mobile is only fallback.
      setMobile(
        currentProvider.phone ||
          currentProvider.mobile ||
          currentProvider.mobileNumber ||
          currentProvider.phoneNumber ||
          ""
      );

      setEmail(
        currentProvider.email ||
          ""
      );

      setVillage(
        currentProvider.village ||
          ""
      );

      setDistrict(
        currentProvider.district ||
          ""
      );

      setWork(
        currentProvider.work ||
          currentProvider.serviceName ||
          ""
      );

      setExperience(
        currentProvider.experience ||
          ""
      );

      setPrice(
        currentProvider.price ||
          ""
      );

      setDescription(
        currentProvider.description ||
          ""
      );

      setAvailability(
        currentProvider.availability !== false
      );

      setProfileImage(
        currentProvider.profileImage ||
          currentProvider.image ||
          ""
      );

      // -------------------------------------------------------
      // UPDATE LOCAL USER DATA
      // -------------------------------------------------------

      const normalizedProvider = {
        ...currentProvider,
        phone:
          currentProvider.phone ||
          currentProvider.mobile ||
          currentProvider.mobileNumber ||
          currentProvider.phoneNumber ||
          "",
      };

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(normalizedProvider)
      );

      localStorage.setItem(
        "userEmail",
        currentProvider.email || ""
      );

      localStorage.setItem(
        "userRole",
        currentProvider.role || "PROVIDER"
      );

    } catch (error) {
      console.error(
        "Load Profile Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // -------------------------------------------------------
    // IMAGE TYPE
    // -------------------------------------------------------

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image."
      );
      return;
    }

    // -------------------------------------------------------
    // IMAGE SIZE
    // -------------------------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image size should be less than 5 MB."
      );
      return;
    }

    // -------------------------------------------------------
    // CONVERT IMAGE TO BASE64
    // -------------------------------------------------------

    const reader =
      new FileReader();

    reader.onload = () => {
      setProfileImage(
        reader.result
      );
    };

    reader.onerror = () => {
      alert(
        "Unable to load image."
      );
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!fullName.trim()) {
      alert(
        "Please enter full name."
      );
      return;
    }

    if (!mobile.trim()) {
      alert(
        "Please enter mobile number."
      );
      return;
    }

    // -------------------------------------------------------
    // PHONE VALIDATION
    // -------------------------------------------------------

    const cleanedPhone =
      cleanPhoneNumber(mobile);

    if (
      !isValidPhoneNumber(
        cleanedPhone
      )
    ) {
      alert(
        "Please enter a valid Indian mobile number.\n\nExample: 9876543210"
      );
      return;
    }

    if (!email.trim()) {
      alert(
        "Please enter email."
      );
      return;
    }

    if (!village.trim()) {
      alert(
        "Please enter village."
      );
      return;
    }

    if (!district.trim()) {
      alert(
        "Please enter district."
      );
      return;
    }

    if (!work.trim()) {
      alert(
        "Please enter your work/service."
      );
      return;
    }

    if (!experience.trim()) {
      alert(
        "Please enter experience."
      );
      return;
    }

    if (!price.trim()) {
      alert(
        "Please enter starting price."
      );
      return;
    }

    // -------------------------------------------------------
    // GET USER ID
    // -------------------------------------------------------

    let providerId =
      localStorage.getItem(
        "loggedInUserId"
      );

    // -------------------------------------------------------
    // FALLBACK FROM loggedInUser
    // -------------------------------------------------------

    if (!providerId) {
      const savedLoggedInUser =
        localStorage.getItem(
          "loggedInUser"
        );

      if (savedLoggedInUser) {
        try {
          const user =
            JSON.parse(
              savedLoggedInUser
            );

          providerId =
            user.id;
        } catch (error) {
          console.log(
            "Unable to read loggedInUser:",
            error
          );
        }
      }
    }

    // -------------------------------------------------------
    // FALLBACK FROM PALLECONNECT
    // -------------------------------------------------------

    if (!providerId) {
      const savedProvider =
        localStorage.getItem(
          "palleconnect_current_user"
        );

      if (savedProvider) {
        try {
          const user =
            JSON.parse(
              savedProvider
            );

          providerId =
            user.id ||
            user.userId ||
            user.providerId;
        } catch (error) {
          console.log(
            "Unable to read current provider:",
            error
          );
        }
      }
    }

    // -------------------------------------------------------
    // LOGIN REQUIRED
    // -------------------------------------------------------

    if (!providerId) {
      alert(
        "Provider ID not found. Please login again."
      );

      navigate("/login");
      return;
    }

    // -------------------------------------------------------
    // IMPORTANT PHONE VALUE
    // -------------------------------------------------------

    const finalPhone =
      cleanedPhone.startsWith("+91")
        ? cleanedPhone
        : cleanedPhone.startsWith("91") &&
          cleanedPhone.length === 12
        ? `+${cleanedPhone}`
        : cleanedPhone;

    // -------------------------------------------------------
    // UPDATE DATA
    // IMPORTANT:
    // BACKEND USER FIELD = phone
    // -------------------------------------------------------

    const providerData = {
      fullName:
        fullName.trim(),

      phone:
        finalPhone,

      email:
        email.trim(),

      village:
        village.trim(),

      district:
        district.trim(),

      work:
        work.trim(),

      experience:
        experience.trim(),

      price:
        price.trim(),

      description:
        description.trim(),

      availability:
        availability,

      profileImage:
        profileImage,
    };

    console.log(
      "================================="
    );

    console.log(
      "UPDATING PROVIDER PROFILE"
    );

    console.log(
      "Provider ID:",
      providerId
    );

    console.log(
      "PHONE BEING SENT:",
      finalPhone
    );

    console.log(
      "Data:",
      providerData
    );

    console.log(
      "================================="
    );

    try {
      setSaving(true);

      // -----------------------------------------------------
      // PUT REQUEST
      // -----------------------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/api/users/${providerId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                providerData
              ),
          }
        );

      const responseText =
        await response.text();

      console.log(
        "Update Status:",
        response.status
      );

      console.log(
        "Update Response:",
        responseText
      );

      // -----------------------------------------------------
      // ERROR
      // -----------------------------------------------------

      if (!response.ok) {
        let backendMessage =
          responseText;

        try {
          const errorData =
            JSON.parse(
              responseText
            );

          backendMessage =
            errorData.message ||
            errorData.error ||
            responseText;
        } catch (error) {
          console.log(
            "Backend error is not JSON."
          );
        }

        throw new Error(
          backendMessage ||
          `Profile update failed. Status: ${response.status}`
        );
      }

      // -----------------------------------------------------
      // BACKEND RESPONSE
      // -----------------------------------------------------

      let updatedUser = {
        ...providerData,
        id: Number(providerId),
      };

      if (responseText) {
        try {
          const responseData =
            JSON.parse(
              responseText
            );

          if (
            responseData &&
            typeof responseData ===
              "object"
          ) {
            updatedUser =
              {
                ...responseData,
                id:
                  responseData.id ||
                  Number(providerId),
              };
          }
        } catch (error) {
          console.log(
            "Backend returned non-JSON response."
          );
        }
      }

      // -----------------------------------------------------
      // IMPORTANT:
      // MAKE SURE LOCAL USER HAS PHONE
      // -----------------------------------------------------

      updatedUser.id =
        Number(providerId);

      updatedUser.phone =
        updatedUser.phone ||
        finalPhone;

      // frontend compatibility
      updatedUser.mobile =
        updatedUser.mobile ||
        updatedUser.phone;

      // -----------------------------------------------------
      // UPDATE LOCAL STORAGE
      // -----------------------------------------------------

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(
          updatedUser
        )
      );

      localStorage.setItem(
        "loggedInUserId",
        String(providerId)
      );

      localStorage.setItem(
        "userEmail",
        email.trim()
      );

      localStorage.setItem(
        "userRole",
        "PROVIDER"
      );

      // -----------------------------------------------------
      // UPDATE SCREEN
      // -----------------------------------------------------

      setMobile(
        updatedUser.phone
      );

      setFullName(
        updatedUser.fullName ||
          fullName
      );

      // -----------------------------------------------------
      // VERIFY DATA FROM BACKEND
      // -----------------------------------------------------

      console.log(
        "Checking saved phone from backend..."
      );

      try {
        const verifyResponse =
          await fetch(
            `${API_BASE_URL}/api/users/${providerId}`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (verifyResponse.ok) {
          const verifyData =
            await verifyResponse.json();

          console.log(
            "USER AFTER SAVE:",
            verifyData
          );

          const backendPhone =
            verifyData?.phone ||
            verifyData?.mobile ||
            verifyData?.mobileNumber ||
            verifyData?.phoneNumber ||
            "";

          if (backendPhone) {
            setMobile(
              backendPhone
            );

            updatedUser = {
              ...updatedUser,
              ...verifyData,
              id:
                verifyData.id ||
                Number(providerId),
              phone:
                backendPhone,
              mobile:
                backendPhone,
            };

            localStorage.setItem(
              "loggedInUser",
              JSON.stringify(
                updatedUser
              )
            );
          }

          console.log(
            "PHONE SAVED IN BACKEND:",
            backendPhone
          );
        } else {
          console.warn(
            "Unable to verify saved user."
          );
        }
      } catch (verifyError) {
        console.warn(
          "Phone verification failed:",
          verifyError
        );
      }

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setMessage(
        "Profile updated successfully! Mobile number saved."
      );

      // -----------------------------------------------------
      // REMOVE MESSAGE AFTER 3 SEC
      // -----------------------------------------------------

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Save Profile Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to update profile."
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem(
      "palleconnect_current_user"
    );

    localStorage.removeItem(
      "loggedInUser"
    );

    localStorage.removeItem(
      "loggedInUserId"
    );

    localStorage.removeItem(
      "loggedInProviderId"
    );

    localStorage.removeItem(
      "userEmail"
    );

    localStorage.removeItem(
      "userRole"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    navigate("/login");
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div
        className="provider-profile-page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        Loading Profile...
      </div>
    );
  }

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="provider-profile-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="provider-navbar">

        {/* LOGO */}

        <Link
          to="/provider/dashboard"
          className="provider-logo"
        >
          <div className="logo-symbol">
            🌱
          </div>

          <div className="logo-text">
            <h2>
              GramaCare
            </h2>

            <span>
              Village Services
            </span>
          </div>
        </Link>

        {/* NAVIGATION */}

        <div className="provider-nav">

          <Link
            to="/provider/dashboard"
            className="provider-nav-item"
          >
            <span>
              ⌂
            </span>

            Dashboard
          </Link>

          <Link
            to="/provider/services"
            className="provider-nav-item"
          >
            <span>
              🔧
            </span>

            My Services
          </Link>

          <Link
            to="/provider/requests"
            className="provider-nav-item"
          >
            <span>
              ✉
            </span>

            Requests
          </Link>

          <Link
            to="/provider/profile"
            className="provider-nav-item active"
          >
            <span>
              👤
            </span>

            Profile
          </Link>

        </div>

        {/* LOGOUT */}

        <button
          className="provider-logout"
          onClick={logout}
        >
          <span>
            ⇥
          </span>

          Logout
        </button>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="provider-profile-main">

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="profile-hero">

          <div className="profile-hero-overlay"></div>

          <div className="profile-hero-content">

            <p>
              PROVIDER PROFILE
            </p>

            <h1>
              My Profile
            </h1>

            <span>
              Manage your personal and service information.
            </span>

          </div>

        </section>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (

          <div className="profile-success-message">

            <span>
              ✓
            </span>

            {message}

          </div>

        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {errorMessage && (

          <div
            style={{
              margin: "20px auto",
              maxWidth: "1100px",
              padding: "14px 18px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontWeight: "600",
            }}
          >

            <span>
              ✕
            </span>

            {" "}

            {errorMessage}

          </div>

        )}

        {/* =================================================
            PROFILE LAYOUT
        ================================================= */}

        <div className="profile-layout">

          {/* =================================================
              LEFT PROFILE CARD
          ================================================= */}

          <section className="profile-left-card">

            <div className="profile-photo-wrapper">

              {profileImage ? (

                <img
                  src={profileImage}
                  alt="Provider Profile"
                  className="provider-profile-image"
                />

              ) : (

                <div
                  className="provider-profile-image"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "60px",
                    background: "#f3f4f6",
                  }}
                >
                  👤
                </div>

              )}

              <button
                type="button"
                className="profile-camera-button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                📷
              </button>

            </div>

            <h2>
              {fullName ||
                "Provider"}
            </h2>

            <p className="profile-work">
              {work ||
                "Service Provider"}
            </p>

            <p className="profile-location">
              📍{" "}
              {village ||
                "Village"}

              {district
                ? `, ${district}`
                : ""}
            </p>

            <div className="profile-rating">

              <span>
                ⭐
              </span>

              <strong>
                4.7
              </strong>

              <small>
                Provider Rating
              </small>

            </div>

            <div className="profile-divider"></div>

            <div className="profile-summary">

              <div>

                <span>
                  Experience
                </span>

                <strong>
                  {experience ||
                    "Not specified"}
                </strong>

              </div>

              <div>

                <span>
                  Service
                </span>

                <strong>
                  {work ||
                    "Not specified"}
                </strong>

              </div>

              <div>

                <span>
                  Starting Price
                </span>

                <strong>
                  {price ||
                    "Contact Provider"}
                </strong>

              </div>

            </div>

            <div
              className={
                availability
                  ? "profile-available"
                  : "profile-unavailable"
              }
            >

              <span></span>

              {availability
                ? "Available for Service"
                : "Currently Unavailable"}

            </div>

            {/* HIDDEN IMAGE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                display: "none",
              }}
            />

            <button
              type="button"
              className="change-photo-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              📷 Change Profile Photo
            </button>

          </section>

          {/* =================================================
              RIGHT FORM
          ================================================= */}

          <section className="profile-form-card">

            <div className="profile-form-header">

              <div>

                <p>
                  PROFILE INFORMATION
                </p>

                <h2>
                  Personal Information
                </h2>

                <span>
                  Keep your information up to date.
                </span>

              </div>

            </div>

            <form
              onSubmit={handleSave}
            >

              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <div className="profile-section-title">

                <span>
                  👤
                </span>

                <div>

                  <h3>
                    Personal Details
                  </h3>

                  <p>
                    Your basic contact information
                  </p>

                </div>

              </div>

              <div className="profile-form-grid">

                {/* FULL NAME */}

                <div className="profile-form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    placeholder="Enter full name"
                    required
                  />

                </div>

                {/* MOBILE */}

                <div className="profile-form-group">

                  <label>
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(
                        e.target.value
                      )
                    }
                    placeholder="Enter mobile number"
                    maxLength="13"
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="profile-form-group full-width">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="Enter email"
                    required
                  />

                </div>

              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}

              <div className="profile-section-title">

                <span>
                  📍
                </span>

                <div>

                  <h3>
                    Location
                  </h3>

                  <p>
                    Where you provide your services
                  </p>

                </div>

              </div>

              <div className="profile-form-grid">

                {/* VILLAGE */}

                <div className="profile-form-group">

                  <label>
                    Village
                  </label>

                  <input
                    type="text"
                    value={village}
                    onChange={(e) =>
                      setVillage(
                        e.target.value
                      )
                    }
                    placeholder="Enter village"
                    required
                  />

                </div>

                {/* DISTRICT */}

                <div className="profile-form-group">

                  <label>
                    District
                  </label>

                  <input
                    type="text"
                    value={district}
                    onChange={(e) =>
                      setDistrict(
                        e.target.value
                      )
                    }
                    placeholder="Enter district"
                    required
                  />

                </div>

              </div>

              {/* =================================================
                  SERVICE INFORMATION
              ================================================= */}

              <div className="profile-section-title">

                <span>
                  🔧
                </span>

                <div>

                  <h3>
                    Service Information
                  </h3>

                  <p>
                    Information about your work
                  </p>

                </div>

              </div>

              <div className="profile-form-grid">

                {/* SERVICE */}

                <div className="profile-form-group">

                  <label>
                    Work / Service
                  </label>

                  <input
                    type="text"
                    value={work}
                    onChange={(e) =>
                      setWork(
                        e.target.value
                      )
                    }
                    placeholder="Example: Tractor Driver"
                    required
                  />

                </div>

                {/* EXPERIENCE */}

                <div className="profile-form-group">

                  <label>
                    Experience
                  </label>

                  <input
                    type="text"
                    value={experience}
                    onChange={(e) =>
                      setExperience(
                        e.target.value
                      )
                    }
                    placeholder="Example: 8 Years"
                    required
                  />

                </div>

                {/* PRICE */}

                <div className="profile-form-group">

                  <label>
                    Starting Price
                  </label>

                  <input
                    type="text"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    placeholder="Example: ₹800 / hour"
                    required
                  />

                </div>

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="profile-form-group profile-description-group">

                <label>
                  Service Description
                </label>

                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe your service..."
                ></textarea>

              </div>

              {/* =================================================
                  AVAILABILITY
              ================================================= */}

              <div className="availability-setting">

                <div>

                  <h3>
                    Service Availability
                  </h3>

                  <p>
                    Let customers know whether you
                    are currently available.
                  </p>

                </div>

                <button
                  type="button"
                  className={
                    availability
                      ? "availability-toggle active"
                      : "availability-toggle"
                  }
                  onClick={() =>
                    setAvailability(
                      !availability
                    )
                  }
                >

                  <span></span>

                  {availability
                    ? "Available"
                    : "Unavailable"}

                </button>

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="profile-form-buttons">

                <Link
                  to="/provider/dashboard"
                  className="profile-cancel-button"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      ⏳ Saving...
                    </>
                  ) : (
                    <>
                      ✓ Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}

export default ProviderProfile;