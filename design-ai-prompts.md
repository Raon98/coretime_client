# CoreTime 화면별 디자인 AI 프롬프트 기능명세서

본 문서는 `src/app` 전 화면을 기준으로, 각 화면의 목적/구성요소/레이아웃/상태/상호작용을 **모델-agnostic UI 프롬프트**로 정리한 것입니다.

## 공통 컨텍스트
- 제품: 센터 운영 플랫폼 (CoreTime). 역할: OWNER/SYSTEM_ADMIN, INSTRUCTOR.
- UI 스택: Next.js App Router + Mantine.
- 테마 기본값: Pretendard, primary `indigo`, radius `md/lg`, 버튼 기본 fw 600. (`src/theme.ts`)
- 공통 레이아웃: AppShell 사이드 내비게이션 + 상단 브랜치/유저 영역. (`src/components/layout/AppShell.tsx`)
- **한국 기준 적용 필수**: 모든 프롬프트에서 한국어 UI, KRW 통화, 한국 전화번호/주소 포맷, 날짜 `YYYY.MM.DD` 또는 `YYYY-MM-DD`, 24시간제 시간 사용.
- **모달 설계 규칙**: 모달 UI는 메인 화면 프레임과 분리된 별도 프레임으로 설계한다.
- **레퍼런스 이미지 규칙**: 첨부 이미지는 기능 구조만 참고하고, 시각 디자인(레이아웃/타이포/컬러/컴포넌트)은 반드시 재구성한다.

---

## Auth / Onboarding

### /login
- Screen Goal: 소셜 로그인 시작점 + 승인 대기 상태 안내
- Primary User: 미로그인 사용자
- Key UI Blocks: 로고+태그라인, Kakao/Google 로그인 버튼, 하단 링크(이용약관/개인정보/문의), 대기 모달
- Layout/Hierarchy: 중앙 정렬 카드형 스택, 상단 브랜드/중앙 CTA/하단 링크
- CTAs: “카카오로 시작하기”, “Google 계정으로 시작하기”, 모달 내 “새로 등록하기/확인”
- States/Modals: 약관/개인정보/문의 모달, 승인 대기 모달(센터 리스트 or ID fallback)
- Copy: “센터 운영의 모든 것”, 승인 대기 설명문
- Constraints:
  - **한국 기준** 문구/날짜/시간/통화/전화 표기
  - **소셜 로그인 버튼은 최신 공식 가이드 준수**(색상, 로고 비율, 패딩, 폰트)
- Responsive Notes: 모바일에서 단일 컬럼, 버튼 풀폭 유지
- Visual Direction: 미니멀 화이트 + 강한 위계, 브랜드 로고 강조, 과대칭 피함
- AI Prompt (모델-agnostic, 한국 기준):
  - Korean-only login screen, centered layout, brand logo + tagline, two compliant social login buttons (Kakao/Google) with correct colors and typography
  - Include footer links and small copyright
  - Include pending-approval modal that lists centers with status badges and actions
  - Use Korean date/time/copy conventions

### /identity
- Screen Goal: 사용자 역할 선택(센터장/강사)
- Primary User: 신규 가입자
- Key UI Blocks: 타이틀/설명, 2개의 선택 카드(아이콘+설명)
- Layout/Hierarchy: 타이틀 상단, 2열 카드 그리드
- CTAs: 카드 클릭 자체가 CTA
- States/Modals: 토큰 주입 로딩/에러 토스트
- Constraints: 한국 기준 UI, 역할 명칭 고정(OWNER/INSTRUCTOR)
- Responsive Notes: 모바일 1열 전환
- Visual Direction: 카드 호버로 깊이감, 아이콘 강조
- AI Prompt (모델-agnostic, 한국 기준):
  - Role selection screen with two large cards, Korean copy, subtle hover lift

### /register/profile
- Screen Goal: 기본 정보 입력(이름/이메일/휴대폰)
- Primary User: 신규 가입자
- Key UI Blocks: 뒤로가기, 폼 입력 3개, 다음 버튼
- Layout/Hierarchy: 상단 타이틀+설명, 폼, 하단 CTA
- CTAs: “다음으로 이동”
- States/Modals: role 없으면 오류 메시지 + 돌아가기
- Constraints: 한국 휴대폰 포맷, 이메일 읽기 전용 가능
- Responsive Notes: 모바일 중앙 정렬 폼
- Visual Direction: 절제된 폼 UI, 입력 필드 간격 명확
- AI Prompt (모델-agnostic, 한국 기준):
  - Clean onboarding profile form, Korean labels, masked phone input, prominent next CTA

