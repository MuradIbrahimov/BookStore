import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      console.log("Sending logout request...");
      await axios.get("http://localhost:5000/auth/logout", {
        withCredentials: true, // Ensure cookies are included
      });
      console.log("Logout successful");
      localStorage.removeItem("user"); // Remove user from localStorage
      window.location.href = "/"; // Redirect to login page
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  // Optionally, verify authentication on load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("Verifying authentication...");
        const response = await axios.get(
          "http://localhost:5000/admin/dashboard",
          {
            withCredentials: true,
          }
        );
        console.log("Authentication verified:", response.data);
      } catch (err) {
        console.error("Authentication verification failed:", err);
        setError("Session expired. Please log in again.");
        window.location.href = "/"; // Redirect to login if verification fails
      }
    };
    verifyAuth();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Welcome, Admin!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
