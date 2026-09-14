"use client";

import React, { useState } from "react";
import { useEdifyStore } from "@/lib/store";

export default function CreatorEarningsDrawer() {
  const isEarningsModalOpen = useEdifyStore((s) => s.isEarningsModalOpen);
  const setEarningsModalOpen = useEdifyStore((s) => s.setEarningsModalOpen);
  const userWallet = useEdifyStore((s) => s.userWallet);
  const requestPayout = useEdifyStore((s) => s.requestPayout);
  const statements = useEdifyStore((s) => s.statements);

  const [payoutResult, setPayoutResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isEarningsModalOpen) return null;

  const withdrawableUSD = (userWallet.withdrawableCents / 100).toFixed(2);
  const lifetimeUSD = (userWallet.lifetimeEarnedCents / 100).toFixed(2);
  const pendingUSD = (userWallet.pendingPayoutCents / 100).toFixed(2);
  const minPayoutUSD = 50.0;
  const progressPercent = Math.min(100, (userWallet.withdrawableCents / 5000) * 100);
  const isEligible = userWallet.withdrawableCents >= 5000;

  const userStatements = statements.filter((s) => s.authorId === "user-123");

  const handlePayout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = requestPayout(userWallet.withdrawableCents);
      setPayoutResult(res);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#130F24]/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#241738]/90 border border-[#F4A261]/35 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden relative"
        style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
      >
        {/* Top Gold Gradient Trim */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D1634D] via-[#F4A261] to-[#FDE68A]" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <h2 className="text-xl font-bold text-[#FDE68A]" style={{ fontFamily: "var(--font-fraunces), serif" }}>
                Creator Income & Payouts
              </h2>
            </div>
            <p className="text-xs text-[#E2D9F3]/70 mt-0.5">
              Turn your thoughts, perspectives & citizen reports into peaceful community revenue.
            </p>
          </div>
          <button
            onClick={() => setEarningsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#E2D9F3] flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Earnings Dashboard Card */}
          <div className="bg-gradient-to-br from-[#3E2C5B]/80 to-[#1A162B]/80 border border-[#F4A261]/25 rounded-2xl p-5 shadow-inner">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#E2D9F3]/60 font-semibold">Withdrawable Balance</span>
                <div className="text-3xl font-extrabold text-[#FFFDF9] mt-0.5" style={{ fontFamily: "var(--font-fraunces), serif" }}>
                  ${withdrawableUSD}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-[#86EFAC] font-semibold">80% Creator Share</span>
                <div className="text-xs text-[#E2D9F3]/60 mt-1">20% Platform fee auto-deducted</div>
              </div>
            </div>

            {/* $50 Threshold Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#E2D9F3]/80">Progress to Minimum Payout ($50.00)</span>
                <span className={isEligible ? "text-[#86EFAC] font-bold" : "text-[#F4A261]"}>
                  {isEligible ? "Threshold Reached ✓" : `${progressPercent.toFixed(0)}%`}
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    background: isEligible
                      ? "linear-gradient(90deg, #86EFAC, #FDE68A)"
                      : "linear-gradient(90deg, #D97359, #F4A261)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-xs text-[#E2D9F3]/60">Lifetime Earned</span>
              <div className="text-base font-bold text-[#FDE68A] mt-0.5">${lifetimeUSD}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-xs text-[#E2D9F3]/60">Pending Settlement</span>
              <div className="text-base font-bold text-[#93C5FD] mt-0.5">${pendingUSD}</div>
            </div>
          </div>

          {/* Payout Result Alert */}
          {payoutResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                payoutResult.success
                  ? "bg-[#86EFAC]/15 border border-[#86EFAC]/30 text-[#86EFAC]"
                  : "bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#FCA5A5]"
              }`}
            >
              <span>{payoutResult.success ? "✨" : "⚠️"}</span>
              <div className="leading-relaxed">{payoutResult.message}</div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handlePayout}
            disabled={!isEligible || isProcessing}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
              isEligible
                ? "bg-gradient-to-r from-[#F4A261] to-[#FDE68A] text-[#1C152B] hover:shadow-[0_0_25px_rgba(253,230,138,0.5)] hover:scale-[1.02] cursor-pointer"
                : "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
            }`}
          >
            {isProcessing ? (
              <span>Processing Transfer...</span>
            ) : isEligible ? (
              <span>⚡ Collect Payout (${withdrawableUSD})</span>
            ) : (
              <span>Reach $50.00 to Collect Payout (Need ${(minPayoutUSD - Number(withdrawableUSD)).toFixed(2)} more)</span>
            )}
          </button>

          {/* Peace of Mind Notice */}
          <p className="text-[11px] text-center text-[#E2D9F3]/50 leading-normal">
            Payouts are transferred directly to your verified bank / debit card via Stripe Connect.
            Edify takes 20% to maintain global decentralized infrastructure and zero-ad serenity.
          </p>
        </div>
      </div>
    </div>
  );
}
