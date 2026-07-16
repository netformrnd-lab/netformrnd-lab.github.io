# 모여라딜 전략센터 (admin/strategy/index.html) 재생성 프롬프트

## 프로젝트 개요

전략센터는 모여라딜의 **전략 기획 및 성과 관리** 시스템입니다. 영업 현황 대시보드, OKR 기반 목표 관리, KPI 트래킹, 업무일지, 분기 리뷰, 레퍼런스 관리를 담당합니다.

---

## 기술 스택

- 단일 HTML 파일 (Vanilla JS)
- Firebase Firestore (실시간 onSnapshot)
- PWA 지원 (`/admin/manifest.json` 공유)
- vConsole 모바일 디버깅 도구 (기본 버튼 숨김, 커스텀 버튼 사용)
- 외부 CDN: Pretendard 폰트, Firebase Compat SDK, vConsole

---

## 디자인 시스템

### CSS 변수 — 블루 테마 + 무채색 상태 컬러
```css
:root {
  --primary: #3182f6;       /* 메인 컬러 - 블루 */
  --primary-light: #eef4ff;
  --primary-dark: #1b64da;
  --white: #ffffff;

  /* 그레이스케일: admin과 동일 */
  --gray-900: #191f28 ~ --gray-50: #f9fafb;

  /* 무채색 기반 상태 색상 (중요한 것만 파란색) */
  --success: #6b7684;       /* 회색 (일반적으로 초록이지만 여기서 무채색) */
  --success-light: #f2f4f6;
  --warning: #8b95a1;
  --warning-light: #f9fafb;
  --danger: #4e5968;
  --danger-light: #f2f4f6;
  --info: #3182f6;          /* 파란색만 유채색 유지 */
  --info-light: #eef4ff;

  --card-radius: 16px;
  --card-shadow: 0 2px 8px rgba(0,0,0,0.06);
  --btn-radius: 8px;
}
```

### 디자인 특징
- 전략센터만의 **무채색 상태 컬러**: success/warning/danger가 모두 그레이 계열
- 파란색(info/primary)만 유채색으로 강조 → 깔끔하고 전문적인 느낌
- 나머지 레이아웃/컴포넌트 패턴은 admin과 동일

---

## 페이지 구조

### HTML 레이아웃
```
<body>
  <!-- 로그인 화면 -->
  <div id="login-screen" class="login-screen">...</div>

  <!-- 앱 컨테이너 -->
  <div id="app-wrapper" class="app-container" style="display:none">
    <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
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
- **전략센터** (`/admin/strategy/`) - 현재 페이지, 블루 하이라이트
- **CRM센터** (`/admin/crm/`) - 그린

### 사이드바 메뉴 구조
```
로고 (logo-horizontal.png)
유저 프로필 (이름, 역할, 아바타)

📁 영업 대시보드
  📊 영업 현황 → tab: dashboard
  📅 미팅 히스토리 → tab: meeting-history

📁 그로스보드
  🎯 OKR 대시보드 → tab: okr-dashboard
  👤 개인 그로스보드 → tab: okr-personal-dashboard
  🧪 OKR 실험실 → tab: okr-experiment

📁 설정
  ⚙️ OKR 설정 → tab: okr-settings
  📋 변경 이력 → tab: change-logs

📁 레퍼런스
  📖 가이드 → tab: guide
  📚 레퍼런스 → tab: reference
  🔍 트렌드 키워드 → tab: trendKeywords

📁 업무 관리
  📋 업무 계획 → tab: task-plan
