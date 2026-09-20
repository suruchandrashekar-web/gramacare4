import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProviderDashBoard.css";

function ProviderDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState([]);

  const [currentUser, setCurrentUser] = useState({
    name: "Provider",
    email: "",
    mobile: "",
    village: "",
    district: "",
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    // Load providers
    const savedProviders =
      JSON.parse(localStorage.getItem("palleconnect_providers")) || [];

    setProviders(savedProviders);

    // Load current user
    const savedUser = JSON.parse(
      localStorage.getItem("palleconnect_current_user")
    );

    if (savedUser) {
      setCurrentUser({
        name: savedUser.name || savedUser.fullName || "Provider",
        email: savedUser.email || "",
        mobile: savedUser.mobile || savedUser.phone || "",
        village: savedUser.village || "",
        district: savedUser.district || "",
      });
    }
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("palleconnect_current_user");
    navigate("/login");
  };

  // =====================================================
  // SEARCH PROVIDERS
  // =====================================================

  const keyword = search.toLowerCase().trim();

  const filteredProviders = providers.filter((provider) => {
    if (!keyword) {
      return false;
    }

    return (
      provider.name?.toLowerCase().includes(keyword) ||
      provider.work?.toLowerCase().includes(keyword) ||
      provider.village?.toLowerCase().includes(keyword) ||
      provider.district?.toLowerCase().includes(keyword)
    );
  });

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="provider-dashboard">

      {/* ==================================================
          NAVBAR
      ================================================== */}

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
            <h2>GramaCare</h2>
            <span>Village Services</span>
          </div>
        </Link>


        {/* NAVIGATION */}

        <div className="provider-nav">

          <Link
            to="/provider/dashboard"
            className="provider-nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </Link>


          <Link
            to="/provider/services"
            className="provider-nav-item"
          >
            <span>🔧</span>
            My Services
          </Link>


          <Link
            to="/provider/requests"
            className="provider-nav-item"
          >
            <span>✉</span>
            Requests
          </Link>


          <Link
            to="/provider/profile"
            className="provider-nav-item"
          >
            <span>👤</span>
            Profile
          </Link>

        </div>


        {/* LOGOUT */}

        <button
          className="provider-logout"
          onClick={logout}
        >
          <span>⇥</span>
          Logout
        </button>

      </nav>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="provider-main">


        {/* ==================================================
            WELCOME BANNER
        ================================================== */}

        <section className="welcome-banner">

          <div className="welcome-content">

            <p className="welcome-label">
              GRAMACARE VILLAGE SERVICES
            </p>

            <h1>
              Welcome, {currentUser.name} 👋
            </h1>

            <p>
              Find services when you need them and manage
              the services you provide.
            </p>

          </div>


          <Link
            to="/provider/services/add"
            className="welcome-add-button"
          >
            <span>+</span>
            Add Service
          </Link>

        </section>


        {/* ==================================================
            SEARCH SERVICE
        ================================================== */}

        <section className="service-search-section">

          <div className="service-search-heading">

            <p className="card-label">
              FIND A SERVICE
            </p>

            <h2>
              What service do you need?
            </h2>

            <p>
              Search for a nearby service provider without
              leaving your dashboard.
            </p>

          </div>


          <div className="service-search-box">

            <span className="service-search-icon">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Plumber, Tractor Driver, Electrician..."
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}

            <button className="service-search-button">
              Search
            </button>

          </div>


          {/* ==================================================
              SEARCH RESULTS
          ================================================== */}

          {search.trim() && (
            <div className="search-results-section">

              <div className="search-results-header">

                <div>
                  <p className="card-label">
                    SEARCH RESULTS
                  </p>

                  <h2>
                    {filteredProviders.length} service
                    {filteredProviders.length !== 1 ? "s" : ""} found
                  </h2>
                </div>

              </div>


              {filteredProviders.length === 0 ? (

                <div className="no-search-results">

                  <div className="no-result-icon">
                    🔍
                  </div>

                  <h3>
                    Service Not Found
                  </h3>

                  <p>
                    We could not find a provider for
                    "{search}".
                  </p>

                  <span>
                    Try searching Plumber, Electrician,
                    Tractor Driver, Gas Repair, etc.
                  </span>

                </div>

              ) : (

                <div className="search-provider-grid">

                  {filteredProviders.map((provider) => (

                    <div
                      className="search-provider-card"
                      key={provider.id}
                    >

                      {/* IMAGE */}

                      <div className="search-provider-image">

                        {provider.image ? (

                          <img
                            src={provider.image}
                            alt={provider.name || "Provider"}
                          />

                        ) : (

                          <div className="search-provider-placeholder">
                            👤
                          </div>

                        )}

                        {provider.availability !== false && (
                          <span className="search-available-badge">
                            ● Available
                          </span>
                        )}

                      </div>


                      {/* DETAILS */}

                      <div className="search-provider-content">

                        <div className="search-provider-top">

                          <div>

                            <h3>
                              {provider.name || "Provider"}
                            </h3>

                            <p>
                              🔧 {provider.work || "Service"}
                            </p>

                          </div>

                          <div className="search-provider-rating">
                            ⭐ {provider.rating || "New"}
                          </div>

                        </div>


                        <div className="search-provider-location">
                          📍{" "}
                          {provider.village || "Village"}
                          {provider.district
                            ? `, ${provider.district}`
                            : ""}
                        </div>


                        <div className="search-provider-info">

                          <div>
                            <span>
                              Experience
                            </span>

                            <strong>
                              {provider.experience ||
                                "Not specified"}
                            </strong>
                          </div>


                          <div>
                            <span>
                              Starting Price
                            </span>

                            <strong>
                              {provider.price ||
                                "Contact provider"}
                            </strong>
                          </div>

                        </div>


                        <div className="search-provider-actions">

                          <a
                            href={`tel:${
                              provider.mobile ||
                              provider.phone ||
                              ""
                            }`}
                            className="search-call-button"
                          >
                            📞 Call
                          </a>


                          <button
                            className="search-contact-button"
                            onClick={() => {
                              if (
                                provider.mobile ||
                                provider.phone
                              ) {
                                window.location.href = `tel:${
                                  provider.mobile ||
                                  provider.phone
                                }`;
                              }
                            }}
                          >
                            Contact Provider
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>
          )}

        </section>


        {/* ==================================================
            STATISTICS
        ================================================== */}

        <section className="statistics-grid">

          <div className="statistics-card green-card">

            <div className="statistics-icon green-icon">
              🔧
            </div>

            <div className="statistics-info">
              <p>Total Services</p>
              <h2>1</h2>
              <span>Active services</span>
            </div>

          </div>


          <div className="statistics-card orange-card">

            <div className="statistics-icon orange-icon">
              ✉
            </div>

            <div className="statistics-info">
              <p>Pending Requests</p>
              <h2>0</h2>
              <span>Need your attention</span>
            </div>

          </div>


          <div className="statistics-card blue-card">

            <div className="statistics-icon blue-icon">
              ✓
            </div>

            <div className="statistics-info">
              <p>Completed Jobs</p>
              <h2>0</h2>
              <span>Successful jobs</span>
            </div>

          </div>


          <div className="statistics-card purple-card">

            <div className="statistics-icon purple-icon">
              ★
            </div>

            <div className="statistics-info">
              <p>Rating</p>
              <h2>4.7</h2>
              <span>From customers</span>
            </div>

          </div>

        </section>


        {/* ==================================================
            PROFILE + AVAILABILITY
        ================================================== */}

        <section className="main-cards-grid">

          {/* PROFILE */}

          <div className="dashboard-card">

            <div className="dashboard-card-header">

              <div>
                <p className="card-label">
                  YOUR PROFILE
                </p>

                <h2>
                  Provider Information
                </h2>
              </div>


              <Link
                to="/provider/profile"
                className="edit-profile"
              >
                ✎ Edit
              </Link>

            </div>


            <div className="provider-information">

              <div className="provider-image">

                <div className="profile-placeholder">
                  👤
                </div>

              </div>


              <div className="provider-details">

                <h3>
                  {currentUser.name}
                </h3>

                <p>
                  <span>🔧</span>
                  Service Provider
                </p>

                <p>
                  <span>📍</span>
                  {currentUser.village || "Village"}
                  {currentUser.district
                    ? `, ${currentUser.district}`
                    : ""}
                </p>

                <p>
                  <span>📞</span>
                  {currentUser.mobile || "Mobile not added"}
                </p>

              </div>

            </div>

          </div>


          {/* AVAILABILITY */}

          <div className="dashboard-card">

            <div className="dashboard-card-header">

              <div>
                <p className="card-label">
                  SERVICE STATUS
                </p>

                <h2>
                  Availability
                </h2>
              </div>

            </div>


            <div className="available-box">

              <div className="available-dot"></div>

              <div>

                <h3>
                  Available
                </h3>

                <p>
                  You are currently available for
                  service requests.
                </p>

              </div>

            </div>


            <div className="service-information">

              <div>
                <span>Service</span>
                <strong>
                  Your Active Service
                </strong>
              </div>


              <div>
                <span>Experience</span>
                <strong>
                  Not specified
                </strong>
              </div>


              <div>
                <span>Starting Price</span>
                <strong>
                  Contact for price
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <section className="quick-actions">

          <div className="quick-heading">

            <p className="card-label">
              MANAGE YOUR WORK
            </p>

            <h2>
              Quick Actions
            </h2>

            <p>
              Find services and manage your own services
              from one dashboard.
            </p>

          </div>


          <div className="quick-actions-grid">

            {/* ADD SERVICE */}

            <Link
              to="/provider/services/add"
              className="quick-action-card"
            >

              <div className="quick-action-icon green-quick">
                +
              </div>

              <div className="quick-action-content">

                <h3>
                  Add Service
                </h3>

                <p>
                  Add a new service that you want to
                  provide.
                </p>

                <span>
                  Add service →
                </span>

              </div>

            </Link>


            {/* MY SERVICES */}

            <Link
              to="/provider/services"
              className="quick-action-card"
            >

              <div className="quick-action-icon blue-quick">
                🔧
              </div>

              <div className="quick-action-content">

                <h3>
                  My Services
                </h3>

                <p>
                  View and manage all your village
                  services.
                </p>

                <span>
                  View services →
                </span>

              </div>

            </Link>


            {/* REQUESTS */}

            <Link
              to="/provider/requests"
              className="quick-action-card"
            >

              <div className="quick-action-icon orange-quick">
                ✉
              </div>

              <div className="quick-action-content">

                <h3>
                  Service Requests
                </h3>

                <p>
                  Check service requests from customers.
                </p>

                <span>
                  View requests →
                </span>

              </div>

            </Link>


            {/* PROFILE */}

            <Link
              to="/provider/profile"
              className="quick-action-card"
            >

              <div className="quick-action-icon purple-quick">
                👤
              </div>

              <div className="quick-action-content">

                <h3>
                  My Profile
                </h3>

                <p>
                  Update your personal and contact
                  information.
                </p>

                <span>
                  View profile →
                </span>

              </div>

            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ProviderDashboard;