export default function TermsPage() {
	return (
		<div className="flex flex-col gap-6 h-full px-6 xl:px-8 py-8 max-w-4xl mx-auto">
			<div className="flex flex-col gap-4">
				<h1 className="text-4xl">약관</h1>
				<p className="text-muted-foreground">kyt 이용 약관</p>
			</div>

			<div className="flex flex-col gap-8 text-sm leading-relaxed">
				<div className="flex flex-col gap-2">
					<p className="text-muted-foreground">
						kyt(kyt-ps.com)(이하 사이트)는 사용자의 편입 시험 준비를 돕기 위한
						비영리적 학습 보조 도구입니다.
					</p>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">1. 목적</h2>
					<div className="flex flex-col gap-2">
						<ul className="flex flex-col gap-1">
							<li className="text-muted-foreground">
								1. 사이트는 사용자의 편입 시험 대비를 위한 개인용 학습 보조
								도구입니다.
							</li>
							<li className="text-muted-foreground">
								2. 사이트는 비영리적 목적으로 운영되며, 사이트 운영자가 사전에
								허가한 사용자만 이용할 수 있습니다.
							</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">2. 저작권</h2>
					<div className="flex flex-col gap-2">
						<ul className="flex flex-col gap-1">
							<li className="text-muted-foreground text-sm">
								1. 사이트는 학습 편의를 위해 교재의 '문제 번호'만을 제공합니다.
								사이트는 문제의 내용이나 이미지를 절대 제공하지 않습니다.
							</li>
							<li className="text-muted-foreground text-sm">
								2. 모든 문제의 저작권은 해당 교재의 원저작자에 있습니다.
							</li>
							<li className="text-muted-foreground text-sm">
								3. 사용자는 반드시 교재를 구입 및 소지한 상태에서 본 사이트를
								이용해야 합니다.
							</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">3. 서비스 및 정보의 한계</h2>
					<div className="flex flex-col gap-2">
						<ul className="flex flex-col gap-1">
							<li className="text-muted-foreground text-sm">
								1. 사이트에 등록된 문제들의 단원, 소단원, 문제 유형, 번호,
								난이도 정보는 오류가 있을 수 있습니다.
							</li>
							<li className="text-muted-foreground text-sm">
								2. 레이팅, 숙련도 및 정답/부분 정답/오답 여부는 사용자의 자가
								보고를 기반으로 합니다.
							</li>
							<li className="text-muted-foreground text-sm">
								3. 레이팅 및 숙련도는 사용자마다 개별적으로 평가되며, 다른
								이용자와의 상대적인 실력, 성취도의 차이를 반영하지 않습니다.
							</li>
							<li className="text-muted-foreground text-sm">
								4. 본 사이트의 이용은 시험의 합격이나 성적의 향상을 보장하지
								않으며, 학습의 최종적인 책임은 사용자 본인에게 있습니다.
							</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">4. 계정 및 데이터</h2>
					<div className="flex flex-col gap-2">
						<ul className="flex flex-col gap-1">
							<li className="text-muted-foreground text-sm">
								1. 사용자는 계정을 다른 사람에게 공유 및 양도할 수 없습니다.
							</li>
							<li className="text-muted-foreground text-sm">
								2. 사용자는 정답 여부를 정직하게 기록해야 합니다.
							</li>
							<li className="text-muted-foreground text-sm">
								3. 사이트는 서비스 운영 및 개인화(프로필) 서비스 제공을 위해
								사용자의 학습 기록(정답 여부, 풀이 시각 등)을 수집하며, 이
								데이터를 사용자의 동의 없이 외부에 공유하거나 판매하지 않습니다.
							</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">5. 금지 행위</h2>
					<div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              사용자는 다음 각 호에 해당하는 행위를 하여서는 안 됩니다.
            </p>
						<ul className="flex flex-col gap-1">
							<li className="text-muted-foreground text-sm">
								1. 다른 사용자의 계정을 부정하게 이용하는 행위
							</li>
							<li className="text-muted-foreground text-sm">
								2. 해킹, 악성코드 유포등 서비스의 정상적인 운영을 방해하는 행위
							</li>
							<li className="text-muted-foreground text-sm">
								3. 기타 대한민국의 법령에 저촉되는 행위
							</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">6. 부칙</h2>
					<div className="flex flex-col gap-2">
						<p className="text-muted-foreground text-sm">
							본 약관은 2025년 9월 8일(대한민국 표준시)부터 적용됩니다.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
