import { useState } from "react";
import Layout from "@/components/Layout";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <section className="container py-12 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-10">Have a question, suggestion, or business inquiry? We'd love to hear from you.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-8 text-center">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Thank You!</h2>
                <p className="text-muted-foreground">Your message has been received. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                    <input id="name" type="text" required maxLength={100} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input id="email" type="email" required maxLength={255} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                  <input id="subject" type="text" required maxLength={200} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                  <textarea id="message" rows={5} required maxLength={1000} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <button type="submit" className="px-8 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">Send Message</button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            {[
              { icon: Mail, title: "Email", text: "contact@thedailyblog.com" },
              { icon: MapPin, title: "Address", text: "123 Blog Street, Digital City" },
              { icon: Phone, title: "Phone", text: "+1 (555) 123-4567" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <div className="p-2.5 rounded-lg bg-accent/10">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
