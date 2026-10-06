// Keep the main navigation identical on every page.
//
// The homepage (index.html) owns the definitive nav markup. This script copies
// that nav into every other page, rewriting the links so each page's own menu
// item is marked current and all submenu links resolve relative to that page.
//
//   node tools/sync-nav.mjs
//
// Run it after editing the nav in index.html.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const ROOT = '.';

// Which page each submenu entry should point at, keyed by the item label.
// Anything not listed stays '#', because we have not built that page yet.
const PAGE_BY_LABEL = {
  // 서비스안내
  'KURO Logi 소개':        '서비스안내/info_company.html',
  '회원등급, 수수료 안내':  '서비스안내/info_grade.html',
  '국제배송비 안내':        '서비스안내/weightchart2.html',
  '검수규정,보상규정':      '서비스안내/info_regulation.html',
  '통관불가 품목':          '서비스안내/clearance_policy.html',
  '목록통관 품목안내':      '서비스안내/listpass_help.html',
  'KURO 사용메뉴얼':        '서비스안내/manual.html',

  // 종합현황
  '종합현황':               '종합현황/dashboard.html',
  '트레킹입력':             '종합현황/tracking.html',
  '노데이터 확인':          '종합현황/nodata.html',
  '보관현황':               '종합현황/storage.html',

  // 마이페이지
  '마이페이지':             '마이페이지/mypage.html',
  '계정관리':               '마이페이지/account.html',
  '결제방법':               '마이페이지/payment.html',
  '주소관리':               '마이페이지/address.html',

  // 구매대행 — 주문서 작성 화면은 배송대행과 같은 폼을 씁니다
  '재고구매신청등록':       '구매대행/stock_order.html',
  '구매대행 엑셀등록':      '구매대행/excel_upload.html',

  // 배송대행
  '배송대행 엑셀등록':      '배송대행/excel_upload.html',

  // 커뮤니티
  '공지사항':               '커뮤니티/notice.html',
  '1:1게시판':              '커뮤니티/qna.html',
  '알림메세지':             '커뮤니티/message.html',
  '특가제품안내':           '커뮤니티/deals.html',
  '자주묻는 질문':          '커뮤니티/faq.html',
};

// '주문서등록' sits under both 구매대행 and 배송대행, so it is resolved per
// top-level item instead of by label (otherwise both would hit one page).
const ORDER_FORM_BY_ITEM = {
  '구매대행': '구매대행/order_form.html',
  '배송대행': '배송대행/order_form.html',
};

// Top-level items whose first submenu entry is not their landing page.
const TOP_LINK_BY_ITEM = {
  '커뮤니티': '커뮤니티/notice.html',
};

// Top-level items in the order index.html defines them.
// Used to catch accidental drift in the homepage nav.
const EXPECTED_TOP_ITEMS = ['서비스안내', '종합현황', '마이페이지', '구매대행', '배송대행', '커뮤니티'];

/* ------------------------------------------------------------ read nav */

const home = readFileSync('index.html', 'utf8');
const navStart = home.indexOf('<nav class="main-nav"');
const navEnd = home.indexOf('</nav>', navStart) + '</nav>'.length;
if (navStart === -1) throw new Error('nav not found in index.html');
const NAV = home.slice(navStart, navEnd);

