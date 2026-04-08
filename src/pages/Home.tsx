import Hero from "../components/sections/Hero";
import HowItWorks from "../components/sections/HowItWorks";
import FeaturedListings from "../components/sections/FeaturedListings";
import ForOwners from "../components/sections/ForOwners";
import About from "../components/sections/About";
import ContactSection from "../components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedListings />
      <ForOwners />
      <About />
      <ContactSection />
    </>
  );
}
