import React, { useEffect, useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { ShieldCheck, Lock, Mail, Key, AlertCircle, Loader2, QrCode, LogOut, RefreshCw } from "lucide-react";

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

// Safe diagnostic logging helpers (never log credentials or tokens)
const logAuth = (stage: string, details?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[AdminAuth] ${stage}`, details !== undefined ? details : "");
  }
};

const logAuthError = (stage: string, error?: any) => {
  console.error(`[AdminAuth] ${stage}`, error?.message || error || "");
};

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

  // Guards against concurrent / stale async operations
  const isMountedRef = useRef(true);
  const verifyingRef = useRef(false);
  const isAccessDeniedRef = useRef(false);
  const authSeqRef = useRef(0);

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
    logAuth("Signing out user");
    isAccessDeniedRef.current = false;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      logAuthError("Error during sign out:", err);
    }
    if (isMountedRef.current) {
      setAuthState("unauthenticated");
      setErrorMessage(null);
      setMfaFactorId(null);
      setMfaQrCode(null);
      setMfaSecret(null);
      setTotpCode("");
      if (reason) {
        toast.info(reason);
      }
    }
  }, []);

  // Check user role in public.profiles and evaluate MFA assurance level
  const verifyAccessAndMfa = useCallback(async (userId: string, seq: number) => {
    if (verifyingRef.current) {
      logAuth("Verification already in progress, skipping duplicate call");
      return;
    }
    verifyingRef.current = true;

    try {
      logAuth("Beginning role verification for userId:", userId);

      // 1. Fetch role strictly from public.profiles
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle();

      if (!isMountedRef.current || seq !== authSeqRef.current) return;

      if (profileErr) {
        logAuthError("Profile query failed with error:", profileErr);
        isAccessDeniedRef.current = true;
        setErrorMessage(
          `Database authorization query failed: ${profileErr.message}. Verify that the public.profiles table exists and RLS policies allow SELECT for authenticated users.`
        );
        setAuthState("access_denied");
        await supabase.auth.signOut();
        return;
      }

      if (!profile) {
        logAuthError("No public.profiles record found for user:", userId);
        isAccessDeniedRef.current = true;
        setErrorMessage(
          "Access Denied: Your account authenticated successfully, but no administrator profile was found in public.profiles. An authorized database administrator must assign the 'admin' role in Supabase."
        );
        setAuthState("access_denied");
        await supabase.auth.signOut();
        return;
      }

      if (profile.role !== requiredRole) {
        logAuthError("Role mismatch:", { actual: profile.role, required: requiredRole });
        isAccessDeniedRef.current = true;
        setErrorMessage(
          `Access Denied: Your account role is '${profile.role || "unknown"}', but '${requiredRole}' privileges are required to access the Admin Portal.`
        );
        setAuthState("access_denied");
        await supabase.auth.signOut();
        return;
      }

      logAuth("Administrator authorization confirmed for user:", userId);
      isAccessDeniedRef.current = false;
      setErrorMessage(null);

      // 2. Multi-Factor Authentication (AAL2 Check)
      let aalData: any = null;
      try {
        const res = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        aalData = res.data;
        logAuth("MFA Assurance Level:", aalData?.currentLevel);
      } catch (e) {
        logAuthError("AAL check skipped:", e);
      }

      let factorData: any = null;
      try {
        const res = await supabase.auth.mfa.listFactors();
        factorData = res.data;
      } catch (e) {
        logAuthError("List factors error:", e);
      }

      if (!isMountedRef.current || seq !== authSeqRef.current) return;

      const allFactors: any[] = factorData?.all || factorData?.totp || [];
      const totpFactors = allFactors.filter((f: any) => f.factor_type === "totp" || !f.factor_type);
      const verifiedFactors = totpFactors.filter((f: any) => f.status === "verified");
      const unverifiedFactors = totpFactors.filter((f: any) => f.status === "unverified");

      if (verifiedFactors && verifiedFactors.length > 0) {
        // User has already enrolled and verified TOTP
        if (aalData?.currentLevel === "aal2") {
          logAuth("AAL2 already achieved. Access granted.");
          setAuthState("authenticated");
        } else {
          logAuth("AAL1 session: prompting for TOTP code challenge.");
          setMfaFactorId(verifiedFactors[0].id);
          setAuthState("verifying_mfa");
        }
      } else {
        // Clean up any stale unverified factors before enrolling
        for (const unverified of unverifiedFactors) {
          try {
            await supabase.auth.mfa.unenroll({ factorId: unverified.id });
          } catch {
            // ignore cleanup errors
          }
        }

        // Start fresh enrollment with unique friendly name
        logAuth("Enrolling new TOTP authenticator factor...");
        try {
          const { data: enrollData, error: enrollErr } =
            await supabase.auth.mfa.enroll({
              factorType: "totp",
              issuer: "Uyarcha",
              friendlyName: `Admin Authenticator ${Date.now().toString().slice(-4)}`,
            });

          if (!isMountedRef.current || seq !== authSeqRef.current) return;

          if (enrollErr || !enrollData) {
            logAuthError("MFA enrollment setup failed:", enrollErr);
            isAccessDeniedRef.current = true;
            setErrorMessage(
              "MFA enrollment required: " +
                (enrollErr?.message || "Unable to initialize TOTP authenticator.")
            );
            setAuthState("access_denied");
            await supabase.auth.signOut();
          } else {
            logAuth("MFA enrollment QR generated. Transitioning to enrolling_mfa.");
            setMfaFactorId(enrollData.id);
            setMfaQrCode(enrollData.totp.qr_code);
            setMfaSecret(enrollData.totp.secret);
            setAuthState("enrolling_mfa");
          }
        } catch (enrollException: any) {
          logAuthError("MFA enroll exception:", enrollException);
          isAccessDeniedRef.current = true;
          setErrorMessage(
            "MFA enrollment failure: " + (enrollException?.message || "Unexpected enrollment error.")
          );
          setAuthState("access_denied");
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      logAuthError("Auth verification unexpected error:", err);
      if (isMountedRef.current && seq === authSeqRef.current) {
        setErrorMessage(err.message || "Failed to verify administrator privileges.");
        setAuthState("unauthenticated");
      }
    } finally {
      verifyingRef.current = false;
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [requiredRole]);

  // Session check and auth change listener
  useEffect(() => {
    isMountedRef.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logAuth("Auth state change event received:", event);
        if (!isMountedRef.current) return;

        if (event === "SIGNED_OUT" || !session) {
          // If sign out was caused by access denial, preserve the access_denied state and message
          if (isAccessDeniedRef.current) {
            logAuth("Preserving access_denied state after sign-out event");
            setAuthState("access_denied");
          } else {
            setAuthState("unauthenticated");
          }
        } else if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          const seq = ++authSeqRef.current;
          await verifyAccessAndMfa(session.user.id, seq);
        }
      }
    );

    // Initial session fallback check only if still checking
    const initFallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMountedRef.current) return;
        if (!session && !isAccessDeniedRef.current) {
          setAuthState((current) => (current === "checking" ? "unauthenticated" : current));
        }
      } catch (err) {
        logAuthError("Initial getSession error:", err);
        if (isMountedRef.current && !isAccessDeniedRef.current) {
          setAuthState((current) => (current === "checking" ? "unauthenticated" : current));
        }
      }
    };

    initFallback();

    return () => {
      isMountedRef.current = false;
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
    if (isSubmitting || lockoutTimer > 0) return;

    isAccessDeniedRef.current = false;
    setErrorMessage(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim();
    logAuth("Submitting login form for:", cleanEmail);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        logAuthError("signInWithPassword failed:", error);
        const nextFailures = failedAttempts + 1;
        setFailedAttempts(nextFailures);

        if (nextFailures >= MAX_LOGIN_ATTEMPTS) {
          setLockoutTimer(LOCKOUT_DURATION_MS / 1000);
          setFailedAttempts(0);
          setErrorMessage(
            "Too many failed login attempts. Locked out for 30 seconds."
          );
        } else {
          // Provide distinct, actionable error descriptions
          if (error.message.includes("Invalid login credentials")) {
            setErrorMessage(
              `Invalid email or password. Please verify your administrator credentials. (${MAX_LOGIN_ATTEMPTS - nextFailures} attempts remaining)`
            );
          } else if (error.message.includes("Email not confirmed")) {
            setErrorMessage(
              "Email not confirmed. Please confirm your email address in Supabase Auth before signing in."
            );
          } else if (error.status === 0 || error.message.toLowerCase().includes("fetch") || error.message.toLowerCase().includes("network")) {
            setErrorMessage(
              "Unable to reach the Supabase authentication service. Please check your network connection and Supabase URL."
            );
          } else {
            setErrorMessage(
              `${error.message} (${MAX_LOGIN_ATTEMPTS - nextFailures} attempts remaining)`
            );
          }
        }
        setIsSubmitting(false);
        return;
      }

      // Successful password validation
      logAuth("Password sign in succeeded. Awaiting role authorization...");
      setFailedAttempts(0);
      setLockoutTimer(0);

      if (data.user) {
        const seq = ++authSeqRef.current;
        await verifyAccessAndMfa(data.user.id, seq);
      }
    } catch (err: any) {
      logAuthError("Unexpected login exception:", err);
      setErrorMessage(err.message || "An unexpected error occurred during sign in.");
      setIsSubmitting(false);
    }
  };

  // Verify existing TOTP code challenge
  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !totpCode.trim() || isVerifyingMfa) return;

    setIsVerifyingMfa(true);
    setErrorMessage(null);
    logAuth("Submitting TOTP verification code for factor:", mfaFactorId);

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

      logAuth("MFA challenge verified successfully. Access granted.");
      toast.success("MFA authentication successful");
      setAuthState("authenticated");
    } catch (err: any) {
      logAuthError("TOTP verification error:", err);
      setErrorMessage(err.message || "Invalid or expired verification code. Please try again.");
    } finally {
      if (isMountedRef.current) {
        setIsVerifyingMfa(false);
      }
    }
  };

  // Confirm new TOTP enrollment
  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !totpCode.trim() || isVerifyingMfa) return;

    setIsVerifyingMfa(true);
    setErrorMessage(null);
    logAuth("Confirming TOTP enrollment for factor:", mfaFactorId);

    try {
      const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: totpCode.trim(),
      });

      if (verifyErr) {
        throw verifyErr;
      }

      logAuth("MFA factor successfully activated. Access granted.");
      toast.success("MFA TOTP successfully enrolled and activated!");
      setAuthState("authenticated");
    } catch (err: any) {
      logAuthError("MFA enrollment verification error:", err);
      setErrorMessage(
        err.message || "Failed to verify authenticator code. Please check the code and try again."
      );
    } finally {
      if (isMountedRef.current) {
        setIsVerifyingMfa(false);
      }
    }
  };

  // Clear errors when the user edits input fields
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage && authState !== "access_denied") {
      setErrorMessage(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage && authState !== "access_denied") {
      setErrorMessage(null);
    }
  };

  // 1. Initial verification loading state (No public layout, clean admin-specific screen)
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

  // 2. Unauthenticated / Access Denied: Secure Login Form (with hideNavbar & hideFooter)
  if (authState === "unauthenticated" || authState === "access_denied") {
    return (
      <Layout hideNavbar={true} hideFooter={true}>
        <Helmet>
          <title>Admin Portal | Uyarcha</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className="container min-h-screen flex items-center justify-center py-12">
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
                <div className="space-y-1">
                  <span className="leading-relaxed font-medium block">{errorMessage}</span>
                  {authState === "access_denied" && (
                    <button
                      type="button"
                      onClick={() => {
                        isAccessDeniedRef.current = false;
                        setErrorMessage(null);
                        setAuthState("unauthenticated");
                      }}
                      className="text-[11px] font-semibold underline hover:opacity-80 mt-1 inline-block"
                    >
                      Try signing in with a different account
                    </button>
                  )}
                </div>
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
                    onChange={handleEmailChange}
                    required
                    disabled={isSubmitting || lockoutTimer > 0}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="w-full border border-border rounded-xl pl-9 pr-3 py-3 bg-muted/30 focus:bg-background outline-none transition-all focus:ring-2 focus:ring-accent/20 text-sm disabled:opacity-50"
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
                    onChange={handlePasswordChange}
                    required
                    disabled={isSubmitting || lockoutTimer > 0}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full border border-border rounded-xl pl-9 pr-3 py-3 bg-muted/30 focus:bg-background outline-none transition-all focus:ring-2 focus:ring-accent/20 text-sm disabled:opacity-50"
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
                    <span>Signing in...</span>
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

  // 3. Verifying Existing TOTP MFA (AAL2 Challenge) (with hideNavbar & hideFooter)
  if (authState === "verifying_mfa") {
    return (
      <Layout hideNavbar={true} hideFooter={true}>
        <Helmet>
          <title>MFA Verification | Uyarcha</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className="container min-h-screen flex items-center justify-center py-12">
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
                  disabled={isVerifyingMfa}
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
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <button
                type="button"
                onClick={() => handleSignOut("Signed out from MFA verification.")}
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

  // 4. First-time MFA Enrollment (with hideNavbar & hideFooter)
  if (authState === "enrolling_mfa") {
    return (
      <Layout hideNavbar={true} hideFooter={true}>
        <Helmet>
          <title>Enroll MFA | Uyarcha</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className="container min-h-screen flex items-center justify-center py-12">
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
                  disabled={isVerifyingMfa}
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
                    <span>Activating...</span>
                  </>
                ) : (
                  "Activate MFA & Proceed"
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <button
                type="button"
                onClick={() => handleSignOut("Signed out from MFA enrollment.")}
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
