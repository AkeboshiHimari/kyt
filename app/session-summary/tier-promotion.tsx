"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { BoxReveal } from "@/components/ui/box-reveal";
import { TierBadge, getTierInfoUtil } from "@/components/ui/tier-badge";

interface TierPromotionProps {
  previousRating: number;
  newRating: number;
  onComplete: () => void;
}

// 티어 승급 확인 함수
function checkTierPromotion(previousRating: number, newRating: number) {
  const previousTier = getTierInfoUtil(previousRating);
  const newTier = getTierInfoUtil(newRating);
  
  // 티어 이름이 다르면 승급
  return previousTier.tier !== newTier.tier ? newTier : null;
}

export function TierPromotion({ previousRating, newRating, onComplete }: TierPromotionProps) {
  const promotedTier = checkTierPromotion(previousRating, newRating);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 승급이 없으면 렌더링하지 않음
  if (!promotedTier) {
    // 승급이 없으면 바로 완료 콜백 호출
    setTimeout(onComplete, 0);
    return null;
  }

  // BoxReveal 완료 후 2초 더 기다린 다음 onComplete 호출
  const handleBoxRevealComplete = () => {
    // 중복 호출 방지
    if (timeoutRef.current) return;
    
    timeoutRef.current = setTimeout(() => {
      onComplete();
    }, 3000); // BoxReveal 완료 후 2초 더 기다림
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="text-center space-y-8">
        {/* 축하 메시지 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <BoxReveal 
            duration={1.0}
            onComplete={handleBoxRevealComplete}
          >
            승급
          </BoxReveal>
          
          {/* 뱃지와 상세 정보는 BoxReveal 외부에 배치 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5, type: "spring", bounce: 0.4 }}
            className="flex justify-center items-center mt-8"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="flex justify-center items-center">
                <TierBadge 
                  rating={newRating} 
                  size="large" 
                  showRank={false} 
                  showGlow={true} 
                />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {promotedTier.tier}
                </p>
                <p className="text-sm text-muted-foreground">
                  {newRating} 점
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// 티어 승급 확인 유틸리티 함수 export
export function hasTierPromotion(previousRating: number, newRating: number): boolean {
  return checkTierPromotion(previousRating, newRating) !== null;
}
