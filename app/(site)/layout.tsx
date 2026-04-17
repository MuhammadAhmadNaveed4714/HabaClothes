import { Navbar } from "@/components/ui/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <CartDrawer />
        </>
    );
}
