import Layout from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <section className="container py-12 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Introduction</h2>
            <p>Welcome to TheDailyBlog ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you subscribe to our newsletter, fill out a contact form, or leave a comment. This may include your name, email address, and any message content you provide.</p>
            <p>We also automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and pages viewed. This data helps us improve our website and provide a better user experience.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Use of Cookies</h2>
            <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and serve personalized advertisements. Cookies are small data files placed on your device that allow us to remember your preferences and provide relevant content.</p>
            <p>Third-party advertising partners, including Google AdSense, may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting Google's Ads Settings.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Google AdSense</h2>
            <p>We use Google AdSense to display advertisements on our website. Google AdSense uses cookies and web beacons to serve ads based on your visits to this and other websites. Google's use of the DART cookie enables it to serve ads based on your interests. You may opt out of the DART cookie by visiting the Google Ad and Content Network Privacy Policy.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Third-Party Services</h2>
            <p>We may use third-party service providers to help us operate our website, conduct our business, or service you. These third parties have access to your personal information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, delete, or port your data. To exercise any of these rights, please contact us using the information provided below.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Children's Privacy</h2>
            <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Email: privacy@thedailyblog.com</li>
              <li>Address: 123 Blog Street, Digital City</li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
