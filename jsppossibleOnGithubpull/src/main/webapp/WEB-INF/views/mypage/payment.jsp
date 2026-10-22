<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*" %>
<%@ page import="jp.kurologi.model.*" %>
<%@ page import="jp.kurologi.web.Html" %>
<%@ page import="jp.kurologi.web.Session" %>
<%
    String ctx = request.getContextPath();

    request.setAttribute("menu", "mypage");   // layout.jsp 주 메뉴에서 현재 메뉴 표시

    Member member = (Member) request.getAttribute("member");
    String tab = (String) request.getAttribute("tab");                         // pending | history
    List<Charge> charges = (List<Charge>) request.getAttribute("charges");     // 비용결제 탭
    List<Payment> payments = (List<Payment>) request.getAttribute("payments"); // 결제내역 탭
%>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>결제방법 | KURO Logi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Lato:wght@400;600;700&display=swap" rel="stylesheet">
<style>/* ==========================================================================
   KURO Logi — 종합현황 (마이페이지 대시보드)

   바꾸고 싶은 값은 :root 한 곳만 고치면 됩니다.
   순수 CSS · Bootstrap 클래스 없음 · 데스크톱 고정폭
   ========================================================================== */

:root {
  --teal:      #159692;
  --teal-dark: #107a77;
  --blue:      #107abd;
  --purple:    #6f42c1;   /* 나의 정보 머리글 */
  --orange:    #f0801a;   /* 숫자 강조, 액션 버튼 */
  --orange-bg: #fdf3e7;   /* 추가 확인 칸 배경 */
  --green:     #28a745;
  --red:       #dd4b39;

  --ink:       #333333;
  --body:      #555555;
  --muted:     #888888;

  --line:      #e5e5e5;
  --line-soft: #eeeeee;
  --fill:      #f7f7f7;
  --fill-head: #f6f6f6;

  --container: 1360px;
  --gutter:    15px;
  --radius:    4px;
}

/* --------------------------------------------------------------- 리셋 */

*,
*::before,
*::after { box-sizing: border-box; }

html { font-size: 16px; }

body {
  margin: 0;
  font-family: 'Noto Sans KR', serif;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--body);
  background: #fff;
}

h1, h2, h3, h4 { margin: 0; color: #444; font-weight: 400; line-height: 1.5; }

img { max-width: 100%; height: auto; border: 0; }

a { color: var(--blue); text-decoration: none; }
a:hover { color: var(--teal); }

/* ------------------------------------------------------------- 레이아웃 */

.container {
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 10px;
}

.row { display: flex; flex-wrap: wrap; margin: 0 calc(var(--gutter) * -1); }
.col { padding: 0 var(--gutter); }
.col--footer-logo { width: 16.6667%; }
.col--footer-info { width: 83.3333%; }

/* ------------------------------------------------------------- 상단 바 */

.topbar {
  border-bottom: 1px solid #c1c1c1;
  font-size: 13px;
  line-height: 44px;
}

.topbar__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  min-height: 45px;
}

.topbar__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.topbar__links a {
  display: block;
  padding: 0 12px;
  height: 44px;
  line-height: 44px;
  font-size: 13px;
  color: #666;
}

.topbar__links a.kakao-btn { height: 44px; line-height: 44px; padding: 0 6px; }
.kakao-btn img { height: 35px; width: auto; padding-top: 5px; vertical-align: middle; }

/* -------------------------------------------------- 헤더 + 주 메뉴 */

.site-header {
  background: var(--teal);
  color: #eee;
  border-bottom: 1px solid rgba(255, 255, 255, .05);
}

.site-header__inner {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

.site-header__logo { display: block; padding: 4px 0; }
.site-header__logo img { display: block; width: 250px; }

.main-nav { display: flex; align-items: stretch; }

.main-nav__list {
  display: flex;
  align-items: stretch;
  margin: 0;
  padding: 0;
  list-style: none;
}

.main-nav__item { position: relative; }

.main-nav__item > a {
  display: block;
  padding: 39px 10px;
  font-size: 16px;
  letter-spacing: -1px;
  color: #fff;
  white-space: nowrap;
}

.main-nav__item:hover { background: var(--teal-dark); }

.main-nav__submenu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  width: 220px;
  margin: 0;
  padding: 10px;
  list-style: none;
  background: #fff;
  border: 1px solid var(--line-soft);
  border-top: 2px solid var(--blue);
  box-shadow: 0 13px 42px 11px rgba(0, 0, 0, .05);
}

