import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Navbar({ onOpenFeedbackModal }) {
    const DASHBOARD_URL = `${window.location.origin}/dashboard`;

    return (
        /* Added sticky, top-0, z-50, and w-full */
        <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-[32px] py-[16px] bg-red-800 text-white shadow-md">

            <div className="flex items-center">
                <a
                    href={DASHBOARD_URL}
                    className="transition-transform hover:scale-110 active:scale-95"
                    aria-label="Back to Dashboard"
                >
                    <ArrowLeft size={24} strokeWidth={3} />
                </a>
            </div>

            {/* CENTER: BOLD HEADING */}
            <div className="text-center">
                <h1 className="m-0 text-[20px] font-bold tracking-wide">
                    IUT ANONYMOUS FEEDBACK
                </h1>
            </div>

            {/* RIGHT: LINKS */}
            <div className="flex items-center">
                <Link
                    to="/home"
                    className="ml-[20px] text-white no-underline font-medium text-sm hover:underline"
                >
                    HOME
                </Link>
                <button
                    onClick={onOpenFeedbackModal}
                    className="ml-[20px] text-white no-underline font-medium text-sm hover:underline bg-transparent border-none cursor-pointer"
                >
                    GIVE FEEDBACK
                </button>
            </div>
        </nav>
    );
}