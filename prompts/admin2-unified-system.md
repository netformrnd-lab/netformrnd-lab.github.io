# 모여라딜 통합 관리자 시스템 (admin2/index.html) 재생성 프롬프트

## 프로젝트 개요

"모여라딜"은 공동구매 중개 플랫폼입니다. admin2는 **통합 관리자 시스템**으로, 운영(공구/파트너/주문/정산)과 전략(그로스보드/OKR/업무일지)을 하나의 페이지에서 관리합니다. admin(운영센터)과 admin/strategy(전략센터)의 핵심 기능을 결합한 올인원 시스템입니다.

---

## 기술 스택

- **프론트엔드**: 단일 HTML 파일 (Vanilla JS, 프레임워크 없음)
- **스타일**: 인라인 `<style>` CSS
- **데이터베이스**: Firebase Firestore (실시간 onSnapshot)
- **인증**: Firebase teamMembers 컬렉션
- **PWA**: manifest.json + Service Worker (`sw.js`)
- **외부 CDN**:
  - Pretendard 폰트
  - Firebase Compat SDK v10.7.1
  - SheetJS (XLSX)

---

## Firebase 설정

admin/index.html과 동일한 Firebase 프로젝트 사용:
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

  /* 상태 색상 */
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
  --highlight-border: #F59E0B;
  --highlight-text: #92400E;
}
```

### 디자인 특징
- admin/index.html과 동일한 디자인 시스템 (오렌지 테마)
- Pretendard 폰트, 토스 스타일 UI
- 반응형: 사이드바 모바일 슬라이드 오프, 카드 뷰 전환

---

## 페이지 구조

### HTML 레이아웃
```
<body>
  <!-- 1. 로그인 화면 -->
  <div id="login-screen" class="login-screen">
    로고 + 로그인 폼 (아이디/비밀번호/기억하기)
  </div>

  <!-- 2. 앱 래퍼 -->
  <div id="app-wrapper" style="display:none">
    <div class="sidebar-overlay" onclick="closeMobileMenu()"></div>
    <div class="app-container">
      <aside class="sidebar" id="sidebar">
        <!-- 로고, 유저 프로필, 폴더 메뉴 -->
      </aside>
      <main class="main-content">
        <div id="app"><!-- 동적 콘텐츠 --></div>
      </main>
    </div>
  </div>

  <!-- 3. 모바일 FAB -->
  <div class="mobile-fab-container">
    <div class="mobile-fab-menu">공구현황, 주문관리, 전략기획</div>
    <div class="mobile-fab-btn" onclick="toggleMobileFAB()">+</div>
  </div>

  <!-- 4. 토스트, 모달 -->
  <div class="toast" id="toast"></div>
  <div class="modal" id="modal"></div>
</body>
```

### 사이드바 네비게이션
```
로고 (logo-horizontal.png)
유저 프로필 (이름, 아이디/역할)

📁 그로스보드 (보라 그라데이션 헤더)
  📖 전략센터 사용 가이드 → tab: teamGuide (노란 하이라이트)
  📋 2026 전략기획 → tab: strategy2026
  🎯 OKR 관리 → tab: okrManagement
  📝 업무일지 → tab: workLog
  📊 현황 대시보드 → tab: growthDashboard
  🔍 분기 리뷰 → tab: okrReview

📁 레퍼런스 라이브러리 (보라 그라데이션 헤더)
  → tab: referenceLibrary (직접 클릭)

📁 시스템 관리
  👥 팀원 관리 → tab: teamMembers
  📊 데이터 사용량 → tab: dataUsage
  ⚙️ 카페24 API 설정 → tab: cafe24Settings

