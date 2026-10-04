// Build the 구매대행 / 배송대행 form pages.
//
//   node tools/build-forms.mjs
//
// Writes:
//   배송대행/excel_upload.html   + 배송대행/excel-upload.css
//   구매대행/excel_upload.html   + 구매대행/excel-upload.css
//   배송대행/order_form.html     + 배송대행/order-form.css
//
// The chrome (topbar / header / footer) is shared; the <nav> is left as a
// placeholder and filled in by tools/sync-nav.mjs so every page keeps the
// exact same navigation as the homepage.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

/* ============================================================ shared CSS */

const CHROME_CSS = `/* ==========================================================================
   KURO Logi — 공통 뼈대 (상단 바 · 헤더 · 페이지 제목 · 푸터)

   바꾸고 싶은 값은 :root 한 곳만 고치면 됩니다.
   순수 CSS · Bootstrap 클래스 없음 · 데스크톱 고정폭
   ========================================================================== */

:root {
  --teal:      #159692;
  --teal-dark: #107a77;
  --blue:      #107abd;
  --navy:      #1e3354;   /* 제출 버튼 */
  --orange:    #ff7000;
  --red:       #dd4b39;
  --pink-bg:   #fdeef3;   /* 안내 박스 (분홍) */
  --blue-bg:   #e4f0f9;   /* 섹션 머리글 */

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
`;

/* 페이지 본문 공통 (폼 요소 · 섹션) */

const BODY_CSS = `
/* ============================================================
   본문 공통
   ============================================================ */

.page-body { padding: 24px 0 40px; }

/* 제목 */
.form-title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
  color: var(--ink);
  text-align: center;
}

/* 섹션 (» 표시가 있는 파란 머리글) */
.form-section {
  margin-bottom: 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: #fff;
}

.form-section__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 700;
  color: #2b6a94;
  background: var(--blue-bg);
  border-bottom: 1px solid var(--line);
}

.form-section__head::before {
  content: '»';
  font-weight: 700;
}

.form-section__body { padding: 16px; }

/* 라벨 + 입력 한 줄 */
.field-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.field-row__label {
  flex: 0 0 150px;
  padding-top: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.field-row__body { flex: 1 1 auto; min-width: 0; }

/* 2열 배치가 필요한 경우 */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
}

.field-grid--3 { grid-template-columns: repeat(3, 1fr); }

.field { margin-bottom: 10px; }

.field__label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--muted);
}

/* 입력 요소 */
.input,
.select,
.textarea {
  width: 100%;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: #495057;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.input:focus,
.select:focus,
.textarea:focus { outline: none; border-color: var(--teal); }

.input::placeholder,
.textarea::placeholder { color: #aaa; }

/* 필수 항목 (빨간 테두리) */
.input--required { border-color: var(--red); }

.textarea { min-height: 74px; resize: vertical; }

.input--inline { display: inline-block; width: auto; }

/* 안내 문구 */
.note {
  margin: 4px 0 10px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--body);
}

.note--red { color: var(--red); }
.note--gray { color: var(--muted); }

.note-list { margin: 0; padding: 0; list-style: none; }
.note-list li { padding: 2px 0 2px 10px; font-size: 12px; line-height: 1.7; }
.note-list li::before { content: '* '; margin-left: -10px; }

/* 분홍 안내 박스 */
.info-box {
  margin: 16px 0;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--body);
  background: var(--pink-bg);
  border-radius: var(--radius);
}

.info-box p { margin: 6px 0; }
.info-box p:first-child { margin-top: 0; }
.info-box p:last-child { margin-bottom: 0; }

/* 버튼 */
.btn {
  display: inline-block;
  padding: 9px 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
  color: #fff;
  background: #6f6f6f;
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
  white-space: nowrap;
}

.btn:hover { color: #fff; background: #5c5c5c; }

.btn--navy { background: var(--navy); }
.btn--navy:hover { background: #16263f; }

.btn--sm { padding: 6px 12px; font-size: 12px; }

.btn-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.btn-row--left { justify-content: flex-start; }

/* 두 칸 버튼 (다운로드 등) */
.btn-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.btn-pair .btn { padding: 12px; }

/* 파일 선택 */
.file-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  font-size: 13px;
  color: var(--body);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  cursor: pointer;
}

.file-box:hover { border-color: var(--teal); }

/* 표 형태 폼 (부가서비스) */
.opt-table { width: 100%; border-collapse: collapse; }

.opt-table th,
.opt-table td {
  padding: 12px 10px;
  font-size: 13px;
  text-align: left;
  vertical-align: top;
  border: 1px solid var(--line);
}

.opt-table th {
  width: 130px;
  font-weight: 700;
  color: var(--ink);
  text-align: center;
  vertical-align: middle;
  background: var(--fill);
}

.opt-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 16px;
}

/* 체크박스 한 줄 */
.check {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--body);
  cursor: pointer;
}

.check input { flex: 0 0 auto; margin-top: 3px; }

.check .price { color: var(--red); }
.check .req { color: var(--red); font-size: 12px; }

/* 동의 항목 (25문항) */
.agree-list { margin: 0; padding: 0; list-style: none; }

.agree-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.6;
  border-bottom: 1px solid var(--line-soft);
}

.agree-item:last-child { border-bottom: 0; }
.agree-item__text { flex: 1 1 auto; color: var(--body); }

.agree-item__arrow {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--muted);
}

.agree-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  padding: 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--red);
  background: var(--fill);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  cursor: pointer;
}

/* 상품 이미지 자리 */
.thumb {
  width: 130px;
  height: 130px;
  display: grid;
  place-items: center;
  font-size: 34px;
  color: #bbb;
  background: var(--fill);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

/* 뱃지 */
.badge {
  display: inline-block;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #e05a7a;
  background: #fdeef3;
  border-radius: var(--radius);
}

/* 라디오 줄 */
.radio-row { display: flex; gap: 24px; font-size: 13px; }
.radio-row label { display: flex; align-items: center; gap: 5px; cursor: pointer; }
`;

