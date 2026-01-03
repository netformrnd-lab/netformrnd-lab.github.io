# 모여라딜 인바운드 시스템 구축 - 내일 작업 목록

> **작성일**: 2026-01-03
> **목표**: 고객 유입 추적 및 관리자 대시보드 구축
> **예상 소요 시간**: 5.5시간
> **작업 브랜치**: `claude/moyeora-intro-page-TphnM`

---

## 📌 현재 상태 요약

### ✅ 완료된 작업
1. PPT 수수료 30% 정확히 반영 (셀러와 나눠가지는 구조)
2. PPT → 신청서 링크에 `?ref=ppt` UTM 파라미터 추가
3. 강조 부분 모션 효과 추가 (글로우, 반짝임, 바운스)
4. 기존 페이지 실제 데이터 기반 내용 업데이트
5. 인바운드 추적 시스템 설계 문서 작성 (`/INBOUND_TRACKING_DESIGN.md`)

### ⚠️ 미완료 (내일 작업)
- UTM 파라미터는 URL에만 있고 **DB에 저장 안 됨**
- 바로 문의하기 기능 없음
- 관리자 수동 입력 페이지 없음
- 통합 대시보드 없음

---

## 🎯 작업 목록

### 1️⃣ UTM 파라미터 DB 저장 (우선순위: 최상)

**소요 시간**: 30분
**파일**: `/supplier/apply.html`

#### 작업 내용
신청서 JavaScript 부분에서 URL 파라미터를 읽어 DB에 저장

#### 추가할 코드
```javascript
// 페이지 로드 시 URL 파라미터 읽기
const urlParams = new URLSearchParams(window.location.search);
const referrer = urlParams.get('ref') || 'direct';
const type = urlParams.get('type') || 'inbound';
const salesPerson = urlParams.get('sales') || null;

// 폼 제출 시 formData에 추가 (Line 468 근처)
const formData = {
    // ... 기존 필드들 ...

    // 🆕 인바운드 추적 정보 추가
    inbound: {
        type: type,              // "inbound" or "outbound"
        referrer: referrer,      // "ppt", "homepage", "kakao", "email" 등
        salesPerson: salesPerson, // 담당 영업자 (아웃바운드만)
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    },

    // ... 나머지 필드들 ...
};
```

#### 테스트 시나리오
- [ ] PPT에서 "입점신청 작성하기" 클릭 → `?ref=ppt` 확인
- [ ] 신청서 제출 → Firestore에서 `inbound.referrer = "ppt"` 확인
- [ ] 아웃바운드 테스트: `?ref=kakao&type=outbound&sales=김철수` URL 직접 입력
- [ ] 제출 후 DB 확인: `inbound.type = "outbound"`, `inbound.salesPerson = "김철수"`

---

### 2️⃣ 바로 문의하기 기능 (우선순위: 상)

**소요 시간**: 1시간
**파일**:
- `/ppt/supplier/index.html` (Slide 20 수정)
- `/supplier/index.html` (하단 CTA 섹션)

#### 작업 내용
간단한 문의 폼 추가 (이름, 연락처, 메모만)

#### 주요 변경사항

**1) CTA 버튼 2개로 변경**
```html
<div class="cta-buttons-wrapper">
    <a href="/supplier/apply.html?ref=ppt" class="cta-button primary">
        입점신청 작성하기 📝
    </a>
    <button onclick="openQuickInquiry()" class="cta-button secondary">
        바로 문의하기 ⚡️
    </button>
</div>
```

**2) 모달 추가 및 JavaScript 구현**
- Firebase Firestore에 저장
- `status: 'inquiry'`로 정식 신청과 구분
- `inbound.type: 'inbound'`로 자동 분류

#### 테스트 체크리스트
- [ ] 모달 열림/닫힘 정상 작동
- [ ] 필수 필드 검증 (이름, 연락처)
- [ ] DB에 `status = "inquiry"` 저장됨
- [ ] DB에 `inbound.type = "inbound"` 저장됨

> **상세 코드**: `/TOMORROW_TASKS.md` 77-265줄 참고

---

### 3️⃣ 관리자 수동 입력 페이지 (우선순위: 중)

**소요 시간**: 1.5시간
**파일**: `/admin/manual-entry.html` (신규)

#### 작업 내용
기존 DB 데이터를 입점신청서 형식으로 수동 입력

#### 주요 기능
- **탭 전환**: 공급사 / 셀러
- **공급사 입력**: 회사명, 담당자, 연락처, 이메일, 주요제품, 메모, 입력자
- **셀러 입력**: 셀러명, 연락처, 인스타그램, 팔로워수, 메모, 입력자
- **DB 저장**: `source: 'manual_entry'`, `inbound.type: 'manual'`로 분류

#### 테스트 체크리스트
- [ ] 공급사 추가 → `supplierApplications` 컬렉션에 저장
- [ ] 셀러 추가 → `sellers` 컬렉션에 저장
- [ ] `source = "manual_entry"` 확인
- [ ] `inbound.addedBy` 필드에 입력자 이름 저장

> **전체 코드**: `/TOMORROW_TASKS.md` 268-566줄 참고

---

### 4️⃣ 통합 대시보드 (우선순위: 중)

**소요 시간**: 2시간
**파일**: `/admin/dashboard.html` (신규)

