# 모여라딜 CRM센터 (admin/crm/index.html) 재생성 프롬프트

## 프로젝트 개요

CRM센터는 모여라딜의 **고객 관계 관리** 시스템입니다. 공급사/셀러 인바운드 관리, 제안서 생성, 온보딩 문서 관리, SMS 발송, 파트너 응대를 담당합니다.

---

## 기술 스택

- 단일 HTML 파일 (Vanilla JS)
- Firebase Firestore (실시간 onSnapshot)
- PWA 지원 (`/admin/manifest.json` 공유)
- 외부 CDN: Pretendard 폰트, Firebase Compat SDK

---

## 디자인 시스템

### CSS 변수 — 그린 테마
```css
:root {
  --primary: #00c073;       /* 메인 컬러 - 그린 */
  --primary-light: #e8f7f0;
  --primary-dark: #00a060;
  --white: #ffffff;

  /* 그레이스케일: admin과 동일 */
  --gray-900: #191f28 ~ --gray-50: #f9fafb;

  /* 상태 색상: admin과 동일 */
  --success: #00c073; --warning: #fc9600;
  --danger: #f04452; --info: #3182f6;

  --card-radius: 16px;
  --card-shadow: 0 2px 8px rgba(0,0,0,0.06);
  --btn-radius: 8px;
}
```