/* ========================================================== shared parts */

const HEAD = (title, css) => `<!DOCTYPE html>
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
    <h1 class="page-head__title">__PAGETITLE__</h1>
    <ol class="breadcrumb">
      <li class="breadcrumb__item"><a href="../index.html">홈</a></li>
      <li class="breadcrumb__item"><a href="#">__CRUMB__</a></li>
      <li class="breadcrumb__item is-current">__PAGETITLE__</li>
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

/* ==================================================== 엑셀대량등록 content */

function excelUpload(defaultMode) {
  const isShip = defaultMode === 'ship';
  return `
<main class="page-body">
  <div class="container">

    <!-- ============ 액셀 샘플 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">엑셀 샘플</h2>
      <div class="form-section__body">
        <div class="btn-pair">
          <a class="btn" href="#">대량등록 엑셀업로드 샘플다운 ⇩</a>
          <a class="btn" href="#">통관품목 목록다운 ⇩</a>
        </div>
        <ul class="note-list">
          <li>대량등록 엑셀업로드 샘플다운 받아 작성 후 등록해주세요.</li>
          <li class="note--red">2024.01.22 최종 업데이트</li>
          <li class="note--red">엑셀 업로드시 서비스 신청 유의사항과 해외배송규정 안내 및 동의를 확인, 동의하였음으로 간주합니다. 반드시 확인 후 이용 바랍니다.</li>
        </ul>
      </div>
    </section>

    <!-- ============ 엑셀 대량 등록 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">엑셀 대량 등록</h2>
      <div class="form-section__body">

        <div class="field-grid field-grid--3">
          <div class="field">
            <label class="field__label" for="uploadMode">신청 구분</label>
            <select class="select" id="uploadMode">
              <option${isShip ? ' selected' : ''}>배송대행</option>
              <option${isShip ? '' : ' selected'}>구매대행</option>
            </select>
          </div>
          <div class="field">
            <label class="field__label" for="uploadCenter">발송국가 · 센터 선택</label>
            <select class="select" id="uploadCenter">
              <option>= 발송국가 &gt; 센터 선택</option>
              <option>일본 &gt; 항공 - 도쿄(JP)</option>
              <option>일본 &gt; 해상 - 후쿠오카 제1센터(JP)</option>
              <option>일본 &gt; 해상 - 후쿠오카 제2센터(JP)</option>
            </select>
          </div>
          <div class="field">
            <label class="field__label" for="uploadWay">운송 방식 선택</label>
            <select class="select" id="uploadWay">
              <option>= 운송방식 선택</option>
              <option>항공</option>
              <option>해상</option>
            </select>
          </div>
        </div>

        <label class="file-box" for="uploadFile">
          파일찾기 ⇧
          <input type="file" id="uploadFile" hidden>
        </label>
        <p class="note note--gray">파일 최대 크기 : 10 MB</p>

        <div class="btn-row">
          <button class="btn btn--navy" type="button">등록</button>
        </div>
      </div>
    </section>

  </div>
