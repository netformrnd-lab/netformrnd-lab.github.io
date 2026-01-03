# 내일(PC) 작업 목록 - 모여라딜 인바운드 시스템

> **작성일**: 2026-01-03
> **목표**: 고객 유입 추적 및 관리자 대시보드 구축
> **예상 소요 시간**: 5.5시간

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
1. PPT에서 "입점신청 작성하기" 클릭 → `?ref=ppt` 확인
2. 신청서 제출 → Firestore에서 `inbound.referrer = "ppt"` 확인
3. 아웃바운드 테스트: `?ref=kakao&type=outbound&sales=김철수` URL 직접 입력
4. 제출 후 DB 확인: `inbound.type = "outbound"`, `inbound.salesPerson = "김철수"`

---

### 2️⃣ 바로 문의하기 기능 (우선순위: 상)

**소요 시간**: 1시간
**파일**:
- `/ppt/supplier/index.html` (Slide 20 수정)
- `/supplier/index.html` (하단 CTA 섹션)

#### 작업 내용
간단한 문의 폼 추가 (이름, 연락처, 메모만)

#### 1) HTML 수정

##### `/ppt/supplier/index.html` - Slide 20 (Line 1163)
```html
<!-- 기존 -->
<a href="/supplier/apply.html?ref=ppt" class="cta-button">입점신청 작성하기 👆</a>

<!-- 변경 후 -->
<div class="cta-buttons-wrapper">
    <a href="/supplier/apply.html?ref=ppt" class="cta-button primary">
        입점신청 작성하기 📝
    </a>
    <button onclick="openQuickInquiry()" class="cta-button secondary">
        바로 문의하기 ⚡️
    </button>
</div>
```

##### 모달 추가 (body 닫기 전)
```html
<!-- Quick Inquiry Modal -->
<div id="quickInquiryModal" class="modal" style="display: none;">
    <div class="modal-overlay" onclick="closeQuickInquiry()"></div>
    <div class="modal-content">
        <h3>바로 문의하기</h3>
        <p class="modal-desc">간단한 정보만 남겨주시면<br>빠르게 연락드리겠습니다</p>

        <input type="text" id="quick_name" placeholder="성함" required>
        <input type="tel" id="quick_phone" placeholder="연락처 (010-0000-0000)" required>
        <textarea id="quick_note" placeholder="간단한 메모 (선택사항)" rows="3"></textarea>

        <button onclick="submitQuickInquiry()" class="submit-btn">문의 보내기</button>
        <button onclick="closeQuickInquiry()" class="cancel-btn">닫기</button>
    </div>
</div>
```

##### CSS 추가
```css
.cta-buttons-wrapper {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.cta-button.primary {
    background: linear-gradient(135deg, #fc9600 0%, #ea8000 100%);
    flex: 1;
    min-width: 250px;
}

.cta-button.secondary {
    background: transparent;
    border: 2px solid #fc9600;
    color: #fc9600;
    flex: 1;
    min-width: 250px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
}

.modal-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
}

.modal-content {
    position: relative;
    background: #1a1a1a;
    border: 1px solid #fc9600;
    border-radius: 20px;
    max-width: 500px;
    margin: 100px auto;
    padding: 40px;
    z-index: 10000;
}

.modal-content input,
.modal-content textarea {
    width: 100%;
    padding: 14px;
    margin: 10px 0;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    color: #fff;
    font-size: 15px;
}
```

#### 2) JavaScript 추가

