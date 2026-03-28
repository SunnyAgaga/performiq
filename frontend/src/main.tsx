import { createRoot } from "react-dom/client";
import App from "./App";
import { setBaseUrl } from "./lib";
import "./index.css";

// Initialize API base URL from environment
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
