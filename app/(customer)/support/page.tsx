'use client';

import { useState } from 'react';
import { Search, ChevronDown, MessageCircle, Mail, Phone } from 'lucide-react';

const faqCategories = [
    {
        name: 'Motor Insurance',
        faqs: [
            {
                question: 'What documents do I need to upload for motor insurance?',
                answer: 'You need to upload: RC (Registration Certificate) copy, previous policy documents (if renewal), and driver\'s license (DL) for commercial vehicles. All documents should be clear and in PDF or image format.'
            },
            {
                question: 'How do I file a claim for motor insurance?',
                answer: 'Navigate to Claims section, click "File New Claim", select the policy, describe the incident, and upload supporting documents like police report (for theft/accident), photos of damage, and repair estimates. Our team will process it within 24-48 hours.'
            },
            {
                question: 'Can I edit my vehicle details after adding a policy?',
                answer: 'Yes! Click the edit icon (pencil) on your policy card in the All Policies page. You can update vehicle details, upload new documents, or modify policy information.'
            },
            {
                question: 'What does "Expiring Soon" status mean?',
                answer: '"Expiring Soon" means your policy will expire within the next 30 days. We recommend renewing early to avoid coverage gaps and potential late fees.'
            }
        ]
    },
    {
        name: 'Health Insurance',
        faqs: [
            {
                question: 'How do I add family members to my health policy?',
                answer: 'When adding or editing a health policy, enter the number of lives covered in the "No. of Lives" field. You can update this anytime by clicking the edit button on your policy card.'
            },
            {
                question: 'What is sum insured and how do I choose the right amount?',
                answer: 'Sum insured is the maximum amount your insurer will pay for medical expenses in a policy year. We recommend choosing at least ₹5 lakhs for individuals and ₹10 lakhs for families, considering current healthcare costs.'
            },
            {
                question: 'Can I claim for pre-existing diseases immediately?',
                answer: 'Most health policies have a waiting period of 2-4 years for pre-existing diseases. Check your policy documents or contact your RM for specific waiting period details.'
            }
        ]
    },
    {
        name: 'Travel & Life Insurance',
        faqs: [
            {
                question: 'What does travel insurance cover?',
                answer: 'Travel insurance typically covers trip cancellations, medical emergencies abroad, lost baggage, flight delays, and personal liability. Coverage varies by policy - check your policy documents for specific inclusions.'
            },
            {
                question: 'How do I add a nominee for life insurance?',
                answer: 'When adding or editing a life policy, enter the nominee name in the designated field. You can change the nominee anytime by editing the policy.'
            },
            {
                question: 'Can I buy travel insurance for international trips only?',
                answer: 'No, travel insurance is available for both domestic and international trips. International policies offer higher coverage for medical emergencies due to higher treatment costs abroad.'
            }
        ]
    },
    {
        name: 'Commercial Insurance',
        faqs: [
            {
                question: 'What types of commercial policies can I manage here?',
                answer: 'You can manage GPA (Group Personal Accident), Fire insurance, and other commercial policies. Select the appropriate LOB type when adding a commercial policy.'
            },
            {
                question: 'How is commercial insurance different from personal insurance?',
                answer: 'Commercial insurance covers business assets, employees, and liabilities, while personal insurance covers individuals and families. Premium calculations and coverage differ significantly.'
            }
        ]
    },
    {
        name: 'Quotes & New Policies',
        faqs: [
            {
                question: 'How do I get a quote for a new policy?',
                answer: 'Click "Get Quote" in the Quick Access section or sidebar, select insurance type, provide basic details, and optionally upload an existing quote for comparison. Our RM will contact you within 24 hours with the best options.'
            },
            {
                question: 'Can I upload my own quote for comparison?',
                answer: 'Yes! When requesting a quote, check "I have a better quote" and upload it. Our team will review and try to match or beat the quote you have.'
            },
            {
                question: 'How long does policy approval take?',
                answer: 'Digital policy issuance usually takes 24-48 hours after document verification. Complex policies may take 3-5 business days. You\'ll receive updates via email and SMS.'
            }
        ]
    },
    {
        name: 'Account & Technical',
        faqs: [
            {
                question: 'How do I contact my Relationship Manager?',
                answer: 'Your RM details are displayed in the header (top-right). Click the WhatsApp icon to chat, email icon to send an email, or phone icon to call directly.'
            },
            {
                question: 'Can I download my policy documents?',
                answer: 'Yes, navigate to the specific policy detail page and click on any document to download it. All documents are securely stored in our system.'
            },
            {
                question: 'How do I change my email or mobile number?',
                answer: 'Go to My Profile (click your profile picture and select "My Profile"), then click "Edit Profile" to update your contact information.'
            },
            {
                question: 'Is my data secure?',
                answer: 'Absolutely! We use bank-level encryption for all data. Your documents are stored securely, and we never share your information with third parties without consent.'
            }
        ]
    }
];

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

    // Filter FAQs based on search
    const filteredCategories = searchQuery
        ? faqCategories.map(category => ({
            ...category,
            faqs: category.faqs.filter(
                faq =>
                    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(category => category.faqs.length > 0)
        : faqCategories;

    const toggleFAQ = (id: string) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Support & FAQs</h1>
                <p className="text-gray-600">Find answers to commonly asked questions about your insurance policies</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            {/* FAQ Categories */}
            <div className="space-y-8">
                {filteredCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-primary-600" />
                            {category.name}
                        </h2>
                        <div className="space-y-3">
                            {category.faqs.map((faq, faqIndex) => {
                                const id = `${categoryIndex}-${faqIndex}`;
                                const isExpanded = expandedFAQ === id;

                                return (
                                    <div
                                        key={id}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleFAQ(id)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                        {isExpanded && (
                                            <div className="px-4 pb-4 text-gray-600 bg-gray-50">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Still have questions?</h2>
                <p className="text-gray-600 mb-6">Our support team is here to help you</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="mailto:support@onesingleview.com"
                        className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <Mail className="w-5 h-5 text-primary-600" />
                        <span className="font-medium">Email Support</span>
                    </a>
                    <a
                        href="tel:+919876543210"
                        className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <Phone className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Call Us</span>
                    </a>
                </div>
            </div>

            {/* No Results */}
            {searchQuery && filteredCategories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search or contact support</p>
                </div>
            )}
        </div>
    );
}
