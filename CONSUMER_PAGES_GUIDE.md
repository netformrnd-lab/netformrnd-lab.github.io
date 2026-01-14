# 소비자 페이지 시스템 가이드

## 개요

소비자용 페이지는 Firebase로 호스팅되며, 결제는 카페24를 통해 처리됩니다.

### 도메인 구조
- **카페24 쇼핑몰 (결제)**: `https://moyeoradeal.shop/` 또는 `moyeora02.cafe24.com`
- **Firebase 호스팅 (마케팅 페이지)**: 별도 도메인 또는 서브도메인 설정 가능

---

## 페이지 구조

```
/consumer/
├── product/index.html       # 상품 상세 페이지
├── events/index.html        # 이벤트 페이지 (후기, 선착순)
├── secret-seller/index.html # 시크릿 셀러 전용 페이지
└── my-cashback/index.html   # 내 캐시백 조회
```

### 클린 URL
| 페이지 | URL |
|-------|-----|
| 상품 | `/consumer/product/?id={dealId}` |
| 이벤트 | `/consumer/events/` |
| 시크릿 셀러 | `/consumer/secret-seller/?code={코드}` |
| 캐시백 | `/consumer/my-cashback/` |

---

## 1. 상품 페이지 (`/consumer/product/`)

### 접근 URL
```
/consumer/product/?id={dealId}&ref={referralCode}
```

### 기능
- **상품 정보 표시**: 이미지 슬라이더, 가격, 할인율, 설명
- **오픈 알림 신청**: 판매 오픈 전 상품에 카카오톡/문자 알림 신청
- **선착순 이벤트**: 실시간 카운팅, 자동 응모
- **친구 공유**: 레퍼럴 링크 생성, 카카오톡/문자 공유
- **카페24 연동**: "구매하기" 버튼 클릭 시 카페24로 이동

### Firestore 연동
```javascript
// 공구 정보 조회
db.collection('deals').doc(dealId).get()

// 알림 신청 저장
db.collection('notifications').add({
    dealId, phone, type: 'kakao'|'sms', status: 'pending'
})

// 선착순 참여
db.collection('flashSaleParticipants').add({
    dealId, phone, position, participatedAt
})

// 레퍼럴 코드 생성
db.collection('referrals').doc(code).set({
    referralCode, referrerId, dealId, clicks: 0, conversions: 0
})
```

---

## 2. 이벤트 페이지 (`/consumer/events/`)

### 기능

#### 후기 이벤트
- 구매 상품 선택
- 이미지/영상 업로드 (Firebase Storage)
- 후기 내용 작성 (최소 20자)
- 연락처 입력 (캐시백 지급용)

#### 리워드 금액
| 후기 유형 | 페이백 금액 |
|----------|-----------|
| 텍스트 후기 | 1,000원 |
| 사진 후기 | 2,000원 |
| 영상 후기 | 5,000원 |

#### 선착순 이벤트 목록
- 진행 중인 선착순 이벤트 목록
- 참여 현황 (프로그레스 바)
- 참여 버튼

### Firestore 연동
```javascript
// 후기 저장
db.collection('reviews').add({
    dealId, productTitle, content, mediaUrls,
    phone, rewardAmount, status: 'pending', createdAt
})

// 이미지/영상 업로드
storage.ref(`reviews/${fileName}`).put(file)

// 후기 목록 조회
db.collection('reviews')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()
```

---

## 3. 시크릿 셀러 페이지 (`/consumer/secret-seller/`)

### 접근 URL
```
/consumer/secret-seller/?code={secretCode}
```

### 기능
- **시크릿 코드 인증**: 셀러 전용 코드로 접근
- **전용 할인**: 일반 가격 대비 추가 할인
- **VIP 혜택**: 추가 캐시백, 무료 배송 등
- **친구 초대**: 시크릿 코드 포함 링크 공유

