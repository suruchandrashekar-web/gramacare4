import { useState } from "react";

function Location() {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Location is not supported by this browser.");
      return;
    }

    setMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        setMessage("Location access allowed.");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setMessage("Please allow location permission.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setMessage("Please turn ON your mobile location.");
        } else if (error.code === error.TIMEOUT) {
          setMessage("Location request timed out. Try again.");
        } else {
          setMessage("Unable to get your location.");
        }

        setLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div style={styles.container}>
      <button onClick={getLocation} style={styles.button}>
        📍 Your Current Location
      </button>

      {message && (
        <p style={styles.message}>
          {message}
        </p>
      )}

      {location && (
        <div style={styles.locationBox}>
          <p>
            Latitude: {location.latitude}
          </p>

          <p>
            Longitude: {location.longitude}
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "15px",
    textAlign: "center",
  },

  button: {
    padding: "12px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  message: {
    marginTop: "10px",
    fontSize: "15px",
  },

  locationBox: {
    marginTop: "10px",
    padding: "10px",
  },
};

export default Location;