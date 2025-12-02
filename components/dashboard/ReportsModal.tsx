'use client';

import React, { useState } from 'react';
import { X, Calendar, FileText, Filter, Download } from 'lucide-react';

interface ReportsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportsModal({ isOpen, onClose }: ReportsModalProps) {
    const [dateRange, setDateRange] = useState('last_30_days');
    const [policyType, setPolicyType] = useState('all');
    const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [downloading, setDownloading] = useState(false);

    if (!isOpen) return null;

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Ensure this only runs in the browser (SSR safety)
            if (typeof window === 'undefined') return;

            // Mock data generation based on filters
            const data = [
                ['Policy No', 'Insurer', 'Type', 'Premium', 'Status', 'Date'],
                ['MOT-123456', 'HDFC Ergo', 'Motor', '₹12,500', 'Active', '2023-11-15'],
                ['HLT-987654', 'Star Health', 'Health', '₹25,000', 'Active', '2023-10-01'],
                ['COM-456789', 'ICICI Lombard', 'Commercial', '₹45,000', 'Expiring Soon', '2023-12-05'],
            ];

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `insurance_report_${timestamp}`;

            if (format === 'pdf') {
                const { default: jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');

                const doc = new jsPDF();
                doc.text('Insurance Portfolio Report', 14, 15);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

                autoTable(doc, {
                    head: [data[0]],
                    body: data.slice(1),
                    startY: 30,
                });

                doc.save(`${filename}.pdf`);
            } else if (format === 'excel') {
                const XLSX = await import('xlsx');
                const ws = XLSX.utils.aoa_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Report');
                XLSX.writeFile(wb, `${filename}.xlsx`);
            } else {
                // CSV
                const csvContent = data.map(e => e.join(",")).join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `${filename}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            onClose();
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setDownloading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Generate Report</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Range */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 block">Date Range</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Policy Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 block">Policy Type</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={policyType}
                                onChange={(e) => setPolicyType(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white transition-all"
                            >
                                <option value="all">All Policies</option>
                                <option value="motor">Motor Insurance</option>
                                <option value="health">Health Insurance</option>
                                <option value="commercial">Commercial Insurance</option>
                                <option value="life">Life Insurance</option>
                                <option value="travel">Travel Insurance</option>
                                <option value="cyber">Cyber Insurance</option>
                            </select>
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 block">Format</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setFormat('pdf')}
                                className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${format === 'pdf'
                                    ? 'bg-primary-50 border-primary-200 text-primary-700 ring-2 ring-primary-500 ring-offset-1'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                PDF
                            </button>
                            <button
                                onClick={() => setFormat('excel')}
                                className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${format === 'excel'
                                    ? 'bg-primary-50 border-primary-200 text-primary-700 ring-2 ring-primary-500 ring-offset-1'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Excel
                            </button>
                            <button
                                onClick={() => setFormat('csv')}
                                className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${format === 'csv'
                                    ? 'bg-primary-50 border-primary-200 text-primary-700 ring-2 ring-primary-500 ring-offset-1'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                CSV
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-600/20 transition-all active:scale-95 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {downloading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
