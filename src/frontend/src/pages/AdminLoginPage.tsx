import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const {
    data: isAdmin,
    isLoading: checkingAdmin,
    refetch: refetchAdmin,
  } = useIsAdmin();
  const { actor } = useActor();

  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState("");
  const [manualToken, setManualToken] = useState("");
  const activatedRef = useRef(false);

  const activateWithToken = useCallback(
    async (token: string) => {
      if (!actor || !identity || activatedRef.current) return;
      activatedRef.current = true;
      setActivating(true);
      setActivateError("");
      try {
        await actor._initializeAccessControlWithSecret(token);
        const result = await refetchAdmin();
        if (result.data) {
          navigate({ to: "/admin" });
        } else {
          setActivateError("Token not accepted. Please check and try again.");
          activatedRef.current = false;
        }
      } catch {
        setActivateError("Activation failed. Please try again.");
        activatedRef.current = false;
      } finally {
        setActivating(false);
      }
    },
    [actor, identity, navigate, refetchAdmin],
  );

  // Auto-activate when identity is present and token is in URL hash
  useEffect(() => {
    if (!identity || !actor || isAdmin || checkingAdmin || activatedRef.current)
      return;
    const token = getTokenFromHash();
    if (!token) return;
    activateWithToken(token);
  }, [identity, actor, isAdmin, checkingAdmin, activateWithToken]);

  useEffect(() => {
    if (identity && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [identity, isAdmin, navigate]);

  const showTokenForm = Boolean(
    identity && !isAdmin && !checkingAdmin && !activating,
  );

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
              Sign in with your Internet Identity to access the editorial
              dashboard.
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
              "SIGN IN WITH INTERNET IDENTITY"
            )}
          </Button>

          {showTokenForm && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
              data-ocid="login.token_form"
            >
              <p className="text-cream-DEFAULT/70 text-xs category-meta tracking-widest text-center mb-3">
                ENTER YOUR ADMIN TOKEN
              </p>
              <Input
                type="text"
                placeholder="Paste your admin token here"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="bg-wine-DEFAULT/30 border-wine-vibrant/40 text-cream-DEFAULT placeholder:text-cream-DEFAULT/30 mb-3 text-sm"
              />
              <Button
                onClick={() => activateWithToken(manualToken)}
                disabled={!manualToken.trim() || activating}
                className="w-full bg-wine-vibrant/80 hover:bg-wine-vibrant text-cream-DEFAULT category-meta tracking-widest py-2 text-xs"
              >
                ACTIVATE ADMIN
              </Button>
              <p className="text-cream-DEFAULT/40 text-xs font-sans mt-3 text-center">
                Find your token in the Caffeine deployment link after{" "}
                <code>#caffeineAdminToken=</code>
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