.main-nav__item:hover .main-nav__submenu { display: block; }

.main-nav__submenu a {
  display: block;
  padding: 10px;
  font-size: 14px;
  font-family: 'Lato', sans-serif;
  color: #666;
  white-space: normal;
}

.main-nav__submenu a:hover { padding-left: 18px; color: var(--teal); }

/* ------------------------------------------------------- 페이지 제목 띠 */

.page-head {
  padding: 15px 0 13px;
  background: var(--fill-head);
  border-bottom: 1px solid var(--line-soft);
}

.page-head__inner { position: relative; min-height: 33px; }

.page-head__title {
  margin: 0;
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -2px;
  color: var(--ink);
}

.breadcrumb {
  position: absolute;
  top: 50%;
  right: 10px;
  margin: -10px 0 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: var(--muted);
}

.breadcrumb__item { display: inline-block; }
.breadcrumb__item + .breadcrumb__item::before { content: '/'; margin: 0 6px; color: #bbb; }
.breadcrumb__item a { color: #555; }
.breadcrumb__item.is-current { color: var(--muted); }

.page-body { padding: 24px 0 40px; }

:root {
  --orange: #ff7000;
  --navy:   #1e3354;
}

/* ============================================================
   결제방법 — 결제 관리
   ============================================================ */

.quick-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.quick-links a {
  display: block;
  padding: 14px 10px;
  font-size: 15px;
  text-align: center;
  color: var(--ink);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.quick-links a:hover { border-color: var(--teal); color: var(--teal); }

.summary-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: 26px;
  background: #464b5c;
  border-radius: var(--radius);
  overflow: hidden;
}

.summary-strip__cell {
  padding: 16px 10px;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, .12);
}

.summary-strip__cell:last-child { border-right: 0; }
.summary-strip__label { display: block; font-size: 14px; color: #fff; }
.summary-strip__value {
  display: block;
  margin-top: 6px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
.summary-strip__value--gold { color: #e8c341; }

.sub-title {
  margin: 0 0 26px;
  font-size: 30px;
  font-weight: 700;
  color: var(--ink);
  text-align: center;
}

.sub-title__dash {
  display: block;
  width: 40px;
  height: 3px;
  margin: 0 auto 10px;
  background: var(--ink);
}

/* 비용결제 / 결제내역 탭 */
.pay-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--line);
}

.pay-tabs__item {
  padding: 14px 10px;
  font-size: 15px;
  text-align: center;
  color: var(--ink);
  background: #fff;
}

.pay-tabs__item.is-active { color: #fff; background: #6f6f6f; }

.pay-total {
  margin: 16px 0 8px;
  font-size: 14px;
  color: var(--ink);
}

/* 결제 목록 표 */
.pay-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 2px solid var(--ink);
  margin-bottom: 20px;
}

.pay-table th,
.pay-table td {
  padding: 14px 10px;
  font-size: 14px;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
}

.pay-table thead th {
  font-weight: 700;
  text-align: center;
  border-bottom: 1px solid var(--line);
}

.pay-table__check { width: 60px; }
.pay-table__empty { padding: 30px 10px; text-align: center; color: var(--muted); }

/* 안내 문구 */
.pay-notes {
  margin: 0 0 24px;
  padding: 0;
  list-style: none;
}

.pay-notes li {
  padding: 3px 0 3px 12px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--body);
  text-indent: -12px;
}

.pay-notes li::before { content: '* '; color: var(--red); }

/* 하단 결제 영역 */
.pay-bottom {
  display: grid;
  grid-template-columns: 1fr 340px;
  margin-bottom: 26px;
  border: 1px solid var(--line);
}

.pay-bottom__left { padding: 20px; }
.pay-bottom__hint { margin: 10px 0 14px; font-size: 13px; color: var(--red); }

.pay-bottom__fields {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  gap: 6px;
  align-items: center;
}

.pay-bottom__right {
  padding: 20px;
  background: var(--fill);
}

.pay-bottom__right p {
  display: flex;
  justify-content: space-between;
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--ink);
}

