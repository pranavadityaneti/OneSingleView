'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileDown, Calendar, Filter, X, Loader2, CheckCircle2, Car, Heart, Briefcase, Plane, Umbrella, Shield, FileText, FileSpreadsheet } from 'lucide-react';
import { exportDashboardToPDF, exportPoliciesByType, exportPoliciesByDate, exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { DashboardSummary } from '@/types';

interface ExportButtonProps {
    onExportDashboard: () => void;
    motorPolicies: any[];
    healthPolicies: any[];
    commercialPolicies: any[];
    travelPolicies: any[];
    lifePolicies: any[];
    cyberPolicies: any[];
    userName: string;
}

type PolicyType = 'Motor' | 'Health' | 'Travel' | 'Commercial' | 'Life' | 'Cyber';
type ExportFormat = 'PDF' | 'XLS' | 'CSV';

export default function ExportButton({
    onExportDashboard,
    motorPolicies,
    healthPolicies,
    commercialPolicies,
    travelPolicies,
    lifePolicies,
    cyberPolicies,
    userName
}: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    // Filter States
    const [selectedTypes, setSelectedTypes] = useState<PolicyType[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('PDF');

    // Initialize dates
    useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    }, []);

    const togglePolicyType = (type: PolicyType) => {
        if (selectedTypes.includes(type)) {
            setSelectedTypes(selectedTypes.filter(t => t !== type));
        } else {
            setSelectedTypes([...selectedTypes, type]);
        }
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);

            // Collect all selected policies
            let policiesToExport: any[] = [];

            // If no types selected, assume all
            const typesToInclude = selectedTypes.length > 0 ? selectedTypes : ['Motor', 'Health', 'Travel', 'Commercial', 'Life', 'Cyber'];

            if (typesToInclude.includes('Motor')) policiesToExport = [...policiesToExport, ...motorPolicies];
            if (typesToInclude.includes('Health')) policiesToExport = [...policiesToExport, ...healthPolicies];
            if (typesToInclude.includes('Travel')) policiesToExport = [...policiesToExport, ...travelPolicies];
            if (typesToInclude.includes('Commercial')) policiesToExport = [...policiesToExport, ...commercialPolicies];
            if (typesToInclude.includes('Life')) policiesToExport = [...policiesToExport, ...lifePolicies];
            if (typesToInclude.includes('Cyber')) policiesToExport = [...policiesToExport, ...cyberPolicies];

            // Filter by date
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);

            policiesToExport = policiesToExport.filter(p => {
                const created = new Date(p.created_at);
                return created >= start && created <= end;
            });

            // Generate descriptive filename
            const dateRangeStr = `${startDate}_to_${endDate}`;
            let typeStr = 'All_Policies';

            if (selectedTypes.length > 0) {
                if (selectedTypes.length === 1) {
                    typeStr = `${selectedTypes[0]}_Policies`;
                } else {
                    typeStr = 'Mixed_Policies';
                }
            }

            const filename = `${typeStr}_${dateRangeStr}`;

            if (selectedFormat === 'PDF') {
                // Reuse existing PDF logic but for mixed types
                // For now, we'll use the date range export which handles mixed types
                await exportPoliciesByDate(start, end, policiesToExport, userName, `${filename}.pdf`);
            } else if (selectedFormat === 'XLS') {
                exportToXLS(policiesToExport, filename);
            } else if (selectedFormat === 'CSV') {
                exportToCSV(policiesToExport, filename);
            }

            setExportSuccess(true);
            setTimeout(() => {
                setExportSuccess(false);
                setIsOpen(false);
            }, 2000);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const policyOptions = [
        { type: 'Motor', icon: Car, count: motorPolicies.length },
        { type: 'Health', icon: Heart, count: healthPolicies.length },
        { type: 'Travel', icon: Plane, count: travelPolicies.length },
        { type: 'Commercial', icon: Briefcase, count: commercialPolicies.length },
        { type: 'Life', icon: Umbrella, count: lifePolicies.length },
        { type: 'Cyber', icon: Shield, count: cyberPolicies.length },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 font-semibold"
            >
                <Download className="w-5 h-5 mr-2" />
                Export
            </button>

            {/* Detailed Export Modal */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Export Data</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Policy Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Policy Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {policyOptions.map((option) => {
                                        const isSelected = selectedTypes.includes(option.type as PolicyType);
                                        return (
                                            <button
                                                key={option.type}
                                                onClick={() => togglePolicyType(option.type as PolicyType)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isSelected
                                                    ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                                                    }`}
                                            >
                                                <option.icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
                                                <span className="text-sm font-medium">{option.type}</span>
                                                <span className="text-xs text-gray-400">{option.count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Date Range</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Format</label>
                                <div className="flex space-x-4">
                                    {(['PDF', 'XLS', 'CSV'] as ExportFormat[]).map((format) => (
                                        <label key={format} className="flex items-center cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="format"
                                                value={format}
                                                checked={selectedFormat === format}
                                                onChange={() => setSelectedFormat(format)}
                                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">{format}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setSelectedTypes([]);
                                    const end = new Date();
                                    const start = new Date();
                                    start.setMonth(start.getMonth() - 1);
                                    setEndDate(end.toISOString().split('T')[0]);
                                    setStartDate(start.toISOString().split('T')[0]);
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                            >
                                Clear all
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        Export
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Success Toast */}
            {exportSuccess && (
                <div className="absolute top-full right-0 mt-4 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl shadow-lg flex items-center animate-in slide-in-from-top-2 fade-in z-50 whitespace-nowrap">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span className="font-medium">Export successful!</span>
                </div>
            )}
        </div>
    );
}
