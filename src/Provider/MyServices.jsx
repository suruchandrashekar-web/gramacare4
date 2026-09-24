import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyServices.css";

const API_BASE_URL = "https://gramacare4.onrender.com";

function MyServices() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [servicesData, setServicesData] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Services");
  const [status, setStatus] = useState("All Status");
  const [sort, setSort] = useState("Newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const loggedInUserId =
    localStorage.getItem("loggedInUserId");

  const loggedInUserString =
    localStorage.getItem("loggedInUser");

  let loggedInUser = {};

  try {
    loggedInUser = loggedInUserString
      ? JSON.parse(loggedInUserString)
      : {};
  } catch (err) {
    loggedInUser = {};
  }

  // =====================================================
  // CLEAR LOGIN DATA
  // =====================================================

  const clearLoginData = () => {
    localStorage.removeItem("palleconnect_current_user");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("blocked");
  };

  // =====================================================
  // BLOCKED ACCOUNT HANDLER
  // =====================================================

  const handleBlockedAccount = () => {
    clearLoginData();

    alert(
      "Your account has been blocked by the administrator. You cannot use this service."
    );

    navigate("/login", { replace: true });
  };

  // =====================================================
  // CHECK ACCOUNT STATUS FROM BACKEND
  // =====================================================

  const checkAccountStatus = async () => {
    if (!loggedInUserId) {
      clearLoginData();
      navigate("/login", { replace: true });
      return false;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${loggedInUserId}`
      );

      if (!response.ok) {
        throw new Error(
          `Account status check failed: ${response.status}`
        );
      }

      const user = await response.json();

      console.log("CURRENT ACCOUNT STATUS:", user);

      // =================================================
      // IMPORTANT:
      // BACKEND DATABASE STATUS IS FINAL
      // =================================================

      if (user.blocked === true) {
        handleBlockedAccount();
        return false;
      }

      // Keep localStorage status updated
      localStorage.setItem("blocked", "false");
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(user)
      );

      return true;

    } catch (err) {
      console.error(
        "ACCOUNT STATUS CHECK ERROR:",
        err
      );

      /*
       * Do not automatically logout for a temporary
       * network/server problem.
       */
      return true;
    }
  };

  // =====================================================
  // FETCH MY SERVICES
  // =====================================================

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      setError("");

      if (!loggedInUserId) {
        setError(
          "Provider login details not found. Please login again."
        );
        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // CHECK ACCOUNT BEFORE SERVICE API
      // -------------------------------------------------

      const accountActive =
        await checkAccountStatus();

      if (!accountActive) {
        return;
      }

      // -------------------------------------------------
      // GET PROVIDER SERVICES
      // -------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/api/services/provider/${loggedInUserId}`
      );

      // -------------------------------------------------
      // HANDLE BLOCK RESPONSE
      // -------------------------------------------------

      if (response.status === 403) {
        handleBlockedAccount();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "MY SERVICES FROM BACKEND:",
        data
      );

      const formattedServices =
        Array.isArray(data)
          ? data.map((service) => ({
              id: service.id,

              name:
                service.name ||
                service.serviceName ||
                service.work ||
                "Service",

              location:
                service.location ||
                service.village ||
                (
                  service.district
                    ? `${service.village || "Village"}, ${service.district}`
                    : "Village"
                ),

              rating:
                service.rating !== undefined &&
                service.rating !== null
                  ? service.rating
                  : 0,

              reviews:
                service.reviews !== undefined &&
                service.reviews !== null
                  ? service.reviews
                  : 0,

              experience:
                service.experience ||
                "Not specified",

              price:
                service.price ||
                service.startingPrice ||
                "Contact provider",

              description:
                service.description ||
                "Service details are not available.",

              available:
                service.available !== undefined
                  ? service.available
                  : service.availability !== undefined
                  ? service.availability
                  : true,

              image:
                service.image ||
                service.imageUrl ||
                "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80",

              icon:
                service.icon ||
                "🔧",

              iconClass:
                service.iconClass ||
                "service-green",

              category:
                service.category ||
                service.serviceName ||
                service.name ||
                service.work ||
                "Service",
            }))
          : [];

      setServicesData(formattedServices);

    } catch (err) {
      console.error(
        "FETCH SERVICES ERROR:",
        err
      );

      setError(
        "Unable to load services from backend."
      );

      setServicesData([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {
    fetchMyServices();
  }, []);

  // =====================================================
  // SEARCH + FILTER + SORT
  // =====================================================

  const services = useMemo(() => {
    let result = [...servicesData];

    // SEARCH
    if (search.trim() !== "") {
      const searchValue =
        search.toLowerCase().trim();

      result = result.filter((service) => {
        return (
          service.name
            ?.toLowerCase()
            .includes(searchValue) ||
          service.description
            ?.toLowerCase()
            .includes(searchValue) ||
          service.location
            ?.toLowerCase()
            .includes(searchValue)
        );
      });
    }

    // CATEGORY
    if (category !== "All Services") {
      result = result.filter(
        (service) =>
          service.name === category ||
          service.category === category
      );
    }

    // STATUS
    if (status === "Available") {
      result = result.filter(
        (service) =>
          service.available === true
      );
    }

    if (status === "Unavailable") {
      result = result.filter(
        (service) =>
          service.available === false
      );
    }

    // SORT
    if (sort === "Newest") {
      result.sort(
        (a, b) =>
          Number(b.id) - Number(a.id)
      );
    }

    if (sort === "Oldest") {
      result.sort(
        (a, b) =>
          Number(a.id) - Number(b.id)
      );
    }

    if (sort === "Rating") {
      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    return result;
  }, [
    servicesData,
    search,
    category,
    status,
    sort,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalServices =
    servicesData.length;

  const availableServices =
    servicesData.filter(
      (service) =>
        service.available === true
    ).length;

  const unavailableServices =
    servicesData.filter(
      (service) =>
        service.available === false
    ).length;

  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================

  const categoryOptions = useMemo(() => {
    const categories = servicesData
      .map(
        (service) =>
          service.name ||
          service.category
      )
      .filter(Boolean);

    return [...new Set(categories)];
  }, [servicesData]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    clearLoginData();
    navigate("/login");
  };

  // =====================================================
  // EDIT SERVICE
  // =====================================================

  const handleEdit = async (service) => {

    // Check latest account status
    const accountActive =
      await checkAccountStatus();

    if (!accountActive) {
      return;
    }

    localStorage.setItem(
      "editService",
      JSON.stringify(service)
    );

    navigate(
      `/provider/services/add?edit=${service.id}`
    );
  };

  // =====================================================
  // DELETE SERVICE
  // =====================================================

  const handleDelete = async (serviceId) => {

    if (
      serviceId === null ||
      serviceId === undefined ||
      serviceId === ""
    ) {
      alert("Invalid service ID.");
      return;
    }

    // Check latest account status
    const accountActive =
      await checkAccountStatus();

    if (!accountActive) {
      return;
    }

    const confirmDelete =
      window.confirm(
        "Are you sure you want to permanently delete this service?\n\nAll requests related to this service will also be deleted."
      );

    if (!confirmDelete) {
      return;
    }

    try {
      console.log(
        "DELETE SERVICE ID:",
        serviceId
      );

      const response = await fetch(
        `${API_BASE_URL}/api/services/${serviceId}`,
        {
          method: "DELETE",
        }
      );

      console.log(
        "DELETE RESPONSE STATUS:",
        response.status
      );

      // Blocked
      if (response.status === 403) {
        handleBlockedAccount();
        return;
      }

      if (!response.ok) {

        let serverMessage = "";

        try {
          serverMessage =
            await response.text();
        } catch (readError) {
          console.error(
            "DELETE RESPONSE READ ERROR:",
            readError
          );
        }

        throw new Error(
          serverMessage
            ? `Delete failed: ${response.status} - ${serverMessage}`
            : `Delete failed: ${response.status}`
        );
      }

      // Remove from UI only after backend success
      setServicesData(
        (previousServices) =>
          previousServices.filter(
            (service) =>
              Number(service.id) !==
              Number(serviceId)
          )
      );

      console.log(
        "SERVICE DELETED SUCCESSFULLY:",
        serviceId
      );

      alert(
        "Service permanently deleted successfully!"
      );

    } catch (err) {

      console.error(
        "DELETE SERVICE ERROR:",
        err
      );

      alert(
        `Unable to delete service.\n\n${err.message}`
      );
    }
  };

  // =====================================================
  // TOGGLE AVAILABILITY
  // =====================================================

  const handleAvailability = async (
    service
  ) => {

    // Check latest account status
    const accountActive =
      await checkAccountStatus();

    if (!accountActive) {
      return;
    }

    try {

      const newAvailability =
        !service.available;

      const response = await fetch(
        `${API_BASE_URL}/api/services/${service.id}/availability?available=${newAvailability}`,
        {
          method: "PATCH",
        }
      );

      // Blocked
      if (response.status === 403) {
        handleBlockedAccount();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Availability update failed: ${response.status}`
        );
      }

      setServicesData(
        (previousServices) =>
          previousServices.map(
            (item) =>
              Number(item.id) ===
              Number(service.id)
                ? {
                    ...item,
                    available:
                      newAvailability,
                  }
                : item
          )
      );

    } catch (err) {

      console.error(
        "AVAILABILITY ERROR:",
        err
      );

      alert(
        "Unable to update service availability."
      );
    }
  };

  // =====================================================
  // RETURN UI
  // =====================================================

  return (
    <div className="my-services-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="provider-navbar">

        <Link
          to="/provider/dashboard"
          className="provider-logo"
        >
          <div className="logo-symbol">
            🌱
          </div>

          <div className="logo-text">
            <h2>GramaCare</h2>

            <span>
              Village Services
            </span>
          </div>
        </Link>

        <div className="provider-nav">

          <Link
            to="/provider/dashboard"
            className="provider-nav-item"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/provider/services"
            className="provider-nav-item active"
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

        <button
          type="button"
          className="provider-logout"
          onClick={logout}
        >
          <span>⇥</span>
          Logout
        </button>

      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="my-services-main">

        {/* HERO */}

        <section className="my-services-hero">

          <div className="hero-overlay"></div>

          <div className="my-services-hero-content">

            <p className="my-services-label">
              MY SERVICES
            </p>

            <h1>
              My Services
            </h1>

            <p>
              Manage the services you provide
              in your village.
            </p>

          </div>

          <Link
            to="/provider/services/add"
            className="my-services-add-button"
            onClick={async (e) => {
              const accountActive =
                await checkAccountStatus();

              if (!accountActive) {
                e.preventDefault();
              }
            }}
          >
            <span>+</span>
            Add Service
          </Link>

        </section>

        {/* ERROR */}

        {error && (
          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#991b1b",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <section className="service-statistics">

          <div className="service-stat-card">

            <div className="stat-circle stat-green">
              🔧
            </div>

            <div className="stat-content">

              <p>
                Total Services
              </p>

              <h2>
                {loading
                  ? "..."
                  : totalServices}
              </h2>

            </div>

          </div>

          <div className="service-stat-card">

            <div className="stat-circle stat-green">
              ✓
            </div>

            <div className="stat-content">

              <p>
                Available
              </p>

              <h2>
                {loading
                  ? "..."
                  : availableServices}
              </h2>

            </div>

          </div>

          <div className="service-stat-card">

            <div className="stat-circle stat-red">
              −
            </div>

            <div className="stat-content">

              <p>
                Unavailable
              </p>

              <h2>
                {loading
                  ? "..."
                  : unavailableServices}
              </h2>

            </div>

          </div>

        </section>

        {/* FILTERS */}

        <section className="service-filters">

          <div className="service-search-box">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="service-filter-select"
          >

            <option>
              All Services
            </option>

            {categoryOptions.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}

          </select>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="service-filter-select"
          >

            <option>
              All Status
            </option>

            <option>
              Available
            </option>

            <option>
              Unavailable
            </option>

          </select>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="service-filter-select"
          >

            <option value="Newest">
              ⇅ Sort by: Newest
            </option>

            <option value="Oldest">
              ⇅ Sort by: Oldest
            </option>

            <option value="Rating">
              ★ Sort by: Rating
            </option>

          </select>

        </section>

        {/* SERVICES */}

        <section className="services-grid">

          {loading ? (

            <div className="no-services">

              <div className="no-services-icon">
                ⏳
              </div>

              <h2>
                Loading Services...
              </h2>

              <p>
                Please wait while we load
                your services.
              </p>

            </div>

          ) : services.length === 0 ? (

            <div className="no-services">

              <div className="no-services-icon">
                🔍
              </div>

              <h2>
                No Services Found
              </h2>

              <p>
                {servicesData.length === 0
                  ? "You have not added any services yet."
                  : "Try changing your search or filter."}
              </p>

              {servicesData.length === 0 && (
                <Link
                  to="/provider/services/add"
                  className="my-services-add-button"
                  style={{
                    display: "inline-flex",
                    marginTop: "15px",
                  }}
                  onClick={async (e) => {
                    const accountActive =
                      await checkAccountStatus();

                    if (!accountActive) {
                      e.preventDefault();
                    }
                  }}
                >
                  <span>+</span>
                  Add Your First Service
                </Link>
              )}

            </div>

          ) : (

            services.map(
              (service) => (

                <div
                  className="my-service-card"
                  key={service.id}
                >

                  {/* IMAGE */}

                  <div className="service-image-container">

                    <img
                      src={service.image}
                      alt={service.name}
                      className="service-card-image"
                    />

                    <div
                      className={
                        service.available
                          ? "availability-badge available"
                          : "availability-badge unavailable"
                      }
                    >

                      <span></span>

                      {service.available
                        ? "Available"
                        : "Unavailable"}

                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="service-card-content">

                    <div className="service-title-row">

                      <div
                        className={`service-round-icon ${service.iconClass}`}
                      >
                        {service.icon}
                      </div>

                      <div className="service-title">

                        <h2>
                          {service.name}
                        </h2>

                        <p>
                          📍 {service.location}
                        </p>

                      </div>

                      <div className="service-rating">

                        <strong>
                          ⭐{" "}
                          {service.rating ||
                            "New"}
                        </strong>

                        <span>
                          (
                          {service.reviews ||
                            0}
                          {" "}
                          reviews)
                        </span>

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="service-details">

                      <div className="service-detail-item">

                        <span className="detail-icon">
                          ◷
                        </span>

                        <div>

                          <small>
                            Experience
                          </small>

                          <strong>
                            {service.experience}
                          </strong>

                        </div>

                      </div>

                      <div className="service-detail-divider"></div>

                      <div className="service-detail-item">

                        <span className="detail-icon price-icon">
                          ₹
                        </span>

                        <div>

                          <small>
                            Starting Price
                          </small>

                          <strong>
                            {service.price}
                          </strong>

                        </div>

                      </div>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="service-description">
                      {service.description}
                    </p>

                    {/* BUTTONS */}

                    <div className="service-card-buttons">

                      {/* EDIT */}

                      <button
                        type="button"
                        className="edit-service-button"
                        onClick={() =>
                          handleEdit(service)
                        }
                      >
                        ✎

                        <span>
                          Edit Service
                        </span>
                      </button>

                      {/* AVAILABILITY */}

                      <button
                        type="button"
                        className="view-request-button"
                        onClick={() =>
                          handleAvailability(
                            service
                          )
                        }
                      >
                        {service.available
                          ? "−"
                          : "✓"}

                        <span>
                          {service.available
                            ? "Set Unavailable"
                            : "Set Available"}
                        </span>
                      </button>

                      {/* REQUESTS */}

                      <Link
                        to="/provider/requests"
                        className="view-request-button"
                        onClick={async (e) => {
                          const accountActive =
                            await checkAccountStatus();

                          if (!accountActive) {
                            e.preventDefault();
                          }
                        }}
                      >
                        👥

                        <span>
                          View Requests
                        </span>
                      </Link>

                      {/* DELETE */}

                      <button
                        type="button"
                        className="view-request-button"
                        onClick={() =>
                          handleDelete(
                            service.id
                          )
                        }
                        style={{
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        🗑️

                        <span>
                          Delete
                        </span>
                      </button>

                    </div>

                  </div>

                </div>

              )
            )

          )}

        </section>

      </main>

    </div>
  );
}

export default MyServices;