// Build the three 마이페이지 sub-pages.
//
//   node tools/build-mypage-sub.mjs
//
// Writes:
//   마이페이지/account.html   + account.css    (계정관리 / 회원정보 수정)
//   마이페이지/payment.html   + payment.css    (결제방법 / 결제 관리)
//   마이페이지/address.html   + address.css    (주소관리 / 나의 주소록)
//
// The three screenshots these follow are from another company (tabae), so the
// layout is reproduced but the values are placeholders — no real customer data.
// The shared chrome is copied out of dashboard.css so all pages stay in step.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DASH_CSS = readFileSync('종합현황/dashboard.css', 'utf8');

/* ------------------------------------------------------- shared CSS parts */

const chromeEnd = DASH_CSS.indexOf('/* ------------------------------------------------------------------ 본문 */');
if (chromeEnd === -1) throw new Error('본문 marker not found');
const CHROME = DASH_CSS.slice(0, chromeEnd);

const footStart = DASH_CSS.indexOf('/* --------------------------------------------------------------- 푸터 */');
if (footStart === -1) throw new Error('푸터 marker not found');
const FOOTER_CSS = DASH_CSS.slice(footStart);

// The sub-page CSS uses --navy for the primary button; dashboard.css does not
// define it, so add it here rather than relying on an undefined variable.
const PAGE_BODY = `.page-body { padding: 24px 0 40px; }

:root {
  --orange: #ff7000;
  --navy:   #1e3354;
}
`;

/* ------------------------------------------------------------- shared HTML */

const head = (title, css) => `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | KURO Logi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Lato:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${css}">
</head>
<body>

<div class="topbar">
  <div class="container topbar__inner">
    <ul class="topbar__links topbar__links--left">
      <li><a href="../index.html">홈</a></li>
      <li><a href="#">즐겨찾기추가</a></li>
      <li><a href="#">1:1게시판</a></li>
    </ul>
    <ul class="topbar__links topbar__links--right">
      <li><a href="#">언어 선택 <i>▾</i></a></li>
      <li><a class="kakao-btn" href="#"><img src="../images/air_kakao.png" alt="카톡상담"></a></li>
      <li><a class="kakao-btn" href="#"><img src="../images/kakao_sea1.png" alt="카톡상담"></a></li>
      <li><a class="kakao-btn" href="#"><img src="../images/kakao_sea2.png" alt="카톡상담"></a></li>
      <li><a href="#">로그아웃</a></li>
    </ul>
  </div>
</div>

<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__logo" href="../index.html">
      <img src="../images/logo.png" alt="Kuro Logi 물류시스템">
    </a>
    <!-- NAV_PLACEHOLDER -->
  </div>
</header>

<section class="page-head">
  <div class="container page-head__inner">
    <h1 class="page-head__title">${title}</h1>
    <ol class="breadcrumb">
      <li class="breadcrumb__item"><a href="../index.html">홈</a></li>
      <li class="breadcrumb__item"><a href="mypage.html">마이페이지</a></li>
      <li class="breadcrumb__item is-current">${title}</li>
    </ol>
  </div>
</section>
`;

const foot = `<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="row">
      <div class="col col--footer-logo">
        <img class="site-footer__logo" src="../images/logo.png" alt="Kuro Logi 물류시스템">
      </div>
      <div class="col col--footer-info">
        <div class="footer-links">
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">이메일무단수집거부</a>
          <a href="#">特定商取引法に基づく表示</a>
          <a href="#">個人情報保護方針</a>
        </div>
        <p class="site-footer__text">
          KURO Logi ( USPbrain Co., Ltd ) / WTKOREA <br>
          3F, 1-466-19,  Suzukicho, Kodaira Shi, Tokyo To, 187-0011, Japan<br>
          Tel(일본) : (+81) 042-401-0754
        </p>
      </div>
    </div>
  </div>
  <p class="copyright">© 2023 All Rights Reserved by KUROLogi.</p>
</footer>

</body>
</html>
`;

/* Four quick-link buttons that appear above the summary bar on all three. */
const QUICK_LINKS = `<div class="quick-links">
      <a href="#">나의 배송대행지</a>
      <a href="#">나의 배송요율표</a>
      <a href="address.html">나의 주소록</a>
      <a href="#">운송장 발송정보</a>
    </div>`;

/* Dark summary bar: name / mailbox / deposit / coupon / unpaid. */
const SUMMARY_BAR = `<div class="summary-strip">
      <div class="summary-strip__cell">
        <span class="summary-strip__label">회원명</span>
        <span class="summary-strip__value">홍길동</span>
      </div>
      <div class="summary-strip__cell">
        <span class="summary-strip__label">나의 사서함</span>
        <span class="summary-strip__value summary-strip__value--gold">KR0000000</span>
      </div>
      <div class="summary-strip__cell">
        <span class="summary-strip__label">예치금(₩)</span>
        <span class="summary-strip__value summary-strip__value--gold">0</span>
      </div>
      <div class="summary-strip__cell">
        <span class="summary-strip__label">쿠폰</span>
        <span class="summary-strip__value summary-strip__value--gold">0</span>
      </div>
      <div class="summary-strip__cell">
        <span class="summary-strip__label">미결제</span>
        <span class="summary-strip__value summary-strip__value--gold">0</span>
      </div>
    </div>`;

