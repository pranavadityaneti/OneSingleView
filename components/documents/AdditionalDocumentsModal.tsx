'use client';

import { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { uploadAdditionalDocument, addAdditionalDocument } from '@/lib/db';
import { DocumentType } from '@/types';

interface AdditionalDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess: () => void;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: string }[] = [
    { value: 'aadhar_card', label: 'Aadhar Card', icon: '📇' },
    { value: 'pan_card', label: 'PAN Card', icon: '💳' },
    { value: 'gst_certificate', label: 'GST Certificate', icon: '🏢' },
    { value: 'cin', label: 'CIN (Corporate Identity Number)', icon: '🏛️' },
    { value: 'moa', label: 'MOA (Memorandum of Association)', icon: '📜' },
    { value: 'aoa', label: 'AOA (Articles of Association)', icon: '📋' },
    { value: 'other', label: 'Other', icon: '📄' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AdditionalDocumentsModal({
    isOpen,
    onClose,
    userId,
    onSuccess
}: AdditionalDocumentsModalProps) {
    const [documentType, setDocumentType] = useState<DocumentType>('aadhar_card');
    const [documentName, setDocumentName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 5MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only PDF, JPG, and PNG files are allowed');
            return;
        }

        setSelectedFile(file);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Upload file to storage
            const fileUrl = await uploadAdditionalDocument(userId, selectedFile);

            if (!fileUrl) {
                throw new Error('Failed to upload file');
            }

            // Save document record to database
            await addAdditionalDocument({
                user_id: userId,
                document_type: documentType,
                document_name: documentName || DOCUMENT_TYPES.find(t => t.value === documentType)?.label || '',
                file_name: selectedFile.name,
                file_url: fileUrl,
                file_size: selectedFile.size,
            });

            // Reset form and close
            setDocumentType('aadhar_card');
            setDocumentName('');
            setSelectedFile(null);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Upload Additional Document</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={uploading}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Document Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Type *
                        </label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            required
                            disabled={uploading}
                        >
                            {DOCUMENT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Document Name (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="e.g., Primary Aadhar"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            disabled={uploading}
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload File *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-2 text-primary-600">
                                    <FileText className="w-5 h-5" />
                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                    <span className="text-xs text-gray-500">
                                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600 mb-1">Click to upload or drag & drop</p>
                                    <p className="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className="mt-3 inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm font-medium text-gray-700 transition-colors"
                            >
                                {selectedFile ? 'Change File' : 'Select File'}
                            </label>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={uploading || !selectedFile}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
