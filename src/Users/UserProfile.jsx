import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserProfile.css";

function UserProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("palleconnect_current_user")
    );

    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("palleconnect_current_user");
    navigate("/user");
  };

  if (!user) {
    return (
      <div className="user-profile-page">
        <div className="user-profile-not-found">
          <div className="not-found-icon">👤</div>

          <h2>User Details Not Found</h2>

          <p>
            Please login again to view your profile.
          </p>

          <Link to="/user" className="profile-dashboard-link">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const displayName =
    user.name || user.fullName || "User";

  return (
    <div className="user-profile-page">

      {/* ================= NAVBAR ================= */}

      <nav className="user-profile-navbar">

        <Link
          to="/user"
          className="user-profile-logo"
        >
          <div className="user-profile-logo-icon">
            🌱
          </div>

          <div>
            <h2>GramaCare</h2>
            <span>Village Services</span>
          </div>
        </Link>


        <div className="user-profile-nav">

          <Link to="/user">
            ⌂ Dashboard
          </Link>

          <Link to="/user/requests">
            ✉ My Requests
          </Link>

          <Link
            to="/user/profile"
            className="active"
          >
            👤 Profile
          </Link>

        </div>


        <button
          className="user-profile-logout"
          onClick={logout}
        >
          ⇥ Logout
        </button>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="user-profile-main">

        <div className="user-profile-heading">

          <p>GRAMACARE USER PROFILE</p>

          <h1>My Profile</h1>

          <span>
            Manage and view your personal information.
          </span>

        </div>


        {/* ================= PROFILE CARD ================= */}

        <div className="user-profile-card">

          {/* PROFILE HEADER */}

          <div className="user-profile-card-header">

            <div className="user-profile-avatar">
              {displayName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-profile-name">

              <h2>
                {displayName}
              </h2>

              <p>
                {user.role || "USER"}
              </p>

            </div>

          </div>


          {/* USER DETAILS */}

          <div className="user-details-section">

            <h3>
              Personal Information
            </h3>


            <div className="user-details-grid">

              {/* NAME */}

              <div className="user-detail-box">

                <span>
                  Full Name
                </span>

                <strong>
                  {displayName}
                </strong>

              </div>


              {/* EMAIL */}

              <div className="user-detail-box">

                <span>
                  Email Address
                </span>

                <strong>
                  {user.email || "Not provided"}
                </strong>

              </div>


              {/* MOBILE */}

              <div className="user-detail-box">

                <span>
                  Mobile Number
                </span>

                <strong>
                  {user.mobile ||
                    user.phone ||
                    "Not provided"}
                </strong>

              </div>


              {/* VILLAGE */}

              <div className="user-detail-box">

                <span>
                  Village
                </span>

                <strong>
                  {user.village || "Not provided"}
                </strong>

              </div>


              {/* DISTRICT */}

              <div className="user-detail-box">

                <span>
                  District
                </span>

                <strong>
                  {user.district || "Not provided"}
                </strong>

              </div>


              {/* STATE */}

              <div className="user-detail-box">

                <span>
                  State
                </span>

                <strong>
                  {user.state || "Andhra Pradesh"}
                </strong>

              </div>


              {/* ROLE */}

              <div className="user-detail-box">

                <span>
                  Account Type
                </span>

                <strong>
                  {user.role || "USER"}
                </strong>

              </div>


              {/* USER ID */}

              <div className="user-detail-box">

                <span>
                  User ID
                </span>

                <strong>
                  {user.id || "Not available"}
                </strong>

              </div>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="user-profile-actions">

            <Link
              to="/user"
              className="profile-back-button"
            >
              ← Back to Dashboard
            </Link>

            <button
              onClick={logout}
              className="profile-logout-button"
            >
              ⇥ Logout
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default UserProfile;