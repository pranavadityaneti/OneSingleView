'use client';

import React, { useState, useEffect } from 'react';
import { Users, Edit, Plus, UserPlus, Mail, Phone, Calendar } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    relation: 'Self' | 'Spouse' | 'Father' | 'Mother' | 'Child';
    date_of_birth?: string;
    uhid?: string;
}

interface GMCMembersManagerProps {
    policyId: string;
    companyName: string;
}

export default function GMCMembersManager({ policyId, companyName }: GMCMembersManagerProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadEmployees();
    }, [policyId]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            // TODO: Implement getEmployeesUnderGMC() database function
            // For now, using mock data
            const mockEmployees: Employee[] = [
                {
                    id: '1',
                    name: 'Aditya Garikapati',
                    email: 'aditya@company.com',
                    mobile: '+91 98765 43210',
                    relation: 'Self',
                    date_of_birth: '1987-08-21',
                    uhid: 'H6011912-CDPL-001-00',
                },
                {
                    id: '2',
                    name: 'Raju Garikapati',
                    email: 'raju@company.com',
                    relation: 'Father',
                    date_of_birth: '1968-07-24',
                    uhid: 'H6011912-CDPL-001-01',
                },
            ];
            setEmployees(mockEmployees);
        } catch (error) {
            console.error('Error loading employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-50 rounded-xl">
                        <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Members Insured</h2>
                        <p className="text-sm text-gray-600">{employees.length} employees covered</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Employee
                </button>
            </div>

            {/* Members List */}
            <div className="space-y-3">
                {employees.map((employee) => (
                    <div
                        key={employee.id}
                        className="flex items-start justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                    >
                        <div className="flex items-start space-x-4 flex-1">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">
                                    {getInitials(employee.name)}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-bold text-gray-900">{employee.name}</h3>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                        {employee.relation}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                    {employee.email && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                                            <span className="truncate">{employee.email}</span>
                                        </div>
                                    )}
                                    {employee.mobile && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Phone className="w-3.5 h-3.5 mr-1.5" />
                                            {employee.mobile}
                                        </div>
                                    )}
                                    {employee.date_of_birth && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                            DoB: {formatDate(employee.date_of_birth)}
                                        </div>
                                    )}
                                    {employee.uhid && (
                                        <div className="text-sm text-gray-600">
                                            UHID: <span className="font-mono">{employee.uhid}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button className="ml-4 p-2 hover:bg-white rounded-lg transition-all">
                            <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Dependents Button (Alternative placement) */}
            {employees.length > 0 && (
                <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 hover:border-primary-500 text-gray-600 hover:text-primary-600 font-semibold rounded-xl transition-all flex items-center justify-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Dependents
                </button>
            )}

            {/* Add Modal Placeholder */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Employee/Dependent</h3>
                        <p className="text-gray-600 mb-4">
                            This feature will allow you to add employees and their dependents to the GMC policy.
                        </p>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
