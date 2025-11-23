'use client';

import { useState, useEffect } from 'react';
import {
    Settings,
    Image as ImageIcon,
    MapPin,
    Save,
    Plus,
    Trash2,
    Upload,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import {
    getAppSettings,
    updateAppSetting,
    getAllBanners,
    addBanner,
    deleteBanner,
    getAllGarages,
    addGarage,
    deleteGarage
} from '@/lib/db';
import { AppSetting, Banner, Garage } from '@/types';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'banners' | 'garages'>('general');
    const [loading, setLoading] = useState(true);

    // Data States
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [garages, setGarages] = useState<Garage[]>([]);

    // Form States
    const [expiryThreshold, setExpiryThreshold] = useState(30);
    const [newBanner, setNewBanner] = useState<Partial<Banner>>({ title: '', image_url: '', is_active: true, display_order: 0 });
    const [newGarage, setNewGarage] = useState<Partial<Garage>>({ name: '', insurer_name: '', city: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsData, bannersData, garagesData] = await Promise.all([
                getAppSettings(),
                getAllBanners(),
                getAllGarages()
            ]);
            setSettings(settingsData);
            setBanners(bannersData);
            setGarages(garagesData);

            // Initialize specific settings
            const threshold = settingsData.find(s => s.key === 'expiry_threshold_days');
            if (threshold) setExpiryThreshold(threshold.value);

        } catch (error) {
            console.error('Failed to load settings data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneral = async () => {
        try {
            await updateAppSetting('expiry_threshold_days', expiryThreshold);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings.');
        }
    };

    const handleAddBanner = async () => {
        if (!newBanner.title || !newBanner.image_url) return;
        try {
            await addBanner({
                title: newBanner.title,
                image_url: newBanner.image_url,
                link_url: newBanner.link_url,
                is_active: newBanner.is_active || true,
                display_order: newBanner.display_order || 0,
                active_from: new Date()
            } as any);
            setNewBanner({ title: '', image_url: '', is_active: true, display_order: 0 });
            loadData(); // Reload to get new ID
        } catch (error) {
            console.error('Failed to add banner:', error);
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            await deleteBanner(id);
            setBanners(banners.filter(b => b.id !== id));
        } catch (error) {
            console.error('Failed to delete banner:', error);
        }
    };

    const handleAddGarage = async () => {
        if (!newGarage.name || !newGarage.insurer_name || !newGarage.city) return;
        try {
            await addGarage({
                name: newGarage.name,
                insurer_name: newGarage.insurer_name,
                city: newGarage.city,
                address: newGarage.address,
                contact_number: newGarage.contact_number
            } as any);
            setNewGarage({ name: '', insurer_name: '', city: '' });
            loadData();
        } catch (error) {
            console.error('Failed to add garage:', error);
        }
    };

    const handleDeleteGarage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this garage?')) return;
        try {
            await deleteGarage(id);
            setGarages(garages.filter(g => g.id !== id));
        } catch (error) {
            console.error('Failed to delete garage:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
                <p className="text-gray-500">Manage application settings, banners, and directories</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Settings className="w-4 h-4 mr-2" />
                    General
                </button>
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'banners' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Banners
                </button>
                <button
                    onClick={() => setActiveTab('garages')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'garages' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <MapPin className="w-4 h-4 mr-2" />
                    Garages
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Expiry Settings</h3>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Expiry Alert Threshold (Days)</label>
                                    <p className="text-xs text-gray-500 mt-1">Policies expiring within this many days will be marked as 'Expiring Soon'.</p>
                                </div>
                                <input
                                    type="number"
                                    value={expiryThreshold}
                                    onChange={(e) => setExpiryThreshold(Number(e.target.value))}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSaveGeneral}
                                className="btn btn-primary"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Banners Manager */}
                {activeTab === 'banners' && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Add Banner Form */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                                <h3 className="font-medium text-gray-900">Add New Banner</h3>
                                <input
                                    type="text"
                                    placeholder="Banner Title"
                                    value={newBanner.title}
                                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="text"
                                    placeholder="Image URL"
                                    value={newBanner.image_url}
                                    onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="text"
                                    placeholder="Link URL (Optional)"
                                    value={newBanner.link_url}
                                    onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <button
                                    onClick={handleAddBanner}
                                    className="btn btn-primary w-full"
                                    disabled={!newBanner.title || !newBanner.image_url}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Banner
                                </button>
                            </div>

                            {/* Banners List */}
                            <div className="space-y-4">
                                {banners.map((banner) => (
                                    <div key={banner.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                                        <img src={banner.image_url} alt={banner.title} className="w-24 h-16 object-cover rounded bg-gray-100" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{banner.title}</h4>
                                            <p className="text-xs text-gray-500 truncate">{banner.link_url || 'No link'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBanner(banner.id)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {banners.length === 0 && <p className="text-gray-500 text-center py-4">No banners found.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Garage Manager */}
                {activeTab === 'garages' && (
                    <div className="space-y-6">
                        {/* Add Garage Form */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Garage Name</label>
                                <input
                                    type="text"
                                    value={newGarage.name}
                                    onChange={(e) => setNewGarage({ ...newGarage, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Insurer</label>
                                <input
                                    type="text"
                                    value={newGarage.insurer_name}
                                    onChange={(e) => setNewGarage({ ...newGarage, insurer_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={newGarage.city}
                                    onChange={(e) => setNewGarage({ ...newGarage, city: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <button
                                    onClick={handleAddGarage}
                                    className="btn btn-primary w-full"
                                    disabled={!newGarage.name || !newGarage.insurer_name || !newGarage.city}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Garage
                                </button>
                            </div>
                        </div>

                        {/* Garages List */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Insurer</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {garages.map((garage) => (
                                        <tr key={garage.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{garage.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{garage.insurer_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{garage.city}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteGarage(garage.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {garages.length === 0 && <p className="text-gray-500 text-center py-8">No garages found.</p>}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
