import React from "react";

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user from storage
    window.location.href = "/";
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
