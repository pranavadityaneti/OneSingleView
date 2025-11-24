import React from 'react';
import { Activity, UserPlus, Upload, RefreshCw } from 'lucide-react';
import { ActivityLog } from '@/lib/admin-db';

interface ActivityFeedProps {
    activities: ActivityLog[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'signup': return <UserPlus className="w-4 h-4 text-blue-600" />;
            case 'upload': return <Upload className="w-4 h-4 text-purple-600" />;
            case 'update': return <RefreshCw className="w-4 h-4 text-orange-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Latest Activity
                </h3>
            </div>

            <div className="flex-1 overflow-auto space-y-4">
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                            <div className="mt-1">
                                <div className="p-1.5 bg-gray-50 rounded-full border border-gray-100">
                                    {getIcon(activity.type)}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                <p className="text-xs text-gray-500">
                                    <span className="font-medium text-gray-700">{activity.userName}</span> • {new Date(activity.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                )}
            </div>
        </div>
    );
}
