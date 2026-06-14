import { Navbar }       from "@/components/site/Navbar";
import { Hero }         from "@/components/site/Hero";
import { Services }     from "@/components/site/Services";
import { Tracking }     from "@/components/site/Tracking";
import { About }        from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";
import { Quote }        from "@/components/site/Quote";
import { QrCode }       from "@/components/site/QrCode";
import { Footer }       from "@/components/site/Footer";

const Index = () => (
  <main className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <Services />
    <Tracking />
    <About />
    <Testimonials />
    <Quote />
    <QrCode />
    <Footer />
  </main>
);

export default Index;
