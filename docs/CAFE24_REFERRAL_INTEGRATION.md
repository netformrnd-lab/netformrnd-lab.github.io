# 카페24 레퍼럴 연동 가이드

## 📋 개요

모여라딜 공구 페이지에서 생성된 레퍼럴 코드를 카페24 주문서에 자동으로 전달하는 방법입니다.

---

## 🔄 전체 플로우

```
1. 모여라딜 공구 페이지
   └─> 레퍼럴 링크 클릭
   └─> 쿠키 저장: moyeora_ref=ABC123XY

2. [구매하기] 버튼 클릭
   └─> 카페24로 리다이렉트
   └─> URL: cafe24.com/product/12345?ref=ABC123XY

3. 카페24 상품 페이지
   └─> JavaScript로 URL에서 ref 파라미터 읽기
   └─> 주문서 "요청사항"에 자동 입력

4. 주문 완료
   └─> 모여라딜 주문 동기화
   └─> 주문 메모에서 코드 추출
   └─> 캐시백 자동 적립
```

---

## 📝 카페24 설정 방법

### 방법 1: JavaScript로 URL 파라미터 → 주문서 자동 입력 (권장 ⭐)

#### Step 1: 카페24 관리자 접속

1. **카페24 관리자 로그인**
2. **쇼핑몰 설정 > 디자인 설정 > 스킨 설정**

#### Step 2: 스킨 파일 수정

**파일:** `/product/detail.html` (상품 상세 페이지)

상품 상세 페이지 하단에 다음 스크립트 추가:

```html
<!-- 모여라딜 레퍼럴 추적 스크립트 -->
<script>
(function() {
    // URL에서 ref 파라미터 읽기
    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // 쿠키 저장
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    // 쿠키 읽기
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // 레퍼럴 코드 처리
    const referralCode = getUrlParam('ref');
    if (referralCode) {
        // 쿠키에 저장 (7일간 유효)
        setCookie('moyeora_ref', referralCode, 7);
        console.log('✅ 레퍼럴 코드 저장:', referralCode);
    }

    // 주문서 페이지에서 실행 (order.html)
    if (window.location.pathname.includes('/order/')) {
        const savedRef = getCookie('moyeora_ref');
        if (savedRef) {
            // 주문 메모 필드에 자동 입력 (카페24 기본 필드명)
            const memoField = document.querySelector('textarea[name="order_memo"]') ||
                              document.querySelector('textarea[name="memo"]') ||
                              document.querySelector('#order_memo');

            if (memoField) {
                // 기존 메모에 추가
                const existingMemo = memoField.value.trim();
                if (existingMemo) {
                    memoField.value = existingMemo + '\n' + savedRef;
                } else {
                    memoField.value = savedRef;
                }
                console.log('✅ 레퍼럴 코드 주문서에 자동 입력:', savedRef);
            }
        }
    }
})();
</script>
```

#### Step 3: 테스트

1. **모여라딜 공구 페이지** 접속
   ```
   https://moyeoradeal.com/deals/view.html?id=deal123&ref=ABC123XY
   ```

2. **[구매하기]** 버튼 클릭 → 카페24로 이동

3. **장바구니 담기** → **주문서 작성**

4. **"요청사항" 필드 확인**
   - 자동으로 `ABC123XY` 입력되어 있어야 함

5. **주문 완료** → 모여라딜 Admin에서 주문 동기화

6. **캐시백 자동 적립** 확인

---

### 방법 2: 사용자 정의 필드 (고급)

카페24에서 주문서에 커스텀 필드를 추가하는 방법입니다.

#### Step 1: 사용자 정의 필드 추가

1. **카페24 관리자 > 주문 관리 > 주문서 설정**
2. **사용자 정의 필드 추가**
   - 필드명: `referral_code`
   - 필드 유형: 텍스트
   - 최대 길이: 20자
   - 필수 입력: 아니오
   - 노출 위치: 주문서 상단 (숨김 가능)

