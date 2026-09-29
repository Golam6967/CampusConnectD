// import { useState, useEffect, useRef } from 'react';
// import { askChatbot, checkChatbotHealth } from '../services/chatbotService';

// export default function ChatbotWidget() {
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       type: 'bot',
//       text: 'Hello! 👋 I\'m your CampusConnect AI Assistant. I can help you with information about campus events, clubs, facilities, and much more. How can I assist you today?',
//       timestamp: new Date(),
//     },
//   ]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isServiceActive, setIsServiceActive] = useState(true);
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     // Check if chatbot service is running
//     const checkHealth = async () => {
//       const isHealthy = await checkChatbotHealth();
//       setIsServiceActive(isHealthy);
//     };
//     checkHealth();
//   }, []);

//   const handleSend = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage = {
//       id: Date.now(),
//       type: 'user',
//       text: input,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const response = await askChatbot(input);

//       const botMessage = {
//         id: Date.now() + 1,
//         type: 'bot',
//         text: response.answer,
//         sources: response.sources,
//         confidence: response.confidence,
//         relevanceScore: response.relevance_score,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       const errorMessage = {
//         id: Date.now() + 1,
//         type: 'bot',
//         text: 'I apologize, but I\'m having trouble connecting right now. Please ensure the chatbot service is running and try again.',
//         isError: true,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//       setIsServiceActive(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const formatTime = (date) => {
//     return new Date(date).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   return (
//     <div className="flex h-full flex-col bg-white">
//       {/* Professional Header */}
//       <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 px-6 py-5 shadow-md">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             {/* Bot Avatar */}
//             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
//               <svg
//                 className="h-7 w-7 text-red-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-white">Campus AI Assistant</h2>
//               <div className="flex items-center gap-2">
//                 <div
//                   className={`h-2 w-2 rounded-full ${
//                     isServiceActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'
//                   }`}
//                 ></div>
//                 <span className="text-xs text-white/90">
//                   {isServiceActive ? 'Available 24/7' : 'Service Offline'}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Messages Area with Professional Styling */}
//       <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-6">
//         <div className="mx-auto max-w-4xl space-y-6">
//           {messages.map((message, index) => (
//             <div
//               key={message.id}
//               className={`flex items-end gap-3 ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               } animate-fadeIn`}
//             >
//               {/* Bot Avatar for bot messages */}
//               {message.type === 'bot' && (
//                 <div className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-md">
//                   <svg
//                     className="h-5 w-5 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
//                     />
//                   </svg>
//                 </div>
//               )}

//               <div
//                 className={`max-w-[75%] ${
//                   message.type === 'user'
//                     ? 'rounded-3xl rounded-br-md bg-gradient-to-r from-red-600 to-rose-700 px-5 py-3 text-white shadow-md'
//                     : message.isError
//                     ? 'rounded-3xl rounded-bl-md bg-red-50 px-5 py-3 text-red-700 shadow-sm border border-red-200'
//                     : 'rounded-3xl rounded-bl-md bg-white px-5 py-3 text-gray-800 shadow-md border border-gray-100'
//                 }`}
//               >
//                 <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
//                   {message.text}
//                 </p>

//                 <p className={`mt-2 text-[11px] ${
//                   message.type === 'user' ? 'text-red-100' : 'text-gray-500'
//                 }`}>
//                   {formatTime(message.timestamp)}
//                 </p>
//               </div>

//               {/* User Avatar for user messages */}
//               {message.type === 'user' && (
//                 <div className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700 shadow-md">
//                   <svg
//                     className="h-5 w-5 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                     />
//                   </svg>
//                 </div>
//               )}
//             </div>
//           ))}

//           {/* Professional Typing Indicator */}
//           {isLoading && (
//             <div className="flex items-end gap-3 animate-fadeIn">
//               <div className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-md">
//                 <svg
//                   className="h-5 w-5 text-white"
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
//               <div className="rounded-3xl rounded-bl-md bg-white px-5 py-4 shadow-md border border-gray-100">
//                 <div className="flex items-center gap-1.5">
//                   <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-red-500 [animation-delay:-0.3s]"></div>
//                   <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-red-500 [animation-delay:-0.15s]"></div>
//                   <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-red-500"></div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Modern Input Area */}
//       <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
//         <div className="mx-auto max-w-4xl">
//           {!isServiceActive && (
//             <div className="mb-3 flex items-start gap-3 rounded-xl bg-amber-50 p-4 border border-amber-200">
//               <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               <div>
//                 <p className="text-sm font-semibold text-amber-900">Service Unavailable</p>
//                 <p className="mt-1 text-xs text-amber-700">
//                   The chatbot service is currently offline. Please start it with:
//                   <code className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">python app.py</code>
//                 </p>
//               </div>
//             </div>
//           )}

