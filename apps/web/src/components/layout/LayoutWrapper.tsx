"use client";
import { usePathname } from "next/navigation";
import UpperHeader from "@/components/layout/UpperHeader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Hide main e-commerce headers/footers on admin and standalone event pages (Trade Fair / Bazaar)
    const isAdminPage = pathname?.startsWith("/admin");
    const isBazaarPage = pathname?.startsWith("/bazaar");
    const isTradeFairPage = pathname?.startsWith("/trade-fair") || pathname?.startsWith("/tradefair");

    if (isAdminPage || isBazaarPage || isTradeFairPage) {
        // Admin and Trade Fair / Bazaar pages render full-screen with their own dedicated layouts
        return <>{children}</>;
    }

    // Public pages render with headers and container
    return (
        <>
            <UpperHeader />
            <Header />
            <div className="mx-auto md:w-[95%] w-full px-4 md:px-6">{children}</div>
            <Footer />
        </>
    );
}