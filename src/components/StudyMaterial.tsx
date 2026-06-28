import React, { useState, useEffect, useRef } from 'react';
import { StudyNote, UserProfile } from '../types';
import { BookOpen, Lock, Search, Eye, Sparkles, CheckCircle, FileText, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { appendAuditLog, getSecureNotesUrl } from '../dataStore';

interface StudyMaterialProps {
  user: UserProfile | null;
  notes: StudyNote[];
  onUpdateNotes: (notes: StudyNote[]) => void;
  onOpenPayment: () => void;
  onOpenLogin: () => void;
}

// Detailed Mock Content for Notes to render realistic reading sheets
const SECURE_NOTE_CONTENTS: Record<string, string[]> = {
  n1: [
    "VIBRANT CAREER INSTITUTE, SIKAR — ALGEBRA TRICKS & SHORTCUT SHEETS",
    "Formula 1: If x + 1/x = k, then x² + 1/x² = k² - 2. Example: If x + 1/x = 3, then x² + 1/x² = 3² - 2 = 7.",
    "Formula 2: If x + 1/x = k, then x³ + 1/x³ = k³ - 3k. Example: If x + 1/x = 4, then x³ + 1/x³ = 64 - 12 = 52.",
    "Formula 3: If x - 1/x = k, then x² + 1/x² = k² + 2 and x³ - 1/x³ = k³ + 3k.",
    "Formula 4: Minimum value of a sin²θ + b cos²θ is min(a, b) and maximum is max(a, b). For quadratic polynomial ax² + bx + c: if a > 0, min value is at x = -b/2a, which is (4ac - b²)/4a.",
    "Practice PYQ-1: If x + 1/x = 5, find x⁴ + 1/x⁴. Solution: x² + 1/x² = 25 - 2 = 23. x⁴ + 1/x⁴ = 23² - 2 = 529 - 2 = 527. (SSC CGL Tier-1 repeat)",
    "HOD Tip: Keep these formulas memorized on your fingertips to save crucial 30 seconds during Tier-2 exam!"
  ],
  n2: [
    "VIBRANT CAREER INSTITUTE, SIKAR — 100 GOLDEN ENGLISH GRAMMAR RULES",
    "Rule 1: Proximity Rule. When subjects are joined by 'either... or', 'neither... nor', 'not only... but also', the verb agrees with the nearest subject. Example: Neither Akhil nor his friends are attending (not 'is').",
    "Rule 2: 'One of + Plural Noun + Singular Verb'. Example: One of the students is absent. But if 'who/which/that' relative pronoun is used, use plural verb: One of the students who are selected.",
    "Rule 3: Words like 'Scarcely', 'Hardly', 'Barely' are followed by 'when', NOT 'than'. Example: Hardly had I entered the room when (not than) it started raining.",
    "Rule 4: Words like 'Lest' are followed by 'should' or subjunctive verb. Never use negative 'not' with lest. Example: Run fast lest you should miss the train.",
    "Rule 5: 'Many a + Singular Noun + Singular Verb'. Example: Many a student has failed the initial mock (not 'have').",
    "Copyright Warning: Unauthorized duplication or circulation is strictly banned. Tracked by Dynamic Watermark."
  ],
  n3: [
    "VIBRANT CAREER INSTITUTE, SIKAR — CODING-DECODING REASONING CAPSULE",
    "Trick 1: Alphabet placements. Memorize EJOTY positions (E=5, J=10, O=15, T=20, Y=25). Memorize CFILORUX for multiples of 3.",
    "Trick 2: Reverse Alphabets (Sum = 27). A is opposite of Z (AZad), B opposite of Y (BOY), C opposite of X (CRUX), D opposite of W (DEW).",
    "Trick 3: Letter shifts can be +1, +2, -1, or alternating (+1, -1, +2, -2). Always write the word and its code vertically to inspect relationships instantly.",
    "Trick 4: Coding in grid matrices. Pay attention to row-column hierarchy specified in the instructions (e.g., Row 4, Col 2 or vice versa).",
    "Practice Question: If CLOCK is coded as XOLXP, how is WATCH coded? Solution: Reverse pair of W is D, A is Z, T is G, C is X, H is S. Hence code is DZGXS.",
    "Sikar Campus Clinic: Visit Mr. Pankaj Godara for personal counseling on advanced non-verbal patterns."
  ],
  n4: [
    "VIBRANT CAREER INSTITUTE, SIKAR — ANCIENT & MEDIEVAL HISTORY TIMELINE",
    "Indus Valley Civilization (2500 BC - 1750 BC): Major sites include Harappa (Ravi river), Mohenjodaro (Indus), Lothal (Dockyard in Gujarat), and Kalibangan (Ploughed fields in Rajasthan).",
    "Vedic Period (1500 BC - 600 BC): Rigveda is oldest. Satyameva Jayate is taken from Mundaka Upanishad. Gayatri Mantra dedicated to Savitr.",
    "Buddhism & Jainism: 1st Buddhist Council at Rajgriha (Ajatashatru), 2nd at Vaishali (Kalashoka), 3rd at Pataliputra (Ashoka), 4th at Kashmir (Kanishka).",
    "Delhi Sultanate (1206 - 1526 AD): Chronology: Slave Dynasty, Khalji, Tughlaq, Sayyid, Lodi. Qutub Minar started by Qutubuddin Aibak, completed by Iltutmish.",
    "Mughal Empire: Babur founded in 1526 (Battle of Panipat-I). Akbar introduced Mansabdari & Din-i-Ilahi. Shah Jahan built Red Fort, Taj Mahal.",
    "Static GK High-Yield Fact: Sikar historical coins and Rajputana lineage. Learn key administrative terms like Diwan-i-Arz (Military) and Diwan-i-Insha (Correspondence)."
  ]
};

export const StudyMaterial: React.FC<StudyMaterialProps> = ({
  user,
  notes,
  onUpdateNotes,
  onOpenPayment,
  onOpenLogin
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubject, setActiveSubject] = useState<'All' | 'Mathematics' | 'Reasoning' | 'English' | 'General Knowledge'>('All');
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  
  // Protected Reader state
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [readerNote, setReaderNote] = useState<StudyNote | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [watermarkTime, setWatermarkTime] = useState<string>('');
  const [securityViolations, setSecurityViolations] = useState<number>(0);
  const [secureUrl, setSecureUrl] = useState<string>('');
  
  // Reference for reader container
  const readerRef = useRef<HTMLDivElement>(null);

  // Update watermark timestamp live every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setWatermarkTime(now.toLocaleString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Developer Tools Keyboard Combinations & Print Interception
  useEffect(() => {
    if (!isReaderOpen || !user) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerSecurityBlock('F12 Key Pressed');
      }
      // Prevent Ctrl+Shift+I / Ctrl+Shift+J (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        triggerSecurityBlock('DevTools Shortcut Triggered');
      }
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        triggerSecurityBlock('View Source Prevented');
      }
      // Prevent Ctrl+P (Print)
      if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        triggerSecurityBlock('Print Command Prevented');
      }
      // Prevent Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        triggerSecurityBlock('Save Command Blocked');
      }
      // Prevent Ctrl+C / Cmd+C
      if (e.ctrlKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        triggerSecurityBlock('Copy Shortcut Blocked');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityBlock('Right Click Blocked');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerSecurityBlock('Copy Event Blocked');
    };

    // Attach listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy as any);

    // Dynamic style injection for printing blockade
    const styleEl = document.createElement('style');
    styleEl.id = 'print-block-style';
    styleEl.innerHTML = `
      @media print {
        body { display: none !important; }
        #root { display: none !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy as any);
      
      const el = document.getElementById('print-block-style');
      if (el) el.remove();
    };
  }, [isReaderOpen, user]);

  const triggerSecurityBlock = (reason: string) => {
    setSecurityViolations(prev => {
      const updated = prev + 1;
      if (user) {
        appendAuditLog('SECURITY_VIOLATION_ATTEMPT', user.email, user.role, `Syllabus theft/print prevention: "${reason}" inside secure note reader. Total violations: ${updated}`, updated > 2 ? 'CRITICAL' : 'WARNING');
      }
      if (updated >= 5) {
        // Force close reader and reset session warnings on 5th try
        setIsReaderOpen(false);
        alert('🔒 CRITICAL SECURITY EVENT: Access to Study Materials revoked due to repetitive compliance violations. Sikar Security Team notified.');
      } else {
        alert(`🔒 SECUR-SHIELD COMPLIANCE WARNING: Sikar Study Library does not allow downloads, prints, right clicks, copies, or inspector tools.\nReason: ${reason}.`);
      }
      return updated;
    });
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.contentSummary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = activeSubject === 'All' || note.subject === activeSubject;
    return matchesSearch && matchesSubject;
  });

  const handleReadNote = (note: StudyNote) => {
    if (!user) {
      alert('🔒 Notes are highly protected. Please Login or Sign Up first to load materials.');
      onOpenLogin();
      return;
    }

    if (note.isPaid && !user.isPremium) {
      alert('⭐ This is a VIP Handbook. Please upgrade your active subscription plan to unlock secure PDF handbooks.');
      onOpenPayment();
      return;
    }

    // Set up secure URL token
    const tokenizedUrl = getSecureNotesUrl(note.id);
    setSecureUrl(tokenizedUrl);

    // Open reader
    setReaderNote(note);
    setCurrentPage(0);
    setIsReaderOpen(true);
    setSecurityViolations(0);

    appendAuditLog('NOTES_READ_INITIATED', user.email, user.role, `Student opened secure note reader for: "${note.title}". Validated checksum URL.`, 'INFO');
  };

  const handleViewNote = (note: StudyNote) => {
    if (!user) {
      alert('🔒 Sikar Study library requires authentication to preview summaries.');
      onOpenLogin();
      return;
    }
    setSelectedNote(note);
    appendAuditLog('NOTES_DETAILS_PREVIEW', user.email, user.role, `Student viewed details for: "${note.title}"`, 'INFO');
  };

  // If NOT logged in, block view and show absolute premium portal wall
  if (!user) {
    return (
      <div className="w-full min-h-screen py-16 px-6 bg-[#0B1220] text-xs text-[#F8FAFC] flex items-center justify-center">
        <div className="max-w-md w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-[20px] flex items-center justify-center shadow-lg animate-bounce">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight">🔒 Secure Portal Wall</h2>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Notes are highly protected at Sikar Coaching Center. Downloads, copy-pasting, printing, and guest reading are strictly disabled. 
              <br />
              <span className="text-[#3B82F6] font-bold">Notes sirf login ke baad hi load hon.</span>
            </p>
          </div>
          
          <div className="bg-[#0B1220] p-4 rounded-[16px] border border-[rgba(255,255,255,0.06)] text-left space-y-2 text-[10px] text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Anti-Download & DRM protections</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Automatic Watermarked sheets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Live query clinic attachments</span>
            </div>
          </div>

          <button
            onClick={onOpenLogin}
            className="w-full py-2.5 rounded-[16px] bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95"
          >
            Log In / Register to Access
          </button>
        </div>
      </div>
    );
  }

  // Retrieve sheets for current note or general default
  const noteSheets = readerNote ? (SECURE_NOTE_CONTENTS[readerNote.id] || [
    `SECURE DIGITAL DOCUMENT — VIBRANT SIKAR PORTAL — LICENSE VERIFIED`,
    `File Title: ${readerNote.title}`,
    `Subject: ${readerNote.subject} | Mapped Exam: ${readerNote.examCategory}`,
    `Warning: This file contains protected content of Sikar Digital Companion. Repetitive screenshot triggers are tracked by server nodes.`,
    `Please visit Nawalgarh Road Main Campus, Sikar for printed booklets if offline offline study is preferred.`
  ]) : [];

  return (
    <div className="w-full min-h-screen py-6 px-6 bg-[#0B1220] transition-colors duration-300 text-xs text-[#F8FAFC] select-none">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[14px] bg-[#0E1B35] text-cyan-400 font-extrabold uppercase text-[9px] border border-cyan-950">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            SECUR-SHIELD® Active DRM
          </span>
          <h2 className="text-2xl font-bold font-sans text-[#F8FAFC] flex items-center justify-center gap-2 mt-2">
            <BookOpen className="w-6 h-6 text-[#06B6D4]" />
            Vibrant Digital Study Library
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Subject-wise formula sheets, previous year topic-wise materials, and English grammar books. Highly protected against sharing.
          </p>
        </div>

        {/* Search & Subject Filters bar */}
        <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] p-3.5 rounded-[20px] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#94A3B8]/60" />
            <input
              type="text"
              placeholder="Search chapters or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#0B1220] text-xs focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] text-[#F8FAFC] placeholder-[#94A3B8]/50 outline-none"
            />
          </div>

          {/* Subject pills */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center">
            {['All', 'Mathematics', 'Reasoning', 'English', 'General Knowledge'].map((subject) => (
              <button
                key={subject}
                onClick={() => {
                  setActiveSubject(subject as any);
                  setSelectedNote(null);
                }}
                className={`px-3 py-1 rounded-[14px] text-xs font-bold transition-all cursor-pointer ${
                  activeSubject === subject
                    ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow'
                    : 'bg-[#0B1220] text-[#94A3B8] border border-[rgba(255,255,255,0.08)] hover:text-[#F8FAFC]'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

        </div>

        {/* Dual Layout: Details Panel on Right, Grid List on Left */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Left Column (2 Grid Spaces): List of items */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              const isLocked = note.isPaid && !user.isPremium;
              return (
                <div 
                  key={note.id} 
                  className={`bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.25)] hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between h-48 cursor-pointer ${
                    selectedNote?.id === note.id ? 'ring-2 ring-[#3B82F6]' : ''
                  }`}
                  onClick={() => handleViewNote(note)}
                >
                  <div>
                    {/* Header: Badge & Status */}
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#0B1220] text-[#06B6D4] px-2 py-0.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                        {note.subject}
                      </span>
                      {note.isPaid ? (
                        <span className={`text-[9px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-[12px] ${
                          isLocked 
                            ? 'bg-[#2E1065]/30 text-[#A78BFA] border border-[#5B21B6]/30' 
                            : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30'
                        }`}>
                          {isLocked ? (
                            <>
                              <Lock className="w-2.5 h-2.5 text-[#A78BFA]" />
                              <span>Premium Locked</span>
                            </>
                          ) : (
                            <span>Premium Unlocked</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-[#3B82F6] bg-[#0B1220] px-2 py-0.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                          FREE HANDBOOK
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-[#F8FAFC] line-clamp-2 leading-relaxed">
                      {note.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-[10px] text-[#94A3B8] mt-1.5 line-clamp-2">
                      {note.contentSummary}
                    </p>
                  </div>

                  {/* Actions summary bar */}
                  <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.08)] pt-2.5 mt-3 text-[10px] text-[#94A3B8]">
                    <span className="font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Protected Reader Only
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadNote(note);
                      }}
                      className="bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] text-white px-3 py-1 rounded-[12px] font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Note</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredNotes.length === 0 && (
              <div className="md:col-span-2 text-center p-12 bg-[#111827] rounded-[20px] border border-dashed border-[rgba(255,255,255,0.08)]">
                <FileText className="w-10 h-10 text-[#94A3B8]/40 mx-auto mb-2" />
                <p className="text-xs text-[#94A3B8]">No protected booklets found matching current filters.</p>
              </div>
            )}
          </div>

          {/* Right Column: Expanded View panel */}
          <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-lg">
            {selectedNote ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-[rgba(255,255,255,0.08)] pb-2.5">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[#06B6D4] bg-[#0B1220] px-2 py-0.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                      {selectedNote.subject}
                    </span>
                    <h3 className="font-bold text-xs text-[#F8FAFC] mt-1.5 leading-snug">
                      {selectedNote.title}
                    </h3>
                  </div>
                </div>

                {/* Scope Metadata */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#94A3B8] bg-[#0B1220] p-2.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                  <div>
                    <span className="block font-bold">MAPPED EXAM</span>
                    <span className="text-[#06B6D4] font-extrabold">{selectedNote.examCategory}</span>
                  </div>
                  <div>
                    <span className="block font-bold">SECURITY ENCRYPTION</span>
                    <span className="text-[#3B82F6] font-extrabold">256-Bit DRM</span>
                  </div>
                </div>

                {/* Full Syllabus Summary of Note */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">Syllabus Coverage:</span>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed bg-[#0B1220]/50 p-2.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                    {selectedNote.contentSummary}
                  </p>
                </div>

                {/* Mock preview checklist */}
                <div className="space-y-1.5 text-[10px] text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-Time Watermarked dynamic canvas reading</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Right-click, printing, and screenshot filters active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Includes 50+ Practice PYQs (2018-2025)</span>
                  </div>
                </div>

                {/* Final Trigger download */}
                <button
                  onClick={() => handleReadNote(selectedNote)}
                  className="w-full py-1.5 rounded-[14px] bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 mt-3 uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span>Open Secure DRM Worksheet</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-16 text-[#94A3B8]">
                <Sparkles className="w-6 h-6 text-[#06B6D4] mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-semibold">Select any note from the list to view secure DRM sheet parameters.</p>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECURE PROTECTED READER MODAL (DRM LAYER ACTIVE) */}
        {/* ========================================================================= */}
        {isReaderOpen && readerNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in no-print">
            <div 
              ref={readerRef}
              className="w-full max-w-4xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-[24px] flex flex-col justify-between shadow-2xl overflow-hidden relative"
              onContextMenu={(e) => {
                e.preventDefault();
                triggerSecurityBlock('Right Click Blocked in View');
              }}
              onCopy={(e) => {
                e.preventDefault();
                triggerSecurityBlock('Copy Action Prohibited');
              }}
            >
              
              {/* Top Secure Header bar */}
              <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center text-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded-[8px] bg-[#991B1B] text-white text-[9px] font-bold flex items-center gap-1 uppercase">
                    <AlertTriangle className="w-3 h-3 text-white" />
                    <span>Highly Confidential</span>
                  </div>
                  <h3 className="font-extrabold text-[11px] max-w-sm md:max-w-xl truncate text-zinc-300">
                    {readerNote.title}
                  </h3>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setIsReaderOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Secure Reading canvas with dynamic, rotating watermark tiles */}
              <div className="flex-1 overflow-y-auto p-8 relative flex items-center justify-center bg-zinc-900 select-none">
                
                {/* WATERMARK REPEATED DIAGONALS */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-5 overflow-hidden grid grid-cols-2 md:grid-cols-3 gap-y-24 gap-x-12 select-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="text-[9px] font-mono whitespace-nowrap -rotate-[30deg] font-extrabold text-white leading-relaxed text-center"
                    >
                      {user.name} <br />
                      {user.email} <br />
                      {user.mobile} <br />
                      {watermarkTime || new Date().toISOString()} <br />
                      IP: 103.189.245.{20 + (i % 80)} <br />
                      VIBRANT-SECURE-NODE
                    </div>
                  ))}
                </div>

                {/* THE ACTUAL SECURE SHEET PAGE CONTAINER */}
                <div className="relative z-10 w-full max-w-2xl bg-[#090D16] border border-zinc-800 min-h-[50vh] p-8 rounded-[16px] shadow-2xl flex flex-col justify-between select-none">
                  
                  {/* Top Sheet Margin */}
                  <div className="border-b border-zinc-800 pb-3 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>VIBRANT SIKAR NOTES ENGINE v2.0</span>
                    <span>SHEET PAGE {currentPage + 1} OF {noteSheets.length}</span>
                  </div>

                  {/* Dynamic Page Content Paragraphs */}
                  <div className="my-8 space-y-4 text-xs text-zinc-200 leading-relaxed font-sans">
                    {noteSheets[currentPage] ? (
                      <p className="text-sm font-semibold text-zinc-100 tracking-wide font-sans select-none">
                        {noteSheets[currentPage]}
                      </p>
                    ) : (
                      <p className="text-center text-zinc-500">Error rendering page structure.</p>
                    )}
                  </div>

                  {/* Bottom Sheet Margin */}
                  <div className="border-t border-zinc-800 pt-3 flex flex-col sm:flex-row justify-between items-center text-[9px] text-zinc-500 font-mono gap-1">
                    <span className="text-[#3B82F6] font-bold">STRICT LICENSE KEY: {user.sessionToken || 'GUEST_EXPIRED_JWT'}</span>
                    <span className="text-zinc-600">Tracked reading session: {user.email}</span>
                  </div>

                </div>

              </div>

              {/* Protected Reader Navigation & Info Footer */}
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-400 font-mono gap-2">
                
                {/* Security Violations Counter */}
                <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  DRM Shield Enabled. No downloads.
                </span>

                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-white text-[11px] font-bold">
                    Page {currentPage + 1} / {noteSheets.length}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(noteSheets.length - 1, prev + 1))}
                    disabled={currentPage === noteSheets.length - 1}
                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-zinc-500 truncate">
                  Expiry Token: {secureUrl.substring(40, 60)}...
                </span>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