```javascript
// Firebase 설정 (이미 있음)
const db = firebase.firestore();

function openQuickInquiry() {
    document.getElementById('quickInquiryModal').style.display = 'block';
}

function closeQuickInquiry() {
    document.getElementById('quickInquiryModal').style.display = 'none';
}

async function submitQuickInquiry() {
    const name = document.getElementById('quick_name').value.trim();
    const phone = document.getElementById('quick_phone').value.trim();
    const note = document.getElementById('quick_note').value.trim();

    if (!name || !phone) {
        alert('성함과 연락처는 필수입니다.');
        return;
    }

    try {
        // 현재 페이지 referrer 확인
        const currentPage = window.location.pathname.includes('ppt') ? 'ppt' : 'homepage';

        const inquiryData = {
            contactName: name,
            phone: phone,
            inquiryNote: note || '',

            // 상태 및 분류
            status: 'inquiry',  // 🔑 정식 신청과 구분
            source: 'quick_inquiry',

            // 인바운드 추적
            inbound: {
                type: 'inbound',  // ✅ 인바운드로 기록
                referrer: currentPage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            },

            // 메타
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Firestore에 저장
        await db.collection('supplierApplications').add(inquiryData);

        // 성공 메시지
        alert('문의가 접수되었습니다!\n빠른 시일 내에 연락드리겠습니다.');
        closeQuickInquiry();

        // 폼 초기화
        document.getElementById('quick_name').value = '';
        document.getElementById('quick_phone').value = '';
        document.getElementById('quick_note').value = '';

    } catch (error) {
        console.error('문의 제출 실패:', error);
        alert('문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}
```

#### Firebase 설정 추가 (없으면)
```html
<!-- ppt/supplier/index.html에 추가 -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<script>
const firebaseConfig = {
    apiKey: "AIzaSyBpyPOaWCp3XWbF6OE8F-pFrYZoGWDOCrM",
    authDomain: "moyeora-deal-manager.firebaseapp.com",
    projectId: "moyeora-deal-manager",
    storageBucket: "moyeora-deal-manager.firebasestorage.app",
    messagingSenderId: "1064992003993",
    appId: "1:1064992003993:web:d63b5f3a6b3e3f2a2b3e3f"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
</script>
```

---

### 3️⃣ 관리자 수동 입력 페이지 (우선순위: 중)

**소요 시간**: 1.5시간
**파일**: `/admin/manual-entry.html` (신규)

#### 작업 내용
기존 DB 데이터를 입점신청서 형식으로 수동 입력