### /register/owner
- Screen Goal: 센터장용 센터 정보 등록
- Primary User: OWNER
- Key UI Blocks: 좌측 안내 카피, 우측 폼(업종/센터명/사업자번호/대표자/주소/연락처)
- Layout/Hierarchy: 2컬럼(안내/폼), 폼 카드
- CTAs: “등록 완료”
- States/Modals: 성공 모달, 에러 알림
- Constraints: 사업자번호 포맷 `000-00-00000`, 한국 주소/전화
- Responsive Notes: 모바일 단일 컬럼 스택
- Visual Direction: 안내 카피 크게, 폼 카드 안정감
- AI Prompt (모델-agnostic, 한국 기준):
  - Owner registration screen with left guide text and right form card, Korean business inputs

### /register/create-center
- Screen Goal: 추가 센터 등록
- Primary User: OWNER
- Key UI Blocks: 좌측 안내, 우측 폼(업종/센터명/사업자번호/대표자/주소/연락처)
- Layout/Hierarchy: 2컬럼 동일 구조
- CTAs: “등록하기”
- States/Modals: 로딩 오버레이
- Constraints: 한국 기준 포맷 유지
- Responsive Notes: 모바일 단일 컬럼
- Visual Direction: owner 등록과 동일 톤
- AI Prompt (모델-agnostic, 한국 기준):
  - Create-center form similar to owner registration, Korean labels and formatting

### /register/instructor
- Screen Goal: 강사 초대 코드 입력 및 센터 검색 승인 요청
- Primary User: INSTRUCTOR
- Key UI Blocks: 6자리 코드 입력, 센터 확인 카드, 가입 신청 버튼, 센터 검색 모달
- Layout/Hierarchy: 중앙 정렬, 코드 입력 강조, 하단 대체 플로우
- CTAs: “가입 신청”, “센터 검색하여 승인 요청하기”
- States/Modals: 센터 검색 모달, 가입 완료/승인 요청 완료 모달
- Constraints: 코드 6자리, 센터 리스트 선택
- Responsive Notes: 모바일에서 모달 리스트 스크롤
- Visual Direction: 입력 상태 피드백 명확, 승인 흐름 신뢰감
- AI Prompt (모델-agnostic, 한국 기준):
  - Instructor join screen with 6-digit code input, confirmation card, and searchable center modal

### /register/pending
- Screen Goal: 승인 대기 안내
- Primary User: 신규 가입자
- Key UI Blocks: 아이콘, 타이틀, 설명, 로그아웃 버튼
- Layout/Hierarchy: 중앙 카드
- CTAs: “로그아웃”
- States/Modals: 없음
- Constraints: 한국어 카피 고정
- Visual Direction: 대기/안내 톤, 아이콘 강조
- AI Prompt (모델-agnostic, 한국 기준):
  - Minimal waiting approval screen with friendly icon and logout CTA

### /oauth/callback
- Screen Goal: OAuth 콜백 처리 중 로딩 표시
- Primary User: OAuth 완료 사용자
- Key UI Blocks: 로딩 오버레이, 상태 텍스트
- Layout/Hierarchy: 중앙 정렬
- CTAs: 없음
- States/Modals: 에러 시 로그인 리다이렉트
- Constraints: 짧고 명확한 로딩 문구
- Visual Direction: 시스템 로딩 화면
- AI Prompt (모델-agnostic, 한국 기준):
  - Full-page loading screen with Korean status message

---

## Dashboard 공통

### AppShell (공통 레이아웃)
- Screen Goal: 역할 기반 내비게이션/브랜치 전환
- Key UI Blocks:
  - 좌측 사이드바(대시보드/회원/스케줄/강사/급여/매출/설정)
  - 상단 사용자 메뉴
  - 상단 센터 전환기(브랜치 스위처)
