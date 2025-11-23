'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface PremiumCategoryCardProps {
    title: string;
    count?: number;
    imageSrc: string;
    href: string;
    color: string;
}

export default function PremiumCategoryCard({ title, count, imageSrc, href, color }: PremiumCategoryCardProps) {
    return (
        <Link href={href} className="group relative overflow-hidden rounded-3xl h-48 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90 group-hover:opacity-80 transition-opacity duration-300`}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
                    {count !== undefined && (
                        <p className="text-white/80 text-sm font-medium">{count} Active Policies</p>
                    )}
                </div>

                <div className="flex items-center text-white text-sm font-bold opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    LEARN MORE
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                </div>
            </div>

            {/* 3D Icon Floating Effect (Optional - if we want to overlay the generated image as an icon instead of bg) */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-contain drop-shadow-2xl"
                />
            </div>
        </Link>
    );
}
