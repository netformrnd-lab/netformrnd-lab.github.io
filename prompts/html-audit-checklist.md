# 모여라딜 전체 HTML 파일 감사 체크리스트

> **사용법**: 각 파일의 상태 칸에 아래 중 하나를 기입하세요.
> - ✅ **활성** — 현재 실사용 중, 유지
> - 🔧 **개선** — 사용 중이지만 수정/리팩토링 필요
> - ❌ **삭제** — 미사용, 제거 대상
> - 🔀 **통합** — 다른 페이지에 흡수 가능
> - ❓ **확인필요** — 사용 여부 불확실

**전체**: 98개 파일 | **총 용량**: ~12.7MB

---

## 1. 핵심 관리 시스템 (Core Admin) — 3개, ~6.1MB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 1 | `admin/index.html` | 2,309KB | 운영센터 (캘린더/공구/정산/CRM) | | |
| 2 | `admin/strategy/index.html` | 1,934KB | 전략센터 (그로스보드/OKR) | | admin2와 기능 중복? |
| 3 | `admin2/index.html` | 1,893KB | 통합 시스템 (운영+전략) | | admin + strategy 통합본 |

> **핵심 질문**: admin, admin/strategy, admin2 세 개 중 어떤 것을 메인으로 쓸 것인가?

---

## 2. 전략센터 서브페이지 (admin/strategy/) — 18개, ~1.3MB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 4 | `admin/strategy/kpi-task-manager.html` | 534KB | KPI 업무 관리자 | | |
| 5 | `admin/strategy/growthboard-share.html` | 121KB | 그로스보드 공유 뷰 | | |
| 6 | `admin/strategy/mega-seller-simulation.html` | 122KB | 메가셀러 시뮬레이션 | | |
| 7 | `admin/strategy/okr-tracker.html` | 83KB | OKR 트래커 | | admin2에 통합? |
| 8 | `admin/strategy/revenue-recognition-analysis.html` | 73KB | 수익 인식 분석 | | |
| 9 | `admin/strategy/growthboard-presentation.html` | 60KB | 그로스보드 프레젠테이션 | | |
| 10 | `admin/strategy/growthboard-presentation-demo.html` | 67KB | 프레젠테이션 데모 | | 데모용, 삭제 가능? |
| 11 | `admin/strategy/growthday-admin.html` | 50KB | 그로스데이 관리자 | | |
| 12 | `admin/strategy/growthday-member.html` | 35KB | 그로스데이 멤버 | | |
| 13 | `admin/strategy/kpi-meeting-view.html` | 37KB | KPI 미팅 뷰 | | |
| 14 | `admin/strategy/meeting-history.html` | 36KB | 미팅 히스토리 | | |
| 15 | `admin/strategy/sales-simulation.html` | 34KB | 매출 시뮬레이션 | | |
| 16 | `admin/strategy/personal-growth-board.html` | 30KB | 개인 그로스보드 | | |
| 17 | `admin/strategy/ppt-center.html` | 25KB | PPT 센터 | | |
| 18 | `admin/strategy/ppt-proposal-example.html` | 28KB | PPT 제안서 예시 | | 예시용, 삭제 가능? |
| 19 | `admin/strategy/ppt-report-example.html` | 20KB | PPT 리포트 예시 | | 예시용, 삭제 가능? |
| 20 | `admin/strategy/viewer.html` | 23KB | 뷰어 | | |
| 21 | `admin/strategy/kpi-task-manager.test.html` | 12KB | 테스트 파일 | | 삭제 대상? |

---

## 3. CRM 시스템 (admin/crm/) — 4개, ~900KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 22 | `admin/crm/index.html` | 756KB | CRM 메인 | | |
| 23 | `admin/crm/proposal-generator/index.html` | 66KB | 제안서 생성기 | | |
| 24 | `admin/crm/tone-manner/index.html` | 38KB | 톤앤매너 가이드 | | |
| 25 | `admin/crm/tone-manner/inbound-script.html` | 47KB | 인바운드 스크립트 | | |
| 26 | `admin/crm/tone-manner/seller-inbound-script.html` | 39KB | 셀러 인바운드 스크립트 | | |

