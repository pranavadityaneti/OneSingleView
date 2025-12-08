import { FileCheck, Users, Shield } from 'lucide-react';

export default function TrustBar() {
    const stats = [
        {
            icon: FileCheck,
            value: '10,000+',
            label: 'Policies Managed',
        },
        {
            icon: Users,
            value: '5,000+',
            label: 'Happy Users',
        },
        {
            icon: Shield,
            value: '50+',
            label: 'Insurance Partners',
        },
    ];

    return (
        <section className="py-8 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center gap-4 p-4"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <stat.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
