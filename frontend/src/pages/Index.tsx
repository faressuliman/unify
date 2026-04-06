import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import HowUnifyWorks from "../components/home/HowUnifyWorks";
import RecentUpdates from "../components/home/RecentUpdates";
import MapSection from "@/components/home/MapSection";

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