---

## 4. 공급사 (Supplier) 페이지 — 16개, ~1.2MB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 27 | `supplier/custom-proposal/view.html` | 209KB | 맞춤 제안서 뷰 | | |
| 28 | `supplier/custom-proposal/create.html` | 143KB | 맞춤 제안서 생성 | | |
| 29 | `supplier/custom-proposal/list.html` | 90KB | 맞춤 제안서 목록 | | |
| 30 | `supplier/custom-proposal/index.html` | 69KB | 맞춤 제안서 메인 | | |
| 31 | `supplier/custom-proposal/analytics.html` | 32KB | 제안서 분석 | | |
| 32 | `supplier/proposal-manager.html` | 93KB | 제안서 관리자 | | |
| 33 | `supplier/index.html` | 84KB | 공급사 랜딩 | | |
| 34 | `supplier/onboarding/index.html` | 77KB | 공급사 온보딩 | | |
| 35 | `supplier/category/email-proposal-baby.html` | 76KB | 이메일 제안서 (유아) | | 3개 거의 동일? 통합? |
| 36 | `supplier/category/email-proposal-food.html` | 76KB | 이메일 제안서 (식품) | | |
| 37 | `supplier/category/email-proposal-lifestyle.html` | 76KB | 이메일 제안서 (라이프) | | |
| 38 | `supplier/email-proposal.html` | 50KB | 이메일 제안서 (공통) | | category별과 중복? |
| 39 | `supplier/call-script/template.html` | 35KB | 콜스크립트 템플릿 | | |
| 40 | `supplier/call-script/비비엔다.html` | 21KB | 비비엔다 전용 스크립트 | | 특정 업체용, 삭제? |
| 41 | `supplier/portal.html` | 34KB | 공급사 포탈 | | |
| 42 | `supplier/apply/index.html` | 29KB | 공급사 신청 | | |
| 43 | `supplier/orders.html` | 24KB | 공급사 주문 | | |
| 44 | `supplier/index-simple.html` | 16KB | 공급사 랜딩 (심플) | | index.html과 중복? |
| 45 | `supplier/proposal/index.html` | 8KB | 제안서 | | |

---

## 5. 셀러 (Seller) 페이지 — 12개, ~460KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 46 | `seller/onboarding/index.html` | 112KB | 셀러 온보딩 | | |
| 47 | `seller/index.html` | 71KB | 셀러 랜딩 | | |
| 48 | `seller/proposal-manager.html` | 70KB | 제안서 관리자 | | |
| 49 | `seller/custom-proposal/list.html` | 47KB | 맞춤 제안서 목록 | | |
| 50 | `seller/portal.html` | 40KB | 셀러 포탈 | | |
| 51 | `seller/apply/index.html` | 31KB | 셀러 신청 | | |
| 52 | `seller/call-script/template.html` | 24KB | 콜스크립트 | | |
| 53 | `seller/orders.html` | 20KB | 셀러 주문 | | |
| 54 | `seller/index-simple.html` | 16KB | 셀러 랜딩 (심플) | | index.html과 중복? |
| 55 | `seller/custom-proposal/create.html` | 12KB | 제안서 생성 | | |
| 56 | `seller/custom-proposal/analytics.html` | 10KB | 제안서 분석 | | |
| 57 | `seller/custom-proposal/view.html` | 8KB | 제안서 뷰 | | |

---

## 6. 셀러 가이드 — 3개, ~82KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 58 | `seller-guide/onboarding/index.html` | 44KB | 셀러 가이드 온보딩 | | seller/onboarding과 중복? |
| 59 | `seller-guide/index.html` | 24KB | 셀러 가이드 메인 | | |
| 60 | `seller-guide/yumi.ni89/index.html` | 14KB | 특정 셀러 전용 | | 개별 셀러용, 삭제? |

