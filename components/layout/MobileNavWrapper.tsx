'use client';

import dynamic from 'next/dynamic';
const MobileNav = dynamic(() => import('./MobileNav'), { ssr: false });

export default function MobileNavWrapper() {
    // Only render if build target is mobile OR if we are on a small screen
    // For now, we render it and let CSS (md:hidden) handle visibility
    return <MobileNav />;
}
