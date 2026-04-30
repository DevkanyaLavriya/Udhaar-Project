import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const MOCK_OTP = "1234";

const Login = () => {
  const navigate = useNavigate();
  const { session, login } = useStore();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resend, setResend] = useState(30);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  useEffect(() => {
    if (step !== "otp") return;
    setResend(30);
    const i = setInterval(() => setResend((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, [step]);

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
    if (next.every((d) => d) && next.join("") === MOCK_OTP) {
      setTimeout(() => verify(next.join("")), 150);
    }
  };

  const sendOtp = () => {
    if (phone.length !== 10) return;
    setStep("otp");
    toast.success("OTP sent", { description: `Use 1234 to sign in (demo mode)` });
  };

  const verify = (code = otp.join("")) => {
    if (code !== MOCK_OTP) {
      toast.error("Wrong code", { description: "Try 1234 — this is a demo" });
      setOtp(["", "", "", ""]);
      document.getElementById("otp-0")?.focus();
      return;
    }
    login(phone);
    toast.success("Welcome back to your khata");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-warm" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-cool" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-saffron/10 blur-3xl animate-float" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="size-14 rounded-3xl bg-gradient-primary flex items-center justify-center font-display font-bold text-2xl text-primary-foreground shadow-glow-saffron">U</div>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Welcome to Udhaar</h1>
          <p className="text-muted-foreground text-sm">Smart khata for the modern shopkeeper.</p>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-elegant-lg backdrop-blur-xl">
          {step === "phone" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="phone">
              <h2 className="font-display text-xl font-semibold mb-1">Sign in with phone</h2>
              <p className="text-sm text-muted-foreground mb-6">We'll send a 4-digit code to verify your number.</p>

              <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2 block">Mobile Number</label>
              <div className="flex h-14 rounded-2xl border border-border bg-surface-raised overflow-hidden focus-within:ring-2 focus-within:ring-ring/40 focus-within:border-ring/40 transition-smooth">
                <div className="px-4 flex items-center gap-2 border-r border-border">
                  <Smartphone className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="flex-1 px-4 bg-transparent focus:outline-none text-base placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                />
              </div>

              <Button onClick={sendOtp} disabled={phone.length !== 10} className="w-full h-12 mt-6 bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-2xl gap-2 shadow-glow-saffron disabled:opacity-50 disabled:shadow-none">
                Send OTP <ArrowRight className="size-4" />
              </Button>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <ShieldCheck className="size-3.5 text-cardamom" /> Demo mode · OTP is always <span className="font-semibold text-foreground">1234</span>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="otp">
              <h2 className="font-display text-xl font-semibold mb-1">Enter verification code</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Sent to <span className="text-foreground font-medium">+91 {phone}</span>{" "}
                <button onClick={() => setStep("phone")} className="text-saffron hover:underline ml-1">Edit</button>
              </p>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
                    }}
                    autoFocus={i === 0}
                    className={cn(
                      "h-16 text-center font-display font-semibold text-2xl rounded-xl bg-surface-raised border transition-smooth focus:outline-none focus:ring-2 focus:ring-ring/40",
                      d ? "border-saffron/40 text-saffron" : "border-border"
                    )}
                  />
                ))}
              </div>

              <Button onClick={() => verify()} className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-2xl gap-2 shadow-glow-saffron">
                <KeyRound className="size-4" /> Verify & Continue
              </Button>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                {resend > 0 ? (
                  <>Didn't get it? <span className="text-muted-foreground/60">Resend in {resend}s</span></>
                ) : (
                  <button onClick={() => { setResend(30); toast.success("OTP resent — still 1234"); }} className="text-saffron hover:underline font-medium">Resend code</button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Sparkles className="size-3 text-turmeric" /> Trusted by 10,000+ shopkeepers across India
        </div>
        <div className="mt-3 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Skip to demo →</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