#### 작업 내용
공급사/셀러 통합 리스트 및 통계 대시보드

#### 주요 기능

**1) 통계 카드**
- 전체 공급사 수
- 신청서 수 (`source: 'web_application'`)
- 수동 입력 수 (`source: 'manual_entry'`)
- 바로 문의 수 (`source: 'quick_inquiry'`)

**2) 필터 버튼**
- 전체
- 신청서
- 수동입력
- 바로문의
- 인바운드
- 아웃바운드

**3) 테이블 뷰**
| 회사명/셀러명 | 연락처 | 상태 | 유입경로 | 타입 | 등록일 |
|--------------|--------|------|----------|------|--------|
| ... | ... | ... | ... | ... | ... |

#### 테스트 체크리스트
- [ ] 통계 카드 숫자 정확히 표시
- [ ] 필터 작동 (각 버튼 클릭 시 테이블 업데이트)
- [ ] 테이블 정렬 (최신순)
- [ ] 상태 뱃지 색상 구분

> **전체 코드**: `/TOMORROW_TASKS.md` 570-853줄 참고

---

### 5️⃣ 간단한 로그인 페이지 (우선순위: 하)

**소요 시간**: 30분
**파일**: `/admin/login.html` (신규)

#### 작업 내용
관리자 페이지 접근 제한

#### 주요 기능
- **비밀번호**: `모여라딜2026`
- **인증 방식**: LocalStorage 기반
- **세션 유지**: 24시간
- **리다이렉트**: 로그인 성공 시 `/admin/dashboard.html`로 이동

#### 다른 페이지에 인증 체크 추가
```javascript
// dashboard.html, manual-entry.html 맨 위에 추가
if (localStorage.getItem('adminAuth') !== 'true') {
    window.location.href = '/admin/login.html';
}
```

#### 테스트 체크리스트
- [ ] 잘못된 비밀번호 → 에러 메시지
- [ ] 올바른 비밀번호 → 대시보드로 이동
- [ ] 로그인 상태에서 새로고침 → 로그인 유지
- [ ] 24시간 후 → 자동 로그아웃

> **전체 코드**: `/TOMORROW_TASKS.md` 857-1012줄 참고

---

## 📂 최종 파일 구조

```
/
├── supplier/
│   └── apply.html (수정)
├── ppt/supplier/
│   └── index.html (수정)
├── admin/ (신규 폴더)
│   ├── login.html (신규)
│   ├── dashboard.html (신규)
│   └── manual-entry.html (신규)
└── INBOUND_TRACKING_DESIGN.md (참고)
```

---

## 🧪 전체 테스트 플로우

### 시나리오 1: PPT → 신청서
1. `/ppt/supplier/index.html` 방문
2. "입점신청 작성하기" 클릭 → `?ref=ppt` 파라미터 확인
3. 신청서 작성 및 제출
4. Firestore 확인: `inbound.referrer = "ppt"`, `inbound.type = "inbound"`

### 시나리오 2: 바로 문의
1. PPT 또는 메인페이지에서 "바로 문의하기" 클릭
2. 모달에서 이름, 연락처, 메모 입력
3. 제출
4. Firestore 확인: `status = "inquiry"`, `source = "quick_inquiry"`

### 시나리오 3: 아웃바운드 (영업 링크)
1. URL: `/supplier/apply.html?ref=kakao&type=outbound&sales=김철수`
2. 신청서 작성 및 제출
3. Firestore 확인: `inbound.type = "outbound"`, `inbound.salesPerson = "김철수"`

### 시나리오 4: 수동 입력
1. `/admin/login.html` 로그인 (비밀번호: `모여라딜2026`)
2. `/admin/manual-entry.html` 방문
3. 공급사 또는 셀러 정보 입력
4. Firestore 확인: `source = "manual_entry"`

### 시나리오 5: 대시보드
1. `/admin/dashboard.html` 방문
2. 통계 카드 확인 (전체/신청서/수동/문의)
3. 필터 테스트 (각 버튼 클릭)
4. 테이블에서 데이터 확인

---

## 💡 추가 개선 아이디어 (나중에)

1. **엑셀 내보내기**: 대시보드에서 CSV 다운로드
2. **실시간 알림**: 신규 신청 시 관리자에게 알림
3. **상세 페이지**: 각 신청 클릭 → 상세 정보 팝업
4. **검색 기능**: 회사명/연락처로 검색
5. **차트**: 일별/주별 신청 추이 그래프
6. **AI 모디 시스템**: 셀러별 맞춤 챗봇 (Phase 4)

---

## 📚 참고 문서

- **시스템 설계**: `/INBOUND_TRACKING_DESIGN.md`
- **상세 코드**: `/TOMORROW_TASKS.md`
- **Firebase Console**: https://console.firebase.google.com/project/moyeora-deal-manager

---

## 📞 문제 해결

문제 발생 시:
1. 브라우저 콘솔 확인 (F12)
2. Firebase 콘솔에서 데이터 확인
3. `/INBOUND_TRACKING_DESIGN.md` 참고
4. 각 작업의 테스트 체크리스트 확인

---

**작성일**: 2026-01-03
**문서 버전**: 1.0
**다음 업데이트**: 작업 완료 후
**작업 브랜치**: `claude/moyeora-intro-page-TphnM`
