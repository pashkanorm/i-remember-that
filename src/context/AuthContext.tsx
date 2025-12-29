import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../supabaseClient";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("[AuthContext] Initializing auth...");
        console.log("[AuthContext] Current URL:", window.location.href);
        console.log("[AuthContext] URL hash:", window.location.hash);
        
        // Check localStorage for session (Supabase stores it there)
        const storedSession = localStorage.getItem("sb-dfexuduplsdslzhgjggv-auth-token");
        console.log("[AuthContext] Stored session in localStorage:", storedSession ? "found" : "not found");

        // Give Supabase time to parse OAuth redirect params from URL hash
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to get session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[AuthContext] getSession error:", error);
        } else {
          console.log("[AuthContext] Session retrieved:", session?.user?.email ?? "no session");
        }

        setUser(session?.user ?? null);

        // If still no session but localStorage has one, refresh
        if (!session && storedSession) {
          console.log("[AuthContext] Attempting session refresh...");
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          console.log("[AuthContext] After refresh:", refreshedSession?.user?.email ?? "still no session");
          setUser(refreshedSession?.user ?? null);
        }
      } catch (err) {
        console.error("[AuthContext] initAuth exception:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes (includes OAuth redirect callback)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AuthContext] onAuthStateChange event:", event, "session:", session?.user?.email ?? "no session");
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    try {
      console.log("[AuthContext] signIn called, redirecting to Google OAuth...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) {
        console.error("[AuthContext] OAuth error:", error);
        setLoading(false);
      } else {
        console.log("[AuthContext] OAuth initiated successfully, redirecting...");
      }
    } catch (err) {
      console.error("[AuthContext] Sign in exception:", err);
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setLoading(false);
    } catch (err) {
      console.error("[AuthContext] Sign out error:", err);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
