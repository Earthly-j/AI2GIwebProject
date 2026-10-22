<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String ctx = request.getContextPath();
    request.setAttribute("menu", "status");   // layout.jsp 주 메뉴에서 현재 메뉴 표시
%>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>노데이터 확인 | KURO Logi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Lato:wght@400;600;700&display=swap" rel="stylesheet">
<style>
/* inlined from nodata.css */
/* ==========================================================================
   KURO Logi — 노데이터 확인 (배송대행신청 미작성 입고)

   바꾸고 싶은 값은 :root 한 곳만 고치면 됩니다.
   순수 CSS · Bootstrap 클래스 없음 · 데스크톱 고정폭
   ========================================================================== */

:root {
  --teal:        #159692;
  --teal-dark:   #107a77;
  --blue:        #107abd;
  --purple:      #6441be;   /* 구매대행 조회 탭 */
  --orange:      #ff7000;   /* 강조색 (탭·버튼·숫자) */
  --orange-soft: #f8a86c;   /* 추가 확인 열 머리글 */
  --orange-bg:   #fdf3e7;
  --green:       #37b149;   /* AI 신청서 탭 */
  --blue-tab:    #2e6fe5;   /* 입고내역조회 탭 */
  --pink:        #d9155c;   /* 요청하기 버튼 */
  --magenta:     #b5329e;   /* 안내 문구 강조 */
  --red:         #dd4b39;

  --ink:       #333333;
  --body:      #555555;
  --muted:     #888888;

  --line:      #e5e5e5;
  --line-soft: #eeeeee;
  --fill:      #f7f7f7;
  --fill-box:  #f3f3f3;   /* 안내 박스 · 표 머리글 */
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

/* ------------------------------------------------------------------ 본문 */

.page-body { padding: 24px 0 40px; }

/* ============================================================
   1. 요약 탭 (종합현황과 동일)
   ============================================================ */

.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.summary-tabs { display: flex; }

.summary-tabs a {
  display: block;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: #999;
}

.summary-tabs a:first-child { border-radius: var(--radius) 0 0 var(--radius); }
.summary-tabs a:last-child  { border-radius: 0 var(--radius) var(--radius) 0; }

.summary-tabs a.tab--orange { background: var(--orange); }
.summary-tabs a.tab--purple { background: var(--purple); }
.summary-tabs a.tab--green  { background: var(--green); }
.summary-tabs a.tab--blue   { background: var(--blue-tab); }

.summary-links {
  display: flex;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  font-weight: 700;
}

.summary-links a { color: var(--ink); }
.summary-links a::before { content: '✓ '; font-weight: 400; }

/* ============================================================
   2. 섹션 제목 (왼쪽 주황 막대)
   ============================================================ */

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding-left: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  border-left: 4px solid var(--orange);
}

/* ============================================================
   3. 안내 박스
   ============================================================ */

.guide-box {
  margin-bottom: 20px;
  padding: 24px 28px;
  font-size: 13px;
  line-height: 1.9;
  background: var(--fill-box);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.guide-box p { margin: 14px 0; }
.guide-box p:first-child { margin-top: 0; }
.guide-box p:last-child { margin-bottom: 0; }

.guide-box__sub {
  font-weight: 700;
  color: var(--ink);
}

.guide-box__line {
  margin: 4px 0 4px 2px;
  color: var(--body);
}

.guide-box__note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 18px;
  font-weight: 700;
  color: var(--magenta);
}

.guide-box__note-icon {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  font-style: normal;
  color: #fff;
  background: var(--magenta);
  border-radius: 50%;
}

/* ============================================================
   4. 신청서 목록 표
   ============================================================ */

.data-table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
  border: 1px solid var(--line);
}

.data-table th {
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  text-align: center;
  vertical-align: middle;
  background: var(--fill-box);
  border: 1px solid var(--line);
  border-bottom: 1px solid #ddd;
}

.data-table td {
  padding: 14px 8px;
  font-size: 13px;
  color: var(--body);
  text-align: center;
  vertical-align: middle;
  border: 1px solid var(--line);
}

/* 조회 결과 없음 */
.data-table .is-empty {
  padding: 22px 8px;
  color: var(--muted);
}

/* 표 머리글 두 줄 처리용 */
.data-table th .th-sub { display: block; font-weight: 400; font-size: 12px; }

/* ============================================================
   5. 체크 항목 요청
   ============================================================ */

