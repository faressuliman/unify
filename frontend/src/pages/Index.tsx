import Hero from "../components/Hero";
import Stats from "../components/Stats";

const Index = () => {
    return (
        <div className="bg-gray-50 flex flex-col">
            <main className="grow">
                <Hero />
                <Stats />
            </main>
        </div>
    );
};

export default Index;
