import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, isLoginSuccess, identity } =
    useInternetIdentity();
  const {
    data: isAdmin,
    isLoading: checkingAdmin,
    refetch: refetchAdmin,
  } = useIsAdmin();
  const { actor } = useActor();

  const [token, setToken] = useState("");
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState("");

  useEffect(() => {
    if (identity && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [identity, isAdmin, navigate]);

  async function handleActivate() {
    if (!actor || !token.trim()) return;
    setActivating(true);
    setActivateError("");
    try {
      await actor._initializeAccessControlWithSecret(token.trim());
      const result = await refetchAdmin();
      if (result.data) {
        navigate({ to: "/admin" });
      } else {
        setActivateError(
          "Token accepted but admin access was not granted. Please check the token and try again.",
        );
      }
    } catch (_err) {
      setActivateError("Invalid token. Please check and try again.");
    } finally {
      setActivating(false);
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-wine-darkest text-cream-DEFAULT p-10 shadow-editorial">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/untitled-1-019d484f-22fa-72db-8264-fbea345379a1.png"
              alt="The Dusky Lotus News"
              className="h-20 w-auto"
            />
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Lock className="text-wine-vibrant" size={32} />
            </div>
            <h1 className="editorial-heading text-cream-DEFAULT text-3xl mb-2">
              Admin Access
            </h1>
            <p className="text-cream-DEFAULT/60 text-sm font-sans">
              Sign in with your identity to access the editorial dashboard.
            </p>
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn || checkingAdmin}
            data-ocid="login.primary_button"
            className="w-full bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT category-meta tracking-widest py-3 text-sm"
          >
            {isLoggingIn || checkingAdmin ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                CONNECTING...
              </>
            ) : (
              "SIGN IN"
            )}
          </Button>

          {isLoginSuccess && !isAdmin && !checkingAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
              data-ocid="login.error_state"
            >
              <p className="text-cream-DEFAULT/70 text-xs text-center category-meta tracking-widest mb-4">
                ENTER YOUR ADMIN TOKEN TO ACTIVATE ACCESS
              </p>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter admin token"
                data-ocid="admin.input"
                className="w-full bg-wine-DEFAULT/30 border border-wine-vibrant/40 text-cream-DEFAULT placeholder-cream-DEFAULT/30 px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-wine-vibrant mb-3"
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
              />
              <Button
                onClick={handleActivate}
                disabled={activating || !token.trim()}
                data-ocid="admin.submit_button"
                className="w-full bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT category-meta tracking-widest py-3 text-sm"
              >
                {activating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ACTIVATING...
                  </>
                ) : (
                  "ACTIVATE ADMIN"
                )}
              </Button>
              {activateError && (
                <p
                  className="mt-3 text-wine-vibrant text-xs text-center font-sans"
                  data-ocid="admin.error_state"
                >
                  {activateError}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
