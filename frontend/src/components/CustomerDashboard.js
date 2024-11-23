import React from "react";

const CustomerDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user from storage
    window.location.href = "/";
  };

  return (
    <div>
      <h1>Customer Dashboard</h1>
      <p>Welcome, Customer!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default CustomerDashboard;
