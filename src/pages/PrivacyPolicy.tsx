import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <section className="container py-12 md:py-20 animate-fade-in">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert lg:prose-lg text-sm md:text-base">
          <nav className="text-sm text-muted-foreground mb-8 not-prose">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Privacy Policy</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Data Privacy Commitment</h1>

          <p className="lead text-lg text-muted-foreground mb-12">
            At <strong>Uyarcha</strong>, protecting your intellectual privacy is a core component of our organizational DNA. This Privacy Policy outlines the specific types of information we collect, the rigorous security protocols we employ, and how we utilize your data to enhance your technical learning experience.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">1. Data Architecture & Collection</h2>
          <p>
            We collect data only by fair and lawful means, with your explicit knowledge and consent, to provide you with high-quality services.
          </p>
          <ul className="list-disc pl-6 space-y-3 my-6">
            <li>
                <strong>Direct Input:</strong> This includes your name and email address when you voluntarily submit our contact form or subscribe to our newsletter.
            </li>
            <li>
                <strong>Anonymized Usage Analytics:</strong> We aggregate metadata such as browser type, time spent on specific tutorials, and general location data (e.g., city/country) to optimize platform performance.
            </li>
            <li>
                <strong>Session Identifiers:</strong> Minimal cookie-based data is stored to maintain login sessions and user preferences.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">2. Utilization of Information</h2>
          <p>
            The data we collect is utilized strictly for the following operational purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>To personalize and refine tech-learning content.</li>
            <li>To facilitate rapid and accurate responses to your support inquiries.</li>
            <li>To conduct security monitoring and mitigate potential unauthorized system access.</li>
            <li>To analyze platform uptime and performance bottlenecks.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">3. Third-Party Integrations</h2>
          <p>
            Uyarcha collaborates with a limited number of industry-leading service providers to maintain our technical infrastructure. These third parties are bound by strict data processing agreements:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li><strong>Supabase:</strong> Provides our encrypted database and secure authentication services.</li>
            <li><strong>Resend:</strong> Manages our robust and secure email delivery infrastructure.</li>
            <li><strong>Analytics Providers:</strong> Aggregate data for performance monitoring and user behavioral analysis.</li>
            <li><strong>Certificate Providers:</strong> Integrated links for verifiable achievement tracking.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">4. Data Governance & Security</h2>
          <p>
            We maintain the highest standards of data governance. Under no circumstances do we sell, trade, or rent your personally identifiable information to third parties for marketing purposes. All data is stored using commercially acceptable, encrypted methods through our distributed database providers to ensure protection against unauthorized access.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">5. User Agency & Rights</h2>
          <p>
            We believe you should have complete agency over your digital footprint. As a Uyarcha user, you have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
             <li>Request a copy of the data we have currently stored.</li>
             <li>Request the immediate and permanent deletion of your personal account data.</li>
             <li>Opt-out of optional analytics tracking through your browser settings.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">6. Contact Data</h2>
          <p>
            If you have additional questions regarding our data privacy practices or require more information about our technical infrastructure, please do not hesitate to contact our technical team:
          </p>
          <div className="p-6 bg-secondary/30 rounded-2xl border border-border mt-6">
             <span className="block font-bold">Email:</span>
             <a href="mailto:contact@uyarcha.tech" className="text-accent hover:underline break-words">contact@uyarcha.tech</a>
          </div>

          <p className="text-xs text-muted-foreground mt-16 pt-6 border-t border-border italic text-center">
            Protocol Version: 2.1.0 • Last Updated: April 1, 2026
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
