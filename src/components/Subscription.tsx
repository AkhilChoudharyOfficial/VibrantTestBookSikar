import React, { useState } from 'react';
import { UserProfile, PaymentVerification } from '../types';
import { ShieldCheck, QrCode, CreditCard, CheckCircle2, RefreshCw, Sparkles, AlertTriangle, Calendar, Award, Receipt } from 'lucide-react';
import { getPayments, savePayments, appendAuditLog, addNotification } from '../dataStore';

interface SubscriptionProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onClose?: () => void;
}

const PLAN_BASE_PRICES = {
  free: 0,
  silver: 199,
  gold: 399,
  platinum: 699,
};

const VALIDITY_MULTIPLIERS = {
  7: 0.4,       // 7 days
  30: 1.0,      // 30 days
  90: 2.5,      // 90 days (discounted)
  180: 4.5,     // 180 days (discounted)
  365: 7.5,     // 365 days (max discount)
};

export const Subscription: React.FC<SubscriptionProps> = ({
  user,
  onUpdateUser,
  onClose
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'silver' | 'gold' | 'platinum'>('gold');
  const [validityDays, setValidityDays] = useState<7 | 30 | 90 | 180 | 365>(30);
  const [payMethod, setPayMethod] = useState<'upi' | 'card'>('upi');
  const [transactionId, setTransactionId] = useState('');
  const [paymentState, setPaymentState] = useState<'plans' | 'checkout' | 'processing' | 'success'>('plans');
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate dynamic price based on plan & validity
  const base = PLAN_BASE_PRICES[selectedPlan];
  const multiplier = VALIDITY_MULTIPLIERS[validityDays];
  const calculatedPrice = Math.round(base * multiplier);

  const activePlan = user.subscriptionPlan || 'free';
  const hasActiveSub = user.subscriptionPlan && user.subscriptionPlan !== 'free' && user.subscriptionStatus === 'active';
  
  // Calculate remaining days
  let remainingDays = 0;
  if (user.subscriptionEndDate) {
    const end = new Date(user.subscriptionEndDate).getTime();
    const now = Date.now();
    remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  const handleFreeTrial = () => {
    // Grant Free Plan for 7 Days instantly
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 7);

    const updated: UserProfile = {
      ...user,
      subscriptionPlan: 'free',
      subscriptionStartDate: now.toISOString(),
      subscriptionEndDate: end.toISOString(),
      subscriptionStatus: 'active',
      isPremium: false,
    };

    onUpdateUser(updated);
    appendAuditLog('SUBSCRIPTION_FREE_ACTIVATED', user.email, user.role, '7-Day Free Trial activated successfully.', 'INFO');
    addNotification('🎉 Trial Activated', 'Your 7-day Free Plan is now active. Access standard mock series and free handbooks.', 'success');
    alert('🎉 Success! Your 7-day Free Plan has been activated instantly.');
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!transactionId.trim() || transactionId.length < 8) {
      setErrorMessage('Please enter a valid Transaction ID / UPI Ref No. (at least 8 alpha-numeric characters).');
      return;
    }

    setPaymentState('processing');

    setTimeout(() => {
      const payments = getPayments();
      const newRequest: PaymentVerification = {
        id: 'pay_' + Math.random().toString(36).substring(2, 9),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        plan: selectedPlan,
        amount: calculatedPrice,
        validityDays: validityDays,
        transactionId: transactionId.trim(),
        date: new Date().toISOString(),
        status: 'pending'
      };

      payments.unshift(newRequest);
      savePayments(payments);

      // Trigger user profile to pending state
      const updatedUser: UserProfile = {
        ...user,
        subscriptionStatus: 'pending_verification'
      };
      onUpdateUser(updatedUser);

      appendAuditLog('PAYMENT_SUBMITTED_FOR_VERIFICATION', user.email, user.role, `Transaction submitted: ${transactionId}. Plan: ${selectedPlan.toUpperCase()}, Amount: ₹${calculatedPrice}`, 'INFO');
      addNotification('💳 Payment Pending', `Your payment of ₹${calculatedPrice} is submitted for manual verification. Sikar Director Akhil Sir will verify shortly.`, 'info');

      setPaymentState('success');
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen py-6 px-6 bg-[#0B1220] text-xs text-[#F8FAFC]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page title */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[14px] bg-[#1E1B4B] text-[#A5B4FC] font-extrabold text-[9px] uppercase border border-indigo-950">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            Flexible Membership Passes
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-2 text-[#F8FAFC]">
            Vibrant Study & Mock Subscription System
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 leading-normal">
            Choose a premium workbook pass to unlock advanced TCS-format test keys, HOD formula archives, and verified doubt rooms.
          </p>
        </div>

        {/* Current Status Widget */}
        <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">YOUR ACTIVE PLAN:</span>
              <span className={`px-2.5 py-0.5 rounded-[12px] text-[10px] font-black uppercase ${
                activePlan === 'platinum' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                activePlan === 'gold' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                activePlan === 'silver' ? 'bg-zinc-400/10 text-zinc-300 border border-zinc-400/30' :
                'bg-slate-800 text-slate-400'
              }`}>
                {activePlan.toUpperCase()} PASS
              </span>
              {user.subscriptionStatus === 'pending_verification' && (
                <span className="bg-amber-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-[12px] animate-pulse">
                  PENDING VERIFICATION
                </span>
              )}
            </div>
            
            <p className="text-[11px] text-[#94A3B8] max-w-lg">
              {hasActiveSub ? (
                <span>Unlocked full digital benefits. Premium tools are completely active.</span>
              ) : (
                <span>You are currently on the Free/Standard access tier. Upgrade to access verified handbooks.</span>
              )}
            </p>
          </div>

          <div className="bg-[#0B1220] border border-[rgba(255,255,255,0.06)] px-5 py-3 rounded-[16px] text-center min-w-[150px]">
            {hasActiveSub ? (
              <>
                <div className="text-xs font-mono font-bold text-[#06B6D4]">{remainingDays} DAYS</div>
                <div className="text-[9px] text-[#94A3B8] uppercase font-bold mt-0.5">Remaining Validity</div>
                <div className="text-[9px] text-[#94A3B8] font-mono mt-1 flex items-center gap-1 justify-center">
                  <Calendar className="w-3 h-3" />
                  <span>Ends: {new Date(user.subscriptionEndDate!).toLocaleDateString()}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-red-400">EXPIRED / FREE</div>
                <button
                  onClick={handleFreeTrial}
                  className="mt-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-[9px] rounded-[10px] transition-all cursor-pointer"
                >
                  Activate 7D Free Trial
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic checkout views */}
        {paymentState === 'plans' && (
          <div className="space-y-6">
            
            {/* Validity selector */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] p-5 rounded-[20px] shadow-sm text-center space-y-3">
              <span className="text-[10px] font-extrabold tracking-wider text-[#A5B4FC] uppercase block">
                STEP 1: SELECT VALIDITY DURATION
              </span>
              
              <div className="flex flex-wrap items-center justify-center gap-2">
                {([7, 30, 90, 180, 365] as const).map((days) => (
                  <button
                    key={days}
                    onClick={() => setValidityDays(days)}
                    className={`px-4 py-2 rounded-[14px] font-bold text-xs transition-all cursor-pointer border ${
                      validityDays === days
                        ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white border-transparent shadow'
                        : 'bg-[#0B1220] text-[#94A3B8] border-[rgba(255,255,255,0.08)] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {days} Days {days === 30 && '(Standard)'} {days > 30 && '🔥 SAVE'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#94A3B8] italic">
                *Prices dynamically scale with duration multipliers. Multi-month plans receive bulk student discount waivers automatically!
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Silver Plan */}
              <div className={`bg-[#111827] border rounded-[24px] p-6 flex flex-col justify-between space-y-5 transition-all relative ${
                selectedPlan === 'silver' ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/30' : 'border-[rgba(255,255,255,0.08)]'
              }`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-zinc-300">SILVER PASS</span>
                    <span className="text-[9px] bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded-[12px]">Essential</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#F8FAFC]">₹{Math.round(PLAN_BASE_PRICES.silver * VALIDITY_MULTIPLIERS[validityDays])}</span>
                    <span className="text-[10px] text-[#94A3B8]">/ {validityDays} Days</span>
                  </div>

                  <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                    Access core basic mock test series with digital review solutions and standard faculty study library.
                  </p>

                  <div className="border-t border-[rgba(255,255,255,0.06)] pt-3.5 space-y-2 text-[10px] text-[#94A3B8]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Standard Mock Tests (SSC/CET)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Access Free Handbooks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Interactive Leaderboards</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan('silver');
                    setPaymentState('checkout');
                  }}
                  className="w-full py-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] hover:bg-[#3B82F6] hover:text-white hover:border-transparent text-white text-xs font-bold rounded-[14px] uppercase tracking-wider cursor-pointer transition-all"
                >
                  Choose Silver Pass
                </button>
              </div>

              {/* Gold Plan (Most Popular) */}
              <div className={`bg-[#111827] border rounded-[24px] p-6 flex flex-col justify-between space-y-5 transition-all relative ${
                selectedPlan === 'gold' ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30' : 'border-[rgba(255,255,255,0.08)]'
              }`}>
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold text-[8px] uppercase px-3 py-1 rounded-full shadow tracking-wider">
                  MOST SELECTED
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-cyan-300">GOLD PASS</span>
                    <span className="text-[9px] bg-cyan-950/30 text-cyan-400 font-bold px-2 py-0.5 rounded-[12px] border border-cyan-900/30">Pro Mock</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#F8FAFC]">₹{Math.round(PLAN_BASE_PRICES.gold * VALIDITY_MULTIPLIERS[validityDays])}</span>
                    <span className="text-[10px] text-[#94A3B8]">/ {validityDays} Days</span>
                  </div>

                  <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                    All Silver features + unlocks complete VIP handbooks, TCS real replicas, and detailed doubt rooms.
                  </p>

                  <div className="border-t border-[rgba(255,255,255,0.06)] pt-3.5 space-y-2 text-[10px] text-[#94A3B8]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>All Mock Tests & Sub-tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Full VIP Handbooks Unlocked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Doubt Posting Allowed</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan('gold');
                    setPaymentState('checkout');
                  }}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] text-xs font-bold rounded-[14px] uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                >
                  Choose Gold Pass
                </button>
              </div>

              {/* Platinum Plan */}
              <div className={`bg-[#111827] border rounded-[24px] p-6 flex flex-col justify-between space-y-5 transition-all relative ${
                selectedPlan === 'platinum' ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-[rgba(255,255,255,0.08)]'
              }`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-amber-300">PLATINUM PASS</span>
                    <span className="text-[9px] bg-amber-950/30 text-amber-400 font-bold px-2 py-0.5 rounded-[12px] border border-amber-900/30">HOD Ultimate</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#F8FAFC]">₹{Math.round(PLAN_BASE_PRICES.platinum * VALIDITY_MULTIPLIERS[validityDays])}</span>
                    <span className="text-[10px] text-[#94A3B8]">/ {validityDays} Days</span>
                  </div>

                  <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                    The ultimate flagship program. Instant doubt resolution priority, Akhil Sir\'s special formulas, and physical booklet dispatches.
                  </p>

                  <div className="border-t border-[rgba(255,255,255,0.06)] pt-3.5 space-y-2 text-[10px] text-[#94A3B8]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Flagship TCS Simulations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>HOD Premium Formulas Archive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>1-on-1 Priority Doubt Clinic</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan('platinum');
                    setPaymentState('checkout');
                  }}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] text-xs font-bold rounded-[14px] uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                >
                  Choose Platinum Pass
                </button>
              </div>

            </div>

          </div>
        )}

        {/* checkout screen with UPI ref submittal */}
        {paymentState === 'checkout' && (
          <div className="max-w-md mx-auto bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] p-4.5 flex justify-between items-center text-white">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider">SECURE SIKAR PAYMENT DESK</h4>
                <p className="text-[9px] font-mono text-zinc-200">Manual Gateway Verification System</p>
              </div>
              <button 
                onClick={() => setPaymentState('plans')}
                className="text-white hover:text-cyan-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5">
              
              {/* Order summary */}
              <div className="p-3.5 bg-[#0B1220] rounded-[16px] border border-[rgba(255,255,255,0.06)] flex justify-between items-center text-[11px]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#94A3B8]">ENROLLMENT PACKAGE</span>
                  <div className="font-black text-[#F8FAFC]">{selectedPlan.toUpperCase()} PASS</div>
                  <span className="text-[10px] text-zinc-400 font-mono">Validity: {validityDays} Days</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-[#94A3B8]">TOTAL DUE</span>
                  <div className="text-sm font-black text-cyan-400">₹{calculatedPrice}</div>
                </div>
              </div>

              {/* Select payment channel */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setPayMethod('upi')}
                  className={`flex-1 py-2 rounded-[12px] border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all ${
                    payMethod === 'upi' ? 'border-[#3B82F6] bg-[#0E1B35] text-cyan-400' : 'border-[rgba(255,255,255,0.06)] text-[#94A3B8]'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#3B82F6]" />
                  <span>UPI / GPay / PhonePe</span>
                </button>
                <button
                  onClick={() => setPayMethod('card')}
                  className={`flex-1 py-2 rounded-[12px] border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all ${
                    payMethod === 'card' ? 'border-[#3B82F6] bg-[#0E1B35] text-cyan-400' : 'border-[rgba(255,255,255,0.06)] text-[#94A3B8]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#3B82F6]" />
                  <span>Cards / NetBanking</span>
                </button>
              </div>

              {/* UPI scanning instruction */}
              {payMethod === 'upi' ? (
                <div className="space-y-4 text-center">
                  <div className="bg-white p-3 rounded-[16px] w-36 h-36 mx-auto relative flex items-center justify-center shadow-md">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <rect x="5" y="5" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="11" y="11" width="10" height="10" fill="currentColor" />
                      <rect x="73" y="5" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="79" y="11" width="10" height="10" fill="currentColor" />
                      <rect x="5" y="73" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="11" y="79" width="10" height="10" fill="currentColor" />
                      <rect x="40" y="10" width="15" height="15" fill="currentColor" />
                      <rect x="55" y="30" width="10" height="25" fill="currentColor" />
                      <rect x="45" y="70" width="15" height="15" fill="currentColor" />
                      <rect x="75" y="50" width="15" height="15" fill="currentColor" />
                    </svg>
                    <span className="absolute bg-[#111827] text-white text-[5px] font-black px-1.5 py-0.5 rounded shadow border">
                      VIBRANT-UPI
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#94A3B8]">Scan QR & make a secure transfer of <strong className="text-white">₹{calculatedPrice}</strong> to:</div>
                    <div className="text-xs font-extrabold text-[#06B6D4] font-mono select-all">vibrant.sikar@ybl</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 bg-[#0B1220] rounded-[16px] border border-[rgba(255,255,255,0.06)] text-center">
                  <CreditCard className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                    Card / Netbanking checkouts are routed manually to the administration office. Please transfer amount securely to UPI id or contact Nawalgarh Road reception at Sikar.
                  </p>
                </div>
              )}

              {/* Form to submit transaction ID for admin verification */}
              <form onSubmit={handleSubmitTransaction} className="space-y-3 border-t border-[rgba(255,255,255,0.06)] pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase block">
                    ENTER TRANSACTION ID / UPI REF NO. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12-Digit UPI Ref Number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] outline-none text-[#F8FAFC] placeholder-zinc-600 focus:border-[#3B82F6]"
                  />
                  <span className="text-[9px] text-[#94A3B8] leading-tight block">
                    Important: Director Akhil Sir will verify this Transaction ID manually in the administration log board to authorize your premium role.
                  </span>
                </div>

                {errorMessage && (
                  <div className="text-[10px] text-red-400 font-semibold bg-red-950/20 p-2.5 rounded-[10px] border border-red-900/30 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentState('plans')}
                    className="flex-1 py-1.5 border border-[rgba(255,255,255,0.06)] text-zinc-400 hover:text-white rounded-[12px] font-bold cursor-pointer transition-all"
                  >
                    Change Plan
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-[12px] font-extrabold uppercase shadow-md hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] cursor-pointer transition-all active:scale-95 text-[10px]"
                  >
                    Submit Reference
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* PROCESSING SCREEN */}
        {paymentState === 'processing' && (
          <div className="max-w-md mx-auto bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-10 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-[#3B82F6] animate-spin mx-auto" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">Connecting Security Nodes</h4>
            <p className="text-[10px] text-[#94A3B8] font-mono italic animate-pulse">
              Logging Transaction Ref into Encrypted Admin Ledgers...
            </p>
          </div>
        )}

        {/* SUCCESS OVERLAY */}
        {paymentState === 'success' && (
          <div className="max-w-md mx-auto bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 bg-[#0E1B35] border border-[#06B6D4]/40 text-[#06B6D4] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-white">Reference Submitted!</h4>
              <p className="text-[11px] text-[#94A3B8] mt-1.5 leading-relaxed">
                Your transaction ID <strong className="text-white">"{transactionId}"</strong> has been queued for verification.
                Your Premium Pass will be unlocked automatically as soon as the administrator verifies the bank ledger.
              </p>
            </div>

            <div className="p-3 bg-[#0B1220] rounded-[12px] border border-[rgba(255,255,255,0.06)] text-left space-y-1 text-[10px] text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Status: <strong className="text-amber-400">Pending Admin Verification</strong></span>
              </div>
              <p className="text-[9px] leading-tight text-[#94A3B8]">
                Note: You can check active verification statuses or request resets at the Sikar main desk.
              </p>
            </div>

            <button
              onClick={() => {
                setPaymentState('plans');
                if (onClose) onClose();
              }}
              className="w-full py-2 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] text-white rounded-[14px] text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-all active:scale-95"
            >
              Return to Portal
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
