import React, { useState, useEffect } from 'react';
import { Zap, Clock, Copy, Check, X } from 'lucide-react';

export const FlashSaleBanner: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 3,
        minutes: 42,
        seconds: 18,
    });
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return { hours: 4, minutes: 0, seconds: 0 }; // Reset
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!isVisible) return null;

    const handleCopyCode = () => {
        navigator.clipboard.writeText('TECH5000');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatNum = (num: number) => String(num).padStart(2, '0');

    return (
        <aside aria-label="Flash sale announcement" className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs py-2 px-4 shadow-xs z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-center">
                    <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full shadow-2xs">
                        <Zap className="h-3 w-3 fill-current" />
                        Flash Drop
                    </span>

                    <span className="font-medium text-blue-100 hidden sm:inline">
                        Save up to ₹5,000 on flagship devices with code:
                    </span>

                    <button
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1 font-mono font-bold bg-white/20 hover:bg-white/30 border border-white/30 px-2.5 py-0.5 rounded-md text-white transition-colors cursor-pointer"
                        title="Click to copy promo code"
                    >
                        <span>TECH5000</span>
                        {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3 opacity-70" />}
                    </button>

                    {/* Live Ticking Countdown */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-full border border-white/10 text-amber-300">
                        <Clock className="h-3 w-3" />
                        <span>{formatNum(timeLeft.hours)}h : {formatNum(timeLeft.minutes)}m : {formatNum(timeLeft.seconds)}s</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/60 hover:text-white p-1 rounded-md transition-colors shrink-0"
                    title="Dismiss"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </aside>
    );
};
