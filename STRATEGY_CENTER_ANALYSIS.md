# 전략센터 사이클 흐름 분석 및 개선 계획

> **작성일**: 2026-01-23
> **분석 범위**: 전략센터 전체 시스템 (KPI/OKR, 업무일지, 정산 연동, 알림 시스템)
> **목적**: 최신 업데이트 기반 동기화 및 고도화

---

## 📊 전체 시스템 맵

### 데이터 흐름 사이클

```
┌─────────────────────────────────────────────────────────────────┐
│                         전략 설정 단계                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Objective (목표)                                             │
│    └─ 2. 메인 KPI (okr_keyResults)                              │
│         └─ 3. 서브 KPI (okr_kpis)                               │
│              └─ 4. 총 성과지표 (NEW - index.html만 지원)         │
│                   └─ 5. 성과지표(단위별)                         │
│                        └─ 6. 하위지표 (NEW - index.html만 지원)  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         실행 및 기록 단계                         │
├─────────────────────────────────────────────────────────────────┤
│  7. 업무일지 (okr_dailyLogs)                                     │
│     ├─ 수동 입력 (okr-tracker.html, index.html)                 │
│     └─ 자동 연동 (정산 시스템)                                   │
│                                                                  │
│  8. 정산 시스템 (admin/index.html)                               │
│     ├─ 셀러 정산 완료 → 서브 KPI 자동 기록                       │
│     └─ 공급사 정산 완료 → 서브 KPI 자동 기록                     │
│                                                                  │
│  9. 알림 시스템 (notifications)                                  │
│     ├─ 서브 KPI 100% 달성 → 팀 전체 알림                         │
│     ├─ 메인 KPI 마일스톤 (50%, 80%, 100%) → 담당자 알림          │
│     ├─ 마감일 임박 (3일 전, 1일 전) → 담당자 알림                │
│     ├─ 팀 활동 기록 → 팀원 알림                                  │
│     └─ 정산 자동 연동 → 담당자 알림                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      분석 및 보고 단계                            │
├─────────────────────────────────────────────────────────────────┤
│  10. 대시보드 (index.html)                                       │
│      ├─ 실시간 진행률 모니터링                                   │
│      ├─ 마인드맵 뷰 (계층 구조 시각화)                           │
│      └─ 리스트 뷰 (상세 데이터)                                  │
│                                                                  │
│  11. 회의용 뷰 (kpi-meeting-view.html)                           │
│      ├─ 읽기 전용                                                │
│      ├─ 인쇄 기능                                                │
│      └─ 마인드맵 / 리스트 전환                                   │
│                                                                  │
│  12. 그로스보드 프레젠테이션 (growthboard-presentation.html)      │
│      ├─ 팀 요약 슬라이드                                         │
│      ├─ 개인별 통계                                              │
│      └─ 메인 KPI 상세 모달                                       │
│                                                                  │
│  13. 그로스보드 공유 (growthboard/songhee/index.html)            │
│      └─ 개인 성장 전략 발표 자료                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔴 발견된 주요 문제점

### 1. 데이터 구조 불일치 (Critical)

#### 문제 상황
- **index.html**: 새로운 4단계 계층 구조 사용
  - 서브 KPI → 총 성과지표 → 성과지표(단위별) → 하위지표 → 업무일지
  - Firebase 컬렉션: `okr_totalMetrics`, `okr_subIndicators` 사용

- **다른 파일들**: 기존 2단계 구조 사용
  - 서브 KPI → 성과지표 → 업무일지
  - 새 컬렉션 미사용

#### 영향
- **데이터 불일치**: 같은 서브 KPI인데 index.html과 okr-tracker.html에서 다른 달성률 표시 가능
- **기능 제약**: 새로운 계층 구조로 만든 서브 KPI는 다른 뷰에서 제대로 표시 안 됨
- **사용자 혼란**: 화면마다 다른 데이터를 보게 됨

#### 영향받는 파일
- ❌ `admin/strategy/okr-tracker.html` - 업무 기록 입력 화면
- ❌ `admin/strategy/kpi-meeting-view.html` - 회의용 조회 화면
- ❌ `admin/strategy/growthboard-presentation.html` - 프레젠테이션

---

### 2. 계산 로직 불일치

#### 문제 상황
**index.html**:
```javascript
// 하위지표가 있으면 하위지표 기준으로 집계
if (subIndicators.length > 0) {
  return subIndicators.reduce((sum, si) => sum + calcSubIndicatorValue(si.id), 0);
} else {
  // 기존: 직접 dailyLogs에서 계산
  return logs.reduce((s, l) => s + (l.resultValue || 0), 0);
}
```

**다른 파일들**:
```javascript
// 항상 직접 dailyLogs에서 계산
const logs = dailyLogs.filter(l => l.laggingIndicatorId === lag.id);
return logs.reduce((s, l) => s + (l.resultValue || 0), 0);
```

#### 영향
- 하위지표로 세분화한 서브 KPI의 경우:
  - index.html: 하위지표별 합계 계산 ✅
  - 다른 파일: 전체 logs만 보고 계산 (중복 또는 누락 가능) ❌

---

### 3. 정산 자동 연동 검증 필요

#### 현재 구조
```
정산 완료 (admin/index.html)
  ↓
