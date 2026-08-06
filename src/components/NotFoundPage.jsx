import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGoToDashboard = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B3C5D] via-[#1D7A9C] to-[#1D7A9C] text-white">

      {/* Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/20 animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${6 + Math.random() * 14}px`,
              height: `${6 + Math.random() * 14}px`,
              animationDuration: `${6 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center px-6 max-w-md transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <h1 className="text-7xl font-bold tracking-wide drop-shadow-lg">404</h1>
        <p className="mt-3 text-lg text-white/80">
          Looks like this page drifted out to sea.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoToDashboard}
            className="px-6 py-3 bg-white text-[#0B3C5D] font-semibold rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-white/60 rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Waves */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] z-0">
        <svg
          className="w-full h-32 md:h-40 animate-wave-slow"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255,255,255,0.15)"
            d="M0,96L60,101.3C120,107,240,117,360,133.3C480,149,600,171,720,165.3C840,160,960,128,1080,117.3C1200,107,1320,117,1380,122.7L1440,128L1440,320L0,320Z"
          />
        </svg>
        <svg
          className="w-full h-24 md:h-32 -mt-16 md:-mt-20 animate-wave-fast"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255,255,255,0.35)"
            d="M0,160L48,144C96,128,192,96,288,101.3C384,107,480,149,576,160C672,171,768,149,864,133.3C960,117,1056,107,1152,112C1248,117,1344,139,1392,149.3L1440,160L1440,320L0,320Z"
          />
        </svg>
      </div>

      <style>{`
        @keyframes bubbleRise {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        .animate-bubble {
          bottom: -20px;
          animation-name: bubbleRise;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes waveShift {
          0% { transform: translateX(0); }
          50% { transform: translateX(-3%); }
          100% { transform: translateX(0); }
        }
        .animate-wave-slow { animation: waveShift 8s ease-in-out infinite; }
        .animate-wave-fast { animation: waveShift 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default NotFoundPage;