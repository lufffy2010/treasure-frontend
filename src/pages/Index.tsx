
import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const [localAuth, setLocalAuth] = useState<boolean>(() => !!localStorage.getItem("token"));

  // If Supabase auth updates, reflect that in localAuth
  useEffect(() => {
    if (user) setLocalAuth(true);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="animate-pulse text-2xl text-foreground">⚓ Loading...</div>
      </div>
    );
  }

  const isLoggedIn = !!user || localAuth;

  return isLoggedIn ? (
    <Dashboard />
  ) : (
    <AuthPage onAuth={() => setLocalAuth(true)} />
  );
};

export default Index;