</main>
`;
}

/* ================================================= 배송대행 신청 content */

const AGREE = [
  '물품파손 규정에 대한 안내사항에 동의하시겠습니까?',
  '합배송을 원하시면 한개 주문서에 합배송 하실려는 트래킹번호 전부 기입해 주셔야 하며, 묶음/나눔배송은 최대 1회까지 무료입니다. 동의하시겠습니까?',
  '제품품목수 20건 제한에 동의 하시겠습니까?',
  '현지 트래킹번호가 모(母)번호 자(子)번호로 나뉘어져 있는 경우, 모(母)번호 기준으로 입출고 작업을 해드리고 있습니다. 동의하시겠습니까?',
  '목록통관취하, 통관 보류 및 통관불가에 대한 사항에 동의하시겠습니까?',
  '검수옵션 및 사진촬영서비스 내용에 대해 동의하십니까?',
  '대형화물 또는 이형화물의 멀티박스/폴리백 포장에 대해 동의하십니까?',
  '화물배송변경으로 인하여 차분요금이 발생할수 있습니다. 동의하시겠습니까?',
  '추가촬영, CCTV확인 작업시 비용이 발생합니다. 동의하시겠습니까?',
  '미등록 및 통관에 문제가되는 사운품 자동폐기에대해 동의하십니까?',
  '포장요청 단계부터는 제품의 묶음배송 및 나눔배송 또는 사진촬영 및 검수요청, 내부 포장요청, 반품요청 등 어떠한 요청도 불가능 합니다. 동의하시겠습니까?',
  '입고가 완료된 화물은 해운 ↔ 항공 ↔ LCL 사업자통관 서비스 변경이 불가합니다 동의하시겠습니까?',
  '도착화물의 보관일수는 30일이며, 노데이터 정책에 동의하십니까?',
  '해운/항공화물의 부피무게 안내사항에 동의하십니까?',
  '무검수가 아닌경우 포장 옵션은 당사 현지 현장직원의 판단하에 변경 진행될 수 있습니다. 이에 동의하십니까?',
  '실제화물 정보 허위입력, 중국 선적 금지품목은 주문서 접수를 금지합니다. 동의 하십니까?',
  '사업자통관 및 LCL사업자통관 안내사항에 동의 하십니까?',
  '재고를 두고 사용하시는 경우 수수료는 없지만 포장지 포장재배용이 청구되실수 있습니다. 동의하시겠습니까?',
  '홈페이지 이용후기에 작성하는 글과 사진은 당사에서 마케팅 목적으로 사용할 수 있습니다. 이에 동의하십니까?',
  '나눔배송&물품배송은 각 1회에 미 나눔상품의 합배송을 엄격히 금지합니다. 이에 동의하시겠습니까?',
  '무검수+중국택배원박스 선택시 트래킹하나만 있는 주문서이면 임시저장(검수대기)상태일지라도 도착한 그대로 포장이 완료되어 결제대기 단계로 이동될 수 있습니다. 이에 동의하십니까?',
  '사업자검수/나눔포장은 사진촬영비용과 수량체크비용이 발생됩니다. 이에 동의하시겠습니까?',
  '미숙지로 인한 불이익이 발생하는 경우 보상처리는 불가합니다. 이에 동의하십니까?',
  '보험서비스 제공으로 인한 개인정보 보험사 제공에 동의하시겠습니까?',
  '이용안내(수입금지품목) 및 공지사항내 \'상품명 정확한 신고 및 위반 시 책임 안내\'를 확인하였으며 이에 동의하시겠습니까?',
];

// 부가서비스 표: [그룹, [[라벨, 가격|'', 필수?]]]
const ADDONS = [
  ['사진촬영옵션', [
    ['기본검수', '', true], ['무검수', '', true], ['사업자검수', '비용별도문의', false],
    ['대형화물개봉촬영', '', true], ['사진촬영(의류)', '1,000', false],
  ]],
  ['포장옵션', [
    ['바로포장', '', true], ['중국택배원박스사용', '', true], ['멀티탭', '1,700', false],
    ['새플리백포장', '실비청구', false], ['새박스포장', '실비청구', false], ['내부뽁뽁이포장', '실비청구', false],
    ['박스외부포장보완', '5,000', false], ['PP밴드밴딩', '3,000', false], ['외부우드패킹', '30,000', false],
    ['공기주입이에캡 내부', '2,000', false], ['공기주입이에캡 외부', '5,000', false], ['외부랩핑', '', true],
    ['모서리보호대 상하8개', '2,000', false], ['종이코너보호대', '2,000', false], ['취급주의스티커부착 한국어', '1,400', false],
    ['취급주의스티커부착 중국어', '700', false], ['나무 파렛트', '30,000', false],
  ]],
  ['통관옵션', [
    ['사업자통관(후청구)', '', true], ['원산지증명원', '33,000', false], ['간이통관(본인선택)', '3,000', false],
  ]],
  ['LCL관련', [
    ['용달차(LCL만가능)', '', true], ['본인픽업', '', true], ['경동택배인계', '', true],
  ]],
  ['원산지작업', [
    ['원산지작업', '2,000', false], ['수량체크기본', '5,000', false],
  ]],
  ['기타옵션', [
    ['택배박스 제거', '1,000', false], ['신발박스 제거', '500', false], ['의류박스 제거', '500', false],
    ['관/부가세 회원 발송', '', true], ['관/부가세 수취인 발송', '', true],
  ]],
];

function orderForm(mode) {
  const isShip = mode === '배송대행';
  const formTitle = isShip ? '배송대행 신청' : '구매대행 주문서등록';
  const agreeItems = AGREE.map((text, i) => `
        <li class="agree-item">
          <input type="checkbox" id="agree${i + 1}">
          <label class="agree-item__text" for="agree${i + 1}">${i + 1}. ${text}</label>
          <span class="agree-item__arrow">▾</span>
        </li>`).join('');

  const addonRows = ADDONS.map(([group, opts]) => `
          <tr>
            <th>${group}</th>
            <td>
              <div class="opt-grid">
