import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Tracking } from "@/components/site/Tracking";
import { Quote } from "@/components/site/Quote";
import { About } from "@/components/site/About";
import { Footer } from "@/components/site/Footer";

const Index = () => (
  <main className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <Services />
    <Tracking />
    <About />
    <Quote />
    <Footer />
  </main>
);

export default Index;
