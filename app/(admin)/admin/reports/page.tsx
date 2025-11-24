'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Filter, Calendar, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PolicyData {
    user_name?: string;
    policy_number: string;
    insurer_name: string;
    type: string;
    premium_amount: number;
    status: string;
    created_at: string;
    // Motor specific
    vehicle_number?: string;
    vehicle_make?: string;
    vehicle_model?: string;
    policy_type?: string;
    policy_start_date?: string;
    policy_end_date?: string;
    // GMC specific
    tpa_name?: string;
    sum_insured?: number;
    number_of_lives?: number;
    // Commercial specific
    lob_type?: string;
}

export default function AdminReportsPage() {
    const [downloading, setDownloading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<PolicyData[]>([]);
    const [filter, setFilter] = useState({
        user: '',
        type: 'all',
        startDate: '',
        endDate: ''
    });

    const fetchPreviewData = async () => {
        setLoading(true);
        try {
            // Fetch all policies from database (admin has access to all users' data)
            const { data: motorData } = await supabase.from('motor_policies').select('*').order('created_at', { ascending: false });
            const { data: gmcData } = await supabase.from('gmc_policies').select('*').order('created_at', { ascending: false });
            const { data: commercialData } = await supabase.from('commercial_policies').select('*').order('created_at', { ascending: false });

            let allPolicies: PolicyData[] = [];

            // Transform motor policies
            (motorData || []).forEach((p: any) => {
                allPolicies.push({
                    type: 'Motor',
                    policy_number: p.policy_number,
                    insurer_name: p.insurer_name,
                    premium_amount: p.premium_amount,
                    status: p.status,
                    created_at: p.created_at,
                    vehicle_number: p.vehicle_number,
                    vehicle_make: p.vehicle_make,
                    vehicle_model: p.vehicle_model,
                    policy_type: p.policy_type,
                    policy_start_date: p.policy_start_date,
                    policy_end_date: p.policy_end_date
                });
            });

            // Transform GMC policies
            (gmcData || []).forEach((p: any) => {
                allPolicies.push({
                    type: 'Health',
                    policy_number: p.policy_number,
                    insurer_name: p.insurer_name,
                    premium_amount: p.premium_amount,
                    status: p.status,
                    created_at: p.created_at,
                    tpa_name: p.tpa_name,
                    policy_type: p.policy_type,
                    sum_insured: p.sum_insured,
                    number_of_lives: p.number_of_lives,
                    policy_start_date: p.policy_start_date,
                    policy_end_date: p.policy_end_date
                });
            });

            // Transform commercial policies
            (commercialData || []).forEach((p: any) => {
                allPolicies.push({
                    type: 'Commercial',
                    policy_number: p.policy_number,
                    insurer_name: p.insurer_name,
                    premium_amount: p.premium_amount,
                    status: p.status,
                    created_at: p.created_at,
                    lob_type: p.lob_type,
                    policy_type: p.policy_type,
                    sum_insured: p.sum_insured,
                    policy_start_date: p.policy_start_date,
                    policy_end_date: p.policy_end_date
                });
            });

            // Apply filters
            let filtered = allPolicies;

            if (filter.type !== 'all') {
                const typeMap: Record<string, string> = {
                    'motor': 'Motor',
                    'health': 'Health',
                    'commercial': 'Commercial'
                };
                filtered = filtered.filter(p => p.type === typeMap[filter.type]);
            }

            if (filter.startDate) {
                filtered = filtered.filter(p => new Date(p.created_at) >= new Date(filter.startDate));
            }

            if (filter.endDate) {
                filtered = filtered.filter(p => new Date(p.created_at) <= new Date(filter.endDate));
            }

            setPreviewData(filtered);
        } catch (error) {
            console.error('Error fetching preview data:', error);
            setPreviewData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreviewData();
    }, [filter]);

    const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
        setDownloading(true);
        try {
            // Prepare comprehensive data for export
            const headers = ['Policy Number', 'Type', 'Insurer', 'Premium', 'Status', 'Start Date', 'End Date', 'Created Date'];
            const motorHeaders = [...headers, 'Vehicle Number', 'Make', 'Model', 'Policy Type'];
            const gmcHeaders = [...headers, 'TPA', 'Sum Insured', 'Lives Covered', 'Policy Type'];
            const commercialHeaders = [...headers, 'LOB Type', 'Sum Insured', 'Policy Type'];

            const exportData: string[][] = [];

            // Group by type for better organization
            const motorPolicies = previewData.filter(p => p.type === 'Motor');
            const gmcPolicies = previewData.filter(p => p.type === 'Health');
            const commercialPolicies = previewData.filter(p => p.type === 'Commercial');

            // Add motor policies
            if (motorPolicies.length > 0) {
                exportData.push(['MOTOR INSURANCE POLICIES']);
                exportData.push(motorHeaders);
                motorPolicies.forEach(p => {
                    exportData.push([
                        p.policy_number,
                        p.type,
                        p.insurer_name,
                        `₹${p.premium_amount.toLocaleString()}`,
                        p.status,
                        p.policy_start_date || '',
                        p.policy_end_date || '',
                        new Date(p.created_at).toLocaleDateString(),
                        p.vehicle_number || '',
                        p.vehicle_make || '',
                        p.vehicle_model || '',
                        p.policy_type || ''
                    ]);
                });
                exportData.push([]);
            }

            // Add GMC policies
            if (gmcPolicies.length > 0) {
                exportData.push(['HEALTH INSURANCE POLICIES']);
                exportData.push(gmcHeaders);
                gmcPolicies.forEach(p => {
                    exportData.push([
                        p.policy_number,
                        p.type,
                        p.insurer_name,
                        `₹${p.premium_amount.toLocaleString()}`,
                        p.status,
                        p.policy_start_date || '',
                        p.policy_end_date || '',
                        new Date(p.created_at).toLocaleDateString(),
                        p.tpa_name || '',
                        p.sum_insured ? `₹${p.sum_insured.toLocaleString()}` : '',
                        p.number_of_lives?.toString() || '',
                        p.policy_type || ''
                    ]);
                });
                exportData.push([]);
            }

            // Add commercial policies
            if (commercialPolicies.length > 0) {
                exportData.push(['COMMERCIAL INSURANCE POLICIES']);
                exportData.push(commercialHeaders);
                commercialPolicies.forEach(p => {
                    exportData.push([
                        p.policy_number,
                        p.type,
                        p.insurer_name,
                        `₹${p.premium_amount.toLocaleString()}`,
                        p.status,
                        p.policy_start_date || '',
                        p.policy_end_date || '',
                        new Date(p.created_at).toLocaleDateString(),
                        p.lob_type || '',
                        p.sum_insured ? `₹${p.sum_insured.toLocaleString()}` : '',
                        p.policy_type || ''
                    ]);
                });
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `insurance_report_${timestamp}`;

            if (format === 'pdf') {
                const { jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');

                const doc = new jsPDF('landscape');
                let yPos = 15;

                doc.setFontSize(16);
                doc.text('Insurance Portfolio Report', 14, yPos);
                yPos += 7;
                doc.setFontSize(10);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, yPos);
                doc.text(`Total Policies: ${previewData.length}`, 200, yPos);
                yPos += 10;

                // Motor section
                if (motorPolicies.length > 0) {
                    doc.setFontSize(12);
                    doc.text('Motor Insurance', 14, yPos);
                    yPos += 5;

                    autoTable(doc, {
                        head: [motorHeaders],
                        body: motorPolicies.map(p => [
                            p.policy_number,
                            p.type,
                            p.insurer_name,
                            `₹${p.premium_amount.toLocaleString()}`,
                            p.status,
                            p.policy_start_date || '',
                            p.policy_end_date || '',
                            new Date(p.created_at).toLocaleDateString(),
                            p.vehicle_number || '',
                            p.vehicle_make || '',
                            p.vehicle_model || '',
                            p.policy_type || ''
                        ]),
                        startY: yPos,
                        styles: { fontSize: 8 }
                    });

                    yPos = (doc as any).lastAutoTable.finalY + 10;
                }

                // Health section
                if (gmcPolicies.length > 0) {
                    if (yPos > 180) {
                        doc.addPage();
                        yPos = 15;
                    }

                    doc.setFontSize(12);
                    doc.text('Health Insurance', 14, yPos);
                    yPos += 5;

                    autoTable(doc, {
                        head: [gmcHeaders],
                        body: gmcPolicies.map(p => [
                            p.policy_number,
                            p.type,
                            p.insurer_name,
                            `₹${p.premium_amount.toLocaleString()}`,
                            p.status,
                            p.policy_start_date || '',
                            p.policy_end_date || '',
                            new Date(p.created_at).toLocaleDateString(),
                            p.tpa_name || '',
                            p.sum_insured ? `₹${p.sum_insured.toLocaleString()}` : '',
                            p.number_of_lives?.toString() || '',
                            p.policy_type || ''
                        ]),
                        startY: yPos,
                        styles: { fontSize: 8 }
                    });

                    yPos = (doc as any).lastAutoTable.finalY + 10;
                }

                // Commercial section
                if (commercialPolicies.length > 0) {
                    if (yPos > 180) {
                        doc.addPage();
                        yPos = 15;
                    }

                    doc.setFontSize(12);
                    doc.text('Commercial Insurance', 14, yPos);
                    yPos += 5;

                    autoTable(doc, {
                        head: [commercialHeaders],
                        body: commercialPolicies.map(p => [
                            p.policy_number,
                            p.type,
                            p.insurer_name,
                            `₹${p.premium_amount.toLocaleString()}`,
                            p.status,
                            p.policy_start_date || '',
                            p.policy_end_date || '',
                            new Date(p.created_at).toLocaleDateString(),
                            p.lob_type || '',
                            p.sum_insured ? `₹${p.sum_insured.toLocaleString()}` : '',
                            p.policy_type || ''
                        ]),
                        startY: yPos,
                        styles: { fontSize: 8 }
                    });
                }

                doc.save(`${filename}.pdf`);
            } else if (format === 'excel') {
                const XLSX = await import('xlsx');
                const wb = XLSX.utils.book_new();

                // Create separate sheets for each policy type
                if (motorPolicies.length > 0) {
                    const motorData = [
                        motorHeaders,
                        ...motorPolicies.map(p => [
                            p.policy_number,
                            p.type,
                            p.insurer_name,
                            p.premium_amount,
                            p.status,
                            p.policy_start_date || '',
                            p.policy_end_date || '',
                            new Date(p.created_at).toLocaleDateString(),
                            p.vehicle_number || '',
                            p.vehicle_make || '',
                            p.vehicle_model || '',
                            p.policy_type || ''
                        ])
                    ];
                    const ws = XLSX.utils.aoa_to_sheet(motorData);
                    XLSX.utils.book_append_sheet(wb, ws, 'Motor Insurance');
                }

                if (gmcPolicies.length > 0) {
                    const gmcData = [
                        gmcHeaders,
                        ...gmcPolicies.map(p => [
                            p.policy_number,
                            p.type,
                            p.insurer_name,
                            p.premium_amount,
                            p.status,
                            p.policy_start_date || '',
                            p.policy_end_date || '',
                            new Date(p.created_at).toLocaleDateString(),
                            p.tpa_name || '',
                            p.sum_insured || '',
                            p.number_of_lives || '',
                            p.policy_type || ''
                        ])
                    ];
                    const ws = XLSX.utils.aoa_to_sheet(gmcData);
                    XLSX.utils.book_append_sheet(wb, ws, 'Health Insurance');
                }

                if (commercialPolicies.length > 0) {
                    const commercialData = [
                        commercialHeaders,
                        ...commercialPolicies.map(p => [
                            p.policy_number,
                            p.type,
                            p.insurer_name,
                            p.premium_amount,
                            p.status,
                            p.policy_start_date || '',
                            p.policy_end_date || '',
                            new Date(p.created_at).toLocaleDateString(),
                            p.lob_type || '',
                            p.sum_insured || '',
                            p.policy_type || ''
                        ])
                    ];
                    const ws = XLSX.utils.aoa_to_sheet(commercialData);
                    XLSX.utils.book_append_sheet(wb, ws, 'Commercial Insurance');
                }

                XLSX.writeFile(wb, `${filename}.xlsx`);
            } else {
                // CSV
                const csvContent = exportData.map(row => row.join(",")).join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `${filename}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>
                <p className="text-gray-500">Generate and export detailed reports across all users.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                {/* Filters */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                    {/* Search User */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">User</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search user..."
                                value={filter.user}
                                onChange={(e) => setFilter({ ...filter, user: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Policy Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Policy Type</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={filter.type}
                                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                            >
                                <option value="all">All Types</option>
                                <option value="motor">Motor</option>
                                <option value="health">Health</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={filter.startDate}
                                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={filter.endDate}
                                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Preview */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Data Preview ({previewData.length} policies)</h3>
                        {loading && <span className="text-xs text-gray-500">Loading...</span>}
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-bold text-gray-700">Policy #</th>
                                        <th className="px-4 py-2 text-left font-bold text-gray-700">Type</th>
                                        <th className="px-4 py-2 text-left font-bold text-gray-700">Insurer</th>
                                        <th className="px-4 py-2 text-left font-bold text-gray-700">Premium</th>
                                        <th className="px-4 py-2 text-left font-bold text-gray-700">Status</th>
                                        <th className="px-4 py-2 text-left font-bold text-gray-700">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {previewData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                No policies found matching the selected filters
                                            </td>
                                        </tr>
                                    ) : (
                                        previewData.slice(0, 50).map((policy, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-gray-900">{policy.policy_number}</td>
                                                <td className="px-4 py-2 text-gray-600">{policy.type}</td>
                                                <td className="px-4 py-2 text-gray-600">{policy.insurer_name}</td>
                                                <td className="px-4 py-2 text-gray-900 font-semibold">₹{policy.premium_amount.toLocaleString()}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${policy.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                        policy.status === 'Expired' ? 'bg-red-100 text-red-700' :
                                                            'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {policy.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-gray-600">{new Date(policy.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {previewData.length > 50 && (
                            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
                                Showing first 50 of {previewData.length} policies. All data will be included in export.
                            </div>
                        )}
                    </div>
                </div>

                {/* Export Options */}
                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Export Options</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={downloading || previewData.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="p-1.5 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-900">PDF</p>
                                <p className="text-xs text-gray-500">For printing</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('excel')}
                            disabled={downloading || previewData.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="p-1.5 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                                <Download className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-900">Excel</p>
                                <p className="text-xs text-gray-500">For analysis</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('csv')}
                            disabled={downloading || previewData.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-900">CSV</p>
                                <p className="text-xs text-gray-500">Raw data</p>
                            </div>
                        </button>
                    </div>
                    {downloading && (
                        <p className="mt-3 text-xs text-gray-500 text-center">Generating export...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

