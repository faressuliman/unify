


import Poster from "@/components/ui/Poster";
import FooterSection from "../components/FooterSection";

const PosterBuilder = () => {
    return (
        <div className="bg-gray-50 flex flex-col">
            <main className="grow">
                <Poster />
            </main>
            <FooterSection />
        </div>
    );
};

export default PosterBuilder;
