import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Register/Register.jsx";
import Restetpassword from "./Restetpassword/Restetpassword.jsx";
import OtpPassword from "./OtpPassword/OtpPassword.jsx";
import ForgotPassword from "./Forgotpassword/Forgotpassword.jsx";



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
       
    </BrowserRouter>
  </StrictMode>
);