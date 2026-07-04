import { Navbar }          from "@/components/site/Navbar";
import { Hero }            from "@/components/site/Hero";
import { PriceCalculator } from "@/components/site/PriceCalculator";
import { Services }        from "@/components/site/Services";
import { Tracking }        from "@/components/site/Tracking";
import { About }           from "@/components/site/About";
import { Testimonials }    from "@/components/site/Testimonials";
import { Quote }           from "@/components/site/Quote";
import { Partners }        from "@/components/Partners";
import { Footer }          from "@/components/site/Footer";

const Index = () => (
  <main className="min-h-screen bg-[#fafaf9] font-[Inter,sans-serif]">
    <Navbar />
    <Hero />
    <PriceCalculator />
    <Services />
    <Tracking />
    <About />
    <Testimonials />
    <Quote />
    <Partners />
    <Footer />
  </main>
);

export default Index;
