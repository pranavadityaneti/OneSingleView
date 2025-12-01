import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { DashboardSummary, MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';
import { formatCurrency, formatDate, calculatePolicyStatus } from './utils';

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
    userName: string
): Promise<void> {
    try {
        // Filter policies by creation date
        const filteredPolicies = allPolicies.filter(policy => {
            const createdAt = new Date(policy.created_at);
            return createdAt >= startDate && createdAt <= endDate;
        });

        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 20;

        // Add header
        pdf.setFontSize(20);
        pdf.setTextColor(40, 40, 40);
        pdf.text('Policies by Date Range', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Report for: ${userName}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 5;
        pdf.text(
            `Period: ${formatDate(startDate)} to ${formatDate(endDate)}`,
            pageWidth / 2,
            yPosition,
            { align: 'center' }
        );
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 5, { align: 'center' });

        yPosition += 15;

        // Add policies
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);

        if (filteredPolicies.length === 0) {
            pdf.text('No policies found for this date range', 20, yPosition);
        } else {
            filteredPolicies.forEach((policy, index) => {
                if (yPosition > pageHeight - 40) {
                    pdf.addPage();
                    yPosition = 20;
                }

                // Policy type and number
                pdf.setFont('helvetica', 'bold');
                const policyType = policy.lob_type || (policy.vehicle_number ? 'Motor' : 'Health');
                pdf.text(`${policyType} - ${policy.policy_number || 'N/A'}`, 20, yPosition);
                yPosition += 6;

                pdf.setFont('helvetica', 'normal');

                // Common details
                pdf.text(`Insurer: ${policy.insurer_name || 'N/A'}`, 25, yPosition);
                yPosition += 5;
                pdf.text(`Premium: ${policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A'}`, 25, yPosition);
                yPosition += 5;
                pdf.text(`Created: ${formatDate(new Date(policy.created_at))}`, 25, yPosition);
                yPosition += 5;

                yPosition += 5; // Space between policies
            });

            // Summary
            yPosition += 5;
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Total Policies: ${filteredPolicies.length}`, 20, yPosition);
            yPosition += 5;
            const totalPremium = filteredPolicies.reduce((sum, p) => sum + (Number(p.premium_amount) || 0), 0);
            pdf.text(`Total Premium: ${formatCurrency(totalPremium)}`, 20, yPosition);
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

        pdf.save(`policies_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`);
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

        // Common fields
        const baseData = {
            'Policy Number': policy.policy_number || 'N/A',
            'Type': policy.lob_type || (policy.vehicle_number ? 'Motor' : 'Health'),
            'Insurer': policy.insurer_name || 'N/A',
            'Premium': policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A',
            'Status': status,
            'Start Date': policy.policy_start_date ? formatDate(new Date(policy.policy_start_date)) : formatDate(new Date(policy.created_at)),
            'Expiry Date': expiryDate ? formatDate(new Date(expiryDate)) : 'N/A',
        };

        // Motor specific
        if (policy.vehicle_number) {
            return {
                ...baseData,
                'Vehicle Number': policy.vehicle_number,
                'Vehicle Type': policy.vehicle_type || 'N/A',
                'Make/Model': `${policy.manufacturer || ''} ${policy.model || ''}`.trim() || 'N/A',
                'Fuel Type': policy.fuel_type || 'N/A',
                'Mfg Year': policy.manufacturing_year || 'N/A',
                'Ownership': policy.ownership_type || 'N/A',
                'Sum Insured': 'N/A', // Motor usually doesn't show SI in this list context unless IDV is available
                'Lives Covered': 'N/A'
            };
        }

        // Health specific
        if (policy.no_of_lives !== undefined || (!policy.vehicle_number && !policy.lob_type)) {
            return {
                ...baseData,
                'Vehicle Number': 'N/A',
                'Vehicle Type': 'N/A',
                'Make/Model': 'N/A',
                'Fuel Type': 'N/A',
                'Mfg Year': 'N/A',
                'Ownership': 'N/A',
                'Sum Insured': policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A',
                'Lives Covered': policy.no_of_lives || 'N/A'
            };
        }

        // Commercial/Other
        return {
            ...baseData,
            'Vehicle Number': 'N/A',
            'Vehicle Type': 'N/A',
            'Make/Model': 'N/A',
            'Fuel Type': 'N/A',
            'Mfg Year': 'N/A',
            'Ownership': 'N/A',
            'Sum Insured': policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A',
            'Lives Covered': 'N/A'
        };
    });
}

// Export to Excel
export function exportToXLS(policies: any[], filename: string) {
    try {
        const data = prepareDataForExport(policies);
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Policies");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('Failed to export to Excel');
    }
}

// Export to CSV
export function exportToCSV(policies: any[], filename: string) {
    try {
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
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw new Error('Failed to export to CSV');
    }
}
