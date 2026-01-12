# 레퍼럴 캐시백 시스템 설계서

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [구현 방식 비교](#구현-방식-비교)
3. [데이터 구조 설계](#데이터-구조-설계)
4. [구현 단계](#구현-단계)
5. [카페24 연동 방안](#카페24-연동-방안)
6. [보안 및 검증](#보안-및-검증)

---

## 시스템 개요

### 기능 요구사항
✅ 소비자가 공구 상품 페이지에서 친구에게 공유
✅ 공유받은 친구가 구매하면 둘 다 캐시백 받음
✅ 카페24 쇼핑몰과 연동

### 사용자 플로우
```
소비자 A (공유자)
  └─> 공구 상품 페이지 방문
  └─> "친구 초대" 버튼 클릭
  └─> 레퍼럴 링크 생성: https://moyeoradeal.com/deal?id=deal456&ref=ABC123
  └─> 카카오톡/문자로 친구에게 공유

소비자 B (피추천인)
  └─> 레퍼럴 링크 클릭
  └─> 카페24 쇼핑몰로 이동 (레퍼럴 코드 자동 포함)
  └─> 상품 구매
  └─> 주문 완료 → 카페24 주문 데이터에 레퍼럴 코드 저장

시스템 (자동 처리)
  └─> 카페24 주문 동기화 (1시간마다 or 수동)
  └─> 레퍼럴 코드 추출 및 검증
  └─> 캐시백 적립 (A: 5,000원, B: 3,000원)
  └─> 정산 시 캐시백 반영
```

---

## 구현 방식 비교

### 방법 1: 카페24 주문 메모 활용 ⚠️
**난이도:** 하
**개발 기간:** 1-2일

**장점:**
- 카페24 기존 기능만 사용
- 추가 카페24 설정 불필요
- 빠른 프로토타입 가능

**단점:**
- ❌ 소비자가 수동으로 코드 입력 필요 (UX 나쁨)
- ❌ 입력 오류 가능성 높음
- ❌ 전환율 낮음

**구현 흐름:**
```javascript
// 1. 공유 페이지
<div class="share-box">
  <p>추천 코드: <strong id="referral-code">ABC123</strong></p>
  <button onclick="copyCode()">코드 복사</button>
  <p>⚠️ 주문 시 "요청사항"에 코드를 입력해주세요</p>
</div>

// 2. 주문 동기화 시 메모 파싱
function extractReferralCode(buyerMemo) {
  const match = buyerMemo?.match(/[A-Z0-9]{6}/); // "ABC123" 패턴
  return match ? match[0] : null;
}
```

---

### 방법 2: 카페24 사용자 정의 필드 + 쿠키 ⭐ (권장)
**난이도:** 중
**개발 기간:** 3-5일

**장점:**
- ✅ 완전 자동 추적 (사용자 액션 불필요)
- ✅ 높은 전환율
- ✅ 확장성 좋음 (추후 다양한 마케팅 활용)

**단점:**
- 카페24 사용자 정의 필드 설정 필요
- 쿠키 관리 필요

**구현 흐름:**
```javascript
// 1. 레퍼럴 링크 클릭 시 쿠키 저장
// 랜딩 페이지: /deal.html?id=deal456&ref=ABC123
const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get('ref');
if (referralCode) {
  // 7일간 유효한 쿠키 저장
  document.cookie = `moyeora_ref=${referralCode}; max-age=604800; path=/`;

  // Firestore에 클릭 추적
  await db.collection('referrals').doc(referralCode).update({
    clicks: firebase.firestore.FieldValue.increment(1),
    lastClickAt: new Date()
  });
}

// 2. 카페24로 리다이렉트 시 쿠키 값을 URL에 포함
function redirectToCafe24(productUrl) {
  const referralCode = getCookie('moyeora_ref');
  if (referralCode) {
    // 카페24 상품 페이지 URL에 추가
    window.location.href = `${productUrl}?ref=${referralCode}`;
  } else {
    window.location.href = productUrl;
  }
}

// 3. 카페24 설정: 사용자 정의 필드 추가
// 카페24 관리자 > 상품 > 사용자 정의 필드
// 필드명: referral_code (텍스트, 최대 20자)

// 4. 주문 동기화 시 사용자 정의 필드 읽기
const ordersData = await callCafe24Api(
  mallId,
  accessToken,
  `/api/v2/admin/orders?embed=items,receivers&start_date=${startDateStr}`
);

for (const order of ordersData.orders) {
  const referralCode = order.additional_information?.referral_code;

  if (referralCode) {
    await trackReferralPurchase({
      orderId: order.order_id,
      referralCode: referralCode,
      purchaseAmount: order.payment_amount,
      productNo: order.items[0].product_no
    });
  }
}
```

---

### 방법 3: Firebase Dynamic Links + 카페24 Webhook ⚡ (최적)
**난이도:** 상
**개발 기간:** 5-7일

**장점:**
- ✅ 앱/웹 모두 지원
- ✅ 딥링크 지원 (앱 설치 유도 가능)
- ✅ 실시간 알림 (Webhook)

**단점:**
- Firebase Dynamic Links 설정 필요
- 카페24 Webhook 설정 필요 (개발자 앱)
- 초기 개발 비용 높음

**구현 흐름:**
```javascript
// 1. Firebase Dynamic Link 생성
async function createReferralLink(dealId, userId) {
  const longLink = `https://moyeoradeal.page.link/?link=https://moyeoradeal.com/deal/${dealId}?ref=${userId}&apn=com.moyeoradeal.app&ibi=com.moyeoradeal`;

  const response = await fetch('https://firebasedynamiclinks.googleapis.com/v1/shortLinks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dynamicLinkInfo: { dynamicLinkDomain: 'moyeoradeal.page.link', link: longLink },
      suffix: { option: 'SHORT' }
    })
  });

  const { shortLink } = await response.json();
  return shortLink; // https://moyeoradeal.page.link/xyz123
}

// 2. 카페24 Webhook 설정 (주문 생성 시 자동 호출)
// Cloud Function으로 Webhook 엔드포인트 생성
exports.cafe24OrderWebhook = functions.https.onRequest(async (req, res) => {
  const { order_id, member_id, product_no } = req.body;

  // 레퍼럴 코드 추출 (사용자 정의 필드 or 쿠키)
  const referralCode = req.body.additional_information?.referral_code;

  if (referralCode) {
    // 즉시 캐시백 적립
    await grantCashback(referralCode, order_id, product_no);
  }

  res.status(200).send('OK');
});
```

---

## 데이터 구조 설계

### Firestore 컬렉션

#### 1. `referrals` (레퍼럴 추적)
```javascript
{
  // 문서 ID: 레퍼럴 코드 (예: "ABC123XYZ")
  referralCode: "ABC123XYZ",           // 고유 추천 코드
  referrerId: "user_kakao_12345",     // 추천인 ID (공유자)
  referrerName: "김모여",              // 추천인 이름 (선택)
  dealId: "deal_20260112_001",        // 공구 ID
  dealTitle: "프리미엄 건조망고 1kg",  // 공구명
  productId: "prod_mango_001",        // 상품 ID
  cafe24ProductNo: "12345",           // 카페24 상품번호

  // 날짜 정보
  createdAt: Timestamp,               // 생성일시
  expiresAt: Timestamp,               // 만료일시 (30일 후)

  // 추적 지표
  clicks: 15,                         // 클릭 수
  conversions: 3,                     // 구매 전환 수
  totalSales: 150000,                 // 총 매출 (원)

  // 캐시백 정보
  referrerCashback: 15000,            // 추천인 캐시백 (5,000원 × 3건)
  refereeCashback: 9000,              // 피추천인 캐시백 (3,000원 × 3건)
  totalCashback: 24000,               // 총 캐시백

  // 상태
  status: "active",                   // active | expired | disabled

  // 메타 정보
  channel: "kakao",                   // 공유 채널 (kakao | sms | link)
  deviceType: "mobile",               // mobile | desktop

  // 연결된 구매들
  purchases: [
    {
      orderId: "20260112-0001234",
      purchaserId: "user_kakao_67890",
      purchaseDate: Timestamp,
      amount: 50000,
      referrerReward: 5000,
      refereeReward: 3000,
      status: "completed"             // pending | completed | cancelled
    }
  ]
}
```

#### 2. `cashbacks` (캐시백 적립 내역)
```javascript
{
  // 문서 ID: 자동 생성
  userId: "user_kakao_12345",         // 사용자 ID
  userName: "김모여",                  // 사용자 이름
  userType: "referrer",               // referrer | referee

  // 금액 정보
  amount: 5000,                       // 캐시백 금액 (원)
  remainingAmount: 5000,              // 잔여 금액 (사용 후 차감)

  // 연결 정보
  referralCode: "ABC123XYZ",          // 레퍼럴 코드
  orderId: "20260112-0001234",        // 카페24 주문 ID
  dealId: "deal_20260112_001",        // 공구 ID

  // 날짜 정보
  earnedAt: Timestamp,                // 적립일시
  expiresAt: Timestamp,               // 만료일시 (1년 후)
  usedAt: Timestamp,                  // 사용일시 (null이면 미사용)

  // 상태
  status: "active",                   // active | used | expired | cancelled

  // 사용 내역
  usedFor: null,                      // 사용처 (주문 ID 등)
  usedAmount: 0                       // 사용 금액
}
```

#### 3. `users` (사용자 정보에 캐시백 요약 추가)
```javascript
{
  // 기존 필드들...
  userId: "user_kakao_12345",
  name: "김모여",
  email: "moyeora@example.com",

  // 레퍼럴 관련 추가 필드
  referralStats: {
    totalInvites: 10,                 // 총 초대 수
    successfulConversions: 3,         // 성공한 구매 수
    totalCashbackEarned: 15000,       // 총 적립 캐시백
    availableCashback: 12000,         // 사용 가능 캐시백
    usedCashback: 3000,               // 사용한 캐시백
    myReferralCode: "ABC123XYZ"       // 내 추천 코드 (고정)
  }
}
```

#### 4. `cafe24_orders` (기존 컬렉션에 필드 추가)
```javascript
{
  // 기존 필드들...
  order_id: "20260112-0001234",
  member_id: "moyeora123",
  order_date: "2026-01-12T15:30:00",
  payment_amount: 50000,

  // 레퍼럴 관련 추가 필드
  referralCode: "ABC123XYZ",          // 레퍼럴 코드
  referrerId: "user_kakao_12345",     // 추천인 ID
  isReferralPurchase: true,           // 레퍼럴 구매 여부
  cashbackProcessed: true,            // 캐시백 처리 완료 여부
  cashbackProcessedAt: Timestamp      // 캐시백 처리 일시
}
```

---

## 구현 단계

### Phase 1: 기본 레퍼럴 시스템 (1-2일)

#### Step 1: 레퍼럴 코드 생성
```javascript
// admin/index.html에 추가
async function generateReferralCode(userId, dealId) {
  // 짧고 고유한 코드 생성 (8자리)
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  const referralData = {
    referralCode: code,
    referrerId: userId,
    dealId: dealId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
    clicks: 0,
    conversions: 0,
    status: 'active'
  };

  await db.collection('referrals').doc(code).set(referralData);
  return code;
}
```

#### Step 2: 공유 페이지 UI
```html
<!-- /deal.html 또는 기존 공구 페이지에 추가 -->
<div class="referral-share-section">
  <h3>🎁 친구 초대하고 함께 할인 받기</h3>
  <p>친구가 구매하면 <strong>당신</strong>은 5,000원, <strong>친구</strong>는 3,000원 캐시백!</p>

  <div class="referral-link-box">
    <input type="text" id="referral-link" readonly value="https://moyeoradeal.com/deal?ref=ABC123">
    <button onclick="copyReferralLink()">링크 복사</button>
  </div>

  <div class="share-buttons">
    <button onclick="shareKakao()">카카오톡 공유</button>
    <button onclick="shareSMS()">문자 공유</button>
  </div>
</div>

<script>
// 레퍼럴 링크 생성 및 복사
async function copyReferralLink() {
  const userId = firebase.auth().currentUser?.uid;
  const dealId = new URLSearchParams(window.location.search).get('id');

  // 레퍼럴 코드 생성 (DB에 저장)
  const code = await generateReferralCode(userId, dealId);
  const referralLink = `https://moyeoradeal.com/deal?id=${dealId}&ref=${code}`;

  // 클립보드에 복사
  await navigator.clipboard.writeText(referralLink);
  alert('✅ 링크가 복사되었습니다!');
}

// 카카오톡 공유
function shareKakao() {
  Kakao.Link.sendDefault({
    objectType: 'feed',
    content: {
      title: '🎁 친구 초대 혜택',
      description: '지금 가입하면 3,000원 캐시백!',
      imageUrl: 'https://moyeoradeal.com/images/deal-thumb.jpg',
      link: {
        mobileWebUrl: document.getElementById('referral-link').value,
        webUrl: document.getElementById('referral-link').value
      }
    }
  });
}
</script>
```

#### Step 3: 레퍼럴 클릭 추적
```javascript
// /deal.html 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');

  if (referralCode) {
    // 쿠키에 저장 (7일간 유효)
    document.cookie = `moyeora_ref=${referralCode}; max-age=604800; path=/`;

    // Firestore에 클릭 추적
    try {
      await db.collection('referrals').doc(referralCode).update({
        clicks: firebase.firestore.FieldValue.increment(1),
        lastClickAt: new Date()
      });

      console.log('✅ 레퍼럴 클릭 추적 완료:', referralCode);
    } catch (err) {
      console.error('레퍼럴 추적 오류:', err);
    }
  }
});