${opts.map(([label, price, req]) => `                <label class="check">
                  <input type="checkbox">
                  <span>${label}${price ? ` <span class="price">(₩${price})</span>` : ''}${req ? ' <span class="req">(내용필수확인※)</span>' : ''}</span>
                </label>`).join('\n')}
              </div>
            </td>
          </tr>`).join('');

  return `
<main class="page-body">
  <div class="container">

    <h1 class="form-title">${formTitle}</h1>

    <!-- ============ 물류센터 및 운송방식 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">물류센터 및 운송방식</h2>
      <div class="form-section__body">
        <p class="note" style="margin:0">위해 / LCL 사업자(월/수/금)</p>
      </div>
    </section>

    <!-- ============ 받는 사람 정보 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">받는 사람 정보</h2>
      <div class="form-section__body">

        <div class="field-row">
          <span class="field-row__label">받는 사람</span>
          <div class="field-row__body">
            <div class="field-grid">
              <div class="field">
                <label class="field__label" for="recvKo">한글</label>
                <input class="input" id="recvKo" type="text">
              </div>
              <div class="field">
                <label class="field__label" for="recvEn">영문</label>
                <input class="input" id="recvEn" type="text">
              </div>
            </div>
          </div>
        </div>

        <div class="field-row">
          <span class="field-row__label">주소</span>
          <div class="field-row__body">
            <div class="field-grid field-grid--3">
              <div class="field">
                <label class="field__label" for="postcode">우편번호</label>
                <input class="input" id="postcode" type="text">
              </div>
              <div class="field" style="padding-top:20px">
                <button class="btn btn--sm" type="button">우편번호 검색</button>
                <button class="btn btn--sm" type="button">주소록</button>
              </div>
              <div class="field"></div>
            </div>
            <div class="field">
              <label class="field__label" for="addr1">주소</label>
              <input class="input" id="addr1" type="text">
            </div>
            <div class="field">
              <label class="field__label" for="addr2">상세주소</label>
              <input class="input input--required" id="addr2" type="text">
            </div>
            <p class="note note--red">* 도로명 주소를 써주십시오. 지번 주소 기재 시 통관/세관에서 오류로 분류시켜 통관지연이 될 수 있습니다.</p>
            <p class="note note--red">* 세관신고 시 상세주소 필수기재입니다.</p>
          </div>
        </div>

        <div class="field-row">
          <span class="field-row__label">사업자</span>
          <div class="field-row__body">
            <p class="note">* 사업자통관의 경우 받는 사람 정보에 사업자등록증상 상호명을 입력 부탁드립니다.</p>
            <div class="field-grid">
              <div class="field">
                <label class="field__label" for="bizNo">사업자번호 (10자리 숫자만 입력)</label>
                <input class="input" id="bizNo" type="text" maxlength="10">
              </div>
              <div class="field">
                <label class="field__label" for="mobile">휴대전화</label>
                <input class="input" id="mobile" type="tel">
              </div>
            </div>
            <button class="btn btn--navy btn--sm" type="button">개인통관부호유효체크</button>
            <p class="note">* 스카이프 등 브라우저 관련된 프로그램이 켜져있으면, 끄고 진행하십시오.</p>
          </div>
        </div>

        <div class="field-row">
          <span class="field-row__label">배송 요청사항</span>
          <div class="field-row__body">
            <input class="input" id="deliverNote" type="text">
            <p class="note">* 국내 배송기사 분께 전달하고자 하는 요청사항을 남겨주세요 (예: 부재 시 휴대폰으로 연락주세요)</p>
          </div>
        </div>

      </div>
    </section>

    <!-- ============ 해외배송규정 안내 및 동의 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">해외배송규정 안내 및 동의</h2>
      <div class="form-section__body">
        <ul class="agree-list">${agreeItems}
        </ul>
        <label class="agree-all">
          <input type="checkbox"> 전체 동의하기
        </label>
      </div>
    </section>

    <!-- ============ 상품정보 입력 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">상품정보 입력</h2>
      <div class="form-section__body">

        <p class="note note--red" style="font-weight:700">상품 1 &nbsp;* 적색 테두리 필수항목</p>

        <div class="btn-row btn-row--left" style="margin:10px 0 18px">
          <button class="btn" type="button">등록상품 불러오기</button>
          <button class="btn" type="button">상품URL 가져오기</button>
          <button class="btn" type="button">오더내역복사</button>
          <button class="btn" type="button">↻ 복사</button>
          <button class="btn" type="button">⊞ 추가</button>
          <button class="btn" type="button">␡ 삭제</button>
        </div>

        <div style="display:flex;gap:16px;align-items:flex-start">
          <div>
            <div class="thumb" aria-hidden="true">🖼</div>
            <button class="btn btn--navy btn--sm" type="button" style="margin-top:8px">이미지 업로드</button>
          </div>

          <div style="flex:1 1 auto;min-width:0">
            <div class="field-grid">
              <div class="field">
                <label class="field__label" for="shopSite">쇼핑몰 사이트</label>
                <input class="input" id="shopSite" type="text">
              </div>
              <div class="field">
                <label class="field__label" for="brand">브랜드</label>
                <input class="input" id="brand" type="text">
              </div>
            </div>

            <div class="field-grid">
              <div class="field">
                <label class="field__label" for="shopOrder">쇼핑몰 오더번호</label>
                <input class="input" id="shopOrder" type="text">
              </div>
              <div class="field">
                <label class="field__label" for="tracking">트래킹번호 (Tracking No)</label>
                <input class="input input--required" id="tracking" type="text">
              </div>
            </div>
            <p class="note note--red">* 트래킹번호 없을 경우 '마이페이지' 주문신청 현황에서 입력</p>

            <div class="field-grid">
              <div class="field">
                <label class="field__label">통관품목</label>
                <button class="btn btn--sm" type="button">통관품목 검색</button>
              </div>
              <div class="field">
                <label class="field__label">영문명</label>
                <label class="check"><input type="checkbox"> 영문명 직접 기재</label>
              </div>
            </div>

            <div class="field">
              <label class="field__label" for="nameEn">상품명 영문</label>
              <input class="input input--required" id="nameEn" type="text">
            </div>
            <p class="note">* 통관품목 검색 후 없는 품목의 경우 1:1문의 부탁드립니다.</p>
            <p class="note">* 통관품목 검색하신 상품명과 HS코드 기준으로 세관신고되오니 품목 상이에 유의 부탁드립니다. (직접 기재형 신고아님)</p>
          </div>
        </div>

        <div class="field-grid" style="margin-top:16px">
          <div class="field">
            <label class="field__label" for="qty">수량</label>
            <input class="input" id="qty" type="number" value="1" min="1">
          </div>
          <div class="field">
            <label class="field__label" for="price">단가 (¥)</label>
            <input class="input" id="price" type="text" value="0.00">
          </div>
          <div class="field">
            <label class="field__label" for="color">색상</label>
            <input class="input" id="color" type="text">
          </div>
          <div class="field">
            <label class="field__label" for="size">사이즈</label>
            <input class="input" id="size" type="text">
          </div>
          <div class="field">
            <label class="field__label" for="prodUrl">상품URL</label>
            <input class="input" id="prodUrl" type="text">
          </div>
          <div class="field">
            <label class="field__label" for="imgUrl">이미지URL</label>
            <input class="input" id="imgUrl" type="text">
          </div>
          <div class="field">
            <label class="field__label" for="market">오픈마켓 이름</label>
            <input class="input" id="market" type="text">
          </div>
          <div class="field">
            <label class="field__label" for="marketOrder">오픈마켓 주문번호</label>
            <input class="input" id="marketOrder" type="text">
          </div>
          <div class="field">
            <label class="field__label" for="marketPrice">오픈마켓 판매금액</label>
            <input class="input" id="marketPrice" type="text" value="0">
          </div>
          <div class="field">
            <label class="field__label" for="hsCode">HS CODE</label>
            <input class="input" id="hsCode" type="text">
          </div>
          <div class="field">
            <label class="field__label" for="marketPay">오픈마켓 결제수단</label>
            <input class="input" id="marketPay" type="text">
          </div>
        </div>

      </div>
    </section>

    <!-- ============ 금액정보 입력 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">금액정보 입력</h2>
      <div class="form-section__body">
        <div class="field-grid field-grid--3">
          <div class="field">
            <label class="field__label" for="totalQty">총 수량</label>
            <input class="input" id="totalQty" type="text" value="0" readonly>
          </div>
          <div class="field">
            <label class="field__label" for="totalYen">총 금액 ¥</label>
            <input class="input" id="totalYen" type="text" value="0" readonly>
          </div>
          <div class="field">
            <label class="field__label" for="totalUsd">총 금액 $</label>
            <input class="input" id="totalUsd" type="text" value="0" readonly>
          </div>
        </div>
        <p class="note">* 세관에 신고되는 금액 입니다 (소량품 결제 금액과 동일)</p>
        <p class="note">* 총금액이 미화 150달러 이상인 경우, 통관수수료가 부과됩니다.</p>
        <p class="note">* 목록통관이 불가한 식품, 액체, 서물, 분말은 간이 통관으로 진행합니다 (*세관 절차비 책임지지 않습니다. 주의 하시기 바랍니다)</p>
        <div class="btn-row btn-row--left" style="margin-top:8px">
          <span class="badge">목록통관</span>
        </div>
      </div>
    </section>

    <!-- ============ 부가서비스 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">부가서비스</h2>
      <div class="form-section__body" style="padding:0">
        <table class="opt-table">
          <tbody>${addonRows}
          </tbody>
        </table>

        <div style="padding:16px">
          <label class="field__label" for="logisticsNote">물류 요청사항</label>
          <textarea class="textarea" id="logisticsNote"></textarea>
        </div>
      </div>
    </section>

    <!-- ============ 무게측정 후 자동 예치금 결제 ============ -->
    <section class="form-section">
      <h2 class="form-section__head">무게측정 후 자동 예치금 결제</h2>
      <div class="form-section__body">
        <div class="field-row" style="margin:0">
          <span class="field-row__label" style="padding-top:0">예치금 자동 결제</span>
          <div class="field-row__body">
            <div class="radio-row">
              <label><input type="radio" name="autoPay" value="auto"> 자동결제</label>
              <label><input type="radio" name="autoPay" value="manual" checked> 수동결제</label>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="info-box">
      <p>접수신청을 하시게 되면 수정이 불가능합니다. 트래킹 번호 추가 등 수정이 필요하신 경우에는 접수대기를 선택해주세요.</p>
      <p>(접수신청을 완료하신 후에 부득이한 사유로 요청서 수정이 필요한 경우에는 1:1문의를 주세요)</p>
    </div>

    <div class="btn-row">
      <button class="btn" type="button">접수대기</button>
      <button class="btn btn--navy" type="button">접수신청</button>
    </div>

  </div>
