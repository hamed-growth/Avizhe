import { createRoot } from "react-dom/client";
import "./global.css";
import { App } from "./app.jsx";

createRoot(document.getElementById("app")).render(<App />);