// 쿠키 읽기 함수
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}
```

---

### Phase 2: 카페24 주문 연동 (2-3일)

#### Step 4: 주문 동기화 시 레퍼럴 처리
```javascript
// admin/index.html의 syncCafe24Orders() 함수 수정
async function syncCafe24Orders(isAuto = false) {
  // ... 기존 코드 ...

  for (const order of newOrders) {
    // 🎯 레퍼럴 코드 추출 (3가지 방법)
    let referralCode = null;

    // 방법 1: 주문 메모에서 추출
    referralCode = extractReferralCodeFromMemo(order.buyer_memo);

    // 방법 2: 사용자 정의 필드에서 추출 (카페24 설정 필요)
    if (!referralCode && order.additional_information) {
      referralCode = order.additional_information.referral_code;
    }

    // 방법 3: 회원 ID로 최근 클릭한 레퍼럴 찾기
    if (!referralCode && order.member_id) {
      referralCode = await findRecentReferralByMember(order.member_id);
    }

    const orderData = {
      order_id: order.order_id,
      member_id: order.member_id,
      order_date: order.order_date,
      payment_amount: order.payment_amount,
      items: order.items,
      buyer_name: order.buyer_name,
      // 레퍼럴 정보 추가
      referralCode: referralCode,
      isReferralPurchase: !!referralCode,
      cashbackProcessed: false
    };

    batch.set(db.collection('cafe24_orders').doc(order.order_id), orderData);

    // 🎁 레퍼럴 구매 시 즉시 캐시백 처리
    if (referralCode) {
      await processReferralCashback(referralCode, order);
    }
  }

  await batch.commit();
}

