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

## 3. 셀러 전용 상품 페이지 (`/consumer/secret-seller/`)

### 개요
셀러에게 제공하는 **전용 상품 판매 페이지**입니다. 소비자는 **오직 이 링크를 통해서만** 해당 상품을 구매할 수 있습니다.

### 접근 URL
```
/consumer/secret-seller/?seller={sellerId}&deal={dealId}&ref={referralCode}
```

### 기능
- **셀러 정보 표시**: 셀러명, 전용 공동구매 배지
- **공동구매 일정**: 시작일/종료일, D-day 카운트다운
- **상태별 표시**:
  - 오픈 예정: 카운트다운 + 알림 신청 섹션
  - 진행중: 구매 버튼 활성화
  - 종료: 구매 버튼 비활성화
- **오픈 알림 신청**: 카카오톡/문자 선택
- **친구 공유**: 레퍼럴 링크 생성 및 공유
- **카페24 연동**: 구매 시 카페24로 이동

### 어드민에서 링크 생성
1. **어드민** → **공구 관리** → 공구 클릭
2. 공구 수정 모달 하단의 **"셀러 전용 상품 페이지"** 섹션
3. **📋 복사** 버튼으로 링크 복사
4. **💬 카카오톡 공유** 또는 **👁️ 미리보기** 가능

### Firestore 연동
```javascript
// 셀러 정보 조회
db.collection('sellers').doc(sellerId).get()

// 공구 정보 조회
db.collection('deals').doc(dealId).get()

// 알림 신청 저장
db.collection('notifications').add({
    dealId, dealTitle, sellerId, sellerName,
    phone, type: 'kakao'|'sms', status: 'pending'
})

// 레퍼럴 코드 생성
db.collection('referrals').doc(code).set({
    referralCode, dealId, sellerId, sellerName,
    clicks: 0, conversions: 0
})
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
- [ ] 셀러 전용 페이지 접근 및 구매
- [ ] 캐시백 조회

---

## 카페24 소비자 페이지 관리

### 개요
소비자 페이지를 카페24에 업로드하여 `moyeoradeal.shop` 도메인으로 서비스합니다.
데이터는 Firebase에서 관리하고, HTML/JS만 카페24에 호스팅합니다.

---

### 📁 카페24 폴더 구조

```
카페24 디자인 편집기
└── consumer/
    ├── product/
    │   └── index.html      # 상품 상세 페이지
    ├── events/
    │   └── index.html      # 이벤트 페이지
    ├── secret-seller/
    │   └── index.html      # 셀러 전용 상품 페이지
    └── my-cashback/
        └── index.html      # 캐시백 조회 페이지