// Pull out each top-level item: its name and its submenu entries.
function parseNav(nav) {
  const items = [];
  const chunks = nav.split('<li class="main-nav__item');
  for (const chunk of chunks.slice(1)) {
    const name = (chunk.match(/<a href="[^"]*">([^<]*)</) || [])[1];
    if (!name) continue;
    const subs = [...chunk.matchAll(/<li><a href="[^"]*">([^<]*)<\/a><\/li>/g)]
      .map((m) => m[1]);
    items.push({ name, subs });
  }
  return items;
}

const ITEMS = parseNav(NAV);
const foundItems = ITEMS.map((i) => i.name).join(',');
const wantItems = EXPECTED_TOP_ITEMS.join(',');
if (foundItems !== wantItems) {
  throw new Error(
    'index.html nav mismatch\n' +
    '  expected: ' + wantItems + '\n' +
    '  found:    ' + foundItems
  );
}

/* ------------------------------------------------------- build per page */

// depth: 0 for files at the workspace root, 1 for files one folder down
function buildNav({ depth, current }) {
  const prefix = depth > 0 ? '../' : '';

  const li = ITEMS.map(({ name, subs }) => {
    const isCurrent = current !== null && name === current;
    const orderForm = ORDER_FORM_BY_ITEM[name];
    const houseHref = subs.length
      ? (ORDER_FORM_BY_ITEM[name]
         || TOP_LINK_BY_ITEM[name]
         || PAGE_BY_LABEL[subs[0]]
         || '#')
      : '#';

    const submenu = subs.length
      ? '\n          <ul class="main-nav__submenu">\n'
        + subs.map((label) => {
            // 주문서등록 belongs to two items, so resolve it per item first
            const perItem = label === '주문서등록' ? orderForm : null;
            const target = perItem || PAGE_BY_LABEL[label] || '#';
            const href = target === '#' ? '#' : prefix + target;
            return `            <li><a href="${href}">${label}</a></li>`;
          }).join('\n')
        + '\n          </ul>\n        '
      : '';

    const start = isCurrent
      ? '\n        <li class="main-nav__item is-current">'
      : '\n        <li class="main-nav__item">';

    return start
      + `\n          <a href="${houseHref === '#' ? '#' : prefix + houseHref}">${name}</a>`
      + (submenu ? '\n          ' + submenu.trim() : '')
      + '\n        </li>';
  }).join('');

  return '<nav class="main-nav">\n      <ul class="main-nav__list">'
    + li
    + '\n      </ul>\n    </nav>';
}

/* ------------------------------------------------------------- apply */

const TARGETS = [
  { path: "종합현황/dashboard.html", depth: 1, current: "종합현황" },
  { path: "종합현황/nodata.html",    depth: 1, current: "종합현황" },
  { path: "서비스안내/info_company.html",    depth: 1, current: "서비스안내" },
  { path: "서비스안내/info_grade.html",      depth: 1, current: "서비스안내" },
  { path: "서비스안내/weightchart2.html",    depth: 1, current: "서비스안내" },
  { path: "서비스안내/info_regulation.html", depth: 1, current: "서비스안내" },
  { path: "서비스안내/listpass_help.html",   depth: 1, current: "서비스안내" },
  { path: "배송대행/excel_upload.html", depth: 1, current: "배송대행" },
  { path: "구매대행/excel_upload.html", depth: 1, current: "구매대행" },
  { path: "배송대행/order_form.html",   depth: 1, current: "배송대행" },
  { path: "구매대행/order_form.html",   depth: 1, current: "구매대행" },
  { path: "마이페이지/mypage.html",     depth: 1, current: "마이페이지" },
  { path: "마이페이지/account.html",    depth: 1, current: "마이페이지" },
  { path: "마이페이지/payment.html",    depth: 1, current: "마이페이지" },
  { path: "마이페이지/address.html",    depth: 1, current: "마이페이지" },
  { path: "서비스안내/clearance_policy.html", depth: 1, current: "서비스안내" },
  { path: "서비스안내/manual.html",           depth: 1, current: "서비스안내" },
  { path: "종합현황/tracking.html",           depth: 1, current: "종합현황" },
  { path: "종합현황/storage.html",            depth: 1, current: "종합현황" },
  { path: "구매대행/stock_order.html",        depth: 1, current: "구매대행" },
  { path: "커뮤니티/notice.html",             depth: 1, current: "커뮤니티" },
  { path: "커뮤니티/qna.html",                depth: 1, current: "커뮤니티" },
  { path: "커뮤니티/message.html",            depth: 1, current: "커뮤니티" },
  { path: "커뮤니티/deals.html",              depth: 1, current: "커뮤니티" },
  { path: "커뮤니티/faq.html",                depth: 1, current: "커뮤니티" },
  // index.html owns the nav, but its own links still need wiring
  { path: "index.html",                 depth: 0, current: null },
];

for (const t of TARGETS) {
  if (!existsSync(t.path)) { console.log('skip (missing): ' + t.path); continue; }
  let html = readFileSync(t.path, 'utf8');
  const placeholder = '<!-- NAV_PLACEHOLDER -->';
  const hasPlaceholder = html.includes(placeholder);
  const s = hasPlaceholder ? html.indexOf(placeholder) : html.indexOf('<nav class="main-nav"');
  if (s === -1) { console.log('skip (no nav): ' + t.path); continue; }
  const e = hasPlaceholder ? s + placeholder.length : html.indexOf('</nav>', s) + '</nav>'.length;

  const before = html.slice(s, e);
  const after = buildNav(t);
  html = html.slice(0, s) + after + html.slice(e);
  writeFileSync(t.path, html);

  const subCount = (after.match(/main-nav__submenu/g) || []).length;
  const itemCount = (after.match(/class="main-nav__item/g) || []).length;
  console.log(`${t.path.padEnd(36)} items=${itemCount}  submenus=${subCount}`
    + `  (was ${(before.match(/main-nav__submenu/g) || []).length})`);
}
