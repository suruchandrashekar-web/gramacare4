import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserRequest.css";

function UserRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const savedRequests = JSON.parse(
      localStorage.getItem("palleconnect_user_requests")
    ) || [];

    setRequests(savedRequests);
  };


  const logout = () => {
    localStorage.removeItem(
      "palleconnect_current_user"
    );

    navigate("/user");
  };


  const cancelRequest = (requestId) => {

    const updatedRequests = requests.map(
      (request) => {

        if (request.id === requestId) {
          return {
            ...request,
            status: "Cancelled"
          };
        }

        return request;
      }
    );

    setRequests(updatedRequests);

    localStorage.setItem(
      "palleconnect_user_requests",
      JSON.stringify(updatedRequests)
    );
  };


  const deleteRequest = (requestId) => {

    const updatedRequests =
      requests.filter(
        (request) =>
          request.id !== requestId
      );

    setRequests(updatedRequests);

    localStorage.setItem(
      "palleconnect_user_requests",
      JSON.stringify(updatedRequests)
    );
  };


  const getStatusClass = (status) => {

    if (status === "Accepted") {
      return "status-accepted";
    }

    if (status === "Rejected") {
      return "status-rejected";
    }

    if (status === "Completed") {
      return "status-completed";
    }

    if (status === "Cancelled") {
      return "status-cancelled";
    }

    return "status-pending";
  };


  return (
    <div className="user-requests-page">

      {/* ================= NAVBAR ================= */}

      <nav className="user-requests-navbar">

        <Link
          to="/user"
          className="user-requests-logo"
        >

          <div className="requests-logo-icon">
            🌱
          </div>

          <div>
            <h2>GramaCare</h2>
            <span>Village Services</span>
          </div>

        </Link>


        <div className="user-requests-nav">

          <Link to="/user">
            ⌂ Dashboard
          </Link>

          <Link
            to="/user/requests"
            className="active"
          >
            ✉ My Requests
          </Link>

          <Link to="/user/profile">
            👤 Profile
          </Link>

        </div>


        <button
          className="requests-logout"
          onClick={logout}
        >
          ⇥ Logout
        </button>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="user-requests-main">

        <div className="user-requests-heading">

          <p>GRAMACARE</p>

          <h1>
            My Requests
          </h1>

          <span>
            Track all your service requests.
          </span>

        </div>


        {/* ================= REQUEST COUNT ================= */}

        <div className="request-summary">

          <div className="summary-card">
            <span>Total Requests</span>

            <strong>
              {requests.length}
            </strong>
          </div>


          <div className="summary-card">
            <span>Pending</span>

            <strong>
              {
                requests.filter(
                  (request) =>
                    request.status === "Pending"
                ).length
              }
            </strong>
          </div>


          <div className="summary-card">
            <span>Accepted</span>

            <strong>
              {
                requests.filter(
                  (request) =>
                    request.status === "Accepted"
                ).length
              }
            </strong>
          </div>


          <div className="summary-card">
            <span>Completed</span>

            <strong>
              {
                requests.filter(
                  (request) =>
                    request.status === "Completed"
                ).length
              }
            </strong>
          </div>

        </div>


        {/* ================= REQUESTS ================= */}

        {requests.length === 0 ? (

          <div className="requests-empty">

            <div className="requests-empty-icon">
              ✉
            </div>

            <h2>
              No Requests Yet
            </h2>

            <p>
              You have not sent any service requests.
            </p>

            <Link to="/user">
              Find a Service
            </Link>

          </div>

        ) : (

          <div className="requests-list">

            {requests.map(
              (request) => (

                <div
                  className="request-card"
                  key={request.id}
                >

                  {/* TOP */}

                  <div className="request-card-top">

                    <div>

                      <span className="request-label">
                        SERVICE
                      </span>

                      <h2>
                        {request.work ||
                          request.service ||
                          "Service"}
                      </h2>

                    </div>


                    <span
                      className={`request-status ${getStatusClass(
                        request.status
                      )}`}
                    >
                      ● {request.status || "Pending"}
                    </span>

                  </div>


                  {/* PROVIDER */}

                  <div className="request-provider">

                    <div className="request-provider-icon">
                      👤
                    </div>

                    <div>

                      <span>
                        Service Provider
                      </span>

                      <strong>
                        {request.providerName ||
                          request.name ||
                          "Provider"}
                      </strong>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="request-details">

                    <div>
                      <span>
                        📍 Location
                      </span>

                      <strong>
                        {request.village || "Not specified"}
                        {request.district
                          ? `, ${request.district}`
                          : ""}
                      </strong>
                    </div>


                    <div>
                      <span>
                        📅 Requested On
                      </span>

                      <strong>
                        {request.date ||
                          "Recently"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        📞 Mobile
                      </span>

                      <strong>
                        {request.mobile ||
                          request.phone ||
                          "Not provided"}
                      </strong>
                    </div>

                  </div>


                  {/* MESSAGE */}

                  {request.message && (

                    <div className="request-message">

                      <span>
                        Your Message
                      </span>

                      <p>
                        {request.message}
                      </p>

                    </div>

                  )}


                  {/* ACTIONS */}

                  <div className="request-actions">

                    {request.mobile && (

                      <a
                        href={`tel:${request.mobile}`}
                        className="request-call"
                      >
                        📞 Call Provider
                      </a>

                    )}


                    {request.status === "Pending" && (

                      <button
                        className="request-cancel"
                        onClick={() =>
                          cancelRequest(request.id)
                        }
                      >
                        Cancel Request
                      </button>

                    )}


                    {(request.status === "Cancelled" ||
                      request.status === "Rejected") && (

                      <button
                        className="request-delete"
                        onClick={() =>
                          deleteRequest(request.id)
                        }
                      >
                        Delete
                      </button>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default UserRequests;