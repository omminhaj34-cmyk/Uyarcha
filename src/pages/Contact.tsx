import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!turnstileSiteKey) return;
    const scriptId = "cf-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => {
        if ((window as any).turnstile) {
          (window as any).turnstile.render("#turnstile-widget", {
            sitekey: turnstileSiteKey,
            callback: (token: string) => setTurnstileToken(token),
          });
        }
      };
    }
  }, [turnstileSiteKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        const payload = {
          ...formData,
          honeypot: honeypot.trim(),
          turnstileToken,
        };

        const { data, error } = await supabase.functions.invoke('send-contact-email', {
            body: payload,
        });

        // 1. Check for transport level error (CORS, network, etc.)
        if (error) {
            throw new Error(error.message || "Failed to reach email service");
        }

        // 2. Check for logic level error (Validation, Resend failure)
        if (data && data.success === false) {
            throw new Error(data.error || "Failed to process email");
        }

        toast({
            title: "Message sent successfully!",
            description: "We'll get back to you as soon as possible.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
        setHoneypot("");
    } catch (err: any) {
        toast({
            variant: "destructive",
            title: "Failed to send message",
            description: err.message || "Something went wrong. Please try again later.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="container py-12 md:py-20 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Contact</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
            Do you have a question, inquiry, or suggestion regarding <Link to="/about" className="text-accent hover:underline">Uyarcha</Link>? Or perhaps you've built a new AI tool you'd like us to review? We would love to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-secondary p-3 rounded-full text-foreground">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <p className="text-muted-foreground">uyarchatech@gmail.com</p>
                  <p className="text-sm text-muted-foreground mt-1">We typically respond within 1-2 business days.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-secondary p-3 rounded-full text-foreground">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Location</h3>
                  <p className="text-muted-foreground">Thrissur, Kerala, India</p>
                </div>
              </div>


            </div>

            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                    <input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="johndoe@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Write your message here..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                  />
                </div>

                {/* Anti-bot Honeypot field (hidden from real users) */}
                <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                  <label htmlFor="website_hp">Leave this field blank</label>
                  <input
                    type="text"
                    id="website_hp"
                    name="website_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {turnstileSiteKey && (
                  <div className="flex justify-center my-4">
                    <div id="turnstile-widget" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  For information on how we handle your data, please see our <Link to="/privacy-policy" className="hover:text-accent underline">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
