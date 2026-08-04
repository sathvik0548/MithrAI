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

    // Set session immediately — never wait for backend
    setSession(supabaseSession);
    localStorage.setItem("token", supabaseSession.access_token);

    // Set user from Supabase session data directly (works even if backend is down)
    setUser(supabaseSession.user);

    // Optionally enrich from backend — but don't block on it
    API.get("/auth/me")
      .then(({ data }) => {
        if (data?.user) setUser(prev => ({ ...prev, ...data.user }));
      })
      .catch(() => {
        // Backend unavailable — Supabase session user is enough
      });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      hydrateUser(session).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await hydrateUser(session);
        // Save Google refresh token server-side if present (non-blocking)
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
      options: { data: { name, full_name: name } },
    });
    if (error) throw error;

    // Non-blocking backend call — don't await so UI doesn't hang if backend is slow/down
    API.post("/auth/register", { name, email, password }).catch(() => {});

    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = (updatedUser) => setUser(prev => ({ ...prev, ...updatedUser }));

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
