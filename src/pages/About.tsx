import Layout from "@/components/Layout";
import { Users, Award, BookOpen } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <section className="container py-12 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-6">About TheDailyBlog</h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          TheDailyBlog is a trusted source for insightful articles on technology, business, health, travel, education, and lifestyle. Our mission is to inform, inspire, and empower our readers with well-researched, engaging content.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Users, title: "50K+ Readers", desc: "A growing community of engaged readers." },
            { icon: BookOpen, title: "500+ Articles", desc: "High-quality, original content published." },
            { icon: Award, title: "Est. 2023", desc: "Trusted by readers worldwide since 2023." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-6 text-center">
              <Icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-display font-bold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          We believe in the power of quality content to educate and inspire. Our team of experienced writers and subject matter experts work diligently to bring you articles that are not only informative but also enjoyable to read. We cover a wide range of topics to cater to diverse interests while maintaining the highest standards of accuracy and integrity.
        </p>

        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Team</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Our editorial team consists of passionate writers, researchers, and editors who are experts in their respective fields. Each article goes through a rigorous editorial process to ensure accuracy, readability, and value for our readers.
        </p>

        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Contact Us</h2>
        <p className="text-muted-foreground leading-relaxed">
          We love hearing from our readers. Whether you have feedback, a story idea, or a business inquiry, feel free to reach out through our{" "}
          <a href="/contact" className="text-accent hover:underline">contact page</a>.
        </p>
      </section>
    </Layout>
  );
};

export default About;
