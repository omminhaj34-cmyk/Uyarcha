import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | Uyarcha</title>
        <meta
          name="description"
          content="Uyarcha Privacy Policy: Details on data handling, Google AdSense cookies, third-party vendors, and user rights."
        />
      </Helmet>
      <section className="container py-12 md:py-20 animate-fade-in">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert lg:prose-lg text-sm md:text-base">
          <nav className="text-sm text-muted-foreground mb-8 not-prose">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Privacy Policy</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Data Privacy Commitment</h1>

          <p className="lead text-lg text-muted-foreground mb-12">
            At <strong>Uyarcha</strong> (https://uyarcha.tech), protecting your privacy and being transparent about data practices is paramount. This Privacy Policy outlines what information we collect, how we protect it, and our policies regarding cookies and third-party advertising partners such as Google AdSense.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">1. Data Architecture & Collection</h2>
          <p>
            We collect data only by fair and lawful means, with your explicit knowledge and consent, to provide you with high-quality services:
          </p>
          <ul className="list-disc pl-6 space-y-3 my-6">
            <li>
              <strong>Direct Input:</strong> Your name and email address when you voluntarily submit our contact form.
            </li>
            <li>
              <strong>Anonymized Usage Analytics:</strong> Metadata such as browser user agent, device category, time spent on tutorials, and generalized geographic metrics to optimize platform responsiveness.
            </li>
            <li>
              <strong>Session & Security Identifiers:</strong> Minimal cookie-based tokens to secure administrative sessions, prevent spam via Cloudflare Turnstile, and maintain user cookie consent preferences.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">2. Google AdSense & Third-Party Cookies</h2>
          <p>
            We partner with Google AdSense to display advertisements on Uyarcha. It is important that you understand how Google and third-party advertising networks use cookies on our site:
          </p>
          <ul className="list-disc pl-6 space-y-3 my-6">
            <li>
              <strong>Third-Party Vendors & Cookies:</strong> Google, as a third-party vendor, uses cookies to serve ads on Uyarcha. Google’s use of advertising cookies (such as the DoubleClick cookie) enables it and its partners to serve ads to our users based on their visits to our site and/or other sites across the Internet.
            </li>
            <li>
              <strong>Personalized Advertising:</strong> Ads displayed on this site may be personalized based on your browsing history, interests, and device characteristics unless you have opted out or declined non-essential cookies.
            </li>
            <li>
              <strong>How to Opt Out of Personalized Ads:</strong>
              <ul className="list-circle pl-6 space-y-2 mt-2">
                <li>
                  You can opt out of personalized advertising by visiting{" "}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline font-medium"
                  >
                    Google Ads Settings
                  </a>.
                </li>
                <li>
                  Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting the Digital Advertising Alliance at{" "}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline font-medium"
                  >
                    www.aboutads.info/choices
                  </a>{" "}
                  or the Network Advertising Initiative at{" "}
                  <a
                    href="https://www.networkadvertising.org/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline font-medium"
                  >
                    www.networkadvertising.org/choices
                  </a>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Cookie Consent Manager:</strong> You can modify or withdraw your cookie preferences on Uyarcha at any time using our on-site Cookie Consent banner.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">3. Utilization of Information</h2>
          <p>
            Information collected directly by Uyarcha is used strictly for legitimate technical purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>To publish technical tutorials, code reviews, and software documentation.</li>
            <li>To respond promptly to inquiries received through our contact form.</li>
            <li>To protect system integrity, detect malicious requests, and prevent automated bots.</li>
            <li>To monitor platform stability, load times, and reader engagement metrics.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">4. Third-Party Infrastructure Partners</h2>
          <p>
            Uyarcha works with trusted service providers to run our cloud architecture:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li><strong>Supabase:</strong> Encrypted PostgreSQL database, authentication, and secure media storage.</li>
            <li><strong>Resend:</strong> Transactional email delivery infrastructure for contact form communications.</li>
            <li><strong>Cloudflare:</strong> DNS hosting, Content Delivery Network (CDN), SSL encryption, and Turnstile bot protection.</li>
            <li><strong>Google AdSense:</strong> Contextual and personalized digital advertising infrastructure.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">5. Data Governance & Security</h2>
          <p>
            We enforce stringent data hygiene standards. We never sell, rent, or trade your personally identifiable information. All administrative transmissions utilize modern TLS 1.3 encryption, and database access is restricted by Row-Level Security (RLS).
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">6. User Rights & Data Deletion</h2>
          <p>
            Under applicable data protection regulations (including GDPR and CCPA), you have the right to request access to the personal data we hold about you, request corrections, or request deletion of any contact messages you have submitted.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-border pb-2">7. Contact Information</h2>
          <p>
            If you have questions about this Privacy Policy, our cookie disclosures, or data processing, please contact us:
          </p>
          <div className="p-6 bg-secondary/30 rounded-2xl border border-border mt-6 not-prose">
            <span className="block font-bold">Email:</span>
            <a href="mailto:contact@uyarcha.tech" className="text-accent hover:underline break-words">contact@uyarcha.tech</a>
          </div>

          <p className="text-xs text-muted-foreground mt-16 pt-6 border-t border-border italic text-center">
            Protocol Version: 3.0.0 • Last Updated: October 2026
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
