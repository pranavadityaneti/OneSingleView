import { useState } from 'react';
import { Plus } from 'lucide-react';
import QuoteRequestForm from '@/components/forms/QuoteRequestForm';

export default function StickyAddPolicy({ userId, className = '' }: { userId: string, className?: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className={`relative z-50 flex flex-col items-end ${className}`}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="h-10 px-4 rounded-full shadow-lg shadow-primary-500/50 flex items-center justify-center text-white bg-primary-600 transition-all duration-300 hover:scale-105 hover:shadow-primary-500/70 focus:outline-none focus:ring-2 focus:ring-primary-200 animate-pulse-slow"
                >
                    <Plus className="w-5 h-5 mr-1" />
                    <span className="font-semibold text-sm">New</span>
                </button>
            </div>

            {isModalOpen && (
                <QuoteRequestForm
                    userId={userId}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
}
