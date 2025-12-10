'use client';

import { Download, Trash2 } from 'lucide-react';
import { AdditionalDocument } from '@/types';
import { deleteAdditionalDocument } from '@/lib/db';
import { useState } from 'react';

interface AdditionalDocumentsListProps {
    documents: AdditionalDocument[];
    onDelete: () => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
    aadhar_card: { label: 'Aadhar Card', icon: '📇' },
    pan_card: { label: 'PAN Card', icon: '💳' },
    gst_certificate: { label: 'GST Certificate', icon: '🏢' },
    cin: { label: 'CIN', icon: '🏛️' },
    moa: { label: 'MOA', icon: '📜' },
    aoa: { label: 'AOA', icon: '📋' },
    other: { label: 'Other', icon: '📄' },
};

export default function AdditionalDocumentsList({ documents, onDelete }: AdditionalDocumentsListProps) {
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        setDeleting(id);
        try {
            await deleteAdditionalDocument(id);
            onDelete();
        } catch (error) {
            alert('Failed to delete document');
        } finally {
            setDeleting(null);
        }
    };

    if (documents.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Documents</h3>
            <div className="space-y-3">
                {documents.map((doc) => {
                    const typeInfo = DOCUMENT_TYPE_LABELS[doc.document_type] || DOCUMENT_TYPE_LABELS.other;
                    return (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">{typeInfo.icon}</span>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {doc.document_name || typeInfo.label}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {doc.file_name} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    disabled={deleting === doc.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
