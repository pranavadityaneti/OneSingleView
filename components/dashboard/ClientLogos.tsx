import React from 'react';

const clients = [
    { name: 'Breeze Rehab', logo: '/images/clients/breeze-updated.png' },
    { name: 'Beliebt Overseas', logo: '/images/clients/beliebt-updated.png' },
    { name: 'Rapinno Tech', logo: '/images/clients/rapinno-updated.png' },
    { name: 'Kensium', logo: '/images/clients/kensium-updated.png' },
    { name: 'RVPR', logo: '/images/clients/rvpr.png' }, // Keeping original if not updated
];

export default function ClientLogos() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-6 px-2">Our Valued Clients</h3>

            <div className="relative w-full overflow-hidden">
                {/* Gradient Masks for smooth fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

                <div className="flex items-center gap-12 animate-scroll whitespace-nowrap">
                    {/* First set of logos */}
                    {clients.map((client, index) => (
                        <div key={`${client.name}-${index}`} className="flex-shrink-0 flex justify-center items-center min-w-[160px]">
                            <img
                                src={client.logo}
                                alt={client.name}
                                className="h-10 md:h-14 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity mix-blend-multiply"
                            />
                        </div>
                    ))}
                    {/* Duplicate set for seamless scrolling */}
                    {clients.map((client, index) => (
                        <div key={`${client.name}-duplicate-${index}`} className="flex-shrink-0 flex justify-center items-center min-w-[160px]">
                            <img
                                src={client.logo}
                                alt={client.name}
                                className="h-10 md:h-14 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity mix-blend-multiply"
                            />
                        </div>
                    ))}
                    {/* Triplicate set for wider screens to ensure no gaps */}
                    {clients.map((client, index) => (
                        <div key={`${client.name}-triplicate-${index}`} className="flex-shrink-0 flex justify-center items-center min-w-[160px]">
                            <img
                                src={client.logo}
                                alt={client.name}
                                className="h-10 md:h-14 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity mix-blend-multiply"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333333%); }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                    will-change: transform;
                    width: max-content;
                }
                /* Pause animation on hover */
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