- Layout/Hierarchy: 사이드바 고정 + 콘텐츠 영역
- Center Switcher UX Spec:
  - 위치: 상단 바 좌측 영역(로고 우측)
  - 기본 표시: `STUDIO` 라벨 + 현재 선택 센터명 + 드롭다운 아이콘
  - 드롭다운 구조:
    - `내 지점 목록` 라벨
    - 전체 센터 목록
    - 하단 액션: `+ 새 지점 등록하기`
  - 항목 정보:
    - 센터명(1줄)
    - 상태 배지: `승인대기`(orange), `거절됨`(red)
    - 현재 선택 센터는 indigo 컬러/배경 강조
  - 전환 인터랙션:
    - 활성 센터(`organization.status=ACTIVE` and `membershipStatus=ACTIVE`)만 선택 가능
    - 비활성/승인대기 센터는 disabled + opacity 처리
    - 전환 시 메인 영역에 로딩 오버레이 표시 (`bars` loader)
    - 현재 구현 기준 전환은 지점명 로컬 상태 업데이트(약 800ms 지연 시뮬레이션)
  - 예외/오류 처리:
    - 센터 목록 로딩 중: 스위처 자리 스켈레톤 표시
    - 조직 목록 API 지연 시 기존 헤더 레이아웃 유지
    - 승인대기/거절 센터는 선택 불가로 오동작 방지
  - 신규 지점 등록 플로우:
    - 드롭다운의 `새 지점 등록하기` 클릭 시 역할 선택 모달 오픈
    - `센터장` 선택 -> `/register/create-center`
    - `강사` 선택 -> `/register/instructor`
  - 접근성:
    - 키보드 탐색(↑↓/Enter/Esc), aria-label(`센터 전환`)
    - 44px 이상 클릭 타겟, 명도 대비 준수
- Constraints:
  - OWNER/INSTRUCTOR 메뉴 분기
  - 한국 기준(한국어 카피, KRW, 날짜/시간 표기)
  - **데스크탑 기준 설계 필수**(최소 1280px 레이아웃 우선, 좌측 고정 내비 + 우측 작업 영역)
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first dashboard shell for a Korean center-operations SaaS.
  - Use a fixed left sidebar with role-based navigation (OWNER vs INSTRUCTOR), and a top bar with center switcher, notifications, and user menu.
  - Implement the center switcher as a compact dropdown: `STUDIO` label, current center name, and list of organizations.
  - In the dropdown, show status badges for pending/rejected centers and disable non-active centers.
  - Show skeleton while organization data is loading, and show a main-content loading overlay during switching interaction.
  - Include a `새 지점 등록하기` action that opens a role-choice modal (`센터장` or `강사`) and routes to the matching registration flow.
  - Keep visual hierarchy clean with neutral surfaces, indigo accents, and consistent spacing tokens.
  - Ensure Korean labels and enterprise-grade clarity for high-frequency daily operations.

---

## Dashboard

### /
- Screen Goal: 운영 현황 요약 및 알림
- Primary User: OWNER/INSTRUCTOR
- Key UI Blocks:
  - 환영 헤더 + 날짜/지점 컨텍스트
  - 역할 토글(OWNER/INSTRUCTOR)
  - 오늘 KPI 카드(오늘 수업 수, 출석률, 신규 회원, 당일 매출/미수금, 노쇼)
  - 즉시 액션 카드(수업 등록, 예약 등록, 회원 등록, 미수금 연락, 강사 승인)
  - 처리 필요 큐(강사 승인 대기, 만료 임박 수강권, 미처리 출석/상담)
  - 최근 활동 타임라인(예약/결제/출석/상담 이벤트)
  - 우측 알림/승인 패널
- Layout/Hierarchy: 데스크탑 2열 메인 그리드(좌 8~9 / 우 3~4), 상단 KPI 스트립 고정 가시성
- CTAs: 역할 토글, 빠른 등록 액션, 승인/거절, 알림톡/연락 액션
- States/Modals: 로딩 스켈레톤
- Constraints:
  - 역할별 컨텐츠 분기(OWNER: 재무/승인 중심, INSTRUCTOR: 오늘 수업/출석 중심)
  - 한국 기준(카피/날짜/통화/전화 형식)
  - **데스크탑 기준 설계 필수**(밀도 높은 운영 정보, 멀티패널 동시 가시성)
- Responsive Notes: 모바일은 1열 스택으로 축약하되 본 설계 기준은 데스크탑 우선
- Visual Direction: 실무 운영형 대시보드, 정보 밀도 높지만 우선순위가 명확한 카드 시스템
- AI Prompt (모델-agnostic, 한국 기준):
  - Create a desktop-first Korean operations dashboard for a fitness center management product.
  - Build a top section with greeting, role toggle, and today's KPI cards.
  - Add a quick-action row for high-frequency tasks (class/reservation/member registration, pending approvals, unpaid follow-up).
  - Use a two-column layout: left for activity timeline and operational widgets, right for alerts and approval queue.
  - Separate OWNER and INSTRUCTOR views while preserving a common visual system.
  - Use Korean UI copy, KRW formatting, and Korean date/time conventions.
  - The output must prioritize desktop usability and dense real-world workflows over mobile-first composition.

---

## Members

