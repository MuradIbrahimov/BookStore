import axios from "axios";

// Create a new Axios instance
const instance = axios.create({
  baseURL: "http://localhost:5000", // Backend URL
  withCredentials: true, // Ensure cookies are included in requests
});

export default instance;
