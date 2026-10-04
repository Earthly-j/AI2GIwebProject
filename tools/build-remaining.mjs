// Build the 10 remaining menu pages so no nav item is a dead link.
//
//   node tools/build-remaining.mjs
//
// Writes:
//   서비스안내/clearance_policy.html   통관불가 품목
//   서비스안내/manual.html             KURO 사용메뉴얼
//   종합현황/tracking.html            트래킹입력
//   종합현황/storage.html             보관현황
//   구매대행/stock_order.html          재고구매신청등록
//   커뮤니티/notice.html              공지사항
//   커뮤니티/qna.html                 1:1게시판
//   커뮤니티/message.html             알림메세지
//   커뮤니티/deals.html               특가제품안내
//   커뮤니티/faq.html                 자주묻는 질문
//
// These follow the same house style as the pages built from reference
// screenshots. No reference images existed for them, so the layouts are the
// conventional forwarding-dashboard patterns: a toolbar, a table, a pager.

import { mkdirSync, existsSync } from 'node:fs';
import { writePage } from './lib-chrome.mjs';

/* --------------------------------------------------------- shared fragments */

// A page toolbar: drop-down + search box + optional right-side action button.
function toolbar({ selectLabel, placeholder, action }) {
  return `    <div class="pane-toolbar">
      <span class="pane-toolbar__label">${selectLabel}</span>
      <select class="pane-toolbar__select" aria-label="${selectLabel}">
        <option>전체</option>
        <option>제목</option>
        <option>내용</option>
      </select>
      <input class="pane-toolbar__input" type="text" placeholder="${placeholder}" aria-label="검색어">
      <button class="pane-toolbar__search" type="button" aria-label="검색">🔍</button>
${action ? `      <button class="pane-toolbar__action" type="button">${action}</button>\n` : ''}    </div>`;
}

const PAGER = `    <div class="pager">
      <span class="pager__item is-active">1</span>
    </div>`;

const EMPTY = (text) => `        <tr><td class="data-table__empty" colspan="9">${text}</td></tr>`;

/* ------------------------------------------------------- 1. 통관불가 품목 */

const CLEARANCE_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>통관불가 품목</h1>

    <div class="info-box">
      <p>아래 품목은 일본에서 한국으로 반입이 제한되거나 금지된 품목입니다. 주문 전 반드시 확인해 주세요.</p>
      <p>표시된 품목이라도 수량·용도·성분에 따라 통관 가능 여부가 달라질 수 있으며, 최종 판단은 세관에 있습니다.</p>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>구분</th>
          <th>품목</th>
          <th>사유</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>식품</td><td>육류 및 육가공품</td><td>가축전염병 예방법에 따른 반입 금지</td></tr>
        <tr><td>식품</td><td>유제품, 생과일, 채소</td><td>식물방역법·검역 대상</td></tr>
        <tr><td>건강</td><td>의약품, 한약재</td><td>약사법에 따른 허가 필요</td></tr>
        <tr><td>건강</td><td>건강기능식품 (성분 확인 필요)</td><td>식품의약품안전처 기준 초과 시</td></tr>
        <tr><td>화장품</td><td>미백·주름개선 기능성 화장품</td><td>기능성 심사 대상</td></tr>
        <tr><td>기기</td><td>무선통신기기 (전파인증 미취득)</td><td>전파법에 따른 적합성 평가 필요</td></tr>
        <tr><td>기타</td><td>모조품, 위조 상품</td><td>상표법 위반</td></tr>
        <tr><td>기타</td><td>총포·도검류, 화약류</td><td>총포도검화약류등단속법</td></tr>
        <tr><td>기타</td><td>음란물, 불법 복제물</td><td>관련 법령 위반</td></tr>
      </tbody>
    </table>

    <ul class="note-list">
      <li>목록통관 대상이라도 세관장 확인 대상 품목은 별도 절차가 필요합니다.</li>
      <li>판단이 어려운 품목은 1:1게시판으로 문의해 주세요.</li>
    </ul>

  </div>