// 주문 메모에서 레퍼럴 코드 추출
function extractReferralCodeFromMemo(memo) {
  if (!memo) return null;
  // 패턴: 8자리 영문+숫자 (예: "ABC123XY")
  const match = memo.match(/[A-Z0-9]{8}/i);
  return match ? match[0].toUpperCase() : null;
}

// 회원 ID로 최근 레퍼럴 찾기 (7일 이내)
async function findRecentReferralByMember(memberId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 최근 클릭한 레퍼럴 찾기 (회원 ID 매핑 필요)
  // TODO: 카페24 회원 ID와 Firebase 사용자 ID 매핑 테이블 필요

  return null; // 임시로 null 반환
}
```

#### Step 5: 캐시백 처리 로직
```javascript
// 레퍼럴 구매 시 캐시백 적립
async function processReferralCashback(referralCode, order) {
  try {
    // 1. 레퍼럴 정보 가져오기
    const referralDoc = await db.collection('referrals').doc(referralCode).get();
    if (!referralDoc.exists) {
      console.error('❌ 레퍼럴 코드가 존재하지 않음:', referralCode);
      return;
    }

    const referral = referralDoc.data();

    // 만료 확인
    if (referral.expiresAt.toDate() < new Date()) {
      console.error('❌ 레퍼럴 코드 만료:', referralCode);
      return;
    }

    // 2. 캐시백 금액 계산 (딜 설정에 따라)
    const dealDoc = await db.collection('deals').doc(referral.dealId).get();
    const deal = dealDoc.data();

    const referrerReward = deal.referrerCashback || 5000;  // 추천인: 5,000원
    const refereeReward = deal.refereeCashback || 3000;    // 피추천인: 3,000원

    // 3. 추천인 캐시백 적립
    const referrerCashback = {
      userId: referral.referrerId,
      userType: 'referrer',
      amount: referrerReward,
      remainingAmount: referrerReward,
      referralCode: referralCode,
      orderId: order.order_id,
      dealId: referral.dealId,
      earnedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 후
      status: 'active'
    };
    await db.collection('cashbacks').add(referrerCashback);

    // 4. 피추천인 캐시백 적립
    const purchaserId = order.member_id; // TODO: 카페24 회원 ID → Firebase UID 변환
    const refereeCashback = {
      userId: purchaserId,
      userType: 'referee',
      amount: refereeReward,
      remainingAmount: refereeReward,
      referralCode: referralCode,
      orderId: order.order_id,
      dealId: referral.dealId,
      earnedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active'
    };
    await db.collection('cashbacks').add(refereeCashback);

    // 5. 레퍼럴 통계 업데이트
    await db.collection('referrals').doc(referralCode).update({
      conversions: firebase.firestore.FieldValue.increment(1),
      totalSales: firebase.firestore.FieldValue.increment(order.payment_amount),
      referrerCashback: firebase.firestore.FieldValue.increment(referrerReward),
      refereeCashback: firebase.firestore.FieldValue.increment(refereeReward),
      totalCashback: firebase.firestore.FieldValue.increment(referrerReward + refereeReward),
      'purchases': firebase.firestore.FieldValue.arrayUnion({
        orderId: order.order_id,
        purchaserId: purchaserId,
        purchaseDate: new Date(order.order_date),
        amount: order.payment_amount,
        referrerReward: referrerReward,
        refereeReward: refereeReward,
        status: 'completed'
      })
    });

    // 6. 주문에 캐시백 처리 완료 표시
    await db.collection('cafe24_orders').doc(order.order_id).update({
      cashbackProcessed: true,
      cashbackProcessedAt: new Date()
    });

    console.log(`✅ 캐시백 처리 완료: ${referralCode} → 추천인 ${referrerReward}원, 피추천인 ${refereeReward}원`);

    // 7. 알림 전송 (선택)
    await sendCashbackNotification(referral.referrerId, referrerReward);
    await sendCashbackNotification(purchaserId, refereeReward);

  } catch (err) {
    console.error('❌ 캐시백 처리 오류:', err);
  }
}
```

---

### Phase 3: 캐시백 사용 및 정산 (2일)

#### Step 6: 캐시백 조회 UI
```html
<!-- /my-cashback.html (새 페이지) -->
<div class="cashback-dashboard">
  <div class="cashback-summary">
    <h2>💰 내 캐시백</h2>
    <div class="balance">
      <span class="amount" id="total-cashback">0</span>원
    </div>
    <p>사용 가능: <span id="available-cashback">0</span>원</p>
    <p>사용 완료: <span id="used-cashback">0</span>원</p>
  </div>

  <div class="referral-stats">
    <h3>📊 초대 현황</h3>
    <p>총 초대 수: <span id="total-invites">0</span>명</p>
    <p>구매 완료: <span id="conversions">0</span>명</p>
    <p>전환율: <span id="conversion-rate">0</span>%</p>
  </div>

  <div class="cashback-history">
    <h3>📜 캐시백 내역</h3>
    <table id="cashback-table">
      <thead>
        <tr>
          <th>날짜</th>
          <th>유형</th>
          <th>금액</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