const TITLE = (t) => `<h1 class="sub-title"><span class="sub-title__dash"></span>${t}</h1>`;

/* ------------------------------------------------------------ 1. 계정관리 */

const ACCOUNT_BODY = `
<main class="page-body">
  <div class="container">

${QUICK_LINKS}

${SUMMARY_BAR}

${TITLE('회원정보 수정')}

    <table class="form-table">
      <tbody>
        <tr>
          <th>아이디</th>
          <td class="is-readonly">user_id</td>
          <th>사서함 번호</th>
          <td class="is-readonly">KR0000000</td>
        </tr>
        <tr>
          <th>이름</th>
          <td class="is-readonly">홍길동</td>
          <th>영문이름</th>
          <td><input class="input" type="text" value="HONG GILDONG" aria-label="영문이름"></td>
        </tr>
        <tr>
          <th>비밀번호</th>
          <td><input class="input" type="password" aria-label="비밀번호"></td>
          <th>휴대폰</th>
          <td><input class="input" type="tel" aria-label="휴대폰"></td>
        </tr>
        <tr>
          <th>이메일</th>
          <td class="is-readonly">user@example.com</td>
          <th>마지막 로그인</th>
          <td class="is-readonly">2026-10-04 13:52 &nbsp;로그아웃</td>
        </tr>
        <tr>
          <th>SMS/카카오알림톡 수신동의<br>(자동 필수)</th>
          <td colspan="3">
            <p class="form-table__note">지속적인 현황을 알 수 있습니다(견적,입고,출고,배송,오류)</p>
            <label class="check"><input type="checkbox"> 배송비용 푹지 수신 거부</label>
          </td>
        </tr>
        <tr>
          <th>개인/사업자</th>
          <td colspan="3">
            <span class="radio-row">
              <label><input type="radio" name="memberType" checked> 개인</label>
              <label><input type="radio" name="memberType"> 사업자</label>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="btn-row">
      <button class="btn btn--navy" type="button">정보수정</button>
      <button class="btn" type="button">탈퇴하기</button>
    </div>

  </div>
</main>
`;

const ACCOUNT_CSS = `
/* ============================================================
   계정관리 — 회원정보 수정
   ============================================================ */

/* 상단 4개 바로가기 */
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

/* 회원 요약 (다크 바) */
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

.summary-strip__label {
  display: block;
  font-size: 14px;
  color: #fff;
}

.summary-strip__value {
  display: block;
  margin-top: 6px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.summary-strip__value--gold { color: #e8c341; }

/* 가운데 제목 (짧은 막대 + 글자) */
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

/* 라벨 + 값 2단 표 */
.form-table {
  width: 100%;
  margin-bottom: 30px;
  border-collapse: collapse;
}

.form-table th,
.form-table td {
  padding: 14px 16px;
  font-size: 14px;
  border: 1px solid var(--line);
  vertical-align: middle;
}

.form-table th {
  width: 13%;
  font-weight: 700;
  color: var(--ink);
  text-align: left;
  background: var(--fill);
}

.form-table td { width: 37%; color: var(--body); }

.form-table td.is-readonly { color: var(--ink); }
.form-table__note { margin: 0 0 8px; font-size: 13px; color: var(--body); }

/* 버튼 줄 (이 페이지는 가운데 정렬) */
.btn-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

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
`;

/* ------------------------------------------------------------ 2. 결제방법 */

const PAYMENT_BODY = `
<main class="page-body">
  <div class="container">

${QUICK_LINKS}

${SUMMARY_BAR}

${TITLE('결제 관리')}

    <div class="pay-tabs">
      <span class="pay-tabs__item is-active">비용결제</span>
      <span class="pay-tabs__item">결제내역</span>
    </div>

    <p class="pay-total">Total :</p>

    <table class="pay-table">
      <thead>
        <tr>
          <th class="pay-table__check"><input type="checkbox" aria-label="전체 선택"></th>
          <th>비용결제</th>
          <th>등록일</th>
          <th>결제금액</th>
          <th>상세</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="pay-table__empty" colspan="5">결제 대기간이 존재하지 않습니다.</td>
        </tr>
      </tbody>
    </table>

    <ul class="pay-notes">
      <li>여러 건을 한꺼번에 결제하실 경우에는 해당 건을 모두 클릭해주시면 됩니다.</li>
      <li>결제대기건의 경우 모두 포장, 배송비 계측이 마무리 된 것임으로 재포장이나 합배송/묶음배송이 불가능합니다. 계좌로 입금된 시간=결제관리에서 결제신청일, 입금자명, 입금된 금액이 다를경우 빠른처리를 위해서 반드시 1:1 고객센터에 문의부탁드립니다.</li>
    </ul>

    <div class="pay-bottom">
      <div class="pay-bottom__left">
        <span class="radio-row">
          <label><input type="radio" name="payMethod" checked> 무통장입금</label>
          <label><input type="radio" name="payMethod"> 신용카드(토스)</label>
        </span>
        <p class="pay-bottom__hint">결제 신청 후 확인이 가능합니다.</p>
        <div class="pay-bottom__fields">
          <input class="input" type="text" value="0" aria-label="금액">
          <button class="btn btn--sm" type="button">예치금 전액사용</button>
          <input class="input" type="text" placeholder="입금자명" aria-label="입금자명">
          <button class="btn btn--sm" type="button">회원명으로 사용</button>
        </div>
      </div>
      <div class="pay-bottom__right">
        <p><span>결제금액</span><strong>₩0</strong></p>
        <p><span>쿠폰할인</span><strong>₩0</strong></p>
        <p><span>Total</span><strong class="is-red">₩0</strong></p>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn btn--navy" type="button">결제하기</button>
    </div>

  </div>
</main>
`;

