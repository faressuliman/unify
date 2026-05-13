import { useNavigate } from "react-router-dom";
import Hero from "../components/home/Hero";
import type { HeroSearchPayload } from "../components/home/Hero";
import Stats from "../components/home/Stats";
import HowUnifyWorks from "../components/home/HowUnifyWorks";
import MapSection from "@/components/home/MapSection";

const Index = () => {
  const navigate = useNavigate();

  const handleSearchSubmit = (payload: HeroSearchPayload) => {
    // When the user submits from the Hero, navigate to the search page
    // passing the query/image data through the router state
    navigate("/search", {
      state: {
        initialQuery: payload.query,
        initialImage: payload.image,
      },
    });
  };

  return (
    <div className="bg-gray-50">
      <Hero onSearchSubmit={handleSearchSubmit} />
      <Stats />
      <HowUnifyWorks />
      <MapSection />
    </div>
  );
};

export default Index;
