import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Game from "./Game";
import "./index.css"

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <Router>
    <Routes>
      <Route path="/game/:id" element={<App />} />
      <Route path="/" element={<Game />} />

    </Routes>

  </Router>
);
