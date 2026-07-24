'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  BrainCircuit,
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Building2,
  AlertTriangle,
  Award,
  BarChart2,
  MessageSquare
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  "Which department has the highest placement readiness?",
  "List students needing immediate remedial intervention",
  "Who is eligible for Zoho & TCS drives?",
  "Summarize overall placement readiness metrics",
  "Show top 5 performers across MSc SS and MCA"
];

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'predictions' | 'summary'>('chat');
  const [insights, setInsights] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi! 👋",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([api.getAIInsights(), api.getPredictions()])
      .then(([insRes, predRes]) => {
        setInsights(insRes.insights || []);
        setPredictions(predRes || []);
      })
      .catch(err => console.error('Failed to load insights', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAsking, activeTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMsg).trim();
    if (!query || isAsking) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setIsAsking(true);

    try {
      const res = await api.askAIChatbot(query);
      const aiReply = res.reply || "I evaluated your query against live placement data.";

      const aiMessage: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: "⚠️ Sorry, I encountered a temporary connection issue processing your request.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (text: string) => {
    // Simple markdown line renderer for tables, bullet points, and headers
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-bold text-indigo-300 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('• ') || line.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 my-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^[•*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong className="text-white">$1</strong>').replace(/`(.*?)`/g, '<code className="px-1 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">$1</code>') }} />
          </div>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={idx} className="text-xs text-slate-200 my-1 pl-2">
            <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong className="text-white font-semibold">$1</strong>') }} />
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong className="text-white font-semibold">$1</strong>').replace(/`(.*?)`/g, '<code className="px-1 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">$1</code>') }} />
      );
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="animate-pulse flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              <span>Initialising SkillTrack AI Engine & Predictions...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-5 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
                AI Assistant & Analytics Engine
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Ask questions
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                AI Chatbot
              </button>
              <button
                onClick={() => setActiveTab('predictions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'predictions'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Readiness Matrix
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'summary'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Summary
              </button>
            </div>
          </div>

          {/* TAB 1: AI CHATBOT INTERFACE */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[520px]">
              {/* Chat Header Bar */}
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      SkillTrack
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-slate-400">Live AI assistant linked to student & placement database</p>
                  </div>
                </div>

                <button
                  onClick={() => setMessages([messages[0]])}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition"
                  title="Clear Chat History"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Chat
                </button>
              </div>

              {/* Chat Messages Stream Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800 text-cyan-400 border border-slate-700'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Content Box */}
                    <div className={`max-w-2xl rounded-2xl p-4 shadow-xl text-xs space-y-1 relative group ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition rounded"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}

                      <div>{renderFormattedText(msg.text)}</div>

                      <div className={`text-[9px] mt-2 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Typing Indicator */}
                {isAsking && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      <span>SkillTrack AI is querying live student database...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggested Prompts Bar */}
              <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Suggested Queries:
                </span>
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-indigo-300 shrink-0 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask AI anything (e.g. Which department is top? Who is at risk? What is Zoho criteria?)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />

                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isAsking}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50 transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PLACEMENT READINESS PREDICTION MATRIX */}
          {activeTab === 'predictions' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Placement Readiness Prediction Matrix</span>
                <span className="text-xs font-normal text-slate-400">Sorted by Readiness %</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Dept</th>
                      <th className="p-3">CGPA</th>
                      <th className="p-3">Avg Score</th>
                      <th className="p-3">Placement Readiness %</th>
                      <th className="p-3">Risk Assessment</th>
                      <th className="p-3">Expected Interview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {predictions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-indigo-300">{p.roll_number}</td>
                        <td className="p-3 font-semibold text-white">
                          <Link href={`/students/${p.id}`} className="hover:text-indigo-400 flex items-center gap-1">
                            {p.name}
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                          </Link>
                        </td>
                        <td className="p-3 text-slate-300">{p.department}</td>
                        <td className="p-3 font-bold text-slate-100">{p.cgpa}</td>
                        <td className="p-3 font-semibold text-indigo-300">{p.avg_score}%</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">{p.placement_readiness_pct}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full ${p.placement_readiness_pct >= 80 ? 'bg-emerald-400' : (p.placement_readiness_pct >= 60 ? 'bg-amber-400' : 'bg-rose-400')}`}
                                style={{ width: `${p.placement_readiness_pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.risk_level === 'Low Risk' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {p.risk_level}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{p.expected_interview_perf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EXECUTIVE AI SUMMARY */}
          {activeTab === 'summary' && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  AI Natural Language Executive Summary Feed
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30">
                  Real-time Synthesis
                </span>
              </div>

              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/20 text-xs text-slate-200 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
