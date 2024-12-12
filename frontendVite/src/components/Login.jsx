import React, { useState } from "react";
import instances from "../utils/axios"; // Import the centralized Axios instance
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await instances.post("/auth/login", { email, password });
      const { role } = response.data;

      localStorage.setItem("user", JSON.stringify({ role }));

      if (role === "admin" || role === "super_admin") {
        navigate("/admin/dashboard");
      } else if (role === "customer") {
        navigate("/customer/dashboard");
      } else {
        throw new Error("Unknown user role");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;