### /members
- Screen Goal: 회원 목록 조회/관리
- Primary User: OWNER/INSTRUCTOR
- Key UI Blocks:
  - 헤더 + `신규 회원 등록` CTA
  - 검색 입력(이름/전화번호) + 상태 멀티필터(INACTIVE/PENDING_APPROVAL/WITHDRAWN/REJECTED)
  - 회원 테이블(회원명/성별/상태/연락처/보유 수강권/최근 출석/행 액션)
  - 행 액션 메뉴(알림톡 발송, 정보 수정)
  - 회원 상세 드로어(프로필, 신체 특이사항 편집, 수강권 탭, 상담 탭)
  - 모달: 회원 등록/수정, 알림톡 발송
- Layout/Hierarchy: 데스크탑에서 헤더/필터/테이블/우측 상세 드로어의 작업 동선이 한 번에 보이도록 구성
- CTAs: `신규 회원 등록`, 행 메뉴 `알림톡 발송` `정보 수정`, 드로어 내 `알림톡` `정보수정` `특이사항 저장`
- States/Modals:
  - 초기 로딩: 테이블 스켈레톤
  - 검색 결과 없음: 테이블 빈 상태 메시지
  - 드로어 탭별 빈 상태(수강권 없음)
- Constraints:
  - 상태 배지는 코드 기준 매핑 유지(활동/비활성/승인대기/탈퇴/거절)
  - 한국 기준(이름/전화/날짜 표기)
  - **데스크탑 기준 설계 필수**(테이블 가독성과 드로어 동시 작업성 우선)
- Responsive Notes: 모바일은 테이블 축약 가능하나 설계 기준은 데스크탑 우선
- Visual Direction: 운영형 리스트 UI, 상태 배지와 행 액션 가시성 강화
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean member management page.
  - Include searchable/filterable member table, row-level action menu, and right-side detail drawer with tabs (tickets/consultations).
  - Add modals for member create/edit and AlimTalk sending.
  - Keep high information density while preserving clear hierarchy and fast operator workflow.

### /members/tickets
- Screen Goal: 회원 수강권 현황/관리
- Primary User: OWNER/INSTRUCTOR
- Key UI Blocks:
  - 헤더 + `수강권 등록` CTA
  - 필터/검색/정렬(회원명 검색, 정렬, 상태 필터)
  - 수강권 테이블(회원/상품/잔여횟수 progress/유효기간 D-Day/상태/행 액션)
  - 등록 모달 3단계 흐름:
    - 1) 회원 선택
    - 2) 활성화 가능한 결제 내역 선택(없으면 안내 Alert + 결제 페이지 이동)
    - 3) 수강권 상세 설정(이름/총횟수/시작일/종료일)
  - 편집 모달(횟수 추가 또는 기간 연장)
- Layout/Hierarchy: 데스크탑에서 필터 바와 대용량 테이블을 우선 배치, 모달은 작업 단계가 명확한 수직 흐름
- CTAs: `수강권 등록`, 행 메뉴 `횟수 추가` `기간 연장` `일시 정지/해제`, `엑셀 다운로드`
- States/Modals:
  - 결제 내역 없음 Alert 상태
  - 등록/편집 모달
  - 데이터 비어있을 때 테이블 빈 상태
- Constraints:
  - 잔여 횟수 progress + D-Day 배지 필수
  - 한국 기준(날짜/금액/문구)
  - **데스크탑 기준 설계 필수**(테이블 중심 고밀도 운영 UI)
- Responsive Notes: 모바일에서 모달 2열 카드 1열 전환 가능, 본 설계는 데스크탑 우선
- Visual Direction: 수치/상태 중심 운영 UI, 진행바와 위험 상태 강조
- AI Prompt (모델-agnostic, 한국 기준):
  - Create a desktop-first Korean ticket management screen with dense table operations.
  - Include progress bars for remaining sessions, D-day badges, and per-row actions for pause/extend/add count.
  - Build a 3-step activation modal tied to member and payment context.
  - Show clear empty/error states when eligible payment records are missing.

### /members/consultations
- Screen Goal: 상담/메모 기록 타임라인
- Primary User: OWNER/INSTRUCTOR
- Key UI Blocks:
  - 헤더 + `새 상담 기록` CTA
  - 회원 선택 필터 카드(검색 가능 Select)
  - 상담 타임라인(일시, 카테고리 배지, 본문 카드, 태그)
  - 작성 모달(회원 선택/상담 일시/카테고리/태그/내용)
- Layout/Hierarchy: 데스크탑에서 상단 필터 카드와 타임라인 본문을 분리해 가독성 확보
- CTAs: `새 상담 기록`, 모달 내 `저장하기`
- States/Modals:
  - 회원 미선택 안내
  - 선택 회원 기록 없음 안내
  - 저장 중 로딩 오버레이
