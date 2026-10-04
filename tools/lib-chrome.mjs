// Shared page chrome for every inner page.
//
//   import { writePage, readChrome } from './lib-chrome.mjs';
//
// All inner pages share the same top bar, teal header, page-title band and
// footer. Before this helper each builder script re-derived those pieces from
// dashboard.css; this keeps them in one place so a new page is just a title
// plus a body.
//
// The <nav> is always written as a placeholder and filled in afterwards by
// tools/sync-nav.mjs, so the menu can never drift between pages.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DASH_CSS = '종합현황/dashboard.css';

/* --------------------------------------------------------------- CSS parts */

/** Top bar + header + nav + page-title + breadcrumb rules. */
export function chromeCss() {
  const css = readFileSync(DASH_CSS, 'utf8');
  const end = css.indexOf('/* ------------------------------------------------------------------ 본문 */');
  if (end === -1) throw new Error('본문 marker not found in ' + DASH_CSS);
  return css.slice(0, end);
}

/** Footer + copyright rules (they live at the end of dashboard.css). */
export function footerCss() {
  const css = readFileSync(DASH_CSS, 'utf8');
  const start = css.indexOf('/* --------------------------------------------------------------- 푸터 */');
  if (start === -1) throw new Error('푸터 marker not found in ' + DASH_CSS);
  return css.slice(start);
}

/**
 * Variables the shared chrome does not define but inner-page CSS needs.
 * dashboard.css has no --navy / --orange, so pages that use them must add
 * these or their buttons render invisible.
 */
export const EXTRA_VARS = `:root {
  --orange: #ff7000;
  --navy:   #1e3354;
}
`;

/* -------------------------------------------------------------- HTML parts */

/** depth: 0 for a file at the workspace root, 1 for one folder down. */
export function head({ title, css, depth = 1, current = null, crumb = null }) {
  const p = depth > 0 ? '../' : '';

  const crumbHtml = crumb === null
    ? ''
    : `\n      <li class="breadcrumb__item"><a href="${p}${crumb.href}">${crumb.label}</a></li>`;

  return `<!DOCTYPE html>
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
      <li><a href="${p}index.html">홈</a></li>
      <li><a href="#">즐겨찾기추가</a></li>
      <li><a href="#">1:1게시판</a></li>
    </ul>
    <ul class="topbar__links topbar__links--right">
      <li><a href="#">언어 선택 <i>▾</i></a></li>
      <li><a class="kakao-btn" href="#"><img src="${p}images/air_kakao.png" alt="카톡상담"></a></li>
      <li><a class="kakao-btn" href="#"><img src="${p}images/kakao_sea1.png" alt="카톡상담"></a></li>
      <li><a class="kakao-btn" href="#"><img src="${p}images/kakao_sea2.png" alt="카톡상담"></a></li>
      <li><a href="#">로그아웃</a></li>
    </ul>
  </div>
</div>

<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__logo" href="${p}index.html">
      <img src="${p}images/logo.png" alt="Kuro Logi 물류시스템">
    </a>
    <!-- NAV_PLACEHOLDER -->
  </div>
</header>

<section class="page-head">
  <div class="container page-head__inner">
    <h1 class="page-head__title">${title}</h1>
    <ol class="breadcrumb">
      <li class="breadcrumb__item"><a href="${p}index.html">홈</a></li>${crumbHtml}
      <li class="breadcrumb__item is-current">${title}</li>
    </ol>
  </div>
</section>
`;
}

export function foot({ depth = 1 } = {}) {
  const p = depth > 0 ? '../' : '';
  return `<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="row">
      <div class="col col--footer-logo">
        <img class="site-footer__logo" src="${p}images/logo.png" alt="Kuro Logi 물류시스템">
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
}

/* ------------------------------------------------------------------- write */

/**
 * Write one inner page (html + css).
 *
 *   writePage({
 *     dir: '종합현황', file: 'tracking.html', css: 'tracking.css',
 *     title: '트래킹입력',
 *     crumb: { label: '종합현황', href: 'dashboard.html' },
 *     body: '<main class="page-body">…</main>',
 *     ownCss: '.tracking { … }',
 *   });
 */
export function writePage({ dir, file, css, title, crumb = null, body, ownCss, depth = 1 }) {
  if (!existsSync(dir)) throw new Error('output folder does not exist: ' + dir);

  const html = head({ title, css, depth, crumb }) + '\n' + body + '\n' + foot({ depth });
  const sheet = chromeCss() + '\n.page-body { padding: 24px 0 40px; }\n\n'
    + EXTRA_VARS + '\n' + ownCss + '\n' + footerCss();

  writeFileSync(`${dir}/${file}`, html);
  writeFileSync(`${dir}/${css}`, sheet);
  return { html: Buffer.byteLength(html), css: Buffer.byteLength(sheet) };
}
