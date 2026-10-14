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

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Engineering the Future of Learning</h1>

          <p className="lead text-xl text-muted-foreground mb-8">
            <strong>Uyarcha</strong> is a modern technology learning platform dedicated to delivering curated insights, technical tutorials, and industry updates. We bridge the gap between complex engineering concepts and practical, real-world application, providing a space where innovation meets education.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-12">
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To simplify the rapidly evolving world of technology by empowering students, developers, and tech enthusiasts with high-quality educational resources that facilitate measurable professional growth.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To become the primary global learning hub for emerging technologies, where anyone—regardless of their starting point—can master new skills and stay competitive in a digital-first economy.
              </p>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">What We Cover</h2>
          <p>
            We focus on the pillars of modern digital infrastructure, ensuring our community stays updated on the tools and methodologies that drive today's top tech companies.
          </p>
          <ul className="space-y-4 my-8">
            <li>
              <strong>Artificial Intelligence & ML:</strong> From Large Language Models (LLMs) to neural network architectures, we break down how AI is reshaping industries.
            </li>
            <li>
              <strong>Data Science:</strong> Deep dives into data analysis, visualization, and the mathematical foundations of modern statistics.
            </li>
            <li>
              <strong>Modern Programming:</strong> Specialized tracks for Python, JavaScript/TypeScript, and high-performance system architectures.
            </li>
            <li>
              <strong>Automation & Cloud:</strong> Strategies for streamlining developer workflows using CI/CD pipelines, serverless computing, and infrastructure-as-code.
            </li>
          </ul>

          <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">Our Core Values</h2>
          <div className="grid grid-cols-2 gap-4 not-prose text-center mb-12">
             <div className="p-4 border border-border rounded-xl">
                <span className="block font-bold">Accuracy</span>
                <span className="text-xs text-muted-foreground">Peer-reviewed content.</span>
             </div>
             <div className="p-4 border border-border rounded-xl">
                <span className="block font-bold">Practicality</span>
                <span className="text-xs text-muted-foreground">Code-first learning.</span>
             </div>
             <div className="p-4 border border-border rounded-xl">
                <span className="block font-bold">Community</span>
                <span className="text-xs text-muted-foreground">Supportive networks.</span>
             </div>
             <div className="p-4 border border-border rounded-xl">
                <span className="block font-bold">Transparency</span>
                <span className="text-xs text-muted-foreground">Open-source roots.</span>
             </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">About the Founder</h2>
          <p>
            Hi, I'm the founder of Uyarcha. As a Computer Science student with a deep obsession for system architecture and modern web technologies, I built this platform to solve a personal problem: the lack of high-signal, fluff-free technical documentation. 
          </p>
          <p>
            Uyarcha is my commitment to the developer community—a custom-built CMS platform designed to share the knowledge I acquire while scaling my own technical skills.
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">Future Roadmap</h2>
          <p>
            We are just getting started. Our engineering pipeline includes several exciting features aimed at enhancing your learning experience:
          </p>
          <ul className="space-y-2">
             <li><strong>Certification Tracking:</strong> Integrated milestones to showcase your learning progress.</li>
             <li><strong>Real-time Tech News:</strong> A curated feed of industry shifts as they happen.</li>
             <li><strong>Learning Paths:</strong> Step-by-step curricula for mastering specific tech stacks.</li>
             <li><strong>Resource API:</strong> Open endpoints for the community to leverage our structured data.</li>
          </ul>

          <div className="mt-16 p-8 rounded-3xl bg-primary text-primary-foreground not-prose text-center">
            <h3 className="text-2xl font-bold mb-4 italic">"Ideas that rise."</h3>
            <p className="mb-6 opacity-80">Join us on our journey to document the future of technology.</p>
            <Link to="/contact" className="inline-block px-8 py-3 bg-accent text-accent-foreground font-bold rounded-xl hover:opacity-90 transition-opacity">
                Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