#### 전체 코드

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>수동 입력 - 관리자</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(180deg, #111 0%, #1a1a1a 100%);
            color: #f0f0f0;
            font-family: 'Noto Sans KR', sans-serif;
            padding: 40px 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 32px;
            color: #fc9600;
            margin-bottom: 10px;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        .tab-btn {
            flex: 1;
            padding: 14px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .tab-btn.active {
            background: #fc9600;
            color: #111;
        }
        .form-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            color: rgba(255,255,255,0.9);
        }
        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            color: #fff;
            font-size: 15px;
        }
        .form-textarea {
            min-height: 80px;
            resize: vertical;
        }
        .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #fc9600 0%, #ea8000 100%);
            border: none;
            border-radius: 12px;
            color: #111;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(252, 150, 0, 0.4);
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 수동 입력</h1>
            <p>기존 DB 데이터를 입점신청서 형식으로 입력</p>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('supplier')">공급사</button>
            <button class="tab-btn" onclick="switchTab('seller')">셀러</button>
        </div>

        <!-- 공급사 탭 -->
        <div id="supplier-tab" class="tab-content active">
            <div class="form-card">
                <form id="supplierForm">
                    <div class="form-group">
                        <label class="form-label">회사명 *</label>
                        <input type="text" class="form-input" name="companyName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">담당자명 *</label>
                        <input type="text" class="form-input" name="managerName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">연락처 *</label>
                        <input type="tel" class="form-input" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">이메일</label>
                        <input type="email" class="form-input" name="email">
                    </div>
                    <div class="form-group">
                        <label class="form-label">주요 제품</label>
                        <input type="text" class="form-input" name="mainProduct">
                    </div>
                    <div class="form-group">
                        <label class="form-label">메모</label>
                        <textarea class="form-textarea" name="note"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">입력자 *</label>
                        <input type="text" class="form-input" name="addedBy" required placeholder="관리자 이름">
                    </div>
                    <button type="submit" class="submit-btn">공급사 추가</button>
                </form>
            </div>
        </div>

        <!-- 셀러 탭 -->
        <div id="seller-tab" class="tab-content">
            <div class="form-card">
                <form id="sellerForm">
                    <div class="form-group">
                        <label class="form-label">셀러명 *</label>
                        <input type="text" class="form-input" name="sellerName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">연락처 *</label>
                        <input type="tel" class="form-input" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">인스타그램</label>
                        <input type="text" class="form-input" name="instagram" placeholder="@username">
                    </div>
                    <div class="form-group">
                        <label class="form-label">팔로워 수</label>
                        <input type="number" class="form-input" name="followers">
                    </div>
                    <div class="form-group">
                        <label class="form-label">메모</label>
                        <textarea class="form-textarea" name="note"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">입력자 *</label>
                        <input type="text" class="form-input" name="addedBy" required placeholder="관리자 이름">
                    </div>
                    <button type="submit" class="submit-btn">셀러 추가</button>
                </form>
            </div>
        </div>
    </div>

    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

    <script>
        const firebaseConfig = {
            apiKey: "AIzaSyBpyPOaWCp3XWbF6OE8F-pFrYZoGWDOCrM",
            authDomain: "moyeora-deal-manager.firebaseapp.com",
            projectId: "moyeora-deal-manager",
            storageBucket: "moyeora-deal-manager.firebasestorage.app",
            messagingSenderId: "1064992003993",
            appId: "1:1064992003993:web:d63b5f3a6b3e3f2a2b3e3f"
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        function switchTab(type) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            if (type === 'supplier') {
                document.querySelectorAll('.tab-btn')[0].classList.add('active');
                document.getElementById('supplier-tab').classList.add('active');
            } else {
                document.querySelectorAll('.tab-btn')[1].classList.add('active');
                document.getElementById('seller-tab').classList.add('active');
            }
        }

        // 공급사 폼 제출
        document.getElementById('supplierForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const data = {
                companyName: formData.get('companyName'),
                managerName: formData.get('managerName'),
                phone: formData.get('phone'),
                email: formData.get('email') || '',
                mainProduct: formData.get('mainProduct') || '',
                note: formData.get('note') || '',

                // 🔑 수동 입력 표시
                status: 'pending',
                source: 'manual_entry',
                inbound: {
                    type: 'manual',
                    addedBy: formData.get('addedBy'),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                },

                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                await db.collection('supplierApplications').add(data);
                alert('공급사가 추가되었습니다!');
                e.target.reset();
            } catch (error) {
                console.error('추가 실패:', error);
                alert('추가 중 오류가 발생했습니다.');
            }
        });

        // 셀러 폼 제출
        document.getElementById('sellerForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const data = {
                name: formData.get('sellerName'),
                phone: formData.get('phone'),
                instagram: formData.get('instagram') || '',
                followers: formData.get('followers') || 0,
                note: formData.get('note') || '',

                // 🔑 수동 입력 표시
                status: 'active',
                source: 'manual_entry',
                inbound: {
                    type: 'manual',
                    addedBy: formData.get('addedBy'),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                },

                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                await db.collection('sellers').add(data);
                alert('셀러가 추가되었습니다!');
                e.target.reset();
            } catch (error) {
                console.error('추가 실패:', error);
                alert('추가 중 오류가 발생했습니다.');
            }
        });
    </script>
