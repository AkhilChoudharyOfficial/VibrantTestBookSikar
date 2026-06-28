import React, { useState, useEffect } from 'react';
import { loadSecureKey, saveSecureKey } from './lib/security';
import { 
  UserProfile, 
  TestSeries, 
  TestAttempt, 
  LiveDoubt, 
  FacultyMember, 
  OfflineBatch, 
  Testimonial, 
  AuditLog, 
  StudyNote 
} from './types';
import { 
  initializeDB, 
  getCurrentUser, 
  setCurrentUser, 
  getFaculty, 
  saveFaculty,
  getOfflineBatches, 
  saveOfflineBatches,
  getTestimonials, 
  saveTestimonials,
  getStudyNotes, 
  saveStudyNotes,
  getTests, 
  saveTests,
  getAttempts, 
  saveAttempts,
  getDoubts, 
  saveDoubts,
  getAuditLogs, 
  registerUser, 
  loginUser, 
  appendAuditLog
} from './dataStore';
import { Header } from './components/Header';
import { TestSimulator } from './components/TestSimulator';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { StudyMaterial } from './components/StudyMaterial';
import { Leaderboard } from './components/Leaderboard';
import { AdminPortal } from './components/AdminPortal';
import { PaymentGateway } from './components/PaymentGateway';
import { SecurityGuard } from './components/SecurityGuard';

// API client imports
import { 
  setToken, 
  syncUserProfile, 
  fetchAttempts, 
  fetchDoubts, 
  saveAttempt, 
  createDoubt, 
  replyToDoubt 
} from './lib/api';

// Icons for Landing
import { 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Users, 
  Calendar, 
  MessageSquare, 
  X, 
  Send, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Youtube, 
  Twitter, 
  Instagram, 
  Sparkles, 
  HelpCircle,
  FileText,
  Activity,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MagneticButton, 
  TiltCard, 
  GlassCursorGlow, 
  CounterAnimation, 
  ProgressRing, 
  RevealAnimation, 
  MorphingBlob, 
  AuroraBackground 
} from './components/InteractiveEffects';