const PAYMENT_CSS = `
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
`;

/* ------------------------------------------------------------ 3. 주소관리 */

const ADDRESS_BODY = `
<main class="page-body">
  <div class="container">

${TITLE('나의 주소록')}

    <div class="addr-search">
      <span class="addr-search__label">주소검색</span>
      <select class="addr-search__select" aria-label="검색 기준">
        <option>이름</option>
        <option>주소</option>
      </select>
      <input class="addr-search__input" type="text" aria-label="검색어">
      <button class="addr-search__btn" type="button" aria-label="검색">🔍</button>
      <button class="addr-search__add" type="button">새주소추가</button>
    </div>

    <div class="addr-list">

      <div class="addr-card">
        <p class="addr-card__name">홍길동</p>
        <p class="addr-card__line">(00000) 서울특별시 예시구 예시로 00 (예시동, 예시아파트)</p>
        <p class="addr-card__line">South Korea</p>
        <p class="addr-card__line">전화 번호: 010-0000-0000</p>
        <p class="addr-card__line">개인 통관 부호: P000000000000</p>
        <div class="addr-card__actions">
          <button class="btn btn--sm" type="button">수정</button>
          <button class="btn btn--sm btn--white" type="button">삭제</button>
        </div>
      </div>

    </div>

    <div class="pager">
      <span class="pager__item is-active">1</span>
    </div>

  </div>
</main>
`;

const ADDRESS_CSS = `
/* ============================================================
   주소관리 — 나의 주소록
   ============================================================ */

.sub-title {
  margin: 0 0 30px;
  font-size: 30px;
  font-weight: 700;
  color: var(--ink);
}

.sub-title__dash { display: none; }

/* 검색 줄 */
.addr-search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f3f3f3;
  border: 1px solid var(--line);
}

.addr-search__label {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.addr-search__select,
.addr-search__input {
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  background: #fff;
  border: 1px solid var(--line);
}

.addr-search__select { width: 190px; }
.addr-search__input { flex: 0 0 300px; }

.addr-search__select:focus,
.addr-search__input:focus { outline: none; border-color: var(--teal); }

.addr-search__btn {
  padding: 9px 13px;
  font-size: 15px;
  color: #fff;
  background: #b9b9b9;
  border: 0;
  cursor: pointer;
}

.addr-search__btn:hover { background: #a5a5a5; }

.addr-search__add {
  margin-left: auto;
  padding: 12px 22px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: var(--orange);
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}

.addr-search__add:hover { background: #e06400; }

/* 주소 카드 */
.addr-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.addr-card {
  padding: 16px;
  background: var(--fill);
  border: 1px solid var(--line);
}

.addr-card__name {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.addr-card__line {
  margin: 0 0 3px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--body);
  word-break: break-all;
}

.addr-card__actions { display: flex; gap: 4px; margin-top: 12px; }

/* 버튼 */
.btn {
  display: inline-block;
  padding: 8px 20px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: #a5a5a5;
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}

.btn:hover { background: #8f8f8f; }
.btn--white { color: var(--ink); background: #fff; border: 1px solid var(--line); }
.btn--white:hover { background: #f2f2f2; }

/* 페이지 번호 */
.pager { text-align: center; }

.pager__item {
  display: inline-block;
  width: 34px;
  height: 34px;
  font-size: 14px;
  line-height: 32px;
  color: var(--orange);
  border: 1px solid var(--orange);
}
`;

/* -------------------------------------------------------------------- write */

const PAGES = [
  { file: 'account.html', css: 'account.css', title: '계정관리',
    body: ACCOUNT_BODY, own: ACCOUNT_CSS },
  { file: 'payment.html', css: 'payment.css', title: '결제방법',
    body: PAYMENT_BODY, own: PAYMENT_CSS },
  { file: 'address.html', css: 'address.css', title: '주소관리',
    body: ADDRESS_BODY, own: ADDRESS_CSS },
];

for (const p of PAGES) {
  writeFileSync('마이페이지/' + p.file, head(p.title, p.css) + p.body + '\n' + foot);
  writeFileSync('마이페이지/' + p.css, CHROME + PAGE_BODY + p.own + '\n' + FOOTER_CSS);
  console.log(`${('마이페이지/' + p.file).padEnd(26)} ${p.title.padEnd(8)} css=${p.css}`);
}
