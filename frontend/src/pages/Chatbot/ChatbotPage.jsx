// import { useState } from "react";
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";
// import ChatbotWidget from "../../components/ChatbotWidget";
// import GoBackButton from "../../components/GoBackButton";
// import { AuthContext } from "../../context/AuthContext";
// import { useNavigate } from "react-router";

// export default function ChatbotPage() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { User, logout } = AuthContext();

//   const navigate = useNavigate();

//   const handleLogout = () => {
//     console.log("Logging out user:", User);
//     sessionStorage.removeItem("user");
//     sessionStorage.removeItem("authToken");
//     navigate("/login");
//   };

//   return (
//     <div className="flex  flex-col bg-gradient-to-br from-gray-50 via-red-50 to-gray-50">
//       {/* <Header
//         onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
//         showMenuButton={false}
//         handlelogout={handleLogout}
//         onProfileClick={() => navigate("/profile")}
//       /> */}

//       <main className="flex-1">
//         <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-3xl flex-col px-4 py-4 sm:px-6">
//           <div className="mb-3 flex items-start gap-4">
//             {/* <GoBackButton /> */}
//             <div className="flex-1 text-center">
//               <div className="mb-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 p-2 shadow-lg">
//                 <svg
//                   className="h-6 w-6 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
//                   />
//                 </svg>
//               </div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Campus AI Assistant
//               </h1>
//               <p className="mt-1 text-xs text-gray-600">
//                 Your intelligent companion for campus information
//               </p>
//             </div>
//           </div>

//           <div className="flex-1 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-gray-900/5">
//             <ChatbotWidget />
//           </div>
//         </div>
//       </main>

//       {/* <Footer /> */}
//     </div>
//   );
// }

import { useState } from "react";
import ChatbotWidget from "../../components/ChatbotWidget";
import GoBackButton from "../../components/GoBackButton";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router";

export default function ChatbotPage() {
  const { User, logout } = AuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="relative flex min-h-screen   flex-col overflow-hidden bg-[#0c0c0e]">
      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#e50914]/10 blur-[120px]" />
        <div className="absolute -right-48 top-1/2 h-[600px] w-[600px] rounded-full bg-[#b00020]/8 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 h-[400px] w-[400px] rounded-full bg-[#e50914]/6 blur-[100px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Top bar ── */}

      {/* ── Main ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-3 py-4 sm:px-4 sm:py-5">
        {/* Capability pills */}
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {["Campus Info", "Timetables", "Societies", "FAQs", "Events"].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/40 backdrop-blur-sm transition-all duration-200 hover:border-[#e50914]/30 hover:text-[#e50914]/70"
              >
                {tag}
              </span>
            ),
          )}
        </div>

        {/* ── Chat container ── */}
        <div
          className="flex w-full max-w-2xl flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] shadow-[0_0_80px_rgba(229,9,20,0.07)] backdrop-blur-sm"
          style={{ height: "calc(100vh - 8rem)" }}
        >
          {/* macOS-style strip header */}
          <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/[0.06] bg-black/20 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e50914]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="font-mono text-[11px] text-white/20">
              campus-ai · session active
            </span>
            <div className="ml-auto flex items-center gap-1.5 rounded-md border border-[#e50914]/20 bg-[#e50914]/10 px-2 py-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e50914]" />
              <span className="text-[9px] font-bold tracking-widest text-[#e50914]">
                LIVE
              </span>
            </div>
          </div>

          {/* ✅ flex flex-col added */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ChatbotWidget />
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-3 text-center text-[10px] text-white/15">
          AI responses may be inaccurate · Always verify important information
        </p>
      </main>
    </div>
  );
}