syncSettlementToKPI() 호출
  ↓
okr_dailyLogs에 기록
  - laggingIndicatorId: 연동된 지표 ID
  - resultValue: 정산 금액
  - source: 'settlement_auto'
  - settlementId: 정산 ID
  ↓
알림 발송 (settlement_sync)
```

#### 검증 필요 사항
- [ ] linkedToSettlement 필드가 있는 지표만 연동되는가?
- [ ] 하위지표가 있는 경우 어느 지표에 기록되는가?
  - **문제**: 현재 코드는 `laggingIndicatorId`만 사용
  - **필요**: `subIndicatorId`도 고려해야 함
- [ ] 정산 취소 시 삭제 로직이 하위지표 고려하는가?
- [ ] 알림이 올바른 팀원에게 가는가?
- [ ] 메인 KPI 담당자에게도 알림이 전달되는가?

---

### 4. 알림 시스템 트리거 검증

#### 현재 알림 유형

| 알림 타입 | 트리거 위치 | 동작 확인 | 문제점 |
|----------|------------|----------|--------|
| `kpi_achieved` | index.html | ✅ | - |
| `main_kpi_milestone` | index.html | ✅ | - |
| `kpi_deadline` | index.html | ✅ | - |
| `team_activity` | index.html | ✅ | - |
| `settlement_sync` | admin/index.html | ⚠️ | 하위지표 미고려 |

#### 문제점
- **트리거 중복**: okr-tracker.html에서 업무 기록 시 알림 발송 안 됨
  - index.html에서만 `team_activity` 알림 발송
  - okr-tracker.html은 알림 시스템 없음
- **수신자 선택**: 팀원 목록을 어떻게 결정하는가?
  - 현재: 서브 KPI의 담당자 또는 팀 전체
  - 필요: 메인 KPI 단위, 프로젝트 단위 선택 가능해야 함

---

### 5. 그로스보드 데이터 일관성

#### 개인 그로스보드 (growthboard/songhee/index.html)
- **현재**: 정적 HTML (Firebase 미연동)
- **문제**: 전략센터 데이터와 별개로 관리됨
- **개선 필요**: 실시간 데이터 연동 또는 주기적 동기화

#### 그로스보드 프레젠테이션 (admin/strategy/growthboard-presentation.html)
- **현재**: 기존 구조만 사용
- **문제**: 새로운 계층 구조 반영 안 됨
- **필요**: totalMetrics, subIndicators 지원

---

## ✅ 개선 계획

### Phase 1: 긴급 동기화 (Critical)

#### 1.1 okr-tracker.html 업데이트
**목표**: 새로운 계층 구조 지원 + 알림 시스템 통합

**변경 사항**:
```javascript
// 데이터 로드
const totalMetricsSnapshot = await db.collection('okr_totalMetrics').get();
const subIndicatorsSnapshot = await db.collection('okr_subIndicators').get();