### 셀러 혜택
| 혜택 | 내용 |
|-----|------|
| 추가 할인 | 최대 30% |
| 추가 캐시백 | +5,000원 |
| 배송 | 무료 + 익일 출고 |
| 친구 초대 보상 | 나 10,000원 / 친구 5,000원 |

### Firestore 연동
```javascript
// 시크릿 코드 검증
db.collection('sellers')
    .where('secretCode', '==', code)
    .get()

// 또는
db.collection('secretSellerCodes').doc(code).get()

// 시크릿 상품 조회
db.collection('deals')
    .where('isSecretSeller', '==', true)
    .where('status', 'in', ['ongoing', 'active'])
    .get()
```

---

## 4. 캐시백 조회 페이지 (`/consumer/my-cashback/`)

### 기능
- **전화번호로 조회**: 별도 회원가입 없이 연락처로 조회
- **캐시백 현황**: 사용 가능, 총 적립, 총 사용, 지급 예정
- **적립/사용 내역**: 필터링 (전체, 적립, 사용, 지급예정)
- **친구 초대 현황**: 초대 수, 구매 전환 수

### Firestore 연동
```javascript
// 캐시백 내역 조회
db.collection('cashbacks')
    .where('phone', '==', phone)
    .orderBy('earnedAt', 'desc')
    .get()

// 후기 보상 조회
db.collection('reviews')
    .where('phone', '==', phone)
    .where('status', 'in', ['approved', 'rewarded'])
    .get()

// 레퍼럴 내역 조회
db.collection('referrals')
    .where('referrerPhone', '==', phone)
    .orderBy('createdAt', 'desc')
    .get()
```

---

## Firestore 컬렉션 구조

### `deals` (공구/상품)
```javascript
{
    title: "상품명",
    subtitle: "부제목",
    description: "상품 설명",
    status: "ongoing" | "upcoming" | "completed",
    images: ["https://..."],
    selectedProducts: [{
        supplyPrice: 29000,
        originalPrice: 39000,
        retailPrice: 45000
    }],

    // 선착순 이벤트
    flashSale: {
        enabled: true,
        totalSlots: 100,
        currentCount: 0,
        endTime: Timestamp,
        reward: 5000
    },

    // 시크릿 셀러
    isSecretSeller: false,
    secretSellerDiscount: 10,

    // 캐시백 설정
    referrerCashback: 5000,
    refereeCashback: 3000,

    // 카페24 연동
    cafe24ProductNo: "12345",
    cafe24ProductUrl: "https://moyeora02.cafe24.com/..."
}
```

### `referrals` (레퍼럴 코드)
```javascript
{
    referralCode: "ABC123XY",
    referrerId: "user_xxx",
    referrerPhone: "010-1234-5678",
    dealId: "deal_xxx",
    dealTitle: "상품명",

    createdAt: Timestamp,
    expiresAt: Timestamp,

    clicks: 15,
    conversions: 3,
    totalSales: 150000,

    referrerCashback: 15000,
    refereeCashback: 9000,
    totalCashback: 24000,

    status: "active" | "expired",

    purchases: [{
        orderId: "xxx",
        purchaserId: "user_xxx",
        purchaseDate: Timestamp,
        amount: 50000,
        referrerReward: 5000,
        refereeReward: 3000,
        status: "completed"
    }]
}
```

### `cashbacks` (캐시백 내역)
```javascript
{
    userId: "user_xxx",
    phone: "010-1234-5678",
    userType: "referrer" | "referee",

    amount: 5000,
    remainingAmount: 5000,

    referralCode: "ABC123XY",
    orderId: "cafe24_order_xxx",
    dealId: "deal_xxx",
    description: "친구 초대 보상",

    earnedAt: Timestamp,
    expiresAt: Timestamp,
    usedAt: null,

    status: "active" | "pending" | "used" | "expired"
}
```

