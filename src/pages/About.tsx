import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <Layout>
      <section className="container py-12 md:py-20 animate-fade-in">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert lg:prose-lg">
          <nav className="text-sm text-muted-foreground mb-8 not-prose">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">About</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">About Uyarcha</h1>


          <p className="lead text-xl text-muted-foreground mb-8">
            Welcome to <strong>Uyarcha</strong>, your premier destination for the latest tutorials, guides, and reviews in the ever-evolving world of technology. Our goal is to make complex tech topics accessible to everyone, from students embarking on their coding journey to seasoned developers looking to stay ahead of the curve.
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-4">Our Mission</h2>
          <p>
            Our mission is simple: to empower individuals with the knowledge they need to harness the power of modern technology. We believe that continuous learning is the key to success in the fast-paced tech industry. Through high-quality, actionable content, we aim to bridge the gap between theoretical concepts and practical applications.
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-4">What We Cover</h2>
          <ul className="space-y-4 my-6">
            <li>
              <strong>AI Tools:</strong> Discover the latest artificial intelligence software, read comprehensive reviews, and learn how to integrate these tools into your daily workflow to boost productivity.
            </li>
            <li>
              <strong>Machine Learning:</strong> Demystifying algorithms, neural networks, and data science. We offer beginner-friendly guides and advanced tutorials.
            </li>
            <li>
              <strong>Automation Tools:</strong> Streamline your personal and professional life by leveraging powerful automation platforms and scripts.
            </li>
            <li>
              <strong>Programming Resources:</strong> From Python and JavaScript to specialized frameworks, we provide resources, best practices, and project guides.
            </li>
          </ul>

          <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-4">About the Author</h2>
          <p>
            Hi, I'm the founder and chief editor of Uyarcha. With years of experience in software development and technical writing, I discovered a passion for breaking down complex tech topics. What started as personal notes quickly grew into a platform aimed at helping others overcome the typical roadblocks in tech education. When I'm not writing, I'm usually testing out the newest AI tools or experimenting with automation pipelines.
          </p>

          <p>
            Thank you for stopping by, and I hope you find our content valuable!
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default About;