</main>
`;

/* ------------------------------------------------------ 2. KURO 사용메뉴얼 */

const MANUAL_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>KURO 사용메뉴얼</h1>

    <div class="info-box">
      <p>KURO Logi 물류시스템 사용 방법을 단계별로 안내합니다. 각 항목을 눌러 자세한 내용을 확인하세요.</p>
    </div>

    <div class="manual-grid">

      <div class="manual-card">
        <p class="manual-card__step">STEP 1</p>
        <p class="manual-card__title">회원가입 및 사서함 확인</p>
        <p class="manual-card__desc">가입 후 마이페이지에서 나의 일본 사서함 주소를 확인합니다.</p>
      </div>

      <div class="manual-card">
        <p class="manual-card__step">STEP 2</p>
        <p class="manual-card__title">상품 주문</p>
        <p class="manual-card__desc">일본 쇼핑몰에서 주문할 때 받는 주소를 사서함 주소로 입력합니다.</p>
      </div>

      <div class="manual-card">
        <p class="manual-card__step">STEP 3</p>
        <p class="manual-card__title">배송신청서 작성</p>
        <p class="manual-card__desc">트래킹번호와 상품 정보를 입력해 배송신청서를 작성합니다.</p>
      </div>

      <div class="manual-card">
        <p class="manual-card__step">STEP 4</p>
        <p class="manual-card__title">입고 및 검수</p>
        <p class="manual-card__desc">물류센터 도착 후 입고되며, 선택한 검수 옵션에 따라 처리됩니다.</p>
      </div>

      <div class="manual-card">
        <p class="manual-card__step">STEP 5</p>
        <p class="manual-card__title">배송비 결제</p>
        <p class="manual-card__desc">무게 측정 후 배송비가 확정되면 결제를 진행합니다.</p>
      </div>

      <div class="manual-card">
        <p class="manual-card__step">STEP 6</p>
        <p class="manual-card__title">출고 및 배송</p>
        <p class="manual-card__desc">결제 완료 후 출고되며, 종합현황에서 진행 상태를 확인할 수 있습니다.</p>
      </div>

    </div>

    <h2 class="pane-title">자주 쓰는 메뉴</h2>
    <ul class="link-list">
      <li><a href="info_company.html">KURO Logi 소개</a></li>
      <li><a href="weightchart2.html">국제배송비 안내</a></li>
      <li><a href="info_regulation.html">검수규정, 보상규정</a></li>
      <li><a href="listpass_help.html">목록통관 품목안내</a></li>
      <li><a href="clearance_policy.html">통관불가 품목</a></li>
    </ul>

  </div>
</main>
`;

/* ------------------------------------------------------- 3. 트래킹입력 */

const TRACKING_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>트래킹입력</h1>

    <div class="info-box">
      <p>일본 쇼핑몰에서 발송된 트래킹번호를 등록하면 입고 시 자동으로 매칭됩니다.</p>
      <p>한 번에 여러 건을 등록하려면 <a href="#">엑셀 일괄등록</a>을 이용해 주세요.</p>
    </div>

    <div class="entry-grid">
      <div class="field">
        <label class="field__label" for="trackNo">트래킹번호</label>
        <input class="input" id="trackNo" type="text" placeholder="예: 1234-5678-9012">
      </div>
      <div class="field">
        <label class="field__label" for="trackCarrier">택배사</label>
        <select class="input" id="trackCarrier">
          <option>야마토</option>
          <option>사가와</option>
          <option>Amazon</option>
          <option>우체국</option>
          <option>세이노</option>
          <option>후쿠야마</option>
          <option>라스트원</option>
          <option>메이테츠</option>
        </select>
      </div>
      <div class="field">
        <label class="field__label" for="trackShop">쇼핑몰 사이트</label>
        <input class="input" id="trackShop" type="text" placeholder="예: 라쿠텐">
      </div>
      <div class="field">
        <label class="field__label" for="trackMemo">메모</label>
        <input class="input" id="trackMemo" type="text" placeholder="선택 입력">
      </div>
      <div class="field">
        <label class="field__label">신청서 연결</label>
        <button class="btn btn--sm" type="button">배송신청서 선택</button>
      </div>
      <div class="field">
        <label class="field__label">&nbsp;</label>
        <button class="btn btn--navy" type="button">트래킹 등록</button>
      </div>
    </div>

${toolbar({ selectLabel: '조회', placeholder: '트래킹번호 검색', action: null })}

    <table class="data-table">
      <thead>
        <tr>
          <th class="is-narrow"><input type="checkbox" aria-label="전체 선택"></th>
          <th>트래킹번호</th>
          <th>택배사</th>
          <th>쇼핑몰</th>
          <th>신청서</th>
          <th>상태</th>
          <th>등록일</th>
          <th>선택</th>
        </tr>
      </thead>
      <tbody>
