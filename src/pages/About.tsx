import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Code2,
  Cpu,
  Database,
  Globe,
  BookOpen,
  Compass,
  CheckCircle2,
  Users,
  Shield,
  DollarSign,
  Mail,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const About = () => {
  return (
    <Layout>
      <Helmet>
        <title>About Uyarcha — Technology, Programming & Learning</title>
        <meta
          name="description"
          content="Learn about Uyarcha, an educational technology publication and learning platform sharing practical tutorials, programming guides, and insights on AI, web development, and data science."
        />
        <link rel="canonical" href="https://uyarcha.tech/about" />
      </Helmet>

      <section className="container py-12 md:py-20 animate-fade-in max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">About</span>
        </nav>

        {/* Hero Section */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-xs mb-4">
            <span>Educational Technology Platform</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
            About Uyarcha
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Uyarcha (<a href="https://uyarcha.tech" className="text-accent underline hover:opacity-90 font-medium">uyarcha.tech</a>) is an independent, technology-focused publishing and learning platform. Our goal is to make modern technical knowledge, software engineering concepts, and emerging computational tools clear, accessible, and practical for learners and developers worldwide.
          </p>
        </div>

        {/* Section 1 & 2: About & Mission */}
        <div className="space-y-12 mb-16">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Our Purpose & Platform
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Technology evolves at an extraordinary pace. For students, early-career developers, and self-directed learners, keeping up with rapid changes in artificial intelligence, programming languages, and web technologies can feel overwhelming. Many resources online are either overly academic or cluttered with marketing noise.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Uyarcha was established to bridge that gap. We focus on publishing clean, practical tutorials, real-world development guides, and thoughtful technical articles designed to help readers understand the core principles behind modern technology—so they can build real projects with confidence.
            </p>
          </div>

          {/* Mission Cards */}
          <div className="p-8 rounded-2xl bg-secondary/40 border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our mission is grounded in everyday educational value rather than abstract promises:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/90 leading-snug">
                  <strong>Demystify complex topics</strong> through structured explanations and code-first demonstrations.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/90 leading-snug">
                  <strong>Publish useful programming tutorials</strong> in Python, TypeScript, modern JavaScript, and web architecture.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/90 leading-snug">
                  <strong>Explore AI & Data Science</strong> conceptually and hands-on, focusing on real tools rather than hype.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/90 leading-snug">
                  <strong>Deliver actionable learning material</strong> that readers can study, test, and implement in their own projects.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: What We Publish */}
        <div className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            What We Publish
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Our articles and guides center around core disciplines of modern software engineering and digital technology:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Cpu size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                Artificial Intelligence & Machine Learning
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Clear explanations of neural networks, Large Language Model (LLM) APIs, computer vision fundamentals, and how developers can responsibly integrate AI tooling into software systems.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Code2 size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                Programming & Software Development
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tutorials covering core programming paradigms, practical Python patterns, modern TypeScript, object-oriented concepts, algorithm design, and developer workflow automation.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Globe size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                Web Development & Frameworks
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step-by-step guidance on modern frontend engineering with React, component styling, state management, REST APIs, Supabase backend integration, responsive design, and web performance.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                Data Science & Analytics
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Articles on exploratory data analysis, data manipulation with libraries like Pandas, visual storytelling, and interpreting quantitative datasets accurately.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                <BookOpen size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                Technical Tutorials & Guides
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Problem-solving walkthroughs explaining common software bugs, configuration setups, development environment tuning, and best practices in code architecture.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Compass size={20} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                Industry Developments & Tech News
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Thoughtful commentary on important developer ecosystem updates, language releases, open-source projects, and industry trends impacting engineering teams.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Editorial Approach */}
        <div className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Our Editorial Approach
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We hold ourselves to straightforward, honest standards when producing technical content:
          </p>

          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-bold text-base text-foreground mb-1">
                Accuracy & Verification
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Code snippets, command lines, and technical claims are checked against official framework documentation and tested locally before publication.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-bold text-base text-foreground mb-1">
                Clarity Over Jargon
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We believe that if a concept cannot be explained clearly, it hasn't been broken down enough. We prioritize plain-language explanations paired with readable code.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-bold text-base text-foreground mb-1">
                Commitment to Corrections
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Technology moves quickly, and APIs deprecate. When reader feedback or our own reviews identify technical inaccuracies, broken links, or outdated syntax, we update the article promptly to reflect current standards.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-bold text-base text-foreground mb-1">
                Honest Transparency
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We are an independent technology publication. We do not claim our tutorials are peer-reviewed by academic boards or audited by enterprise panels; rather, they are crafted, curated, and validated through real-world software engineering practice and verified against primary documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Who Uyarcha Serves */}
        <div className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Who Uyarcha Serves
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Our resources are designed for self-motivated individuals looking to develop practical competence in technology:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2 font-bold text-foreground">
                <Users size={16} className="text-accent" />
                <span>Computer Science & IT Students</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Supplements coursework with practical code examples, modern developer workflows, and architectural concepts.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2 font-bold text-foreground">
                <Code2 size={16} className="text-accent" />
                <span>Self-Taught & Beginning Programmers</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provides structured, beginner-friendly starting points without unnecessary complexity or paywalls.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2 font-bold text-foreground">
                <Globe size={16} className="text-accent" />
                <span>Practicing Software Developers</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Offers focused tutorials on new tools, libraries, cloud integration techniques, and design patterns.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2 font-bold text-foreground">
                <Cpu size={16} className="text-accent" />
                <span>Technology Enthusiasts</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Keeps readers informed about modern advancements in machine learning, developer infrastructure, and computing trends.
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic mt-4">
            Note: Uyarcha is an educational publication. We provide learning resources to assist your personal study and skill acquisition; we do not guarantee specific employment offers, income, or professional outcomes.
          </p>
        </div>

        {/* Section 6: Authorship and Responsibility */}
        <div className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Authorship & Responsibility
          </h2>
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Uyarcha is independently founded and managed by Mohammed Minhaj, a Computer Science student and software developer based in Thrissur, Kerala, India. 
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The platform originated from a straightforward challenge: finding high-signal, accessible documentation and practical guides while learning modern full-stack web development and systems engineering. Rather than keeping technical notes private, Uyarcha was engineered as an open, accessible web application to document lessons, tutorials, and practical insights for the wider technical community.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              As a personally managed technology publication, every article is written with care, continuous testing, and direct accountability to our readers.
            </p>
          </div>
        </div>

        {/* Section 7: Advertising Transparency */}
        <div className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Advertising & Funding Transparency
          </h2>
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-center gap-2 text-accent font-bold text-sm">
              <DollarSign size={16} />
              <span>How We Support Our Work</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Uyarcha is committed to providing free, open access to educational content without requiring paywalls or mandatory subscriptions. To offset the recurring operational costs of domain registration, cloud hosting, edge database services, and media storage, our website is configured to display digital advertisements through <strong>Google AdSense</strong> and trusted advertising networks.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our advertising principles are clear and uncompromising:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Editorial Independence:</strong> Advertisers have no influence over our editorial decisions, article topics, or technical recommendations. Content is published solely based on educational value and technical relevance.
              </li>
              <li>
                <strong>Clear Labeling:</strong> Any advertising spaces on our website are clearly identified with labels such as &ldquo;Sponsored&rdquo; or &ldquo;Advertisement&rdquo; to avoid confusion with editorial tutorials.
              </li>
              <li>
                <strong>Respect for Reader Experience:</strong> We intentionally exclude advertisements from sensitive or transactional areas (such as contact forms and administrative pages) and apply responsive height containers to prevent disruptive page jumps (Cumulative Layout Shift).
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              For complete details on how advertising cookies are utilized and how you can manage your personalized ad preferences, please consult our{" "}
              <Link to="/privacy-policy" className="text-accent underline hover:opacity-90">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        {/* Section 8: Contact and Feedback */}
        <div className="p-8 rounded-3xl bg-secondary/50 border border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2">
            <Mail size={22} />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Contact & Feedback
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have a question about a tutorial, spotted a technical correction, or want to suggest a technology topic? We welcome thoughtful feedback from our readers.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-accent/20"
            >
              <span>Contact Page</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/privacy-policy"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-card transition-colors"
            >
              <span>Privacy Policy</span>
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-card transition-colors"
            >
              <span>Browse Articles</span>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Direct email: <a href="mailto:uyarchatech@gmail.com" className="text-accent underline font-semibold">uyarchatech@gmail.com</a> • Thrissur, Kerala, India
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default About;
