import React from 'react';
import { UserProfile } from '../types';
import { LogOut, Sun, Moon, Phone, MapPin, Sparkles, User, ShieldCheck, Home, BookOpen, Award, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenLogin,
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tests', label: 'Test Series', icon: Award },
    { id: 'notes', label: 'Study Material', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0B1220]/80 border-b border-[rgba(255,255,255,0.08)] transition-all duration-300 shadow-lg">
        {/* Top Banner with Contacts */}
        <div className="bg-[#111827] text-[#94A3B8] text-[10px] sm:text-xs py-2 px-4 flex flex-wrap justify-between items-center border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 font-normal">
              <Phone className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="text-[#F8FAFC]">Admissions: +91 9414 000 135</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Nawalgarh Road, Sikar, Rajasthan</span>
            </span>
          </div>
          <div className="flex items-center space-x-3 mt-1 sm:mt-0">
            <span className="bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-[#06B6D4] px-2.5 py-0.5 rounded-[12px] text-[9px] font-bold tracking-wider">
              GOVT EXAM PREPARATION HUB
            </span>
            <span className="text-[rgba(255,255,255,0.15)]">|</span>
            <span className="text-[#F8FAFC] font-bold">SSC • DELHI POLICE • CET</span>
          </div>
        </div>

        {/* Main Nav Header */}
        <div className="px-6 py-3.5 max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo and Brand */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveTab('home')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative w-11 h-11 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[14px] flex items-center justify-center shadow-md overflow-hidden shrink-0">
              <img 
                src="/assets/vibrant_logo_1782309451372.jpg" 
                alt="Vibrant Career Institute Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-sans font-bold text-lg tracking-tight text-[#F8FAFC] uppercase">
                  Vibrant
                </span>
                <span className="text-[9px] bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-[#F8FAFC] px-1.5 py-0.5 rounded-[12px] font-bold uppercase tracking-wider">
                  Test Book
                </span>
              </div>
              <p className="text-[9px] text-[#06B6D4] font-bold tracking-tight uppercase">
                Vibrant Career Institute, Sikar
              </p>
            </div>
          </motion.div>

          {/* Desktop Tab Controls */}
          <nav className="hidden md:flex items-center gap-1 shrink-0 relative">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-3.5 py-2 rounded-[14px] text-xs font-bold whitespace-nowrap cursor-pointer select-none transition-colors duration-200 flex items-center gap-1.5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-[14px] shadow-md -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <TabIcon className={`w-3.5 h-3.5 relative z-10 ${isSelected ? 'text-[#F8FAFC]' : 'text-[#3B82F6]'}`} />
                  <span className={`relative z-10 ${
                    isSelected ? 'text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}

            {/* Admin Tab */}
            {user && user.role === 'admin' && (
              <motion.button
                onClick={() => setActiveTab('admin')}
                className={`relative px-3.5 py-2 rounded-[14px] text-xs font-bold flex items-center gap-1.5 border border-[rgba(255,255,255,0.08)] cursor-pointer select-none transition-all duration-200 whitespace-nowrap shrink-0`}
                whileHover={{ scale: 1.02, borderColor: '#3B82F6' }}
                whileTap={{ scale: 0.98 }}
              >
                {activeTab === 'admin' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-[14px] shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <ShieldCheck className={`w-3.5 h-3.5 relative z-10 ${activeTab === 'admin' ? 'text-[#F8FAFC]' : 'text-[#06B6D4]'}`} />
                <span className={`relative z-10 ${
                  activeTab === 'admin' ? 'text-[#F8FAFC]' : 'text-[#06B6D4] hover:text-[#F8FAFC]'
                }`}>
                  Admin Panel
                </span>
              </motion.button>
            )}
          </nav>

          {/* Profile Controls */}
          <div className="flex items-center space-x-2.5">
            {/* User Signin / Status */}
            {user ? (
              <motion.div 
                className="flex items-center space-x-2.5 bg-[#111827] p-1 pr-2.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-7.5 h-7.5 rounded-[12px] bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-[#F8FAFC] flex items-center justify-center font-bold text-xs shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[11px] font-sans font-bold text-[#F8FAFC] truncate max-w-[100px]">
                    {user.name}
                  </p>
                  <span className="text-[8.5px] text-[#06B6D4] capitalize font-bold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    {user.isPremium ? 'Premium Plan' : user.role}
                  </span>
                </div>
                <motion.button
                  onClick={onLogout}
                  className="p-1 text-[#94A3B8] hover:text-[#3B82F6] rounded transition-colors cursor-pointer"
                  title="Log Out Session"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-[14px] bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-[#F8FAFC] text-[11px] font-sans font-bold shadow-md flex items-center gap-1.5 cursor-pointer border border-[rgba(255,255,255,0.08)]"
                whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <User className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span className="hidden sm:inline">Student Portal</span>
                <span className="sm:hidden">Login</span>
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Sticky Glassmorphic Bottom Navigation Dock for Mobile Devices */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden bg-[#111827]/90 backdrop-blur-lg border border-[rgba(255,255,255,0.08)] rounded-[20px] p-2 shadow-xl flex justify-around items-center">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative py-1.5 px-3 rounded-[14px] flex flex-col items-center justify-center gap-1 flex-1 cursor-pointer transition-colors"
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    layoutId="mobileTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-[14px] -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                  />
                )}
              </AnimatePresence>
              <TabIcon className={`w-4.5 h-4.5 transition-transform duration-200 ${
                isSelected ? 'text-[#F8FAFC] scale-110 font-bold' : 'text-[#3B82F6] hover:text-[#06B6D4]'
              }`} />
              <span className={`text-[8.5px] tracking-tight font-sans ${
                isSelected ? 'text-[#F8FAFC] font-bold' : 'text-[#94A3B8]'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
        {user && user.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className="relative py-1.5 px-3 rounded-[14px] flex flex-col items-center justify-center gap-1 flex-1 cursor-pointer"
          >
            <AnimatePresence>
              {activeTab === 'admin' && (
                <motion.div
                  layoutId="mobileTabIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-[14px] -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                />
              )}
            </AnimatePresence>
            <ShieldCheck className={`w-4.5 h-4.5 transition-transform duration-200 ${
              activeTab === 'admin' ? 'text-[#F8FAFC] scale-110 font-bold' : 'text-[#06B6D4]'
            }`} />
            <span className={`text-[8.5px] tracking-tight font-sans ${
              activeTab === 'admin' ? 'text-[#F8FAFC] font-bold' : 'text-[#94A3B8]'
            }`}>
              Admin
            </span>
          </button>
        )}
      </div>
    </>
  );
};
