import { useEffect } from "react";
import instances from "axios";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await instances.get("http://localhost:5000/auth/logout", {
          withCredentials: true,
        });
        localStorage.removeItem("user"); // Clear user from localStorage
        navigate("/"); // Redirect to login page
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };

    performLogout();
  }, [navigate]);

  return null; // No UI needed
};

export default Logout;