#### Step 2: JavaScript로 자동 입력

```html
<script>
(function() {
    // 쿠키에서 레퍼럴 코드 읽기
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // 주문서 페이지에서 실행
    if (window.location.pathname.includes('/order/')) {
        const savedRef = getCookie('moyeora_ref');
        if (savedRef) {
            // 사용자 정의 필드에 자동 입력
            const customField = document.querySelector('input[name="referral_code"]');
            if (customField) {
                customField.value = savedRef;
                console.log('✅ 레퍼럴 코드 자동 입력:', savedRef);
            }
        }
    }
})();
</script>
```

#### Step 3: 모여라딜 주문 동기화 수정

`admin/index.html`의 `syncCafe24Orders()` 함수 수정:

```javascript
// 레퍼럴 코드 추출 (사용자 정의 필드 우선)
let referralCode = null;

// 1. 사용자 정의 필드에서 추출
if (order.additional_information && order.additional_information.referral_code) {
    referralCode = order.additional_information.referral_code;
}

// 2. 주문 메모에서 추출 (fallback)
if (!referralCode) {
    referralCode = extractReferralCodeFromMemo(order.buyer_memo);
}
```

---

## 🚨 중요 사항

### 1. 카페24 쇼핑몰 URL 설정

`deals/view.html` 파일에서 카페24 URL을 실제 쇼핑몰 주소로 변경:

```javascript
// 라인 392 근처
if (currentDeal.cafe24ProductNo) {
    // ⚠️ 실제 카페24 쇼핑몰 주소로 변경
    cafe24ProductUrl = `https://YOUR_CAFE24_MALL.cafe24.com/product/detail.html?product_no=${currentDeal.cafe24ProductNo}`;
}
```

**예시:**
```javascript
cafe24ProductUrl = `https://moyeoradeal.cafe24.com/product/detail.html?product_no=${currentDeal.cafe24ProductNo}`;
```

### 2. Kakao SDK 키 설정

`deals/view.html` 파일에서 Kakao JavaScript 키 설정:

```javascript
// 라인 369 근처
Kakao.init('YOUR_KAKAO_JS_KEY'); // ⚠️ 실제 키로 교체
```

**Kakao 키 발급:**
1. https://developers.kakao.com/ 접속
2. 내 애플리케이션 > 앱 선택 > 앱 키 확인
3. JavaScript 키 복사

### 3. 주문서 필드명 확인

카페24 스킨에 따라 주문 메모 필드명이 다를 수 있습니다:

- `order_memo` (기본)
- `memo`
- `buyer_memo`

브라우저 개발자 도구(F12)로 실제 필드명 확인:

```javascript
// 콘솔에서 실행
document.querySelector('textarea[name*="memo"]');
```

---

## 🧪 테스트 체크리스트

### Step 1: 레퍼럴 링크 생성
- [ ] 모여라딜 공구 페이지 접속
- [ ] [친구 초대하기] 버튼 클릭
- [ ] 레퍼럴 링크 생성 확인
- [ ] 링크 복사 또는 카카오톡 공유

### Step 2: 레퍼럴 링크 클릭
- [ ] 레퍼럴 링크로 접속
- [ ] "🎁 친구 초대 혜택" 배너 표시 확인
- [ ] 브라우저 쿠키 확인 (F12 > Application > Cookies > moyeora_ref)

### Step 3: 구매 프로세스
- [ ] [구매하기] 버튼 클릭
- [ ] 카페24로 리다이렉트 확인
- [ ] URL에 `?ref=ABC123XY` 파라미터 포함 확인
- [ ] 장바구니 담기
- [ ] 주문서 작성 페이지로 이동

### Step 4: 주문서 자동 입력
- [ ] "요청사항" 필드에 레퍼럴 코드 자동 입력 확인
- [ ] 입력 안 되었다면: 브라우저 콘솔(F12) 확인

### Step 5: 주문 완료
- [ ] 주문 완료
- [ ] 모여라딜 Admin > 카페24 정산 관리 > 주문 수집
- [ ] 주문 목록에서 `referralCode` 필드 확인

### Step 6: 캐시백 확인
- [ ] 주문 동기화 후 콘솔 로그 확인:
  ```
  🎁 레퍼럴 캐시백 처리 완료: 1건
  ✅ 추천인 캐시백 적립: user_xxx, 5000
  ✅ 피추천인 캐시백 적립: user_yyy, 3000
  ```
- [ ] Firestore > `cashbacks` 컬렉션 확인

---

## 🔧 문제 해결

### 문제 1: 레퍼럴 코드가 주문서에 입력 안 됨

**원인:**
- JavaScript가 실행되지 않음
- 필드명이 다름
- 쿠키가 저장되지 않음

**해결:**
```javascript
// 브라우저 콘솔(F12)에서 실행하여 디버깅
console.log('쿠키:', document.cookie);
console.log('주문 메모 필드:', document.querySelector('textarea[name*="memo"]'));
```

### 문제 2: 카페24 스킨 수정 권한 없음

**대안: URL 파라미터만 사용**

주문 메모에 수동으로 입력하도록 안내 문구 추가:

```html
<!-- deals/view.html에 추가 -->
<div class="manual-instruction" style="background: #fff3cd; padding: 16px; border-radius: 8px; margin-top: 16px;">
    <strong>⚠️ 중요:</strong> 주문 시 "요청사항"에 아래 코드를 입력해주세요!
    <div style="font-size: 20px; font-weight: 800; color: #667eea; margin-top: 8px;">
        <span id="displayReferralCode">-</span>
    </div>