- Constraints:
  - 카테고리/태그 한국어 유지
  - 한국 날짜/시간 표기
  - **데스크탑 기준 설계 필수**(타임라인 가독성과 입력 모달 작업성 우선)
- Responsive Notes: 모바일 스택 가능하나 본 설계 기준은 데스크탑 우선
- Visual Direction: 상담 이력 중심 타임라인, 텍스트 가독성 및 분류 배지 강조
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean consultation timeline page.
  - Include member filtering, chronological timeline cards, category badges, and tag chips.
  - Provide a modal for creating consultation logs with structured fields and clear validation feedback.
  - Prioritize readability of long-form notes and quick context switching by member.

---

## Schedule

### /schedule
- Screen Goal: 주간/월간 캘린더 기반 수업 편성
- Primary User: OWNER/INSTRUCTOR
- Key UI Blocks:
  - 좌측 `CalendarSidebar`(날짜 선택, 강사 다중 선택, 룸 다중 선택)
  - 우측 메인 캘린더 영역(상단 월 텍스트, `주간/월간` SegmentedControl)
  - 수업 등록 버튼 + 수업 등록/수정 공용 모달(ClassModal)
  - 주간/월간 캘린더 컴포넌트(클릭 시 편집 모달 오픈)
- Layout/Hierarchy: 데스크탑 기준 좌측 고정 필터 + 우측 대형 캘린더(전체 높이 기반 작업 영역)
- CTAs: `수업 등록`, 캘린더 이벤트 클릭 편집, 모달 내 저장/삭제
- States/Modals:
  - 로딩 시 스케줄 스켈레톤
  - 수업 등록/수정 모달
  - 삭제 시 확인 다이얼로그(confirm)
- Constraints:
  - 시간/강사/룸/정원 필수 입력 흐름 유지
  - 한국 기준 날짜/시간 표기
  - **데스크탑 기준 설계 필수**(캘린더 가시 영역과 필터 동시 노출 우선)
- Responsive Notes: 모바일 축약 가능하나 본 스펙은 데스크탑 풀 캔버스 작업성 우선
- Visual Direction: 운영형 스케줄러, 시간축 가독성과 필터 조합 탐색성 강조
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean scheduling workspace with a fixed left filter sidebar and large right calendar canvas.
  - Include week/month switching, multi-select instructor/room filters, and a unified class create/edit modal.
  - Ensure dense but clear timetable readability for operators handling many classes per day.

### /schedule/reservations
- Screen Goal: 예약 현황 조회/관리
- Primary User: OWNER/INSTRUCTOR
- Key UI Blocks:
  - 헤더 + `예약 등록` CTA
  - 필터 카드(기간 range, 상태, 강사, 초기화)
  - 통계 카드(전체 예약/대기자/취소·환불/노쇼)
  - 예약 테이블(체크박스 배치 선택, 상태/회원/수업/잔여횟수/채널/신청일시/행 액션)
  - 배치 액션 바(선택 N명, 알림톡 일괄 전송, 일괄 취소)
  - 예약 등록 모달(회원 선택 + 수업 선택)
  - 알림톡 모달
- Layout/Hierarchy: 데스크탑에서 필터→통계→배치액션→대형 테이블 순으로 운영 동선 최적화
- CTAs: `예약 등록`, `알림톡 전송`, `일괄 취소`, 행 단위 취소/메시지 액션
- States/Modals:
  - 선택 행 존재 시 배치 액션 바 노출
  - 등록 모달
  - 필터 결과 0건 상태
- Constraints:
  - 한국 날짜 포맷 + 상태 배지(예약확정/대기/취소/노쇼)
  - 배치 작업 피드백(토스트) 명확화
  - **데스크탑 기준 설계 필수**(대량 예약 데이터 처리 성능과 가독성 우선)
- Responsive Notes: 모바일 카드화 가능하나 본 설계 기준은 데스크탑 테이블 운영
- Visual Direction: 고밀도 운영 테이블 + 배치 작업의 위험/성공 상태 명확화
- AI Prompt (모델-agnostic, 한국 기준):
  - Create a desktop-first Korean reservation operations page with filters, stat cards, and a selectable data table.
  - Add a contextual batch-action bar for multi-user messaging and bulk cancellation.
  - Include reservation create modal and row-level action controls for fast front-desk operations.

