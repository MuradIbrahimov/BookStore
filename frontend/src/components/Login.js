import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending login request for:", email);
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      console.log("Login response:", response.data);

      const { role } = response.data;

      // Save user role to localStorage
      localStorage.setItem("user", JSON.stringify({ role }));

      // Redirect based on role
      if (role === "admin" || role === "super_admin") {
        navigate("/admin/dashboard");
      } else if (role === "customer") {
        navigate("/customer/dashboard");
      } else {
        throw new Error("Unknown user role");
      }
    } catch (err) {
      console.error("Login error:", err);
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
