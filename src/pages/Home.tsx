import HowItWorks from "../components/sections/HowItWorks";
import FeaturedListings from "../components/sections/FeaturedListings";
import ForOwners from "../components/sections/ForOwners";

export default function Home() {
  return (
    <>
      <FeaturedListings className="pt-28 lg:pt-36" />
      <HowItWorks />
      <ForOwners />
    </>
  );
}