### /schedule/attendance
- Screen Goal: 출석 체크 및 노쇼 정책 적용
- Primary User: OWNER/INSTRUCTOR
- Key UI Blocks:
  - 상단 헤더 + 당일 출석 요약 카드(TODAY STATUS, 출석률 progress)
  - 노쇼 자동 차감 토글(운영 정책 연동)
  - 오늘 수업 아코디언(수업별 시간/강사/룸/정원/체크인 현황)
  - 수강생 행별 출석 상태 SegmentedControl(미처리/출석/지각/결석)
  - `현장 회원 추가` 버튼 + Walk-in 모달(회원 검색/선택/추가)
- Layout/Hierarchy: 데스크탑 상단 요약 + 하단 수업 아코디언으로 당일 처리 흐름 집중
- CTAs: 상태 변경, `현장 회원 추가`, Walk-in 모달 내 `수업에 추가하기`
- States/Modals:
  - 수업 없음 상태 카드
  - 결석 처리 시 노쇼 차감 확인 모달
  - Walk-in 모달(서버 검색 로딩/결과 없음 처리)
- Constraints:
  - 노쇼 정책 토글과 결석 처리 플로우 일관성
  - 한국 기준 날짜/시간/문구
  - **데스크탑 기준 설계 필수**(동시 모니터링 + 빠른 상태 변경 우선)
- Responsive Notes: 아코디언 구조는 모바일 친화적이지만 본 설계는 데스크탑 운영 콘솔 우선
- Visual Direction: 당일 오퍼레이션 집중형 UI, 상태 색상 체계와 즉시 피드백 강조
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean attendance console for same-day class operations.
  - Use class accordions with per-member segmented attendance controls and clear check-in metrics.
  - Include no-show penalty confirmation flow and a walk-in member add modal with live search.
  - Prioritize rapid status updates, visual clarity, and operational safety cues.

---

## Tab 기준 재정의 (강사 관리부터)

### 강사 관리 탭

#### 강사 조회 (`/center/instructors`)
- Screen Goal: 재직/비활성 강사 조회 및 상세 관리
- Primary User: OWNER
- Key UI Blocks:
  - 상단 헤더 + 탭(`강사 조회`, `강사 등록/승인`)
  - 강사 리스트/검색/상태 배지
  - 행 액션(편집/정지/퇴사/활성화)
  - 상세 드로어(프로필, 연락처, 상태)
- Layout/Hierarchy: 데스크탑 기준 리스트 메인 + 상세 드로어 보조 패널
- CTAs: `정보 수정`, `정지`, `퇴사`, `활성화`
- States/Modals:
  - 로딩 상태(활성 강사)
  - 편집/정지/퇴사 모달(별도 프레임)
- Constraints:
  - 상태 배지 체계 일관성(재직/비활성/승인대기/퇴사/거절)
  - **데스크탑 기준 설계 필수**
  - 모달은 메인과 분리된 별도 프레임
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean instructor directory with a master list and right-side detail drawer.
  - Include safe status transition actions and separated modal frames for edit/suspend/withdraw.

#### 강사 등록/승인 (`/center/instructors?tab=management`)
- Screen Goal: 승인 대기 강사 처리 + 강사 등록
- Primary User: OWNER
- Key UI Blocks:
  - 승인 대기 리스트
  - 승인/거절 액션 버튼
  - 직접 등록 섹션(필요 입력 폼)
- Layout/Hierarchy: 데스크탑 기준 승인 큐 우선 + 등록 영역 보조
- CTAs: `승인`, `거절`, `등록`
- States/Modals:
  - 승인 대기 0건 상태
  - 처리 결과 토스트
- Constraints:
  - 승인 액션은 오작동 방지 확인 플로우 적용
  - 모달/확인창 별도 프레임
- AI Prompt (모델-agnostic, 한국 기준):
  - Create a desktop-first Korean approval console for pending instructors with clear accept/reject decision flow.

### 급여 관리 탭

#### 급여 현황 (`/center/salary/overview`)
- Screen Goal: 월별 급여 집계와 상세 내역 확인
- Primary User: OWNER
- Key UI Blocks: 월 선택, KPI 스트립, 상세 테이블
- Layout/Hierarchy: 헤더+월 필터, KPI, 하단 상세 테이블
- CTAs: `엑셀 다운로드`
- States/Modals: 로딩/빈 상태
- Constraints: KRW, 한국 날짜, 데스크탑 우선
- AI Prompt (모델-agnostic, 한국 기준):
  - Build a desktop-first Korean salary overview with KPI strip and detailed line-item table.

