import React, { useState, useEffect } from 'react';
import { UserProfile, TestAttempt, LiveDoubt, Notice, AppBanner, NotificationAlert } from '../types';
import { 
  Award, 
  Clock, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Accessibility, 
  Sliders, 
  ChevronRight, 
  HelpCircle, 
  MessageSquare,
  Bell,
  Eye,
  Megaphone,
  Sparkles,
  Info
} from 'lucide-react';
import { ProgressRing, TiltCard, CounterAnimation } from './InteractiveEffects';
import { getNotices, getBanners, getNotifications, saveNotifications } from '../dataStore';

interface DashboardAnalyticsProps {
  user: UserProfile | null;
  attempts: TestAttempt[];
  onOpenLogin: () => void;
  doubts?: LiveDoubt[];
  onAddDoubt?: (newDoubt: LiveDoubt) => void;
  onReplyDoubt?: (doubtId: string, replyPayload: { reply: string, repliedBy: string, status: 'resolved' | 'open' }) => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  user,
  attempts,
  onOpenLogin,
  doubts = [],
  onAddDoubt,
  onReplyDoubt
}) => {
  const [fontSize, setFontSize] = useState<number>(14); // in px for accessibility
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Live academic doubts solver states
  const [showDoubtForm, setShowDoubtForm] = useState(false);
  const [doubtSubject, setDoubtSubject] = useState('Mathematics');
  const [doubtMessage, setDoubtMessage] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  // Dynamic board states
  const [notices, setNotices] = useState<Notice[]>([]);
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Fetch lists on load
  useEffect(() => {
    if (user) {
      setNotices(getNotices());
      setBanners(getBanners().filter(b => b.active));
      setNotifications(getNotifications());
    }
  }, [user]);

  // Autoplay banner carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] text-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-[#F8FAFC]">
        <AlertTriangle className="w-12 h-12 text-[#06B6D4] mx-auto mb-4" />
        <h3 className="text-lg font-bold font-sans text-[#F8FAFC]">Student Dashboard Locked</h3>
        <p className="text-xs text-[#94A3B8] mt-2 mb-6">
          Please Login or Register with your credentials (mobile, batch number, and roll number) to view personalized analytics.
        </p>
        <button
          onClick={onOpenLogin}
          className="w-full py-2.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-[14px] text-xs font-bold shadow hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all cursor-pointer"
        >
          Access Portal Login
        </button>
      </div>
    );
  }

  // Filter attempts belonging strictly to this user
  const myAttempts = attempts.filter(att => att.userId === user.id);

  // Compute stats
  const totalCompleted = myAttempts.length;
  const averageScore = totalCompleted > 0
    ? parseFloat((myAttempts.reduce((acc, a) => acc + a.score, 0) / totalCompleted).toFixed(1))
    : 0;
  
  const topScore = totalCompleted > 0
    ? Math.max(...myAttempts.map(a => a.score))
    : 0;

  // Preparation Percentage
  const basePrep = 40; 
  const calculatedPrep = Math.min(95, basePrep + (totalCompleted * 15) + (user.isPremium ? 20 : 0));

  // Compute remaining days on subscription
  let remainingDaysText = '';
  let subExpiringSoon = false;
  if (user.isPremium && user.subscriptionEndDate) {
    const end = new Date(user.subscriptionEndDate).getTime();
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0) {
      remainingDaysText = `${days} Days left`;
      if (days <= 3) {
        subExpiringSoon = true;
      }
    } else {
      remainingDaysText = 'Expired';
    }
  }

  // Dismiss a notification
  const handleMarkNotifRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleClearAllNotifs = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      className={`w-full min-h-screen py-6 px-4 bg-[#0B1220] transition-all duration-300 text-[#F8FAFC] ${
        highContrast ? 'contrast-125' : ''
      }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 0. DYNAMIC BANNER CAROUSEL */}
        {banners.length > 0 && (
          <div className="relative w-full h-44 sm:h-56 bg-[#111827] rounded-[24px] overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-md">
            {banners.map((ban, idx) => {
              const isActive = idx === activeBannerIdx;
              return (
                <div
                  key={ban.id}
                  className={`absolute inset-0 transition-opacity duration-1000 flex flex-col justify-end p-6 bg-cover bg-center ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  style={{ backgroundImage: `linear-gradient(rgba(11,18,32,0.1), rgba(11,18,32,0.9)), url(${ban.imageUrl})` }}
                >
                  <div className="space-y-1.5 max-w-xl">
                    <span className="text-[8.5px] bg-[#3B82F6] text-white px-2 py-0.5 rounded-[10px] font-black uppercase tracking-wider">
                      VIBRANT PROMO
                    </span>
                    <h2 className="text-sm sm:text-lg font-black text-white leading-tight uppercase tracking-tight">
                      {ban.title}
                    </h2>
                    <p className="text-[10px] text-[#06B6D4] font-bold">
                      Sikar Offline Batches & Interactive Live Handbook Platform
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Dots */}
            <div className="absolute top-4 right-4 z-20 flex gap-1 bg-black/40 px-2 py-1 rounded-full">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIdx(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    idx === activeBannerIdx ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 1. NOTICES BOARD FEED (PINNED CARDS FIRST) */}
        {notices.length > 0 && (
          <div className="bg-gradient-to-r from-cyan-950/20 to-blue-950/20 border border-cyan-500/30 rounded-[20px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-[12px] bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] bg-cyan-900/30 border border-cyan-500/20 text-cyan-300 font-extrabold uppercase px-1.5 py-0.5 rounded-[10px]">
                  PINNED ANNOUNCEMENT
                </span>
                <h4 className="text-xs font-bold text-white mt-1">
                  {notices.find(n => n.pinned)?.title || notices[0].title}
                </h4>
                <p className="text-[11px] text-[#94A3B8] line-clamp-1 mt-0.5">
                  {notices.find(n => n.pinned)?.content || notices[0].content}
                </p>
              </div>
            </div>
            <button
              onClick={() => alert(`Notice board summary: "${notices[0].content}"`)}
              className="px-3.5 py-1.5 bg-[#0B1220] hover:bg-[#111827] text-[#06B6D4] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-[10px] font-bold cursor-pointer transition-all shrink-0"
            >
              Read Full Notice
            </button>
          </div>
        )}
        
        {/* UPPER ROW: PROFILE CARD & IN-APP NOTIFICATION BELL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: ID Card Badge */}
          <div className="lg:col-span-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 text-[#F8FAFC] flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#3B82F6]/5 rounded-full blur-2xl -mr-10 -mt-10" />
            
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-[#06B6D4] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-[12px]">
                  Vibrant Official Student Pass
                </span>
                <h3 className="text-xl font-bold font-sans mt-3 text-[#F8FAFC]">{user.name}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">{user.email} | {user.mobile}</p>
              </div>
              
              <div className="bg-[#0B1220] px-3 py-1.5 rounded-[12px] border border-[rgba(255,255,255,0.08)] text-right space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#94A3B8] block">ACCOUNT TIER</span>
                <span className="text-xs font-bold tracking-wide text-[#06B6D4] flex items-center gap-1">
                  {user.isPremium ? '★ PREMIUM VIP' : 'FREE USER'}
                </span>
                {user.isPremium && (
                  <span className={`text-[9px] font-mono font-bold block ${subExpiringSoon ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                    {remainingDaysText}
                  </span>
                )}
              </div>
            </div>

            {/* Core credentials info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-[rgba(255,255,255,0.08)] pt-4 z-10 text-xs text-[#94A3B8]">
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">ROLL NUMBER</span>
                <span className="font-bold text-[#F8FAFC] mt-0.5 inline-block">{user.rollNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">COACHING CENTRE</span>
                <span className="font-bold text-[#F8FAFC] mt-0.5 inline-block">{user.centreName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">BATCH CODE</span>
                <span className="font-bold text-[#F8FAFC] mt-0.5 inline-block">{user.batchNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">JOINED ON</span>
                <span className="font-bold text-[#F8FAFC] mt-0.5 inline-block">
                  {new Date(user.registeredAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: IN-APP PUSH NOTIFICATIONS READER */}
          <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between text-[#F8FAFC]">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                <h4 className="font-bold text-[#F8FAFC] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  Notification Center
                </h4>
                {unreadNotifsCount > 0 ? (
                  <button
                    onClick={handleClearAllNotifs}
                    className="text-[9px] text-[#3B82F6] hover:underline font-bold"
                  >
                    Clear All ({unreadNotifsCount})
                  </button>
                ) : (
                  <span className="text-[9px] text-zinc-500">Up to date</span>
                )}
              </div>

              {/* Notification Queue List */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {notifications.filter(n => !n.read).map((n) => (
                  <div key={n.id} className="p-2.5 bg-[#0B1220] rounded-[12px] border border-[rgba(255,255,255,0.04)] text-[10px] leading-relaxed flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        {n.title}
                      </div>
                      <p className="text-[#94A3B8]">{n.message}</p>
                    </div>
                    <button
                      onClick={() => handleMarkNotifRead(n.id)}
                      className="text-[9px] text-zinc-500 hover:text-white shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
                {notifications.filter(n => !n.read).length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-[10px] italic">
                    No unread push alerts recorded.
                  </div>
                )}
              </div>
            </div>

            <div className="text-[9.5px] text-[#94A3B8] bg-[#0B1220] p-2 rounded-[10px] border border-[rgba(255,255,255,0.04)] mt-3 leading-normal flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Includes automatic test reminders and subscription status alerts.</span>
            </div>
          </div>

        </div>

        {/* BENTO GRID: METRIC COUNTERS, LINE TRAJECTORY & REMINDERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Bento Box 1: Preparation circle with custom ProgressRing */}
          <TiltCard className="bg-[#111827] border border-[rgba(255,255,255,0.08)] p-6 rounded-[20px] flex flex-col justify-between items-center text-center shadow-sm">
            <p className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">Overall Syllabus Prep</p>
            
            <div className="relative w-32 h-32 flex items-center justify-center my-4">
              <ProgressRing percentage={calculatedPrep} size={110} strokeWidth={8} color="stroke-[#3B82F6]" trackColor="stroke-[#0B1220]" />
              <div className="absolute flex flex-col items-center mt-12">
                <span className="text-[8px] text-[#06B6D4] font-bold tracking-wider">ESTIMATED</span>
              </div>
            </div>

            <span className="text-[10px] bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-[#06B6D4] px-3 py-1 rounded-full font-bold">
              {totalCompleted} of 10 Required Mocks Completed
            </span>
          </TiltCard>

          {/* Bento Box 2: Numerical Counter stats inside TiltCard */}
          <TiltCard className="bg-[#111827] border border-[rgba(255,255,255,0.08)] p-6 rounded-[20px] flex flex-col justify-between shadow-sm text-[#F8FAFC]">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">Attempt Summary</p>
              
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-2">
                  <span className="text-xs text-[#94A3B8] font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Mocks Finished
                  </span>
                  <span className="text-sm font-black text-[#F8FAFC]">
                    <CounterAnimation target={totalCompleted} />
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-2">
                  <span className="text-xs text-[#94A3B8] font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Average Score
                  </span>
                  <span className="text-sm font-black text-[#F8FAFC]">
                    <CounterAnimation target={Math.floor(averageScore)} suffix=" Marks" />
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2">
                  <span className="text-xs text-[#94A3B8] font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Personal Best
                  </span>
                  <span className="text-sm font-black text-[#06B6D4]">
                    <CounterAnimation target={topScore} suffix=" Marks" />
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-[#94A3B8] mt-2">
              Updated in real-time. Akhil sir recommends aiming for 160+ marks for safe SSC ASO postings.
            </p>
          </TiltCard>

          {/* Bento Box 3: Custom SVG Trajectory Chart */}
          <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] p-6 rounded-[20px] shadow-sm md:col-span-2 flex flex-col justify-between text-[#F8FAFC]">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider mb-4">Exam-by-Exam Score Trajectory</p>
              
              {totalCompleted > 0 ? (
                <div className="w-full h-32 relative bg-[#0B1220] rounded-xl p-2 border border-[rgba(255,255,255,0.08)]">
                  {/* Custom SVG line chart illustrating scores */}
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area background under line */}
                    <path 
                      d={`M 10 100 ${myAttempts.map((att, index) => {
                        const step = 280 / Math.max(1, totalCompleted - 1);
                        const x = 10 + index * step;
                        // Score mapped: 0 is y=90, 200 is y=10
                        const y = 90 - (att.score / att.totalMarks) * 80;
                        return `L ${x} ${y}`;
                      }).join(' ')} L 290 100 Z`}
                      fill="url(#chartGrad)"
                    />
                    
                    {/* Gridlines */}
                    <line x1="10" y1="50" x2="290" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="4" />
                    <line x1="10" y1="90" x2="290" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="1" />

                    {/* Chart Stroke Line */}
                    <path 
                      d={myAttempts.map((att, index) => {
                        const step = 280 / Math.max(1, totalCompleted - 1);
                        const x = 10 + index * step;
                        const y = 90 - (att.score / att.totalMarks) * 80;
                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                    />

                    {/* Data Points */}
                    {myAttempts.map((att, index) => {
                      const step = 280 / Math.max(1, totalCompleted - 1);
                      const x = 10 + index * step;
                      const y = 90 - (att.score / att.totalMarks) * 80;
                      return (
                        <g key={att.id}>
                          <circle cx={x} cy={y} r="4" fill="#111827" stroke="#3B82F6" strokeWidth="2" />
                          <text x={x} y={y - 8} fill="#06B6D4" className="font-mono font-bold" fontSize="8" textAnchor="middle">
                            {att.score}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* X axis labels */}
                  <div className="flex justify-between text-[8px] text-[#94A3B8] px-2 mt-1 font-mono">
                    {myAttempts.map((att, idx) => (
                      <span key={att.id} className="truncate max-w-[50px]">Mock {idx + 1}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-center bg-[#0B1220] rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] p-4">
                  <TrendingUp className="w-8 h-8 text-[#94A3B8]/60 mb-1" />
                  <p className="text-xs text-[#94A3B8]">No mock attempts recorded yet. Attempt a test to populate charts.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* DEADLINES & PAST ATTEMPTS TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Deadlines alerts (Push notification mock panel) */}
          <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 shadow-sm text-[#F8FAFC]">
            <h4 className="font-bold text-[#F8FAFC] text-xs uppercase tracking-wider flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#06B6D4]" />
              Deadlines & Exam Alerts
            </h4>

            <div className="space-y-3.5">
              <div className="flex gap-3 border-b border-[rgba(255,255,255,0.08)] pb-3">
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-[#3B82F6] animate-ping" />
                <div>
                  <h5 className="text-xs font-bold text-[#F8FAFC]">SSC CGL Tier-I 2026</h5>
                  <div className="flex gap-3 text-[10px] text-[#94A3B8] mt-0.5">
                    <span className="font-bold text-[#06B6D4]">Sept 15, 2026</span>
                    <span>•</span>
                    <span className="font-bold text-[#3B82F6]">83 Days left</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 border-b border-[rgba(255,255,255,0.08)] pb-3">
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-[#8B5CF6]" />
                <div>
                  <h5 className="text-xs font-bold text-[#F8FAFC]">Delhi Police SI (CPO) Mock Arena</h5>
                  <div className="flex gap-3 text-[10px] text-[#94A3B8] mt-0.5">
                    <span className="font-bold text-[#06B6D4]">July 10, 2026</span>
                    <span>•</span>
                    <span className="font-bold text-[#3B82F6]">16 Days left</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-[#06B6D4]" />
                <div>
                  <h5 className="text-xs font-bold text-[#F8FAFC]">Vibrant Internal Batch Scholarship Test</h5>
                  <div className="flex gap-3 text-[10px] text-[#94A3B8] mt-0.5">
                    <span className="font-bold text-[#06B6D4]">July 01, 2026</span>
                    <span>•</span>
                    <span className="font-bold text-[#3B82F6]">7 Days left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Past Attempts detailed history */}
          <div className="lg:col-span-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 shadow-sm text-[#F8FAFC]">
            <h4 className="font-bold text-[#F8FAFC] text-xs uppercase tracking-wider flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />
              Detailed Test History & Analytics
            </h4>

            {myAttempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#94A3B8]">
                      <th className="py-2.5 font-bold">Exam Mock Title</th>
                      <th className="py-2.5 font-bold text-center">Score</th>
                      <th className="py-2.5 font-bold text-center">Accuracy</th>
                      <th className="py-2.5 font-bold text-right">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                    {myAttempts.map((att) => {
                      const totalQ = att.correctAnswers + att.incorrectAnswers;
                      const accuracy = totalQ > 0 ? Math.round((att.correctAnswers / totalQ) * 100) : 0;
                      return (
                        <tr key={att.id} className="text-[#F8FAFC] hover:bg-[#0B1220]/50 transition-colors">
                          <td className="py-3 font-bold max-w-[200px] truncate">{att.testTitle}</td>
                          <td className="py-3 text-center font-bold text-[#F8FAFC]">
                            {att.score} / {att.totalMarks}
                          </td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-0.5 rounded-[12px] text-[10px] font-bold bg-[#0B1220] text-[#06B6D4] border border-[rgba(255,255,255,0.08)]">
                              {accuracy}%
                            </span>
                          </td>
                          <td className="py-3 text-right text-[10px] text-[#94A3B8]">
                            {new Date(att.completedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-10 bg-[#0B1220] rounded-[20px] border border-dashed border-[rgba(255,255,255,0.08)]">
                <FileText className="w-10 h-10 text-[#94A3B8]/60 mx-auto mb-2" />
                <p className="text-xs text-[#94A3B8]">No mock attempts logged yet. Check out the Test Series portal!</p>
              </div>
            )}
          </div>

        </div>

        {/* LIVE DOUBT SOLVER PANEL */}
        <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 shadow-sm space-y-6 text-[#F8FAFC]">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
            <div>
              <h4 className="font-bold text-[#F8FAFC] text-sm uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#06B6D4]" />
                Vibrant Live Doubt Solver (Real-Time Firestore Sync)
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1">
                Post academic doubts and get expert feedback with Akhil Sir's shortcuts directly from Nawalgarh Road, Sikar.
              </p>
            </div>
            {!(user.role === 'admin' || user.role === 'instructor') && (
              <button
                onClick={() => setShowDoubtForm(!showDoubtForm)}
                className="mt-3 md:mt-0 px-4 py-2 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] text-white font-bold text-xs rounded-[14px] flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                {showDoubtForm ? 'Close Doubt Form' : 'Ask Academic Doubt'}
              </button>
            )}
          </div>

          {/* New Doubt Form */}
          {showDoubtForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!doubtMessage.trim() || !onAddDoubt) return;
                const newDoubt: LiveDoubt = {
                  id: "DBT-" + Math.floor(Math.random() * 90000 + 10000),
                  studentUid: user.uid,
                  studentName: user.name,
                  studentRoll: user.rollNumber,
                  subject: doubtSubject,
                  message: doubtMessage.trim(),
                  status: 'open',
                  createdAt: new Date().toISOString()
                };
                onAddDoubt(newDoubt);
                setDoubtMessage('');
                setShowDoubtForm(false);
                alert("🚀 Doubt logged successfully in secure databases!");
              }}
              className="bg-[#0B1220] border border-[rgba(255,255,255,0.08)] p-5 rounded-[20px] space-y-4"
            >
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#F8FAFC]">
                Submit New Academic Question
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Subject</label>
                  <select
                    value={doubtSubject}
                    onChange={(e) => setDoubtSubject(e.target.value)}
                    className="w-full bg-[#111827] text-xs border border-[rgba(255,255,255,0.08)] rounded-[12px] px-3 py-2 text-[#F8FAFC] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="English">English</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Doubt/Question Description</label>
                  <input
                    type="text"
                    required
                    placeholder="Type your academic query (e.g., Akhil Sir quadratic equation shortcut doubt)..."
                    value={doubtMessage}
                    onChange={(e) => setDoubtMessage(e.target.value)}
                    className="w-full bg-[#111827] text-xs border border-[rgba(255,255,255,0.08)] rounded-[12px] px-3 py-2 text-[#F8FAFC] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white font-bold text-xs rounded-[14px] shadow transition-all cursor-pointer"
                >
                  Submit Query to Faculty
                </button>
              </div>
            </form>
          )}

          {/* Doubt List */}
          <div className="space-y-4">
            {(user.role === 'admin' || user.role === 'instructor' ? doubts : doubts.filter(d => d.studentUid === user.uid)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user.role === 'admin' || user.role === 'instructor' ? doubts : doubts.filter(d => d.studentUid === user.uid)).map((d) => (
                  <div key={d.id} className="border border-[rgba(255,255,255,0.08)] rounded-[20px] p-4 bg-[#111827] shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-[#06B6D4] text-[9px] uppercase font-bold rounded-[12px]">
                          {d.subject}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-[12px] text-[9px] font-bold uppercase bg-[#0B1220] text-[#8B5CF6] border border-[rgba(255,255,255,0.08)]">
                          {d.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-[#94A3B8] mt-1 flex justify-between">
                        <span>By: <strong className="text-[#F8FAFC]">{d.studentName}</strong> ({d.studentRoll})</span>
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>

                      <p className="text-xs font-bold text-[#F8FAFC] mt-2 bg-[#0B1220] p-2.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                        {d.message}
                      </p>

                      {d.reply ? (
                        <div className="mt-3 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] p-3 rounded-[12px] space-y-1">
                          <span className="text-[9px] bg-[#111827] text-[#06B6D4] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-[12px] font-bold uppercase">
                            Faculty Response
                          </span>
                          <p className="text-xs text-[#94A3B8] italic font-medium">
                            "{d.reply}"
                          </p>
                          <p className="text-[10px] text-[#06B6D4] font-bold text-right pt-1">
                            — {d.repliedBy}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 text-[10px] text-[#8B5CF6] italic flex items-center gap-1 bg-[#0B1220] px-3 py-2 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                          <span>⏳ Awaiting reply from Akhil Sir or Faculty Panel...</span>
                        </div>
                      )}
                    </div>

                    {/* Faculty Action / Reply Form */}
                    {(user.role === 'admin' || user.role === 'instructor') && d.status === 'open' && (
                      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.08)] space-y-2">
                        <label className="block text-[9px] font-bold text-[#94A3B8] uppercase">Write Expert Reply</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type faculty response / Akhil sir's trick..."
                            value={replyTexts[d.id] || ''}
                            onChange={(e) => setReplyTexts({ ...replyTexts, [d.id]: e.target.value })}
                            className="flex-grow bg-[#0B1220] text-xs border border-[rgba(255,255,255,0.08)] rounded-[12px] px-3 py-1.5 focus:outline-none text-[#F8FAFC]"
                          />
                          <button
                            onClick={() => {
                              const text = replyTexts[d.id]?.trim();
                              if (!text || !onReplyDoubt) return;
                              onReplyDoubt(d.id, {
                                reply: text,
                                repliedBy: user.name + " (Senior Faculty)",
                                status: 'resolved'
                              });
                              setReplyTexts({ ...replyTexts, [d.id]: '' });
                              alert("✅ Resolved student doubt and synchronized across databases!");
                            }}
                            className="px-3 py-1.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white font-bold text-xs rounded-[14px] shadow cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-[#0B1220] rounded-[20px] border border-dashed border-[rgba(255,255,255,0.08)]">
                <MessageSquare className="w-10 h-10 text-[#94A3B8]/60 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-[#94A3B8]">No active academic doubts recorded in your roster.</p>
                {!(user.role === 'admin' || user.role === 'instructor') && (
                  <button
                    onClick={() => setShowDoubtForm(true)}
                    className="mt-3 px-4 py-2 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white text-xs font-bold rounded-[14px] shadow hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] cursor-pointer"
                  >
                    Post First Academic Doubt
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