// UI에 하위지표 선택 추가
function renderRecordForm() {
  // 기존: 성과지표만 선택
  // 신규: 하위지표도 선택 가능

  if (selectedIndicator.subIndicators && selectedIndicator.subIndicators.length > 0) {
    // 하위지표 선택 드롭다운 표시
  }
}

// 계산 로직 수정
function calcIndicatorValue(indicatorId) {
  const subIndicators = state.subIndicators.filter(si => si.laggingIndicatorId === indicatorId);

  if (subIndicators.length > 0) {
    // 하위지표별 합계
    return subIndicators.reduce((sum, si) => {
      const logs = state.dailyLogs.filter(l => l.subIndicatorId === si.id);
      return sum + logs.reduce((s, l) => s + (l.resultValue || 0), 0);
    }, 0);
  } else {
    // 기존 방식
    const logs = state.dailyLogs.filter(l => l.laggingIndicatorId === indicatorId);
    return logs.reduce((s, l) => s + (l.resultValue || 0), 0);
  }
}

// 알림 시스템 추가
async function saveWorkLog(data) {
  // 로그 저장
  await db.collection('okr_dailyLogs').add(data);

  // 팀 활동 알림 발송
  await createNotification({
    recipientId: 'team', // 또는 특정 팀원들
    type: 'team_activity',
    message: `${memberName}님이 ${indicatorName}에 업무를 기록했습니다.`,
    targetId: indicatorId,
    targetType: 'laggingIndicator'
  });
}
```

**예상 작업량**: ~300줄 추가/수정

---

#### 1.2 kpi-meeting-view.html 업데이트
**목표**: 회의용 뷰에 새 계층 구조 표시

**변경 사항**:
```javascript
// 데이터 로드 동일하게 수정

// 마인드맵 뷰 수정
function renderMindmap() {
  keyResults.forEach(kr => {
    const subKpis = state.kpis.filter(kpi => kpi.keyResultId === kr.id);

    subKpis.forEach(kpi => {
      const totalMetrics = state.totalMetrics.filter(tm => tm.kpiId === kpi.id);

      if (totalMetrics.length > 0) {
        // 총 성과지표 → 단위별 성과지표 → 하위지표 계층 표시
        totalMetrics.forEach(tm => {
          const unitMetrics = state.laggingIndicators.filter(l =>
            l.totalMetricId === tm.id
          );

          unitMetrics.forEach(um => {
            const subIndicators = state.subIndicators.filter(si =>
              si.laggingIndicatorId === um.id
            );

            // 4단계 계층 렌더링
          });
        });
      } else {
        // 기존 방식 렌더링
      }
    });
  });
}