### `reviews` (후기)
```javascript
{
    dealId: "deal_xxx",
    productTitle: "상품명",
    orderId: "cafe24_order_xxx",

    content: "후기 내용...",
    mediaUrls: ["https://..."],

    phone: "010-1234-5678",
    rewardAmount: 2000,

    status: "pending" | "approved" | "rewarded" | "rejected",
    createdAt: Timestamp
}
```

### `notifications` (오픈 알림)
```javascript
{
    dealId: "deal_xxx",
    dealTitle: "상품명",
    phone: "010-1234-5678",
    type: "kakao" | "sms",
    status: "pending" | "sent",
    createdAt: Timestamp
}
```

### `flashSaleParticipants` (선착순 참여자)
```javascript
{
    dealId: "deal_xxx",
    phone: "010-1234-5678",
    position: 1,
    participatedAt: Timestamp
}
```

### `secretSellerCodes` (시크릿 코드)
```javascript
{
    // 문서 ID = 시크릿 코드
    name: "VIP 셀러명",
    sellerId: "seller_xxx",
    discount: 10,
    additionalCashback: 5000,
    createdAt: Timestamp,
    expiresAt: Timestamp
}
```

---

## 카페24 결제 연동

### 흐름
```
소비자 → Firebase 상품 페이지 → "구매하기" → 카페24 상품 페이지 → 결제
                  ↓
           레퍼럴 코드 쿠키 저장
                  ↓
        카페24 URL에 ref 파라미터 추가
```

### 구현 코드 (product.html)
```javascript
function goToCafe24() {
    // 카페24 상품 URL
    let url = cafe24ProductUrl ||
        `https://moyeora02.cafe24.com/product/detail.html?product_no=${cafe24ProductNo}`;

    // 레퍼럴 코드 추가
    const referralCode = getCookie('moyeora_ref');
    if (referralCode) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}ref=${referralCode}`;
    }

    window.location.href = url;
}
```

### 주문 동기화
카페24 주문 데이터에서 레퍼럴 코드 추출:
1. **주문 메모 방식**: 구매자가 수동 입력
2. **사용자 정의 필드**: 자동 전달 (권장)
3. **Webhook**: 실시간 처리

---

## 도메인 설정 (Firebase Hosting)

### firebase.json
```json
{
    "hosting": {
        "public": ".",
        "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
        "rewrites": [
            {
                "source": "/consumer/**",
                "destination": "/consumer/product.html"
            }
        ]
    }
}
```

### 커스텀 도메인 설정
1. Firebase Console → Hosting → 커스텀 도메인 추가
2. DNS 설정 (A 레코드 또는 CNAME)
3. SSL 인증서 자동 발급

---

## 필수 설정

### 1. Kakao SDK 키 설정
각 HTML 파일에서 `YOUR_KAKAO_JS_KEY`를 실제 키로 교체:
```javascript
Kakao.init('YOUR_KAKAO_JS_KEY');
```

### 2. 카페24 상품 URL 설정
deals 컬렉션에 다음 필드 추가:
- `cafe24ProductNo`: 카페24 상품번호
- `cafe24ProductUrl`: 전체 URL (선택)

### 3. Firestore 인덱스
필요한 복합 인덱스:
- `deals`: `isSecretSeller` + `status` + `createdAt`
- `reviews`: `phone` + `status`
- `cashbacks`: `phone` + `earnedAt`
- `referrals`: `referrerPhone` + `createdAt`

---

## 테스트 체크리스트

- [ ] 상품 페이지 로드 및 정보 표시
- [ ] 레퍼럴 링크로 접속 시 배너 표시
- [ ] 오픈 알림 신청 동작
- [ ] 선착순 이벤트 참여
- [ ] 친구 공유 (카카오톡, 문자, 링크 복사)
- [ ] 카페24로 이동 (레퍼럴 코드 포함)
- [ ] 후기 작성 및 이미지/영상 업로드
- [ ] 시크릿 셀러 코드 인증
- [ ] 캐시백 조회
