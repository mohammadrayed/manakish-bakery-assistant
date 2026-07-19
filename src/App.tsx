import React, { useState, useEffect, useRef } from "react";
import {
  ChefHat,
  ShoppingBag,
  MapPin,
  Clock,
  Send,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  XCircle,
  Compass,
  Utensils,
  Flame,
  Sparkles,
  DollarSign,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Info,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem, Order, DeliveryZone, ChatMessage, ToolLog } from "./types";

export default function App() {
  // Application State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      parts: [
        {
          text: "Marhaba! 🥖 Warm greetings and welcome to the Manakish Bakery, run by Asmaa Hajj Chehade and Mohammad Rayed! \n\nI am your AI Bakery Assistant. I can show you our menu, validate your delivery area, estimate prices, and help you place, update, or cancel orders directly through this chat.\n\nWhat fresh, hot Manakish are we baking for you today?",
        },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [toppingsPrices, setToppingsPrices] = useState<Record<string, number>>({});
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "delivery">("menu");
  const [recentToolLogs, setRecentToolLogs] = useState<ToolLog[]>([]);
  const [showToolLogs, setShowToolLogs] = useState(false);

  // Delivery Checker State
  const [checkAreaQuery, setCheckAreaQuery] = useState("");
  const [checkAreaResult, setCheckAreaResult] = useState<{
    searched: boolean;
    found: boolean;
    zone?: DeliveryZone;
  }>({ searched: false, found: false });

  // Refs for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load menu, toppings, delivery configurations, and orders from Express API
  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        setMenu(data.menu || []);
        setToppingsPrices(data.toppingsPrices || {});
        setDeliveryZones(data.deliveryZones || []);
      }
    } catch (err) {
      console.error("Error fetching menu:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle Quick-Tap preset prompts
  const handleQuickTap = (promptText: string) => {
    if (isTyping) return;
    setInputValue(promptText);
  };

  // Submit chat message to Express server
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Build the payload representing chat history plus latest message
    const updatedHistory: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ];

    setMessages(updatedHistory);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add response to chat thread
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts: [{ text: data.text }],
          },
        ]);

        // Keep track of the real-time database orders returned from Express
        if (data.orders) {
          setOrders(data.orders);
        }

        // Store logs of tools invoked during this transaction
        if (data.toolLogs && data.toolLogs.length > 0) {
          setRecentToolLogs(data.toolLogs);
          setShowToolLogs(true);
        }
      } else {
        const errData = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts: [
              {
                text: `⚠️ Apologies, I encountered an error: ${
                  errData.error || "Could not process chat request"
                }. Please try again.`,
              },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error("Chat submission error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [
            {
              text: "⚠️ System connection lost. Please ensure the server is active and try again.",
            },
          ],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Step Status interactively in the UI
  const handleStepStatus = async (orderId: string) => {
    try {
      const res = await fetch("/api/orders/step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: orderId }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Error stepping status:", err);
    }
  };

  // Check delivery coverage area
  const checkDeliveryCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAreaQuery.trim()) return;

    const query = checkAreaQuery.toLowerCase().trim();
    const zone = deliveryZones.find((z) => z.area.toLowerCase().includes(query) || query.includes(z.area.toLowerCase()));

    if (zone) {
      setCheckAreaResult({ searched: true, found: true, zone });
    } else {
      setCheckAreaResult({ searched: true, found: false });
    }
  };

  // Helper colors for status badges
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Received":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Baking":
        return "bg-amber-100 text-brand-dark-brown border-brand-yellow/50 animate-pulse";
      case "Ready for Pickup":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Out for Delivery":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Delivered":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-slate-800 font-sans flex flex-col selection:bg-brand-yellow/30">
      {/* HEADER BAR */}
      <header className="bg-brand-brown text-white h-20 flex items-center justify-between px-4 sm:px-8 shadow-lg shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-brand-brown shadow-md shrink-0">
            <span className="text-brand-brown text-2xl font-black font-display">M</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tighter font-display leading-tight flex items-center gap-2">
              Manakish Bakery Assistant
            </h1>
            <p className="text-[10px] sm:text-xs font-medium text-white/90">
              Powered by LangGraph Agent • Built by <span className="underline">Asmaa Hajj Chehade</span> &amp; <span className="underline">Mohammad Rayed</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-4 shrink-0">
          <div className="hidden md:block bg-white/20 px-4 py-2 rounded-xl text-xs font-bold border border-white/30">
            Open Until 10:00 PM
          </div>
          <div className="bg-brand-yellow text-brand-dark-brown px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black shadow-sm">
            Ready to Take Orders
          </div>
        </div>
      </header>

      {/* MAIN TWO-COLUMN SPLIT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: CHAT INTERFACE & TOOL EXECUTION LOGS */}
        <section id="chat-section" className="lg:col-span-6 flex flex-col bg-white rounded-3xl border-4 border-brand-yellow shadow-xl overflow-hidden min-h-[500px] lg:min-h-0 lg:h-[calc(100vh-140px)]">
          <div className="bg-brand-soft-yellow p-4 border-b-2 border-brand-yellow flex items-center justify-between shrink-0">
            <span className="font-black text-brand-brown uppercase text-sm tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              Active Conversation
            </span>
            <span className="text-[10px] bg-brand-olive text-white px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              SESSION: BK-9021
            </span>
          </div>

          {/* CHAT DISPLAY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-cream/30">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isModel = msg.role === "model";
                // Skip rendering empty text parts (internal function call parts are managed invisibly)
                const textPart = msg.parts.find((p) => p.text);
                if (!textPart) return null;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isModel ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                        isModel
                          ? "bg-brand-light-cream text-brand-dark-brown border-brand-yellow/30 rounded-tl-none"
                          : "bg-brand-brown text-white border-brand-brown/85 rounded-tr-none"
                      }`}
                    >
                      {/* Avatar & Header */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {isModel ? (
                          <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark-brown">
                            <ChefHat className="w-3 h-3" />
                          </div>
                        ) : null}
                        <span className={`text-[10px] uppercase tracking-wider font-mono font-bold ${
                          isModel ? "text-brand-brown" : "text-brand-light-cream"
                        }`}>
                          {isModel ? "Bakery AI Agent" : "You (Customer)"}
                        </span>
                      </div>

                      {/* Message Text */}
                      <p className="text-sm leading-relaxed whitespace-pre-line font-sans select-text">
                        {textPart.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-brand-light-cream text-brand-dark-brown border border-brand-yellow/30 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-dark-brown/80 font-mono flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-brand-yellow animate-bounce" />
                      Asmaa's Oven Agent is typing...
                    </span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-brown rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-brand-brown rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-brand-brown rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AGENT TOOL LOGS */}
          {recentToolLogs.length > 0 && (
            <div className="bg-slate-950 border-t border-slate-900 text-slate-100 shrink-0">
              <button
                onClick={() => setShowToolLogs(!showToolLogs)}
                type="button"
                className="w-full px-4 py-2 flex justify-between items-center text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
                  AI Agent Tools Triggered ({recentToolLogs.length})
                </span>
                {showToolLogs ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
              
              <AnimatePresence>
                {showToolLogs && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto", maxHeight: "150px" }}
                    exit={{ height: 0 }}
                    className="overflow-y-auto px-4 pb-3 border-t border-slate-900 bg-slate-950 font-mono text-[10px] space-y-2 py-2 text-slate-300"
                  >
                    {recentToolLogs.map((log, i) => (
                      <div key={i} className="border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-brand-yellow font-bold">🛠️ {log.name}()</span>
                          <span className={`text-[9px] px-1.5 rounded-full ${
                            log.result?.error ? "bg-rose-950 text-rose-300 border border-rose-900" : "bg-emerald-950 text-emerald-300 border border-emerald-900"
                          }`}>
                            {log.result?.error ? "Failed" : "Success"}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1">
                          <strong>Args:</strong> {JSON.stringify(log.args)}
                        </div>
                        {log.result && !log.result.error && (
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            <strong>Result:</strong> {log.name === "getMenu" ? "Full Menu Returned" : JSON.stringify(log.result)}
                          </div>
                        )}
                        {log.result?.error && (
                          <div className="text-[9px] text-rose-400 mt-0.5">
                            <strong>Error:</strong> {log.result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* QUICK CHAT SUGGESTIONS */}
          <div className="p-3.5 border-t border-slate-100 bg-white space-y-2 shrink-0">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-brown">Quick-Tap Presets</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleQuickTap("What is on your menu today?")}
                disabled={isTyping}
                type="button"
                className="text-xs bg-brand-soft-yellow hover:bg-brand-yellow text-brand-dark-brown transition px-3 py-1 rounded-full border border-brand-yellow/30 font-medium cursor-pointer"
              >
                📖 Show Menu
              </button>
              <button
                onClick={() => handleQuickTap("Do you deliver to Downtown and what are your opening hours?")}
                disabled={isTyping}
                type="button"
                className="text-xs bg-brand-soft-yellow hover:bg-brand-yellow text-brand-dark-brown transition px-3 py-1 rounded-full border border-brand-yellow/30 font-medium cursor-pointer"
              >
                🕒 Hours &amp; Delivery
              </button>
              <button
                onClick={() => handleQuickTap("Calculate the total price of 2 Zaatar Manakish with Extra Olives and Fresh Mint")}
                disabled={isTyping}
                type="button"
                className="text-xs bg-brand-soft-yellow hover:bg-brand-yellow text-brand-dark-brown transition px-3 py-1 rounded-full border border-brand-yellow/30 font-medium cursor-pointer"
              >
                🧮 Estimate Order Price
              </button>
              <button
                onClick={() => handleQuickTap("Place a pickup order for Mohammad Rayed for 1 Cheese Manousheh with Harissa and 1 Ayran yogurt drink")}
                disabled={isTyping}
                type="button"
                className="text-xs bg-brand-soft-yellow hover:bg-brand-yellow text-brand-dark-brown transition px-3 py-1 rounded-full border border-brand-yellow/30 font-medium cursor-pointer"
              >
                🛍️ Place Order
              </button>
            </div>
          </div>

          {/* CHAT INPUT FORM */}
          <form onSubmit={handleSendMessage} className="p-3.5 bg-slate-50 border-t border-slate-100 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about ingredients, toppings, or place an order..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-brown outline-none text-sm bg-white text-slate-800 placeholder:text-slate-400 font-sans"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-brand-brown text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-brown/95 transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">SEND</span>
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL DASHBOARD */}
        <section id="dashboard-section" className="lg:col-span-6 flex flex-col bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden lg:h-[calc(100vh-140px)]">
          {/* TABS HEADER */}
          <div className="bg-slate-50 border-b border-slate-200/80 p-2.5 flex gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition font-display cursor-pointer ${
                activeTab === "menu"
                  ? "bg-brand-brown text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
              }`}
            >
              <Utensils className="w-4 h-4" />
              Menu Explorer
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition font-display cursor-pointer ${
                activeTab === "orders"
                  ? "bg-brand-brown text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Active Orders
              {orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length > 0 && (
                <span className="bg-brand-yellow text-brand-dark-brown font-mono font-black w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] shadow-sm">
                  {orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("delivery")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition font-display cursor-pointer ${
                activeTab === "delivery"
                  ? "bg-brand-brown text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-4 h-4" />
              Delivery Zones
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 overflow-y-auto p-5 bg-white">
            
            {/* TAB: MENU EXPLORER */}
            {activeTab === "menu" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-black text-lg text-brand-brown flex items-center gap-2">
                      <span className="w-2.5 h-6 bg-brand-yellow rounded-full"></span>
                      POPULAR ITEMS &amp; MENU
                    </h3>
                    <p className="text-xs text-slate-500">Tap items below to ask our AI Agent about them.</p>
                  </div>
                  <button
                    onClick={fetchMenu}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
                    title="Refresh Menu"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {["Manakish", "Beverages", "Desserts"].map((category) => {
                  const categoryItems = menu.filter((item) => item.category === category);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category} className="space-y-3">
                      <h4 className="font-display font-black text-xs text-brand-olive uppercase tracking-widest border-b-2 border-brand-yellow/25 pb-1.5 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-brand-yellow" />
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() =>
                              handleQuickTap(
                                `Tell me about ${item.name} and what ingredients are in it.`
                              )
                            }
                            className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl hover:border-brand-yellow hover:bg-brand-soft-yellow/20 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h5 className="font-display font-black text-sm text-slate-800 group-hover:text-brand-brown transition-colors">
                                  {item.name}
                                </h5>
                                <span className="font-mono text-xs font-black text-brand-olive bg-brand-soft-yellow px-2.5 py-0.5 rounded-lg border border-brand-yellow/25 shrink-0">
                                  ${item.price.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                                {item.description}
                              </p>
                              {item.ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.ingredients.map((ing) => (
                                    <span
                                      key={ing}
                                      className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium"
                                    >
                                      {ing}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {item.availableToppings.length > 0 && (
                              <div className="border-t border-slate-200/50 pt-2.5 mt-2">
                                <span className="text-[10px] font-mono text-brand-brown/70 font-bold block mb-1">
                                  Available Toppings:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {item.availableToppings.map((top) => (
                                    <span
                                      key={top}
                                      className="text-[9px] bg-brand-light-cream text-brand-dark-brown px-1.5 py-0.5 rounded font-medium border border-brand-yellow/20"
                                    >
                                      {top} (+${toppingsPrices[top]?.toFixed(2)})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: ACTIVE ORDERS & TRACKING */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-black text-lg text-brand-brown flex items-center gap-2">
                      <span className="w-2.5 h-6 bg-brand-yellow rounded-full"></span>
                      LIVE ORDER DATABASE
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track current baking states. Click <strong className="text-brand-brown">⚡ Progress</strong> to simulate transitions.
                    </p>
                  </div>
                  <button
                    onClick={fetchOrders}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
                    title="Refresh Orders"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-brand-soft-yellow/40 rounded-3xl border-2 border-brand-yellow/20 p-6 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-brand-brown/40 mx-auto" />
                    <h4 className="font-display font-bold text-sm text-brand-brown">No Orders Placed Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Place an order using the AI Support chat (e.g. ask "I want to place an order for Cheese Manousheh").
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders
                      .slice()
                      .reverse()
                      .map((order) => (
                        <div
                          key={order.id}
                          className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Card Header */}
                          <div className="bg-brand-soft-yellow/50 p-4 border-b border-brand-yellow/20 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-brand-olive bg-brand-soft-yellow px-2.5 py-0.5 rounded border border-brand-yellow/30">
                                {order.id}
                              </span>
                              <h4 className="font-display font-black text-sm text-brand-dark-brown">
                                {order.customerName}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>

                              {/* STEP STATUS BUTTON */}
                              {order.status !== "Delivered" && order.status !== "Cancelled" && (
                                <button
                                  onClick={() => handleStepStatus(order.id)}
                                  type="button"
                                  className="text-[10px] font-mono font-black bg-brand-brown text-white hover:bg-brand-brown/90 px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                                  title="Advance Status State"
                                >
                                  ⚡ Progress
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 space-y-4">
                            {/* Order Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-slate-100 pb-3.5">
                              <div>
                                <span className="text-[10px] font-mono text-brand-brown/70 uppercase tracking-wider block">
                                  Method
                                </span>
                                <span className="text-xs font-bold text-slate-800 capitalize">
                                  {order.deliveryType}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-brand-brown/70 uppercase tracking-wider block">
                                  Time
                                </span>
                                <span className="text-xs font-medium text-slate-800">
                                  {new Date(order.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-brand-brown/70 uppercase tracking-wider block">
                                  Est. Time
                                </span>
                                <span className="text-xs font-bold text-brand-brown">
                                  {order.estimatedTime}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-brand-brown/70 uppercase tracking-wider block">
                                  Total Cost
                                </span>
                                <span className="text-xs font-black text-brand-olive">
                                  ${order.total.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Delivery Address (if delivery) */}
                            {order.deliveryType === "delivery" && order.deliveryAddress && (
                              <div className="bg-brand-soft-yellow/30 p-3 rounded-xl border border-brand-yellow/20 text-xs flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-brand-brown shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-mono text-[9px] text-brand-brown/70 uppercase tracking-wider block font-bold">
                                    Delivery Address ({order.deliveryArea})
                                  </span>
                                  <span className="text-slate-700 font-medium">{order.deliveryAddress}</span>
                                </div>
                              </div>
                            )}

                            {/* Order Items List */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono text-brand-brown/70 uppercase tracking-wider block">
                                Items Ordered
                              </span>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-start text-xs border-b border-slate-100/60 pb-1.5 last:border-0 last:pb-0"
                                  >
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono bg-brand-soft-yellow text-brand-dark-brown px-1.5 py-0.5 rounded font-black text-[10px] border border-brand-yellow/20">
                                          {item.quantity}x
                                        </span>
                                        <span className="font-bold text-slate-800">{item.name}</span>
                                      </div>
                                      {item.toppings && item.toppings.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1 pl-7">
                                          {item.toppings.map((top) => (
                                            <span
                                              key={top}
                                              className="text-[9px] bg-brand-light-cream text-brand-brown px-1.5 py-0.2 rounded font-medium border border-brand-yellow/15"
                                            >
                                              + {top}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-mono text-slate-600 font-bold">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Total breakdown */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                              <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
                              </div>
                              {order.deliveryType === "delivery" && (
                                <div className="flex justify-between text-slate-600">
                                  <span>Delivery Fee ({order.deliveryArea})</span>
                                  <span className="font-mono">${order.deliveryFee.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-brand-dark-brown font-black border-t border-slate-200 pt-1.5 mt-1">
                                <span>Grand Total</span>
                                <span className="font-mono text-brand-olive text-sm">${order.total.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Status Stepper Progression Line */}
                            <div className="pt-2">
                              <span className="text-[10px] font-mono text-brand-brown/70 uppercase tracking-wider block mb-2">
                                Baker Progression Status
                              </span>
                              <div className="flex justify-between items-center relative">
                                <div className="absolute left-2 right-2 h-0.5 bg-slate-200 top-2.5 z-0"></div>
                                {order.status === "Cancelled" ? (
                                  <div className="w-full text-center py-1 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200 font-mono font-bold">
                                    ❌ Order Has Been Cancelled
                                  </div>
                                ) : (
                                  ["Received", "Baking", order.deliveryType === "delivery" ? "Out for Delivery" : "Ready for Pickup", "Delivered"].map(
                                    (step, idx) => {
                                      const orderStatuses = ["Received", "Baking", order.deliveryType === "delivery" ? "Out for Delivery" : "Ready for Pickup", "Delivered"];
                                      const currentIdx = orderStatuses.indexOf(order.status);
                                      const stepIdx = orderStatuses.indexOf(step as any);
                                      
                                      const isCompleted = stepIdx < currentIdx || order.status === "Delivered";
                                      const isActive = order.status === step;

                                      return (
                                        <div key={idx} className="flex flex-col items-center z-10">
                                          <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-mono font-bold transition-all ${
                                              isCompleted
                                                ? "bg-brand-olive text-white border-brand-olive"
                                                : isActive
                                                ? "bg-brand-yellow text-brand-dark-brown border-brand-yellow animate-pulse scale-110 shadow"
                                                : "bg-white text-slate-400 border-slate-200"
                                            }`}
                                          >
                                            {isCompleted ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                                          </div>
                                          <span
                                            className={`text-[8px] font-mono mt-1 text-center font-bold tracking-tight ${
                                              isActive
                                                ? "text-brand-brown font-black"
                                                : isCompleted
                                                ? "text-brand-olive"
                                                : "text-slate-400"
                                            }`}
                                          >
                                            {step.replace("Ready for ", "").replace("Out for ", "")}
                                          </span>
                                        </div>
                                      );
                                    }
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DELIVERY INFO & MAP */}
            {activeTab === "delivery" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-black text-lg text-brand-brown flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-brand-yellow rounded-full"></span>
                    DELIVERY COVERAGE
                  </h3>
                  <p className="text-xs text-slate-500">
                    We deliver fresh and hot Manakish within our local neighborhoods.
                  </p>
                </div>

                {/* Delivery Checker Form */}
                <div className="bg-brand-soft-yellow/40 border-2 border-brand-yellow/20 p-5 rounded-2xl space-y-3">
                  <h4 className="font-display font-black text-sm text-brand-dark-brown">Verify Your Address Coverage</h4>
                  <form onSubmit={checkDeliveryCoverage} className="flex gap-2">
                    <input
                      type="text"
                      value={checkAreaQuery}
                      onChange={(e) => setCheckAreaQuery(e.target.value)}
                      placeholder="Enter neighborhood (e.g. Hamra, Achrafieh)..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown text-slate-800"
                    />
                    <button
                      type="submit"
                      className="bg-brand-brown text-white text-xs font-bold px-4 py-2.5 rounded-xl transition hover:bg-brand-brown/95 cursor-pointer shadow-sm"
                    >
                      Check Area
                    </button>
                  </form>

                  {checkAreaResult.searched && (
                    <div className="pt-2">
                      {checkAreaResult.found ? (
                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-4 text-xs flex items-start gap-2.5 shadow-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-black">Good News! Delivery Coverage Confirmed!</p>
                            <p className="text-emerald-700 mt-1 leading-relaxed">
                              <strong>Area:</strong> {checkAreaResult.zone?.area} |{" "}
                              <strong>Est. Delivery Time:</strong> {checkAreaResult.zone?.time} |{" "}
                              <strong>Delivery Fee:</strong> ${checkAreaResult.zone?.fee.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-rose-50 text-rose-800 border border-rose-200 rounded-xl p-4 text-xs flex items-start gap-2.5 shadow-sm">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-black">Outside Delivery Bounds</p>
                            <p className="text-rose-700 mt-1 leading-relaxed">
                              We do not deliver to this area. Don't worry! You can still order for{" "}
                              <strong>Pickup</strong> directly at our bakery.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery Zone Table */}
                <div className="space-y-2">
                  <h4 className="font-display font-black text-xs text-brand-brown/70 uppercase tracking-widest">
                    Our Supported Delivery Zones
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-brand-soft-yellow text-brand-dark-brown border-b-2 border-brand-yellow/20 font-black text-xs font-display">
                          <th className="p-3">Zone/Neighborhood</th>
                          <th className="p-3">Est. Delivery Time</th>
                          <th className="p-3 text-right">Delivery Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deliveryZones.map((zone) => (
                          <tr key={zone.area} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-bold text-slate-800">{zone.area}</td>
                            <td className="p-3 text-slate-600">{zone.time}</td>
                            <td className="p-3 text-right font-mono font-black text-brand-olive">
                              ${zone.fee.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bakery Storefront Info Card */}
                <div className="bg-brand-soft-yellow/80 border-2 border-brand-yellow rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4.5 h-4.5 text-brand-brown" />
                    <h4 className="font-display font-black text-sm text-brand-dark-brown">Bakery Pick-Up Address</h4>
                  </div>
                  <p className="text-xs text-brand-dark-brown leading-relaxed">
                    If you live outside our delivery zone, choose **Pickup** when placing an order. You can pick it up hot and fresh directly from our clay oven at:
                  </p>
                  <p className="text-xs font-mono font-black text-brand-olive bg-white/90 p-3 rounded-xl border border-brand-yellow/30 shadow-sm">
                    📍 100 Manakish Alley, Flour District, Beirut
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER & TOOLS BAR */}
      <footer className="bg-slate-950 text-slate-400 py-6 border-t border-slate-900 text-center text-xs shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Agent Tools Status:</span>
            <div className="flex items-center gap-2 text-xs text-white/80 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              Information Tool
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Analysis Tool
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              Action Tool
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
              Reporting Tool
            </div>
          </div>
          <div className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">
            Asmaa &amp; Mohammad Rayed • Environment: Dockerized LangGraph-v1.2
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-900/60 mt-4 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-600 gap-2">
          <span>Manakish Bakery Assistant © 2026 • Real-Time AI Order Integration</span>
          <span>Powered by Gemini 3.5 Flash &amp; React 19 • Designed with Vibrant Palette theme</span>
        </div>
      </footer>
    </div>
  );
}
