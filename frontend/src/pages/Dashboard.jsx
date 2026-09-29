import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router";
import ProfileSidebar from "./Profile";
import Weather from "../components/Weather";
import ChatbotPage from "./Chatbot/ChatbotPage";
import { TbMessageChatbotFilled } from "react-icons/tb";
import ChatbotWidget from "../components/ChatbotWidget";
import LiveFeed from "../components/LiveFeed";

export default function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const { User, setUser, logout } = AuthContext();
  const navigateto = useNavigate();

  const handlelogout = () => {
    console.log("Logging out user:", User);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    navigateto("/login");
  };
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const features = [
    {
      id: 1,
      title: "Societies",
      description: "Explore campus clubs, societies, and student organizations",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      link: "/societies",
      color: "from-[#e50914] to-[#b00020]",
    },
    {
      id: 2,
      title: "Blood Support",
      description: "Channel for blood donation requests",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      link: "/medical-support",
      color: "from-[#b00020] to-[#8b0018]",
    },
    // {
    //   id: 3,
    //   title: "AI Chatbot",
    //   description: "Your intelligent student assistant for campus queries",
    //   icon: (
    //     <svg
    //       className="h-8 w-8"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
    //       />
    //     </svg>
    //   ),
    //   link: "/chatbot",
    //   color: "from-[#e50914] via-[#b00020] to-[#8b0018]",
    // },
    {
      id: 4,
      title: "Lost & Found",
      description: "Post and view lost items across campus",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      link: "/lost-found",
      color: "from-[#8b0018] to-[#b00020]",
    },
    {
      id: 5,
      title: "Anonymous Feedback",
      description: "Secure grievance and suggestion submission box",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      link: "/home",
      color: "from-[#b00020] to-[#e50914]",
    },
    {
      id: 6,
      title: "Marketplace",
      description: "Local marketplace for buying and selling",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      link: "/marketplace",
      color: "from-[#e50914] to-[#8b0018]",
    },
    {
      id: 7,
      title: "Non-Residential Support",
      description: "Accommodation listings for non-residential students",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      link: "/accommodation",
      color: "from-[#8b0018] via-[#b00020] to-[#e50914]",
    },
  ];

  const css = `
    @keyframes pop-in {
      0% { 
        opacity: 0; 
        transform: scale(0.92); 
      } 
      100% { 
        opacity: 1; 
        transform: scale(1);
      }
    }
    @keyframes fade-up {
      0% { 
        opacity: 0; 
        transform: translateY(12px); 
      } 
      100% { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    @keyframes shimmer {
      0% { 
        transform: translateX(-100%); 
      }
      100% { 
        transform: translateX(100%); 
      }
    }
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;

  return (
    <div
      className="flex min-h-screen flex-col relative"
      style={{
        backgroundImage: "url(/campus-background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background Overlay - lighter for soothing look */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/20"
        style={{ zIndex: 0 }}
      />

      {/* Content Wrapper */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Navbar */}
        <Header
          handlelogout={handlelogout}
          onProfileClick={() => setProfileOpen(true)}
        />
        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {/* Welcome Section - Modern & Attractive */}
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-white/95 via-white/98 to-white/95 backdrop-blur-xl shadow-2xl animate-[fade-up_700ms_ease-out_both] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(229,9,20,0.25)] group">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(229, 9, 20, 0.4) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>
            
            {/* Top Accent Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e50914] via-[#b00020] to-[#e50914] opacity-80" />
            
            <div className="relative z-10 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: User Welcome Section */}
                <div className="flex items-center gap-4">
                  {/* Avatar - Simple and Clean */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e50914] to-[#b00020] flex items-center justify-center shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  
                  {/* Welcome Text */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-[#b00020] to-gray-900 bg-clip-text text-transparent truncate group-hover:from-[#e50914] group-hover:via-[#b00020] group-hover:to-[#8b0018] transition-all duration-500 mb-1">
                      Welcome back, {User?.user_name || User?.name || "Guest"}!
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">
                          {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">
                          {new Date().toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Weather Widget */}
                <div className="transition-all duration-500 group-hover:scale-[1.02] origin-center">
                  <Weather />
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
            {/* Features Grid - Takes 3 columns on large screens */}
            <div className="lg:col-span-3 min-w-0">
              {/* Section Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    Campus Services
                  </h2>
                  <p className="text-sm text-white/80 mt-1">
                    Explore all available services and features
                  </p>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {features.map((feature, index) => (
                  <a
                    key={feature.id}
                    href={feature.id === 5 ? "/home" : feature.link}
                    onMouseEnter={() => setHoveredCard(feature.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-[pop-in_550ms_cubic-bezier(0.22,1,0.36,1)_both]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Card Background Pattern */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background-image:radial-gradient(rgba(229,9,20,0.1)_1px,transparent_1px)] [background-size:20px_20px]"
                      aria-hidden="true"
                    />

                    {/* Gradient Border Effect */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                      aria-hidden="true"
                    />

                    {/* Shine Effect on Hover */}
                    {hoveredCard === feature.id && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"
                        aria-hidden="true"
                      />
                    )}

                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_10px_30px_rgba(229,9,20,0.3)]`}
                      >
                        {feature.icon}
                      </div>

                      {/* Title */}
                      <h3 className="mb-2 text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-[#b00020]">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                        {feature.description}
                      </p>

                      {/* Arrow Icon */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-[#b00020] opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                          <span className="mr-2 text-xs font-semibold">
                            Explore
                          </span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#e50914]/10 to-[#b00020]/10 px-2 py-1 text-xs font-medium text-[#b00020] transition-all duration-300 group-hover:from-[#e50914]/20 group-hover:to-[#b00020]/20">
                          Active
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Live Feed Sidebar - Takes 1 column on large screens */}
            <div className="lg:col-span-1 min-w-0 overflow-hidden">
              <div className="sticky top-24 space-y-3 w-full">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">
                    Live Activity
                  </h2>
                  <p className="text-xs text-white/80 mt-1">
                    Recent campus updates
                  </p>
                </div>
                <LiveFeed />
              </div>
            </div>
          </div>
        </main>
        {/* Chatbot FAB — fixed bottom right */}
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#e50914] to-[#b00020] shadow-lg hover:scale-110 hover:shadow-[0_8px_30px_rgba(229,9,20,0.5)] transition-all duration-300"
        >
          {chatbotOpen ? (
            // X icon when open
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <TbMessageChatbotFilled size={28} className="text-white" />
          )}
        </button>
        {/* Chatbot Floating Panel */}
        
        {chatbotOpen && (
          <div
            className="fixed bottom-24 right-6 z-50 w-[380px] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-2xl shadow-black/50"
            style={{ height: "calc(100vh - 8rem)" }} // ← fills most of screen height
          >
            {/* Mini header strip */}
            <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/[0.06] bg-black/30 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#e50914]/60" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/40" />
                <span className="h-2 w-2 rounded-full bg-green-500/40" />
              </div>
              <span className="font-mono text-[10px] text-white/20">
                campus-ai · live
              </span>
              <div className="ml-auto flex items-center gap-1.5 rounded-md border border-[#e50914]/20 bg-[#e50914]/10 px-2 py-0.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e50914]" />
                <span className="text-[9px] font-bold tracking-widest text-[#e50914]">
                  LIVE
                </span>
              </div>
            </div>

            {/* Widget — must fill remaining height */}
            <div className="flex-1 overflow-hidden min-h-0">
              <ChatbotWidget />
            </div>
          </div>
        )}
        {/* Integration of Profile Sidebar */}
        <ProfileSidebar
          user={User}
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          onUpdate={handleProfileUpdate}
        />
        {/* Footer */}
        <Footer />
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  );
}