${EMPTY('등록된 트래킹번호가 없습니다.')}
      </tbody>
    </table>

${PAGER}

  </div>
</main>
`;

/* -------------------------------------------------------- 4. 보관현황 */

const STORAGE_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>보관현황</h1>

    <div class="info-box">
      <p>물류센터에 입고된 후 아직 출고되지 않은 화물 목록입니다.</p>
      <p>도착일로부터 <strong>30일</strong>까지 무료 보관되며, 이후에는 보관료가 발생합니다.</p>
    </div>

    <div class="stat-strip">
      <div class="stat-strip__cell">
        <span class="stat-strip__label">보관 중</span>
        <span class="stat-strip__value stat-strip__value--gold">0</span>
      </div>
      <div class="stat-strip__cell">
        <span class="stat-strip__label">무료 보관</span>
        <span class="stat-strip__value stat-strip__value--gold">0</span>
      </div>
      <div class="stat-strip__cell">
        <span class="stat-strip__label">보관료 발생</span>
        <span class="stat-strip__value stat-strip__value--gold">0</span>
      </div>
      <div class="stat-strip__cell">
        <span class="stat-strip__label">장기 보관 (30일 초과)</span>
        <span class="stat-strip__value stat-strip__value--gold">0</span>
      </div>
    </div>

${toolbar({ selectLabel: '조회', placeholder: '상품명 검색', action: '배송신청서 작성' })}

    <table class="data-table">
      <thead>
        <tr>
          <th class="is-narrow"><input type="checkbox" aria-label="전체 선택"></th>
          <th>센터</th>
          <th>상품명</th>
          <th>트래킹번호</th>
          <th>도착일</th>
          <th>보관일수</th>
          <th>보관료</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
${EMPTY('보관 중인 화물이 없습니다.')}
      </tbody>
    </table>

${PAGER}

  </div>
</main>
`;

/* ------------------------------------------------ 5. 재고구매신청등록 */

const STOCK_ORDER_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>재고구매신청등록</h1>

    <div class="info-box">
      <p>재고관리 중인 상품을 구매대행으로 신청합니다. 재고번호를 선택하면 상품 정보가 자동으로 채워집니다.</p>
    </div>

    <h2 class="pane-title">상품 선택</h2>

    <table class="data-table">
      <thead>
        <tr>
          <th class="is-narrow"><input type="checkbox" aria-label="전체 선택"></th>
          <th>재고번호</th>
          <th>상품명</th>
          <th>옵션</th>
          <th>재고수량</th>
          <th>판매가</th>
          <th>선택</th>
        </tr>
      </thead>
      <tbody>
${EMPTY('재고로 등록된 상품이 없습니다.')}
      </tbody>
    </table>

    <h2 class="pane-title">신청 정보</h2>

    <table class="form-table">
      <tbody>
        <tr>
          <th>받는 사람</th>
          <td><input class="input" type="text" aria-label="받는 사람"></td>
          <th>휴대전화</th>
          <td><input class="input" type="tel" aria-label="휴대전화"></td>
        </tr>
        <tr>
          <th>주소</th>
          <td colspan="3">
            <input class="input" type="text" placeholder="우편번호" aria-label="우편번호" style="max-width:180px;margin-bottom:6px">
            <input class="input" type="text" placeholder="주소" aria-label="주소">
            <input class="input" type="text" placeholder="상세주소" aria-label="상세주소" style="margin-top:6px">
          </td>
        </tr>
        <tr>
          <th>배송 요청사항</th>
          <td colspan="3"><input class="input" type="text" aria-label="배송 요청사항"></td>
        </tr>
        <tr>
          <th>신청 수량</th>
          <td><input class="input" type="number" value="1" min="1" aria-label="신청 수량"></td>
          <th>예상 금액</th>
          <td class="is-readonly">₩0</td>
        </tr>
      </tbody>
    </table>

    <div class="btn-row">
      <button class="btn" type="button">취소</button>
      <button class="btn btn--navy" type="button">신청하기</button>
    </div>

  </div>