</div>

<script>
// 캐시백 데이터 로드
async function loadCashbackData() {
  const userId = firebase.auth().currentUser?.uid;

  // 1. 캐시백 내역 가져오기
  const cashbacksSnapshot = await db.collection('cashbacks')
    .where('userId', '==', userId)
    .orderBy('earnedAt', 'desc')
    .get();

  let totalCashback = 0;
  let availableCashback = 0;
  let usedCashback = 0;

  cashbacksSnapshot.forEach(doc => {
    const cashback = doc.data();
    totalCashback += cashback.amount;
    if (cashback.status === 'active') {
      availableCashback += cashback.remainingAmount;
    } else if (cashback.status === 'used') {
      usedCashback += cashback.amount;
    }
  });

  // UI 업데이트
  document.getElementById('total-cashback').textContent = totalCashback.toLocaleString();
  document.getElementById('available-cashback').textContent = availableCashback.toLocaleString();
  document.getElementById('used-cashback').textContent = usedCashback.toLocaleString();

  // 2. 초대 통계 가져오기
  const referralsSnapshot = await db.collection('referrals')
    .where('referrerId', '==', userId)
    .get();

  let totalInvites = 0;
  let conversions = 0;

  referralsSnapshot.forEach(doc => {
    const referral = doc.data();
    totalInvites += referral.clicks;
    conversions += referral.conversions;
  });

  document.getElementById('total-invites').textContent = totalInvites;
  document.getElementById('conversions').textContent = conversions;
  document.getElementById('conversion-rate').textContent =
    totalInvites > 0 ? ((conversions / totalInvites) * 100).toFixed(1) : 0;
}
</script>
```

#### Step 7: 캐시백 사용 로직
```javascript
// 주문 시 캐시백 사용
async function applyCashback(userId, orderAmount) {
  // 1. 사용 가능한 캐시백 조회
  const cashbacksSnapshot = await db.collection('cashbacks')
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .orderBy('earnedAt', 'asc') // 오래된 것부터 사용
    .get();

  let remainingAmount = orderAmount;
  const usedCashbacks = [];

  // 2. 캐시백 차감 (FIFO)
  for (const doc of cashbacksSnapshot.docs) {
    if (remainingAmount <= 0) break;

    const cashback = doc.data();
    const useAmount = Math.min(cashback.remainingAmount, remainingAmount);

    // 캐시백 차감
    const newRemainingAmount = cashback.remainingAmount - useAmount;
    await doc.ref.update({
      remainingAmount: newRemainingAmount,
      usedAmount: firebase.firestore.FieldValue.increment(useAmount),
      status: newRemainingAmount === 0 ? 'used' : 'active',
      usedAt: new Date()
    });

    usedCashbacks.push({
      cashbackId: doc.id,
      useAmount: useAmount
    });

    remainingAmount -= useAmount;
  }

  return {
    totalUsed: orderAmount - remainingAmount,
    usedCashbacks: usedCashbacks
  };
}
```

---

## 카페24 연동 방안

### 옵션 1: 주문 메모 방식 (간단)
**카페24 설정:** 없음
**사용자 액션:** 수동 입력 필요

```javascript
// 구매자가 주문 시 "요청사항"에 레퍼럴 코드 입력
// 예: "ABC123XY"