---

## 7. 파트너 페이지 (moyeoradeal-partner/) — 5개, ~420KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 61 | `moyeoradeal-partner/story.html` | 153KB | 파트너 스토리 | | |
| 62 | `moyeoradeal-partner/supplier.html` | 124KB | 파트너-공급사 | | supplier/index와 중복? |
| 63 | `moyeoradeal-partner/seller.html` | 89KB | 파트너-셀러 | | seller/index와 중복? |
| 64 | `moyeoradeal-partner/index.html` | 28KB | 파트너 메인 | | |
| 65 | `partner/index.html` | 26KB | 파트너 (구버전?) | | moyeoradeal-partner와 중복? |

---

## 8. 소비자 (Consumer) 페이지 — 5개, ~270KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 66 | `consumer/index.html` | 84KB | 소비자 메인 | | |
| 67 | `consumer/product/index.html` | 61KB | 상품 상세 | | |
| 68 | `consumer/secret-seller/index.html` | 49KB | 시크릿 셀러 | | |
| 69 | `consumer/events/index.html` | 40KB | 이벤트 | | |
| 70 | `consumer/my-cashback/index.html` | 33KB | 캐시백 | | |

---

## 9. 쇼핑몰 (Shop) — 7개, ~170KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 71 | `shop/product.html` | 40KB | 상품 상세 | | consumer/product와 중복? |
| 72 | `shop/checkout.html` | 33KB | 결제 | | |
| 73 | `shop/index.html` | 29KB | 쇼핑몰 메인 | | |
| 74 | `shop/cart.html` | 23KB | 장바구니 | | |
| 75 | `shop/mypage/orders.html` | 20KB | 마이페이지 주문 | | |
| 76 | `shop/order-complete.html` | 13KB | 주문 완료 | | |
| 77 | `shop/mypage/index.html` | 12KB | 마이페이지 | | |

---

## 10. 그로스보드 (독립) — 4개, ~530KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 78 | `growthboard/index.html` | 191KB | 그로스보드 메인 | | admin2와 중복? |
| 79 | `growthboard/ssss.html` | 180KB | 테스트/복사본? | | 파일명 불명확, 삭제? |
| 80 | `growthboard/ce.html` | 87KB | CE 보드 | | |
| 81 | `growthboard/songhee/index.html` | 73KB | 송희 개인 보드 | | 개인용, 삭제? |

---

## 11. PPT/프레젠테이션 — 2개, ~86KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 82 | `ppt/supplier/index.html` | 49KB | 공급사 PPT | | |
| 83 | `ppt/intro/index.html` | 37KB | 소개 PPT | | |

---

## 12. 랜딩/홈/로그인 — 5개, ~870KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 84 | `login/index.html` | 368KB | 로그인 | | 368KB이면 과도하게 큰데? |
| 85 | `landing-new.html` | 98KB | 새 랜딩 | | index.html과 중복? |
| 86 | `index.html` | 50KB | 메인 랜딩 | | |
| 87 | `blog-promotion/index.html` | 110KB | 블로그 프로모션 | | |
| 88 | `studio/index.html` | 134KB | 스튜디오 | | |

---

## 13. 기타/단발성 — 10개, ~260KB