```

---

### 🔧 페이지 수정 방법

#### 1. 카페24 관리자 접속
```
https://moyeora02.cafe24.com/disp/admin/
```

#### 2. 디자인 편집기 열기
- **디자인** → **디자인 편집** 클릭
- 또는 단축키 `Ctrl + D`

#### 3. 파일 찾기
- 왼쪽 폴더 트리에서 `consumer` 폴더 펼치기
- 수정할 페이지 폴더 클릭 (예: `product`)
- `index.html` 더블클릭하여 편집기 열기

#### 4. 코드 수정
- HTML/CSS/JavaScript 수정
- **저장** 버튼 클릭 또는 `Ctrl + S`

#### 5. 미리보기
- **미리보기** 버튼으로 확인
- 또는 실제 URL로 접속하여 확인

---

### ➕ 새 페이지 추가 방법

#### 방법 1: 폴더 방식 (클린 URL)

1. **폴더 생성**
   - `consumer` 폴더 우클릭 → **새 폴더**
   - 폴더명 입력 (예: `faq`)

2. **index.html 생성**
   - 새로 만든 폴더 클릭
   - 우클릭 → **새 파일** → `index.html`

3. **코드 작성**
   - 기존 페이지를 복사하여 수정하거나 새로 작성
   - Firebase 연동 코드 포함

4. **결과 URL**
   ```
   https://moyeoradeal.shop/consumer/faq/
   ```

#### 방법 2: 단일 파일 방식

1. **파일 생성**
   - `consumer` 폴더에서 우클릭 → **새 파일**
   - 파일명 입력 (예: `about.html`)

2. **결과 URL**
   ```
   https://moyeoradeal.shop/consumer/about.html
   ```

---

### 📝 페이지 템플릿

새 페이지 생성 시 기본 템플릿:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지 제목 - 모여라딜</title>
    <link rel="icon" href="/favicon.ico">

    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

    <!-- Kakao SDK -->
    <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js"></script>

    <style>
        /* 스타일 작성 */
    </style>
</head>
<body>
    <!-- 헤더 -->
    <div class="header">
        <a href="/" class="logo">모여라딜</a>
    </div>

    <!-- 콘텐츠 -->
    <div class="container">
        <!-- 페이지 내용 -->
    </div>

    <script>
        // Firebase 설정
        const firebaseConfig = {
            apiKey: "AIzaSyAQf_Cu9wMji5QsMBQns5eg6nOD_vmrZMs",
            authDomain: "moyeora-deal-manager.firebaseapp.com",
            projectId: "moyeora-deal-manager",
            storageBucket: "moyeora-deal-manager.firebasestorage.app",
            messagingSenderId: "878495183009",
            appId: "1:878495183009:web:7c7f5f3b6c3d5f5f5f5f5f"
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        // Kakao SDK 초기화
        Kakao.init('2e874ef8e5b6a792564592d49632a83e');

        // 페이지 로직 작성
    </script>
</body>
</html>
```

---

### ⚠️ 주의사항

#### 1. 경로 충돌 확인
카페24 기본 경로와 충돌하지 않도록 주의:
- `/product/` - 카페24 기본 상품 경로 (사용 금지)
- `/board/` - 카페24 게시판 경로 (사용 금지)
- `/member/` - 카페24 회원 경로 (사용 금지)

**권장**: `/consumer/` 하위 폴더만 사용

#### 2. JavaScript 에러 처리
```javascript
// Firebase 초기화 중복 방지
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Kakao SDK 중복 초기화 방지
if (!Kakao.isInitialized()) {
    Kakao.init('YOUR_KEY');
}
```

#### 3. 캐시 문제
수정 후 반영이 안 되면:
- 브라우저 캐시 삭제 (`Ctrl + Shift + R`)
- 카페24 캐시 초기화 (디자인 편집기 → 캐시 관리)

#### 4. 모바일 대응
반드시 반응형으로 제작:
```css
@media (max-width: 768px) {
    /* 모바일 스타일 */
}
```

---

### 🔄 GitHub ↔ 카페24 동기화

GitHub에서 페이지를 수정한 경우:

1. **GitHub에서 코드 복사**
   - `/consumer/` 폴더의 수정된 파일 열기
   - 전체 코드 복사

2. **카페24에 붙여넣기**
   - 카페24 디자인 편집기 열기
   - 해당 파일 선택
   - 전체 선택 후 붙여넣기
   - 저장

3. **확인**
   - 실제 URL에서 동작 확인

---

### 📋 페이지별 URL 정리

| 페이지 | URL | 파라미터 |
|-------|-----|---------|
| 상품 상세 | `/consumer/product/` | `?id={dealId}&ref={refCode}` |
| 이벤트 | `/consumer/events/` | - |
| 셀러 전용 | `/consumer/secret-seller/` | `?seller={sellerId}&deal={dealId}` |
| 캐시백 | `/consumer/my-cashback/` | - |

---

### 🛠️ 문제 해결

#### Firebase 연결 안 됨
1. Firebase Console → 승인 도메인에 `moyeoradeal.shop` 추가 확인
2. 브라우저 콘솔에서 에러 확인 (`F12`)

#### 카카오 공유 안 됨
1. Kakao Developers → 플랫폼 → 사이트 도메인에 `https://moyeoradeal.shop` 추가 확인
2. JavaScript 키 확인

#### 페이지 404 에러
1. 폴더/파일 경로 확인
2. `index.html` 파일 존재 여부 확인
3. 카페24 캐시 초기화
