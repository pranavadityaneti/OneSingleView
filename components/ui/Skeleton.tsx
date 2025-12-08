'use client';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            aria-hidden="true"
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-16" />
                </div>
            </div>
            <Skeleton className="h-3 w-full" />
        </div>
    );
}

export function PolicyTableSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Table rows */}
            <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function StatCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats row */}
            <StatCardsSkeleton />

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>

            {/* Policy table */}
            <PolicyTableSkeleton />
        </div>
    );
}

export default Skeleton;
