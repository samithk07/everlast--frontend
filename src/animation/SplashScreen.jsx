import React, { useEffect, useState } from "react";
const colors = {
  primary: "#00A9FF",
  deep: "#0077B6",
  secondary: "#89CFF3",
  accent: "#A0E9FF",
  background: "#CDF5FD",
  text: "#0B0C10",
};

function SplashScreen({
  logoSrc = "/logo.png",
  appName = "Everlast Water Solution",
  tagline = "Pure water, perfected",
  duration = 2600,
  onFinish,
}) {
  const [mounted, setMounted] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 500);
    const doneTimer = setTimeout(() => {
      setMounted(false);
      onFinish?.();
    }, duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onFinish]);

  if (!mounted) return null;

  return (
    <div
      className={`splash-root${exiting ? " splash-exit" : ""}`}
      style={{ background: `linear-gradient(180deg, ${colors.background} 0%, #eefbff 45%, #ffffff 100%)` }}
    >
      <style>{`
        .splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          opacity: 1;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .splash-root.splash-exit {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
        }
        .splash-drop {
          position: absolute;
          top: 8vh;
          width: clamp(14px, 3vmin, 20px);
          height: clamp(14px, 3vmin, 20px);
          background: ${colors.primary};
          border-radius: 0% 50% 50% 50%;
          opacity: 0;
          animation: splashDropFall 0.6s cubic-bezier(0.55, 0, 1, 0.45) 0.15s forwards;
        }
        @keyframes splashDropFall {
          0%   { opacity: 1; transform: rotate(45deg) translateY(-30vh) scale(0.8); }
          80%  { opacity: 1; transform: rotate(45deg) translateY(0) scale(1); }
          100% { opacity: 0; transform: rotate(45deg) translateY(6px) scale(0.4); }
        }
        .splash-ripple {
          position: absolute;
          border-radius: 50%;
          border: 2px solid ${colors.deep};
          opacity: 0;
        }
        .splash-ripple-1 { animation: splashRipple 1s ease-out 0.68s forwards; }
        .splash-ripple-2 { animation: splashRipple 1s ease-out 0.82s forwards; border-color: ${colors.primary}; }
        @keyframes splashRipple {
          0%   { opacity: 0.55; width: 6vmin; height: 6vmin; }
          100% { opacity: 0; width: 46vmin; height: 46vmin; }
        }
        .splash-logo-wrap {
          position: relative;
          z-index: 2;
          width: clamp(88px, 22vmin, 160px);
          height: clamp(88px, 22vmin, 160px);
          opacity: 0;
          animation: splashLogoIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.55s forwards;
        }
        @keyframes splashLogoIn {
          0%   { opacity: 0; transform: scale(0.3); }
          60%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        .splash-logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .splash-title {
          position: relative;
          z-index: 2;
          margin: clamp(14px, 3vmin, 22px) 0 0;
          font-size: clamp(1.05rem, 4vmin, 1.6rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${colors.text};
          text-align: center;
          padding: 0 1.25rem;
          opacity: 0;
          transform: translateY(10px);
          animation: splashFadeUp 0.5s ease-out 1.05s forwards;
        }
        .splash-tagline {
          position: relative;
          z-index: 2;
          margin: 6px 0 0;
          font-size: clamp(0.75rem, 2.4vmin, 0.95rem);
          color: ${colors.deep};
          text-align: center;
          padding: 0 1.5rem;
          opacity: 0;
          transform: translateY(8px);
          animation: splashFadeUp 0.5s ease-out 1.35s forwards;
        }
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .splash-loader {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 6px;
          margin-top: clamp(20px, 4vmin, 30px);
          opacity: 0;
          animation: splashFadeUp 0.4s ease-out 1.65s forwards;
        }
        .splash-loader span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${colors.primary};
          animation: splashBounceDot 1s ease-in-out infinite;
        }
        .splash-loader span:nth-child(2) { animation-delay: 0.15s; background: ${colors.deep}; }
        .splash-loader span:nth-child(3) { animation-delay: 0.3s; background: ${colors.secondary}; }
        @keyframes splashBounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-drop, .splash-ripple-1, .splash-ripple-2 { display: none; }
          .splash-logo-wrap, .splash-title, .splash-tagline, .splash-loader {
            animation: splashFadeUp 0.4s ease-out forwards !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="splash-drop" />
      <div className="splash-ripple splash-ripple-1" />
      <div className="splash-ripple splash-ripple-2" />

      <div className="splash-logo-wrap">
        <img src={logoSrc} alt={appName} />
      </div>

      <h1 className="splash-title">{appName}</h1>
      {tagline && <p className="splash-tagline">{tagline}</p>}

      <div className="splash-loader">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default SplashScreen;