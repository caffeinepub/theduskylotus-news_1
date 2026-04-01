import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

function getTokenFromHash(): string {
  const hash = window.location.hash;
  const match = hash.match(/caffeineAdminToken=([^&]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

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

  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState("");
  const activatedRef = useRef(false);

  // Auto-activate when logged in and a token is present in the URL hash
  useEffect(() => {
    if (!identity || !actor || isAdmin || checkingAdmin || activatedRef.current)
      return;
    if (!isLoginSuccess) return;

    const token = getTokenFromHash();
    if (!token) return;

    activatedRef.current = true;
    setActivating(true);
    setActivateError("");

    actor
      ._initializeAccessControlWithSecret(token)
      .then(() => refetchAdmin())
      .then((result) => {
        if (result.data) {
          // Clean token from URL before navigating
          history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
          navigate({ to: "/admin" });
        } else {
          setActivateError(
            "Admin activation failed. Please try the deployment link again.",
          );
          activatedRef.current = false;
        }
      })
      .catch(() => {
        setActivateError(
          "Admin activation failed. Please try the deployment link again.",
        );
        activatedRef.current = false;
      })
      .finally(() => setActivating(false));
  }, [
    identity,
    isLoginSuccess,
    actor,
    isAdmin,
    checkingAdmin,
    navigate,
    refetchAdmin,
  ]);

  useEffect(() => {
    if (identity && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [identity, isAdmin, navigate]);

  const hasTokenInUrl = Boolean(getTokenFromHash());

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
            disabled={isLoggingIn || checkingAdmin || activating}
            data-ocid="login.primary_button"
            className="w-full bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT category-meta tracking-widest py-3 text-sm"
          >
            {isLoggingIn || checkingAdmin || activating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {activating ? "ACTIVATING..." : "CONNECTING..."}
              </>
            ) : (
              "SIGN IN"
            )}
          </Button>

          {isLoginSuccess &&
            !isAdmin &&
            !checkingAdmin &&
            !activating &&
            !hasTokenInUrl && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
                data-ocid="login.error_state"
              >
                <p className="text-cream-DEFAULT/70 text-xs category-meta tracking-widest">
                  NO ADMIN ACCESS FOUND
                </p>
                <p className="text-cream-DEFAULT/50 text-xs font-sans mt-2">
                  Please open the deployment link from Caffeine to activate
                  admin.
                </p>
              </motion.div>
            )}

          {activateError && (
            <p
              className="mt-4 text-wine-vibrant text-xs text-center font-sans"
              data-ocid="admin.error_state"
            >
              {activateError}
            </p>
          )}
        </div>
      </motion.div>
    </main>
  );
}