#### 급여 설정 (`/center/salary/settings`)
- Screen Goal: 강사별 급여 설정 페이지 진입
- Primary User: OWNER
- Key UI Blocks: 검색바, 강사 테이블, `급여 설정` 버튼
- Layout/Hierarchy: 데스크탑 리스트 중심
- CTAs: `급여 설정`
- States/Modals: 로딩/검색 결과 없음
- Constraints: 전화번호/상태 배지 가독성
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean salary settings list with fast search and one-click per-instructor setup entry.

#### 급여 지급 (`/center/salary/payments`)
- Screen Goal: 급여 지급 건 생성 및 승인/상태 관리
- Primary User: OWNER
- Key UI Blocks: 상태/월 필터, 지급 테이블, 생성 모달
- Layout/Hierarchy: 필터 상단 + 대형 테이블
- CTAs: `새 지급 건 생성`, `승인`
- States/Modals: 생성 모달(별도 프레임), 로딩 상태
- Constraints: 상태 배지(PENDING/APPROVED/PAID/FAILED), 데스크탑 우선
- AI Prompt (모델-agnostic, 한국 기준):
  - Create a desktop-first Korean salary payment operations page with filters, status table, and separate create-payment modal frame.

#### 예산 관리 (`/center/salary/budget`)
- Screen Goal: 월간 급여 예산/지출 추적
- Primary User: OWNER
- Key UI Blocks: 월 선택, 소진율 링차트, 지출 브레이크다운, 트렌드 바차트, 예산 설정 모달
- Layout/Hierarchy: 좌(요약) + 우(차트) 데스크탑 분할
- CTAs: `예산 설정`
- States/Modals: 예산 설정 모달(별도 프레임), 로딩
- Constraints: 사용률 상태색(안전/주의/초과), KRW
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean budget dashboard with ring utilization, breakdown cards, and trend chart.

#### 정산서 관리 (`/center/salary/reports`)
- Screen Goal: 강사별 정산서 조회/발행/전송
- Primary User: OWNER
- Key UI Blocks: 월 선택, 정산서 테이블, 행 액션(미리보기/PDF/이메일), 미리보기 모달
- Layout/Hierarchy: 필터 상단 + 문서형 테이블
- CTAs: `일괄 생성`, `PDF 다운로드`, `이메일 전송`
- States/Modals: 미리보기 모달(별도 프레임), 빈 상태
- Constraints: 문서 상태 배지, 데스크탑 우선
- AI Prompt (모델-agnostic, 한국 기준):
  - Create a desktop-first Korean settlement-report management page with table actions and separated preview modal frame.

### 매출 및 결제 탭

#### 수강권 관리 (`/finance/tickets`)
- Screen Goal: 판매 수강권 상품 등록/수정/활성화 관리
- Primary User: OWNER
- Key UI Blocks:
  - 상단 헤더(타이틀/설명) + `새 상품 등록` CTA
  - 상품 카드 그리드(상품명/유형/횟수/기간/가격/상태 스위치/수정/삭제)
  - 빈 상태 대형 안내 영역(`상품 등록하기` 유도 CTA)
  - 상품 등록/수정 모달(공용 폼, 생성/수정 모드 분기)
- Layout/Hierarchy: 데스크탑 기준 헤더 상단 고정 + 3열 카드 그리드 중심, 빈 상태는 전체 폭 히어로 카드
- CTAs: `새 상품 등록`, 카드 내 `수정`, `삭제`, 상태 `활성/비활성` 토글
- States/Modals:
  - 초기 로딩 오버레이
  - 상품 0개 빈 상태
  - 등록/수정 모달(별도 프레임)
  - 삭제 확인 다이얼로그(별도 프레임)
  - 상태 토글 즉시 반영(낙관적 업데이트) + 실패 롤백
- Constraints:
  - 상품 메타데이터(유형/횟수/가격/사용기간) 비교가 한눈에 가능해야 함
  - 활성/비활성 상태의 시각 대비 명확화
  - **데스크탑 기준 설계 필수**(카드 스캔성과 다건 관리 작업성 우선)
  - 모달/다이얼로그는 메인 프레임과 분리된 별도 프레임으로 설계
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean ticket product management screen for operators who manage many products at once.
  - Use a 3-column card grid on desktop with strong scanability for product type, count, duration, price, and active status.
  - Include an empty-state hero card for first product onboarding.
  - Provide separate modal frames for create/edit and a separate confirm dialog frame for delete.
  - Reflect instant status toggle feedback with safe rollback patterns on failure.

