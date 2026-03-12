import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <section className="container py-12 md:py-20 animate-fade-in">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert lg:prose-lg">
          <nav className="text-sm text-muted-foreground mb-8 not-prose">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Privacy Policy</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>


          <p className="lead text-xl text-muted-foreground mb-8">
            At <strong>Uyarcha</strong>, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Uyarcha and how we use it.
          </p>

          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to <Link to="/contact">contact us</Link>.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">1. Data We Collect</h2>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. For instance, when you submit a contact form or sign up for our newsletter. We collect it by fair and lawful means, with your knowledge and consent.
          </p>
          <p>
            We may collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Name and Email address (if provided in our contact form or newsletter).</li>
            <li>Usage Data (such as your IP address, browser type, and time spent on specific pages).</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">2. Google AdSense and Cookies</h2>
          <p>
            Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the internet.
          </p>
          <p>
            Our advertising partners may use cookies and web beacons on our site. Our advertising partners include Google AdSense.
          </p>
          <p>
            These third-party ad servers or ad networks use technology in their respective advertisements and links that appear on Uyarcha and which are sent directly to your browser. They automatically receive your IP address when this occurs. Other technologies (such as cookies, JavaScript, or Web Beacons) may also be used by our site's third-party ad networks to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on the site.
          </p>
          <p>
            Uyarcha has no access to or control over these cookies that are used by third-party advertisers.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">3. Third-Party Privacy Policies</h2>
          <p>
            Uyarcha's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. You can choose to disable cookies through your individual browser options.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">4. User Data Protection</h2>
          <p>
            We highly value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
          </p>
          <p>
            We do not share any personally identifying information publicly or with third-parties, except when required to by law.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">5. Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us via our <Link to="/contact">contact page</Link> or directly at <a href="mailto:hello@uyarcha.com" className="text-accent hover:underline">hello@uyarcha.com</a>.
          </p>

          <p className="text-sm text-muted-foreground mt-12 pt-6 border-t border-border">
            Last Updated: March 8, 2026
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
