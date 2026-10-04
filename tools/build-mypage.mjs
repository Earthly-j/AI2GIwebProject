// Rebuild 마이페이지/mypage.html and update 종합현황/dashboard.html.
//
//   node tools/build-mypage.mjs
//
// What this does:
//   1. Moves 나의 정보 + 나의 사서함 주소 out of the dashboard into 마이페이지.
//   2. Reduces the 마이페이지 관리 메뉴 to 3 items that link to real pages.
//   3. Keeps the shared chrome / .box / footer CSS in sync with dashboard.css.
//
// The <nav> is emitted as a placeholder and filled by tools/sync-nav.mjs.
//
// Re-runnable: if the dashboard no longer contains the sections, the markup is
// read back from 마이페이지/mypage.html instead of failing.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const DASH_CSS = readFileSync('종합현황/dashboard.css', 'utf8');
let DASH_HTML = readFileSync('종합현황/dashboard.html', 'utf8');
const MYPAGE = '마이페이지/mypage.html';
const MY_CSS = '마이페이지/mypage.css';

/* ============================================================ 1. CSS parts */

const chromeEnd = DASH_CSS.indexOf('/* ------------------------------------------------------------------ 본문 */');
if (chromeEnd === -1) throw new Error('could not find the 본문 marker in dashboard.css');
const CHROME = DASH_CSS.slice(0, chromeEnd);

const footStart = DASH_CSS.indexOf('/* --------------------------------------------------------------- 푸터 */');
if (footStart === -1) throw new Error('could not locate the footer block');
const FOOTER_CSS = DASH_CSS.slice(footStart);

function block(startMarker, endMarker, label) {
  const s = DASH_CSS.indexOf(startMarker);
  const e = DASH_CSS.indexOf(endMarker);
  if (s === -1 || e === -1 || e < s) throw new Error('could not locate CSS block: ' + label);
  return DASH_CSS.slice(s, e);
}

const BOX = block('/* 공통 박스 */', '/* ---------------------------------------------------- 요약 탭', '공통 박스');
const MANAGE = block('/* ---------------------------------------------------- 마이페이지 관리 */',
                     '/* --------------------------------------------------------- 사서함 주소 */', '마이페이지 관리');
const INFO_CSS = block('/* ------------------------------------------------------------ 나의 정보 */',
                       '/* ---------------------------------------------------- 마이페이지 관리 */', '나의 정보');
const ADDR_CSS = block('/* --------------------------------------------------------- 사서함 주소 */',
                       '/* --------------------------------------------------- 하단 3단 (공지 등) */', '사서함 주소');

const PAGE_BODY = '.page-body { padding: 24px 0 40px; }\n';

/* ============================================================ 2. markup */

const infoStart = DASH_HTML.indexOf('<!-- ============ 4. 나의 정보 ============ -->');
const noticeStart = DASH_HTML.indexOf('<!-- ============ 6. 공지 / 환율 / 1:1 ============ -->');

let INFO_BLOCK;
let ADDR_BLOCK;

if (infoStart !== -1 && noticeStart !== -1 && noticeStart > infoStart) {
  // First run: the two sections still live in the dashboard.
  const both = DASH_HTML.slice(infoStart, noticeStart).trimEnd();
  const addrStart = both.indexOf('<!-- ============ 5. 나의 사서함 주소 ============ -->');
  if (addrStart === -1) throw new Error('could not split 나의 정보 / 사서함 주소');

  INFO_BLOCK = both.slice(0, addrStart).trimEnd();
  ADDR_BLOCK = both.slice(addrStart).trimEnd();

  // Remove them from the dashboard and renumber what remains.
  DASH_HTML = DASH_HTML.slice(0, infoStart) + DASH_HTML.slice(noticeStart);

  DASH_HTML = DASH_HTML
    .replace('<!-- ============ 6. 공지 / 환율 / 1:1 ============ -->',
             '<!-- ============ 4. 공지 / 환율 / 1:1 ============ -->')
    .replace('<!-- ============ 7. 자주하는 질문 ============ -->',
             '<!-- ============ 5. 자주하는 질문 ============ -->');

  writeFileSync('종합현황/dashboard.html', DASH_HTML);
  console.log('dashboard: moved 나의 정보 + 사서함 주소 out, sections renumbered');
} else if (existsSync(MYPAGE)) {
  // Re-run: read them back from the mypage file.
  const my = readFileSync(MYPAGE, 'utf8');
  const a = my.indexOf('<!-- ============ 나의 정보 ============ -->');
  const b = my.indexOf('<!-- ============ 관리 메뉴 ============ -->');
  if (a === -1 || b === -1) throw new Error('mypage.html is missing the expected sections');
  const both = my.slice(a, b).trimEnd();
  const mid = both.indexOf('<!-- ============ 나의 사서함 주소 ============ -->');
  if (mid === -1) throw new Error('could not split the mypage sections');
  INFO_BLOCK = both.slice(0, mid).trimEnd();
  ADDR_BLOCK = both.slice(mid).trimEnd();
  console.log('source: reused the sections already in 마이페이지/mypage.html');
} else {
  throw new Error('cannot locate 나의 정보 / 사서함 주소 and no 마이페이지/mypage.html exists');
}

