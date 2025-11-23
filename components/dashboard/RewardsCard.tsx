'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Users, ChevronRight } from 'lucide-react';

interface RewardsCardProps {
    referralCount: number;
    pointsEarned: number;
}

export default function RewardsCard({ referralCount, pointsEarned }: RewardsCardProps) {
    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg shadow-slate-500/25 relative overflow-hidden transition-transform hover:-translate-y-1 h-full flex flex-col justify-between">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Gift className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm uppercase tracking-wide">
                        Gold Member
                    </span>
                </div>

                <div className="my-2">
                    <p className="text-purple-100 text-xs mb-0.5 font-medium">Total Rewards Earned</p>
                    <h3 className="text-3xl font-bold">{pointsEarned} <span className="text-sm font-normal text-purple-200">pts</span></h3>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm mb-3 border border-white/10">
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-purple-200" />
                        <span className="text-xs font-medium">{referralCount} Friends Referred</span>
                    </div>
                </div>

                <Link
                    href="/referrals"
                    className="w-full bg-white text-purple-700 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center hover:bg-purple-50 transition-colors shadow-sm"
                >
                    Refer & Earn More
                    <ChevronRight className="w-3 h-3 ml-2" />
                </Link>
            </div>
        </div>
    );
}
