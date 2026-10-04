// Build the five 서비스안내 inner pages from the fetched originals.
//
//   node tools/build-pages.mjs
//
// For each page it takes the original content block, drops the parts we do not
// want (modals, hidden popups, dead scripts), rewrites Bootstrap class names to
// the plain-CSS names used in this project, points image paths at images/, and
// wraps everything in the shared header/footer taken from the homepage.
//
// Output: 서비스안내/<name>.html  +  서비스안내/<name>.css

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const OUT_DIR = '서비스안내';

const PAGES = [
  {
    file: 'info_company',
    src: '.ref/ref_help_info_company.html',
    title: 'KURO Logi 소개',
    pageTitle: 'KURO logi 소개',
    css: 'info-company.css',
  },
  {
    file: 'info_grade',
    src: '.ref/ref_help_info_grade.html',
    title: '회원등급, 수수료 안내',
    pageTitle: '회원등급, 수수료 안내',
    css: 'info-grade.css',
  },
  {
    file: 'weightchart2',
    src: '.ref/ref_help_weightchart2.html',
    title: '국제배송비 안내',
    pageTitle: '국제배송비 안내',
    css: 'weightchart2.css',
  },
  {
    file: 'info_regulation',
    src: '.ref/ref_help_info_regulation.html',
    title: 'KURO 검수규정, 보상규정',
    pageTitle: 'KURO 검수규정, 보상규정',
    css: 'info-regulation.css',
  },
  {
    file: 'listpass_help',
    src: '.ref/ref_page_listpass_help.html',
    title: '목록통관 품목안내',
    pageTitle: '목록통관 품목안내',
    css: 'listpass-help.css',
  },
];

/* ------------------------------------------------------------------ helpers */

// Find the index just after the element that starts at `from`,
// using tag-depth counting so nested elements are handled correctly.
function balancedEnd(html, from, tag) {
  const open = new RegExp(`<${tag}\\b`, 'gi');
  const close = new RegExp(`</${tag}\\s*>`, 'gi');
  open.lastIndex = from;
  const first = open.exec(html);
  if (!first) return -1;
  let depth = 0;
  let i = first.index;
  while (i < html.length) {
    open.lastIndex = i;
    close.lastIndex = i;
    const o = open.exec(html);
    const c = close.exec(html);
    if (!c) return -1;
    if (o && o.index < c.index) { depth++; i = o.index + o[0].length; }
    else {
      depth--;
      i = c.index + c[0].length;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// Pull the content block out of the original page.
// Uses depth counting rather than regex so no stray closing tags survive.
function extractContent(html) {
  const sStart = html.indexOf('<section id="content"');
  if (sStart === -1) throw new Error('content section not found');
  const sEnd = balancedEnd(html, sStart, 'section');
  if (sEnd === -1) throw new Error('content section end not found');
  let body = html.slice(sStart, sEnd);

  // drop scripts and comments
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // keep only what is inside the .container, using depth counting again.
  // The container may carry extra classes (e.g. "clearfix fontsize18"),
  // and the file uses CRLF, so match on a class list rather than a fixed string.
  const cMatch = /<div class="[^"]*\bcontainer\b[^"]*"/.exec(body);
  if (!cMatch) throw new Error('container not found');
  const c = cMatch.index;
  const cEnd = balancedEnd(body, c, 'div');
  if (cEnd === -1) throw new Error('container end not found');
  const openTagEnd = body.indexOf('>', c) + 1;
  const content = body.slice(openTagEnd, cEnd);
  // strip the trailing </div> that closed the container
  return content.replace(/<\/div>\s*$/, '').trim();
}

// Bootstrap class name -> plain CSS class name used in this project.
const CLASS_MAP = {
  'container':      null,          // handled by our own wrapper
  'clearfix':       null,
  'content-wrap':   null,
  'img-responsive': null,          // our CSS makes images fluid by default
  'center':         null,          // our CSS handles it per component
  'left':           null,
  'fc':             null,
  't700':           'is-bold',
  'fontsize18':     'text-h3',
  'fontsize20':     'text-h2',
  'fontsize14':     'text-sm',
  'fontsize13':     'text-sm',
  'fontsize16':     'text-md',
  'margintop30':    'spaced-top',
  'marginbot30':    'spaced-bottom',
  'cont_paragraph2': 'note-block',
  'fontcolor_red':  'is-red',
  'fontcolor-mint1': 'is-mint',
  'btn':            'btn',
  'btn-dark':       'btn--dark',
  'btn-info':       'btn--info',
  'btn-sm':         'btn--sm',
  'btn_link':       'link-btn',
  'btn_link_ov':    'link-btn link-btn--active',
  'table1':         'data-table',
  'table-bordered': null,
  'table-vertical1': 'data-table data-table--vertical',
  'table':          'data-table',
  'table-striped':  'data-table',
  'alert':          'alert',
  'alert-danger':   'alert',
  'alert-info':     'alert',
  'text-right':     'text-right',
};

function mapClasses(html) {
  return html.replace(/class="([^"]*)"/g, (whole, value) => {
    const out = [];
    for (const cls of value.split(/\s+/)) {
      if (!cls) continue;
      if (!(cls in CLASS_MAP)) { out.push(cls); continue; }
      const mapped = CLASS_MAP[cls];
      if (mapped) out.push(...mapped.split(' '));
    }
    return out.length ? `class="${[...new Set(out)].join(' ')}"` : '';
  }).replace(/class=""\s*/g, '');
}

