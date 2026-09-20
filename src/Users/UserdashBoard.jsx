    import React, { useEffect, useState } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import './UserdashBoard.css'
    function UserDashboard() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [providers, setProviders] = useState([]);

    const [userName, setUserName] = useState("Suresh");

    useEffect(() => {
        const savedProviders =
        JSON.parse(
            localStorage.getItem("palleconnect_providers")
        ) || [];

        setProviders(savedProviders);

        const currentUser =
        JSON.parse(
            localStorage.getItem(
            "palleconnect_current_user"
            )
        );

        if (currentUser) {
        setUserName(
            currentUser.name || currentUser.fullName || "User"
        );
        }
    }, []);

    const filteredProviders = providers
        .filter((provider) => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return true;
        }

        return (
            provider.work
            ?.toLowerCase()
            .includes(keyword) ||
            provider.name
            ?.toLowerCase()
            .includes(keyword) ||
            provider.village
            ?.toLowerCase()
            .includes(keyword) ||
            provider.district
            ?.toLowerCase()
            .includes(keyword)
        );
        })
        .filter((provider) => provider.availability !== false)
        .sort(
        (a, b) =>
            (a.distance || 999) -
            (b.distance || 999)
        );

    const logout = () => {
        localStorage.removeItem(
        "palleconnect_current_user"
        );

        navigate("/user");
    };

    return (
        <div className="user-dashboard-page">

        {/* NAVBAR */}

        <nav className="user-navbar">

            <Link
            to="/user"
            className="user-logo"
            >
            <div className="user-logo-symbol">
                🌱
            </div>

            <div>
                <h2>GramaCare</h2>
                <span>Village Services</span>
            </div>
            </Link>


            <div className="user-nav">

            <Link
                to="/user"
                className="user-nav-item active"
            >
                ⌂ Dashboard
            </Link>

            <Link
                to="/user/requests"
                className="user-nav-item"
            >
                ✉ My Requests
            </Link>

            <Link
                to="/user/profile"
                className="user-nav-item"
            >
                👤 Profile
            </Link>

            </div>


            <button
            className="user-logout"
            onClick={logout}
            >
            ⇥ Logout
            </button>

        </nav>


        {/* HERO */}

        <section className="user-hero">

            <div className="user-hero-content">

            <p>
                GRAMACARE VILLAGE SERVICES
            </p>

            <h1>
                Hello, {userName} 👋
            </h1>

            <h2>
                Find trusted services near you.
            </h2>

            <span>
                Search for any service and connect
                with nearby service providers.
            </span>


            {/* SEARCH */}

            <div className="user-search-box">

                <span>
                🔍
                </span>

                <input
                type="text"
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
                placeholder="What service do you need? Example: Tractor Driver"
                />

                <button>
                Search
                </button>

            </div>

            </div>

        </section>


        {/* CONTENT */}

        <main className="user-main">

            <div className="user-section-header">

            <div>
                <p>
                NEARBY SERVICES
                </p>

                <h2>
                Services Available Near You
                </h2>

                <span>
                {filteredProviders.length} providers
                available
                </span>
            </div>

            </div>


            {/* PROVIDERS */}

            {filteredProviders.length === 0 ? (

            <div className="user-empty-state">

                <div>
                🔍
                </div>

                <h2>
                Service Not Available
                </h2>

                <p>
                We could not find an available provider
                for "{search}".
                </p>

                <span>
                Try searching for another service.
                </span>

            </div>

            ) : (

            <div className="user-provider-grid">

                {filteredProviders.map(
                (provider) => (

                    <div
                    className="user-provider-card"
                    key={provider.id}
                    >

                    <div className="user-provider-image">

                        {provider.image ? (

                        <img
                            src={provider.image}
                            alt={provider.name}
                        />

                        ) : (

                        <div className="user-provider-placeholder">
                            👤
                        </div>

                        )}

                        <span className="user-available-badge">
                        ● Available
                        </span>

                    </div>


                    <div className="user-provider-content">

                        <div className="user-provider-top">

                        <div>

                            <h3>
                            {provider.name}
                            </h3>

                            <p>
                            🔧 {provider.work}
                            </p>

                        </div>

                        <div className="user-rating">
                            ⭐ {provider.rating || "New"}
                        </div>

                        </div>


                        <div className="user-provider-location">
                        📍 {provider.village},{" "}
                        {provider.district}
                        </div>


                        <div className="user-provider-info">

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
                            Starting
                            </span>

                            <strong>
                            {provider.price ||
                                "Contact provider"}
                            </strong>
                        </div>

                        </div>


                        <div className="user-distance">
                        📍{" "}
                        {provider.distance
                            ? `${provider.distance} km away`
                            : "Nearby provider"}
                        </div>


                        <div className="user-provider-buttons">

                        <a
                            href={`tel:${provider.mobile}`}
                            className="user-call-button"
                        >
                            📞 Call
                        </a>

                        <Link
                            to={`/user/service/${provider.id}`}
                            className="user-view-button"
                        >
                            View Details →
                        </Link>

                        </div>

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

    export default UserDashboard;