// 주문 동기화 시 메모에서 추출
function extractReferralCodeFromMemo(memo) {
  if (!memo) return null;
  const match = memo.match(/[A-Z0-9]{8}/i);
  return match ? match[0].toUpperCase() : null;
}
```

---

### 옵션 2: 사용자 정의 필드 방식 (권장)
**카페24 설정:** 필요
**사용자 액션:** 자동

#### 카페24 설정 단계
1. **카페24 관리자 > 쇼핑몰 설정 > 주문 설정**
2. **"주문서 사용자 정의 필드" 추가**
   - 필드명: `referral_code`
   - 필드 유형: 텍스트
   - 최대 길이: 20자
   - 필수 입력: 아니오
   - 노출 위치: 주문서 상단

3. **API 설정에서 추가 필드 활성화**

```javascript
// 카페24 API 호출 시 embed 파라미터에 추가
const apiEndpoint = `/api/v2/admin/orders?embed=items,additional_information&start_date=${startDateStr}`;

// 응답 예시
{
  "order_id": "20260112-0001234",
  "additional_information": {
    "referral_code": "ABC123XY"  // ← 사용자 정의 필드
  }
}
```

---

### 옵션 3: Webhook 방식 (실시간)
**카페24 설정:** 필요 (개발자 앱 등록)
**사용자 액션:** 자동

#### Cloud Function으로 Webhook 엔드포인트 생성

```javascript
// /functions/index.js에 추가
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.cafe24OrderWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // 카페24에서 주문 생성 시 자동 호출
    const { order_id, member_id, product_no, additional_information } = req.body;

    const referralCode = additional_information?.referral_code;

    if (referralCode) {
      // Firestore에 즉시 저장
      await admin.firestore().collection('cafe24_orders').doc(order_id).set({
        order_id,
        member_id,
        product_no,
        referralCode,
        isReferralPurchase: true,
        cashbackProcessed: false,
        receivedAt: new Date()
      }, { merge: true });

      console.log(`✅ Webhook 수신: ${order_id}, 레퍼럴: ${referralCode}`);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook 오류:', err);
    res.status(500).send('Error');
  }
});
```

#### 카페24 Webhook 설정
1. **카페24 개발자센터** (https://developers.cafe24.com/)
2. **앱 등록 → Webhook URL 등록**
   - Webhook URL: `https://us-central1-moyeora-deal-manager.cloudfunctions.net/cafe24OrderWebhook`
   - 이벤트: `주문 생성 (order.created)`

