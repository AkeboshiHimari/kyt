"use client";

import { motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

interface BoxRevealProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export function BoxReveal({
  children,
  duration = 1,
  delay = 0,
  onComplete,
  className = "",
}: BoxRevealProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [boxLeft, setBoxLeft] = useState(0);
  const [boxRight, setBoxRight] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* 원본 텍스트 (크기 측정용) */}
      <div className="relative">
        <span className="opacity-0 text-5xl font-bold">{children}</span>
        
        {/* 실제 표시되는 텍스트들 */}
        <div className="absolute inset-0">
          {/* 기본 텍스트 (박스 밖 영역) - 박스 왼쪽 */}
          <div
            className="absolute inset-0 text-foreground overflow-hidden text-5xl font-bold"
            style={{
              clipPath: `polygon(0% 0%, ${boxLeft}% 0%, ${boxLeft}% 100%, 0% 100%)`
            }}
          >
            {children}
          </div>
          
          {/* 기본 텍스트 (박스 밖 영역) - 박스 오른쪽 */}
          <div
            className="absolute inset-0 text-foreground overflow-hidden text-5xl font-bold"
            style={{
              clipPath: `polygon(${boxRight}% 0%, 100% 0%, 100% 100%, ${boxRight}% 100%)`
            }}
          >
            {children}
          </div>
          
          {/* 반전된 텍스트 (박스 안 영역) */}
          <div
            className="absolute text-background overflow-hidden text-5xl font-bold"
            style={{
              clipPath: `polygon(${boxLeft}% 0%, ${boxRight}% 0%, ${boxRight}% 100%, ${boxLeft}% 100%)`,
              background: 'var(--foreground)',
              transform: 'skew(-10deg)',
              left: '-10px',
              right: '-10px',
              top: '-10px',
              bottom: '-10px',
            }}
          >
            <div style={{ transform: 'skew(10deg)', padding: '10px' }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* 애니메이션 제어 */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ left: 0, right: 100 }}
          animate={{ 
            left: [0, 0, 100],
            right: [0, 100, 100]
          }}
          transition={{
            duration,
            times: [0, 0.6, 1],
            ease: [
              [0.25, 0.1, 0.25, 1],    // 늘어날 때: 빨랐다가 느려짐 (ease-out)
              [0.25, 0.1, 0.25, 1],    // 늘어나는 중간
              [0.55, 0.085, 0.68, 0.53] // 줄어들 때: 다시 빨라짐 (ease-in)
            ]
          }}
          onUpdate={(latest) => {
            const left = typeof latest.left === 'number' ? latest.left : 0;
            const right = typeof latest.right === 'number' ? latest.right : 100;
            
            setBoxLeft(left);
            setBoxRight(right);
          }}
          onAnimationComplete={() => {
            onComplete?.();
          }}
        />
      )}
    </div>
  );
}
