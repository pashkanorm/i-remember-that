import { useEffect } from "react";
import { supabase } from "./supabaseClient";

/**
 * This component handles the OAuth redirect from Supabase.
 * It must be placed OUTSIDE of BrowserRouter to capture the hash params.
 */
export const OAuthCallback = () => {
  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log("[OAuthCallback] Handling OAuth callback...");
      console.log("[OAuthCallback] Current URL:", window.location.href);
      console.log("[OAuthCallback] Hash:", window.location.hash);

      try {
        // Let Supabase process the OAuth redirect params from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[OAuthCallback] Error getting session after OAuth:", error);
        } else if (data.session) {
          console.log("[OAuthCallback] Session recovered:", data.session.user?.email);
          // Redirect to main app
          window.location.href = "/";
        } else {
          console.log("[OAuthCallback] No session after OAuth redirect");
          window.location.href = "/";
        }
      } catch (err) {
        console.error("[OAuthCallback] Exception:", err);
        window.location.href = "/";
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Processing authentication...</p>
    </div>
  );
};
