import { useNavigate } from "react-router-dom";
import Hero from "../components/home/Hero";
import type { HeroSearchPayload } from "../components/home/Hero";
import KeyFeatures from "../components/home/KeyFeatures";
import HowUnifyWorks from "../components/home/HowUnifyWorks";
import RecentUpdates from "../components/home/RecentUpdates";
import MapSection from "@/components/home/MapSection";
import heroImg from "../assets/hero.png";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";

const Index = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const handleSearchSubmit = (payload: HeroSearchPayload) => {
        if (payload.image && !isAuthenticated) {
            toast.error(isRTL ? 'يجب عليك تسجيل الدخول أولاً!' : 'You are required to login first!');
            return;
        }
        // When the user submits from the Hero, navigate to the search page
        // passing the query/image data through the router state
        navigate('/search', { 
            state: { 
                initialQuery: payload.query, 
                initialImage: payload.image 
            } 
        });
    };

    return (
        <div className="bg-gray-50">
            <Hero onSearchSubmit={handleSearchSubmit} backgroundImages={[heroImg]} />
            <KeyFeatures />
            <HowUnifyWorks />
            <RecentUpdates />
            <MapSection />
        </div>
    );
};

export default Index;
