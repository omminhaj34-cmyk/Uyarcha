import React, { useEffect, useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { ShieldCheck, Lock, Mail, Key, AlertCircle, Loader2, QrCode, LogOut } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

type AuthState =
  | "checking"
  | "unauthenticated"
  | "verifying_mfa"
  | "enrolling_mfa"
  | "access_denied"
  | "authenticated";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

const ProtectedRoute = ({ children, requiredRole = "admin" }: ProtectedRouteProps) => {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side rate limiting / throttling
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // MFA state
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);

  // Inactivity tracking
  const lastActivityRef = useRef(Date.now());

  // Handle client-side lockout countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  // Sign out helper
  const handleSignOut = useCallback(async (reason?: string) => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setAuthState("unauthenticated");
    setMfaFactorId(null);
    setMfaQrCode(null);
    setMfaSecret(null);
    setTotpCode("");
    if (reason) {
      toast.info(reason);
    }
  }, []);

  // Check user role in public.profiles and evaluate MFA assurance level
  const verifyAccessAndMfa = useCallback(async (userId: string) => {
    try {
      // 1. Fetch role strictly from public.profiles (not auth.users)
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle();

      if (profileErr || !profile || profile.role !== requiredRole) {
        setErrorMessage(
          "Access Denied: Your account does not have administrator privileges."
        );
        setAuthState("access_denied");
        await supabase.auth.signOut();
        return;
      }

      // 2. Multi-Factor Authentication (AAL2 Check)
      const { data: aalData, error: aalErr } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalErr) {
        console.error("MFA AAL check error:", aalErr);
      }

      const { data: factorData, error: factorErr } =
        await supabase.auth.mfa.listFactors();

      if (factorErr) {
        console.error("MFA factor listing error:", factorErr);
      }

      const allTotp = factorData?.totp || [];
      const verifiedFactors = allTotp.filter(
        (f) => f.status === "verified"
      );
      const unverifiedFactors = allTotp.filter(
        (f) => f.status === "unverified"
      );

      if (verifiedFactors && verifiedFactors.length > 0) {
        // User has verified TOTP
        if (aalData?.currentLevel === "aal2") {
          // AAL2 already achieved
          setAuthState("authenticated");
        } else {
          // Needs TOTP challenge verification
          setMfaFactorId(verifiedFactors[0].id);
          setAuthState("verifying_mfa");
        }
      } else {
        // Clean up any stale unverified factors before enrolling
        for (const unverified of unverifiedFactors) {
          try {
            await supabase.auth.mfa.unenroll({ factorId: unverified.id });
          } catch (unenrollErr) {
            console.warn("Could not unenroll stale factor:", unenrollErr);
          }
        }

        // Start fresh enrollment with unique friendly name
        const { data: enrollData, error: enrollErr } =
          await supabase.auth.mfa.enroll({
            factorType: "totp",
            issuer: "Uyarcha",
            friendlyName: `Admin Authenticator ${Date.now().toString().slice(-4)}`,
          });

        if (enrollErr || !enrollData) {
          console.error("MFA enrollment setup failed:", enrollErr);
          setErrorMessage(
            "MFA enrollment required: " +
              (enrollErr?.message || "Unable to initialize TOTP")
          );
          setAuthState("access_denied");
        } else {
          setMfaFactorId(enrollData.id);
          setMfaQrCode(enrollData.totp.qr_code);
          setMfaSecret(enrollData.totp.secret);
          setAuthState("enrolling_mfa");
        }
      }
    } catch (err: any) {
      console.error("Auth verification error:", err);
      setErrorMessage(err.message || "Failed to verify administrator privileges.");
      setAuthState("unauthenticated");
    }
  }, [requiredRole]);

  // Initial session check and auth change listener
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session) {
        setAuthState("unauthenticated");
      } else {
        await verifyAccessAndMfa(session.user.id);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_OUT" || !session) {
          setAuthState("unauthenticated");
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await verifyAccessAndMfa(session.user.id);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [verifyAccessAndMfa]);

  // Inactivity Auto Sign-Out (30 minutes)
  useEffect(() => {
    if (authState !== "authenticated") return;

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
        handleSignOut("You have been signed out due to 30 minutes of inactivity.");
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetActivity));
      clearInterval(checkInterval);
    };
  }, [authState, handleSignOut]);

  // Handle email/password login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const nextFailures = failedAttempts + 1;
        setFailedAttempts(nextFailures);

        if (nextFailures >= MAX_LOGIN_ATTEMPTS) {
          setLockoutTimer(LOCKOUT_DURATION_MS / 1000);
          setFailedAttempts(0);
          setErrorMessage(
            "Too many failed login attempts. Locked out for 30 seconds."
          );
        } else {
          setErrorMessage(
            `${error.message} (${MAX_LOGIN_ATTEMPTS - nextFailures} attempts remaining)`
          );
        }
        setIsSubmitting(false);
        return;
      }

      // Successful login reset
      setFailedAttempts(0);
      setLockoutTimer(0);
      if (data.user) {
        await verifyAccessAndMfa(data.user.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify existing TOTP code challenge
  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !totpCode.trim()) return;

    setIsVerifyingMfa(true);
    setErrorMessage(null);

    try {
      const { data: challenge, error: challengeErr } =
        await supabase.auth.mfa.challenge({ factorId: mfaFactorId });

      if (challengeErr) {
        throw challengeErr;
      }

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: totpCode.trim(),
      });

      if (verifyErr) {
        throw verifyErr;
      }

      toast.success("MFA authentication successful");
      setAuthState("authenticated");
    } catch (err: any) {
      console.error("TOTP verification error:", err);
      setErrorMessage(err.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  // Confirm new TOTP enrollment
  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !totpCode.trim()) return;

    setIsVerifyingMfa(true);
    setErrorMessage(null);

    try {
      const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: totpCode.trim(),
      });

      if (verifyErr) {
        throw verifyErr;
      }

      toast.success("MFA TOTP successfully enrolled and activated!");
      setAuthState("authenticated");
    } catch (err: any) {
      console.error("MFA enrollment verification error:", err);
      setErrorMessage(
        err.message || "Failed to verify authenticator code. Please try again."
      );
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  // 1. Initial verification loading state
  if (authState === "checking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
        <p className="text-sm font-medium text-muted-foreground">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated / Access Denied: Secure Login Form
  if (authState === "unauthenticated" || authState === "access_denied") {
    return (
      <Layout>
        <Helmet>
          <title>Admin Portal | Uyarcha</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className="container py-20 flex justify-center">
          <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 text-accent rounded-xl mb-4">
                <ShieldCheck size={26} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
              <p className="text-muted-foreground text-xs mt-1">
                Enter your Supabase administrator credentials
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting || lockoutTimer > 0}
                    placeholder="admin@example.com"
                    className="w-full border border-border rounded-xl pl-9 pr-3 py-3 bg-muted/30 focus:bg-background outline-none transition-all focus:ring-2 focus:ring-accent/20 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting || lockoutTimer > 0}
                    placeholder="••••••••••••"
                    className="w-full border border-border rounded-xl pl-9 pr-3 py-3 bg-muted/30 focus:bg-background outline-none transition-all focus:ring-2 focus:ring-accent/20 text-sm"
                  />
                </div>
              </div>

              {lockoutTimer > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs text-center font-bold">
                  Lockout active. Try again in {lockoutTimer}s
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || lockoutTimer > 0}
                className="w-full bg-accent text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In to Admin"
                )}
              </button>
            </form>

            <p className="text-[11px] text-muted-foreground text-center mt-6">
              Protected by Supabase Auth & Role-Based Access Control.
              <br />
              Public sign-ups are disabled.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // 3. Verifying Existing TOTP MFA (AAL2 Challenge)
  if (authState === "verifying_mfa") {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 text-accent rounded-xl mb-4">
                <Key size={26} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Two-Factor Auth</h1>
              <p className="text-muted-foreground text-xs mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  autoFocus
                  required
                  className="w-full border border-border rounded-xl p-3 text-center text-2xl font-mono tracking-widest bg-muted/30 focus:bg-background outline-none transition-all focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingMfa || totpCode.length !== 6}
                className="w-full bg-accent text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifyingMfa ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <button
                onClick={() => handleSignOut()}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
              >
                <LogOut size={14} /> Cancel and sign out
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 4. First-time MFA Enrollment
  if (authState === "enrolling_mfa") {
    return (
      <Layout>
        <div className="container py-16 flex justify-center">
          <div className="w-full max-w-lg bg-card p-8 rounded-2xl border border-border shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 text-accent rounded-xl mb-3">
                <QrCode size={26} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Enroll MFA Authenticator</h1>
              <p className="text-muted-foreground text-xs mt-1">
                Scan the QR code with Google Authenticator, 1Password, or Authy
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {mfaQrCode && (
              <div className="flex flex-col items-center my-6 p-4 bg-white rounded-2xl w-fit mx-auto border border-border">
                <img
                  src={mfaQrCode}
                  alt="MFA QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              </div>
            )}

            {mfaSecret && (
              <div className="mb-6 p-3 bg-muted rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                  Or enter secret code manually:
                </p>
                <code className="text-xs font-mono select-all font-bold text-foreground">
                  {mfaSecret}
                </code>
              </div>
            )}

            <form onSubmit={handleConfirmEnrollment} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Enter 6-digit confirmation code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  className="w-full border border-border rounded-xl p-3 text-center text-2xl font-mono tracking-widest bg-muted/30 focus:bg-background outline-none transition-all focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingMfa || totpCode.length !== 6}
                className="w-full bg-accent text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifyingMfa ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  "Activate MFA & Proceed"
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <button
                onClick={() => handleSignOut()}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
              >
                <LogOut size={14} /> Cancel and sign out
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 5. Authenticated & MFA AAL2 verified
  return <>{children}</>;
};

export default ProtectedRoute;
