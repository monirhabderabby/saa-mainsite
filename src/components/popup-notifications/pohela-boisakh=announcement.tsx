"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";

interface Props {
  employeeId: string;
}

export function PohelaBoishakhAnnouncement({ employeeId }: Props) {
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    if (!employeeId) return;

    const cookieKey = `has-seen-boishakh-1433-${employeeId}`;
    const hasSeen = Cookies.get(cookieKey);

    if (hasSeen) return;

    const timer = setTimeout(() => {
      setShowAnnouncement(true);
      // Set cookie only when we actually show it
      Cookies.set(cookieKey, "true", { expires: 365, sameSite: "lax" });
    }, 600);

    return () => clearTimeout(timer);
  }, [employeeId]);

  // Early return - nothing to show
  if (!showAnnouncement) return null;

  const handleClose = () => setShowAnnouncement(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&family=Hind+Siliguri:wght@400;500;600&display=swap');

        @keyframes bsh-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bsh-slideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bsh-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes bsh-float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-6px) rotate(-4deg); }
        }
        @keyframes bsh-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bsh-shimmer {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes bsh-draw {
          from { stroke-dashoffset: 500; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes bsh-petal {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50%       { transform: scale(1.08) rotate(5deg); }
        }

        .bsh-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(20, 8, 0, 0.65);
          backdrop-filter: blur(6px);
          animation: bsh-fadeIn 0.4s ease both;
        }

        .bsh-card {
          position: relative;
          width: 100%;
          max-width: 580px;
          background: #FFFAF2;
          border-radius: 28px;
          border: 2px solid #D4890A;
          padding: 2.25rem 2rem 2rem;
          overflow: hidden;
          animation: bsh-slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
          font-family: 'Hind Siliguri', sans-serif;
        }

        .bsh-alpona-tl {
          position: absolute;
          top: 0; left: 0;
          width: 110px; height: 110px;
          opacity: 0.2;
          pointer-events: none;
        }
        .bsh-alpona-br {
          position: absolute;
          bottom: 0; right: 0;
          width: 110px; height: 110px;
          opacity: 0.2;
          pointer-events: none;
          transform: rotate(180deg);
        }

        .bsh-alpona-path {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: bsh-draw 2s ease 0.6s forwards;
        }
        .bsh-alpona-path2 {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: bsh-draw 2s ease 0.9s forwards;
        }

        .bsh-sun {
          position: absolute;
          top: -14px;
          right: 40px;
          width: 64px; height: 64px;
          pointer-events: none;
          animation: bsh-float 4s ease-in-out infinite;
        }
        .bsh-sun-rays {
          transform-origin: 32px 32px;
          animation: bsh-spin 14s linear infinite;
        }

        .bsh-close {
          position: absolute;
          top: 16px; right: 16px;
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 1.5px solid #D4890A;
          background: transparent;
          cursor: pointer;
          color: #D4890A;
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 10;
        }
        .bsh-close:hover { background: #D4890A22; }

        .bsh-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #F5A623;
          border-radius: 100px;
          padding: 5px 16px;
          margin-bottom: 16px;
        }
        .bsh-badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #7B2D00;
          animation: bsh-shimmer 1.8s ease infinite;
        }
        .bsh-badge-text {
        font-family: 'Noto Serif Bengali', serif;
          font-size: 12px;
          font-weight: 600;
          color: #1a0a00;
          letter-spacing: 0.03em;
        }

        .bsh-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: start;
        }

        .bsh-title {
          font-family: 'Noto Serif Bengali', serif;
          font-size: 28px;
          font-weight: 700;
          color: #7B2D00;
          margin: 0 0 6px;
          line-height: 1.3;
        }
        .bsh-subtitle {
        font-family: 'Noto Serif Bengali', serif;
          font-size: 13px;
          color: #B5650A;
          margin: 0 0 14px;
          font-weight: 500;
        }
        .bsh-body {
          font-size: 13px;
          color: #5a3a10;
          line-height: 1.8;
          margin: 0 0 20px;
        }

        .bsh-benefits {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 22px;
        }
        .bsh-benefit-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bsh-benefit-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: #FFF0D4;
          border: 1px solid #E8C87044;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bsh-benefit-text {
          font-size: 12.5px;
          color: #5a3a10;
          line-height: 1.5;
        }

        .bsh-footer {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .bsh-cta {
          height: 42px;
          padding: 0 24px;
          border-radius: 14px;
          background: #D4890A;
          color: #fff;
          border: none;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Hind Siliguri', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .bsh-cta:hover { background: #B8750A; }
        .bsh-cta:active { transform: scale(0.97); }

        .bsh-skip {
          font-size: 12px;
          color: #B5650A;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'Hind Siliguri', sans-serif;
          transition: text-decoration 0.1s;
        }
        .bsh-skip:hover { text-decoration: underline; }

        .bsh-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding-top: 4px;
        }

        .bsh-date-badge {
          background: #FFF0D4;
          border: 1.5px solid #D4890A;
          border-radius: 14px;
          padding: 8px 18px;
          text-align: center;
          min-width: 76px;
        }
        .bsh-date-num {
          font-family: 'Noto Serif Bengali', serif;
          font-size: 26px;
          font-weight: 700;
          color: #7B2D00;
          line-height: 1;
        }
        .bsh-date-label {
          font-size: 11px;
          color: #B5650A;
          font-weight: 500;
          margin-top: 2px;
        }

        .bsh-fish {
          animation: bsh-float2 3s ease-in-out infinite;
        }
        .bsh-flower {
          animation: bsh-petal 3.5s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        @media (max-width: 480px) {
          .bsh-card { padding: 1.75rem 1.25rem 1.5rem; }
          .bsh-title { font-size: 22px; }
          .bsh-grid { grid-template-columns: 1fr; }
          .bsh-right { flex-direction: row; justify-content: center; }
          .bsh-sun { right: 20px; }
        }
      `}</style>

      <div
        className="bsh-overlay"
        onClick={(e) => e.target === e.currentTarget && handleClose}
      >
        <div className="bsh-card">
          {/* Alpona corners */}
          <svg className="bsh-alpona-tl" viewBox="0 0 110 110">
            <path
              className="bsh-alpona-path"
              d="M12 98 Q12 12 98 12"
              fill="none"
              stroke="#D4890A"
              strokeWidth="2"
            />
            <path
              className="bsh-alpona-path2"
              d="M24 98 Q24 24 98 24"
              fill="none"
              stroke="#D4890A"
              strokeWidth="1.2"
            />
            <circle cx="12" cy="98" r="3.5" fill="#D4890A" opacity="0.6" />
            <circle cx="98" cy="12" r="3.5" fill="#D4890A" opacity="0.6" />
            <circle cx="55" cy="12" r="2" fill="#F5A623" opacity="0.7" />
            <circle cx="12" cy="55" r="2" fill="#F5A623" opacity="0.7" />
          </svg>
          <svg className="bsh-alpona-br" viewBox="0 0 110 110">
            <path
              className="bsh-alpona-path"
              d="M12 98 Q12 12 98 12"
              fill="none"
              stroke="#D4890A"
              strokeWidth="2"
            />
            <path
              className="bsh-alpona-path2"
              d="M24 98 Q24 24 98 24"
              fill="none"
              stroke="#D4890A"
              strokeWidth="1.2"
            />
            <circle cx="12" cy="98" r="3.5" fill="#D4890A" opacity="0.6" />
            <circle cx="98" cy="12" r="3.5" fill="#D4890A" opacity="0.6" />
          </svg>

          {/* Floating sun */}
          <svg className="bsh-sun" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="14" fill="#F5A623" />
            <g className="bsh-sun-rays">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={deg}
                  x1="32"
                  y1="6"
                  x2="32"
                  y2="1"
                  stroke="#F5A623"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 32 32)`}
                />
              ))}
            </g>
          </svg>

          {/* Close button */}
          <button
            className="bsh-close"
            onClick={() => handleClose()}
            aria-label="বন্ধ করুন"
          >
            ×
          </button>

          {/* Badge */}
          <div>
            <div className="bsh-badge">
              <span className="bsh-badge-dot" />
              <span className="bsh-badge-text">শুভ নববর্ষ ১৪৩৩</span>
            </div>
          </div>

          <div className="bsh-grid">
            {/* Left content */}
            <div>
              <p className="bsh-title">
                পহেলা বৈশাখের
                <br />
                শুভেচ্ছা 🌸
              </p>
              <p className="bsh-subtitle">১৪ এপ্রিল ২০২৬ — বাংলা নববর্ষ</p>
              <p className="bsh-body">
                SAA পরিবারের পক্ষ থেকে আপনাকে ও আপনার প্রিয়জনদের জানাই নতুন
                বছরের আন্তরিক শুভেচ্ছা। নতুন বছর হোক আনন্দে ও সমৃদ্ধিতে ভরা।
              </p>

              <div className="bsh-footer">
                <button className="bsh-cta" onClick={() => handleClose()}>
                  শুভ নববর্ষ! 🎉
                </button>
                <button className="bsh-skip" onClick={() => handleClose()}>
                  পরে দেখব
                </button>
              </div>
            </div>

            {/* Right column */}
            <div className="bsh-right">
              {/* Date badge */}
              <div className="bsh-date-badge">
                <div className="bsh-date-num">১৪</div>
                <div className="bsh-date-label">এপ্রিল</div>
              </div>

              {/* Ilish fish */}
              <svg
                className="bsh-fish"
                width="76"
                height="76"
                viewBox="0 0 76 76"
                fill="none"
              >
                <ellipse
                  cx="36"
                  cy="38"
                  rx="23"
                  ry="11.5"
                  fill="#E8A020"
                  opacity="0.9"
                  transform="rotate(-15 36 38)"
                />
                <path d="M13 38 Q4 27 7 38 Q4 49 13 38Z" fill="#D4890A" />
                <path
                  d="M30 26 Q38 19 44 26"
                  fill="none"
                  stroke="#B8720A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="54" cy="35" r="2.8" fill="#fff" />
                <circle cx="54.6" cy="35" r="1.3" fill="#3a1a00" />
                <path
                  d="M31 33 Q33 29 37 31"
                  fill="none"
                  stroke="#B8720A"
                  strokeWidth="0.9"
                  opacity="0.6"
                />
                <path
                  d="M37 36 Q39 32 43 34"
                  fill="none"
                  stroke="#B8720A"
                  strokeWidth="0.9"
                  opacity="0.6"
                />
                <path
                  d="M29 40 Q31 36 35 38"
                  fill="none"
                  stroke="#B8720A"
                  strokeWidth="0.9"
                  opacity="0.6"
                />
              </svg>

              {/* Mustard flower */}
              <svg
                className="bsh-flower"
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
              >
                <circle cx="22" cy="22" r="5.5" fill="#F5A623" />
                <ellipse
                  cx="22"
                  cy="10"
                  rx="4"
                  ry="7"
                  fill="#F5CE45"
                  opacity="0.85"
                />
                <ellipse
                  cx="22"
                  cy="34"
                  rx="4"
                  ry="7"
                  fill="#F5CE45"
                  opacity="0.85"
                />
                <ellipse
                  cx="10"
                  cy="22"
                  rx="7"
                  ry="4"
                  fill="#F5CE45"
                  opacity="0.85"
                />
                <ellipse
                  cx="34"
                  cy="22"
                  rx="7"
                  ry="4"
                  fill="#F5CE45"
                  opacity="0.85"
                />
                <ellipse
                  cx="14"
                  cy="14"
                  rx="4"
                  ry="7"
                  fill="#EDB820"
                  opacity="0.7"
                  transform="rotate(-45 14 14)"
                />
                <ellipse
                  cx="30"
                  cy="14"
                  rx="4"
                  ry="7"
                  fill="#EDB820"
                  opacity="0.7"
                  transform="rotate(45 30 14)"
                />
                <ellipse
                  cx="14"
                  cy="30"
                  rx="4"
                  ry="7"
                  fill="#EDB820"
                  opacity="0.7"
                  transform="rotate(45 14 30)"
                />
                <ellipse
                  cx="30"
                  cy="30"
                  rx="4"
                  ry="7"
                  fill="#EDB820"
                  opacity="0.7"
                  transform="rotate(-45 30 30)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
