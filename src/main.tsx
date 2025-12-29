import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { OAuthCallback } from "./OAuthCallback";
import { FinishedListProvider } from "./context/FinishedListContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const Main = () => {
  // Show OAuth callback handler if we're on a callback route
  const isCallback = window.location.hash.includes("access_token") || 
                     window.location.search.includes("code");
  
  if (isCallback) {
    return <OAuthCallback />;
  }

  return (
    <AuthProvider>
      <FinishedListProvider>
        <App />
      </FinishedListProvider>
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
