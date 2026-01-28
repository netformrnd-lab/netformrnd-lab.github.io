# 아임웹(Imweb) 연동 가이드

> 카페24에서 아임웹으로 쇼핑몰 플랫폼 마이그레이션 완료 후 설정 가이드

## 목차
1. [마이그레이션 배경](#마이그레이션-배경)
2. [아임웹 API 설정](#아임웹-api-설정)
3. [레퍼럴 시스템 연동](#레퍼럴-시스템-연동)
4. [공구 상품 등록](#공구-상품-등록)
5. [주문 동기화](#주문-동기화)
6. [트러블슈팅](#트러블슈팅)

---

## 마이그레이션 배경

### 왜 아임웹으로 이전했나요?
- **PG사 이슈**: KG이니시스에서 카페24 공구(공동구매) 결제 불가 통보
- **카페24 신규가입 필요**: 기존 카페24에서 새 PG 연동 시 신규가입 필요
- **아임웹 기존 사용 중**: 브랜드 사이트로 아임웹 이용 중, 상점ID 추가발급으로 즉시 사용 가능

### 변경된 시스템 구조
```
[기존: 카페24]
모여라딜 공구 페이지 → 카페24 상품 페이지 → 카페24 결제

[변경: 아임웹]
모여라딜 공구 페이지 → 아임웹 상품 페이지 → 아임웹 결제
```

---

## 아임웹 API 설정

### 1. API Key 발급
1. 아임웹 관리자 페이지 접속 (https://www.imweb.me/admin)
2. **환경설정** → **개발자 센터** 이동
3. **앱 등록** 또는 **API Key 발급** 클릭
4. API Key와 API Secret 복사

### 2. 모여라딜 관리자에서 설정
1. 모여라딜 관리자 페이지 접속 (https://partner-moyeoradeal.kr/admin/)
2. 좌측 메뉴에서 **설정** → **아임웹 API 설정** 클릭
3. API Key와 API Secret 입력
4. **설정 저장** 클릭
5. 토큰이 자동 발급되면 연동 완료

### 3. 연결 테스트
- **연결 테스트** 버튼 클릭으로 API 연동 확인
- 성공 시 "아임웹 연결 성공!" 메시지 표시

---

## 레퍼럴 시스템 연동

### 아임웹에서 레퍼럴 코드 처리 방법

아임웹은 카페24와 달리 주문 페이지에 JavaScript를 직접 삽입하기 어려우므로,
**주문 메모** 필드를 활용하여 레퍼럴 코드를 전달합니다.

### 방법 1: URL 파라미터 → 주문 메모 자동 입력 (권장)

아임웹 사이트의 **전역 스크립트**에 다음 코드 추가:

```javascript
// 아임웹 전역 스크립트 (환경설정 > 기본 설정 > 외부 스크립트)
(function() {
  // URL에서 ref 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');

  if (refCode) {
    // 쿠키에 저장 (7일간 유효)
    document.cookie = `moyeora_ref=${refCode};path=/;max-age=${7*24*60*60}`;
    console.log('레퍼럴 코드 저장:', refCode);
  }

  // 주문 페이지에서 메모 필드에 자동 입력
  if (window.location.pathname.includes('/order')) {
    const savedRef = document.cookie.match(/moyeora_ref=([^;]+)/)?.[1];
    if (savedRef) {
      // 주문 메모 필드 찾아서 입력
      const memoField = document.querySelector('textarea[name="order_memo"]')
                     || document.querySelector('#order_memo');
      if (memoField) {
        memoField.value = `ref=${savedRef}`;
      }
    }
  }
})();
```

### 방법 2: 수동 안내

공구 페이지에서 구매자에게 레퍼럴 코드를 주문 메모에 입력하도록 안내:

```
"주문 시 '요청사항'에 다음 코드를 입력해주세요: ref=XXXXXXXX"
```

---

## 공구 상품 등록

### Firestore deals 컬렉션 필드

기존 `cafe24ProductNo` 대신 아임웹 필드 사용:

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `imwebProductUrl` | string | 아임웹 상품 직접 URL (권장) | `https://yoursite.imweb.me/shop_view/?idx=123` |
| `imwebProductNo` | string | 아임웹 상품 번호 | `123` |
| `imwebSiteUrl` | string | 아임웹 사이트 URL | `https://yoursite.imweb.me` |
| `cafe24ProductNo` | string | (레거시) 카페24 상품 번호 | `12345` |

### 상품 등록 우선순위
1. `imwebProductUrl` - 직접 URL이 있으면 그대로 사용
2. `imwebProductNo` + `imwebSiteUrl` - 번호와 사이트 URL로 조합
3. `cafe24ProductNo` - 기존 카페24 연동 (레거시 지원)

### 공구 등록 예시

```javascript
// Firestore에 공구 등록
await db.collection('deals').add({
  title: '공구 상품명',
  status: 'ongoing',
  startDate: '2026-01-28',
  endDate: '2026-02-10',
  // 아임웹 상품 URL
  imwebProductUrl: 'https://moyeoradeal.imweb.me/shop_view/?idx=456',
  // 또는 상품 번호 방식
  // imwebProductNo: '456',
  // imwebSiteUrl: 'https://moyeoradeal.imweb.me',
  selectedProducts: [...],
  referrerCashback: 5000,
  refereeCashback: 3000
});
```

---

## 주문 동기화

### 자동 동기화 설정
1. 관리자 페이지 → **아임웹 API 설정** 탭
2. **주문 데이터 동기화** 버튼 클릭
3. 최근 30일 주문이 자동으로 Firestore에 저장됨

### 동기화되는 데이터
- 주문번호, 주문일시
- 주문자 정보 (이름, 연락처, 이메일)
- 상품 정보 (상품명, 옵션, 수량, 가격)
- 결제 금액, 배송비
- 주문 메모 (레퍼럴 코드 포함)

### 레퍼럴 코드 자동 추출
주문 메모에서 `ref=XXXXXXXX` 형식의 코드를 자동 추출하여
`referralCode` 필드에 저장합니다.

```javascript
// 주문 메모에서 레퍼럴 코드 추출 로직
if (order.order_memo) {
  const refMatch = order.order_memo.match(/ref[=:]\s*([A-Z0-9]+)/i);
  if (refMatch) {
    orderData.referralCode = refMatch[1];
  }
}
```

---

## 트러블슈팅

### Q: "아임웹 API 설정이 없습니다" 오류
**A**: 관리자 페이지 → 아임웹 API 설정에서 API Key와 Secret을 먼저 설정하세요.

### Q: 토큰 발급 실패
**A**:
1. API Key와 Secret이 정확한지 확인
2. 아임웹 개발자 센터에서 앱이 활성화되어 있는지 확인
3. API 권한(scope)이 올바른지 확인

### Q: 주문 동기화가 안 됨
**A**:
1. 토큰 만료 여부 확인 (자동 갱신되지만, 수동으로 "연결 테스트" 클릭)
2. 네트워크 오류 확인 (Cloud Run 프록시 서버 상태)
3. API 호출 제한 확인 (아임웹 API rate limit)

### Q: 레퍼럴 코드가 인식되지 않음
**A**:
1. 주문 메모 형식 확인: `ref=XXXXXXXX` 또는 `ref:XXXXXXXX`
2. 아임웹 전역 스크립트가 제대로 동작하는지 확인
3. 쿠키가 차단되지 않았는지 확인

---

## API 엔드포인트 참고

### 아임웹 API v2
- **기본 URL**: `https://api.imweb.me/v2`
- **인증**: GET `/auth` (key, secret 헤더)
- **주문 조회**: GET `/shop/orders`
- **상품 조회**: GET `/shop/products`

### 프록시 서버
- **URL**: `https://cafe24oauthtoken-751113514390.asia-northeast3.run.app/imweb`
- **용도**: CORS 우회, 토큰 발급/API 호출

---

## 마이그레이션 체크리스트

- [ ] 아임웹 API Key/Secret 발급
- [ ] 모여라딜 관리자에서 아임웹 설정 완료
- [ ] 연결 테스트 성공
- [ ] 아임웹 사이트에 전역 스크립트 추가 (레퍼럴 코드용)
- [ ] 기존 공구 데이터에 `imwebProductUrl` 추가
- [ ] 주문 동기화 테스트
- [ ] 레퍼럴 추적 테스트

---

*마지막 업데이트: 2026-01-28*