---

## 보안 및 검증

### 1. 레퍼럴 코드 중복 방지
```javascript
async function generateUniqueReferralCode(userId, dealId) {
  let code;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 중복 확인
    const existing = await db.collection('referrals').doc(code).get();
    if (!existing.exists) {
      return code; // 고유한 코드 발견
    }

    attempts++;
  }

  throw new Error('레퍼럴 코드 생성 실패');
}
```

### 2. 자기 자신 구매 방지
```javascript
async function validateReferralPurchase(referralCode, purchaserId) {
  const referralDoc = await db.collection('referrals').doc(referralCode).get();
  const referral = referralDoc.data();

  // 추천인과 구매자가 같으면 차단
  if (referral.referrerId === purchaserId) {
    console.error('❌ 자기 자신은 추천할 수 없습니다');
    return false;
  }

  return true;
}
```

### 3. 중복 구매 방지 (1인 1회 제한)
```javascript
async function checkDuplicateReferralPurchase(referralCode, purchaserId) {
  const existingCashback = await db.collection('cashbacks')
    .where('referralCode', '==', referralCode)
    .where('userId', '==', purchaserId)
    .where('userType', '==', 'referee')
    .limit(1)
    .get();

  if (!existingCashback.empty) {
    console.error('❌ 이미 캐시백을 받았습니다');
    return false; // 중복 구매
  }

  return true;
}
```

