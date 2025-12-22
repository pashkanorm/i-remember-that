import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FinishedListProvider } from "./context/FinishedListContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FinishedListProvider>
      <App />
    </FinishedListProvider>
  </React.StrictMode>
);