🔒 비밀번호 변경
🚪 로그아웃
```

**초기 탭**: `strategy2026` (2026 전략기획이 기본 화면)

### 모바일 FAB
- 공구현황 → dealManagement
- 주문관리 → cafe24Orders
- 전략기획 → strategy2026

---

## 모듈 상세 명세 — 그로스보드 (전략)

### 1. 전략센터 사용 가이드 (tab: teamGuide)
**렌더 함수**: `renderTeamGuide()`

**기능**:
- "전략센터는 왜 필요한가?" 핵심 목적 카드 (그린 그라데이션)
- 워크플로우 사이클 (5단계 그리드):
  ① 전략기획 → ② OKR 관리 → ③ 업무일지 → ④ 현황 대시보드 → ⑤ 분기 리뷰
  - 각 단계 클릭 시 해당 탭으로 이동
- 각 메뉴별 상세 설명 카드

### 2. 2026 전략기획 (tab: strategy2026)
**렌더 함수**: `renderStrategy2026()`

**기능**:
- 연간 목표 설정 (매출 목표, 핵심 가치)
- 전략 방향 관리 (전략 버전 관리)
- 전략 설정 (팀원별 담당 영역, 분기별 목표)
- 전략 문서 편집 + 버전 히스토리
- `renderStrategy2026Content(data)`: 전략 데이터 기반 대시보드

### 3. OKR 관리 (tab: okrManagement)
**렌더 함수**: `renderOKRManagement()`

**기능**:
- 분기별 OKR 목록 표시
- OKR 추가/수정/삭제
- 팀원별 OKR 할당
- Key Results 진행률 트래킹
- 전략 연계 표시
- `renderOKRList(okrs, teamMembers, strategyList)`: OKR 카드 리스트

### 4. 업무일지 (tab: workLog)
**렌더 함수**: `renderWorkLog()`

**기능**:
- 오늘의 업무 기록 (OKR 연동)
- 자동 로그 섹션 (`renderAutoLogSection`): 운영 활동 자동 기록
- 업무 통계 (`renderWorkLogStats`)
- 칸반 보드 뷰 (`renderKanbanBoard`)
- 타임라인 뷰 (`renderTimelineView`)
- 루틴 섹션 (`renderRoutineSection`)

### 5. 현황 대시보드 (tab: growthDashboard)
**렌더 함수**: `renderGrowthDashboard()`

**기능**:
- OKR 달성률 종합 대시보드
- 팀원별 성과 현황
- 매출 추이
- 공구 진행 현황
- 전략 실행 진행률
- `renderGrowthDashboardContent(currentOkrs, allOkrs, tasks, teamMembers, deals, settlements, sellers, totalSales, currentYear, quarterKey, strategy)`: 종합 데이터 대시보드

### 6. 분기 리뷰 (tab: okrReview)
**렌더 함수**: `renderOKRReviewDashboard()`

**기능**:
- 분기별 OKR 달성률 리뷰
- 분기 회고 작성
- 성과 분석 리포트
- `renderQuarterReview(okrs, teamMembers, quarter)`

---

## 모듈 상세 명세 — 운영

### 7. 캘린더 (tab: calendar)
**렌더 함수**: `renderCalendar()`

admin/index.html의 캘린더와 동일한 구조:
- 월간 그리드, 공구 뱃지, 필터, 통계 카드
- 공급사/셀러/둘다 색상 코딩

### 8. 공구 관리 (tab: dealManagement)
**렌더 함수**: `renderDealManagement()`

admin/index.html과 동일:
- 4섹션 (협의중/진행중/진행예정/완료)
- 3단계 체크리스트 (준비/마케팅/정산)
- D-Day 표시

### 9. 공급사 관리 (tab: suppliers)
**렌더 함수**: `renderSuppliers()`

- 공급사 DB 테이블
- 계약 상태별 분류
- 판매 통계 및 순위
- 공급사 추가/수정 모달
- 온보딩 상태 관리

### 10. 셀러 관리 (tab: sellers)
**렌더 함수**: `renderSellers()`

- 셀러 DB
- 카테고리별 분류
- 매출 통계

### 11. 상품 DB (tab: productDB)
**렌더 함수**: `renderProductDB()`

- 전체 상품 목록
- 공급사별 그룹화
- 검색, 엑셀 일괄등록

### 12. 주문 관리 (tab: cafe24Orders)
**렌더 함수**: `renderCafe24Orders()` → `renderCafe24OrdersUI()`

- 페이지네이션 테이블/모바일 카드 뷰
- 필터 (검색, 셀러, 공급사, 날짜)
- 일괄 작업

### 13. 정산 관리 (tab: settlement)
**렌더 함수**: `renderSettlement()`

- 정산서 생성 및 관리
- 셀러/공급사 정산 분리

### 14. 매출 리포트 (tab: salesReport)
**렌더 함수**: `renderSalesReport()`

- 매출 현황 분석
- 마진 계산 시나리오 (`renderCalcScenarios`)

### 15. 레퍼런스 라이브러리 (tab: referenceLibrary)
**렌더 함수**: `renderReferenceLibrary()`

- 참고 자료 관리
- 가이드 문서
- 템플릿

---

## Firebase 컬렉션 (실시간 리스너)

| 컬렉션 | 정렬 |
|---------|------|
| `deals` | startDate desc |
| `suppliers` | name |
| `sellers` | name |
| `sellerList` | accountName |
| `productList` | createdAt desc |
| `products` | order |
| `sellerSettlements` | createdAt desc |
| `supplierSettlements` | createdAt desc |
| `settlementBrands` | name |
| `supplierProducts` | brandName |
| `partnerMessages` | createdAt desc |
| `partnerNotices` | createdAt desc |
| `dealSuggestions` | createdAt desc |
| `adminProposals` | createdAt desc |
| `teamMembers` | createdAt desc |
| `urgentSales` | createdAt desc |
| `sellerProposals` | createdAt desc |
| `settings/salesGoals` | (단일 doc) |
| `settings/memberGoals` | (단일 doc) |

---

## switchTab 라우팅 — 전체 탭 목록

```javascript
function switchTab(tab) {
  switch(tab) {
    // 운영
    case 'calendar': renderCalendar(); break;
    case 'deals': renderDeals(); break;
    case 'suppliers': renderSuppliers(); break;
    case 'sellers': renderSellers(); break;
    case 'sellerList': renderSellerList(); break;
    case 'products': renderProducts(); break;
    case 'productDB': renderProductDB(); break;
    case 'productList': renderProductList(); break;
    case 'dealManagement': renderDealManagement(); break;
    case 'settlement': renderSettlement(); break;
    case 'salesReport': renderSalesReport(); break;
    case 'shareLinks': renderShareLinks(); break;
    case 'partnerMessages': renderPartnerMessages(); break;
    case 'partnerNotices': renderPartnerNotices(); break;
    case 'proposalManagement': renderProposalManagement(); break;
    case 'teamMembers': renderTeamMembers(); break;
    case 'dataUsage': renderDataUsage(); break;
    case 'inquiries': renderInquiries(); break;
    case 'urgentSales': renderUrgentSales(); break;
    case 'dealCenter': renderDealCenter(); break;
    case 'cafe24Dashboard': renderCafe24Dashboard(); break;
    case 'orderStatus': renderOrderStatus(); break;
    case 'cafe24Orders': renderCafe24Orders(); break;
    case 'cafe24Stats': renderCafe24Stats(); break;
    case 'cafe24Settings': renderCafe24Settings(); break;
    case 'cafe24SettlementData': renderCafe24SettlementData(); break;
    case 'cafe24Rankings': renderCafe24Rankings(); break;
    case 'guide': renderGuide(); break;

    // 전략/그로스보드
    case 'growthDashboard': renderGrowthDashboard(); break;
    case 'strategyManagement': renderStrategyManagement(); break;
    case 'growthGuide': renderGrowthGuide(); break;
    case 'workLog': renderWorkLog(); break;
    case 'taskManagement': renderTaskManagement(); break;
    case 'okrManagement': renderOKRManagement(); break;
    case 'okrReview': renderOKRReviewDashboard(); break;
    case 'strategy2026': renderStrategy2026(); break;
    case 'referenceLibrary': renderReferenceLibrary(); break;
    case 'teamGuide': renderTeamGuide(); break;
  }
}
```

---

## 인증 시스템

admin/index.html과 동일:
- 팀원 계정 로그인 (teamMembers 컬렉션)
- 마스터 계정 하드코딩
- sessionStorage 기반 세션
- 역할: admin, manager, staff, guest
- 비밀번호 변경 기능 (settings/admin doc)

---

## PWA 설정

- manifest: `/admin/manifest.json` (admin과 공유)
- theme-color: `#fc9600`
- Service Worker: `/admin2/sw.js`
- iOS Safari 지원: apple-mobile-web-app 메타태그
- 설치 프롬프트: Android + iOS 분기 처리

---

## admin vs admin2 차이점

| 항목 | admin/ | admin2/ |
|------|--------|---------|
| 역할 | 운영센터 (일상 운영) | 통합 시스템 (운영+전략) |
| 기본 화면 | 캘린더 | 2026 전략기획 |
| 사이드바 포커스 | 운영 폴더 (공구/정산/해결필요) | 그로스보드 (전략/OKR/업무일지) |
| 센터 네비게이션 바 | 있음 (운영/전략/CRM) | 없음 |
| Quick Hub (MODi) | 있음 | 없음 |
| 글로벌 검색 | 있음 | 없음 |
| 정산 매핑 모달 | 있음 (3단계) | 있음 |
| OKR/전략 | 없음 | 있음 (핵심) |
| 레퍼런스 라이브러리 | 없음 | 있음 |
| CRM 연동 | 있음 (센터 바) | 없음 |
