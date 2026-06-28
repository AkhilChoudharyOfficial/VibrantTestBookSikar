import React, { useState } from 'react';
import { TestSeries, UserProfile } from '../types';
import { ShieldCheck, QrCode, CreditCard, Landmark, CheckCircle2, RefreshCw, Mail } from 'lucide-react';
import { appendAuditLog } from '../dataStore';

interface PaymentGatewayProps {
  user: UserProfile | null;
  targetTest: TestSeries | null; // Null means purchasing Full VIP Premium Pass
  onClose: () => void;
  onPaymentSuccess: (isFullPass: boolean, testId?: string) => void;
}

type PayMethod = 'upi' | 'card' | 'banking';
type PayState = 'checkout' | 'processing' | 'success';

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  user,
  targetTest,
  onClose,
  onPaymentSuccess
}) => {
  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [payState, setPayState] = useState<PayState>('checkout');
  const [bankingStatus, setBankingStatus] = useState<string>('');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Net banking bank
  const [selectedBank, setSelectedBank] = useState('SBI');

  if (!user) return null;

  const cost = targetTest ? targetTest.price : 199; // Full Access VIP Pass is ₹199
  const purchaseTitle = targetTest 
    ? `Individual Mock: ${targetTest.title}` 
    : 'Vibrant Sikar Main VIP Pass (All Mock Exams + Study Handouts)';

  const handleSimulatePayment = () => {
    setPayState('processing');
    setBankingStatus('Initiating secure AES-256 handshake...');
    
    setTimeout(() => {
      setBankingStatus('Contacting UPI/NPCI settlement network...');
      
      setTimeout(() => {
        setBankingStatus('Verifying ID Card & Student Roll Number details...');
        
        setTimeout(() => {
          // Success! Update DB and log audit
          const testId = targetTest?.id;
          onPaymentSuccess(targetTest ? false : true, testId);
          
          appendAuditLog(
            'SECURE_TRANSACTION_SUCCESSFUL', 
            user.email, 
            user.role, 
            `Payment processed securely. Amount: ₹${cost}. Module: ${purchaseTitle}. Transaction ID: VBT-${Math.floor(Math.random() * 900000 + 100000)}`, 
            'INFO'
          );
          
          setPayState('success');
        }, 1200);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      
      {/* Checkout Container */}
      <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] w-full max-w-lg shadow-[0_12px_40px_rgb(0,0,0,0.5)] overflow-hidden text-xs text-[#F8FAFC]">
        
        {/* Step 1: CHECKOUT SCREEN */}
        {payState === 'checkout' && (
          <div>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white p-4.5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-white">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#06B6D4]" />
                  Vibrant Secure Billing Portal
                </h3>
                <p className="text-[10px] text-[#F8FAFC]/80 font-mono">PCI-DSS Compliant Transaction Terminal</p>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:text-[#06B6D4] font-bold font-mono text-base cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Price block info */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[#0B1220]">
              <span className="text-[9px] font-bold uppercase text-[#06B6D4] block font-mono">ITEM TO ENROLL</span>
              <h4 className="font-bold text-[#F8FAFC] text-xs mt-1 leading-snug">{purchaseTitle}</h4>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[rgba(255,255,255,0.08)]">
                <span className="text-[#94A3B8] text-[10px] uppercase font-bold">Net Payable Amount:</span>
                <span className="text-sm font-black text-[#06B6D4]">₹{cost}.00 INR</span>
              </div>
            </div>

            {/* Payment tab selections */}
            <div className="p-4">
              <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-2.5">Choose Payment Instrument</span>
              
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {[
                  { id: 'upi', label: 'UPI / QR Scan', icon: QrCode },
                  { id: 'card', label: 'Cards', icon: CreditCard },
                  { id: 'banking', label: 'Net Banking', icon: Landmark }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPayMethod(opt.id as any)}
                    className={`p-2.5 rounded-[12px] border flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer ${
                      payMethod === opt.id
                        ? 'border-[#3B82F6] bg-[#0B1220] text-[#06B6D4]'
                        : 'border-[rgba(255,255,255,0.08)] text-[#94A3B8] bg-[#111827] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <opt.icon className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-[10px]">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Option Detail panel */}
              {payMethod === 'upi' && (
                <div className="border border-[rgba(255,255,255,0.08)] p-3 rounded-[12px] text-center space-y-2.5 bg-[#0B1220]/50">
                  <p className="text-[10px] text-[#06B6D4] font-bold">Scan QR with GPay, PhonePe, BHIM, or Paytm</p>
                  
                  {/* Scaled Dynamic QR code vector representation */}
                  <div className="w-28 h-28 bg-white border border-[rgba(255,255,255,0.08)] mx-auto rounded-lg p-2 flex items-center justify-center relative shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#0B1220]">
                      {/* Outer anchor boxes */}
                      <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="11" y="11" width="13" height="13" fill="currentColor" />
                      
                      <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="76" y="11" width="13" height="13" fill="currentColor" />
                      
                      <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="11" y="76" width="13" height="13" fill="currentColor" />

                      {/* Random QR pixels simulation */}
                      <rect x="40" y="5" width="10" height="10" fill="currentColor" />
                      <rect x="55" y="15" width="10" height="20" fill="currentColor" />
                      <rect x="40" y="45" width="20" height="10" fill="currentColor" />
                      <rect x="75" y="45" width="15" height="15" fill="currentColor" />
                      <rect x="70" y="75" width="25" height="10" fill="currentColor" />
                      <rect x="45" y="70" width="10" height="25" fill="currentColor" />
                    </svg>
                    {/* Tiny center label */}
                    <span className="absolute bg-[#111827] text-[#06B6D4] text-[6px] font-black px-1.5 py-0.5 rounded shadow border border-[rgba(255,255,255,0.08)]">
                      VIBRANT
                    </span>
                  </div>

                  <div className="text-[10px] text-[#94A3B8] font-medium font-mono">
                    UPI ID: <strong className="text-[#06B6D4]">vibrant@upi</strong>
                  </div>
                </div>
              )}

              {payMethod === 'card' && (
                <div className="space-y-3 border border-[rgba(255,255,255,0.08)] p-3.5 rounded-[12px] bg-[#0B1220]/50">
                  <div>
                    <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] outline-none text-[#F8FAFC] placeholder-[#94A3B8]/30 focus:border-[#3B82F6]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] outline-none text-[#F8FAFC] placeholder-[#94A3B8]/30 focus:border-[#3B82F6]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">CVV Security</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] outline-none text-[#F8FAFC] placeholder-[#94A3B8]/30 focus:border-[#3B82F6] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === 'banking' && (
                <div className="border border-[rgba(255,255,255,0.08)] p-3.5 rounded-[12px] bg-[#0B1220]/50">
                  <label className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">Select Bank Portal</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] font-bold text-xs text-[#F8FAFC] focus:border-[#3B82F6] outline-none"
                  >
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="HDFC">HDFC Bank Limited</option>
                    <option value="ICICI">ICICI Bank Limited</option>
                    <option value="AXIS">Axis Bank Limited</option>
                    <option value="PNB">Punjab National Bank (PNB)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Footer with checkout triggers */}
            <div className="p-4 bg-[#0B1220] flex items-center justify-between border-t border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
                <span>256-Bit SSL Encrypted</span>
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 border border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:text-[#F8FAFC] rounded-[14px] font-bold text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSimulatePayment}
                  className="px-5 py-1.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-[14px] font-bold shadow-md hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] text-xs uppercase tracking-wide cursor-pointer transition-all active:scale-95"
                >
                  Authorize Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: PROCESSING STATE SCREEN */}
        {payState === 'processing' && (
          <div className="p-10 text-center space-y-3.5">
            <RefreshCw className="w-8 h-8 text-[#3B82F6] animate-spin mx-auto" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">Securing Payment Channel</h4>
            <p className="text-[10px] text-[#94A3B8] font-mono italic animate-pulse">
              {bankingStatus}
            </p>
          </div>
        )}

        {/* Step 3: SUCCESS OVERLAY SCREEN */}
        {payState === 'success' && (
          <div className="p-6 text-center space-y-5">
            <div className="w-12 h-12 bg-[#0B1220] border border-[#06B6D4]/40 text-[#06B6D4] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-[#F8FAFC]">Transaction Cleared</h4>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Roll verification success. Premium permissions and handbooks have been unlocked instantly.
              </p>
            </div>

            {/* Mock automatic email dispatch log */}
            <div className="bg-[#0B1220] p-3.5 rounded-[12px] border border-[rgba(255,255,255,0.08)] text-left space-y-1.5">
              <span className="text-[9px] font-bold uppercase text-[#06B6D4] flex items-center gap-1 font-mono">
                <Mail className="w-3.5 h-3.5" />
                <span>VIBRANT AUTO-NOTIFICATION ENGINE</span>
              </span>
              <p className="text-[10px] text-[#94A3B8] leading-normal">
                An confirmation receipt with mock login credentials and offline batch schedules has been sent to: 
                <strong className="text-[#06B6D4] block mt-0.5">{user.email}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] text-white rounded-[14px] text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-all active:scale-95"
            >
              Enter VIP Dashboard
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
