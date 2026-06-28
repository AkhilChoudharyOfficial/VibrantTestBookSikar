import React, { useState, useEffect, useRef } from 'react';
import { TestSeries, UserProfile, TestAttempt, SectionScore, Question, TestSection } from '../types';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, HelpCircle, Lock, Award, BookOpen, ShieldAlert, Calculator, RefreshCw, X, ChevronLeft } from 'lucide-react';
import { appendAuditLog } from '../dataStore';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { MagneticButton, TiltCard, CounterAnimation } from './InteractiveEffects';

interface TestSimulatorProps {
  user: UserProfile | null;
  tests: TestSeries[];
  onAddAttempt: (attempt: TestAttempt) => void;
  onOpenPayment: (test: TestSeries) => void;
  onOpenLogin: () => void;
}

type TestState = 'list' | 'instructions' | 'active' | 'result';

export const TestSimulator: React.FC<TestSimulatorProps> = ({
  user,
  tests,
  onAddAttempt,
  onOpenPayment,
  onOpenLogin
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'SSC' | 'Delhi Police' | 'State'>('all');
  const [selectedTest, setSelectedTest] = useState<TestSeries | null>(null);
  const [testState, setTestState] = useState<TestState>('list');

  // Active exam state
  const [currentSectionIdx, setCurrentSectionIdx] = useState<number>(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [questionStatus, setQuestionStatus] = useState<{ [qId: string]: 'unvisited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked' }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Result compile state
  const [recentAttempt, setRecentAttempt] = useState<TestAttempt | null>(null);
  const [viewingSolutions, setViewingSolutions] = useState<boolean>(false);

  // Calculator states
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string>('');

  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (val === 'del') {
      setCalcInput(prev => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        const sanitized = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
        const evalRes = Function(`"use strict"; return (${sanitized})`)();
        setCalcResult(Number(evalRes).toLocaleString(undefined, { maximumFractionDigits: 4 }));
      } catch (err) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput(prev => prev + val);
    }
  };

  // Filtered tests
  const filteredTests = tests.filter(test => {
    if (activeTab === 'all') return true;
    if (activeTab === 'SSC') return test.examCategory.startsWith('SSC');
    if (activeTab === 'Delhi Police') return test.examCategory === 'Delhi Police';
    if (activeTab === 'State') return test.examCategory === 'State Exams';
    return true;
  });

  // Handle selecting a test
  const handleSelectTest = (test: TestSeries) => {
    if (!user) {
      alert('Please Login/Sign Up to take test series.');
      onOpenLogin();
      return;
    }
    if (test.isPaid && !user.isPremium && !user.enrolledCourses.includes(test.id)) {
      onOpenPayment(test);
      return;
    }
    setSelectedTest(test);
    setTestState('instructions');
    appendAuditLog('TEST_ATTEMPT_INITIATED', user.email, user.role, `Student viewed instruction dashboard for ${test.title}`, 'INFO');
  };

  // Start exam
  const handleStartExam = () => {
    if (!selectedTest) return;
    
    // Setup initial statuses
    const initialStatus: typeof questionStatus = {};
    selectedTest.questions.forEach((q, idx) => {
      initialStatus[q.id] = idx === 0 ? 'not_answered' : 'unvisited';
    });
    
    setQuestionStatus(initialStatus);
    setSelectedAnswers({});
    setCurrentSectionIdx(0);
    setActiveQuestionIdx(0);
    setTestState('active');
    setViewingSolutions(false);
    setTimeSpent(0);

    // Load first section duration
    const firstSection = selectedTest.sections[0];
    // In preview mode we can scale timing, e.g. 1 minute per section is perfect for testing.
    // If we want real time or scaled down for verification, 60 seconds is excellent to show off.
    setTimeLeft(firstSection.durationMinutes * 60);
    appendAuditLog('TEST_STARTED', user?.email || 'guest', user?.role || 'student', `Student began mock exam: ${selectedTest.title}`, 'INFO');
  };

  // Active section configuration
  const currentSection = selectedTest?.sections[currentSectionIdx];
  const sectionQuestions = selectedTest?.questions.filter(q => q.sectionId === currentSection?.id) || [];
  const currentQuestion = sectionQuestions[activeQuestionIdx];

  // Tick Timer
  useEffect(() => {
    if (testState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSectionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState, currentSectionIdx]);

  // Section timing completed
  const handleSectionTimeout = () => {
    if (!selectedTest) return;
    
    alert(`Time is up for Section: ${selectedTest.sections[currentSectionIdx].name}! Your responses are auto-saved. Switching to the next section.`);
    
    if (currentSectionIdx < selectedTest.sections.length - 1) {
      const nextIdx = currentSectionIdx + 1;
      setCurrentSectionIdx(nextIdx);
      setActiveQuestionIdx(0);
      setTimeLeft(selectedTest.sections[nextIdx].durationMinutes * 60);
      
      // Update first question status of next section
      const nextSecQuestions = selectedTest.questions.filter(q => q.sectionId === selectedTest.sections[nextIdx].id);
      if (nextSecQuestions.length > 0) {
        setQuestionStatus(prev => ({
          ...prev,
          [nextSecQuestions[0].id]: prev[nextSecQuestions[0].id] === 'unvisited' ? 'not_answered' : prev[nextSecQuestions[0].id]
        }));
      }
    } else {
      // Last section timed out
      handleSubmitExam();
    }
  };

  // Skip section manually
  const handleNextSectionManually = () => {
    if (!selectedTest) return;
    if (window.confirm(`Are you sure you want to lock and submit Section: ${selectedTest.sections[currentSectionIdx].name}? You cannot return to this section afterwards.`)) {
      if (currentSectionIdx < selectedTest.sections.length - 1) {
        const nextIdx = currentSectionIdx + 1;
        setCurrentSectionIdx(nextIdx);
        setActiveQuestionIdx(0);
        setTimeLeft(selectedTest.sections[nextIdx].durationMinutes * 60);
        
        const nextSecQuestions = selectedTest.questions.filter(q => q.sectionId === selectedTest.sections[nextIdx].id);
        if (nextSecQuestions.length > 0) {
          setQuestionStatus(prev => ({
            ...prev,
            [nextSecQuestions[0].id]: prev[nextSecQuestions[0].id] === 'unvisited' ? 'not_answered' : prev[nextSecQuestions[0].id]
          }));
        }
      } else {
        handleSubmitExam();
      }
    }
  };

  // Option select handler
  const handleSelectOption = (optionIdx: number) => {
    if (!currentQuestion) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIdx
    }));
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion.id]: prev[currentQuestion.id] === 'marked' ? 'answered_marked' : 'answered'
    }));
  };

  // Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion.id]: 'not_answered'
    }));
  };

  // Mark for Review & Next
  const handleMarkReviewNext = () => {
    if (!currentQuestion) return;
    const isAnswered = selectedAnswers[currentQuestion.id] !== undefined;
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion.id]: isAnswered ? 'answered_marked' : 'marked'
    }));
    handleNextQuestion();
  };

  // Save & Next
  const handleSaveNext = () => {
    if (!currentQuestion) return;
    const isAnswered = selectedAnswers[currentQuestion.id] !== undefined;
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion.id]: isAnswered ? 'answered' : 'not_answered'
    }));
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < sectionQuestions.length - 1) {
      const nextIdx = activeQuestionIdx + 1;
      setActiveQuestionIdx(nextIdx);
      const nextQ = sectionQuestions[nextIdx];
      setQuestionStatus(prev => ({
        ...prev,
        [nextQ.id]: prev[nextQ.id] === 'unvisited' ? 'not_answered' : prev[nextQ.id]
      }));
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(prev => prev - 1);
    }
  };

  const selectQuestionPaletteIdx = (idx: number) => {
    setActiveQuestionIdx(idx);
    const targetQ = sectionQuestions[idx];
    setQuestionStatus(prev => ({
      ...prev,
      [targetQ.id]: prev[targetQ.id] === 'unvisited' ? 'not_answered' : prev[targetQ.id]
    }));
  };

  // Submit test and grade results
  const handleSubmitExam = () => {
    if (!selectedTest || !user) return;

    if (timerRef.current) clearInterval(timerRef.current);

    // Grading variables
    let totalScore = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;

    const sectionsBreakdown: SectionScore[] = selectedTest.sections.map(sec => {
      const secQues = selectedTest.questions.filter(q => q.sectionId === sec.id);
      let secScore = 0;
      let secCorrect = 0;
      let secIncorrect = 0;
      let secUnattempted = 0;

      secQues.forEach(q => {
        const userAns = selectedAnswers[q.id];
        if (userAns === undefined) {
          secUnattempted++;
        } else if (userAns === q.correctAnswerIndex) {
          secCorrect++;
          // Standard SSC: Math/Reasoning carry 2 marks, Negative marking of 0.50
          secScore += 2;
        } else {
          secIncorrect++;
          secScore -= 0.50; // Neg marking
        }
      });

      totalScore += secScore;
      totalCorrect += secCorrect;
      totalIncorrect += secIncorrect;
      totalUnattempted += secUnattempted;

      return {
        sectionName: sec.name,
        score: parseFloat(secScore.toFixed(2)),
        correct: secCorrect,
        incorrect: secIncorrect,
        unattempted: secUnattempted
      };
    });

    const newAttempt: TestAttempt = {
      id: 'att_' + Math.random().toString(36).substring(2, 9),
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      examCategory: selectedTest.examCategory,
      userId: user.id,
      userName: user.name,
      rollNumber: user.rollNumber,
      completedAt: new Date().toISOString(),
      score: parseFloat(totalScore.toFixed(2)),
      totalMarks: selectedTest.totalMarks,
      correctAnswers: totalCorrect,
      incorrectAnswers: totalIncorrect,
      unattemptedAnswers: totalUnattempted,
      sectionDetails: sectionsBreakdown,
      timeSpentSeconds: timeSpent
    };

    setRecentAttempt(newAttempt);
    onAddAttempt(newAttempt);
    setTestState('result');
    if (newAttempt.score >= (newAttempt.totalMarks * 0.4)) {
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error("Confetti error:", err);
      }
    }
    appendAuditLog('TEST_SUBMITTED', user.email, user.role, `Mock Exam graded securely. Score: ${newAttempt.score}/${newAttempt.totalMarks}. Correct: ${newAttempt.correctAnswers}`, 'INFO');
  };

  // Helper to get formatting
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full min-h-screen py-6 px-4 bg-[#0B1220] transition-colors duration-300 text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        
        {/* VIEW 1: TEST SELECTION LIST */}
        {testState === 'list' && (
          <div>
            {/* Header / Intro */}
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold font-sans text-[#F8FAFC] flex items-center justify-center gap-2">
                <Award className="w-8 h-8 text-[#06B6D4] animate-pulse" />
                Vibrant Test Book Portal
              </h2>
              <p className="text-sm text-[#94A3B8] mt-2">
                Access premium real-time mock tests & previous year question papers. Styled on the official ssc sectional timing structure.
              </p>

              {/* Navigation Filters */}
              <div className="flex justify-center space-x-2 mt-6">
                {[
                  { id: 'all', label: 'All Exams' },
                  { id: 'SSC', label: 'SSC Series' },
                  { id: 'Delhi Police', label: 'Delhi Police' },
                  { id: 'State', label: 'State-Level' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-1.5 rounded-[14px] text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-[#F8FAFC] shadow'
                        : 'bg-[#111827] text-[#94A3B8] border border-[rgba(255,255,255,0.08)] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Series Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => {
                const hasPremiumUnlock = user?.isPremium || user?.enrolledCourses.includes(test.id);
                return (
                  <div 
                    key={test.id} 
                    className="bg-[#111827] rounded-[20px] border border-[rgba(255,255,255,0.08)] shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-[3px] hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Badge Header */}
                    <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-[12px] bg-[#0B1220] text-[#06B6D4] border border-[rgba(255,255,255,0.08)]">
                        {test.examCategory}
                      </span>
                      {test.isPaid ? (
                        hasPremiumUnlock ? (
                          <span className="text-[10px] flex items-center gap-1 font-extrabold text-green-400 bg-emerald-950/20 px-2 py-0.5 rounded-[12px] border border-emerald-900/30">
                            Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] flex items-center gap-1 font-extrabold text-[#8B5CF6] bg-[#0B1220]/50 px-2.5 py-1 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                            <Lock className="w-3 h-3 text-[#8B5CF6]" />
                            Premium (₹{test.price})
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-extrabold text-[#3B82F6] bg-[#0B1220]/50 px-2.5 py-1 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                          FREE TEST
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-grow">
                      <h3 className="font-bold text-[#F8FAFC] text-base leading-snug">
                        {test.title}
                      </h3>
                      
                      {/* Section Timings Info */}
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
                          <span>Sections: {test.sections.map(s => s.name).join(', ')}</span>
                        </p>
                        <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
                          <span>Total Duration: {test.sections.reduce((acc, s) => acc + s.durationMinutes, 0)} minutes</span>
                        </p>
                        <div className="pt-2">
                          <span className="text-xs font-semibold text-[#06B6D4] bg-[#0B1220] border border-[rgba(255,255,255,0.08)] px-2 py-1 rounded-[12px]">
                            {test.totalQuestions} Exam Questions Mapped
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="p-6 pt-0 border-t border-[rgba(255,255,255,0.08)]">
                      <button
                        onClick={() => handleSelectTest(test)}
                        className="w-full py-2.5 rounded-[14px] text-xs font-bold transition-all mt-4 flex items-center justify-center gap-2 text-white bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_16px_rgba(59,130,246,0.4)] hover:scale-[1.02] cursor-pointer"
                      >
                        {test.isPaid && !hasPremiumUnlock ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlock Subscription</span>
                          </>
                        ) : (
                          <>
                            <span>Take Mock Test</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: EXAM INSTRUCTIONS SHIELD */}
        {testState === 'instructions' && selectedTest && (
          <div className="bg-white dark:bg-purple-900 border border-purple-200 dark:border-purple-800 rounded-3xl shadow-lg p-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-extrabold text-purple-950 dark:text-purple-50 border-b border-purple-100 dark:border-purple-800 pb-3">
              Instructions: {selectedTest.title}
            </h3>

            {/* Candidate Details */}
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-xl my-4 grid grid-cols-2 gap-4 border border-purple-100 dark:border-purple-900 text-xs">
              <div>
                <p className="text-gray-500 dark:text-purple-300 font-medium">Candidate Name</p>
                <p className="font-bold text-purple-900 dark:text-purple-100">{user?.name}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-purple-300 font-medium">Roll Number</p>
                <p className="font-bold text-purple-900 dark:text-purple-100">{user?.rollNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-purple-300 font-medium">Exam Batch</p>
                <p className="font-bold text-purple-900 dark:text-purple-100">{user?.batchNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-purple-300 font-medium">Assigned Centre</p>
                <p className="font-bold text-purple-900 dark:text-purple-100">{user?.centreName}</p>
              </div>
            </div>

            {/* Core SSC instructions */}
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 mt-4">
              <h4 className="font-bold text-purple-950 dark:text-purple-200">Strict Sectional Timing & Pattern Rules:</h4>
              <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <li>
                  <strong className="text-purple-800 dark:text-purple-400">Locked Section Flow</strong>: As per the latest official SSC exam rules, you must attempt sections in a fixed sequence. You cannot skip back and forth between different sections.
                </li>
                <li>
                  <strong className="text-purple-800 dark:text-purple-400">Automatic Section Submission</strong>: Once the sectional countdown timer reaches <strong className="text-red-500 font-bold">0:00</strong>, the active section will auto-submit, and you will be pushed automatically to the next section.
                </li>
                <li>
                  <strong className="text-purple-800 dark:text-purple-400">Marking Scheme</strong>: Each correct answer earns <strong className="text-green-600 font-bold">+2.0 Marks</strong>. Wrong answers carry a negative marking penalty of <strong className="text-red-500 font-bold">-0.50 Marks</strong>. Unattempted questions yield 0.
                </li>
                <li>
                  Ensure you do not reload the page or click outside the dashboard, or your security audit logs may flag session irregularities.
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 mt-8 border-t border-purple-100 dark:border-purple-800 pt-4">
              <button
                onClick={() => setTestState('list')}
                className="px-5 py-2 rounded-xl text-xs font-extrabold border border-purple-200 dark:border-purple-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Cancel & Exit
              </button>
              <button
                onClick={handleStartExam}
                className="px-6 py-2 rounded-xl text-xs font-extrabold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              >
                I am ready to begin
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: LIVE EXAM SCREEN */}
        {testState === 'active' && selectedTest && currentSection && (
          <div className="relative min-h-[600px] bg-slate-100/50 dark:bg-slate-950/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl overflow-hidden backdrop-blur-md">
            
            {/* Interactive Draggable/Floating Glassmorphic Onscreen Calculator */}
            <AnimatePresence>
              {showCalculator && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  className="fixed bottom-24 right-6 md:right-8 lg:right-96 z-50 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                    <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" />
                      Onscreen Calculator
                    </span>
                    <button 
                      onClick={() => setShowCalculator(false)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Calc Display */}
                  <div className="bg-slate-950 text-emerald-400 p-3 rounded-xl mb-3 font-mono text-right min-h-[68px] flex flex-col justify-between border border-slate-800">
                    <div className="text-[10px] text-slate-500 tracking-wider truncate">{calcInput || '0'}</div>
                    <div className="text-lg font-bold truncate">{calcResult || '0'}</div>
                  </div>

                  {/* Calc Buttons Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    {['C', 'del', '(', ')', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => {
                      let btnClass = "py-2.5 rounded-lg text-center cursor-pointer transition-all active:scale-95 ";
                      if (btn === 'C') btnClass += "bg-rose-500/20 text-rose-600 hover:bg-rose-500/30";
                      else if (btn === 'del') btnClass += "bg-amber-500/20 text-amber-600 hover:bg-amber-500/30";
                      else if (btn === '=') btnClass += "bg-indigo-600 text-white hover:bg-indigo-500 col-span-1 shadow-md";
                      else if (['+', '-', '*', '/'].includes(btn)) btnClass += "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20";
                      else btnClass += "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

                      return (
                        <button
                          key={btn}
                          onClick={() => handleCalcBtn(btn)}
                          className={btnClass}
                        >
                          {btn === '*' ? '×' : btn === '/' ? '÷' : btn}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* LEFT COLUMN: Question Body & Navigation Controllers (9/12 cols) */}
              <div className="lg:col-span-9 flex flex-col min-h-[580px] border-r border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40">
                
                {/* Real-Exam Top Stats Header */}
                <div className="bg-indigo-950 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-900/60 rounded-xl border border-indigo-800">
                      <Award className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-200">Official Exam Portal</h4>
                      <h3 className="text-sm font-black truncate max-w-[260px] md:max-w-md">{selectedTest.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Calculator Toggler */}
                    <button
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-200 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm border border-slate-700 cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Calculator</span>
                    </button>

                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                      <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span className="text-xs font-extrabold font-mono text-amber-400">{formatTime(timeLeft)}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Remaining</span>
                    </div>
                  </div>
                </div>

                {/* Section Locked Timing notification bar */}
                <div className="bg-amber-500/10 dark:bg-amber-950/20 border-b border-slate-200/40 dark:border-slate-800/40 py-2 px-6 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Locked Section Flow: {currentSection.name}</span>
                  </span>
                  <button
                    onClick={handleNextSectionManually}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow cursor-pointer transition-transform active:scale-95"
                  >
                    {currentSectionIdx === selectedTest.sections.length - 1 ? 'Submit Entire Exam' : 'Lock & Next Section'}
                  </button>
                </div>

                {/* Active Question Viewport */}
                {currentQuestion ? (
                  <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Section Title, Marks, Counter */}
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            Q {activeQuestionIdx + 1} of {sectionQuestions.length}
                          </span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wide uppercase">
                            {currentSection.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/30">
                          Marks: <span className="text-emerald-600 font-black">+2.0</span> | Negative: <span className="text-rose-500 font-black">-0.5</span>
                        </span>
                      </div>

                      {/* Question Text Statement */}
                      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 p-5 rounded-2xl mb-6 shadow-inner">
                        <div className="text-sm font-black text-slate-800 dark:text-slate-50 leading-relaxed font-sans">
                          {currentQuestion.questionText}
                        </div>
                      </div>

                      {/* Radio Option Cards */}
                      <div className="grid grid-cols-1 gap-3.5">
                        {currentQuestion.options.map((option, oIdx) => {
                          const isSelected = selectedAnswers[currentQuestion.id] === oIdx;
                          return (
                            <motion.label
                              key={oIdx}
                              onClick={() => handleSelectOption(oIdx)}
                              className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-500 shadow-md shadow-indigo-500/5'
                                  : 'border-slate-200/70 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                              }`}
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{String.fromCharCode(65 + oIdx)}.</span>
                              <span className="text-xs font-black leading-relaxed">{option}</span>
                            </motion.label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official TCS Navigation Controllers footer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/60 mt-10">
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={handleMarkReviewNext}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Mark for Review & Next
                        </motion.button>
                        <motion.button
                          onClick={handleClearResponse}
                          className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Clear Response
                        </motion.button>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={handlePrevQuestion}
                          disabled={activeQuestionIdx === 0}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeQuestionIdx === 0
                              ? 'border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700 cursor-not-allowed'
                              : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400'
                          }`}
                          whileHover={activeQuestionIdx > 0 ? { scale: 1.02 } : {}}
                          whileTap={activeQuestionIdx > 0 ? { scale: 0.98 } : {}}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Prev</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={handleSaveNext}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/10 cursor-pointer"
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Save & Next
                        </motion.button>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center flex-grow">
                    <ShieldAlert className="w-12 h-12 text-amber-500 mb-3 animate-bounce" />
                    <p className="text-sm text-slate-600 dark:text-purple-300 font-extrabold">No questions available in this section.</p>
                  </div>
                )}
              </div>

              {/* RIGHT SIDEBAR: Candidate profile, locked section timeline, and interactive Question Palette grid (3/12 cols) */}
              <div className="lg:col-span-3 bg-slate-50/70 dark:bg-slate-950/60 p-4 flex flex-col justify-between border-t lg:border-t-0 border-slate-200/50 dark:border-slate-800/50">
                <div>
                  
                  {/* Candidate Identification box */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow">
                      {user?.name.charAt(0)}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold truncate">Roll No: {user?.rollNumber || 'VIBRANT-8822'}</p>
                    </div>
                  </div>

                  {/* Section Sequence Flow */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3 shadow-sm mb-4">
                    <p className="text-[9px] uppercase tracking-wider font-black text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      Subject Locked Timeline
                    </p>
                    <div className="space-y-1.5">
                      {selectedTest.sections.map((sec, idx) => {
                        const isActive = idx === currentSectionIdx;
                        const isCompleted = idx < currentSectionIdx;
                        return (
                          <div
                            key={sec.id}
                            className={`p-2 rounded-xl border text-[11px] font-black flex justify-between items-center ${
                              isActive
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-300'
                                : isCompleted
                                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-950/20 dark:text-emerald-400 font-semibold'
                                : 'border-slate-100 bg-slate-50/50 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                            }`}
                          >
                            <span className="truncate max-w-[120px]">{sec.name}</span>
                            {isCompleted ? (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Locked
                              </span>
                            ) : isActive ? (
                              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 animate-pulse font-black">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-semibold">Upcoming</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question Grid Palette */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    <p className="text-[9px] uppercase tracking-wider font-black text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      Question Palette Grid
                    </p>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {sectionQuestions.map((q, idx) => {
                        const status = questionStatus[q.id] || 'unvisited';
                        const isActive = idx === activeQuestionIdx;

                        // Authentic TCS colors
                        let statusBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'; 
                        if (status === 'not_answered') statusBg = 'bg-rose-500 text-white shadow-sm';
                        if (status === 'answered') statusBg = 'bg-emerald-600 text-white shadow-sm';
                        if (status === 'marked') statusBg = 'bg-violet-600 text-white shadow-sm';
                        if (status === 'answered_marked') statusBg = 'bg-violet-600 text-white border-2 border-emerald-500 shadow-sm';

                        return (
                          <motion.button
                            key={q.id}
                            onClick={() => selectQuestionPaletteIdx(idx)}
                            className={`w-9 h-9 rounded-lg text-[11px] font-black transition-all relative cursor-pointer flex items-center justify-center ${statusBg} ${
                              isActive ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-950' : ''
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {idx + 1}
                            {status === 'answered_marked' && (
                              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Question palette count summary panel */}
                <div className="mt-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 text-[10px] font-black space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                      <span className="w-3 h-3 bg-slate-200 dark:bg-slate-800 rounded-md shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Not Visited</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                      <span className="w-3 h-3 bg-rose-500 rounded-md shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                      <span className="w-3 h-3 bg-emerald-600 rounded-md shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                      <span className="w-3 h-3 bg-violet-600 rounded-md shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Marked Review</span>
                    </div>
                  </div>
                  
                  {/* Master Finish Button */}
                  <motion.button
                    onClick={handleSubmitExam}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow shadow-rose-500/10 cursor-pointer mt-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Finish Entire Exam
                  </motion.button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: PERFORMANCE RESULT CARD */}
        {testState === 'result' && recentAttempt && selectedTest && (
          <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
            
            {/* Top score banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 text-center relative border-b border-slate-800/40">
              <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded text-[10px] font-black text-emerald-400">
                COMPLETED SECURELY
              </div>
              <h3 className="text-xl font-extrabold text-slate-100">Exam Results Compilation</h3>
              <p className="text-xs text-indigo-300 mt-1">{recentAttempt.testTitle}</p>
              
              <div className="mt-6 inline-flex flex-col items-center justify-center bg-slate-950/85 p-6 rounded-full border border-slate-800 shadow-inner w-36 h-36">
                <span className="text-3xl font-extrabold text-amber-400">{recentAttempt.score}</span>
                <span className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5 mt-1">out of {recentAttempt.totalMarks}</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200/50 dark:border-slate-800/50 text-center text-xs bg-slate-50/50 dark:bg-slate-900/50">
              <div className="p-4 border-r border-slate-200/50 dark:border-slate-800/50">
                <p className="text-slate-500 dark:text-slate-400">Total Questions</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                  {recentAttempt.correctAnswers + recentAttempt.incorrectAnswers + recentAttempt.unattemptedAnswers}
                </p>
              </div>
              <div className="p-4 border-r border-slate-200/50 dark:border-slate-800/50">
                <p className="text-green-600 font-bold">✓ Correct</p>
                <p className="text-lg font-bold text-green-600 mt-1">{recentAttempt.correctAnswers}</p>
              </div>
              <div className="p-4 border-r border-slate-200/50 dark:border-slate-800/50">
                <p className="text-rose-500 font-bold">✗ Incorrect</p>
                <p className="text-lg font-bold text-rose-500 mt-1">{recentAttempt.incorrectAnswers}</p>
              </div>
              <div className="p-4">
                <p className="text-slate-400">Unattempted</p>
                <p className="text-lg font-bold text-slate-400 mt-1">{recentAttempt.unattemptedAnswers}</p>
              </div>
            </div>

            {/* Section Breakdown List */}
            <div className="p-6">
              <h4 className="text-sm font-bold text-purple-950 dark:text-purple-200 mb-4">Subject-wise Analytics (SSC Pattern):</h4>
              <div className="space-y-3">
                {recentAttempt.sectionDetails.map((sec, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-100 dark:border-purple-900">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                      <span className="font-bold text-xs text-gray-800 dark:text-purple-200">{sec.sectionName}</span>
                      <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                        Score: {sec.score} Marks
                      </span>
                    </div>
                    {/* Tiny bars */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500">
                      <span className="bg-green-50 dark:bg-green-950/20 text-green-700 p-1.5 rounded font-bold text-center">
                        Correct: {sec.correct}
                      </span>
                      <span className="bg-red-50 dark:bg-red-950/20 text-red-700 p-1.5 rounded font-bold text-center">
                        Wrong: {sec.incorrect}
                      </span>
                      <span className="bg-gray-100 dark:bg-purple-950 text-gray-500 p-1.5 rounded font-bold text-center">
                        Unattempted: {sec.unattempted}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Solutions (Accordion toggler) */}
              <div className="mt-6 border-t border-purple-100 dark:border-purple-800 pt-6">
                <button
                  onClick={() => setViewingSolutions(!viewingSolutions)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 underline hover:text-purple-700"
                >
                  {viewingSolutions ? 'Hide Detailed Solutions & Explanations' : 'View Detailed Solutions & Explanations'}
                </button>

                {viewingSolutions && (
                  <div className="space-y-4 mt-4 max-h-[300px] overflow-y-auto pr-2">
                    {selectedTest.questions.map((q, qIdx) => {
                      const userChoice = selectedAnswers[q.id];
                      const isCorrect = userChoice === q.correctAnswerIndex;
                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-gray-100 dark:border-purple-900 text-xs">
                          <p className="font-bold text-gray-800 dark:text-purple-100 mb-1">
                            Q{qIdx + 1}. {q.questionText}
                          </p>
                          <div className="space-y-1 pl-2 mb-2">
                            {q.options.map((opt, oIdx) => (
                              <p 
                                key={oIdx} 
                                className={`${
                                  oIdx === q.correctAnswerIndex 
                                    ? 'text-green-600 font-bold' 
                                    : oIdx === userChoice 
                                    ? 'text-red-500 font-bold' 
                                    : 'text-gray-500'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </p>
                            ))}
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-950/60 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900 mt-2">
                            <span className="font-bold text-purple-800 dark:text-purple-400">Explanation:</span>
                            <p className="text-[11px] text-gray-600 dark:text-purple-300 mt-0.5">{q.explanation || 'No explanation configured.'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons back */}
            <div className="bg-gray-50 dark:bg-slate-950 p-6 flex justify-end gap-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <MagneticButton
                onClick={() => setTestState('list')}
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2.5"
                glowColor="rgba(99, 102, 241, 0.45)"
                fillColor="rgba(99, 102, 241, 0.25)"
              >
                Return to Test Series Portal
              </MagneticButton>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