.check-request {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.check-request__label {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.check-request__stat {
  font-size: 16px;
  color: var(--ink);
}

.check-request__num {
  font-size: 18px;
  font-weight: 700;
  color: var(--orange);
}

.check-request__btn {
  margin-left: auto;
  padding: 14px 44px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: var(--pink);
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}
.check-request__btn:hover { background: #c11250; }

.check-request__hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--muted);
}

/* --------------------------------------------------------------- 푸터 */

.site-footer { margin-top: 30px; background: #333; color: #ccc; }
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
</style>
</head>
<body>

<jsp:include page="../common/layout.jsp"><jsp:param name="part" value="top" /></jsp:include>
<!-- ===================== 페이지 제목 ===================== -->
<section class="page-head">
  <div class="container page-head__inner">
    <h1 class="page-head__title">노데이터 확인</h1>
    <ol class="breadcrumb">
      <li class="breadcrumb__item"><a href="<%= ctx %>/">홈</a></li>
      <li class="breadcrumb__item"><a href="<%= ctx %>/status/dashboard">종합현황</a></li>
      <li class="breadcrumb__item is-current">노데이터 확인</li>
    </ol>
  </div>
</section>

<main class="page-body">
  <div class="container">

    <!-- ============ 1. 요약 탭 ============ -->
    <div class="summary-bar">
      <div class="summary-tabs">
        <a class="tab--orange" href="<%= ctx %>/status/dashboard">배송대행 조회</a>
        <a class="tab--purple" href="#">구매대행 조회</a>
        <a class="tab--green" href="#">AI 신청서 자동생성</a>
        <a class="tab--blue" href="#">입고내역조회</a>
      </div>
      <ul class="summary-links">
        <li><a href="#">배송요금표 보기</a></li>
        <li><a href="#">나의 송장주기</a></li>
        <li><a href="#">나의 주소록</a></li>
        <li><a href="#">나의 정보</a></li>
      </ul>
    </div>

    <!-- ============ 2. 배송대행신청 미작성 입고 ============ -->
    <h2 class="section-title">배송대행신청 미작성 입고</h2>

    <div class="guide-box">
      <p>* 물류센터로 상품이 도착하였으나, 배송신청서 미작성 입고로 분류된 상품입니다.</p>

      <p class="guide-box__sub">* 배송신청서 미작성 입고가 발생하는 경우</p>
      <p class="guide-box__line">- 주문한 상품이 물류센터에 도착한 시점까지 배송대행 신청서를 작성하지 않은 경우</p>
      <p class="guide-box__line">- 주문한 상품이 물류센터에 도착한 시점까지 배송대행 신청서는 작성하였지만, 트래킹 번호를 기재하지 않은 경우</p>
      <p class="guide-box__line">- 실제 트래킹 번호와 배송대행 신청서에 작성한 트래킹 번호가 상이한 경우</p>

      <p class="guide-box__sub">* 배송대행신청 미작성 입고 처리방법</p>
      <p class="guide-box__line"><strong>- 처리방법 1 :</strong> "배송신청서 작성하기" 버튼을 클릭하셔서 배송신청서를 작성해 주세요.</p>
      <p class="guide-box__line"><strong>- 처리방법 2 :</strong> 아래 "배송대행신청 완료" 리스트에서 미리 작성해 놓은 배송신청번호를 클릭하고 트래킹 번호를 입력해 주세요.</p>
      <p class="guide-box__line"><strong>- 처리방법 3 :</strong> 고객님께서 주문한 상품이 아닐 경우 "내 주문건이 아님" 체크박스를 선택한 후 저장버튼을 클릭해 주세요.</p>

      <p class="guide-box__note">
        <i class="guide-box__note-icon">i</i>
        <span>배송 신청서 작성 전에 상품이 먼저 도착한 경우, 입고 및 출고 처리까지 최소 7일 이상 소요될 수도 있습니다.</span>
      </p>
    </div>

    <!-- ============ 3. 신청서 목록 ============ -->
    <table class="data-table">
      <thead>
        <tr>
          <th>창고위치</th>
          <th>주문사이트<br>보내는 사람</th>
          <th>트래킹 번호</th>
          <th>무게 정보</th>
          <th>사진 요청</th>
          <th>상품 도착일</th>
          <th>내 주문건이<br>아님</th>
          <th>신청번호</th>
          <th>선택</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="is-empty" colspan="9">조회된 신청서가 없습니다.</td>
        </tr>
      </tbody>
    </table>

    <!-- ============ 4. 체크 항목 요청 ============ -->
    <div class="check-request">
      <span class="check-request__label">체크 항목 요청</span>
      <span class="check-request__stat">총 <span class="check-request__num">0</span> 개</span>
      <span class="check-request__stat">총 <span class="check-request__num">0</span> 룰, <span class="check-request__num">0</span> 위안 요청</span>
      <button class="check-request__btn" type="button">요청하기</button>
    </div>
    <p class="check-request__hint">* 요청된 체크 항목은 신청서 작성 시 함께 처리됩니다.</p>

  </div>
</main>

<!-- ===================== 푸터 ===================== -->

<jsp:include page="../common/layout.jsp"><jsp:param name="part" value="bottom" /></jsp:include>