/* ============================================== 3. manage menu (3 items) */

// The three destinations, reusing the original card markup but trimmed down.
const MANAGE_GRID = `<div class="manage-grid">

      <div class="manage-item">
        <span class="manage-item__icon">⚙</span>
        <span>
          <span class="manage-item__name"><a href="account.html">계정관리</a></span>
          <span class="manage-item__desc">비밀번호, 회원정보 변경<br>나의 멤버십 등급</span>
        </span>
      </div>

      <div class="manage-item">
        <span class="manage-item__icon">💳</span>
        <span>
          <span class="manage-item__name"><a href="payment.html">결제방법</a></span>
          <span class="manage-item__desc">신용카드 및 체크카드 관리<br>신용카드 및 체크카드 추가</span>
        </span>
      </div>

      <div class="manage-item">
        <span class="manage-item__icon">📇</span>
        <span>
          <span class="manage-item__name"><a href="address.html">주소관리</a></span>
          <span class="manage-item__desc">나의 주소록<br>새 주소 추가하기</span>
        </span>
      </div>

    </div>`;

// The 3-item grid uses the same 4-column track; keep it tidy at 3 columns.
const MANAGE_3COL = `
/* 관리 메뉴가 3개이므로 3열로 배치합니다 */
.manage-grid--three { grid-template-columns: repeat(3, 1fr); }
.manage-grid--three .manage-item { border-bottom: 0; }
.manage-grid--three .manage-item:nth-child(4n) { border-right: 1px solid var(--line-soft); }
.manage-grid--three .manage-item:nth-child(3n) { border-right: 0; }
.manage-item__name a { color: inherit; }
.manage-item__name a:hover { color: var(--teal); }
`;

/* ============================================================== 4. chrome */

const HEAD = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>마이페이지 | KURO Logi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Lato:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="mypage.css">
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
    <h1 class="page-head__title">마이페이지</h1>
    <ol class="breadcrumb">
      <li class="breadcrumb__item"><a href="../index.html">홈</a></li>
      <li class="breadcrumb__item is-current">마이페이지</li>
    </ol>
  </div>
</section>
`;

const FOOT = `<footer class="site-footer">
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
  <p class="copyright">ⓒ 2023 All Rights Reserved by KUROLogi.</p>
</footer>

</body>
</html>
`;

const indent = (s) => s.split('\n').map((l) => (l.trim() ? '    ' + l : l)).join('\n');

const body = `
<main class="page-body">
  <div class="container">

${indent(INFO_BLOCK.replace('============ 4. 나의 정보 ============', '============ 나의 정보 ============'))}

${indent(ADDR_BLOCK.replace('============ 5. 나의 사서함 주소 ============', '============ 나의 사서함 주소 ============'))}

    <!-- ============ 관리 메뉴 ============ -->
    <div class="box">
      <div class="box__head">
        <p class="box__title">마이페이지 관리 하기</p>
      </div>
      ${MANAGE_GRID.replace('manage-grid', 'manage-grid manage-grid--three')}
    </div>

  </div>
</main>
`;

if (!existsSync('마이페이지')) mkdirSync('마이페이지', { recursive: true });
writeFileSync(MYPAGE, HEAD + body + '\n' + FOOT);
writeFileSync(MY_CSS, CHROME + BOX + PAGE_BODY + INFO_CSS + MANAGE + MANAGE_3COL + ADDR_CSS + '\n' + FOOTER_CSS);

console.log('mypage.html  ' + Buffer.byteLength(HEAD + body + FOOT) + ' bytes');
console.log('mypage.css   ' + Buffer.byteLength(CHROME + BOX + PAGE_BODY + INFO_CSS + MANAGE + MANAGE_3COL + ADDR_CSS + FOOTER_CSS) + ' bytes');
console.log('  chrome+box+info+manage+addr+footer');