</div>
```

### 문제 3: 레퍼럴 코드 추출 안 됨

**확인 사항:**
1. 주문 메모에 코드가 제대로 입력되었는지
2. 코드 형식이 8자리 영문+숫자인지 (예: `ABC123XY`)
3. `extractReferralCodeFromMemo()` 함수의 정규식 확인

```javascript
// admin/index.html에서 디버깅
console.log('주문 메모:', order.buyer_memo);
console.log('추출된 코드:', extractReferralCodeFromMemo(order.buyer_memo));
```

---

## 📊 성과 측정

### Firestore 쿼리로 통계 확인

```javascript
// 전체 레퍼럴 현황
const referralsSnapshot = await db.collection('referrals').get();
console.log('총 레퍼럴 수:', referralsSnapshot.size);

// 전환율 계산
let totalClicks = 0;
let totalConversions = 0;
referralsSnapshot.forEach(doc => {
    const data = doc.data();
    totalClicks += data.clicks || 0;
    totalConversions += data.conversions || 0;
});
const conversionRate = (totalConversions / totalClicks * 100).toFixed(2);
console.log(`전환율: ${conversionRate}%`);

// 총 캐시백 지급액
const cashbacksSnapshot = await db.collection('cashbacks').get();
let totalCashback = 0;
cashbacksSnapshot.forEach(doc => {
    totalCashback += doc.data().amount || 0;
});
console.log(`총 캐시백: ${totalCashback.toLocaleString()}원`);
```

---

## 🚀 다음 단계

### Phase 2: 고도화
- [ ] 카페24 Webhook 연동 (실시간 주문 알림)
- [ ] 사용자 정의 필드 자동 입력
- [ ] 모바일 앱 연동
- [ ] Firebase Dynamic Links

### Phase 3: 사용자 기능
- [ ] 캐시백 대시보드 (`/my-cashback.html`)
- [ ] 캐시백 사용 기능
- [ ] 초대 현황 통계
- [ ] 푸시 알림

---

## 📞 지원

문제가 발생하면:
1. 브라우저 콘솔(F12) 로그 확인
2. Firestore 컬렉션 데이터 확인
3. GitHub Issues에 문의

---

**최종 업데이트:** 2026-01-12
**작성자:** Claude AI
**버전:** 1.0