</body>
</html>
```

---

### 4️⃣ 통합 대시보드 (우선순위: 중)

**소요 시간**: 2시간
**파일**: `/admin/dashboard.html` (신규)

#### 작업 내용
공급사/셀러 통합 리스트 및 통계 대시보드

#### 전체 코드

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대시보드 - 관리자</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(180deg, #111 0%, #1a1a1a 100%);
            color: #f0f0f0;
            font-family: 'Noto Sans KR', sans-serif;
            padding: 40px 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 36px;
            color: #fc9600;
            margin-bottom: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 24px;
        }
        .stat-label {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #fc9600;
        }
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .filter-btn {
            padding: 10px 20px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 30px;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .filter-btn.active {
            background: #fc9600;
            color: #111;
        }
        .table-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 20px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        th {
            font-weight: 600;
            color: #fc9600;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge.inquiry { background: #3b82f6; color: #fff; }
        .badge.pending { background: #f59e0b; color: #111; }
        .badge.manual { background: #8b5cf6; color: #fff; }
        .badge.inbound { background: #10b981; color: #fff; }
        .badge.outbound { background: #ef4444; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 통합 대시보드</h1>
            <p>공급사 및 셀러 현황</p>
        </div>

        <!-- 통계 카드 -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">전체 공급사</div>
                <div class="stat-value" id="totalSuppliers">-</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">신청서</div>
                <div class="stat-value" id="webApplications">-</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">수동 입력</div>
                <div class="stat-value" id="manualEntries">-</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">바로 문의</div>
                <div class="stat-value" id="quickInquiries">-</div>
            </div>
        </div>

        <!-- 필터 -->
        <div class="filters">
            <button class="filter-btn active" onclick="filterData('all')">전체</button>
            <button class="filter-btn" onclick="filterData('web_application')">신청서</button>
            <button class="filter-btn" onclick="filterData('manual_entry')">수동입력</button>
            <button class="filter-btn" onclick="filterData('quick_inquiry')">바로문의</button>
            <button class="filter-btn" onclick="filterData('inbound')">인바운드</button>
            <button class="filter-btn" onclick="filterData('outbound')">아웃바운드</button>
        </div>

        <!-- 테이블 -->
        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>회사명/셀러명</th>
                        <th>연락처</th>
                        <th>상태</th>
                        <th>유입경로</th>
                        <th>타입</th>
                        <th>등록일</th>
                    </tr>
                </thead>
                <tbody id="dataTable">
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px;">
                            데이터를 불러오는 중...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

    <script>
        const firebaseConfig = {
            apiKey: "AIzaSyBpyPOaWCp3XWbF6OE8F-pFrYZoGWDOCrM",
            authDomain: "moyeora-deal-manager.firebaseapp.com",
            projectId: "moyeora-deal-manager",
            storageBucket: "moyeora-deal-manager.firebasestorage.app",
            messagingSenderId: "1064992003993",
            appId: "1:1064992003993:web:d63b5f3a6b3e3f2a2b3e3f"
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        let allData = [];

        async function loadData() {
            try {
                const snapshot = await db.collection('supplierApplications')
                    .orderBy('createdAt', 'desc')
                    .get();

                allData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                updateStats();
                renderTable(allData);
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            }
        }

        function updateStats() {
            const total = allData.length;
            const webApp = allData.filter(d => d.source === 'web_application').length;
            const manual = allData.filter(d => d.source === 'manual_entry').length;
            const inquiry = allData.filter(d => d.source === 'quick_inquiry').length;

            document.getElementById('totalSuppliers').textContent = total;
            document.getElementById('webApplications').textContent = webApp;
            document.getElementById('manualEntries').textContent = manual;
            document.getElementById('quickInquiries').textContent = inquiry;
        }

        function renderTable(data) {
            const tbody = document.getElementById('dataTable');

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">데이터가 없습니다.</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.companyName || item.contactName || '-'}</td>
                    <td>${item.phone || '-'}</td>
                    <td><span class="badge ${item.status}">${getStatusText(item.status)}</span></td>
                    <td><span class="badge ${item.inbound?.type}">${item.inbound?.referrer || 'direct'}</span></td>
                    <td><span class="badge ${item.inbound?.type}">${item.inbound?.type || 'inbound'}</span></td>
                    <td>${formatDate(item.createdAt)}</td>
                </tr>
            `).join('');
        }

        function filterData(type) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            let filtered = allData;

            if (type === 'all') {
                filtered = allData;
            } else if (type === 'inbound' || type === 'outbound') {
                filtered = allData.filter(d => d.inbound?.type === type);
            } else {
                filtered = allData.filter(d => d.source === type);
            }

            renderTable(filtered);
        }

        function getStatusText(status) {
            const statusMap = {
                'inquiry': '문의',
                'pending': '대기',
                'approved': '승인',
                'active': '활성'
            };
            return statusMap[status] || status;
        }

        function formatDate(timestamp) {
            if (!timestamp) return '-';
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('ko-KR');
        }

        // 페이지 로드 시 데이터 불러오기
        loadData();
    </script>
