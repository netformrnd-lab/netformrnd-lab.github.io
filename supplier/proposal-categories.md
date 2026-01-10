# 모여라딜 공급사 제안서 카테고리 구조

## 📦 1. 제품 카테고리별 제안서 (우선)

### 뷰티/화장품
- 파일명: `email-proposal-beauty.html`
- 타겟: 화장품, 스킨케어, 메이크업 브랜드
- 차별화 포인트:
  - 체험단 효과 극대화 (사용 후기 중요)
  - 엠버서더 뷰티 인플루언서 매칭
  - 트렌드 민감도 높은 카테고리 강조

### 건강식품/영양제
- 파일명: `email-proposal-health.html`
- 타겟: 건강기능식품, 영양제, 다이어트 제품
- 차별화 포인트:
  - 장기 체험단 프로그램 (효과 검증)
  - 재구매율 데이터 강조
  - 건강 관심 고객층 타겟팅

### 식품/음료
- 파일명: `email-proposal-food.html`
- 타겟: 가공식품, 음료, 건강식, 간편식
- 차별화 포인트:
  - 맛 체험 중요성
  - 대량 구매 시 단가 절감 효과
  - 시즌별 수요 예측

### 생활용품/홈케어
- 파일명: `email-proposal-living.html`
- 타겟: 세제, 청소용품, 방향제, 수납용품
- 차별화 포인트:
  - 실용성 중심 후기
  - 가성비 강조
  - 정기 구독 연계 가능성

### 가전/디지털
- 파일명: `email-proposal-electronics.html`
- 타겟: 소형가전, IT기기, 액세서리
- 차별화 포인트:
  - 고가 제품 체험단 효과
  - 상세 사용 후기 콘텐츠
  - 기술 이해도 높은 엠버서더

### 패션/잡화
- 파일명: `email-proposal-fashion.html`
- 타겟: 의류, 가방, 액세서리, 신발
- 차별화 포인트:
  - 시각적 콘텐츠 강점
  - 스타일링 제안
  - 시즌 트렌드 대응

### 육아/키즈
- 파일명: `email-proposal-kids.html`
- 타겟: 유아용품, 장난감, 육아용품
- 차별화 포인트:
  - 엄마 커뮤니티 파워
  - 안전성 후기 중요
  - 재구매율 높음

### 반려동물
- 파일명: `email-proposal-pet.html`
- 타겟: 반려동물 용품, 사료, 간식
- 차별화 포인트:
  - 펫 인플루언서 활용
  - 반려인 커뮤니티 강세
  - 정기 구매 전환율 높음

---

## 🏢 2. 공급사 규모별 제안서 (추후)

### 대기업/중견기업
- 파일명: `email-proposal-enterprise.html`
- 강조점: 데이터 분석, ROI, 브랜드 관리, 규모 있는 협업

### 스타트업/소상공인
- 파일명: `email-proposal-startup.html`
- 강조점: 리스크 제로, 초기비용 부담 없음, 성장 지원

---

## 🎯 3. 목적별 제안서 (추후)

### 신제품 론칭
- 파일명: `email-proposal-newlaunch.html`
- 강조점: 테스트 마켓, 시장 반응 확인, 피드백 수집

### 재고 소진
- 파일명: `email-proposal-inventory.html`
- 강조점: 빠른 물량 처리, 할인 공구 효과, 신속 정산

### 브랜드 인지도 확대
- 파일명: `email-proposal-branding.html`
- 강조점: SNS 확산, 입소문 효과, 콘텐츠 2차 활용

---

## 🎪 4. 판매 방식별 제안서 (추후)

### 공구 중심
- 파일명: `email-proposal-groupbuying.html`
- 강조점: 물량 판매, 가격 경쟁력, 빠른 회전율

### 체험단 중심
- 파일명: `email-proposal-review.html`
- 강조점: 진정성 후기, 브랜드 신뢰도, 콘텐츠 생산

### 하이브리드
- 파일명: `email-proposal-hybrid.html`
- 강조점: 체험단 → 공구 연계, 단계별 성장 전략

---

## 📁 파일 구조 계획

```
supplier/
├── email-proposal.html                    # 기본 범용 제안서
├── proposal-categories.md                 # 이 문서 (카테고리 정리)
│
├── category/                              # 제품 카테고리별
│   ├── email-proposal-beauty.html
│   ├── email-proposal-health.html
│   ├── email-proposal-food.html
│   ├── email-proposal-living.html
│   ├── email-proposal-electronics.html
│   ├── email-proposal-fashion.html
│   ├── email-proposal-kids.html
│   └── email-proposal-pet.html
│
├── scale/                                 # 규모별 (추후)
│   ├── email-proposal-enterprise.html
│   └── email-proposal-startup.html
│
├── purpose/                               # 목적별 (추후)
│   ├── email-proposal-newlaunch.html
│   ├── email-proposal-inventory.html
│   └── email-proposal-branding.html
│
└── method/                                # 판매방식별 (추후)
    ├── email-proposal-groupbuying.html
    ├── email-proposal-review.html
    └── email-proposal-hybrid.html
```

---

## 🎨 각 카테고리별 커스터마이징 요소

### 공통 유지 요소
- 기본 구조 (헤더, 쿠팡 비교, 핵심 지표, CTA)
- 브랜드 색상 (#fe9f29)
- 리스크 제로 메시지
- 친구추천 페이백

### 카테고리별 변경 요소
1. **헤더 메시지**: 카테고리 특성 반영
2. **사례/숫자**: 해당 카테고리 실적 데이터
3. **엠버서더 설명**: 카테고리 특화 인플루언서
4. **혜택 예시**: 카테고리별 이벤트 사례
5. **체험단 프로그램**: 카테고리 특성 맞춤 (예: 뷰티는 7일, 건강식품은 30일)
6. **성공 사례**: 카테고리 동일 업종 레퍼런스

---

## ✅ 1차 작업 범위 (제품 카테고리 8개)

우선 제품 카테고리별 8개 제안서를 만들고, 이후 필요에 따라 규모별/목적별/방식별 제안서를 추가합니다.

**작업 순서 제안:**
1. 뷰티/화장품 (체험단 효과가 가장 명확)
2. 건강식품/영양제 (재구매율 높음)
3. 식품/음료 (일반적이고 접근성 좋음)
4. 생활용품/홈케어 (가성비 강조)
5. 가전/디지털 (고가 제품)
6. 패션/잡화 (시각적 콘텐츠)
7. 육아/키즈 (커뮤니티 파워)
8. 반려동물 (틈새 시장)
