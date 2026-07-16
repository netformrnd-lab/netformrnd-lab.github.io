# 모여라딜 운영센터 (admin/index.html) 재생성 프롬프트

## 프로젝트 개요

"모여라딜"은 공동구매 중개 플랫폼으로, 공급사(브랜드)와 셀러(인플루언서)를 연결하여 공동구매(공구)를 진행하는 B2B 비즈니스입니다. 이 파일은 **운영센터** — 일상 운영 업무를 관리하는 관리자 대시보드입니다.

---

## 기술 스택

- **프론트엔드**: 단일 HTML 파일 (프레임워크 없음, Vanilla JS)
- **스타일**: `<style>` 태그 내 CSS (외부 CSS 파일 없음)
- **스크립트**: `<script>` 태그 내 JS (외부 JS 파일 없음, 라이브러리만 CDN)
- **데이터베이스**: Firebase Firestore (실시간 onSnapshot 리스너)
- **인증**: Firebase 기반 팀원 계정 (teamMembers 컬렉션)
- **PWA**: manifest.json + Service Worker로 모바일 앱처럼 설치 가능
- **외부 라이브러리 (CDN)**:
  - Pretendard 폰트: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`
  - SheetJS (XLSX): `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
  - PptxGenJS: `https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js`
  - EmailJS: `https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js`
  - Firebase Compat SDK v10.7.1

---