### 4. 레퍼럴 코드 만료 처리
```javascript
// 매일 자동 실행 (Cloud Function Scheduled)
exports.expireOldReferrals = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const now = new Date();

  const expiredReferrals = await admin.firestore().collection('referrals')
    .where('status', '==', 'active')
    .where('expiresAt', '<', now)
    .get();

  const batch = admin.firestore().batch();
  expiredReferrals.forEach(doc => {
    batch.update(doc.ref, { status: 'expired' });
  });

  await batch.commit();
  console.log(`✅ ${expiredReferrals.size}개 레퍼럴 만료 처리 완료`);
});
```

---

## 추가 고려사항

### 1. 카페24 회원 ID ↔ Firebase UID 매핑
```javascript
// 카페24 회원 ID와 Firebase UID 연결 테이블 필요
// Firestore 컬렉션: user_mappings
{
  cafe24MemberId: "moyeora123",
  firebaseUid: "user_kakao_12345",
  email: "moyeora@example.com",
  createdAt: Timestamp
}

// 매핑 함수
async function getFirebaseUidFromCafe24Member(memberId) {
  const mappingDoc = await db.collection('user_mappings')
    .where('cafe24MemberId', '==', memberId)
    .limit(1)
    .get();

  if (mappingDoc.empty) {
    console.error('❌ 회원 매핑 정보 없음:', memberId);
    return null;
  }

  return mappingDoc.docs[0].data().firebaseUid;
}
```