```

**초기 탭**: URL 파라미터(`?tab=xxx`) 지원, 기본값은 `dashboard`

---

## 모듈 상세 명세

### 1. 영업 현황 대시보드 (tab: dashboard)
**렌더 함수**: `renderSalesDashboard()` → `renderSalesDashboardContent()`

**기능**:
- 매출 KPI 대시보드
- 분기별 핵심 지표 (Key Results)
- 매출 목표 대비 달성률
- 공구 진행 현황 요약
- 팀원별 성과 비교
- 분기 선택 드롭다운

### 2. 미팅 히스토리 (tab: meeting-history)
**렌더 함수**: `renderMeetingHistory()`

**기능**:
- 이번 주 미팅 (`renderThisWeekMeetings()`)
- 미팅 캘린더 (`renderMeetingCalendar()`)
- 미팅 이력 리스트 (`renderMeetingHistoryList(meetings)`)
- 미팅 노트 작성/조회 (tab: meeting-notes → `renderMeetingNotes()`)

### 3. OKR 대시보드 (tab: okr-dashboard)
**렌더 함수**: `renderOkrDashboard()`

**기능**:
- 팀 전체 OKR 현황
- Objective별 Key Results 달성률
- 프로젝트 연동
- 시각적 진행률 바

### 4. 개인 그로스보드 (tab: okr-personal-dashboard)
**렌더 함수**: `renderPersonalGrowthboard()`

**기능**:
- 개인별 OKR 진행 현황
- 나의 Key Results 달성률
- 담당 업무 현황
- 개인 성장 트래킹

### 5. OKR 실험실 (tab: okr-experiment)
**렌더 함수**: `renderOkrExperiment()`

**기능**:
- OKR 가설 검증 실험
- 실험 기록 및 결과 분석
- 학습 포인트 도출

### 6. OKR 설정 (tab: okr-settings)
**렌더 함수**: `renderOkrSettings()`

**기능**:
- OKR 분기 설정
- 팀원 역할 배정
- KPI 계층 구조 설정

### 7. 변경 이력 (tab: change-logs)
**렌더 함수**: `renderChangeLogs()`

**기능**:
- 모든 데이터 변경 이력 조회
- `okr_changeLogs` 컬렉션에서 로그 조회
- 변경 유형별 색상:
  - create(추가): success/초록
  - update(수정): primary/파랑
  - delete/soft_delete(삭제): danger/빨강
  - revert(복원): 보라 (#7C3AED)
- 변경 데이터 복원 기능
- 변경 전/후 비교

### 8. 가이드 (tab: guide)
**렌더 함수**: `renderGuide()`

- 전략센터 사용 가이드
- 업무 프로세스 안내

### 9. 레퍼런스 (tab: reference)
**렌더 함수**: `renderReferences()` → `renderReferenceList(references)`

**기능**:
- 참고 자료 등록/관리
- 카테고리 필터 (`renderCategoryFilters()`, `renderCategoryOptions()`)
- 카테고리 관리 (`renderCategoryList()`)
- 이미지 첨부 미리보기 (`renderRefImagesPreview()`)
- 레퍼런스 카드 UI
- `refCategories` 컬렉션으로 카테고리 관리

### 10. 트렌드 키워드 (tab: trendKeywords)
**렌더 함수**: `renderTrendKeywords()`

- 시장 트렌드 키워드 관리
- 키워드 사이트 링크 (`renderKeywordSiteLinks()`)

### 11. 업무 계획 (tab: task-plan)
**렌더 함수**: `renderTaskPlan()`

- 업무 계획 수립
- 태스크 보드

---

## KPI 관리 시스템

전략센터의 핵심 기능인 **KPI 계층 구조**:

### KPI 계층
```
연간 목표 (yearlyGoals)
  └── 메가 프로젝트 (megaProjects)
      └── 프로젝트 (projects)
          ├── 팀 KPI (teamKPIs)
          │   └── 개인 KPI (memberKPIs)
          └── 업무/태스크 (tasks)
