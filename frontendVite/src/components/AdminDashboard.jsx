import React, { useEffect, useState } from "react";
import instances from "../utils/axios"; // Import the centralized Axios instance

const AdminDashboard = () => {
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      console.log("Sending logout request...");
      await instances.get("/auth/logout");
      console.log("Logout successful");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("Verifying authentication...");
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        if (!token) {
          throw new Error("No token found");
        }

        const response = await instances.get("/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Authentication verified:", response.data);
      } catch (err) {
        console.error(
          "Authentication verification failed:",
          err.response?.data || err.message
        );
        setError("Session expired. Please log in again.");
        window.location.href = "/";
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
