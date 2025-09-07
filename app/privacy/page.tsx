

export default function PrivacyPage() {
	return (
		<div className="flex flex-col gap-6 h-full px-6 xl:px-8 py-8 max-w-4xl mx-auto">
			<div className="flex flex-col gap-4">
				<h1 className="text-4xl">개인정보처리방침</h1>
				<p className="text-muted-foreground">
					kyt 개인정보 처리방침
				</p>
			</div>

			<div className="flex flex-col gap-8 text-sm leading-relaxed">
				<div className="flex flex-col gap-2">
					<p className="text-muted-foreground">
						kyt(kyt-ps.com)(이하 사이트)는 정보주체(이하 사용자)의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 사용자에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
					</p>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">1. 개인정보의 처리 목적</h2>
					<div className="flex flex-col gap-2">
						<p className="text-muted-foreground">
							사이트는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
						</p>
						<ul className="flex flex-col gap-1">
							<li className="text-muted-foreground">1. 회원 가입: 사용자 계정을 위해 개인정보를 처리합니다.</li>
							<li className="text-muted-foreground">2. 사용자 데이터 분석: 사이트 개선을 위해 사용자의 익명화된 사이트 이용 패턴을 수집합니다.</li>
              <li className="text-muted-foreground">3. 사이트 이용 내역: 개인화된 학습 성과 분석, 레이팅 및 숙련도 시스템 운영. 이 정보들은 사이트 이용중 자동으로 생성됩니다.</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">2. 개인정보의 처리 및 보유 기간</h2>
					<div className="flex flex-col gap-2">
						<p className="text-muted-foreground">
							사이트는 법령에 따른 개인정보 보유·이용기간 또는 사용자로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
						</p>
						<ul className="flex flex-col gap-2">
							<li className="flex flex-col gap-1">
								<span className="text-muted-foreground">1. 회원 가입: 회원 탈퇴 시까지. 다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지</span>
								<ul className="pl-4 flex flex-col gap-1">
									<li className="text-muted-foreground text-sm">- 사이트 이용 약관 위반에 따른 패널티가 진행중인 경우: 패널티 종료 시까지</li>
									<li className="text-muted-foreground text-sm">- 관계 법령 위반에 따른 수사, 조사 등이 진행중인 경우: 해당 수사, 조사 종료 시까지</li>
								</ul>
							</li>
							<li className="text-muted-foreground">2. 사용자 데이터 분석: 사이트를 이용하는 동안.</li>
              <li className="text-muted-foreground">3. 사이트 이용 내역: 회원 탈퇴 시까지. 다만, 사용자는 언제든 '설정' 페이지에서 이용 내역을 삭제할 수 있습니다.</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">3. 처리하는 개인정보의 항목</h2>
					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground">1. 회원 가입</span>
							<ul className="pl-4">
								<li className="text-muted-foreground text-sm">- Google 로그인: OAuth 사용자 식별자(sub값), Google 계정에 등록된 사용자 이름, 프로필 이미지(url)</li>
							</ul>
						</div>
						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground">2. 사용자 데이터 분석:</span>
							<ul className="pl-4 flex flex-col gap-1">
								<li className="text-muted-foreground text-sm">- 사이트 내 페이지 열람 기록, 브라우저, 운영 체제, 화면 크기, 접속 국가, 유입 경로</li>
								<li className="text-muted-foreground text-sm">- 모든 정보는 익명화되어 처리되며 사용자를 식별할 수 없습니다.</li>
							</ul>
						</div>
            <div className="flex flex-col gap-1">
							<span className="text-muted-foreground">3. 사이트 이용 내역:</span>

							<ul className="pl-4 flex flex-col gap-1">
                <li className="text-muted-foreground text-sm">이 정보들은 서비스 이용중 자동으로 생성됩니다.</li>
								<li className="text-muted-foreground text-sm">- 문제 풀이 기록: 문제 풀이 시각, 정오답 내역</li>
								<li className="text-muted-foreground text-sm">- 레이팅 및 숙련도: 과목, 단원, 소단원, 문제유형별 레이팅 점수 및 숙련도 점수</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">4. 개인정보의 제3자 제공에 관한 사항</h2>
					<p className="text-muted-foreground">
						사이트는 사용자의 개인정보를 제3자에 제공하지 않습니다.
					</p>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">5. 개인정보 처리업무의 위탁에 관한 사항</h2>
					<div className="flex flex-col gap-2">
						<p className="text-muted-foreground">
							사이트는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
						</p>
						<ul className="pl-4">
							<li className="text-muted-foreground text-sm">- Supabase Inc.: 회원 가입, 사용자 데이터 저장, 사용자 데이터 분석</li>
              <li className="text-muted-foreground text-sm">- Vercel Inc.: 웹사이트 및 시스템 배포 및 관리(서버 호스팅)</li>
						</ul>
						<p className="text-muted-foreground text-sm">
							위탁하는 개인정보 항목은 &lt;3. 처리하는 개인정보의 항목&gt;에 명시된 내용과 동일합니다.
						</p>
						<p className="text-muted-foreground text-sm">
							개인정보 처리 및 보유 기간은 &lt;2. 개인정보의 처리 및 보유 기간&gt;에 명시된 내용과 동일합니다.
						</p>
						<p className="text-muted-foreground text-sm">
							위탁계약 체결시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다. 위탁업무의 내용이나 수탁자가 변경될 경우에는 지체없이 본 개인정보 처리방침을 통하여 공개하도록 하겠습니다.
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">6. 개인정보의 국외 이전에 관한 사항</h2>
					<p className="text-muted-foreground">
						사이트는 Vercel Inc.의 클라우드 서비스를 이용하여 호스팅되고 있으며, 해당 데이터는 Amazon Web Services의 대한민국 리전에 저장됩니다.
					</p>
          <p className="text-muted-foreground">
						사이트는 Supabase Inc.의 클라우드 서비스를 이용하여 이용자의 데이터 및 개인정보를 저장하고 있으며, 해당 데이터는 Amazon Web Services의 대한민국 리전에 저장됩니다.
					</p>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">7. 개인정보의 파기 절차 및 방법에 관한 사항</h2>
					<div className="flex flex-col gap-2">
						<ul className="flex flex-col gap-2">
							<li className="text-muted-foreground text-sm">- 사이트는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</li>
							<li className="text-muted-foreground text-sm">- 사용자로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터 베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.</li>
							<li className="text-muted-foreground text-sm">- 개인정보 파기의 절차 및 방법은 다음과 같습니다.</li>
						</ul>
						<ul className="pl-4 flex flex-col gap-1">
							<li className="text-muted-foreground text-sm">1. 파기절차: 사이트는 파기 사유가 발생한 개인정보를 선정하고, 사이트의 개인 정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</li>
							<li className="text-muted-foreground text-sm">2. 파기방법: 사이트는 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">8. 사용자와 법정대리인의 권리·의무 및 행사방법에 관한 사항</h2>
					<div className="flex flex-col gap-2">
						<ul className="flex flex-col gap-2">
							<li className="text-muted-foreground text-sm">1. 사용자는 사이트에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다. ※ 만 14세 미만 아동에 관한 개인정보의 열람등 요구는 법정대리인이 직접 해야 하며, 만 14세 이상의 미성년자인 사용자는 사용자의 개인정보에 관하여 미성년자 본인이 권리를 행사하거나 법정대리인을 통하여 권리를 행사할 수도 있습니다.</li>
							<li className="text-muted-foreground text-sm">2. 권리 행사는 사이트에 대해 「개인정보 보호법」 시행령 제41조 제1항에 따라 서면, 전자우편 등을 통하여 하실 수 있으며, 사이트는 이에 대해 지체없이 조치하겠습니다.</li>
							<li className="text-muted-foreground text-sm">3. 권리 행사는 사용자의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수도 있습니다. 이 경우 "개인정보 처리 방법에 관한 고시(제2020-7호)" 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.</li>
							<li className="text-muted-foreground text-sm">4. 개인정보 열람 및 처리정지 요구는 「개인정보 보호법」 제35조 제4항, 제37조 제2항에 의하여 사용자의 권리가 제한 될 수 있습니다.</li>
							<li className="text-muted-foreground text-sm">5. 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.</li>
							<li className="text-muted-foreground text-sm">6. 사이트는 사용자 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나 정당한 대리인인지를 확인합니다.</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">9. 개인정보의 안전성 확보조치에 관한 사항</h2>
					<div className="flex flex-col gap-2">
						<p className="text-muted-foreground">
							사이트는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
						</p>
						<ul className="pl-4 flex flex-col gap-1">
							<li className="text-muted-foreground text-sm">1. 관리적 조치 : 내부관리계획 수립·시행</li>
							<li className="text-muted-foreground text-sm">2. 기술적 조치 : 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 개인정보 수집 최소화</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">10. 개인정보를 자동으로 수집하는 장치의 설치 운영 및 그 거부에 관한 사항</h2>
					<div className="flex flex-col gap-2">
						<ul className="flex flex-col gap-2">
							<li className="text-muted-foreground text-sm">1. 사용자에게 개인화된 서비스를 제공하기 위해 이용 정보를 저장하고 불러오는 '쿠키(cookie)'를 사용합니다.</li>
							<li className="text-muted-foreground text-sm">2. 쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 기기 내의 저장장치에 저장될 수 있습니다.</li>
						</ul>
						<div className="flex flex-col gap-2">
							<span className="text-muted-foreground">1. 쿠키의 사용목적:</span>
							<ul className="pl-4 flex flex-col gap-1">
								<li className="text-muted-foreground text-sm">- 로그인된 사용자의 정보를 확인하여 회원 전용 기능을 제공합니다.</li>
							</ul>
						</div>
						<ul className="flex flex-col gap-1">
							<li className="text-muted-foreground text-sm">2. 쿠키의 설치·운영 및 거부 : 사용자의 웹브라우저 설정을 통해 쿠키 저장을 거부 할 수 있습니다.</li>
							<li className="text-muted-foreground text-sm">3. 쿠키 저장을 거부할 경우 회원 가입에 어려움이 발생할 수 있습니다.</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">11. 행태정보의 수집·이용·제공 및 거부 등에 관한 사항</h2>
					<p className="text-muted-foreground">
						사이트는 사용자에게 맞춤형 광고를 제공하지 않습니다.
					</p>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">12. 개인정보 보호책임자에 관한 사항</h2>
					<div className="flex flex-col gap-2">
						<p className="text-muted-foreground">
							사이트는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 사용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
						</p>
						<ul className="pl-4">
            <li className="text-muted-foreground text-sm">개인정보 보호책임자: kyt (사이트 운영자)</li>
							<li className="text-muted-foreground text-sm">이메일: contact@stratocanvas.com</li>
						</ul>
						<p className="text-muted-foreground text-sm">
							사용자는 사이트의 서비스를 이용하면서 발생한 모든 개인정보보호 관련 문의, 불만처리, 피해구제, 열람청구 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의할 수 있습니다. 사이트는 사용자의 문의에 대해 지체없이 답변 및 처리해드릴 것입니다.
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">13. 사용자의 권익침해에 대한 구제방법</h2>
					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-2">
							<p className="text-muted-foreground text-sm">
								1. 사용자는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다. 이 밖에 기타 개인정보침해의 신고, 상담에 대하여는 아래의 기관에 문의하시기 바랍니다.
							</p>
							<ul className="pl-4 flex flex-col gap-1">
								<li className="text-muted-foreground text-sm">1. 개인정보분쟁조정위원회 : (국번없이) 1833-6972 (www.kopico.go.kr)</li>
								<li className="text-muted-foreground text-sm">2. 개인정보침해신고센터 : (국번없이) 118 (privacy.kisa.or.kr)</li>
								<li className="text-muted-foreground text-sm">3. 대검찰청 : (국번없이) 1301 (www.spo.go.kr)</li>
								<li className="text-muted-foreground text-sm">4. 경찰청 : (국번없이) 182 (ecrm.cyber.go.kr)</li>
							</ul>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-muted-foreground text-sm">
								2. 사이트는 사용자의 개인정보자기결정권을 보장하고, 개인정보침해로 인한 상담 및 피해 구제를 위해 노력하고 있으며, 신고나 상담이 필요한 경우 아래로 연락해 주시기 바랍니다.
							</p>
							<ul className="pl-4">
								<li className="text-muted-foreground text-sm">- contact@stratocanvas.com</li>
							</ul>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-muted-foreground text-sm">
								3. 「개인정보 보호법」 제35조(개인정보의 열람), 제36조(개인정보의 정정·삭제), 제37조(개인정보의 처리정지 등)의 규정에 의한 요구에 대 하여 공공기관의 장이 행한 처분 또는 부작위로 인하여 권리 또는 이익의 침해를 받은 자는 행정심판법이 정하는 바에 따라 행정심판을 청구할 수 있습니다.
							</p>
							<ul className="pl-4">
								<li className="text-muted-foreground text-sm">- 중앙행정심판위원회 : (국번없이) 110 (www.simpan.go.kr)</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">14. 개인정보 처리방침의 적용 및 변경에 관한 사항</h2>
					<div className="flex flex-col gap-2">
						<p className="text-muted-foreground text-sm">
							1. 이 개인정보 처리방침은 2025년 9월 8일(대한민국 표준시)부터 적용됩니다.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}