//           <div className="flex items-end gap-3">
//             <div className="flex-1">
//               <div className="relative">
//                 <textarea
//                   ref={inputRef}
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                   placeholder="Type your message here..."
//                   className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50 px-5 py-3.5 pr-12 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
//                   rows={1}
//                   disabled={isLoading || !isServiceActive}
//                   style={{ minHeight: '52px', maxHeight: '120px' }}
//                 />
//                 {/* Character hint */}
//                 {input.length > 0 && (
//                   <div className="absolute bottom-2 right-3 text-xs text-gray-400">
//                     {input.length}
//                   </div>
//                 )}
//               </div>
//             </div>
//             <button
//               onClick={handleSend}
//               disabled={isLoading || !input.trim() || !isServiceActive}
//               className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
//             >
//               {isLoading ? (
//                 <svg
//                   className="h-5 w-5 animate-spin"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//               ) : (
//                 <svg
//                   className="h-5 w-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2.5}
//                     d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//                   />
//                 </svg>
//               )}
//             </button>
//           </div>

//           {/* Powered by notice */}
//           <div className="mt-3 text-center">
//             <p className="text-xs text-gray-400">
//               Powered by AI • CampusConnect 2026
//             </p>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { askChatbot, checkChatbotHealth } from "../services/chatbotService";

export default function ChatbotWidget() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! 👋 I'm your CampusConnect AI Assistant. I can help you with information about campus events, clubs, facilities, and much more. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isServiceActive, setIsServiceActive] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── ALL LOGIC BELOW IS UNTOUCHED ──

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkChatbotHealth();
      setIsServiceActive(isHealthy);
    };
    checkHealth();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askChatbot(input);
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: response.answer,
        sources: response.sources,
        confidence: response.confidence,
        relevanceScore: response.relevance_score,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "I apologize, but I'm having trouble connecting right now. Please ensure the chatbot service is running and try again.",
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsServiceActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── ONLY CLASSNAMES CHANGED BELOW ──

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Messages Area ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "20px 16px",
        }}
      >
        <div className="mx-auto max-w-2xl space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2.5 animate-fadeIn ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Bot avatar */}
              {message.type === "bot" && (
                <div className="mb-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#e50914] to-[#8b0018] shadow-md shadow-red-900/30">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "rounded-br-sm bg-gradient-to-br from-[#e50914] to-[#b00020] text-white shadow-lg shadow-red-900/20"
                    : message.isError
                      ? "rounded-bl-sm border border-red-500/20 bg-red-500/10 text-red-300"
                      : "rounded-bl-sm border border-white/[0.07] bg-white/[0.06] text-white/85 backdrop-blur-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {message.text}
                </p>
                <p
                  className={`mt-1.5 text-[10px] ${
                    message.type === "user"
                      ? "text-red-200/70"
                      : "text-white/30"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {/* User avatar */}
              {message.type === "user" && (
                <div className="mb-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                  <svg
                    className="h-4 w-4 text-white/60"
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
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-end gap-2.5 animate-fadeIn">
              <div className="mb-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#e50914] to-[#8b0018] shadow-md shadow-red-900/30">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="rounded-2xl rounded-bl-sm border border-white/[0.07] bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#e50914] [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#e50914] [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#e50914]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div
        style={{ flexShrink: 0 }}
        className="border-t border-white/[0.06] bg-black/20 px-4 py-3 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-2xl">
          {/* Service offline warning */}
          {!isServiceActive && (
            <div className="mb-3 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-300">
                  Service Unavailable
                </p>
                <p className="mt-0.5 text-[11px] text-amber-400/80">
                  Start the service with:{" "}
                  <code className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                    python app.py
                  </code>
                </p>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2.5">
            {/* Textarea */}
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                rows={1}
                disabled={isLoading || !isServiceActive}
                style={{ minHeight: "44px", maxHeight: "120px" }}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white/85 placeholder-white/25 transition-all focus:border-[#e50914]/40 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#e50914]/20 disabled:opacity-40"
              />
              {input.length > 0 && (
                <div className="absolute bottom-2 right-3 text-[10px] text-white/20">
                  {input.length}
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !isServiceActive}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e50914] to-[#b00020] text-white shadow-lg shadow-red-900/30 transition-all hover:scale-105 hover:shadow-red-900/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {isLoading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-2 text-center text-[10px] text-white/20">
            Powered by AI · CampusConnect 2026
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