</main>
`;

/* --------------------------------------------------------- 6. 공지사항 */

const NOTICE_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>공지사항</h1>

${toolbar({ selectLabel: '검색', placeholder: '제목 검색', action: null })}

    <table class="data-table">
      <thead>
        <tr>
          <th class="is-narrow">번호</th>
          <th>제목</th>
          <th>작성자</th>
          <th>등록일</th>
          <th>조회</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="is-center">4</td>
          <td class="is-left"><span class="badge--new">N</span><a href="#">[공지] 클릭 2번으로 끝나는 배송대행신청서 안내</a></td>
          <td class="is-center">관리자</td>
          <td class="is-center">2026-10-01</td>
          <td class="is-center">128</td>
        </tr>
        <tr>
          <td class="is-center">3</td>
          <td class="is-left"><span class="badge--new">N</span><a href="#">[공지] 10월 한국세터 개천절 대체휴무 안내</a></td>
          <td class="is-center">관리자</td>
          <td class="is-center">2026-10-01</td>
          <td class="is-center">96</td>
        </tr>
        <tr>
          <td class="is-center">2</td>
          <td class="is-left"><a href="#">[공지] 일본 현지 반품 관련 안내</a></td>
          <td class="is-center">관리자</td>
          <td class="is-center">2026-09-23</td>
          <td class="is-center">74</td>
        </tr>
        <tr>
          <td class="is-center">1</td>
          <td class="is-left"><a href="#">[공지] 일본 야마토 주소 및 휴일 설정 관련</a></td>
          <td class="is-center">관리자</td>
          <td class="is-center">2026-09-23</td>
          <td class="is-center">61</td>
        </tr>
      </tbody>
    </table>

${PAGER}

  </div>
</main>
`;

/* --------------------------------------------------------- 7. 1:1게시판 */

const QNA_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>1:1게시판</h1>

    <div class="info-box">
      <p>주문·입고·배송 관련 문의를 남겨 주세요. 영업일 기준 1일 이내에 답변드립니다.</p>
    </div>

${toolbar({ selectLabel: '검색', placeholder: '제목 검색', action: '문의하기' })}

    <table class="data-table">
      <thead>
        <tr>
          <th class="is-narrow">번호</th>
          <th>제목</th>
          <th>상태</th>
          <th>등록일</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="is-center">1</td>
          <td class="is-left"><a href="#">발송 보류 요청드립니다</a></td>
          <td class="is-center"><span class="state state--done">답변완료</span></td>
          <td class="is-center">2026-09-28</td>
        </tr>
      </tbody>
    </table>

${PAGER}

  </div>
</main>
`;

/* -------------------------------------------------------- 8. 알림메세지 */

const MESSAGE_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>알림메세지</h1>

    <div class="info-box">
      <p>입고·출고·배송 상태 변경 시 발송된 알림 내역입니다.</p>
    </div>

${toolbar({ selectLabel: '구분', placeholder: '내용 검색', action: null })}

    <table class="data-table">
      <thead>
        <tr>
          <th class="is-narrow"><input type="checkbox" aria-label="전체 선택"></th>
          <th>구분</th>
          <th>내용</th>
          <th>발송일시</th>
          <th>확인</th>
        </tr>
      </thead>
      <tbody>
${EMPTY('수신한 알림메세지가 없습니다.')}
      </tbody>
    </table>

${PAGER}

  </div>
</main>
`;

/* ------------------------------------------------------ 9. 특가제품안내 */

const DEALS_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>특가제품안내</h1>

    <div class="info-box">
      <p>구매대행 셀러를 위한 인기 일본 제품을 특가로 제안합니다.</p>
    </div>

    <div class="deal-grid">

      <div class="deal-card">
        <div class="deal-card__thumb" aria-hidden="true">🖼</div>
        <p class="deal-card__name">상품명 예시</p>
        <p class="deal-card__price">¥0</p>
        <p class="deal-card__meta">최소 주문 수량 1</p>
        <button class="btn btn--sm" type="button">문의하기</button>
      </div>

      <div class="deal-card">
        <div class="deal-card__thumb" aria-hidden="true">🖼</div>
        <p class="deal-card__name">상품명 예시</p>
        <p class="deal-card__price">¥0</p>
        <p class="deal-card__meta">최소 주문 수량 1</p>
        <button class="btn btn--sm" type="button">문의하기</button>
      </div>

      <div class="deal-card">
        <div class="deal-card__thumb" aria-hidden="true">🖼</div>
        <p class="deal-card__name">상품명 예시</p>
        <p class="deal-card__price">¥0</p>
        <p class="deal-card__meta">최소 주문 수량 1</p>
        <button class="btn btn--sm" type="button">문의하기</button>
      </div>

      <div class="deal-card">
        <div class="deal-card__thumb" aria-hidden="true">🖼</div>
        <p class="deal-card__name">상품명 예시</p>
        <p class="deal-card__price">¥0</p>
        <p class="deal-card__meta">최소 주문 수량 1</p>
        <button class="btn btn--sm" type="button">문의하기</button>
      </div>

    </div>