.pay-bottom__right p:last-child { margin-bottom: 0; }
.pay-bottom__right strong { font-weight: 700; }
.pay-bottom__right .is-red { font-size: 18px; color: var(--red); }

/* 공통 입력 / 버튼 / 라디오 */
.input {
  width: 100%;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 13px;
  color: #495057;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.input:focus { outline: none; border-color: var(--teal); }

.radio-row { display: flex; gap: 24px; font-size: 14px; color: var(--ink); }
.radio-row label { display: flex; align-items: center; gap: 5px; cursor: pointer; }

.btn {
  display: inline-block;
  padding: 12px 34px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: #6f6f6f;
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}

.btn:hover { background: #5c5c5c; }
.btn--navy { background: var(--navy); }
.btn--navy:hover { background: #16263f; }
.btn--sm { padding: 10px 14px; font-size: 13px; }

.btn-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
}

/* --------------------------------------------------------------- 푸터 */

.site-footer { margin-top: 10px; background: #333; color: #ccc; }
.site-footer__inner { padding-top: 50px; padding-bottom: 50px; }
.site-footer__logo { width: 120px; }

.footer-links { padding-top: 20px; margin-bottom: 20px; }

.footer-links a {
  display: inline-block;
  margin: 0 20px 0 0;
  font-size: 14px;
  color: #fff;
  border-bottom: 1px dotted rgba(255, 255, 255, .25);
}
.footer-links a:hover { color: #fff; border-bottom-style: solid; }

.site-footer__text {
  margin: 0;
  font-size: 13px;
  font-weight: 300;
  line-height: 28px;
  color: #ccc;
}

.copyright {
  margin: 0;
  padding: 20px 0;
  font-size: 13px;
  text-align: center;
  color: rgba(255, 255, 255, .5);
  background: rgba(0, 0, 0, .2);
}

/* ==================== JSP 에서 추가한 스타일 ==================== */

/* ------------------------------------------------- 서버 알림 · 입력 오류 */

.flash {
  margin: 16px 0 0;
  padding: 12px 16px;
  font-size: 14px;
  color: #155724;
  background: #e8f5ec;
  border: 1px solid #c3e6cb;
  border-radius: var(--radius);
}

.flash--error { color: #8a1f11; background: #fdecea; border-color: #f5c6cb; }

.field-error { margin: 6px 0 0; font-size: 12px; color: var(--red); }

/* 복사 완료 알림 (common.js) */
.toast {
  position: fixed;
  left: 50%;
  bottom: 40px;
  z-index: 1000;
  padding: 10px 20px;
  font-size: 14px;
  color: #fff;
  background: rgba(0, 0, 0, .8);
  border-radius: var(--radius);
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity .2s;
  pointer-events: none;
}

.toast.is-shown { opacity: 1; }

/* JSP — 탭 링크 · 표 정렬 · 결제 상태 */
a.pay-tabs__item { display: block; }
a.pay-tabs__item:hover { color: var(--teal); }
a.pay-tabs__item.is-active:hover { color: #fff; }

.pay-table td.is-center { text-align: center; }
.pay-table td.is-right { text-align: right; }

.pay-status { display: inline-block; padding: 2px 10px; font-size: 12px; border-radius: 999px; background: var(--fill); }
.pay-status--paid { color: #fff; background: var(--green); }
.pay-status--awaiting_deposit,
.pay-status--awaiting_card { color: #fff; background: var(--orange); }
.pay-status--canceled { color: var(--muted); }

.btn:disabled { opacity: .5; cursor: not-allowed; }
</style>
</head>
<body>
<jsp:include page="../common/layout.jsp"><jsp:param name="part" value="top" /></jsp:include>

<section class="page-head">
  <div class="container page-head__inner">
    <h1 class="page-head__title">결제방법</h1>
    <ol class="breadcrumb">
      <li class="breadcrumb__item"><a href="<%= ctx %>/">홈</a></li>
      <li class="breadcrumb__item"><a href="<%= ctx %>/mypage">마이페이지</a></li>
      <li class="breadcrumb__item is-current">결제방법</li>
    </ol>
  </div>
</section>

<jsp:include page="../common/layout.jsp"><jsp:param name="part" value="flash" /></jsp:include>

<main class="page-body">
  <div class="container">

    <jsp:include page="../common/layout.jsp"><jsp:param name="part" value="summary" /></jsp:include>

    <h1 class="sub-title"><span class="sub-title__dash"></span>결제 관리</h1>

    <div class="pay-tabs">
      <a class="pay-tabs__item<%= Html.cls("pending".equals(tab), "is-active") %>" href="<%= ctx %>/mypage/payment">비용결제</a>
      <a class="pay-tabs__item<%= Html.cls("history".equals(tab), "is-active") %>" href="<%= ctx %>/mypage/payment?tab=history">결제내역</a>
    </div>

<%  if ("history".equals(tab)) { %>
    <%-- ============ 결제내역 ============ --%>
    <p class="pay-total">Total : <%= payments.size() %>건</p>
    <table class="pay-table">
      <thead>
        <tr>
          <th>결제일</th>
          <th>내용</th>
          <th>결제수단</th>
          <th>결제금액</th>
          <th>예치금 사용</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
<%      for (Payment p : payments) { %>
        <tr>
          <td class="is-center"><%= p.getCreatedAtText() %></td>
          <td><%= Html.esc(p.getSummary()) %></td>
          <td class="is-center"><%= p.getMethod().getLabel() %><% if (p.getDepositorName() != null) { %> (<%= Html.esc(p.getDepositorName()) %>)<% } %></td>
          <td class="is-right">₩<%= Html.num(p.getPayAmount()) %></td>
          <td class="is-right">₩<%= Html.num(p.getDepositUsed()) %></td>
          <td class="is-center"><span class="pay-status pay-status--<%= p.getStatus().name().toLowerCase() %>"><%= p.getStatus().getLabel() %></span></td>
        </tr>
<%      } %>
<%      if (payments.isEmpty()) { %>
        <tr><td class="pay-table__empty" colspan="6">결제 내역이 존재하지 않습니다.</td></tr>
<%      } %>
      </tbody>
    </table>

<%  } else { %>
    <%-- ============ 비용결제 ============ --%>
    <form id="payForm" method="post" action="<%= ctx %>/mypage/payment" data-deposit="<%= member.getDeposit() %>">
      <input type="hidden" name="_csrf" value="<%= Html.esc(session.getAttribute(Session.CSRF)) %>">

      <p class="pay-total">Total : <%= charges.size() %>건</p>

      <table class="pay-table">
        <thead>
          <tr>
            <th class="pay-table__check"><input type="checkbox" data-check-all aria-label="전체 선택"></th>
            <th>비용결제</th>
            <th>등록일</th>
            <th>결제금액</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
<%      for (Charge ch : charges) { %>
          <tr>
            <td class="is-center"><input type="checkbox" name="chargeId" value="<%= ch.getId() %>" data-amount="<%= ch.getAmount() %>" aria-label="선택"></td>
            <td><%= Html.esc(ch.getTitle()) %></td>
            <td class="is-center"><%= ch.getCreatedAtText() %></td>
            <td class="is-right">₩<%= Html.num(ch.getAmount()) %></td>
            <td class="is-center"><a href="#" title="주문 상세 화면 연결 예정"><%= Html.esc(ch.getOrderNo()) %></a></td>
          </tr>
<%      } %>
<%      if (charges.isEmpty()) { %>
          <tr><td class="pay-table__empty" colspan="5">결제 대기건이 존재하지 않습니다.</td></tr>
<%      } %>
        </tbody>
      </table>

      <ul class="pay-notes">
        <li>여러 건을 한꺼번에 결제하실 경우에는 해당 건을 모두 클릭해주시면 됩니다.</li>
        <li>결제대기건의 경우 모두 포장, 배송비 계측이 마무리 된 것임으로 재포장이나 합배송/묶음배송이 불가능합니다. 계좌로 입금된 시간=결제관리에서 결제신청일, 입금자명, 입금된 금액이 다를경우 빠른처리를 위해서 반드시 1:1 고객센터에 문의부탁드립니다.</li>
      </ul>

      <div class="pay-bottom">
        <div class="pay-bottom__left">
          <span class="radio-row">
            <label><input type="radio" name="method" value="BANK" checked> 무통장입금</label>
            <label><input type="radio" name="method" value="CARD"> 신용카드(토스)</label>
          </span>
          <p class="pay-bottom__hint">결제 신청 후 확인이 가능합니다. (보유 예치금 ₩<%= Html.num(member.getDeposit()) %>)</p>
          <div class="pay-bottom__fields">
            <input class="input" type="number" name="depositToUse" value="0" min="0" max="<%= member.getDeposit() %>" data-deposit-input aria-label="사용할 예치금">
            <button class="btn btn--sm" type="button" data-use-all-deposit>예치금 전액사용</button>
            <input class="input" type="text" name="depositorName" placeholder="입금자명" maxlength="30" data-depositor aria-label="입금자명">
            <button class="btn btn--sm" type="button" data-use-member-name="<%= Html.esc(member.getName()) %>">회원명으로 사용</button>
          </div>
        </div>
        <div class="pay-bottom__right">
          <p><span>결제금액</span><strong data-sum-total>₩0</strong></p>
          <p><span>쿠폰할인</span><strong>₩0</strong></p>
          <p><span>예치금 사용</span><strong data-sum-deposit>₩0</strong></p>
          <p><span>Total</span><strong class="is-red" data-sum-pay>₩0</strong></p>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn--navy" type="submit"<%= charges.isEmpty() ? " disabled" : "" %>>결제하기</button>
      </div>
    </form>
<%  } %>

  </div>
</main>

<script>
/* 결제 관리 — 선택한 대기건 합계 · 예치금 사용 · 입금자명.
   화면 계산은 안내용일 뿐, 실제 금액은 서버(PaymentService)에서 다시 계산합니다. */
(function () {
  'use strict';

  var form = document.getElementById('payForm');
  if (!form) return;

  var deposit = Number(form.getAttribute('data-deposit')) || 0;
  var depositInput = form.querySelector('[data-deposit-input]');
  var checks = form.querySelectorAll('input[name="chargeId"]');
  var checkAll = form.querySelector('[data-check-all]');
  var won = function (n) { return '₩' + n.toLocaleString('ko-KR'); };

  function selectedTotal() {
    var sum = 0;
    checks.forEach(function (c) { if (c.checked) sum += Number(c.getAttribute('data-amount')); });
    return sum;
  }

  function refresh() {
    var total = selectedTotal();
    var use = Math.max(0, Math.min(Number(depositInput.value) || 0, deposit, total));
    if (String(use) !== depositInput.value) depositInput.value = use;
    form.querySelector('[data-sum-total]').textContent = won(total);
    form.querySelector('[data-sum-deposit]').textContent = '-' + won(use);
    form.querySelector('[data-sum-pay]').textContent = won(total - use);
    if (checkAll) checkAll.checked = checks.length > 0 && Array.prototype.every.call(checks, function (c) { return c.checked; });
  }

  if (checkAll) {
    checkAll.addEventListener('change', function () {
      checks.forEach(function (c) { c.checked = checkAll.checked; });
      refresh();
    });
  }
  checks.forEach(function (c) { c.addEventListener('change', refresh); });
  depositInput.addEventListener('input', refresh);

  form.querySelector('[data-use-all-deposit]').addEventListener('click', function () {
    depositInput.value = deposit;
    refresh();
  });

  form.querySelector('[data-use-member-name]').addEventListener('click', function (e) {
    form.querySelector('[data-depositor]').value = e.currentTarget.getAttribute('data-use-member-name');
  });

  form.addEventListener('submit', function (e) {
    var total = selectedTotal();
    if (total === 0) {
      e.preventDefault();
      alert('결제할 항목을 선택해 주세요.');
      return;
    }
    var remaining = total - (Number(depositInput.value) || 0);
    var method = form.querySelector('input[name="method"]:checked').value;
    if (remaining > 0 && method === 'BANK' && !form.querySelector('[data-depositor]').value.trim()) {
      e.preventDefault();
      alert('입금자명을 입력해 주세요.');
      return;
    }
    if (!confirm(won(remaining) + ' 결제를 진행하시겠습니까?')) e.preventDefault();
  });

  refresh();
})();
</script>
<jsp:include page="../common/layout.jsp"><jsp:param name="part" value="bottom" /></jsp:include>
