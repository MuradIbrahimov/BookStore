import instances from "../utils/axios"; // Import the centralized Axios instance
const API_URL = "http://localhost:5000/auth";

const login = (email, password) => {
  return instances.post(`${API_URL}/login`, { email, password });
};

export default { login };
