import { createContext, useContext, useEffect, useState, useCallback } from "react";
import supabase from "../config/supabase.js";
import API from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async (supabaseSession) => {
    if (!supabaseSession) {
      setUser(null);
      setSession(null);
      return;
    }
    setSession(supabaseSession);
    localStorage.setItem("token", supabaseSession.access_token);
    try {
      const { data } = await API.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      hydrateUser(session).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await hydrateUser(session);
        // Save Google refresh token server-side if present
        if (session?.provider_refresh_token) {
          API.post("/auth/google-token", {
            refreshToken: session.provider_refresh_token,
          }).catch(() => {});
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        localStorage.removeItem("token");
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrateUser]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: { access_type: "offline", prompt: "consent" },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    // Also register on backend (creates profile, sends welcome email)
    try {
      await API.post("/auth/register", { name, email, password });
    } catch {}
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithEmail, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
