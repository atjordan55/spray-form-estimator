import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Estimator from "./Estimator"; // <- Update this line to match your component

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Estimator /> {/* <- Render the Estimator component */}
  </React.StrictMode>
);


