import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { reopenCookieConsent } from "@/lib/cookieConsent";
import {
  ShieldCheck,
  Lock,
  Cookie,
  Mail,
  ExternalLink,
  Globe,
  Server,
  Sliders,
  AlertCircle,
  FileText,
} from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | Uyarcha</title>
        <meta
          name="description"
          content="Uyarcha Privacy Policy: Transparent disclosures on data collection, Google AdSense cookies, third-party services, and user privacy choices."
        />
        <link rel="canonical" href="https://uyarcha.tech/privacy-policy" />
      </Helmet>

      <section className="container py-12 md:py-20 animate-fade-in max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-xs mb-4">
            <ShieldCheck size={14} />
            <span>Transparency & Privacy Disclosures</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong>Effective Date:</strong> October 15, 2026 • <strong>Canonical Domain:</strong>{" "}
            <a href="https://uyarcha.tech" className="text-accent underline font-medium">
              https://uyarcha.tech
            </a>
          </p>
        </div>

        {/* Document Body */}
        <div className="space-y-12 text-sm md:text-base leading-relaxed text-foreground/90">
          {/* 1. Introduction */}
          <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText size={20} className="text-accent" />
              <span>1. Introduction</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Welcome to <strong>Uyarcha</strong> (<a href="https://uyarcha.tech" className="text-accent underline">https://uyarcha.tech</a>), an independent educational technology publication and learning platform. We publish articles, practical programming tutorials, and technical insights covering software engineering, artificial intelligence, web development, and data science.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This Privacy Policy explains clearly and transparently what information is collected when you visit our website, how that data is used, how cookies and third-party advertising partners (such as Google AdSense) operate on our site, and how you can exercise control over your privacy choices.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions regarding this policy or our data practices, please contact us directly at{" "}
              <a href="mailto:uyarchatech@gmail.com" className="text-accent underline font-semibold">
                uyarchatech@gmail.com
              </a>.
            </p>
          </div>

          {/* 2. Information We Collect */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              We collect and process only the minimal information necessary to deliver, protect, and maintain our educational publication:
            </p>
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-foreground mb-1">
                  A. Information You Voluntarily Provide
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When you submit a message through our <Link to="/contact" className="text-accent underline">Contact Form</Link>, we receive the personal details you enter: your name, email address, subject line, and the text of your message. This information is used solely to respond to your inquiry or feedback.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-foreground mb-1">
                  B. Administrator Authentication Credentials
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For authorized website administrators accessing the administrative portal (<code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">/admin</code>), email and password credentials are processed securely via Supabase Auth to verify role permissions and administrative access. Public registration is disabled.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-foreground mb-1">
                  C. Technical & Security Request Information
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When your browser connects to our web servers, standard internet technical metadata is processed automatically by our hosting infrastructure and Content Delivery Network (Cloudflare). This includes your IP address, browser type, operating system, referring URL, and the date and time of requests. This data is processed in transit to protect against Distributed Denial of Service (DDoS) attacks, detect malicious traffic, and prevent spam bots via Cloudflare Turnstile.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-foreground mb-1">
                  D. Local Storage & Consent Preferences
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We store your chosen cookie consent status (<code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">accepted</code> or <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">declined</code>) in your browser's local storage under the key <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">uyarcha_cookie_consent</code> so that you do not see the consent prompt on every subsequent page load.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-foreground mb-1">
                  E. Third-Party Advertising Data (Google AdSense)
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When advertising services are active and non-essential cookies are consented to, third-party advertising networks (primarily Google AdSense) may process cookie identifiers, IP addresses, browser and device characteristics, and information relating to ad interactions to serve and measure advertisements.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic mt-4">
              Transparency note: Uyarcha does not install proprietary invasive user tracking scripts, third-party social media tracking pixels, or standalone analytics platforms (such as Google Analytics). We do not falsely claim that technical request data is completely anonymous, as IP addresses may constitute personal data under applicable privacy laws.
            </p>
          </div>

          {/* 3. How Information Is Used */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              3. How Information Is Used
            </h2>
            <p className="text-muted-foreground mb-4">
              The information collected or processed on Uyarcha is utilized strictly for lawful, legitimate technical and operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
              <li>
                <strong>Website Operation & Delivery:</strong> To deliver articles, code tutorials, images, and verified certificate credentials securely and reliably.
              </li>
              <li>
                <strong>Responding to Communication:</strong> To read, evaluate, and reply to messages, inquiries, bug reports, and suggestions submitted via our contact form.
              </li>
              <li>
                <strong>Security & Bot Mitigation:</strong> To detect automated bot activity, mitigate spam form submissions via Cloudflare Turnstile, and protect the server infrastructure against malicious exploits.
              </li>
              <li>
                <strong>Administrative Access Control:</strong> To authenticate authorized administrative sessions and enforce role-based access control.
              </li>
              <li>
                <strong>Delivering Digital Advertisements:</strong> To display contextual and relevant advertisements via Google AdSense when advertising services are active, helping support the operational costs of maintaining free educational content.
              </li>
            </ul>
          </div>

          {/* 4. Cookies and Similar Technologies */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              4. Cookies & Similar Technologies
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small data files placed on your device by websites you visit. Local storage is a browser technology that allows websites to store key-value data directly on your device.
            </p>
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-foreground mb-1">
                  Essential Cookies & Storage
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These items are strictly necessary for the site to function properly. They include your cookie consent choice (<code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">uyarcha_cookie_consent</code>), session authentication tokens for logged-in administrators, and security challenge tokens generated by Cloudflare Turnstile to prevent spam attacks. Essential items do not require prior consent because the website cannot operate securely without them.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-bold text-foreground mb-1">
                  Advertising & Third-Party Cookies
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When enabled, Google and third-party vendors place cookies (such as DoubleClick and Google advertising cookies) to serve ads based on your prior visits to Uyarcha and other websites. These cookies allow Google and its partners to measure ad performance, prevent repetitive ads, and tailor advertising to your technical interests.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Our on-site consent banner allows you to select &ldquo;Essential Only&rdquo; or &ldquo;Accept All.&rdquo; Selecting &ldquo;Essential Only&rdquo; pauses the loading of Google AdSense scripts on our pages. You can revisit and change this preference at any time using our controls below.
            </p>
          </div>

          {/* 5. Google AdSense & Third-Party Advertising */}
          <div className="p-6 rounded-2xl border-2 border-accent/30 bg-accent/5">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Globe size={22} className="text-accent" />
              <span>5. Google AdSense & Third-Party Advertising</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Uyarcha is integrated with <strong>Google AdSense</strong> to display advertisements that help fund our free learning resources and server operations. We provide the following disclosures regarding how Google uses data on partner websites:
            </p>

            <ul className="list-disc pl-5 space-y-3 text-sm text-muted-foreground mb-6">
              <li>
                <strong>Third-Party Vendors & Cookies:</strong> Google and other third-party advertising vendors use cookies to serve ads based on a user's prior visits to this website or other sites on the internet.
              </li>
              <li>
                <strong>Information Processed by Google:</strong> Advertising technologies may process your IP address, browser and device characteristics, unique cookie identifiers, and interaction data relating to ad impressions and clicks. Uyarcha does not possess or store this information independently.
              </li>
              <li>
                <strong>Personalized Advertising:</strong> Google's use of advertising cookies enables it and its partners to serve personalized ads based on your visit to Uyarcha and/or other sites across the internet.
              </li>
              <li>
                <strong>Opting Out of Personalization:</strong> You may opt out of personalized advertising at any time by visiting Google's ad controls or recognized industry opt-out portals. Opting out of personalized advertising does not eliminate advertisements; instead, ads served to you will be contextual (based on the content of the page you are viewing) rather than customized to your previous browsing history.
              </li>
            </ul>

            <div className="p-5 rounded-xl bg-card border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground mb-2">
                Official Google & Industry Privacy Resources:
              </h3>
              <ul className="space-y-2 text-xs md:text-sm">
                <li>
                  <a
                    href="https://support.google.com/adsense/answer/7549925"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline font-semibold inline-flex items-center gap-1.5 hover:opacity-90"
                  >
                    <span>Google AdSense Help: Advertising and Cookies</span>
                    <ExternalLink size={13} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://adssettings.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline font-semibold inline-flex items-center gap-1.5 hover:opacity-90"
                  >
                    <span>Google Ads Settings (Manage Your Personal Ad Preferences)</span>
                    <ExternalLink size={13} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://policies.google.com/technologies/partner-sites"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline font-semibold inline-flex items-center gap-1.5 hover:opacity-90"
                  >
                    <span>How Google Uses Data from Sites or Apps that Use Our Services</span>
                    <ExternalLink size={13} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline font-semibold inline-flex items-center gap-1.5 hover:opacity-90"
                  >
                    <span>Digital Advertising Alliance (DAA) Consumer Choice Opt-Out</span>
                    <ExternalLink size={13} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 6. Third-Party Service Providers */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              6. Third-Party Service Providers
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To operate a secure and reliable web application, Uyarcha relies on a minimal set of established cloud infrastructure providers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1.5">
                  <Server size={16} className="text-accent" />
                  <span>Supabase</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Provides our cloud PostgreSQL database, administrator authentication, and media storage bucket for article graphics. Data is protected by Row-Level Security policies.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1.5">
                  <Mail size={16} className="text-accent" />
                  <span>Resend</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transactional email delivery infrastructure invoked via Supabase Edge Functions to transmit your contact form submissions to our administrator inbox.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1.5">
                  <ShieldCheck size={16} className="text-accent" />
                  <span>Cloudflare</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Manages global DNS resolution, Content Delivery Network caching, SSL/TLS transport encryption, and Cloudflare Turnstile bot verification on our contact form.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1.5">
                  <Globe size={16} className="text-accent" />
                  <span>Google AdSense</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Digital advertising infrastructure used to serve contextual and programmatic advertisements on eligible public pages.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              We do not share your contact messages or personal information with third parties for marketing purposes. Data shared with infrastructure providers is strictly limited to what is technically required to host, deliver, and secure the website.
            </p>
          </div>

          {/* 7. Data Retention & Security */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              7. Data Retention & Security
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                <strong>Retention Periods:</strong> Messages submitted through the contact form are retained only for as long as necessary to address your inquiry, provide technical support, or fulfill reasonable recordkeeping requirements. When correspondence is concluded, outdated messages are periodically purged. Administrative session tokens expire automatically after 30 minutes of inactivity.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Security Measures:</strong> We employ standard, verifiable safeguards to protect data in transit and at rest. All website connections enforce HTTPS with modern TLS encryption. Database access is governed by strict PostgreSQL Row-Level Security (RLS) policies, and administrative credentials are cryptographically hashed by Supabase Auth.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Important Notice: While we implement industry-standard security safeguards, no method of electronic storage or transmission over the public internet can be guaranteed as 100% impenetrable. Consequently, we cannot guarantee absolute, infallible security.
              </p>
            </div>
          </div>

          {/* 8. User Privacy Choices & Consent Management */}
          <div className="p-6 rounded-2xl bg-secondary/40 border border-border">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Sliders size={20} className="text-accent" />
              <span>8. Your Privacy Choices & Rights</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have several practical options to control how your data is handled when using Uyarcha:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-6">
              <li>
                <strong>Browser Cookie Controls:</strong> You can configure your browser to block, delete, or alert you about cookies. Note that blocking all cookies may affect basic functionality such as remembering your preferences.
              </li>
              <li>
                <strong>Advertising Opt-Outs:</strong> You can opt out of personalized ads via{" "}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline font-medium"
                >
                  Google Ads Settings
                </a>{" "}
                and the{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline font-medium"
                >
                  DAA WebChoices Tool
                </a>.
              </li>
              <li>
                <strong>On-Site Consent Modification:</strong> You can change your on-site cookie preference on Uyarcha at any time by clicking the button below:
              </li>
            </ul>

            {/* Interactive Cookie Preference Re-opener */}
            <div className="pt-2 pb-4">
              <button
                type="button"
                onClick={reopenCookieConsent}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-accent/20 cursor-pointer"
              >
                <Cookie size={16} />
                <span>Manage Cookie Preferences</span>
              </button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <strong>Access, Correction & Deletion:</strong> If you have submitted your name and email through our contact form and wish to request access, correction, or deletion of your message records, please send your request to{" "}
              <a href="mailto:uyarchatech@gmail.com" className="text-accent underline font-semibold">
                uyarchatech@gmail.com
              </a>.
            </p>
          </div>

          {/* 9. International Privacy & Consent Requirements */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              9. International Privacy & European Consent Requirements
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For users located in the European Economic Area (EEA), United Kingdom (UK), and Switzerland, specific regulatory frameworks (including the General Data Protection Regulation and ePrivacy Directive) govern the processing of personal data and the use of cookies for advertising purposes.
            </p>
            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <AlertCircle size={18} className="text-accent" />
                <span>Google-Certified CMP Requirement</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Google requires all publishers serving ads to users in the EEA, UK, and Switzerland to use an eligible Google-certified Consent Management Platform (CMP) integrated with the IAB Europe Transparency and Consent Framework (TCF v2.2) (see{" "}
                <a
                  href="https://support.google.com/adsense/answer/13554116"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline font-medium"
                >
                  Google's Certified CMP Requirements
                </a>).
              </p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                While Uyarcha provides an internal consent banner to respect visitor choices globally, compliance for European-region visitors requires implementing a certified CMP message directly through Google AdSense (under <em>Privacy & messaging</em> in the AdSense console). We do not misrepresent our lightweight React banner as an IAB TCF-certified CMP.
              </p>
            </div>
          </div>

          {/* 10. Data Sharing Disclosures */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              10. Data Sharing Disclosures
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Uyarcha does not sell, rent, or trade your personal information to data brokers or commercial third parties.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We share technical information solely with our verified service providers (Supabase, Resend, Cloudflare, and Google AdSense) to the extent strictly necessary to run, secure, host, and monetize our educational publication. We may also disclose information if required to do so by applicable law, court order, or governmental authority.
            </p>
          </div>

          {/* 11. Children's Privacy */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              11. Children's Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Uyarcha is an educational publication directed toward students, software developers, and technology enthusiasts aged 13 and older. We do not knowingly solicit or collect personal information from children under 13 (or under 16 where applicable by local law).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If a parent or legal guardian discovers that their child has submitted personal details through our contact form, please notify us immediately at{" "}
              <a href="mailto:uyarchatech@gmail.com" className="text-accent underline font-semibold">
                uyarchatech@gmail.com
              </a>. We will take prompt steps to verify and permanently delete the information from our records.
            </p>
          </div>

          {/* 12. Policy Updates */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              12. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our technology stack, service providers, legal requirements, or advertising practices. Any revisions will be published directly on this page with an updated &ldquo;Effective Date&rdquo; at the top. We encourage visitors to review this page periodically to stay informed about how we protect reader privacy.
            </p>
          </div>

          {/* 13. Contact Information */}
          <div className="p-6 rounded-2xl bg-secondary/50 border border-border space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              13. Contact Us
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions, feedback, or data requests regarding this Privacy Policy or our cookie disclosures, please contact us:
            </p>
            <div className="pt-1 space-y-1 text-sm text-foreground">
              <p>
                <strong>Website:</strong>{" "}
                <a href="https://uyarcha.tech" className="text-accent underline">
                  https://uyarcha.tech
                </a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:uyarchatech@gmail.com" className="text-accent underline font-semibold">
                  uyarchatech@gmail.com
                </a>
              </p>
              <p>
                <strong>Location:</strong> Thrissur, Kerala, India
              </p>
              <p>
                <strong>Contact Form:</strong>{" "}
                <Link to="/contact" className="text-accent underline font-medium">
                  https://uyarcha.tech/contact
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
