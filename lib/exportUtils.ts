// Dynamic imports for performance - these are large libraries
// jsPDF and xlsx are loaded only when export is triggered
import html2canvas from 'html2canvas';
import { DashboardSummary, MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';
import { formatCurrency, formatDate, calculatePolicyStatus } from './utils';

// Lazy load heavy libraries
const loadJsPDF = () => import('jspdf').then(m => m.default);
const loadXLSX = () => import('xlsx');

// Export dashboard as PDF
export async function exportDashboardToPDF(
    element: HTMLElement,
    filename: string = 'dashboard.pdf'
): Promise<void> {
    try {
        // Capture the dashboard element as canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const jsPDF = await loadJsPDF();
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(filename);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
}

// Export policies by type
export async function exportPoliciesByType(
    policyType: 'Motor' | 'Health' | 'Travel' | 'Commercial' | 'Life' | 'Cyber',
    policies: any[],
    userName: string
): Promise<void> {
    try {
        const jsPDF = await loadJsPDF();
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 20;

        // Add header
        pdf.setFontSize(20);
        pdf.setTextColor(40, 40, 40);
        pdf.text(`${policyType} Policies`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Report for: ${userName}`, pageWidth / 2, yPosition, { align: 'center' });
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 5, { align: 'center' });

        yPosition += 15;

        // Add policies
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);

        if (policies.length === 0) {
            pdf.text('No policies found', 20, yPosition);
        } else {
            policies.forEach((policy, index) => {
                if (yPosition > pageHeight - 40) {
                    pdf.addPage();
                    yPosition = 20;
                }

                // Policy number
                pdf.setFont('helvetica', 'bold');
                pdf.text(`Policy ${index + 1}: ${policy.policy_number || 'N/A'}`, 20, yPosition);
                yPosition += 6;

                pdf.setFont('helvetica', 'normal');

                // Policy details based on type
                if (policyType === 'Motor') {
                    pdf.text(`Vehicle: ${policy.vehicle_number || 'N/A'}`, 25, yPosition);
                    yPosition += 5;
                    pdf.text(`Make/Model: ${policy.make || 'N/A'} ${policy.model || 'N/A'}`, 25, yPosition);
                    yPosition += 5;
                } else if (policyType === 'Health') {
                    pdf.text(`Sum Insured: ${policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A'}`, 25, yPosition);
                    yPosition += 5;
                    pdf.text(`Members: ${policy.no_of_lives || 'N/A'}`, 25, yPosition);
                    yPosition += 5;
                }

                // Common fields
                pdf.text(`Insurer: ${policy.insurer_name || 'N/A'}`, 25, yPosition);
                yPosition += 5;
                pdf.text(`Premium: ${policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A'}`, 25, yPosition);
                yPosition += 5;

                const expiryDate = policy.expiry_date || policy.policy_end_date;
                if (expiryDate) {
                    const status = calculatePolicyStatus(new Date(expiryDate));
                    pdf.text(`Expiry: ${formatDate(new Date(expiryDate))} - ${status}`, 25, yPosition);
                    yPosition += 5;
                }

                yPosition += 5; // Space between policies
            });
        }

        // Add footer
        const totalPages = pdf.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
                `Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        pdf.save(`${policyType.toLowerCase()}_policies.pdf`);
    } catch (error) {
        console.error('Error generating policies PDF:', error);
        throw new Error('Failed to generate policies PDF');
    }
}

// Export policies by date range
export async function exportPoliciesByDate(
    startDate: Date,
    endDate: Date,
    allPolicies: any[],
    userName: string,
    filename?: string
): Promise<void> {
    try {
        // Filter policies by creation date
        const filteredPolicies = allPolicies.filter(policy => {
            const createdAt = new Date(policy.created_at);
            return createdAt >= startDate && createdAt <= endDate;
        });

        const jsPDF = await loadJsPDF();
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginLeft = 20;
        const marginRight = 20;
        const contentWidth = pageWidth - marginLeft - marginRight;
        let yPosition = 20;

        // Helper function to check if we need a new page
        const checkNewPage = (requiredSpace: number) => {
            if (yPosition + requiredSpace > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
                return true;
            }
            return false;
        };

        // Add header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('INSURANCE PORTFOLIO EXPORT REPORT', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Report for: ${userName}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 5;
        pdf.text(
            `Period: ${formatDate(startDate)} to ${formatDate(endDate)}`,
            pageWidth / 2,
            yPosition,
            { align: 'center' }
        );
        yPosition += 5;
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 12;

        if (filteredPolicies.length === 0) {
            pdf.setFontSize(11);
            pdf.setTextColor(60, 60, 60);
            pdf.text('No policies found for this date range', pageWidth / 2, yPosition, { align: 'center' });
        } else {
            // Group policies by type for summary
            const policyGroups = filteredPolicies.reduce((acc: any, policy) => {
                const type = policy.vehicle_number ? 'Motor' : policy.no_of_lives !== undefined ? 'Health' : policy.lob_type || 'Other';
                if (!acc[type]) acc[type] = [];
                acc[type].push(policy);
                return acc;
            }, {});

            // Render each policy card
            filteredPolicies.forEach((policy, index) => {
                const policyType = policy.vehicle_number ? 'Motor' : policy.no_of_lives !== undefined ? 'Health' : policy.lob_type || 'Other';
                const expiryDate = policy.expiry_date || policy.policy_end_date;
                const status = expiryDate ? calculatePolicyStatus(new Date(expiryDate)) : 'N/A';

                // Check if we need a new page (estimate ~50mm per card)
                checkNewPage(55);

                // Card header - Policy number and status
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.setTextColor(40, 40, 40);
                pdf.text(`${policyType.toUpperCase()} POLICY #${index + 1}`, marginLeft, yPosition);

                // Status badge
                const statusColors: Record<string, [number, number, number]> = { 'Active': [34, 197, 94], 'Expiring Soon': [251, 191, 36], 'Expired': [239, 68, 68] };
                const statusColor: [number, number, number] = statusColors[status] || [100, 100, 100];
                pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
                pdf.setFontSize(9);
                pdf.text(`● ${status}`, pageWidth - marginRight - 30, yPosition, { align: 'right' });

                yPosition += 6;

                // Draw card border
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.2);
                const cardTop = yPosition - 2;

                // Policy details
                pdf.setFontSize(9);
                pdf.setTextColor(60, 60, 60);
                pdf.setFont('helvetica', 'normal');

                pdf.text(`Policy Number: ${policy.policy_number || 'N/A'}`, marginLeft + 2, yPosition);
                yPosition += 5;
                pdf.text(`Insurer: ${policy.insurer_name || 'N/A'}`, marginLeft + 2, yPosition);
                yPosition += 6;

                // Type-specific details
                if (policyType === 'Motor') {
                    // Vehicle Details section
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8.5);
                    pdf.setTextColor(80, 80, 80);
                    pdf.text('VEHICLE DETAILS', marginLeft + 2, yPosition);
                    yPosition += 4;

                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                    pdf.setTextColor(60, 60, 60);
                    pdf.text(`├─ Vehicle Number: ${policy.vehicle_number || 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`├─ Type: ${policy.vehicle_type || 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`├─ Make/Model: ${policy.manufacturer || ''} ${policy.model || ''}`.trim() || 'N/A', marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`├─ Fuel Type: ${policy.fuel_type || 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`├─ Mfg Year: ${policy.manufacturing_year || 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`├─ Plate Type: ${policy.number_plate_type || 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`└─ Ownership: ${policy.ownership_type || 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 6;

                    // Financial section
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8.5);
                    pdf.text('FINANCIAL', marginLeft + 2, yPosition);
                    yPosition += 4;
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                    pdf.text(`Premium: ${policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 6;

                    // Coverage Period
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8.5);
                    pdf.text('COVERAGE PERIOD', marginLeft + 2, yPosition);
                    yPosition += 4;
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                    pdf.text(`├─ Start: ${policy.policy_start_date ? formatDate(new Date(policy.policy_start_date)) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`├─ End: ${policy.policy_end_date ? formatDate(new Date(policy.policy_end_date)) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;

                    pdf.text(`└─ Created: ${formatDate(new Date(policy.created_at))}`, marginLeft + 4, yPosition);
                    yPosition += 2;

                } else if (policyType === 'Health') {
                    // Health/GMC Details
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8.5);
                    pdf.text('COVERAGE DETAILS', marginLeft + 2, yPosition);
                    yPosition += 4;

                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                    if (policy.company_name) {
                        pdf.text(`├─ Company: ${policy.company_name}`, marginLeft + 4, yPosition);
                        yPosition += 4;
                    }
                    pdf.text(`├─ Sum Insured: ${policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`└─ Lives Covered: ${policy.no_of_lives || 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 6;

                    // Financial
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8.5);
                    pdf.text('FINANCIAL', marginLeft + 2, yPosition);
                    yPosition += 4;
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                    pdf.text(`Premium: ${policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 6;

                    // Policy Period
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8.5);
                    pdf.text('POLICY PERIOD', marginLeft + 2, yPosition);
                    yPosition += 4;
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                    pdf.text(`├─ Expiry: ${expiryDate ? formatDate(new Date(expiryDate)) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`└─ Created: ${formatDate(new Date(policy.created_at))}`, marginLeft + 4, yPosition);
                    yPosition += 2;

                } else {
                    // Commercial/Other
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(8.5);
                    pdf.text('POLICY DETAILS', marginLeft + 2, yPosition);
                    yPosition += 4;

                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                    if (policy.lob_type) {
                        pdf.text(`├─ LOB Type: ${policy.lob_type}`, marginLeft + 4, yPosition);
                        yPosition += 4;
                    }
                    if (policy.company_name) {
                        pdf.text(`├─ Company: ${policy.company_name}`, marginLeft + 4, yPosition);
                        yPosition += 4;
                    }
                    if (policy.policy_holder_name) {
                        pdf.text(`├─ Policy Holder: ${policy.policy_holder_name}`, marginLeft + 4, yPosition);
                        yPosition += 4;
                    }
                    pdf.text(`├─ Sum Insured: ${policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`├─ Premium: ${policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`├─ Expiry: ${expiryDate ? formatDate(new Date(expiryDate)) : 'N/A'}`, marginLeft + 4, yPosition);
                    yPosition += 4;
                    pdf.text(`└─ Created: ${formatDate(new Date(policy.created_at))}`, marginLeft + 4, yPosition);
                    yPosition += 2;
                }

                // Draw card border (rounded rect)
                const cardHeight = yPosition - cardTop;
                pdf.rect(marginLeft, cardTop, contentWidth, cardHeight);

                yPosition += 6; // Space after card
            });

            // Summary section
            checkNewPage(30);
            yPosition += 4;

            // Draw summary box
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(245, 245, 245);
            pdf.rect(marginLeft, yPosition, contentWidth, 25, 'FD');

            yPosition += 5;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(40, 40, 40);
            pdf.text('SUMMARY', marginLeft + 2, yPosition);
            yPosition += 6;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);

            const totalPremium = filteredPolicies.reduce((sum, p) => sum + (Number(p.premium_amount) || 0), 0);
            pdf.text(`Total Policies: ${filteredPolicies.length}`, marginLeft + 2, yPosition);
            yPosition += 5;

            // Breakdown by type
            const typeBreakdown = Object.entries(policyGroups)
                .map(([type, policies]: [string, any]) => `${type}: ${formatCurrency(policies.reduce((sum: number, p: any) => sum + (Number(p.premium_amount) || 0), 0))} (${policies.length} policies)`)
                .join(' | ');
            pdf.text(`├─ ${typeBreakdown}`, marginLeft + 2, yPosition);
            yPosition += 6;

            pdf.setFont('helvetica', 'bold');
            pdf.text(`Total Premium: ${formatCurrency(totalPremium)}`, marginLeft + 2, yPosition);
        }

        // Add footer to all pages
        const totalPages = pdf.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(150, 150, 150);
            pdf.text(
                `Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        pdf.save(filename || `policies_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error generating date range PDF:', error);
        throw new Error('Failed to generate date range PDF');
    }
}


// Helper to prepare data for Excel/CSV
function prepareDataForExport(policies: any[]) {
    return policies.map(policy => {
        const expiryDate = policy.expiry_date || policy.policy_end_date;
        const status = expiryDate ? calculatePolicyStatus(new Date(expiryDate)) : 'N/A';

        // Motor specific (15 fields)
        if (policy.vehicle_number) {
            return {
                'Policy Number': policy.policy_number || 'N/A',
                'Status': status,
                'Insurer Name': policy.insurer_name || 'N/A',
                'Vehicle Number': policy.vehicle_number || 'N/A',
                'Vehicle Type': policy.vehicle_type || 'N/A',
                'Manufacturer': policy.manufacturer || 'N/A',
                'Model': policy.model || 'N/A',
                'Fuel Type': policy.fuel_type || 'N/A',
                'Mfg Year': policy.manufacturing_year || 'N/A',
                'Plate Type': policy.number_plate_type || 'N/A',
                'Ownership': policy.ownership_type || 'N/A',
                'Premium': policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A',
                'Start Date': policy.policy_start_date ? formatDate(new Date(policy.policy_start_date)) : 'N/A',
                'End Date': policy.policy_end_date ? formatDate(new Date(policy.policy_end_date)) : 'N/A',
                'Created On': policy.created_at ? formatDate(new Date(policy.created_at)) : 'N/A',
            };
        }

        // Health specific (9 fields)
        if (policy.no_of_lives !== undefined || policy.sum_insured !== undefined) {
            return {
                'Policy Number': policy.policy_number || 'N/A',
                'Status': status,
                'Insurer Name': policy.insurer_name || 'N/A',
                'Company Name': policy.company_name || 'N/A',
                'Sum Insured': policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A',
                'No. of Lives': policy.no_of_lives || 'N/A',
                'Premium': policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A',
                'Expiry Date': expiryDate ? formatDate(new Date(expiryDate)) : 'N/A',
                'Created On': policy.created_at ? formatDate(new Date(policy.created_at)) : 'N/A',
            };
        }

        // Commercial specific (10 fields)
        if (policy.lob_type && ['GPA', 'Fire', 'Other'].includes(policy.lob_type)) {
            return {
                'Policy Number': policy.policy_number || 'N/A',
                'Status': status,
                'LOB Type': policy.lob_type || 'N/A',
                'Insurer Name': policy.insurer_name || 'N/A',
                'Company Name': policy.company_name || 'N/A',
                'Policy Holder': policy.policy_holder_name || 'N/A',
                'Sum Insured': policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A',
                'Premium': policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A',
                'Expiry Date': expiryDate ? formatDate(new Date(expiryDate)) : 'N/A',
                'Created On': policy.created_at ? formatDate(new Date(policy.created_at)) : 'N/A',
            };
        }

        // Generic (Travel/Life/Cyber) - 8 fields
        return {
            'Policy Number': policy.policy_number || 'N/A',
            'Status': status,
            'Type': policy.lob_type || 'N/A',
            'Insurer Name': policy.insurer_name || 'N/A',
            'Sum Insured': policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A',
            'Premium': policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A',
            'Expiry Date': expiryDate ? formatDate(new Date(expiryDate)) : 'N/A',
            'Created On': policy.created_at ? formatDate(new Date(policy.created_at)) : 'N/A',
        };
    });
}

// Export to Excel
export async function exportToXLS(policies: any[], filename: string) {
    try {
        console.log('Exporting to XLS with filename:', filename);
        const XLSX = await loadXLSX();
        const data = prepareDataForExport(policies);
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Policies");

        // Generate buffer
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Create Blob
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Trigger download
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('XLS download triggered');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('Failed to export to Excel');
    }
}

// Export to CSV
export async function exportToCSV(policies: any[], filename: string) {
    try {
        console.log('Exporting to CSV with filename:', filename);
        const XLSX = await loadXLSX();
        const data = prepareDataForExport(policies);
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('CSV download triggered');
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw new Error('Failed to export to CSV');
    }
}