// style="..." attribute mapping for the colour/size utilities used inline.
function mapInline(html) {
  return html
    .replace(/<font([^>]*)>/gi, '<span>')
    .replace(/<\/font>/gi, '</span>')
    // some originals use single quotes on image src; normalise to double
    .replace(/src='([^']*)'/gi, 'src="$1"')
    .replace(/class='([^']*)'/gi, 'class="$1"');
}

// Point images at our local images folder.
// Handles both quote styles and strips cache-busting query strings (?id=2).
function fixImages(html) {
  return html
    .replace(/(src|href)=(['"])\/images\/([^'"]*?)\2/g, (m, attr, q, path) => {
      const clean = path.split('?')[0];
      return `${attr}=${q}../images/${clean}${q}`;
    });
}

// Remove attributes we do not want (inline onclick, etc.)
function clean(html) {
  return html
    .replace(/\son(click|mouseover|mouseout|keydown|mousedown|focus)="[^"]*"/gi, '')
    .replace(/\starget="_blank"/gi, '')
    // javascript: links have no meaning in a static rebuild -> plain '#'
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/href='javascript:[^']*'/gi, 'href="#"')
    // their own server-side links -> '#', unless it is a local page in this folder
    .replace(/href="\/(help|page|board|member|common)\/([^"?#]*)(\?[^"]*)?"/gi,
             (m, dir, name) => {
               const map = {
                 'info_company.asp': 'info_company.html',
                 'info_grade.asp': 'info_grade.html',
                 'weightchart2.asp': 'weightchart2.html',
                 'info_regulation.asp': 'info_regulation.html',
                 'listpass_help.asp': 'listpass_help.html',
               };
               return map[name] ? `href="${map[name]}"` : 'href="#"';
             })
    .replace(/&nbsp;/g, ' ');
}

// Page-specific table class: each page styles its tables slightly differently,
// so after the generic mapping we tag the tables with the page's own class.
const PAGE_TABLE_CLASS = {
  'info_company':    'company-table',
  'info_grade':      'grade-table',
  'weightchart2':    'rate-table',
  'info_regulation': 'regulation-table',
  'listpass_help':   'listpass-table',
};

function tagTables(html, pageKey) {
  const extra = PAGE_TABLE_CLASS[pageKey];
  if (!extra) return html;
  return html.replace(/<table class="([^"]*)"/g, (m, cls) => {
    const parts = cls.split(/\s+/).filter(Boolean);
    if (!parts.includes(extra)) parts.push(extra);
    return `<table class="${parts.join(' ')}"`;
  });
}

// The original pages are not well-formed HTML: they contain stray closing tags
// (e.g. info_grade has one more </tr> than <tr>, info_regulation one more </div>).
// Browsers silently repair this, so it renders fine, but we want clean output.
// This removes closing tags that have no matching open tag, in document order.
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link',
                      'meta','param','source','track','wbr']);

function balanceTags(html) {
  const stack = [];
  const out = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;   // capture name as written
  let last = 0;
  let m;

  while ((m = re.exec(html)) !== null) {
    const tagText = m[0];
    const name = m[1].toLowerCase();          // compare case-insensitively
    out.push(html.slice(last, m.index));
    last = m.index + tagText.length;

    const isClose = tagText.startsWith('</');
    const selfClose = tagText.endsWith('/>');

    if (VOID.has(name) || name === 'br' || selfClose) { out.push(tagText); continue; }

    if (!isClose) { stack.push(name); out.push(tagText); continue; }

    const idx = stack.lastIndexOf(name);
    if (idx === -1) continue;                 // stray close -> drop it
    for (let i = stack.length - 1; i > idx; i--) out.push(`</${stack[i]}>`);
    stack.length = idx;
    out.push(`</${name}>`);
  }
  out.push(html.slice(last));
  for (let i = stack.length - 1; i >= 0; i--) out.push(`</${stack[i]}>`);
  return out.join('');
}

// The originals mix upper and lower case tags (<TR>, <TD>).
// Normalise tag names to lower case for tidiness.
function lowerTags(html) {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b/g,
                      (m) => m.toLowerCase());
}

/* ------------------------------------------------------------------ chrome */

