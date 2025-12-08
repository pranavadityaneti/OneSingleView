'use client';

import { useEffect, useRef } from 'react';

// All 58 insurance companies operating in India (as of 2024)
const insuranceCompanies = [
    // Life Insurance Companies
    "LIC", "SBI Life", "HDFC Life", "ICICI Prudential Life", "Max Life",
    "Bajaj Allianz Life", "Kotak Mahindra Life", "Aditya Birla Sun Life",
    "Tata AIA Life", "Star Union Dai-ichi Life", "Bharti AXA Life",
    "PNB MetLife", "Canara HSBC Life", "Aegon Life", "Sahara India Life",
    "Aviva Life", "Future Generali Life", "IDBI Federal Life", "IndiaFirst Life",
    "Reliance Nippon Life", "Shriram Life", "Edelweiss Tokio Life", "Exide Life",

    // General Insurance Companies
    "National Insurance", "New India Assurance", "Oriental Insurance", "United India Insurance",
    "ICICI Lombard", "HDFC ERGO", "Bajaj Allianz General", "Reliance General",
    "TATA AIG", "Future Generali", "SBI General", "Cholamandalam MS",
    "IFFCO Tokio", "Universal Sompo", "Royal Sundaram", "Liberty General",
    "Raheja QBE", "Magma HDI", "Shriram General", "Kotak Mahindra General",
    "Bharti AXA General", "L&T General", "Go Digit", "Acko General",
    "Niva Bupa", "Care Health", "Star Health", "Manipal Cigna",
    "Aditya Birla Health", "Max Bupa Health", "Religare Health",

    // Standalone Health Insurance
    "Apollo Munich Health", "Cigna TTK Health",

    // Agriculture Insurance
    "Agriculture Insurance Company",

    // Reinsurance
    "General Insurance Corporation of India",

    // Credit Insurance
    "Export Credit Guarantee Corporation"
];

export default function InsuranceLogoTicker() {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        // Clone the content for seamless loop
        const scrollContent = scrollElement.querySelector('.scroll-content');
        if (scrollContent) {
            const clone = scrollContent.cloneNode(true) as HTMLElement;
            scrollElement.appendChild(clone);
        }
    }, []);

    return (
        <div className="w-full overflow-hidden bg-gradient-to-r from-gray-50 via-white to-gray-50 py-12">
            <div className="container mb-6">
                <h3 className="text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Trusted by customers across 58+ insurance providers in India
                </h3>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-hidden whitespace-nowrap"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                }}
            >
                <div className="scroll-content inline-flex animate-scroll">
                    {insuranceCompanies.map((company, index) => (
                        <div
                            key={`company-${index}`}
                            className="inline-flex items-center justify-center mx-8 min-w-[180px] h-16"
                        >
                            <div className="px-6 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                                <span className="text-gray-500 font-medium text-sm tracking-tight hover:text-gray-700 transition-all">
                                    {company}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add global CSS for animation */}
            <style jsx global>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                
                .animate-scroll {
                    animation: scroll 120s linear infinite;
                }
                
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
