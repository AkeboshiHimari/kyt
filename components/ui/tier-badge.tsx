// 티어 계산 함수
function getTierInfo(rating: number) {
	if (rating >= 1000) {
		return {
			tier: "Master",
			rank: "",
			badgeStyles: "master-aurora text-white border-2 border-white/30",
			iconColor: "text-yellow-300",
			glowClass: "tier-master-glow",
		};
	}

	const tiers = [
		{
			name: "Bronze",
			min: 0,
			max: 199,
			badgeStyles: "bg-gradient-to-br from-amber-600 to-orange-700 text-white border border-amber-400",
			iconColor: "text-amber-200",
			glowClass: "tier-bronze-glow",
		},
		{
			name: "Silver",
			min: 200,
			max: 399,
			badgeStyles: "bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600 text-white border border-gray-300",
			iconColor: "text-gray-200",
			glowClass: "tier-silver-glow",
		},
		{
			name: "Gold",
			min: 400,
			max: 599,
			badgeStyles: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white border border-yellow-300",
			iconColor: "text-yellow-100",
			glowClass: "tier-gold-glow",
		},
		{
			name: "Platinum",
			min: 600,
			max: 799,
			badgeStyles: "bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-600 text-white border border-cyan-300",
			iconColor: "text-cyan-100",
			glowClass: "tier-platinum-glow",
		},
		{
			name: "Diamond",
			min: 800,
			max: 999,
			badgeStyles: "bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white border-2 border-blue-300",
			iconColor: "text-blue-100",
			glowClass: "tier-diamond-glow",
		},
	];

	for (const tier of tiers) {
		if (rating >= tier.min && rating <= tier.max) {
			const rankNumber = Math.floor((rating - tier.min) / 40) + 1;
			const rankRoman = ["V", "IV", "III", "II", "I"][rankNumber - 1] || "V";
			return {
				tier: tier.name,
				rank: rankRoman,
				badgeStyles: tier.badgeStyles,
				iconColor: tier.iconColor,
				glowClass: tier.glowClass,
			};
		}
	}

	return {
		tier: "Bronze",
		rank: "V",
		badgeStyles: "bg-gradient-to-br from-amber-600 to-orange-700 text-white border border-amber-400",
		iconColor: "text-amber-200",
		glowClass: "tier-bronze-glow",
	};
}

interface TierBadgeProps {
	rating: number;
	size?: 'small' | 'medium' | 'large';
	showRank?: boolean;
	showGlow?: boolean;
}

export function TierBadge({ 
	rating, 
	size = 'medium', 
	showRank = true, 
	showGlow = true 
}: TierBadgeProps) {
	const tierInfo = getTierInfo(rating);
	
	// 크기별 설정
	const sizeConfig = {
		small: {
			container: 'w-12 h-12',
			rank: 'text-xs px-1.5 py-0.5 -bottom-0.5 -right-0.5',
		},
		medium: {
			container: 'w-16 h-16',
			rank: 'text-xs px-2 py-1 -bottom-1 -right-1',
		},
		large: {
			container: 'w-20 h-20',
			rank: 'text-xs px-2 py-1 -bottom-1 -right-1',
		},
	};

	const config = sizeConfig[size];

	return (
		<div className={`relative flex items-center justify-center ${showGlow ? tierInfo.glowClass : ''}`}>
			{/* 메인 뱃지 - 티어별 다른 모양 */}
			{tierInfo.tier === "Master" ? (
				// 육각형 뱃지
				<div className={`relative ${config.container} ${tierInfo.badgeStyles} transform transition-transform hover:scale-105 mx-auto`}
					style={{
						clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
					}}>
					<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"
						style={{
							clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
						}} />
				</div>
			) : tierInfo.tier === "Diamond" ? (
				// 오각형 뱃지
				<div className={`relative ${config.container} ${tierInfo.badgeStyles} transform transition-transform hover:scale-105 mx-auto`}
					style={{
						clipPath: "polygon(50% 0%, 95% 35%, 80% 95%, 20% 95%, 5% 35%)"
					}}>
					<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"
						style={{
							clipPath: "polygon(50% 0%, 95% 35%, 80% 95%, 20% 95%, 5% 35%)"
						}} />
				</div>
			) : tierInfo.tier === "Platinum" || tierInfo.tier === "Gold" ? (
				// 마름모 뱃지 - 컨테이너를 더 크게 해서 회전 시 중앙 정렬 유지
				<div className="flex items-center justify-center" style={{ width: `${size === 'large' ? '80px' : size === 'medium' ? '64px' : '48px'}`, height: `${size === 'large' ? '80px' : size === 'medium' ? '64px' : '48px'}` }}>
					<div className={`relative ${config.container} ${tierInfo.badgeStyles} transform rotate-45 transition-transform hover:scale-105`}>
						<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
					</div>
				</div>
			) : (
				// 삼각형 뱃지 (Bronze, Silver)
				<div className={`relative ${config.container} ${tierInfo.badgeStyles} transform transition-transform hover:scale-105 mx-auto`}
					style={{
						clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
					}}>
					<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"
						style={{
							clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
						}} />
				</div>
			)}
			
			{/* 랭크 표시 */}
			{showRank && tierInfo.rank && (
				<div className={`absolute ${config.rank} font-bold rounded-full shadow-lg ${
					tierInfo.tier === "Master" 
						? "bg-gradient-to-br from-yellow-200 to-yellow-300 text-gray-800 border-2 border-yellow-400 shadow-yellow-400/50" 
						: tierInfo.tier === "Diamond"
						? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 border-2 border-blue-300 shadow-blue-300/50"
						: tierInfo.tier === "Platinum"
						? "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-800 border-2 border-cyan-300 shadow-cyan-300/50"
						: tierInfo.tier === "Gold"
						? "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300 shadow-yellow-300/50"
						: tierInfo.tier === "Silver"
						? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border-2 border-gray-300 shadow-gray-300/50"
						: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 border-2 border-amber-300 shadow-amber-300/50"
				}`}>
					{tierInfo.rank}
				</div>
			)}
		</div>
	);
}

// 티어 정보만 가져오는 유틸리티 함수
export function getTierInfoUtil(rating: number) {
	return getTierInfo(rating);
}