</main>
`;
}

/* ================================================================ build */

const PAGES = [
  {
    dir: '배송대행', file: 'excel_upload.html', css: 'excel-upload.css',
    title: '배송대행 엑셀등록', pageTitle: '배송대행 엑셀등록', crumb: '배송대행',
    body: excelUpload('ship'),
  },
  {
    dir: '구매대행', file: 'excel_upload.html', css: 'excel-upload.css',
    title: '구매대행 엑셀등록', pageTitle: '구매대행 엑셀등록', crumb: '구매대행',
    body: excelUpload('buy'),
  },
  {
    dir: '배송대행', file: 'order_form.html', css: 'order-form.css',
    title: '배송대행 신청', pageTitle: '배송대행 신청', crumb: '배송대행',
    body: orderForm('배송대행'),
  },
  {
    dir: '구매대행', file: 'order_form.html', css: 'order-form.css',
    title: '구매대행 주문서등록', pageTitle: '구매대행 주문서등록', crumb: '구매대행',
    body: orderForm('구매대행'),
  },
];

for (const p of PAGES) {
  if (!existsSync(p.dir)) mkdirSync(p.dir, { recursive: true });

  const html = HEAD(p.title, p.css)
    .replace(/__PAGETITLE__/g, p.pageTitle)
    .replace(/__CRUMB__/g, p.crumb)
    + p.body
    + '\n' + FOOT;

  writeFileSync(`${p.dir}/${p.file}`, html);
  writeFileSync(`${p.dir}/${p.css}`, CHROME_CSS + BODY_CSS);

  console.log(`${(p.dir + '/' + p.file).padEnd(34)} ${Buffer.byteLength(html)} bytes  css=${p.css}  ${Buffer.byteLength(CHROME_CSS + BODY_CSS)} bytes`);
}