### 2. 레퍼럴 통계 대시보드
```javascript
// admin/index.html에 레퍼럴 분석 메뉴 추가
async function renderReferralAnalytics() {
  const referralsSnapshot = await db.collection('referrals').get();

  let totalClicks = 0;
  let totalConversions = 0;
  let totalCashback = 0;

  referralsSnapshot.forEach(doc => {
    const data = doc.data();
    totalClicks += data.clicks || 0;
    totalConversions += data.conversions || 0;
    totalCashback += data.totalCashback || 0;
  });

  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0;

  console.log(`
    📊 레퍼럴 통계
    ├─ 총 클릭: ${totalClicks}
    ├─ 총 구매: ${totalConversions}
    ├─ 전환율: ${conversionRate}%
    └─ 총 캐시백: ${totalCashback.toLocaleString()}원
  `);
}
```

### 3. 푸시 알림 (선택)
```javascript
// Cloud Messaging으로 캐시백 적립 알림
async function sendCashbackNotification(userId, amount) {
  const userDoc = await db.collection('users').doc(userId).get();
  const fcmToken = userDoc.data()?.fcmToken;

  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: '🎁 캐시백 적립 완료!',
        body: `${amount.toLocaleString()}원이 적립되었습니다.`
      },
      data: {
        type: 'cashback',
        amount: amount.toString()
      }
    });
  }
}
```

---

## 예상 비용 및 ROI

### 개발 비용
- Phase 1 (기본 레퍼럴): 1-2일
- Phase 2 (카페24 연동): 2-3일
- Phase 3 (캐시백 사용): 2일
- **총 개발 기간: 5-7일**

### 운영 비용
- Firebase Firestore: 무료 할당량 내 (월 50,000 read, 20,000 write)
- Cloud Functions: 무료 할당량 내 (월 200만 호출)
- 캐시백 지급: 주문당 평균 8,000원 (추천인 5,000원 + 피추천인 3,000원)

### 예상 효과
- **바이럴 계수 (K-factor)**: 0.3 ~ 0.5
- **전환율 증가**: 15~25%
- **고객 획득 비용 (CAC) 절감**: 30~40%

---

## 다음 단계

1. ✅ **구현 방식 결정**
   - 옵션 1: 주문 메모 (빠른 프로토타입)
   - ✨ **옵션 2: 사용자 정의 필드 (권장)**
   - 옵션 3: Webhook (실시간)

2. ✅ **카페24 설정**
   - 사용자 정의 필드 추가
   - API 권한 확인

3. ✅ **Firestore 컬렉션 생성**
   - `referrals`
   - `cashbacks`
   - `user_mappings`

4. ✅ **UI 개발**
   - 공유 버튼
   - 캐시백 대시보드

5. ✅ **테스트**
   - 레퍼럴 링크 생성
   - 주문 동기화
   - 캐시백 적립

6. ✅ **배포 및 모니터링**

---

## 결론

✅ **구현 가능합니다!**

현재 시스템(Firebase + 카페24 연동)을 활용하면 레퍼럴 캐시백 시스템을 **5-7일 내에 구현** 가능합니다.

**권장 방식:** 옵션 2 (사용자 정의 필드 + 쿠키)
- 자동 추적으로 높은 전환율
- 카페24 기본 기능 활용
- 확장성 우수

**핵심 기술:**
- Firebase Firestore (레퍼럴 데이터 저장)
- 카페24 OAuth API (주문 동기화)
- JavaScript 쿠키 (추적)
- Cloud Functions (자동 처리)

질문이나 추가 논의가 필요하시면 말씀해주세요! 🚀