```

### 렌더 함수
- `renderKPIManagement()`: KPI 관리 메인
- `renderKPIHierarchyView()`: 계층 구조 뷰
- `renderTeamKPIView()`: 팀 KPI 뷰
- `renderMemberKPIView()`: 개인 KPI 뷰
- `renderKPICard(kpi, type)`: 개별 KPI 카드

### 업무 보드
- `renderWeeklyTaskBoard()`: 주간 업무 보드
- `renderWeeklyGanttBars()`: 간트 차트 바
- `renderWeeklyGoalDashboard()`: 주간 목표 대시보드
- `renderCalendarGrid()`: 캘린더 그리드
- `renderWeeklyGoalsCards()`: 주간 목표 카드

---

## 업무일지 시스템

### 렌더 함수
- `renderWorkLog()`: 업무일지 메인
- `renderWorkLogStats()`: 업무 통계
- `renderWorkLogContent()`: 업무 내용
- `renderKanbanView(container)`: 칸반 뷰
- `renderTimelineView(container)`: 타임라인 뷰
- `renderLaggingIndicators(allTasks)`: 지연 지표

### 기능
- 일일 업무 기록
- OKR 연동 (어떤 OKR에 기여하는 업무인지)
- 칸반/타임라인 멀티뷰
- 업무 통계 (완료율, 지연 건수)
- 팀원별 업무 현황

---

## 분기 리뷰

### 렌더 함수
- `renderStrategicReview()`: 전략 리뷰 메인
- `renderReviewSummary()`: 리뷰 요약
- `renderReverseDataView()`: 역추적 데이터 뷰 (목표 → 프로젝트 → KPI → 업무)
- `renderMemberSuccessRates()`: 팀원별 성공률

### 기능
- 분기별 OKR 달성률 분석
- 메가프로젝트 → 프로젝트 → 팀KPI → 개인KPI 역추적
- 팀원별 성과 분석
- 연간 목표 대비 진행률

---

## 연간 목표 대시보드

### 렌더 함수
- `renderYearlyGoalsDashboard()`: 연간 목표 전체 현황

### 기능
- 연간 매출 목표 설정 및 트래킹
- 분기별 목표 배분
- 달성률 시각화

---

## Firebase 컬렉션 (실시간 리스너)

| 컬렉션 | 정렬 | 설명 |
|---------|------|------|
| `deals` | startDate desc | 공구 데이터 |
| `suppliers` | name | 공급사 |
| `projects` | createdAt desc | 프로젝트 |
| `references` | createdAt desc | 레퍼런스 자료 |
| `refCategories` | order asc | 레퍼런스 카테고리 |
| `sellers` | name | 셀러 |
| `sellerList` | createdAt desc | 셀러 리스트 |
| `sellerProposals` | where type=='recruitment', createdAt desc | 셀러 제안 |
| `productList` | createdAt desc | 상품 목록 |
| `sellerSettlements` | settlementDate desc | 셀러 정산 |
| `supplierSettlements` | settlementDate desc | 공급사 정산 |
| `teamMembers` | name | 팀원 |
| `notifications` | createdAt desc, limit 50 | 알림 |
| `settings/strategy` | (단일 doc) | 전략 설정 |
| `yearlyGoals` | year asc | 연간 목표 |
| `megaProjects` | createdAt desc | 메가 프로젝트 |
| `teamKPIs` | createdAt desc | 팀 KPI |
| `memberKPIs` | createdAt desc | 개인 KPI |
| `tasks` | createdAt desc | 업무/태스크 |
| `strategyVersions` | createdAt desc | 전략 버전 |

### 전략센터 고유 컬렉션
- `projects`: 프로젝트 관리
- `references`: 레퍼런스 자료
- `refCategories`: 레퍼런스 카테고리
- `notifications`: 알림 시스템
- `settings/strategy`: 전략 설정
- `yearlyGoals`: 연간 목표
- `megaProjects`: 메가 프로젝트
- `teamKPIs`: 팀 KPI
- `memberKPIs`: 개인 KPI
- `strategyVersions`: 전략 문서 버전
- `okr_changeLogs`: OKR 변경 이력

---

## 알림 시스템

### 기능
- `renderNotificationList()`: 알림 리스트 렌더링
- 알림 읽음 처리: `notifications` doc 업데이트
- 일괄 읽음 처리: batch update
- 알림 생성: 다양한 이벤트에서 `notifications` 컬렉션에 추가
- 최근 50개까지 실시간 조회

---

## 인증 시스템

admin과 동일:
- teamMembers 컬렉션 기반 로그인
- admin 역할 검증 (팀원 관리, 설정 등)
- sessionStorage 세션 관리
- 비밀번호: settings/admin doc

---

## 하위 파일 구조

```
admin/strategy/
├── index.html                  ← 이 문서의 대상
├── kpi-task-manager.html       ← KPI 업무 관리자
├── growthboard-*.html          ← 그로스보드 템플릿들
└── 기타 지원 파일
```

---

## admin/strategy vs admin2의 그로스보드 차이

| 항목 | admin/strategy/ | admin2/ |
|------|----------------|---------|
| 포커스 | 전략 기획 + KPI + 리뷰 | 전략 + 운영 통합 |
| KPI 계층 | 완전한 5단계 계층 | 간소화된 OKR |
| 미팅 관리 | 있음 | 없음 |
| 변경 이력 | 있음 (okr_changeLogs) | 없음 |
| 레퍼런스 | 있음 (카테고리 관리) | 간소화 |
| 트렌드 키워드 | 있음 | 없음 |
| 연간 목표 | 있음 (yearlyGoals) | strategy2026 |
| 운영 기능 | 없음 | 있음 (공구/정산 등) |
| 상태 컬러 | 무채색 (블루만 유채색) | 컬러풀 (admin 동일) |