## Firebase 설정

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAQf_Cu9wMji5QsMBQns5eg6nOD_vmrZMs",
  authDomain: "moyeora-deal-manager.firebaseapp.com",
  projectId: "moyeora-deal-manager",
  storageBucket: "moyeora-deal-manager.firebasestorage.app",
  messagingSenderId: "527148187832",
  appId: "1:527148187832:web:dc35b0413a7157db34744d",
  measurementId: "G-XEGLCEG93R"
};
```

---

## 디자인 시스템

### CSS 변수

```css
:root {
  /* 메인 브랜드 컬러 - 오렌지 */
  --primary: #fc9600;
  --primary-light: #fff8f0;
  --primary-dark: #e08600;
  --white: #ffffff;

  /* 토스 스타일 그레이스케일 */
  --gray-900: #191f28;
  --gray-800: #333d4b;
  --gray-700: #4e5968;
  --gray-600: #6b7684;
  --gray-500: #8b95a1;
  --gray-400: #b0b8c1;
  --gray-300: #d1d6db;
  --gray-200: #e5e8eb;
  --gray-100: #f2f4f6;
  --gray-50: #f9fafb;

  /* 상태 컬러 */
  --success: #00c073;
  --success-light: #e8f7f0;
  --warning: #fc9600;
  --warning-light: #fff8f0;
  --danger: #f04452;
  --danger-light: #fff0f1;
  --info: #3182f6;
  --info-light: #eef4ff;

  /* UI 상수 */
  --card-radius: 16px;
  --card-shadow: 0 2px 8px rgba(0,0,0,0.06);
  --btn-radius: 8px;
  --section-radius: 12px;
  --kpi-gradient: linear-gradient(135deg, #fc9600, #e08600);
  --highlight-bg: linear-gradient(135deg, #FEF3C7, #FDE68A);
}
```

### 타이포그래피
- 폰트: `'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- 페이지 제목: 22px, weight 700
- 카드 제목: 16px, weight 700
- 본문: 14-15px, line-height 1.5
- 라벨/메타: 12-13px
- 뱃지: 10-11px, weight 600
- `-webkit-font-smoothing: antialiased`

### 컴포넌트 스타일

**버튼 (.btn)**:
- 기본: padding 10px 16px, radius 8px, font-size 14px, weight 600
- `.btn-primary`: 오렌지 배경, 흰색 텍스트
- `.btn-secondary`: 흰색 배경, gray-700 텍스트, gray-300 테두리
- `.btn-ghost`: 투명 배경, gray-600 텍스트
- `.btn-sm`: 6px 12px padding, 13px font, 6px radius
- 활성 상태: `transform: scale(0.98)`

**카드 (.card)**:
- 흰색 배경, 12px radius, 20px padding, 16px margin-bottom

**통계 카드 (.stat-card)**:
- `.stats-row` 그리드 (기본 4열) 안에 배치
- 10px radius, 16px padding
- `.highlight` 변형: 오렌지 배경 + 흰색 텍스트

**상태 뱃지 (.status-badge)**:
- `.status-negotiating`: gray-100 bg, gray-600 text (협의중)
- `.status-confirmed`: info-light bg, info text (확인됨)
- `.status-ongoing`: success-light bg, success text (진행중)
- `.status-completed`: gray-100 bg, gray-400 text (완료)

**폼 요소**:
- 입력/선택/텍스트에리어: 10px 12px padding, gray-300 border, 6px radius
- Focus: gray-400 border, 3px gray-100 ring
- `.form-row`: 2열 grid, 12px gap
- `.form-label`: 13px, weight 600, gray-700

**모달 (.modal)**:
- Fixed overlay, rgba(0,0,0,0.5) 배경
- `.modal-content`: 흰색 배경, 12px radius, 24px padding, max-width 520px
- 진입 애니메이션: `modalIn` (translateY + opacity)

**테이블 (.data-table)**:
- 전체 너비, 헤더 gray-50 배경, 12px font
- 셀: 12px padding, 13px font
- Row hover: gray-50 배경
- 모바일 640px: 마지막 열 sticky-right + shadow

**토스트**: 하단 중앙 고정, gray-900 배경, 흰색 텍스트, 2.5초 자동 숨김

### 반응형 브레이크포인트
1. **1200px**: 통계 그리드 2열로 전환
2. **900px** (모바일):
   - 모바일 메뉴 버튼 표시
   - 사이드바 왼쪽으로 슬라이드 오프 (`translateX(-100%)`)
   - 버튼 최소 높이 44px (터치 타겟)
   - 입력 font-size 16px (iOS 줌 방지)
   - 테이블 → 카드 뷰로 전환
3. **640px**: 통계 1열, 제목 20px
4. **480px**: padding 12px, 카드 radius 8px

---

## 페이지 구조

### HTML 레이아웃
```
<body>
  <!-- 1. 로그인 화면 -->
  <div id="login-screen" class="login-screen">
    <div class="login-container">
      <div class="login-logo"><img src="/admin/logo-horizontal.png"></div>
      <div class="login-card">로그인 폼 (아이디, 비밀번호, 기억하기)</div>
    </div>
  </div>

  <!-- 2. 앱 래퍼 (로그인 후 표시) -->
  <div id="app-wrapper" style="display:none">
    <!-- 사이드바 -->
    <aside class="sidebar" id="sidebar">
      <!-- 로고, 유저 프로필, 글로벌 검색, 폴더 메뉴 -->
    </aside>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <!-- 센터 네비게이션 바 -->
      <div class="center-nav-bar">
        운영센터 | 전략센터 | CRM센터
      </div>
      <div id="app"><!-- 동적 콘텐츠 렌더링 영역 --></div>
    </main>

    <!-- 모바일 FAB -->
    <div class="mobile-fab" id="mobile-fab">...</div>
  </div>

  <!-- 3. 토스트, 모달 -->
  <div class="toast" id="toast"></div>
  <div class="modal" id="modal"></div>

  <!-- 4. Quick Hub (MODi) - 플로팅 AI 어시스턴트 -->
  <div id="quick-hub-container">...</div>
</body>
```

### 센터 네비게이션 바 (상단)
3개 센터 간 이동하는 상단 바:
- **운영센터** (`/admin/`) - 현재 페이지, 오렌지 하이라이트
- **전략센터** (`/admin/strategy/`) - 블루 테마
- **CRM센터** (`/admin/crm/`) - 그린 테마

### 사이드바 네비게이션 (폴더 기반)
```
📁 업무 관리
  📁 공구센터
    📅 캘린더 → tab: calendar
    📦 공구 관리 → tab: dealManagement
    🏷️ 상품 DB → tab: productDB
    ✨ 신규 공구 제안 → tab: dealCenter
  📋 주문 현황 → tab: orderStatus (파트너용 뱃지)

📁 정산 관리
  📤 엑셀 업로드 & 매핑 → openCafe24MappingModal()
  📝 주문 관리 → tab: cafe24Orders
  💰 정산서 생성 & 관리 → tab: settlement

📁 🚨 해결필요 (노란 하이라이트)
  📄 대기 서류 → CRM 외부 링크
  ⚠️ 정산 지연 → tab: settlementIssues
  🔧 데이터 오류 → tab: dataErrors

📁 시스템 관리 (admin 전용)
  👥 팀원 관리 → tab: teamMembers
  📊 데이터 사용량 → tab: dataUsage
  ⚙️ 카페24 API 설정 → tab: cafe24Settings
  🗑️ 휴지통 → tab: trash
  📁 고급 설정
    🔧 시스템 설정 → openAdminSettings()
    💾 데이터 백업 → exportAllData()
    🔄 데이터 복원 → openRestoreModal()

🔒 비밀번호 변경
🚪 로그아웃
```

폴더 토글: `toggleFolder(folderId)` — CSS max-height 트랜지션으로 열기/닫기. localStorage에 상태 저장.

---

## 모듈 상세 명세

### 1. 캘린더 (tab: calendar)
**렌더 함수**: `renderCalendar()`

**기능**:
- 월간 캘린더 그리드 (일~토 7열)
- **통계 행** (4개 상태 카드, 클릭하면 필터된 공구 리스트 표시):
  - 협의중, 진행예정(오늘 < startDate), 진행중(startDate ≤ 오늘 ≤ endDate), 진행완료(오늘 > endDate)
- **필터 바**: 보기 필터(전체/공급사/셀러/둘다), 공급사 드롭다운, 셀러 드롭다운
- **캘린더 날짜**: 공구 뱃지 색상 코딩
  - `.deal-badge.supplier` (파랑/info)
  - `.deal-badge.seller` (오렌지/primary)
  - `.deal-badge.both` (초록/success)
- 오늘 날짜 primary 테두리 강조
- 일요일/토요일 색상 (빨강/파랑)
- 정산 필요 경고 표시
- 네비게이션: prevMonth(), nextMonth(), goToday()
- 범례: 공급사/셀러/둘다 색상 표시

### 2. 공구 관리 (tab: dealManagement)
**렌더 함수**: `renderDealManagement()`

**기능**:
- 페이지 제목: "공구 현황/체크리스트"
- 4개 접힘 섹션으로 공구 분류:
  1. **협의중** (기본 접힘)
  2. **진행중** (펼침, endDate 오름차순)
  3. **진행 예정** (펼침, startDate 오름차순)
  4. **완료** (기본 접힘)
- **테이블 열**: D-Day, 공구명, 공급사, 셀러, 준비(파랑), 마케팅(노랑), 정산(초록), 상태, 관리
- **3단계 체크리스트** (인라인 토글 버튼):
  - **준비**: 샘플전달, 결제링크, 콘텐츠, 가이드 (4개)
  - **마케팅**: 광고세팅 (1개)
  - **정산**: 발주서전달, 셀러정산서, 공급사정산서, 정산완료 (4개)
- D-Day 표시: 예정 "D-X", 진행중 "X일 중 Y일차", 종료 "종료"
- 체크리스트 항목 Firebase 동기화 → 업무 자동 생성 가능

### 3. 공구 모달 (openDealModal)
**함수**: `openDealModal(deal)`

**폼 필드**:
- 공급사 (select)
- 셀러 (select)
- 공구명 (셀러 이름 기반 자동 생성)
- 카페24 상품번호 (주문 매칭용)
- 공구 기간 (커스텀 캘린더 UI, 시작~종료일 선택, 기간 자동 계산 "(X일)")
- 상품 선택 (공급사 상품 DB에서 검색, 태그 UI, 개별 마진율)
- 상태 (협의중/협의완료 라디오)
- 공구 여정 체크리스트 (협의완료 시 표시):
  - 준비: 샘플전달, 결제링크전달, 콘텐츠전달, 광고세팅, 셀러가이드전달
  - 진행: 주문현황모니터링, 고객문의대응
  - 정산: 발주서전달, 셀러정산서제작, 공급사정산서제작, 정산완료
  - 진행률 바: "X/X 완료"
  - "미완료 항목 → 업무로 생성" 버튼
- 분석 정보: 컨텐츠가이드지원(full/partial/none), 소비자만족도(excellent/good/normal/bad)
- 셀러 마진율 (%, 기본값 20%)
- 이벤트비용 (원)
- 메모 (textarea)
- **수정 모드 추가 필드**:
  - 공구 현황 요약: 주문수, 주문금액, 체크리스트 진행률, 정산 상태
  - 셀러 전용 링크 (복사 + 카카오톡 공유 버튼)
  - 삭제 버튼

### 4. 공구 제안 관리 (tab: dealCenter)
**렌더 함수**: `renderDealCenter()`

**3탭 인터페이스**:
1. **공급사 긴급요청**: 공급사가 등록한 긴급 판매 요청 목록
2. **셀러 받은 제안**: 셀러가 제출한 제안서 목록
3. **보낸 제안**: 관리자가 셀러에게 보낸 제안 목록

**기능**:
- 승인된 제안 알림 배너 (캘린더 등록 안내)
- 탭 전환 시 오렌지 그라데이션 활성 스타일
- "셀러에게 제안" 기본 액션 버튼
- 승인 → 캘린더 등록 플로우

### 5. 공급사 관리 (tab 내 탭: suppliers)
**렌더 함수**: `renderSuppliers()`

**탭 네비게이션**: 입점 공급사 | 상품 DB | 입점신청/서류 → CRM
**기능**:
- 공급사 응대 핵심 메시지 배너
- **통계 행 1** (3열): 전체 공급사, 총 판매액, 총 판매건
- **통계 행 2** (4열): 계약완료, 계약진행중, 온보딩완료, 총 상품수
- **통계 행 3** - 판매 순위 (4열 그리드):
  - 브랜드 판매량 TOP 5 (금/은/동 메달)
  - 공구 진행 건수 TOP 5
  - 판매 베스트 상품 TOP 5
  - 판매 저조 브랜드 bottom 3
- **계약 완료 테이블** (초록 테두리): 공급사명, 유형(자사/타사), 상품수, 온보딩, 총판매액, 총판매건, 담당자, 수정
- **계약 진행중 테이블** (파랑 테두리): 인라인 계약 상태 드롭다운 (대기/발송/완료)

### 6. 셀러 관리 (tab: sellers)
**렌더 함수**: `renderSellers()`

**탭 네비게이션**: 셀러 DB | 셀러 리스트 | 입점 신청 내역 (대기 뱃지)
**기능**:
- 셀러 응대 팁 배너 (노란 그라데이션)
- **통계** (4열): 전체 셀러, 총 판매액, 총 마진금, 총 판매건
- 카테고리: 육아, 식품, 미용, 생활, 취미, 건강
- 매출 등급 세분화 (100만+, 500만+, 1000만+ 셀러)
- 대량 등록 지원

### 7. 상품 DB (tab: productDB)
**렌더 함수**: `renderProductDB()`

**기능**:
- 통계: 전체 상품, 공급사 수, 자사 상품, 타사 상품
- 상품명/브랜드명/대표상품 검색
- 공급사별 그룹화 표시
- 연결 링크: 캘린더 공구 등록, 매출관리 내역서, 공구 진행 관리
- 액션: 양식 다운로드, 엑셀 일괄등록, 상품 등록

### 8. 정산 관리 — Cafe24 매핑 모달
**함수**: `openCafe24MappingModal()`

**3단계 프로세스**:

**Step 1 - 엑셀 업로드**:
- .xlsx/.xls/.csv 파일 업로드
- SheetJS로 파싱
- 추출 필드: 주문번호, 상품번호, 자체상품코드, 공급사, 상품명(관리용), 수량, 상품구매금액, 총주문금액, 결제수단
- 상품 DB와 자동 매핑 (공급가, 마진율)
- Firebase `cafe24_orders` 컬렉션에 저장
- productCode + unitPrice로 그룹화

**Step 2 - 자동 분류 & 공구 매핑**:
- 그룹화된 상품에 자동 매칭된 공구 표시
- "상품명(관리용)"에서 셀러 이름 추출
- 셀러명 + 상품명 유사도로 공구 매칭
- 수동 오버라이드 (공구 드롭다운)
- "전체 자동확정" 일괄 버튼

**Step 3 - 정산 미리보기**:
- 정산 계산 미리보기
- "일괄 매핑 적용" 최종 버튼

### 9. 주문 관리 (tab: cafe24Orders)
**렌더 함수**: `renderCafe24OrdersUI()`

**기능**:
- 페이지네이션 (20건/페이지) + 모바일 카드 뷰
- **필터**: 텍스트 검색(주문번호/수령인/전화번호), 셀러, 공급사/브랜드, 상품유형(자사/타사), 날짜 범위
- **일괄 작업**: 전체 선택, 선택 삭제, 전체 삭제
- **테이블 열**: 체크박스, 주문번호, 주문일, 구분, 브랜드, 셀러, 상품명, 수령인, 수량, 결제금액, 상태, 송장번호, 관리
- **모바일**: 스와이프-왼쪽으로 수정/삭제 버튼 노출
- 엑셀 내보내기 기능
- 모바일 빠른 필터 칩: 전체, 오늘, 이번 주, 이번 달

### 10. 팀원 관리 (tab: teamMembers)
**렌더 함수**: `renderTeamMembers()`

**기능**:
- 통계: 전체 팀원, 관리자, 매니저, 일반, 게스트
- 테이블: 이름, 아이디, 역할, 등록일, 관리
- 역할별 색상 뱃지: admin(빨강), manager(오렌지), guest(노랑), staff(회색)
- 팀원 추가/수정 모달

### 11. 업무 가이드 (tab: guide)
**렌더 함수**: `renderGuide()`

**6탭 시스템**:
1. **본질 메시지**: 3개 가치 제안 카드 (공급사/셀러/소비자)
2. **업무 프로세스**: 단계별 워크플로우
3. **파트너 응대**: 스크립트 및 팁
4. **메뉴 설명**: 기능 설명
5. **주요 기능**: 기능 요청 수집
6. **파이프라인**: 비즈니스 플로우

---

## Firebase 데이터 모델

### 실시간 리스너 (onSnapshot) 컬렉션 목록

| 컬렉션 | 정렬 | state 속성 |
|---------|------|-----------|
| `deals` | startDate desc | `state.deals` |
| `suppliers` | name | `state.suppliers` |
| `sellers` | name | `state.sellers` |
| `sellerList` | accountName | `state.sellerList` |
| `sellerApplications` | createdAt desc | `state.sellerApplications` |
| `supplierApplications` | createdAt desc | `state.supplierApplications` |
| `dealProposals` | createdAt desc | `state.dealProposals` |
| `pendingOnboardings` | submittedAt desc | `state.pendingOnboardings` |
| `pendingSupplierOnboardings` | createdAt desc | `state.pendingSupplierOnboardings` |
| `productList` | createdAt desc | `state.productList` |
| `deletedItems` | deletedAt desc | `state.deletedItems` |
| `onboardingGuides` | order | `state.onboardingGuides` |
| `supplierInquiries` | createdAt desc | `state.supplierInquiries` |
| `sellerInquiries` | createdAt desc | `state.sellerInquiries` |
| `proposalRequests` | createdAt desc | `state.proposalRequests` |
| `products` | order | `state.products` |
| `sellerSettlements` | createdAt desc | `state.sellerSettlements` |
| `supplierSettlements` | createdAt desc | `state.supplierSettlements` |
| `contentFeeSettlements` | createdAt desc | `state.contentFeeSettlements` |
| `settlementBrands` | name | `state.settlementBrands` |
| `supplierProducts` | brandName | `state.supplierProducts` |
| `partnerMessages` | createdAt desc | `state.partnerMessages` |
| `partnerNotices` | createdAt desc | `state.partnerNotices` |
| `dealSuggestions` | createdAt desc | `state.dealSuggestions` |
| `adminProposals` | createdAt desc | `state.adminProposals` |
| `teamMembers` | createdAt desc | `state.teamMembers` |
| `urgentSales` | createdAt desc | `state.urgentSales` |
| `tasks` | createdAt desc | `state.tasks` |
| `sellerProposals` | createdAt desc | `state.sellerProposals` |
| `settings/salesGoals` | (단일 doc) | `state.salesGoals` |
| `settings/admin` | (단일 doc) | `adminPassword` |
| `cafe24_orders` | (on-demand) | `state.cafe24Orders` |

### 엔티티 스키마

**Deal (공구)**
```javascript
{
  id, title, supplierId, sellerId,
  startDate, endDate,  // YYYY-MM-DD
  status: 'negotiating' | 'confirmed',
  notes, cafe24ProductNo,
  selectedProducts: [{ productId, productName, marginRate }],
  supplierSettled: boolean, sellerSettled: boolean,
  sellerMarginRate: number, eventCost: number,
  contentGuide: 'full'|'partial'|'none',
  satisfaction: 'excellent'|'good'|'normal'|'bad',
  // 여정 체크리스트 (11개 boolean):
  journeySample, journeyPaymentLink, journeyContent,
  journeyAdSetup, journeySellerGuide,
  journeyMonitoring, journeyCs,
  journeyOrderSend, journeySellerSettle,
  journeySupplierSettle, journeyComplete,
  createdAt, updatedAt
}
```

**Supplier (공급사)**
```javascript
{
  id, name,
  supplierType: 'inhouse'|'external',
  contractStatus: 'pending'|'sent'|'contracted'|'completed',
  contact, managerName,
  onboardingData, onboardingDocuments,
  registeredBy
}
```

**Seller (셀러)**
```javascript
{
  id, name, nickname, category,
  contactInfo, onboarding, contracted, contacted,
  registeredBy
}
```

**Cafe24 Order (카페24 주문)**
```javascript
{
  order_id, product_no, order_date,
  product_code, supplier_name, seller_name,
  seller_full_name, product_type: 'inhouse'|'external',
  product_name, product_option,
  quantity, unit_price, total_amount,
  supply_price, margin_rate,
  payment_status, payment_method, pg_fee,
  buyer_name, buyer_phone, shipping_address,
  tracking_number, synced_at
}
```

**Settlement (정산)**
```javascript
{
  id, brandName, sellerName, salesAmount,
  salesItems: [{ productName, quantity, amount, marginAmount }],
  settlementDate, registeredBy, createdAt
}
```

**Task (업무)**
```javascript
{
  id, title, dueDate,
  status: 'pending'|'in_progress'|'completed',
  category, assignee, assigneeId,
  priority: 'high'|'urgent'|'normal',
  completedAt, createdAt, source, activityType
}
```

**Team Member (팀원)**
```javascript
{
  id, name, loginId, password,
  role: 'admin'|'manager'|'staff'|'guest',
  createdAt
}
```

---

## 인증 & 권한 시스템

### 로그인
- 팀원 계정: Firebase `teamMembers` 컬렉션 기반
- 마스터 계정: `admin` / `ahdufk124!` (하드코딩)
- 세션: `sessionStorage`에 로그인 상태 저장
- 기억하기: `localStorage`에 저장

### 역할 기반 접근 제어
- **admin**: 전체 접근, 시스템 관리 가능
- **manager**: 편집 가능, 시스템 관리 불가
- **staff**: 편집 가능
- **guest**: 읽기 전용 (노란 배너), 모든 편집/삭제 차단

### 게스트 제한 시스템
- 차단: 체크박스, 수정/삭제/등록/저장/추가/보내기/완료 버튼
- 허용: 조회/검색/다운로드/Excel/닫기/이전/다음
- 파일 업로드 차단
- Select 변경 차단 (필터 제외)

---

## 특수 기능

### 글로벌 검색
- 사이드바 유저 프로필 아래 위치
- 300ms 디바운스 실시간 검색
- 검색 대상: deals(title), suppliers(name), sellers(name)
- 결과 드롭다운: 아이콘, 이름, 유형, 서브텍스트
- 클릭 시 해당 탭으로 이동 + 모달 열기

### 소프트 삭제
- `softDelete()`: `deletedItems` 컬렉션으로 이동
- 저장: originalCollection, originalId, 전체 데이터 백업, deletedAt, deletedBy
- 휴지통 탭에서 조회 및 복원 가능

### 활동 로깅
- `logActivityToWorkLog()`: 작업 내용을 `tasks` 컬렉션에 자동 기록
- source: `operations-auto`

### 모바일 최적화
- 스와이프 제스처: 주문 카드 왼쪽 스와이프 → 수정/삭제 노출
- 모바일 FAB (플로팅 액션 버튼): 공구현황, 주문관리, 정산 바로가기
- 카드 뷰 대체 (테이블 → 카드)
- 수평 스크롤 통계 (snap 포인트)
- 최소 44px 터치 타겟

### Quick Hub / MODi
- 우하단 플로팅 로봇 버튼 (아이언맨 아크 리액터 스타일)
- 다크 테마 패널 (gradient #0f172a → #1e293b)
- 시안 강조색 (#38bdf8)
- 3개 탭: AI(Jarvis), Alerts, Today
- 뱃지 카운터, 글로우 애니메이션

### 세금 상수
```javascript
const TAX_RATE = 0.033;        // 종합 3.3%
const TAX_RATE_INCOME = 0.03;  // 사업소득세 3%
const TAX_RATE_LOCAL = 0.003;  // 지방소득세 0.3%
```

---

## PWA 설정

### manifest.json
- theme_color: `#fc9600`
- 아이콘: `icon-192.png`, `icon-512.png`

### iOS Safari
- `apple-mobile-web-app-capable: yes`
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `apple-mobile-web-app-title: 모여라딜`

### 설치 프롬프트
- Android/Chrome: `beforeinstallprompt` 캡처, 오렌지 그라데이션 설치 배너
- iOS: 공유 → "홈 화면에 추가" 안내 커스텀 배너
- 하단 80px 위치, `slideUp` 애니메이션

---

## 외부 연동

### Cafe24 이커머스
- OAuth 콜백 핸들러 (code, state, error 파라미터)
- 주문 엑셀 임포트 파서
- 상품 매칭 (자체상품코드, 상품명)
- PG 수수료 계산: 카드 결제 4%
- API 설정 탭: `cafe24Settings`

### KakaoTalk
- `shareSellerLinkKakao()`: 셀러 전용 상품 페이지 링크 공유

---

## 탭 라우팅 (switchTab)

`switchTab(tab)` 함수에서 처리하는 모든 탭:
```
calendar, dealManagement, productDB, dealCenter,
orderStatus, cafe24Orders, settlement,
settlementIssues, dataErrors,
teamMembers, dataUsage, cafe24Settings, trash,
suppliers (내부 탭: 입점공급사/상품DB/입점신청),
sellers (내부 탭: 셀러DB/셀러리스트/입점신청내역),
guide (6개 서브탭),
partnerMessages, partnerNotices,
salesDashboard
```

각 탭은 `render()` 함수 내에서 `state.currentTab`에 따라 해당 렌더 함수를 호출합니다.