${PAGER}

  </div>
</main>
`;

/* ------------------------------------------------------ 10. 자주묻는 질문 */

const FAQ_ITEMS = [
  ['회원/기타', [
    ['회원가입은 어떻게 하나요?', '홈페이지 회원가입에서 이메일과 비밀번호를 입력하시면 됩니다.'],
    ['회원정보는 어떻게 변경하나요?', '마이페이지 > 계정관리에서 변경하실 수 있습니다.'],
    ['회원탈퇴는 어떻게 하나요?', '마이페이지 > 계정관리 하단의 탈퇴하기 버튼을 이용해 주세요.'],
  ]],
  ['배송신청서', [
    ['배송신청서는 언제 작성하나요?', '일본 쇼핑몰에서 발송된 후 트래킹번호를 확인하여 작성합니다.'],
    ['개인통관부호는 어디에 입력하나요?', '배송신청서의 받는 사람 정보에 입력합니다.'],
    ['트래킹번호를 추가하려면?', '트래킹입력 메뉴에서 추가하실 수 있습니다.'],
  ]],
  ['입고/출고', [
    ['입고까지 얼마나 걸리나요?', '일본 내 발송 후 보통 1~3일 내에 물류센터에 도착합니다.'],
    ['미도착 건은 어떻게 확인하나요?', '종합현황의 노데이터 확인 메뉴에서 확인하실 수 있습니다.'],
    ['출고 후 국내 배송은?', '항공은 2~4일, 해상은 7~14일 정도 소요됩니다.'],
  ]],
  ['배송비', [
    ['배송비는 어떻게 계산되나요?', '실무게와 부피무게 중 큰 값으로 계산됩니다.'],
    ['무게 측정은 언제 하나요?', '물류센터 입고 후 측정되며, 측정 완료 시 결제 요청됩니다.'],
    ['묶음배송과 분할배송 차이는?', '여러 건을 하나로 합쳐 보내는 것과 나누어 보내는 것의 차이입니다.'],
  ]],
];

const FAQ_BODY = `
<main class="page-body">
  <div class="container">

    <h1 class="sub-title"><span class="sub-title__dash"></span>자주묻는 질문</h1>

    <div class="info-box">
      <p>아래 항목을 누르시면 답변이 펼쳐집니다. 원하는 답을 찾지 못하셨다면 1:1게시판을 이용해 주세요.</p>
    </div>

    <table class="faq-table">
      <tbody>
${FAQ_ITEMS.map(([group, items]) => `        <tr>
          <th>${group}</th>
          <td>
            <ul>
${items.map(([q]) => `              <li><a href="#">${q}</a></li>`).join('\n')}
            </ul>
          </td>
        </tr>`).join('\n')}
      </tbody>
    </table>

    <div class="btn-row">
      <a class="btn btn--navy" href="qna.html">1:1 문의하기</a>
    </div>

  </div>
</main>
`;

/* ------------------------------------------------------------------ CSS */

// Shared by the list-style pages (toolbar + data table + pager).
const LIST_CSS = `
/* ============================================================
   목록형 페이지 공통 (툴바 · 표 · 페이지번호)
   ============================================================ */

.sub-title {
  margin: 0 0 24px;
  font-size: 28px;
  font-weight: 700;
  color: var(--ink);
}

.sub-title__dash {
  display: inline-block;
  width: 26px;
  height: 3px;
  margin-right: 10px;
  vertical-align: middle;
  background: var(--ink);
}

.pane-title {
  margin: 30px 0 12px;
  padding-left: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  border-left: 4px solid var(--orange);
}

