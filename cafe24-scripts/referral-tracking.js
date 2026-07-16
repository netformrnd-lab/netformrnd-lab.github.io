/**
 * 모여라딜 × 카페24 레퍼럴 추적 스크립트
 * ─────────────────────────────────────
 * 이 스크립트를 카페24 관리자 → 디자인 설정 → 스킨 편집에서
 * layout/basic.html 또는 product/detail.html 하단에 삽입하세요.
 *
 * 기능:
 * 1) URL ?ref= 파라미터에서 레퍼럴 코드 감지 → 쿠키 저장 (7일)
 * 2) 주문서 페이지에서 주문 메모 필드에 [REF:코드] 자동 입력
 * 3) 레퍼럴 배너 표시 (친구 초대 혜택 안내)
 *
 * 버전: 1.0
 * 최종 수정: 2026-02-24
 */
(function() {
  'use strict';

  var COOKIE_NAME = 'moyeora_ref';
  var COOKIE_DAYS = 7;
  var REF_PREFIX = '[REF:';
  var REF_SUFFIX = ']';

  // ── 유틸리티 ──
  function getUrlParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() +
      ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  // ── 1. 레퍼럴 코드 감지 및 쿠키 저장 ──
  var refCode = getUrlParam('ref');
  if (refCode && /^[A-Z0-9]{6,12}$/i.test(refCode)) {
    setCookie(COOKIE_NAME, refCode.toUpperCase(), COOKIE_DAYS);
    console.log('[모여라딜] 레퍼럴 코드 저장:', refCode.toUpperCase());
    showReferralBanner();
  }

  // ── 2. 레퍼럴 배너 표시 ──
  function showReferralBanner() {
    var existingBanner = document.getElementById('moyeora-ref-banner');
    if (existingBanner) return;

    var banner = document.createElement('div');
    banner.id = 'moyeora-ref-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;' +
      'background:linear-gradient(135deg,#3182F6,#1B64DA);color:#fff;' +
      'padding:12px 20px;text-align:center;font-size:14px;font-weight:600;' +
      'font-family:-apple-system,sans-serif;box-shadow:0 2px 12px rgba(49,130,246,0.3);' +
      'display:flex;align-items:center;justify-content:center;gap:8px;';
    banner.innerHTML = '<span style="font-size:18px;">🎁</span>' +
      '<span>친구 초대 혜택이 적용되었어요! 구매 시 포인트가 적립됩니다.</span>' +
      '<button onclick="this.parentElement.remove()" style="background:rgba(255,255,255,0.2);' +
      'border:none;color:#fff;padding:4px 12px;border-radius:12px;cursor:pointer;' +
      'font-size:12px;font-weight:600;margin-left:8px;">확인</button>';

    document.body.insertBefore(banner, document.body.firstChild);

    // 3초 후 자동 닫기
    setTimeout(function() {
      if (banner.parentElement) {
        banner.style.transition = 'opacity 0.5s, transform 0.5s';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-100%)';
        setTimeout(function() { banner.remove(); }, 500);
      }
    }, 5000);
  }

  // ── 3. 주문서 페이지에서 레퍼럴 코드 자동 입력 ──
  function injectReferralToOrderMemo() {
    var savedRef = getCookie(COOKIE_NAME);
    if (!savedRef) return;

    // 카페24 주문서 페이지 감지
    var isOrderPage = window.location.pathname.indexOf('/order/') !== -1 ||
                      window.location.pathname.indexOf('/order.html') !== -1 ||
                      document.querySelector('form[name="frm_order"]');

    if (!isOrderPage) return;

    // 주문 메모 필드 찾기 (카페24 스킨별 다양한 필드명 대응)
    var memoSelectors = [
      'textarea[name="order_memo"]',
      'textarea[name="memo"]',
      'textarea[name="buyer_memo"]',
      'textarea#order_memo',
      'textarea#buyer_memo',
      'textarea[id*="memo"]',
      'textarea[name*="memo"]'
    ];

    var memoField = null;
    for (var i = 0; i < memoSelectors.length; i++) {
      memoField = document.querySelector(memoSelectors[i]);
      if (memoField) break;
    }

    if (memoField) {
      var refTag = REF_PREFIX + savedRef + REF_SUFFIX;

      // 이미 입력되어 있는지 확인
      if (memoField.value.indexOf(REF_PREFIX) !== -1) {
        console.log('[모여라딜] 레퍼럴 코드 이미 입력됨');
        return;
      }

      // 기존 메모가 있으면 줄바꿈 후 추가
      var existing = memoField.value.trim();
      if (existing) {
        memoField.value = existing + '\n' + refTag;
      } else {
        memoField.value = refTag;
      }

      console.log('[모여라딜] 주문 메모에 레퍼럴 코드 입력 완료:', refTag);
    } else {
      console.warn('[모여라딜] 주문 메모 필드를 찾을 수 없습니다.');
    }
  }

  // ── 4. 사용자 정의 필드 자동 입력 (있는 경우) ──
  function injectReferralToCustomField() {
    var savedRef = getCookie(COOKIE_NAME);
    if (!savedRef) return;

    var customField = document.querySelector('input[name="referral_code"]') ||
                      document.querySelector('input[id="referral_code"]');

    if (customField) {
      customField.value = savedRef;
      console.log('[모여라딜] 사용자 정의 필드에 레퍼럴 코드 입력:', savedRef);
    }
  }

  // ── 5. 실행 ──
  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectReferralToOrderMemo();
      injectReferralToCustomField();
    });
  } else {
    injectReferralToOrderMemo();
    injectReferralToCustomField();
  }

  // SPA 대응: 페이지 변경 감지
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function() {
      injectReferralToOrderMemo();
      injectReferralToCustomField();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 과도한 실행 방지 (5초 후 감시 중단)
    setTimeout(function() { observer.disconnect(); }, 5000);
  }
})();
