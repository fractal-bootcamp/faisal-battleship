import { BrowserRouter as Router } from "react-router-dom"
import App from "./App"
import ReactDOM from "react-dom/client"
import React from "react"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
)