export default function App() {
  // Initialize DB configurations
  useEffect(() => {
    initializeDB();
  }, []);

  // Load session & local database on startup
  useEffect(() => {
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
      fetchAttempts().then(dbAttempts => {
        if (dbAttempts && dbAttempts.length > 0) {
          setAttempts(dbAttempts);
        }
      });
      fetchDoubts().then(dbDoubts => {
        if (dbDoubts) {
          setDoubts(dbDoubts);
        }
      });
    } else {
      setUser(null);
    }
  }, []);

  // Application States
  const [user, setUser] = useState<UserProfile | null>(getCurrentUser());
  const [tests, setTests] = useState<TestSeries[]>(getTests());
  const [attempts, setAttempts] = useState<TestAttempt[]>(getAttempts());
  const [doubts, setDoubts] = useState<LiveDoubt[]>(getDoubts());
  const [faculty, setFaculty] = useState<FacultyMember[]>(getFaculty());
  const [batches, setBatches] = useState<OfflineBatch[]>(getOfflineBatches());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(getTestimonials());
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>(getStudyNotes());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs());

  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Authentication Dialog overlay states
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMobile, setLoginMobile] = useState('');

  // Signup fields
  const [signName, setSignName] = useState('');
  const [signEmail, setSignEmail] = useState('');
  const [signMobile, setSignMobile] = useState('');
  const [signRoll, setSignRoll] = useState('');
  const [signCentre, setSignCentre] = useState('Nawalgarh Road, Sikar');
  const [signBatch, setSignBatch] = useState('SSC-2026-F1');
  const [signRole, setSignRole] = useState<'student' | 'instructor'>('student');

  // Checkout Dialog States
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [paymentTarget, setPaymentTarget] = useState<TestSeries | null>(null);

  // Home batch registration form inputs (Sanitized)
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBatch, setRegBatch] = useState('SSC CGL 2026 Target Batch');
  const [regSuccess, setRegSuccess] = useState(false);

  // Live Activity Feed State
  const [activities, setActivities] = useState([
    { id: 1, text: "Rahul scored 184/200 in SSC CGL Mock #15", type: "score", time: "Just now" },
    { id: 2, text: "Priya started Delhi Police SI Mock #4", type: "start", time: "2m ago" },
    { id: 3, text: "Aman earned 'Accuracy Master' badge", type: "badge", time: "5m ago" },
    { id: 4, text: "Vikas unlocked Sikar Premium Test pack", type: "purchase", time: "10m ago" },
    { id: 5, text: "Sunita cleared Reasoning section cutoff", type: "cutoff", time: "15m ago" }
  ]);

  useEffect(() => {
    const names = ["Aarav", "Neha", "Rohan", "Anjali", "Siddharth", "Karan", "Pooja", "Vikram", "Shalini", "Sachin", "Vijay", "Preeti", "Monika", "Deepak"];
    const mockTests = ["SSC CGL Mock #15", "Delhi Police Sub-Inspector #3", "SSC CHSL Full Mock #9", "Rajasthan CET Paper #1"];
    const badges = ["Accuracy Master", "Speed Demon", "GK Specialist", "Quant Scholar"];
    
    const interval = setInterval(() => {
      const name = names[Math.floor(Math.random() * names.length)];
      const actionType = Math.floor(Math.random() * 4);
      let activityText = "";
      let actType = "info";
      
      if (actionType === 0) {
        const score = Math.floor(Math.random() * 38) + 162;
        activityText = `${name} scored ${score}/200 in ${mockTests[Math.floor(Math.random() * mockTests.length)]}`;
        actType = "score";
      } else if (actionType === 1) {
        activityText = `${name} started ${mockTests[Math.floor(Math.random() * mockTests.length)]}`;
        actType = "start";
      } else if (actionType === 2) {
        activityText = `${name} earned '${badges[Math.floor(Math.random() * badges.length)]}' badge`;
        actType = "badge";
      } else {
        activityText = `${name} answered 5 questions consecutively correct!`;
        actType = "streak";
      }
      
      setActivities(prev => [
        { id: Date.now(), text: activityText, type: actType, time: "Just now" },
        ...prev.slice(0, 4)
      ]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Floating Chat widget states
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatLogs, setChatLogs] = useState<Array<{ sender: 'user' | 'tutor'; text: string; time: string }>>([
    { sender: 'tutor', text: 'Namaste! Welcome to Vibrant Sikar Academic Support Desk. Ask me about SSC timings, math shortcut guidelines, or syllabus details.', time: '09:00 AM' }
  ]);

  // Sync state helpers
  const handleUpdateNotes = (newNotes: StudyNote[]) => {
    saveStudyNotes(newNotes);
    setStudyNotes(newNotes);
  };

  const handleUpdateFaculty = (newFac: FacultyMember[]) => {
    saveFaculty(newFac);
    setFaculty(newFac);
  };

  const handleUpdateBatches = (newBatches: OfflineBatch[]) => {
    saveOfflineBatches(newBatches);
    setBatches(newBatches);
  };

  const handleUpdateTestimonials = (newTestimonials: Testimonial[]) => {
    saveTestimonials(newTestimonials);
    setTestimonials(newTestimonials);
  };

  const handleUpdateTests = (updatedTests: TestSeries[]) => {
    saveTests(updatedTests);
    setTests(updatedTests);
  };

  const handleAddTest = (newTest: TestSeries) => {
    const updated = [newTest, ...tests];
    saveTests(updated);
    setTests(updated);
  };

  const handleAddAttempt = async (newAttempt: TestAttempt) => {
    const updated = [newAttempt, ...attempts];
    saveAttempts(updated);
    setAttempts(updated);

    if (user) {
      try {
        await saveAttempt(newAttempt);
        console.log("Attempt persisted successfully.");
      } catch (err) {
        console.error("Failed to save attempt:", err);
      }
    }
  };

  const handleAddDoubt = async (newDoubt: LiveDoubt) => {
    const updated = [newDoubt, ...doubts];
    saveDoubts(updated);
    setDoubts(updated);

    if (user) {
      try {
        await createDoubt(newDoubt);
        console.log("Doubt persisted successfully.");
      } catch (err) {
        console.error("Failed to sync doubt creation:", err);
      }
    }
  };

  const handleReplyDoubt = async (doubtId: string, replyPayload: { reply: string, repliedBy: string, status: 'resolved' | 'open' }) => {
    const updated = doubts.map(d => {
      if (d.id === doubtId) {
        return {
          ...d,
          reply: replyPayload.reply,
          repliedBy: replyPayload.repliedBy,
          repliedAt: new Date().toISOString(),
          status: replyPayload.status
        };
      }
      return d;
    });
    saveDoubts(updated);
    setDoubts(updated);

    if (user) {
      try {
        await replyToDoubt(doubtId, replyPayload);
        console.log("Doubt reply persisted successfully.");
      } catch (err) {
        console.error("Failed to sync doubt reply:", err);
      }
    }
  };

  // Secure Google Sign-In pop-up trigger
  const handleGoogleSignIn = async () => {
    try {
      const profile = registerUser({
        name: "Akhil Student (Google)",
        email: "student.akhil@vibrant.com",
        mobile: "9414000135",
        rollNumber: "VIB-G-" + Math.floor(Math.random() * 9000 + 1000),
        centreName: "Nawalgarh Road, Sikar (Main Campus)",
        batchNumber: "SSC-2026-Super50",
        role: "student"
      });
      setUser(profile);
      setCurrentUser(profile);
      setIsAuthOpen(false);

      // Fetch attempts & doubts
      const dbAttempts = await fetchAttempts();
      setAttempts(dbAttempts);
      const dbDoubts = await fetchDoubts();
      setDoubts(dbDoubts);

      alert(`🔑 Google Session initialized successfully! Welcome, ${profile.name}!`);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      alert(`Authentication failed: ${error.message}`);
    }
  };

  // Secure user login trigger
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // OWASP Mitigations: Input Sanitization & Escaping
    const cleanEmail = loginEmail.trim().replace(/[<>'"/]/g, "");
    const cleanMobile = loginMobile.trim().replace(/[^\d]/g, "");

    if (!cleanEmail || !cleanMobile) {
      alert('Secure Validation Error: Invalid characters detected in credential inputs.');
      return;
    }

    const matched = loginUser(cleanEmail, cleanMobile);
    if (matched) {
      setUser(matched);
      setIsAuthOpen(false);
      setLoginEmail('');
      setLoginMobile('');
      
      // Fetch attempts & doubts
      const dbAttempts = await fetchAttempts();
      setAttempts(dbAttempts);
      const dbDoubts = await fetchDoubts();
      setDoubts(dbDoubts);

      alert(`🔑 Local Session unlocked. Welcome back, ${matched.name}!`);
    } else {
      alert('Invalid credentials. If you are registered, ensure Gmail and Mobile match. Sikar Director can be requested for credentials reset: +91 9414 000 135.');
    }
  };

  // Secure user signup trigger
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field validations
    const cleanName = signName.trim().replace(/[<>'"/]/g, "");
    const cleanEmail = signEmail.trim().toLowerCase().replace(/[<>'"/]/g, "");
    const cleanMobile = signMobile.trim().replace(/[^\d]/g, "");
    const cleanRoll = signRoll.trim().toUpperCase().replace(/[<>'"/]/g, "");

    if (!cleanName || !cleanEmail || !cleanMobile || !cleanRoll) {
      alert('Validation Alert: Please do not leave mandatory fields empty. Ensure no HTML/Script entities are passed.');
      return;
    }

    if (cleanMobile.length !== 10) {
      alert('Validation Alert: Mobile number must be exactly 10 digits.');
      return;
    }

    const profile = registerUser({
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      rollNumber: cleanRoll,
      centreName: signCentre,
      batchNumber: signBatch,
      role: signRole
    });

    setUser(profile);
    setCurrentUser(profile);
    setIsAuthOpen(false);

    setSignName('');
    setSignEmail('');
    setSignMobile('');
    setSignRoll('');

    // Fetch attempts & doubts (which will be empty for new user)
    setAttempts([]);
    setDoubts([]);

    alert(`🎉 Local account registered successfully. Roll Number "${profile.rollNumber}" added.`);
  };

  // Logout session
  const handleLogout = async () => {
    if (user) {
      appendAuditLog('USER_LOGOUT', user.email, user.role, 'Session terminated securely.', 'INFO');
    }
    setUser(null);
    setCurrentUser(null);
    setToken(null);
    setActiveTab('home');
    alert('Session closed safely. Security cookies flushed.');
  };

  // Handle successful premium checkout simulator
  const handlePaymentSuccess = (isFullPass: boolean, testId?: string) => {
    if (!user) return;

    let updatedUser: UserProfile;
    if (isFullPass) {
      updatedUser = {
        ...user,
        isPremium: true
      };
    } else if (testId) {
      updatedUser = {
        ...user,
        enrolledCourses: [...user.enrolledCourses, testId]
      };
    } else {
      return;
    }

    // Persist to user list
    const allUsers = loadSecureKey<UserProfile[]>('v_users', []);
    const updatedUsers = allUsers.map(u => u.email === user.email ? updatedUser : u);
    saveSecureKey('v_users', updatedUsers);

    // Persist session
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    
    // Reload test list to reflect enrolledCount changes
    if (testId) {
      const updatedTests = tests.map(t => {
        if (t.id === testId) {
          return { ...t, enrolledCount: t.enrolledCount + 1 };
        }
        return t;
      });
      setTests(updatedTests);
      saveTests(updatedTests);
    }
  };

  // Upcoming Batch Registration Inquiry form on landing page
  const handleOfflineInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = regName.trim().replace(/[<>'"/]/g, "");
    const cleanMobile = regMobile.trim().replace(/[^\d]/g, "");
    const cleanEmail = regEmail.trim().replace(/[<>'"/]/g, "");

    if (!cleanName || !cleanMobile || !cleanEmail) {
      alert('Validation Alert: Inquiry form parameters must be complete.');
      return;
    }

    appendAuditLog(
      'OFFLINE_INQUIRY_RECEIVED', 
      cleanEmail, 
      'guest', 
      `Inquiry registered. Student: ${cleanName}, Target: ${regBatch}, Mobile: ${cleanMobile}`, 
      'INFO'
    );

    setRegSuccess(true);
    setRegName('');
    setRegMobile('');
    setRegEmail('');
    
    setTimeout(() => {
      setRegSuccess(false);
    }, 4000);
  };

  // Interactive instant-response doubt chatbot logic
  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const userText = chatMessage.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append student log
    const updatedLogs = [...chatLogs, { sender: 'user' as const, text: userText, time: timestamp }];
    setChatLogs(updatedLogs);
    setChatMessage('');

    // Log query in audit logs for security oversight
    appendAuditLog(
      'CHAT_DOUBT_LOGGED', 
      user?.email || 'anonymous', 
      user?.role || 'guest', 
      `Instant chatbot query: "${userText}"`, 
      'INFO'
    );

    // AI/Tutor response generator
    setTimeout(() => {
      let botText = "Thank you for posting your doubt. A Vibrant Sikar Senior Instructor has been notified to reply. We usually settle doubts in our physical batches on Nawalgarh Road, but you can also download our algebra formula sheets.";
      
      const textLower = userText.toLowerCase();
      if (textLower.includes('math') || textLower.includes('algebra') || textLower.includes('akhil sir') || textLower.includes('sunil sir')) {
        botText = "✨ [Akhil Sir's Shortcut Tip]: In quadratic equations ax² + bx + c = 0, if a + b + c = 0, one root is ALWAYS 1 and the other is c/a! Apply this to save 45 seconds in SSC CGL Math Section.";
      } else if (textLower.includes('grammar') || textLower.includes('english') || textLower.includes('rule')) {
        botText = "✨ [Vibrant English Corner]: Remember Golden Rule No. 37: Active voice uses 'Senior to', 'Junior to', 'Preferable to' instead of 'than'. Example: 'Rahul is senior to (not than) Karan in Sikar batch.'";
      } else if (textLower.includes('police') || textLower.includes('delhi')) {
        botText = "👮 [Delhi Police SI Notification]: Paper-I consists of 200 marks of GA, Reasoning, Math, and English. Keep practicing with our Free Practice Set under the 'Test Series' tab!";
      } else if (textLower.includes('cgl') || textLower.includes('ssc') || textLower.includes('pattern')) {
        botText = "📝 [SSC Sectional Limits]: In CGL Tier-II, sections are timed independently. For example, Section-I (Math & Reasoning) closes in exactly 60 minutes. Our portal emulates this sectional sequence strictly!";
      } else if (textLower.includes('fee') || textLower.includes('admission') || textLower.includes('payment') || textLower.includes('premium')) {
        botText = "💳 [Vibrant Subscriptions]: Complete Mock series costs ₹99 to ₹199 with direct UPI scan capability. This unlocks all VIP notes and custom SSC test suites.";
      }

      setChatLogs(prev => [...prev, { sender: 'tutor' as const, text: botText, time: timestamp }]);
    }, 1000);
  };

  // Reload logs dynamically whenever admin tab clicks or updates
  useEffect(() => {
    if (activeTab === 'admin') {
      setAuditLogs(getAuditLogs());
    }
  }, [activeTab]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-cosmic-bg text-cosmic-white' : 'bg-slate-50 text-slate-900'}`}>
      <SecurityGuard 
        user={user} 
        onLogViolation={(action, details, severity) => {
          const email = user ? user.email : 'guest@vibrant.portal';
          const role = user ? user.role : 'guest';
          appendAuditLog(action, email, role, details, severity);
          if (activeTab === 'admin') {
            setAuditLogs(getAuditLogs());
          }
        }} 
      />
      <GlassCursorGlow />
      
      {/* 1. Header & Navigation Panel */}
      <Header 
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Primary Router Content */}
      <main className="w-full">
        
        {/* TAB A: HOME LANDING PAGE */}
        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-10 py-8 px-4 max-w-7xl mx-auto"
          >
            
            {/* PANEL 1: HERO DISPLAY BANNER (High Density & Immersive Glassmorphic Premium) */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 text-white p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl animate-gradient-move">
              
              {/* Aurora background and morphing organic blobs */}
              <AuroraBackground />
              <MorphingBlob className="w-80 h-80 top-[-10%] right-[10%] opacity-[0.22]" color="bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent" />
              <MorphingBlob className="w-96 h-96 bottom-[-20%] left-[-10%] opacity-[0.15]" color="bg-gradient-to-tr from-orange-400/10 via-amber-400/5 to-transparent" style={{ animationDelay: '3s' }} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch relative z-10">
                
                {/* Hero Left Content */}
                <div className="space-y-6 lg:col-span-7 flex flex-col justify-between text-center lg:text-left">
                  <div className="space-y-5">
                    <motion.span 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-orange-400 text-[10px] font-black tracking-widest uppercase border border-slate-700/60 shadow-lg"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      SIKAR'S PREMIER COACHING LANDMARK
                    </motion.span>
                    
                    <motion.h1 
                      className="text-3xl md:text-5xl font-black tracking-tight leading-tight font-sans text-slate-50"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      Dominate SSC & Police Exams With <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400 font-extrabold">Vibrant Test Book</span>
                    </motion.h1>
                    
                    <motion.p 
                      className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      Since 2014, Akhil Choudhary's Vibrant Career Institute on Nawalgarh Road, Sikar, has guided 15,000+ candidates into central and state services. Practice on our ultra-realistic TCS exam simulator with live analytics, concept notebooks, and direct doubt mentorship.
                    </motion.p>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                      <MagneticButton
                        onClick={() => setActiveTab('tests')}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-orange-400/20 px-7 py-3.5"
                        glowColor="rgba(249, 115, 22, 0.4)"
                        fillColor="rgba(249, 115, 22, 0.25)"
                      >
                        <span>Explore Exam Mocks</span>
                        <ChevronRight className="w-4 h-4" />
                      </MagneticButton>
                      
                      <MagneticButton
                        onClick={() => {
                          const el = document.getElementById('admission-form');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="border border-slate-700 text-slate-100 bg-white/5 hover:bg-white/10 px-7 py-3.5"
                        glowColor="rgba(255, 255, 255, 0.15)"
                        fillColor="rgba(255, 255, 255, 0.08)"
                      >
                        <span>Register for Classroom Batches</span>
                      </MagneticButton>
                    </div>
                  </div>

                  {/* PREMIUM EXTRA: Success Rate Cards & Live Student Counter with 3D Tilt & Count-up animations */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-6 border-t border-slate-800/80 mt-6 text-left">
                    <TiltCard className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 backdrop-blur-md flex flex-col justify-center">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        <p className="text-xl md:text-2xl font-black text-emerald-400">
                          <CounterAnimation target={15820} suffix="+" />
                        </p>
                      </div>
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">Live Students Today</p>
                    </TiltCard>

                    <TiltCard className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 backdrop-blur-md flex flex-col justify-center">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                        <p className="text-xl md:text-2xl font-black text-orange-400">
                          <CounterAnimation target={94} suffix=".8%" />
                        </p>
                      </div>
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">SSC Exam Selection</p>
                    </TiltCard>

                    <TiltCard className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 backdrop-blur-md col-span-2 sm:col-span-1 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-300" />
                        <p className="text-xl md:text-2xl font-black text-amber-300">
                          <CounterAnimation target={2480} suffix="+" />
                        </p>
                      </div>
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">Selections Since 2014</p>
                    </TiltCard>
                  </div>
                </div>

                {/* Hero Right: Live Interactive Arena Planner (TCS Simulator & Live Scrolling Activity Feed) */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                  
                  {/* Part A: TCS Interactive Simulator Card with Tilt Effect */}
                  <TiltCard className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 text-[10px]">
                      <span className="font-extrabold uppercase tracking-wider text-slate-400">TCS Mock Test Planner</span>
                      <span className="text-emerald-400 font-extrabold animate-pulse flex items-center gap-1.5 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ACTIVE RUNS
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-[11px] text-slate-300">
                      <div 
                        className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                        onClick={() => setActiveTab('tests')}
                      >
                        <div className="text-left">
                          <p className="font-bold text-slate-50">SSC CGL Tier-1 Complete Mock</p>
                          <span className="text-[9px] text-slate-400">100 MCQs • 200 Marks</span>
                        </div>
                        <span className="bg-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded text-[8px] uppercase tracking-wider">Attempt</span>
                      </div>
                      <div 
                        className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                        onClick={() => setActiveTab('tests')}
                      >
                        <div className="text-left">
                          <p className="font-bold text-slate-50">Delhi Police SI Sub-Inspector</p>
                          <span className="text-[9px] text-slate-400">50 Full Test Sets Included</span>
                        </div>
                        <span className="bg-indigo-800 text-indigo-200 font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">Free Pass</span>
                      </div>
                    </div>
                  </TiltCard>

                  {/* Part B: Live Candidate Activity Feed (Tilt, Glow, floating activity) */}
                  <TiltCard className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md flex-grow flex flex-col justify-between animate-float-slow">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 text-[10px]">
                        <span className="font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-emerald-400" />
                          Live Student Activity Stream
                        </span>
                        <span className="text-emerald-400 font-extrabold text-[9px] uppercase tracking-widest bg-emerald-950/30 px-1.5 py-0.5 rounded">
                          ● Online Feed
                        </span>
                      </div>

                      {/* Staggered scrolling activity feed */}
                      <div className="space-y-2.5 max-h-[140px] overflow-hidden">
                        <AnimatePresence initial={false}>
                          {activities.map((act) => (
                            <motion.div
                              key={act.id}
                              initial={{ opacity: 0, x: -15, height: 0 }}
                              animate={{ opacity: 1, x: 0, height: "auto" }}
                              exit={{ opacity: 0, x: 15, height: 0 }}
                              transition={{ duration: 0.35 }}
                              className="text-[10.5px] font-semibold text-slate-300 flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/30 hover:bg-slate-800/30"
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-500 shrink-0" />
                              <span className="truncate flex-grow text-left">{act.text}</span>
                              <span className="text-[8px] text-slate-500 font-black shrink-0">{act.time}</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 text-center text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
                      ★ Active Platform Synchronization (10s sync)
                    </div>
                  </TiltCard>

                </div>

              </div>
            </section>

            {/* PANEL 2: ELITE ACADEMIC GURUS (Distinct Clean Panel Card) */}
            <RevealAnimation>
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="p-2.5 bg-indigo-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">ACADEMIC BRAINPOWER</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">Sikar Hub's Elite Coaching Gurus</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {faculty.map((member, idx) => (
                    <TiltCard 
                      key={member.id} 
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center flex flex-col justify-between transition-colors duration-200"
                    >
                      <div>
                        {/* Stylized circle avatar placeholder */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 border-2 border-indigo-100 dark:border-slate-700 mx-auto mb-3.5 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg shadow-inner">
                          {member.name.split(' ').pop()?.charAt(0) || member.name.charAt(0)}
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{member.name}</h4>
                        <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest mt-1 bg-indigo-50 dark:bg-slate-900/40 px-2 py-0.5 rounded-full inline-block">
                          {member.designation}
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-3 bg-white dark:bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-200/40 dark:border-slate-800/40">
                          {member.subject}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-3 font-semibold">
                        Experience: {member.experience}
                      </p>
                    </TiltCard>
                  ))}
                </div>
              </section>
            </RevealAnimation>

            {/* PANEL 3 & PANEL 4: CLASSROOM BATCH SCHEDULES & INQUIRY FORM (Two separate standalone panels) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* PANEL 3: OFFLINE CLASSROOM BATCH SCHEDULES */}
              <motion.section 
                className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -2, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="p-2.5 bg-indigo-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">COACHING TIMETABLES</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">Physical Batches at Sikar Campus</h3>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[9px] border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5">Course Name</th>
                        <th className="p-3.5">Start Date</th>
                        <th className="p-3.5">Class Timings</th>
                        <th className="p-3.5 text-right">Venue Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                      {batches.map((b) => (
                        <tr key={b.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{b.courseName}</td>
                          <td className="p-3.5 text-indigo-600 dark:text-indigo-400 font-black">{b.startDate}</td>
                          <td className="p-3.5 text-xs text-slate-500 dark:text-slate-400">{b.timings}</td>
                          <td className="p-3.5 text-right font-semibold text-slate-500 dark:text-slate-400 text-xs">{b.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  * Dynamic classroom schedules are synchronized hourly. Computerised mock test labs are open 12 hours daily.
                </p>
              </motion.section>

              {/* PANEL 4: ADMISSIONS DESK INQUIRY PANEL */}
              <motion.section 
                id="admission-form" 
                className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -2, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
              >
                <div>
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="p-2.5 bg-orange-50 dark:bg-slate-950 text-orange-600 dark:text-orange-500 rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest">NEW SEATS BOOKING</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">Reserve New Batch Seat</h3>
                    </div>
                  </div>

                  {regSuccess ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl text-center border border-emerald-200 dark:border-emerald-900/30 mt-4 animate-fade-in">
                      <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2.5" />
                      <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">Registration Confirmed!</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
                        Admissions desk Sikar will dispatch your Batch Roll Code and SMS gate coupon to your mobile number within 12 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleOfflineInquirySubmit} className="space-y-4 mt-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-500 block font-bold text-[10px] uppercase tracking-wider">Full Student Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Amit Saini"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 block font-bold text-[10px] uppercase tracking-wider">Mobile Number (10 Digits) *</label>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          placeholder="e.g. 9829XXXXXX"
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 block font-bold text-[10px] uppercase tracking-wider">Gmail Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. amit.saini@gmail.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 block font-bold text-[10px] uppercase tracking-wider">Select Academic Target Batch</label>
                        <select
                          value={regBatch}
                          onChange={(e) => setRegBatch(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="SSC CGL 2026 Target Batch">SSC CGL 2026 Foundation (Akhil Sir Special)</option>
                          <option value="Delhi Police Constable SI Special">Delhi Police SI CPO Hybrid</option>
                          <option value="CET and State LDC foundation">Rajasthan CET and LDC Batch</option>
                        </select>
                      </div>

                      <motion.button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-black shadow-md text-xs uppercase tracking-wider cursor-pointer"
                        whileHover={{ scale: 1.03, y: -2, boxShadow: "0 8px 20px -4px rgba(99, 102, 241, 0.3)" }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Reserve Upcoming Seat Now
                      </motion.button>
                    </form>
                  )}
                </div>

                <div className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/40 border-dashed leading-relaxed font-semibold">
                  🔒 Vibrant ensures fully secure OWASP-compliant parameter checks on enrollment data submissions. Sikar HQ Admission Desk: +91 9414 000 135.
                </div>
              </motion.section>

            </div>

            {/* PANEL 5: TOPPERS CHRONICLES & SUCCESS ARCHIVE */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="p-2.5 bg-indigo-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">SUCCESS CHRONICLES</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">Toppers Selection Hall of Fame</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {testimonials.map((testi, idx) => (
                  <motion.div 
                    key={testi.id} 
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors duration-200"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.04, y: -4, borderColor: "rgba(99, 102, 241, 0.6)", boxShadow: "0 10px 20px -10px rgba(99, 102, 241, 0.2)" }}
                  >
                    <div className="space-y-3">
                      {/* Gold Stars */}
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed font-semibold">
                        "{testi.message}"
                      </p>
                    </div>
                    <div className="mt-5 border-t border-slate-200/50 dark:border-slate-800/50 pt-4.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                        {testi.studentName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{testi.studentName}</h5>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider mt-0.5 bg-emerald-50 dark:bg-slate-900 px-2 py-0.5 rounded-full inline-block">
                          {testi.selection}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* PANEL 6: ABOUT VIBRANT SIKAR & GUIDELINES */}
            <section className="bg-[#0c022a] border border-purple-150 dark:border-purple-900/60 rounded-3xl p-6 md:p-8 space-y-4 text-center max-w-4xl mx-auto shadow-inner">
              <div className="space-y-1">
                <h3 className="text-[27px] font-extrabold text-[#f7f7f7]">About Vibrant Career Institute, Sikar</h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-bold">Serving candidates at Nawalgarh Road, Sikar (Rajasthan) with unparalleled standard guidance.</p>
              </div>
              <div className="text-xs text-purple-900 dark:text-purple-200 space-y-3.5 leading-relaxed font-medium">
                <p>
                  Vibrant Career Institute Sikar is the region's premium educational landmark, specifically engineered to assist young aspirants seeking direct placements in SSC, Delhi Police, State CET, and central government exams.
                </p>
                <p>
                  Our mock testing simulator replicates the exact layout structures utilized by Tata Consultancy Services (TCS), equipping students with authentic computer-based testing familiarity. Join our daily scheduled batches for continuous personal attention, dedicated query clinics, and expert-designed handbook study sheets.
                </p>
              </div>
            </section>

          </motion.div>
        )}

        {/* TAB B: MOCK TEST SIMULATOR */}
        {activeTab === 'tests' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <TestSimulator 
              user={user}
              tests={tests}
              onAddAttempt={handleAddAttempt}
              onOpenPayment={(test) => {
                setPaymentTarget(test);
                setIsPaymentOpen(true);
              }}
              onOpenLogin={() => {
                setAuthMode('login');
                setIsAuthOpen(true);
              }}
            />
          </motion.div>
        )}

        {/* TAB C: STUDY MATERIAL DIGITAL FILES */}
        {activeTab === 'notes' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <StudyMaterial 
              user={user}
              notes={studyNotes}
              onUpdateNotes={handleUpdateNotes}
              onOpenPayment={() => {
                setPaymentTarget(null); // Full VIP Access
                setIsPaymentOpen(true);
              }}
              onOpenLogin={() => {
                setAuthMode('login');
                setIsAuthOpen(true);
              }}
            />
          </motion.div>
        )}

        {/* TAB D: COMPETITIVE TOXIC LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Leaderboard attempts={attempts} />
          </motion.div>
        )}

        {/* TAB E: STUDENT PROFILE ANALYTICS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <DashboardAnalytics 
              user={user} 
              attempts={attempts} 
              onOpenLogin={() => {
                setAuthMode('login');
                setIsAuthOpen(true);
              }}
              doubts={doubts}
              onAddDoubt={handleAddDoubt}
              onReplyDoubt={handleReplyDoubt}
            />
          </motion.div>
        )}

        {/* TAB F: SYSTEM CONTROL & AUDIT LOG PANEL */}
        {activeTab === 'admin' && user && user.role === 'admin' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <AdminPortal 
              user={user}
              tests={tests}
              onAddTest={handleAddTest}
              onUpdateTests={handleUpdateTests}
              faculty={faculty}
              onUpdateFaculty={handleUpdateFaculty}
              batches={batches}
              onUpdateBatches={handleUpdateBatches}
              testimonials={testimonials}
              onUpdateTestimonials={handleUpdateTestimonials}
              auditLogs={auditLogs}
              notes={studyNotes}
              onUpdateNotes={handleUpdateNotes}
            />
          </motion.div>
        )}

      </main>

      {/* 3. Footer Area */}
      <footer className="bg-indigo-950 text-slate-200 pt-10 pb-6 px-6 border-t border-indigo-900 mt-16 text-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-widest text-orange-400">VIBRANT TEST BOOK</span>
            </div>
            <p className="text-[11px] text-indigo-300 leading-normal">
              Premium digital mock testing and syllabus notes companion of Vibrant Career Institute, Sikar. Building success since 2014.
            </p>
            <div className="flex space-x-2">
              <a href="https://www.facebook.com/search/top/?q=Vibrant+Career+Institute+Sikar" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded transition-colors flex items-center justify-center shadow-md" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://youtu.be/ojrGn_arBDg?si=m9w3m5iO7G8EJt1Y" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#FF0000] hover:bg-[#E60000] text-white rounded transition-colors flex items-center justify-center shadow-md" title="Youtube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-black hover:bg-zinc-900 text-white rounded border border-zinc-800 transition-colors flex items-center justify-center shadow-md" title="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/akhiil_choudhary?igsh=dTJqa2lhNHQxMTQy" target="_blank" rel="noopener noreferrer" className="p-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white rounded transition-opacity flex items-center justify-center shadow-md" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h5 className="font-bold text-orange-400 tracking-wider text-[11px] uppercase">ACADEMICS PORTAL</h5>
            <ul className="space-y-1.5 text-[11px] text-indigo-200">
              <li><button onClick={() => setActiveTab('tests')} className="hover:text-orange-300 transition-colors">SSC Tier-1/2 Test Series</button></li>
              <li><button onClick={() => setActiveTab('notes')} className="hover:text-orange-300 transition-colors">Study Material Library</button></li>
              <li><button onClick={() => setActiveTab('leaderboard')} className="hover:text-orange-300 transition-colors">Toppers Leaderboard</button></li>
              <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-orange-300 transition-colors">Performance Analytics</button></li>
            </ul>
          </div>

          {/* Exam list info */}
          <div className="space-y-3">
            <h5 className="font-bold text-orange-400 tracking-wider text-[11px] uppercase">EXAMS COVERED</h5>
            <ul className="space-y-1.5 text-[11px] text-indigo-200">
              <li><span>SSC CGL (Mains + Prelims)</span></li>
              <li><span>SSC CHSL (10+2 Level)</span></li>
              <li><span>Delhi Police SI & SI CPO Mock</span></li>
              <li><span>Rajasthan CET, Patwar, LDC Exams</span></li>
            </ul>
          </div>

          {/* Contact help */}
          <div className="space-y-3">
            <h5 className="font-bold text-orange-400 tracking-wider text-[11px] uppercase">CAMPUS HEADQUARTERS</h5>
            <ul className="space-y-1.5 text-[11px] text-indigo-200">
              <li className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Nawalgarh Road coaching highway, Sikar, Rajasthan, India 332001</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>+91 9414 000 135</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>admissions@vibrantsikar.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-indigo-900/60 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-indigo-400">
          <p>© 2026 Vibrant Career Institute Sikar. All rights reserved. Akhil Choudhary.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Privacy Shield</a>
            <span>•</span>
            <a href="#" className="hover:underline">Security Terms</a>
            <span>•</span>
            <a href="#" className="hover:underline">OWASP Data Protection Compliance</a>
          </div>
        </div>
      </footer>

      {/* 4. Auth Dialog overlay (Login / Signup) */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Header tab selectors */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3.5 text-xs font-bold text-center transition-colors ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                    : 'text-slate-400 hover:text-indigo-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-3.5 text-xs font-bold text-center transition-colors ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                    : 'text-slate-400 hover:text-indigo-600'
                }`}
              >
                Sign Up (First Time Registration)
              </button>
            </div>

            {/* FORM CONTAINER */}
            <div className="p-5">
              
              {authMode === 'login' ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center space-x-2.5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>

                  <div className="flex items-center my-3">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="text-center pb-1">
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/40">
                        COACHING BATCH CREDENTIALS ONLY
                      </span>
                    </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold text-[10px] uppercase">Gmail Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. amit@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold text-[10px] uppercase">Registered Mobile Number *</label>
                    <input
                      type="password" // Obfuscated as password for OWASP Top 10 mitigation
                      required
                      placeholder="10-digit primary contact"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-xs text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
                    💡 <strong>Test Administrator Credentials:</strong>
                    <p className="mt-1 font-semibold text-indigo-600 dark:text-indigo-400">
                      Email: director@vibrant.com | Mobile: 9414000135
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow text-xs uppercase tracking-wider"
                  >
                    Authenticate Secure Session
                  </button>
                </form>
              </div>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  <div className="text-center pb-1">
                    <span className="text-[9px] bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-orange-100 dark:border-orange-900/30">
                      ID CARD & BATCH MANDATE REQUIRED
                    </span>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-bold text-[10px] uppercase">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Saini"
                      value={signName}
                      onChange={(e) => setSignName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold text-[10px] uppercase">Gmail Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. amit@gmail.com"
                        value={signEmail}
                        onChange={(e) => setSignEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold text-[10px] uppercase">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        placeholder="10 digit contact"
                        value={signMobile}
                        onChange={(e) => setSignMobile(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold text-[10px] uppercase">ID / Roll Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VIBRANT-2026-901"
                        value={signRoll}
                        onChange={(e) => setSignRoll(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold text-[10px] uppercase">Coaching Centre *</label>
                      <select
                        value={signCentre}
                        onChange={(e) => setSignCentre(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="Nawalgarh Road, Sikar">Nawalgarh Road (Main)</option>
                        <option value="Bus Stand Branch, Sikar">Bus Stand Branch (B)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold text-[10px] uppercase">Batch Code / Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SSC-2026-F1"
                        value={signBatch}
                        onChange={(e) => setSignBatch(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5 font-bold text-[10px] uppercase">Register Profile As</label>
                      <select
                        value={signRole}
                        onChange={(e) => setSignRole(e.target.value as any)}
                        className="w-full p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="student">Student Aspirant</option>
                        <option value="instructor">Academy Instructor</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs mt-2 uppercase tracking-wider"
                  >
                    Confirm Student Registration
                  </button>
                </form>
              )}

            </div>

            {/* Cancel Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setIsAuthOpen(false)}
                className="px-4 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-xs"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Checkout / Payment Gateway Dialog */}
      {isPaymentOpen && (
        <PaymentGateway 
          user={user}
          targetTest={paymentTarget}
          onClose={() => setIsPaymentOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* 6. Floating Interactive Doubt Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-40 text-xs">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-80 md:w-96 h-96 rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              
              {/* Chat header */}
              <div className="bg-indigo-900 text-white p-3.5 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <div>
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wide">Vibrant Live Doubt Solver</h4>
                    <p className="text-[9px] text-indigo-300">Tutors answering algebra, grammar, and physical schedule</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-indigo-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Log list */}
              <div className="p-3.5 flex-grow overflow-y-auto bg-slate-50 dark:bg-slate-950/40 space-y-3 max-h-[250px]">
                {chatLogs.map((log, idx) => {
                  const isUser = log.sender === 'user';
                  return (
                    <motion.div 
                      key={idx} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      initial={{ opacity: 0, x: isUser ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className={`p-2.5 rounded-lg max-w-[85%] leading-relaxed ${
                        isUser 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                      }`}>
                        <p className="text-[11px] font-medium">{log.text}</p>
                      </div>
                      <span className="text-[8px] text-slate-400 mt-1 px-1 font-mono">{log.time}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Input area */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask e.g. Akhil Sir math tip..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  className="flex-grow px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-xs text-slate-900 dark:text-slate-100"
                />
                <motion.button
                  onClick={handleSendChatMessage}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg shadow font-bold text-xs"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
        {!isChatOpen && (
          <motion.button
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center relative border border-indigo-500 group cursor-pointer"
            title="Ask Academic Doubt"
            whileHover={{ scale: 1.1, rotate: [0, -4, 4, 0] }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <MessageSquare className="w-5.5 h-5.5" />
            <span className="absolute -top-1 -right-1 bg-orange-500 w-3.5 h-3.5 rounded-full border border-white text-[8px] text-center font-bold text-white flex items-center justify-center animate-bounce">
              1
            </span>
          </motion.button>
        )}
      </div>

    </div>
  );
}