### 디자인 특징
- admin과 동일한 UI 패턴 (카드, 버튼, 모달, 테이블)
- 차이: primary 컬러가 그린 (#00c073)
- 로그인 화면, 사이드바, 반응형 동일한 구조

---

## 페이지 구조

### HTML 레이아웃
```
<body>
  <!-- 로그인 화면 -->
  <div id="login-screen" class="login-screen">...</div>

  <!-- 앱 컨테이너 -->
  <div id="app-wrapper" class="app-container" style="display:none">
    <aside class="sidebar">
      <!-- 로고, 유저 프로필, 사이드바 메뉴 -->
    </aside>
    <main class="main-content">
      <!-- 센터 네비게이션 바 -->
      <div class="center-nav">운영센터 | 전략센터 | CRM센터</div>
      <div id="app"><!-- 동적 콘텐츠 --></div>
    </main>
  </div>

  <div class="toast" id="toast"></div>
  <div class="modal" id="modal"></div>
</body>
```

### 센터 네비게이션 바
- **운영센터** (`/admin/`) - 오렌지
- **전략센터** (`/admin/strategy/`) - 블루
- **CRM센터** (`/admin/crm/`) - 현재 페이지, 그린 하이라이트

### 사이드바 메뉴 구조
```
📁 인바운드 관리
  📨 인바운드 관리 → tab: inboundManage (기본 탭)
  📄 온보딩 서류 → tab: onboardingDocs (대기 뱃지)

📁 제안 관리
  🟢 셀러 제안 센터 → tab: sellerProposalCenter
  🔵 공급사 제안 센터 → tab: supplierProposalCenter

📁 파트너 DB
  🏢 공급사 관리 → tab: suppliers
  👤 셀러 관리 → tab: sellers
  🔗 공유 링크 → tab: shareLinks
  📢 공지사항 → tab: partnerNotices

📁 제안서 관리 (외부 링크)
  셀러 제안서 관리 → /seller/proposal-manager.html (새 탭)
  공급사 제안서 관리 → /supplier/proposal-manager.html

📁 온보딩 링크 (복사 버튼)
  🟢 공급사 온보딩 링크 복사 (초록 배경)
  🟡 셀러 온보딩 링크 복사 (노랑 배경)
  🔵 입점 신청 링크 복사 (파랑 배경)

📁 SMS 관리
  📤 SMS 발송 → tab: smsSend
  📋 SMS 템플릿 → tab: smsTemplates
  📜 발송 이력 → tab: smsHistory
  ⚙️ SMS 설정 → tab: smsSettings

📁 응대 가이드
  📞 통화 스크립트 → /admin/crm/tone-manner/ (외부)

📁 계약 관리
  📝 계약 관리 → tab: contractManage

📁 분석 (비활성)
  📊 전환율 분석 (준비중)
  📈 파이프라인 분석 (준비중)
  🎯 리드 스코어링 (준비중)
```

---

## 모듈 상세 명세

### 1. 인바운드 관리 (tab: inboundManage)
**렌더 함수**: `renderInboundList()`

**기능**:
- 공급사/셀러 인바운드 문의 통합 관리
- 상태별 필터: 처리중, 전달완료, 승인, 완료, 거절
- 상태 뱃지:
  - processing: 노랑 (#fef3c7/#d97706)
  - sent: 파랑 (#dbeafe/#2563eb)
  - approved: 초록 (#d1fae5/#059669)
  - completed: 초록
- 인바운드 상세 모달 (상태 변경, 메모, 담당자 지정)
- 통합 타임라인 (`renderUnifiedTimeline()`): 모든 활동 시간순 표시
- 고객 니즈 탭 (`renderCustomerNeedsTab()`)
- CS 관리 탭 (`renderCSManageTab()`)

### 2. 온보딩 서류 (tab: onboardingDocs)
**렌더 함수**: `renderOnboardingDocs()`

**기능**:
- 대기중인 온보딩 서류 목록
- 서류 카드 UI (`renderOnboardingCard(doc)`)
- 공급사/셀러 서류 분류
- 서류 승인/반려 워크플로우
- 뱃지로 대기 건수 표시

### 3. 셀러 제안 센터 (tab: sellerProposalCenter)
**렌더 함수**: `renderSellerProposalCenter()`

**기능**:
- 셀러별 제안서 관리
- 최근 제안 목록 (`renderSpcRecentProposals()`)
- 커스텀 제안 방법 (`renderSpcCustomMethods()`)
- 파이프라인 관리

### 4. 공급사 제안 센터 (tab: supplierProposalCenter)
**렌더 함수**: `renderSupplierProposalCenter()`

**기능**:
- 공급사별 제안서 관리
- 파이프라인 뷰 (`renderSupcPipeline()`)
- 커스텀 방법 (`renderSupcCustomMethods()`)
- 제안서 승인/거절 워크플로우

### 5. 제안서 빌더
**렌더 함수**: `renderProposalBuilder()`

**기능**:
- PDF 기반 제안서 생성기
- 오버레이 리스트 (`renderOverlayList()`)
- 오버레이 편집 모드 (`renderOverlayEditMode()`)
- PDF 위에 오버레이 렌더링 (`renderOverlaysOnPdf()`)
- 제안서 그리드 (`renderProposalGrid(allProposals)`)
- 제안서 리스트 (`renderProposalList()`)

### 6. 공급사 관리 (tab: suppliers)
**렌더 함수**: `renderSuppliersTab()` / `renderSuppliersTable()`

- CRM 관점의 공급사 관리
- CRM 상품 DB (`renderCRMProductDB()`)
- 파트너 응대 이력
- 계약 상태 관리

### 7. 셀러 관리 (tab: sellers)
**렌더 함수**: `renderSellersTab()`

- 셀러 리스트 관리 (`renderSellerListManage()`)
- 상품 리스트 관리 (`renderProductListManage()`)
- 셀러 신청 내역 (`renderSellerApplications()`)
- 공급사 신청 내역 (`renderSupplierApplications()`)

### 8. 공유 링크 (tab: shareLinks)
**렌더 함수**: `renderShareLinksTab()`

- 파트너용 공유 링크 관리
- 온보딩 링크, 제안서 링크 등

### 9. 공지사항 (tab: partnerNotices)
**렌더 함수**: `renderPartnerNoticesTab()`

- 파트너 대상 공지 작성/관리
- 공지 CRUD

### 10. SMS 관리
**렌더 함수들**:
- `renderSmsSendTab()`: SMS 발송 화면
- `renderSmsTemplatesTab()` / `renderSmsTemplateGrid()`: 템플릿 관리
- `renderSmsHistoryList()`: 발송 이력

**기능**:
- SMS 메시지 작성 및 발송
- 템플릿 저장/불러오기
- 발송 이력 조회
- SMS 설정 관리

### 11. 계약 관리 (tab: contractManage)
- 계약서 관리
- 계약 상태 추적

---

## Firebase 컬렉션 (실시간 리스너)

| 컬렉션 | 정렬 |
|---------|------|
| `suppliers` | name |
| `sellers` | name |
| `adminProposals` | createdAt desc |
| `sellerProposals` | createdAt desc |
| `proposalDerivatives` | createdAt desc |
| `dealSuggestions` | createdAt desc |
| `dealProposals` | createdAt desc |
| `deals` | startDate desc |
| `productList` | createdAt desc |
| `supplierProducts` | brandName |
| `sellerList` | accountName |
| `sellerApplications` | createdAt desc |
| `supplierApplications` | createdAt desc |
| `supplierInquiries` | createdAt desc |
| `sellerInquiries` | createdAt desc |
| `proposalRequests` | createdAt desc |
| `phoneInquiries` | createdAt desc |
| `pendingSupplierOnboardings` | createdAt desc |
| `pendingOnboardings` | createdAt desc |
| `shareLinks` | createdAt desc |
| `partnerNotices` | createdAt desc |

### CRM 고유 컬렉션
- `phoneInquiries`: 전화 문의 기록
- `proposalDerivatives`: 제안서 파생 버전
- `shareLinks`: 공유 링크

---

## 하위 파일 구조

```
admin/crm/
├── index.html              ← 이 문서의 대상
├── proposal-generator/
│   └── index.html          ← 제안서 생성기 도구
└── tone-manner/
    └── index.html          ← 통화 스크립트 템플릿
```

### proposal-generator
- PDF 기반 시각적 제안서 빌더
- 드래그 앤 드롭 오버레이 편집
- 텍스트/이미지/도형 오버레이 배치
- PDF 내보내기

### tone-manner
- 인바운드 콜 스크립트 (상황별)
- 셀러별 맞춤 응대 가이드
- 공급사 응대 매뉴얼
- 클레임 대응 프로세스

---

## 인증 시스템

admin과 동일:
- teamMembers 컬렉션 기반 로그인
- 마스터 계정 하드코딩
- 역할 기반 접근 제어 (admin/manager/staff/guest)
- sessionStorage 세션 관리

---

## 특수 기능

### 온보딩 링크 복사 기능
- `copySupplierOnboardingLink()`: 공급사 온보딩 페이지 URL 복사
- `copySellerOnboardingLink()`: 셀러 온보딩 페이지 URL 복사
- `copyApplyLink()`: 입점 신청 페이지 URL 복사
- 클립보드 복사 + 토스트 피드백

### 소프트 삭제
admin과 동일한 `softDelete()` 패턴:
- `deletedItems` 컬렉션으로 이동
- 원본 데이터 백업 저장
