import React, {
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./AddServices.css";

// =========================================================
// API BASE URL
// =========================================================
const API_BASE_URL = "https://gramacare4.onrender.com";

// =========================================================
// COMPONENT
// =========================================================

function AddServices() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // =======================================================
  // FORM STATES
  // =======================================================

  const [serviceImage, setServiceImage] = useState("");

  const [serviceName, setServiceName] = useState("");

  const [village, setVillage] = useState("");

  const [district, setDistrict] = useState("");

  const [experience, setExperience] = useState("");

  const [price, setPrice] = useState("");

  const [description, setDescription] = useState("");

  const [availability, setAvailability] = useState(true);

  // =======================================================
  // MESSAGE STATES
  // =======================================================

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  // =======================================================
  // GET LOGGED-IN PROVIDER ID
  // =======================================================

  const getProviderId = () => {
    const savedProviderId =
      localStorage.getItem("loggedInUserId");

    if (savedProviderId) {
      return savedProviderId;
    }

    const savedUser =
      localStorage.getItem("loggedInUser");

    if (savedUser) {
      try {
        const user =
          JSON.parse(savedUser);

        return (
          user.id ||
          user.userId ||
          user.providerId ||
          null
        );
      } catch (parseError) {
        console.error(
          "Unable to read loggedInUser:",
          parseError
        );
      }
    }

    return null;
  };

  // =======================================================
  // CREATE FULL LOCATION
  // =======================================================

  const getFullLocation = () => {
    const villageName =
      village.trim();

    const districtName =
      district.trim();

    return [
      villageName,
      districtName,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // =======================================================
  // GET CATEGORY
  // =======================================================

  const getCategory = () => {
    const name =
      serviceName
        .trim()
        .toLowerCase();

    // -----------------------------------------------------
    // AGRICULTURE
    // -----------------------------------------------------

    if (
      name.includes("tractor") ||
      name.includes("agriculture") ||
      name.includes("farmer") ||
      name.includes("harvest") ||
      name.includes("plough") ||
      name.includes("plow")
    ) {
      return "Agriculture";
    }

    // -----------------------------------------------------
    // WATER & PLUMBING
    // -----------------------------------------------------

    if (
      name.includes("plumber") ||
      name.includes("water pump") ||
      name.includes("pump") ||
      name.includes("water")
    ) {
      return "Water & Plumbing";
    }

    // -----------------------------------------------------
    // ELECTRICAL
    // -----------------------------------------------------

    if (
      name.includes("electric") ||
      name.includes("electrical")
    ) {
      return "Electrical";
    }

    // -----------------------------------------------------
    // CARPENTRY
    // -----------------------------------------------------

    if (
      name.includes("carpenter") ||
      name.includes("wood")
    ) {
      return "Carpentry";
    }

    // -----------------------------------------------------
    // REPAIR
    // -----------------------------------------------------

    if (
      name.includes("mechanic") ||
      name.includes("repair")
    ) {
      return "Repair & Maintenance";
    }

    // -----------------------------------------------------
    // TRANSPORT
    // -----------------------------------------------------

    if (
      name.includes("driver") ||
      name.includes("transport")
    ) {
      return "Transport";
    }

    // -----------------------------------------------------
    // OTHER
    // -----------------------------------------------------

    return "Other";
  };

  // =======================================================
  // GET PRICE NUMBER
  // =======================================================

  const getPriceNumber = () => {
    const numericPrice =
      price.replace(
        /[^0-9.]/g,
        ""
      );

    return Number(
      numericPrice
    );
  };

  // =======================================================
  // IMAGE CHANGE
  // =======================================================

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // -----------------------------------------------------
    // IMAGE TYPE
    // -----------------------------------------------------

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select a valid image."
      );

      return;
    }

    // -----------------------------------------------------
    // IMAGE SIZE
    // -----------------------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Please select an image smaller than 5 MB."
      );

      return;
    }

    // -----------------------------------------------------
    // READ IMAGE
    // -----------------------------------------------------

    const reader =
      new FileReader();

    reader.onload = () => {
      setServiceImage(
        reader.result
      );
    };

    reader.onerror = () => {
      alert(
        "Unable to read selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  // =======================================================
  // REMOVE IMAGE
  // =======================================================

  const removeImage = () => {
    setServiceImage("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  // =======================================================
  // SAVE SERVICE
  // =======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // =====================================================
    // SERVICE NAME VALIDATION
    // =====================================================

    if (
      !serviceName.trim()
    ) {
      alert(
        "Please enter your work or service."
      );

      return;
    }

    // =====================================================
    // EXPERIENCE VALIDATION
    // =====================================================

    if (
      !experience.trim()
    ) {
      alert(
        "Please enter your experience."
      );

      return;
    }

    // =====================================================
    // PRICE VALIDATION
    // =====================================================

    if (!price.trim()) {
      alert(
        "Please enter starting price."
      );

      return;
    }

    // =====================================================
    // VILLAGE VALIDATION
    // =====================================================

    if (!village.trim()) {
      alert(
        "Please enter your village."
      );

      return;
    }

    // =====================================================
    // DISTRICT VALIDATION
    // =====================================================

    if (!district.trim()) {
      alert(
        "Please enter your district."
      );

      return;
    }

    // =====================================================
    // DESCRIPTION VALIDATION
    // =====================================================

    if (
      !description.trim()
    ) {
      alert(
        "Please enter service description."
      );

      return;
    }

    // =====================================================
    // PROVIDER ID
    // =====================================================

    const providerId =
      getProviderId();

    if (!providerId) {
      setError(
        "Provider ID not found. Please login again."
      );

      return;
    }

    // =====================================================
    // PRICE NUMBER
    // =====================================================

    const numericPrice =
      getPriceNumber();

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice <= 0
    ) {
      alert(
        "Please enter a valid price. Example: ₹800 / hour"
      );

      return;
    }

    // =====================================================
    // LOCATION
    // =====================================================

    const location =
      getFullLocation();

    if (!location) {
      setError(
        "Village and district are required."
      );

      return;
    }

    // =====================================================
    // CATEGORY
    // =====================================================

    const category =
      getCategory();

    // =====================================================
    // SERVICE DATA
    // =====================================================
    //
    // IMPORTANT:
    //
    // NO PROVIDER GPS HERE.
    //
    // Backend will convert:
    //
    // Village + District
    //
    // into:
    //
    // Latitude + Longitude
    //
    // =====================================================

    const serviceData = {
      name:
        serviceName.trim(),

      description:
        description.trim(),

      price:
        numericPrice,

      category:
        category,

      location:
        location,

      available:
        availability,
    };

    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
      "======================================"
    );

    console.log(
      "Creating service..."
    );

    console.log(
      "Service Data:",
      serviceData
    );

    console.log(
      "Provider ID:",
      providerId
    );

    console.log(
      "Service Location:",
      location
    );

    console.log(
      "======================================"
    );

    try {
      // ---------------------------------------------------
      // START SAVING
      // ---------------------------------------------------

      setSaving(true);

      // ---------------------------------------------------
      // API REQUEST
      // ---------------------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/api/services/provider/${providerId}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                serviceData
              ),
          }
        );

      // ===================================================
      // READ RESPONSE
      // ===================================================

      let responseData =
        null;

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        responseData =
          await response.json();
      } else {
        responseData =
          await response.text();
      }

      // ===================================================
      // BACKEND ERROR
      // ===================================================

      if (!response.ok) {
        console.error(
          "Backend error:",
          responseData
        );

        let backendMessage =
          `Failed to add service. Status: ${response.status}`;

        if (
          typeof responseData ===
          "string"
        ) {
          backendMessage =
            responseData;
        }

        if (
          typeof responseData ===
            "object" &&
          responseData !== null
        ) {
          backendMessage =
            responseData.message ||
            responseData.error ||
            responseData.detail ||
            backendMessage;
        }

        throw new Error(
          backendMessage
        );
      }

      // ===================================================
      // SUCCESS
      // ===================================================

      console.log(
        "Service created successfully:"
      );

      console.log(
        responseData
      );

      setMessage(
        "Service added successfully!"
      );

      // ===================================================
      // CLEAR FORM
      // ===================================================

      setServiceName("");

      setVillage("");

      setDistrict("");

      setExperience("");

      setPrice("");

      setDescription("");

      setAvailability(true);

      setServiceImage("");

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      // ===================================================
      // NAVIGATE
      // ===================================================

      setTimeout(() => {
        navigate(
          "/provider/services"
        );
      }, 1000);

    } catch (submitError) {
      console.error(
        "Add service error:",
        submitError
      );

      setError(
        submitError.message ||
          "Unable to add service to backend."
      );

    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // LOGOUT
  // =======================================================

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
      "userEmail"
    );

    localStorage.removeItem(
      "userRole"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "rememberMe"
    );

    localStorage.removeItem(
      "loginType"
    );

    navigate("/login");
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="add-service-page">

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
            className="provider-nav-item active"
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
            className="provider-nav-item"
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

      <main className="add-service-main">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="add-service-hero">

          <div className="add-service-hero-content">

            <p>
              PROVIDER SERVICES
            </p>

            <h1>
              Add New Service
            </h1>

            <span>
              Tell customers about the service
              you provide in your village.
            </span>

          </div>

        </section>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="add-service-success">

            <span>
              ✓
            </span>

            {message}

          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div
            className="add-service-error"
            style={{
              margin:
                "20px auto",

              maxWidth:
                "1000px",

              padding:
                "14px 18px",

              borderRadius:
                "10px",

              background:
                "#fee2e2",

              color:
                "#b91c1c",

              border:
                "1px solid #fecaca",

              fontWeight:
                "600",
            }}
          >

            <span>
              ⚠️
            </span>{" "}

            {error}

          </div>
        )}

        {/* =================================================
            FORM CONTAINER
        ================================================= */}

        <section className="add-service-container">

          <div className="add-service-form-card">

            {/* HEADER */}

            <div className="add-service-form-header">

              <div>

                <p>
                  SERVICE INFORMATION
                </p>

                <h2>
                  Add Your Service
                </h2>

                <span>
                  Provide accurate information so
                  customers can find and contact you.
                </span>

              </div>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              {/* =================================================
                  SERVICE IMAGE
              ================================================= */}

              <div className="add-service-section-title">

                <span>
                  📷
                </span>

                <div>

                  <h3>
                    Service Image
                  </h3>

                  <p>
                    Add a photo related to your service
                  </p>

                </div>

              </div>

              <div className="service-image-upload">

                {serviceImage ? (

                  <div className="service-image-preview">

                    <img
                      src={
                        serviceImage
                      }
                      alt="Service Preview"
                    />

                    <button
                      type="button"
                      onClick={
                        removeImage
                      }
                      className="remove-service-image"
                    >
                      ×
                    </button>

                  </div>

                ) : (

                  <button
                    type="button"
                    className="service-image-box"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >

                    <div className="upload-icon">
                      📷
                    </div>

                    <h3>
                      Upload Service Image
                    </h3>

                    <p>
                      Click to choose an image
                    </p>

                    <small>
                      JPG, PNG or WEBP
                    </small>

                  </button>

                )}

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  style={{
                    display:
                      "none",
                  }}
                />

              </div>

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <div className="add-service-section-title">

                <span>
                  🔧
                </span>

                <div>

                  <h3>
                    Basic Information
                  </h3>

                  <p>
                    Tell us about the service you provide
                  </p>

                </div>

              </div>

              <div className="add-service-form-grid">

                {/* SERVICE NAME */}

                <div className="add-service-form-group full-width">

                  <label>

                    Work / Service Name

                    <span>
                      *
                    </span>

                  </label>

                  <input
                    type="text"
                    value={
                      serviceName
                    }
                    onChange={(
                      event
                    ) =>
                      setServiceName(
                        event.target
                          .value
                      )
                    }
                    placeholder="Example: Tractor Driver, Plumber, Electrician"
                    required
                  />

                  <small>
                    You can enter any type of work or service.
                  </small>

                </div>

                {/* EXPERIENCE */}

                <div className="add-service-form-group">

                  <label>

                    Experience

                    <span>
                      *
                    </span>

                  </label>

                  <input
                    type="text"
                    value={
                      experience
                    }
                    onChange={(
                      event
                    ) =>
                      setExperience(
                        event.target
                          .value
                      )
                    }
                    placeholder="Example: 5 Years"
                    required
                  />

                </div>

                {/* PRICE */}

                <div className="add-service-form-group">

                  <label>

                    Starting Price

                    <span>
                      *
                    </span>

                  </label>

                  <input
                    type="text"
                    value={price}
                    onChange={(
                      event
                    ) =>
                      setPrice(
                        event.target
                          .value
                      )
                    }
                    placeholder="Example: ₹500 / hour"
                    required
                  />

                  <small>
                    Example: ₹800 / hour
                  </small>

                </div>

              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}

              <div className="add-service-section-title">

                <span>
                  📍
                </span>

                <div>

                  <h3>
                    Service Location
                  </h3>

                  <p>
                    Enter the village where you provide this service.
                  </p>

                </div>

              </div>

              <div className="add-service-form-grid">

                {/* VILLAGE */}

                <div className="add-service-form-group">

                  <label>

                    Village

                    <span>
                      *
                    </span>

                  </label>

                  <input
                    type="text"
                    value={village}
                    onChange={(
                      event
                    ) =>
                      setVillage(
                        event.target
                          .value
                      )
                    }
                    placeholder="Example: Kaviti"
                    required
                  />

                  <small>
                    Enter the service village.
                  </small>

                </div>

                {/* DISTRICT */}

                <div className="add-service-form-group">

                  <label>

                    District

                    <span>
                      *
                    </span>

                  </label>

                  <input
                    type="text"
                    value={
                      district
                    }
                    onChange={(
                      event
                    ) =>
                      setDistrict(
                        event.target
                          .value
                      )
                    }
                    placeholder="Example: Srikakulam"
                    required
                  />

                  <small>
                    Enter the district name.
                  </small>

                </div>

              </div>

              {/* =================================================
                  LOCATION PREVIEW
              ================================================= */}

              <div
                style={{
                  marginTop:
                    "20px",

                  padding:
                    "16px",

                  borderRadius:
                    "12px",

                  background:
                    "#eef2ff",

                  border:
                    "1px solid #c7d2fe",
                }}
              >

                <h4
                  style={{
                    margin:
                      "0 0 8px",

                    color:
                      "#312e81",
                  }}
                >
                  📍 Service Location
                </h4>

                <p
                  style={{
                    margin: 0,

                    fontSize:
                      "14px",

                    color:
                      "#4b5563",

                    lineHeight:
                      "1.6",
                  }}
                >
                  The village and district you
                  enter will be used to find the
                  actual service location. Your
                  current phone GPS will not be
                  used for this service location.
                </p>

                {village.trim() &&
                  district.trim() && (
                    <div
                      style={{
                        marginTop:
                          "10px",

                        fontSize:
                          "14px",

                        fontWeight:
                          "700",

                        color:
                          "#312e81",
                      }}
                    >
                      📌{" "}
                      {getFullLocation()}
                    </div>
                  )}

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="add-service-section-title">

                <span>
                  📝
                </span>

                <div>

                  <h3>
                    Service Description
                  </h3>

                  <p>
                    Explain what kind of service you provide
                  </p>

                </div>

              </div>

              <div className="add-service-form-group">

                <label>

                  Description

                  <span>
                    *
                  </span>

                </label>

                <textarea
                  rows="6"
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  placeholder="Example: I provide tractor services for land ploughing, soil preparation and agricultural work."
                  required
                />

                <small>
                  Give customers useful information
                  about your service.
                </small>

              </div>

              {/* =================================================
                  AVAILABILITY
              ================================================= */}

              <div className="add-service-availability">

                <div>

                  <h3>
                    Service Availability
                  </h3>

                  <p>
                    Let customers know if you are
                    currently accepting service requests.
                  </p>

                </div>

                <button
                  type="button"
                  className={
                    availability
                      ? "add-service-toggle active"
                      : "add-service-toggle"
                  }
                  onClick={() =>
                    setAvailability(
                      !availability
                    )
                  }
                >

                  <span>
                  </span>

                  {availability
                    ? "Available"
                    : "Unavailable"}

                </button>

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="add-service-buttons">

                <Link
                  to="/provider/services"
                  className="add-service-cancel"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="add-service-save"
                  disabled={
                    saving
                  }
                >

                  <span>
                    {saving
                      ? "⏳"
                      : "✓"}
                  </span>

                  {saving
                    ? "Saving..."
                    : "Save Service"}

                </button>

              </div>

            </form>

          </div>

        </section>

      </main>

    </div>
  );
}

// =========================================================
// EXPORT
// =========================================================

export default AddServices;