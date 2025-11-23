'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Search, Wrench } from 'lucide-react';

// Mock data for garages
const MOCK_GARAGES = [
    {
        id: '1',
        name: 'Sai Motors Service Center',
        insurer_name: 'HDFC ERGO',
        city: 'Mumbai',
        pincode: '400001',
        address: '123, Main Road, Andheri East, Mumbai',
        contact_number: '+91 98765 43210'
    },
    {
        id: '2',
        name: 'Express Auto Care',
        insurer_name: 'ICICI Lombard',
        city: 'Bangalore',
        pincode: '560001',
        address: '45, MG Road, Bangalore',
        contact_number: '+91 98765 43211'
    },
    {
        id: '3',
        name: 'City Car Clinic',
        insurer_name: 'Tata AIG',
        city: 'Delhi',
        pincode: '110001',
        address: '78, Connaught Place, New Delhi',
        contact_number: '+91 98765 43212'
    },
    {
        id: '4',
        name: 'Quick Fix Garage',
        insurer_name: 'Bajaj Allianz',
        city: 'Pune',
        pincode: '411001',
        address: '12, FC Road, Pune',
        contact_number: '+91 98765 43213'
    },
    {
        id: '5',
        name: 'Premium Auto Works',
        insurer_name: 'Star Health',
        city: 'Chennai',
        pincode: '600001',
        address: '34, Anna Salai, Chennai',
        contact_number: '+91 98765 43214'
    }
];

export default function GaragePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const filteredGarages = MOCK_GARAGES.filter(garage => {
        const matchesSearch = garage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            garage.insurer_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCity = cityFilter === '' || garage.city === cityFilter;
        return matchesSearch && matchesCity;
    });

    const cities = Array.from(new Set(MOCK_GARAGES.map(g => g.city)));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Network Garages</h1>
                <p className="text-gray-500">Find cashless garages near you</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by garage name or insurer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px]">
                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent"
                    >
                        <option value="">All Cities</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Garages List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGarages.map((garage) => (
                    <div key={garage.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                <Wrench className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                {garage.insurer_name}
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {garage.name}
                        </h3>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span>{garage.address}</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{garage.contact_number}</span>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium">
                            Get Directions
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
