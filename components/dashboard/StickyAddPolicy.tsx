'use client';

import { useState } from 'react';
import { Plus, Car, Heart, Briefcase, X, Plane, Shield, Umbrella, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddPolicyModal from '@/components/policies/AddPolicyModal';

export default function StickyAddPolicy({ userId, className = '' }: { userId: string, className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // We'll use the modal for the actual form, but we can pre-select or just open it.
    // Since AddPolicyModal handles selection internally if passed null, or we might need to modify it to accept a type.
    // For now, let's just open the modal. The user requirement says "drop-up shown with all 6 policies".
    // So the FAB itself acts as the trigger for the drop-up.

    const router = useRouter();

    const handleOptionClick = (type: string) => {
        setIsOpen(false);

        // Special handling for claim registration
        if (type === 'Claim') {
            router.push('/claims?action=new');
            return;
        }

        // For now, since AddPolicyModal doesn't accept a pre-selected type prop in its current interface (it manages state internally),
        // we will just open the modal. 
        // Ideally, we should refactor AddPolicyModal to accept `initialType`.
        // But to meet the requirement "drop-up shown", we show the drop-up here.
        // If the user clicks an option, we can open the modal.
        // Actually, if I click "Motor" here, I expect to go straight to Motor form.
        // But AddPolicyModal is self-contained.
        // Let's just open the modal for now, or if I can, I'll update AddPolicyModal to accept a type.
        // Given the constraints, I'll open the modal. 
        // WAIT, the requirement says "drop-up shown... with all 6 policies".
        // So I must show the icons here.

        setSelectedType(type);
        setIsModalOpen(true);
    };

    const options = [
        { label: 'Motor', icon: Car, color: 'bg-blue-500', onClick: () => handleOptionClick('Motor') },
        { label: 'Health', icon: Heart, color: 'bg-green-500', onClick: () => handleOptionClick('Health') },
        { label: 'Commercial', icon: Briefcase, color: 'bg-purple-500', onClick: () => handleOptionClick('Commercial') },
        { label: 'Life', icon: Heart, color: 'bg-pink-500', onClick: () => handleOptionClick('Life') },
        { label: 'Travel', icon: Plane, color: 'bg-orange-500', onClick: () => handleOptionClick('Travel') },
        { label: 'Cyber', icon: Shield, color: 'bg-indigo-500', onClick: () => handleOptionClick('Cyber') },
        { label: 'Register Claim', icon: FileText, color: 'bg-red-500', onClick: () => handleOptionClick('Claim') },
    ];

    return (
        <>
            <div className={`relative z-50 flex flex-col items-end ${className}`}>
                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 flex flex-col items-end space-y-3 animate-in slide-in-from-top-5 fade-in duration-200 bg-white/80 p-2 rounded-xl backdrop-blur-sm border border-gray-100 shadow-xl">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={option.onClick}
                                className="flex items-center group w-full justify-end"
                            >
                                <span className="mr-3 px-2 py-1 bg-white text-gray-700 text-xs font-medium rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {option.label}
                                </span>
                                <div className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center text-white transition-transform hover:scale-110 ${option.color}`}>
                                    <option.icon className="w-5 h-5" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-200 ${isOpen ? 'bg-gray-600 rotate-45' : 'bg-primary-600'
                        }`}
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>



            <AddPolicyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId}
                initialType={selectedType as any}
                onSuccess={() => {
                    // Refresh data if needed, usually handled by context or swr/react-query
                    // For now just close
                    setIsModalOpen(false);
                    window.location.reload(); // Simple refresh to show new policy
                }}
            />
        </>
    );
}