#### 결제/미수금 (`/finance/payments`)
- Screen Goal: 결제 등록/조회/환불/미수 관리
- Primary User: OWNER
- Key UI Blocks: 검색/기간/상태 필터, 결제 테이블, 결제 등록 모달, 상세/환불 플로우
- Layout/Hierarchy: 필터 카드 + 대형 테이블
- CTAs: `새 결제 등록`, `환불`
- States/Modals: 로딩 스켈레톤, 상세 모달(별도 프레임)
- Constraints: KRW, 한국 날짜/시간, 데스크탑 우선
- AI Prompt (모델-agnostic, 한국 기준):
  - Create a desktop-first Korean payment operations page with robust filtering, register-payment modal, and refund-safe confirmation UX.

#### 매출 통계 (`/finance/stats`)
- Screen Goal: 매출/환불/미수 추이 분석
- Primary User: OWNER
- Key UI Blocks: KPI 요약, AreaChart, 결제수단 DonutChart, 거래 테이블
- Layout/Hierarchy: 상단 KPI + 하단 2열 차트/테이블
- CTAs: `새로고침`
- States/Modals: 데이터 없음 상태
- Constraints: 월 기준 조회, KRW 포맷, 데스크탑 우선
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean sales analytics dashboard with KPI cards, trend chart, payment-method donut, and transaction table.

---
## Settings

### /settings
- Screen Goal: 관리자 설정(스케줄 자원/운영 정책)
- Primary User: OWNER
- Key UI Blocks:
  - 상단 헤더(타이틀/설명)
  - 탭: `스케줄 및 자원` / `운영 정책`
  - 자원 탭: 강의실 마스터(강의실명/정원 입력, 리스트, 삭제)
  - 정책 탭: 노쇼/운영 정책 스위치 및 수치 입력
- Layout/Hierarchy: 데스크탑 기준 상단 탭 + 탭별 단일 업무 카드(자원/정책 분리)
- CTAs: `등록`, `삭제`, 정책 변경 저장(즉시 반영형)
- States/Modals:
  - 강의실 없음 빈 상태
  - 삭제 확인 다이얼로그(confirm, 별도 프레임)
- Constraints:
  - 정책 토글/설명은 한국어로 명확히 표기
  - 입력 단위(인원/횟수/시간) 오해 없도록 라벨링
  - **데스크탑 기준 설계 필수**(운영자가 자원/정책을 빠르게 전환 편집)
  - 모달/다이얼로그는 메인 프레임과 분리된 별도 프레임
- Responsive Notes: 모바일 축약 가능하나 본 설계 기준은 데스크탑 탭 워크플로우
- Visual Direction: 운영 정책 콘솔 톤, 폼 밀도는 높고 구조는 단정
- AI Prompt (모델-agnostic, 한국 기준):
  - Design a desktop-first Korean admin settings console with two tabs: schedule resources and operation policies.
  - Include room master management and policy toggles/inputs with clear Korean helper text.
  - Keep delete confirmations as separate dialog frames and preserve high editing efficiency.

### /settings/profile
- Screen Goal: 프로필/알림/계정 삭제
- Primary User: OWNER/INSTRUCTOR
- Key UI Blocks:
  - 상단 프로필 헤더 배너
  - 프로필 카드: 아바타 미리보기/파일 선택/업로드/취소
  - 기본 정보 폼: 이름, 이메일(읽기전용), 전화번호, 저장 버튼
  - 알림 설정 카드: 이메일/SMS/예약/마케팅 스위치
  - 위험 구역 카드: 계정 삭제 안내 + 삭제 액션
- Layout/Hierarchy: 데스크탑 기준 상단 헤더 + 하단 3개 설정 카드(프로필/알림/위험 구역) 수직 흐름
- CTAs: `변경사항 저장`, `업로드`, `취소`, `계정 삭제`
- States/Modals:
  - 업로드 진행 로딩
  - 알림 설정 업데이트 피드백
  - 계정 삭제 확인 모달(별도 프레임)
- Constraints:
  - 이메일 수정 불가 상태를 시각적으로 명확히 처리
  - 한국 전화번호 입력 규칙 반영
  - **데스크탑 기준 설계 필수**(프로필/알림/위험 구역 동시 스캔 우선)
  - 모달은 메인 프레임과 분리된 별도 프레임으로 설계
- Responsive Notes: 모바일 1열 가능하나 본 기준은 데스크탑 관리 화면
- Visual Direction: 상단은 브랜드 친화, 하단은 설정 안정감 + 위험 구역 대비 강조
- AI Prompt (모델-agnostic, 한국 기준):
  - Create a desktop-first Korean profile settings page with avatar management, immutable email field, notification toggles, and danger-zone account deletion.
  - Use separated modal frames for destructive confirmation and keep interaction feedback explicit.
