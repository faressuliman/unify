import Hero from "../components/Hero";
import Stats from "../components/Stats";
import HowUnifyWorks from "../components/HowUnifyWorks";
import RecentUpdates from "../components/RecentUpdates";
import MapSection from "@/components/MapSection";

const Index = () => {
    return (
        <div className="bg-gray-50">
            <Hero />
            <Stats />
            <HowUnifyWorks />
            <RecentUpdates />
            <MapSection />
        </div>
    );
};

export default Index;