// 리스트 뷰도 동일하게 수정
```

**예상 작업량**: ~200줄 추가/수정

---

#### 1.3 정산 자동 연동 개선
**목표**: 하위지표 지원 + 데이터 정확성 향상

**admin/index.html 수정**:
```javascript
async function syncSettlementToKPI(settlement, type) {
  // 기존: linkedToSettlement로 성과지표 찾기
  const indicatorsSnapshot = await db.collection('okr_laggingIndicators')
    .where('linkedToSettlement', '==', type)
    .get();

  for (const indicatorDoc of indicatorsSnapshot.docs) {
    const indicator = { id: indicatorDoc.id, ...indicatorDoc.data() };

    // NEW: 하위지표가 있는지 확인
    const subIndicatorsSnapshot = await db.collection('okr_subIndicators')
      .where('laggingIndicatorId', '==', indicator.id)
      .get();

    let logData = {
      date: settlement.settlementDate || new Date().toISOString().split('T')[0],
      memberId: currentUser.uid,
      laggingIndicatorId: indicator.id,
      resultValue: type === 'seller' ? settlement.sellerAmount : settlement.supplierAmount,
      memo: `정산 자동 연동: ${settlement.productName}`,
      source: 'settlement_auto',
      settlementId: settlement.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // NEW: 하위지표가 있으면 기본 하위지표에 기록
    if (!subIndicatorsSnapshot.empty) {
      const defaultSubIndicator = subIndicatorsSnapshot.docs[0];
      logData.subIndicatorId = defaultSubIndicator.id;
    }

    await db.collection('okr_dailyLogs').add(logData);

    // 알림 발송
    await createNotification({
      recipientId: indicator.ownerId || 'admin',
      type: 'settlement_sync',
      message: `정산이 완료되어 ${indicator.name}에 자동으로 반영되었습니다.`,
      targetId: indicator.id,
      targetType: 'laggingIndicator'
    });
  }
}

// 정산 취소 시에도 하위지표 고려
async function removeSettlementFromKPI(settlementId) {
  const logsSnapshot = await db.collection('okr_dailyLogs')
    .where('settlementId', '==', settlementId)
    .get();

  const batch = db.batch();
  logsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
```

**예상 작업량**: ~100줄 수정

---

### Phase 2: 기능 고도화 (Important)

#### 2.1 growthboard-presentation.html 업데이트
**목표**: 프레젠테이션에 계층 구조 반영

**변경 사항**:
- 팀 요약 슬라이드에 총 성과지표 표시
- 메인 KPI 상세 모달에서 하위지표별 진척도 표시
- 개인 통계 계산 시 하위지표 고려

**예상 작업량**: ~250줄 추가/수정

---

#### 2.2 개인 그로스보드 동기화 옵션 추가
**목표**: growthboard/songhee/index.html과 전략센터 연동

**옵션 A**: 실시간 연동 (Firebase 추가)
```javascript
// OKR 데이터 실시간 로드
const db = firebase.firestore();

async function loadPersonalKPI(memberId) {
  const subKpisSnapshot = await db.collection('okr_kpis')
    .where('ownerId', '==', memberId)
    .get();

  // 개인 서브 KPI 기반 그로스보드 동적 생성
}
```

**옵션 B**: 정적 빌드 (주기적 업데이트)
- 전략센터에서 "그로스보드 내보내기" 기능 추가
- HTML 자동 생성 및 배포

**권장**: 옵션 A (실시간 연동)

**예상 작업량**: ~400줄 추가

---

#### 2.3 알림 시스템 고도화

**기능 추가**:
1. **알림 설정 커스터마이징**
   ```javascript
   // 사용자별 알림 설정
   const notificationSettings = {
     kpi_achieved: true,
     main_kpi_milestone: true,
     kpi_deadline: false, // 마감일 알림 끄기
     team_activity: true,
     settlement_sync: true
   };
   ```

2. **알림 스팸 방지**
   ```javascript
   // 같은 이벤트 중복 알림 방지 (1시간 이내)
   async function createNotification(data) {
     const recentNotifications = await db.collection('notifications')
       .where('recipientId', '==', data.recipientId)
       .where('type', '==', data.type)
       .where('targetId', '==', data.targetId)
       .where('createdAt', '>', Date.now() - 3600000)
       .get();

     if (!recentNotifications.empty) {
       return; // 중복 알림 방지
     }

     await db.collection('notifications').add(data);
   }
   ```

3. **알림 그룹화**
   - 같은 유형 알림을 하나로 묶어서 표시
   - 예: "3개의 KPI가 마감일이 다가옵니다"

**예상 작업량**: ~200줄 추가

---

### Phase 3: 검증 및 최적화 (Optimization)

#### 3.1 데이터 무결성 검증 스크립트
**목표**: 계층 구조 데이터 검증 자동화

```javascript
// 전략센터에 "데이터 검증" 버튼 추가
async function validateDataIntegrity() {
  const issues = [];

  // 1. totalMetricId가 있는데 kpiId가 없는 경우
  const orphanTotalMetrics = await db.collection('okr_totalMetrics')
    .get();

  for (const doc of orphanTotalMetrics.docs) {
    const tm = doc.data();
    const kpi = await db.collection('okr_kpis').doc(tm.kpiId).get();
    if (!kpi.exists) {
      issues.push(`총 성과지표 "${tm.name}"의 서브 KPI가 존재하지 않습니다.`);
    }
  }

  // 2. subIndicatorId가 있는데 laggingIndicatorId가 잘못된 경우
  const logs = await db.collection('okr_dailyLogs')
    .where('subIndicatorId', '!=', null)
    .get();

  for (const logDoc of logs.docs) {
    const log = logDoc.data();
    const si = await db.collection('okr_subIndicators').doc(log.subIndicatorId).get();

    if (!si.exists) {
      issues.push(`업무일지 ${logDoc.id}의 하위지표가 존재하지 않습니다.`);
    } else if (si.data().laggingIndicatorId !== log.laggingIndicatorId) {
      issues.push(`업무일지 ${logDoc.id}의 지표 연결이 일치하지 않습니다.`);
    }
  }

  // 3. 결과 출력
  if (issues.length > 0) {
    console.error('데이터 무결성 문제 발견:', issues);
    alert(`${issues.length}개의 데이터 문제가 발견되었습니다. 콘솔을 확인하세요.`);
  } else {
    alert('데이터 무결성 검증 완료! 문제가 없습니다.');
  }
}
```

**예상 작업량**: ~300줄 추가

---

#### 3.2 성능 최적화

**문제점**:
- 매번 전체 컬렉션 로드 → 대량 데이터 시 느림

**개선**:
```javascript
// 페이지네이션
const logsQuery = db.collection('okr_dailyLogs')
  .where('laggingIndicatorId', '==', lagId)
  .orderBy('date', 'desc')
  .limit(50); // 최근 50개만

// 인덱스 활용
// Firebase Console에서 복합 인덱스 생성 필요:
// - laggingIndicatorId + subIndicatorId + date
// - kpiId + totalMetricId

// 캐싱
const cache = {
  kpis: null,
  laggingIndicators: null,
  lastUpdated: null
};

async function loadKPIs(forceRefresh = false) {
  if (!forceRefresh && cache.kpis && Date.now() - cache.lastUpdated < 60000) {
    return cache.kpis; // 1분 이내면 캐시 사용
  }

  const kpisSnapshot = await db.collection('okr_kpis').get();
  cache.kpis = kpisSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  cache.lastUpdated = Date.now();

  return cache.kpis;
}
```

**예상 작업량**: ~150줄 수정

---

#### 3.3 모바일 최적화

**현재 문제**:
- 마인드맵 뷰가 모바일에서 보기 어려움
- 입력 폼이 작은 화면에서 불편함

**개선**:
```css
/* 모바일 전용 레이아웃 */
@media (max-width: 768px) {
  .mindmap-node {
    font-size: 12px;
    padding: 8px;
  }

  .record-form {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
  }

  /* 스와이프로 닫기 */
  .form-handle {
    width: 40px;
    height: 4px;
    background: #ccc;
    border-radius: 2px;
    margin: 8px auto;
  }
}
```

**예상 작업량**: ~100줄 추가

---

## 📋 작업 우선순위 요약

| 우선순위 | 작업 | 파일 | 예상 작업량 | 영향도 |
|---------|-----|------|------------|--------|
| 🔴 P0 | okr-tracker.html 동기화 | okr-tracker.html | ~300줄 | High |
| 🔴 P0 | kpi-meeting-view.html 동기화 | kpi-meeting-view.html | ~200줄 | High |
| 🔴 P0 | 정산 연동 개선 | admin/index.html | ~100줄 | High |
| 🟡 P1 | growthboard-presentation.html 업데이트 | growthboard-presentation.html | ~250줄 | Medium |
| 🟡 P1 | 알림 시스템 고도화 | admin/strategy/index.html | ~200줄 | Medium |
| 🟡 P1 | 개인 그로스보드 동기화 | growthboard/songhee/index.html | ~400줄 | Medium |
| 🟢 P2 | 데이터 검증 스크립트 | admin/strategy/index.html | ~300줄 | Low |
| 🟢 P2 | 성능 최적화 | 전체 | ~150줄 | Low |
| 🟢 P2 | 모바일 최적화 | 전체 CSS | ~100줄 | Low |
| 🟢 P3 | 용어 표준화 | 전체 문서 | ~50줄 | Low |

**총 예상 작업량**: ~2,000줄

---

## 🎯 기대 효과

### 동기화 후
1. **데이터 일관성 보장**
   - 모든 화면에서 동일한 달성률 표시
   - 계층 구조 정확히 반영

2. **사용자 경험 개선**
   - 어떤 화면에서든 동일한 기능 사용 가능
   - 혼란 없는 일관된 인터페이스

3. **자동화 강화**
   - 정산 연동이 하위지표까지 정확히 반영
   - 알림이 모든 입력 경로에서 작동

### 고도화 후
1. **실시간 협업**
   - 팀원 활동 즉시 공유
   - 알림으로 진행 상황 추적

2. **데이터 신뢰성**
   - 자동 검증으로 오류 사전 방지
   - 무결성 보장

3. **확장성**
   - 새로운 계층 추가 용이
   - 대량 데이터 처리 가능

---

## 🚀 실행 계획

### Week 1: P0 작업 (긴급)
- Day 1-2: okr-tracker.html 동기화
- Day 3-4: kpi-meeting-view.html 동기화
- Day 5: 정산 연동 개선 + 테스트

### Week 2: P1 작업 (중요)
- Day 1-2: growthboard-presentation.html 업데이트
- Day 3: 알림 시스템 고도화
- Day 4-5: 개인 그로스보드 동기화

### Week 3: P2 작업 + 검증 (최적화)
- Day 1-2: 데이터 검증 스크립트 + 전체 검증
- Day 3: 성능 최적화
- Day 4: 모바일 최적화
- Day 5: 최종 통합 테스트

---

## 📝 체크리스트

### 동기화 완료 확인
- [ ] okr-tracker.html에서 하위지표 선택 가능
- [ ] kpi-meeting-view.html에서 총 성과지표 표시
- [ ] growthboard-presentation.html에서 계층 구조 반영
- [ ] 정산 연동 시 하위지표 고려
- [ ] 모든 화면에서 동일한 서브 KPI 달성률 계산

### 고도화 완료 확인
- [ ] 모든 입력 경로에서 알림 발송
- [ ] 알림 스팸 방지 작동
- [ ] 데이터 검증 스크립트 실행 가능
- [ ] 성능 개선 (로딩 시간 50% 감소)
- [ ] 모바일 반응형 정상 작동

### 테스트 시나리오
- [ ] 새 메인 KPI 생성 → 서브 KPI 추가 → 총 성과지표 추가 → 하위지표 추가 → 업무 기록
- [ ] 모든 뷰에서 동일한 데이터 표시 확인
- [ ] 정산 완료 → 서브 KPI 자동 반영 → 알림 수신 확인
- [ ] 그로스보드 프레젠테이션에서 계층 구조 확인
- [ ] 데이터 검증 스크립트로 무결성 확인

---

**다음 단계**: P0 작업부터 순차적으로 진행
**예상 완료일**: 3주 후
**담당**: Claude Code
**세션**: claude/document-recent-changes-f9TEG

---

## 📌 용어 표준화 (2026-01-23 업데이트)

### 적용된 용어 변경
- **"KR" 또는 "Key Results"** → **"메인 KPI"** (okr_keyResults)
- **"KPI" (단독)** → **"서브 KPI"** (okr_kpis)
- **"kr_milestone" 알림** → **"main_kpi_milestone" 알림**

### 계층 구조 확정
```
목표 (Objective, okr_objective)
 └─ 메인 KPI (okr_keyResults)
      └─ 서브 KPI (okr_kpis)
           └─ 총 성과지표 (okr_totalMetrics)
                └─ 성과지표 (okr_laggingIndicators)
                     └─ 하위지표 (okr_subIndicators)
                          └─ 업무일지 (okr_dailyLogs)
```

### 수정 대상 파일
1. ✅ STRATEGY_CENTER_ANALYSIS.md - 용어 표준화 완료
2. ✅ CHANGELOG.md - 용어 표준화 완료
3. ⏳ 실제 코드 구현 (okr-tracker.html, kpi-meeting-view.html, 등)