const HEADER = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__ | KURO Logi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Lato:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="__CSS__">
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
      <li><a href="#">언어 선택 <i class="caret">▾</i></a></li>
      <li><a class="kakao-btn" href="#"><img src="../images/air_kakao.png" alt="카톡상담"></a></li>
      <li><a class="kakao-btn" href="#"><img src="../images/kakao_sea1.png" alt="카톡상담"></a></li>
      <li><a class="kakao-btn" href="#"><img src="../images/kakao_sea2.png" alt="카톡상담"></a></li>
      <li><a href="#">로그인</a></li>
      <li><a href="#">회원가입</a></li>
    </ul>
  </div>
</div>

<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__logo" href="../index.html">
      <img src="../images/logo.png" alt="Kuro Logi 물류시스템">
    </a>
    <nav class="main-nav">
      <ul class="main-nav__list">
        <li class="main-nav__item is-current">
          <a href="info_company.html">서비스안내</a>
          <ul class="main-nav__submenu">
            <li><a href="info_company.html">KURO Logi 소개</a></li>
            <li><a href="info_grade.html">회원등급, 수수료 안내</a></li>
            <li><a href="weightchart2.html">국제배송비 안내</a></li>
            <li><a href="info_regulation.html">검수규정,보상규정</a></li>
            <li><a href="listpass_help.html">목록통관 품목안내</a></li>
          </ul>
        </li>
        <li class="main-nav__item"><a href="#">종합현황</a></li>
        <li class="main-nav__item"><a href="#">구매대행</a></li>
        <li class="main-nav__item"><a href="#">배송대행</a></li>
        <li class="main-nav__item"><a href="#">재고관리</a></li>
        <li class="main-nav__item"><a href="#">출고관리</a></li>
        <li class="main-nav__item"><a href="#">정산관리</a></li>
        <li class="main-nav__item"><a href="#">예치금 충전</a></li>
        <li class="main-nav__item"><a href="#">커뮤니티</a></li>
      </ul>
    </nav>
  </div>
</header>`;

const PAGE_TITLE = `<!-- 페이지 제목 + 현재 위치 -->
<section class="page-head">
  <div class="container page-head__inner">
    <h1 class="page-head__title">__PAGETITLE__</h1>
    <ol class="breadcrumb">
      <li class="breadcrumb__item"><a href="../index.html">홈</a></li>
      <li class="breadcrumb__item"><a href="info_company.html">서비스안내</a></li>
      <li class="breadcrumb__item is-current">__PAGETITLE__</li>
    </ol>
  </div>
</section>`;

const FOOTER = `<footer class="site-footer">
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

/* ------------------------------------------------------------------- build */

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const report = [];

for (const page of PAGES) {
  const raw = readFileSync(page.src, 'utf8').replace(/\r\n/g, '\n');

  // title and breadcrumb come from the original
  const h1 = raw.match(/<section id="page-title"[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/);
  const crumbs = [...raw.matchAll(/class="breadcrumb-item"[^>]*>([\s\S]*?)<\/li>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').trim());

  let content = extractContent(raw);
  content = mapInline(content);
  content = mapClasses(content);
  content = tagTables(content, page.file);
  content = fixImages(content);
  content = clean(content);
  content = lowerTags(content);
  content = balanceTags(content);
  content = content.replace(/\n{3,}/g, '\n\n').trim();

  // sanity: nothing should still point at their server or use javascript:
  const leftovers = [];
  if (/src="\/images\//.test(content)) leftovers.push('unfixed-image-src');
  if (/href="javascript:/i.test(content)) leftovers.push('javascript-link');
  // 'orig-asp-link' only counts real links (href), not leftover text
  if (/href="[^"]*\/(help|page)\//.test(content)) leftovers.push('orig-asp-link');

  // balanced tags are a hard requirement
  const count = (re) => (content.match(re) || []).length;
  const tags = ['div', 'table', 'tr', 'td', 'th', 'ul', 'li', 'p', 'span'];
  for (const t of tags) {
    const o = count(new RegExp(`<${t}\\b`, 'g'));
    const c = count(new RegExp(`</${t}\\s*>`, 'g'));
    if (o !== c) leftovers.push(`${t}:${o}/${c}`);
  }

  const html = HEADER
    .replace(/__TITLE__/g, page.title)
    .replace(/__CSS__/g, page.css)
    + '\n\n' + PAGE_TITLE.replace(/__PAGETITLE__/g, page.pageTitle)
    + '\n\n<main class="page-body">\n  <div class="container">\n'
    + content
    + '\n  </div>\n</main>\n\n'
    + FOOTER;

  writeFileSync(`${OUT_DIR}/${page.file}.html`, html);

  report.push({
    file: page.file,
    title: page.title,
    h1: h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : '?',
    crumbs: crumbs.join(' > '),
    tables: (content.match(/<table/g) || []).length,
    images: (content.match(/<img/g) || []).length,
    bytes: Buffer.byteLength(html),
    leftovers,
  });
}

console.log('built:');
for (const r of report) {
  console.log(`  ${r.file.padEnd(18)} "${r.h1}"  tables=${r.tables} images=${r.images}  ${r.bytes} bytes`
    + (r.leftovers.length ? `  !! ${r.leftovers.join(', ')}` : ''));
}