</body>
</html>
```

---

### 5️⃣ 간단한 로그인 페이지 (우선순위: 하)

**소요 시간**: 30분
**파일**: `/admin/login.html` (신규)

#### 전체 코드

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 로그인</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(180deg, #111 0%, #1a1a1a 100%);
            color: #f0f0f0;
            font-family: 'Noto Sans KR', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .login-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px;
            padding: 48px 40px;
            max-width: 400px;
            width: 90%;
        }
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo h1 {
            font-size: 32px;
            color: #fc9600;
            margin-bottom: 8px;
        }
        .logo p {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .form-input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            color: #fff;
            font-size: 15px;
        }
        .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #fc9600 0%, #ea8000 100%);
            border: none;
            border-radius: 12px;
            color: #111;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 24px;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(252, 150, 0, 0.4);
        }
        .error {
            color: #ef4444;
            font-size: 14px;
            margin-top: 10px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="logo">
            <h1>🔐 관리자</h1>
            <p>모여라딜 관리자 페이지</p>
        </div>

        <form id="loginForm">
            <div class="form-group">
                <label class="form-label">비밀번호</label>
                <input type="password" class="form-input" id="password" placeholder="비밀번호를 입력하세요">
            </div>

            <p class="error" id="error">비밀번호가 올바르지 않습니다.</p>

            <button type="submit" class="submit-btn">로그인</button>
        </form>
    </div>

    <script>
        const ADMIN_PASSWORD = '모여라딜2026';  // 비밀번호 변경 가능

        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const error = document.getElementById('error');

            if (password === ADMIN_PASSWORD) {
                localStorage.setItem('adminAuth', 'true');
                localStorage.setItem('adminAuthTime', Date.now());
                window.location.href = '/admin/dashboard.html';
            } else {
                error.style.display = 'block';
                document.getElementById('password').value = '';
            }
        });

        // 이미 로그인된 경우
        if (localStorage.getItem('adminAuth') === 'true') {
            const authTime = localStorage.getItem('adminAuthTime');
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            // 24시간 이내면 자동 로그인
            if (now - authTime < oneDay) {
                window.location.href = '/admin/dashboard.html';
            } else {
                localStorage.removeItem('adminAuth');
                localStorage.removeItem('adminAuthTime');
            }
        }
    </script>
</body>
</html>
```

#### 다른 페이지에 인증 체크 추가

```javascript
// dashboard.html, manual-entry.html 맨 위에 추가
if (localStorage.getItem('adminAuth') !== 'true') {
    window.location.href = '/admin/login.html';
}
```

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

## 🧪 테스트 체크리스트

### UTM 파라미터
- [ ] PPT → 신청서 클릭 → DB에 `inbound.referrer = "ppt"` 저장됨
- [ ] `?ref=kakao&type=outbound&sales=김철수` → DB에 모두 저장됨
- [ ] 직접 URL 입력 (파라미터 없음) → `referrer = "direct"` 저장됨

### 바로 문의하기
- [ ] 모달 열림/닫힘 정상 작동
- [ ] 필수 필드 검증 (이름, 연락처)
- [ ] DB에 `status = "inquiry"` 저장됨
- [ ] DB에 `inbound.type = "inbound"` 저장됨

### 관리자 페이지
- [ ] 로그인 비밀번호 체크
- [ ] 수동 입력 → DB 저장 확인
- [ ] 대시보드 통계 표시
- [ ] 필터 작동 (전체/신청서/수동/문의)

---

## 💡 추가 개선 아이디어 (나중에)

1. **엑셀 내보내기**: 대시보드에서 CSV 다운로드
2. **실시간 알림**: 신규 신청 시 관리자에게 알림
3. **상세 페이지**: 각 신청 클릭 → 상세 정보 팝업
4. **검색 기능**: 회사명/연락처로 검색
5. **차트**: 일별/주별 신청 추이 그래프

---

## 📞 문의

문제 발생 시:
1. 브라우저 콘솔 확인 (F12)
2. Firebase 콘솔에서 데이터 확인
3. `/INBOUND_TRACKING_DESIGN.md` 참고

---

**작성일**: 2026-01-03
**문서 버전**: 1.0
**다음 업데이트**: 작업 완료 후
