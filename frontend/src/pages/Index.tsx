import Hero from "../components/Hero";
import Stats from "../components/Stats";
import HowUnifyWorks from "../components/HowUnifyWorks";
import RecentUpdates from "../components/RecentUpdates";
import FooterSection from "../components/FooterSection";
import MapSection from "@/components/MapSection";

const Index = () => {
    return (
        <div className="bg-gray-50 flex flex-col">
            <main className="grow">
                <Hero />
                <Stats />
                <HowUnifyWorks />
                <RecentUpdates />
                <MapSection />
            </main>
            <FooterSection />
        </div>
    );
};

export default Index;