| # | 파일 | 크기 | 설명 | 상태 | 비고 |
|---|------|------|------|------|------|
| 89 | `test/index.html` | 1,765KB | 테스트 파일 | | 1.7MB 테스트, 삭제 대상? |
| 90 | `deals/view.html` | 28KB | 공구 상세 뷰 | | |
| 91 | `docs/partnership-contract-proposal.html` | 31KB | 파트너십 계약 제안서 | | |
| 92 | `custom-proposal/custom-proposal.html.html` | 43KB | 커스텀 제안서 | | 파일명 오류 (.html.html) |
| 93 | `proposal/index.html` | 23KB | 제안서 | | |
| 94 | `project-structure-meeting.html` | 42KB | 프로젝트 구조 미팅 | | 일회성 미팅용? 삭제? |
| 95 | `privacy/index.html` | 9KB | 개인정보처리방침 | | 필수 유지 |
| 96 | `terms/index.html` | 8KB | 이용약관 | | 필수 유지 |
| 97 | `404.html` | 0KB | 404 에러 페이지 | | 빈 파일? |
| 98 | `googlee0e151a3c6173998.html` | 0KB | 구글 서치콘솔 인증 | | 필수 유지 |

---

## 즉시 확인이 필요한 의심 항목

### 중복 의심 (같은 기능이 여러 곳)
| 기능 | 후보 파일들 | 판단 필요 |
|------|------------|-----------|
| 공급사 랜딩 | `supplier/index.html` vs `supplier/index-simple.html` vs `moyeoradeal-partner/supplier.html` | 하나로 통합? |
| 셀러 랜딩 | `seller/index.html` vs `seller/index-simple.html` vs `moyeoradeal-partner/seller.html` | 하나로 통합? |
| 파트너 | `partner/index.html` vs `moyeoradeal-partner/index.html` | 구버전 삭제? |
| 메인 랜딩 | `index.html` vs `landing-new.html` | 하나만 유지? |
| 온보딩 | `seller/onboarding/` vs `seller-guide/onboarding/` | 통합? |
| 그로스보드 | `growthboard/index.html` vs `admin2/index.html` 내 growthDashboard | 독립본 필요? |
| 이메일 제안서 | `supplier/email-proposal.html` vs `supplier/category/email-proposal-*.html` (3개) | 4개→1개? |
| 소비자 상품 | `consumer/product/index.html` vs `shop/product.html` | 하나만? |
| 관리 시스템 | `admin/` vs `admin/strategy/` vs `admin2/` | 핵심 결정 |

### 삭제 후보
| 파일 | 이유 |
|------|------|
| `test/index.html` (1,765KB) | 테스트 파일, 프로덕션 불필요 |
| `growthboard/ssss.html` (180KB) | 의미 없는 파일명, 테스트용? |
| `growthboard/songhee/index.html` | 개인 보드, 더 이상 사용? |
| `admin/strategy/kpi-task-manager.test.html` | 테스트 파일 |
| `admin/strategy/ppt-proposal-example.html` | 예시 파일 |
| `admin/strategy/ppt-report-example.html` | 예시 파일 |
| `admin/strategy/growthboard-presentation-demo.html` | 데모 파일 |
| `custom-proposal/custom-proposal.html.html` | 파일명 오류 |
| `supplier/call-script/비비엔다.html` | 특정 업체 전용 |
| `seller-guide/yumi.ni89/index.html` | 특정 셀러 전용 |
| `project-structure-meeting.html` | 일회성 미팅 문서 |

### 비정상 크기
| 파일 | 크기 | 의문점 |
|------|------|--------|
| `login/index.html` | 368KB | 로그인 페이지치고 과도하게 큼 |
| `test/index.html` | 1,765KB | admin급 크기, 무엇의 테스트? |
| `404.html` | 0KB | 빈 파일, 콘텐츠 필요 |

---

## 판단 후 다음 단계

1. **상태 칸 채우기** → 각 파일에 ✅/🔧/❌/🔀/❓ 표시
2. **핵심 결정** → admin vs admin2 vs admin/strategy 중 메인 선택
3. **삭제 실행** → ❌ 표시 파일 제거
4. **통합 계획** → 🔀 표시 파일들의 통합 방향 결정
5. **개선 프롬프트 작성** → 🔧 표시 파일들의 목표 설계 프롬프트 생성
