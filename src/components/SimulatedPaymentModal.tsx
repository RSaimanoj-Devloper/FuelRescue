import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, ShieldCheck, CheckCircle2, AlertTriangle, X, Printer, ArrowRight } from 'lucide-react';
import { AssistanceRequest, PaymentMethod } from '../types';
import { api } from '../services/api';

interface SimulatedPaymentModalProps {
  request: AssistanceRequest;
  onPaymentSuccess: (request: AssistanceRequest) => void;
  onClose: () => void;
}

export const SimulatedPaymentModal: React.FC<SimulatedPaymentModalProps> = ({
  request,
  onPaymentSuccess,
  onClose
}) => {
  const [method, setMethod] = useState<PaymentMethod>('UPI_GPAY_PHONEPE');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [receiptRef, setReceiptRef] = useState<string>('');

  const qty = request.requestedQuantity || 5;
  const fuelCost = Math.round((request.fuelType === 'DIESEL' ? 97.82 : 109.66) * qty);
  const serviceFee = request.serviceType === 'TOW_TRUCK' ? 1450 : request.serviceType === 'MECHANIC' ? 650 : 250;
  const totalAmount = request.serviceType === 'FUEL' ? fuelCost + serviceFee : serviceFee;

  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await api.simulatePayment(request.id, method);
      setReceiptRef(res.transactionReference);
      setCompleted(true);
      const updatedReq = {
        ...request,
        paymentStatus: 'SIMULATED_SUCCESS' as const,
        paymentMethod: method,
        transactionReference: res.transactionReference
      };
      onPaymentSuccess(updatedReq);
    } catch (e) {
      alert('Payment processing error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
              Sandbox Test Gateway
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Emergency Fuel Assistance Checkout
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sandbox Notice Banner */}
        <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Notice:</strong> This is an explicitly simulated payment workflow for testing and verification. No actual funds are charged to your account.
          </div>
        </div>

        {!completed ? (
          <div className="mt-5 space-y-4">
            {/* Price Breakdown */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Emergency Fuel ({request.requestedQuantity}L {request.fuelType} @ ₹{request.fuelType === 'PETROL' ? '109.66' : '97.82'}/L)</span>
                <span className="font-semibold text-white">₹{fuelCost}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Highway Rapid Delivery & Approved Canister Service</span>
                <span className="font-semibold text-white">₹{serviceFee}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Amount Due</span>
                <span className="text-orange-400">₹{totalAmount}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMethod('UPI_GPAY_PHONEPE')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'UPI_GPAY_PHONEPE'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>UPI / GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('DEBIT_CREDIT_CARD')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'DEBIT_CREDIT_CARD'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Cards / NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CASH_ON_DELIVERY')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'CASH_ON_DELIVERY'
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>Cash on Handover</span>
                </button>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full mt-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              {processing ? 'Processing Simulated Transaction...' : `Confirm Simulated Payment (₹${totalAmount})`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Receipt View */
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Payment Recorded (Simulated)</h4>
              <p className="text-xs text-emerald-200">
                Transaction reference generated. Fuel delivery hand-off verified.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Request ID:</span>
                <span className="text-white font-bold">{request.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Ref:</span>
                <span className="text-orange-400">{receiptRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="text-slate-200">{method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-emerald-400 font-bold">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
              >
                Return to Tracker
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