/* 툴바 */
.pane-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 14px 16px;
  background: #f3f3f3;
  border: 1px solid var(--line);
}

.pane-toolbar__label { font-size: 14px; font-weight: 700; color: var(--ink); }

.pane-toolbar__select,
.pane-toolbar__input {
  padding: 8px 10px;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  background: #fff;
  border: 1px solid var(--line);
}

.pane-toolbar__select { width: 110px; }
.pane-toolbar__input { flex: 1 1 auto; max-width: 320px; }
.pane-toolbar__select:focus,
.pane-toolbar__input:focus { outline: none; border-color: var(--teal); }

.pane-toolbar__search {
  padding: 8px 12px;
  font-size: 14px;
  color: #fff;
  background: #b9b9b9;
  border: 0;
  cursor: pointer;
}
.pane-toolbar__search:hover { background: #a5a5a5; }

.pane-toolbar__action {
  margin-left: auto;
  padding: 10px 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: var(--orange);
  border: 0;
  border-radius: var(--radius);
  cursor: pointer;
}
.pane-toolbar__action:hover { background: #e06400; }

/* 표 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 2px solid var(--ink);
  margin-bottom: 20px;
}

.data-table th,
.data-table td {
  padding: 13px 10px;
  font-size: 13px;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}

.data-table thead th {
  font-weight: 700;
  text-align: center;
  background: #f3f3f3;
}

.data-table__empty { padding: 34px 10px; text-align: center; color: var(--muted); }
.data-table .is-narrow { width: 60px; text-align: center; }
.data-table .is-center { text-align: center; }
.data-table .is-left { text-align: left; }

.badge--new {
  display: inline-block;
  margin-right: 6px;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: var(--orange);
  border-radius: 2px;
}

.state {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 999px;
}
.state--done { color: var(--orange); border: 1px solid var(--orange); }

/* 페이지 번호 / 버튼 / 입력 / 안내 */
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

.btn {
  display: inline-block;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 13px;
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
.btn--sm { padding: 8px 14px; font-size: 12px; }

.btn-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}

.input,
.select-like {
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

.info-box {
  margin: 0 0 22px;
  padding: 16px 18px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--body);
  background: #f7fbfb;
  border: 1px solid #d9ecec;
  border-radius: var(--radius);
}
.info-box p { margin: 4px 0; }
.info-box p:first-child { margin-top: 0; }
.info-box p:last-child { margin-bottom: 0; }

.note-list { margin: 0; padding: 0; list-style: none; }
.note-list li {
  padding: 4px 0 4px 12px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--body);
  text-indent: -12px;
}
.note-list li::before { content: '* '; color: var(--red); }

.form-table {
  width: 100%;
  margin-bottom: 24px;
  border-collapse: collapse;
}
.form-table th,
.form-table td {
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid var(--line);
  vertical-align: middle;
}
.form-table th {
  width: 15%;
  font-weight: 700;
  color: var(--ink);
  text-align: left;
  background: var(--fill);
}
.form-table td.is-readonly { color: var(--ink); }
`;

// Extra rules only some pages need.
const CLEARANCE_EXTRA = `
.clearance-none { display: none; }
`;

const MANUAL_EXTRA = `
.manual-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.manual-card {
  padding: 20px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.manual-card__step {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--orange);
}

.manual-card__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.manual-card__desc { margin: 0; font-size: 13px; line-height: 1.8; color: var(--body); }

.link-list { margin: 0; padding: 0; list-style: none; }
.link-list li { padding: 8px 0; border-bottom: 1px dashed var(--line); }
.link-list li:last-child { border-bottom: 0; }
.link-list a { font-size: 14px; }
`;

const TRACKING_EXTRA = `
.entry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 16px;
  margin-bottom: 26px;
  padding: 20px;
  background: var(--fill);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.field__label { display: block; margin-bottom: 4px; font-size: 12px; color: var(--muted); }
`;

const STORAGE_EXTRA = `
.stat-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 22px;
  background: #464b5c;
  border-radius: var(--radius);
  overflow: hidden;
}

