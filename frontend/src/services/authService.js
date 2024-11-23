import axios from "axios";

const API_URL = "http://localhost:5000/auth";

const login = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password });
};

export default { login };
