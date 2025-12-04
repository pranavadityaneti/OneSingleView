'use client';

import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { QuoteRequest } from '@/types';
import FormInput from './FormInput';
import FileUpload from './FileUpload';
import { addQuoteRequest } from '@/lib/db';

interface QuoteRequestFormProps {
    userId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function QuoteRequestForm({ userId, onClose, onSuccess }: QuoteRequestFormProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        lob_type: 'Motor',
        details: '',
        uploaded_quote: '',
        required_documents: '',
        has_better_quote: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.details) newErrors.details = 'Please provide some details about your requirement';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            await addQuoteRequest({
                user_id: userId,
                lob_type: formData.lob_type as any,
                details: formData.details,
                uploaded_quote: formData.uploaded_quote,
                has_better_quote: formData.has_better_quote,
                status: 'New'
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving quote request:', error);
            setErrors(prev => ({ ...prev, submit: 'Failed to submit request. Please try again.' }));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (url: string) => {
        setFormData(prev => ({
            ...prev,
            uploaded_quote: url
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        Request a Quote
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {errors.submit && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <div className="space-y-4">
                        <FormInput
                            label="Insurance Type"
                            name="lob_type"
                            type="select"
                            value={formData.lob_type}
                            onChange={handleChange}
                            options={[
                                { value: 'Motor', label: 'Motor Insurance' },
                                { value: 'Health', label: 'Health Insurance' },
                                { value: 'Life', label: 'Life Insurance' },
                                { value: 'Others', label: 'Other Insurance' }
                            ]}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Requirement Details
                            </label>
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${errors.details ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="Describe what you are looking for (e.g., Comprehensive car insurance for Honda City 2020)..."
                            />
                            {errors.details && <p className="text-red-500 text-xs mt-1">{errors.details}</p>}
                        </div>

                        {/* Required Documents Upload */}
                        <FileUpload
                            label="PLEASE UPLOAD REQUIRED DOCUMENTS"
                            name="required_documents"
                            bucket="quote-documents"
                            onUploadComplete={(url) => setFormData(prev => ({ ...prev, required_documents: url }))}
                            existingFile={formData.required_documents ? { url: formData.required_documents, name: 'Required Documents' } : undefined}
                        />

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="has_better_quote"
                                name="has_better_quote"
                                checked={formData.has_better_quote}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="has_better_quote" className="text-sm text-gray-700">
                                I have a quote from another insurer
                            </label>
                        </div>

                        {formData.has_better_quote && (
                            <FileUpload
                                label="Upload Existing Quote (Optional)"
                                name="uploaded_quote"
                                bucket="quote-documents"
                                onUploadComplete={handleFileUpload}
                                existingFile={formData.uploaded_quote ? { url: formData.uploaded_quote, name: 'Existing Quote' } : undefined}
                            />
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Submit Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