.stat-strip__cell {
  padding: 16px 10px;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, .12);
}
.stat-strip__cell:last-child { border-right: 0; }
.stat-strip__label { display: block; font-size: 13px; color: #fff; }
.stat-strip__value { display: block; margin-top: 6px; font-size: 15px; font-weight: 700; color: #fff; }
.stat-strip__value--gold { color: #e8c341; }
`;

const DEALS_EXTRA = `
.deal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.deal-card {
  padding: 16px;
  text-align: center;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.deal-card__thumb {
  height: 140px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  font-size: 34px;
  color: #c9c9c9;
  background: var(--fill);
}

.deal-card__name { margin: 0 0 6px; font-size: 14px; color: var(--ink); }
.deal-card__price { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: var(--orange); }
.deal-card__meta { margin: 0 0 12px; font-size: 12px; color: var(--muted); }
`;

const FAQ_EXTRA = `
.faq-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
.faq-table th,
.faq-table td {
  padding: 14px;
  font-size: 13px;
  text-align: left;
  vertical-align: top;
  border: 1px solid var(--line);
}
.faq-table th {
  width: 140px;
  font-weight: 700;
  color: var(--ink);
  text-align: center;
  background: #f3f3f3;
}
.faq-table ul { margin: 0; padding: 0; list-style: none; }
.faq-table li { padding: 5px 0 5px 12px; text-indent: -12px; color: var(--body); }
.faq-table li::before { content: '› '; color: var(--orange); }
`;

/* -------------------------------------------------------------------- build */

const PAGES = [
  { dir: '서비스안내', file: 'clearance_policy.html', css: 'clearance-policy.css',
    title: '통관불가 품목', crumb: { label: '서비스안내', href: 'info_company.html' },
    body: CLEARANCE_BODY, own: LIST_CSS + CLEARANCE_EXTRA },

  { dir: '서비스안내', file: 'manual.html', css: 'manual.css',
    title: 'KURO 사용메뉴얼', crumb: { label: '서비스안내', href: 'info_company.html' },
    body: MANUAL_BODY, own: LIST_CSS + MANUAL_EXTRA },

  { dir: '종합현황', file: 'tracking.html', css: 'tracking.css',
    title: '트래킹입력', crumb: { label: '종합현황', href: 'dashboard.html' },
    body: TRACKING_BODY, own: LIST_CSS + TRACKING_EXTRA },

  { dir: '종합현황', file: 'storage.html', css: 'storage.css',
    title: '보관현황', crumb: { label: '종합현황', href: 'dashboard.html' },
    body: STORAGE_BODY, own: LIST_CSS + STORAGE_EXTRA },

  { dir: '구매대행', file: 'stock_order.html', css: 'stock-order.css',
    title: '재고구매신청등록', crumb: { label: '구매대행', href: 'order_form.html' },
    body: STOCK_ORDER_BODY, own: LIST_CSS },

  { dir: '커뮤니티', file: 'notice.html', css: 'notice.css',
    title: '공지사항', crumb: { label: '커뮤니티', href: 'notice.html' },
    body: NOTICE_BODY, own: LIST_CSS },

  { dir: '커뮤니티', file: 'qna.html', css: 'qna.css',
    title: '1:1게시판', crumb: { label: '커뮤니티', href: 'notice.html' },
    body: QNA_BODY, own: LIST_CSS },

  { dir: '커뮤니티', file: 'message.html', css: 'message.css',
    title: '알림메세지', crumb: { label: '커뮤니티', href: 'notice.html' },
    body: MESSAGE_BODY, own: LIST_CSS },

  { dir: '커뮤니티', file: 'deals.html', css: 'deals.css',
    title: '특가제품안내', crumb: { label: '커뮤니티', href: 'notice.html' },
    body: DEALS_BODY, own: LIST_CSS + DEALS_EXTRA },

  { dir: '커뮤니티', file: 'faq.html', css: 'faq.css',
    title: '자주묻는 질문', crumb: { label: '커뮤니티', href: 'notice.html' },
    body: FAQ_BODY, own: LIST_CSS + FAQ_EXTRA },
];

for (const p of PAGES) {
  if (!existsSync(p.dir)) mkdirSync(p.dir, { recursive: true });
  const r = writePage({ ...p, depth: 1 });
  console.log(`${(p.dir + '/' + p.file).padEnd(36)} ${p.title.padEnd(14)} html ${String(r.html).padStart(6)}  css ${String(r.css).padStart(6)}`);
}
console.log('\n' + PAGES.length + ' pages built');
