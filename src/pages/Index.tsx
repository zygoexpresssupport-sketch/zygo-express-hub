import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Tracking } from "@/components/site/Tracking";
import { About } from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";
import { Quote } from "@/components/site/Quote";
import { QrCode } from "@/components/site/QrCode";
import { Footer } from "@/components/site/Footer";
import { Partnership } from "@/components/Partnership";
import { FAQ } from "@/components/site/FAQ";

const Index = () => (
  <main className="min-h-screen bg-background">
    <Helmet>
      <title>Zygo Express — Same-Day Parcel Delivery in Wa, Ghana</title>
      <meta name="description" content="Book same-day parcel delivery in Wa & Upper West Ghana. Live tracking, MoMo payment, friendly riders. Get a quote in 60 seconds." />
      <link rel="canonical" href="https://zygo-express-hub.lovable.app/" />
      <meta property="og:title" content="Zygo Express — Same-Day Delivery in Wa, Ghana" />
      <meta property="og:description" content="Book parcel delivery in Wa & Upper West Ghana. Live tracking, MoMo payment, same-day pickup." />
      <meta property="og:url" content="https://zygo-express-hub.lovable.app/" />
    </Helmet>
    <Navbar />
    <Hero />
    <Services />
    <Tracking />
    <About />
    <Testimonials />
    <Partnership />
    <Quote />
    <FAQ />
    <QrCode />
    <Footer />
  </main>
);

export default Index;
