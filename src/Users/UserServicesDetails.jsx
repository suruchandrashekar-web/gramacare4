import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import "./UserServicesDetails.css";

function UserServiceDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [showRequestForm, setShowRequestForm] =
    useState(false);

  const [requestSent, setRequestSent] =
    useState(false);


  useEffect(() => {

    const savedProviders =
      JSON.parse(
        localStorage.getItem(
          "palleconnect_providers"
        )
      ) || [];


    const selectedProvider =
      savedProviders.find(
        (item) =>
          String(item.id) === String(id)
      );


    setProvider(selectedProvider);


    const user =
      JSON.parse(
        localStorage.getItem(
          "palleconnect_current_user"
        )
      );

    setCurrentUser(user);

  }, [id]);


  const logout = () => {

    localStorage.removeItem(
      "palleconnect_current_user"
    );

    navigate("/user");

  };


  const sendRequest = () => {

    if (!currentUser) {

      alert(
        "Please login first to send a request."
      );

      navigate("/user");

      return;
    }


    const existingRequests =
      JSON.parse(
        localStorage.getItem(
          "palleconnect_user_requests"
        )
      ) || [];


    const newRequest = {

      id: Date.now(),

      userId:
        currentUser.id || null,

      userName:
        currentUser.name ||
        currentUser.fullName ||
        "User",

      userEmail:
        currentUser.email || "",

      providerId:
        provider.id,

      providerName:
        provider.name || "Provider",

      work:
        provider.work || "Service",

      mobile:
        provider.mobile ||
        provider.phone ||
        "",

      village:
        provider.village || "",

      district:
        provider.district || "",

      message:
        message || "I need this service.",

      date:
        new Date().toLocaleDateString(),

      status:
        "Pending"
    };


    const updatedRequests = [
      ...existingRequests,
      newRequest
    ];


    localStorage.setItem(
      "palleconnect_user_requests",
      JSON.stringify(updatedRequests)
    );


    setRequestSent(true);

    setMessage("");

    setShowRequestForm(false);

  };


  if (!provider) {

    return (

      <div className="service-not-found">

        <div className="service-not-found-icon">
          🔍
        </div>

        <h2>
          Service Provider Not Found
        </h2>

        <p>
          The provider may have been removed
          or is currently unavailable.
        </p>

        <Link to="/user">
          ← Back to Dashboard
        </Link>

      </div>

    );

  }


  return (

    <div className="service-details-page">


      {/* ================= NAVBAR ================= */}

      <nav className="service-details-navbar">

        <Link
          to="/user"
          className="service-details-logo"
        >

          <div className="service-logo-icon">
            🌱
          </div>

          <div>

            <h2>
              GramaCare
            </h2>

            <span>
              Village Services
            </span>

          </div>

        </Link>


        <div className="service-details-nav">

          <Link to="/user">
            ⌂ Dashboard
          </Link>

          <Link to="/user/requests">
            ✉ My Requests
          </Link>

          <Link to="/user/profile">
            👤 Profile
          </Link>

        </div>


        <button
          className="service-logout"
          onClick={logout}
        >
          ⇥ Logout
        </button>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="service-details-main">


        {/* BACK */}

        <Link
          to="/user"
          className="service-back"
        >
          ← Back to Services
        </Link>


        {/* ================= PROVIDER CARD ================= */}

        <div className="service-details-card">


          {/* IMAGE */}

          <div className="service-details-image">

            {provider.image ? (

              <img
                src={provider.image}
                alt={provider.name}
              />

            ) : (

              <div className="service-image-placeholder">
                👤
              </div>

            )}


            <span className="service-available">
              ● Available
            </span>

          </div>


          {/* CONTENT */}

          <div className="service-details-content">


            <div className="service-title-row">

              <div>

                <p className="service-small-title">
                  SERVICE PROVIDER
                </p>

                <h1>
                  {provider.name}
                </h1>

                <h2>
                  🔧 {provider.work}
                </h2>

              </div>


              <div className="service-rating">
                ⭐ {provider.rating || "New"}
              </div>

            </div>


            {/* LOCATION */}

            <div className="service-location">
              📍 {provider.village || "Village not specified"}
              {provider.district
                ? `, ${provider.district}`
                : ""}
            </div>


            {/* INFORMATION */}

            <div className="service-info-grid">


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
                    "Contact Provider"}
                </strong>
              </div>


              <div>
                <span>
                  Distance
                </span>

                <strong>
                  {provider.distance
                    ? `${provider.distance} km`
                    : "Nearby"}
                </strong>
              </div>


              <div>
                <span>
                  Mobile
                </span>

                <strong>
                  {provider.mobile ||
                    provider.phone ||
                    "Not provided"}
                </strong>
              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="service-description">

              <h3>
                About This Service
              </h3>

              <p>
                {provider.description ||
                  `You can contact ${provider.name} for ${provider.work || "this service"}. The provider is available in ${provider.village || "your nearby area"}.`}
              </p>

            </div>


            {/* REQUEST SUCCESS */}

            {requestSent && (

              <div className="request-success">

                <div>
                  ✓
                </div>

                <div>

                  <strong>
                    Request Sent Successfully
                  </strong>

                  <p>
                    Your service request has been
                    sent to the provider.
                  </p>

                </div>

              </div>

            )}


            {/* REQUEST FORM */}

            {showRequestForm && (

              <div className="service-request-form">

                <h3>
                  Send Service Request
                </h3>

                <p>
                  Tell the provider what service
                  you need.
                </p>


                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Example: I need a tractor tomorrow morning..."
                  rows="4"
                />


                <div className="request-form-buttons">

                  <button
                    className="send-request-button"
                    onClick={sendRequest}
                  >
                    Send Request
                  </button>

                  <button
                    className="cancel-form-button"
                    onClick={() =>
                      setShowRequestForm(false)
                    }
                  >
                    Cancel
                  </button>

                </div>

              </div>

            )}


            {/* ACTION BUTTONS */}

            {!showRequestForm && (

              <div className="service-action-buttons">

                {provider.mobile && (

                  <a
                    href={`tel:${provider.mobile}`}
                    className="service-call-button"
                  >
                    📞 Call Provider
                  </a>

                )}


                <button
                  className="service-request-button"
                  onClick={() => {

                    if (!currentUser) {

                      alert(
                        "Please login first."
                      );

                      navigate("/user");

                      return;
                    }

                    setShowRequestForm(true);

                  }}
                >
                  ✉ Send Request
                </button>

              </div>

            )}


          </div>

        </div>


      </main>

    </div>
  );
}

export default UserServiceDetails;