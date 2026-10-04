# 서비스안내 — 5개 안내 페이지

KURO Logi 홈페이지와 같은 디자인으로 만든 내부 페이지 5개입니다.
**순수 CSS**이고 Bootstrap 클래스는 쓰지 않았습니다.

## 파일

| HTML | CSS | 페이지 |
|---|---|---|
| `info_company.html` | `info-company.css` | KURO Logi 소개 |
| `info_grade.html` | `info-grade.css` | 회원등급, 수수료 안내 |
| `weightchart2.html` | `weightchart2.css` | 국제배송비 안내 |
| `info_regulation.html` | `info-regulation.css` | 검수규정, 보상규정 |
| `listpass_help.html` | `listpass-help.css` | 목록통관 품목안내 |

`_base.css` 는 공통 부분을 모아 둔 **참고용 원본**입니다. 요청하신 대로 CSS를
페이지마다 따로 두기 위해, 각 CSS 파일 안에 이 내용이 그대로 들어가 있습니다.
(`_base.css` 자체는 페이지에서 불러오지 않습니다. 공통 부분을 고칠 때
이 파일을 기준으로 삼고 5개 파일에 복사하시면 됩니다.)

`index.html` 을 브라우저로 열면 됩니다. 빌드 과정이나 설치할 패키지가 없습니다.

## 구조

모든 페이지가 홈페이지와 같은 뼈대를 씁니다:

```
상단 바 (홈 / 즐겨찾기 / 1:1게시판 / 언어 / 카톡 / 로그인)
청록 헤더 + 주 메뉴   ← 서비스안내 메뉴에 하위 5개 페이지 연결
페이지 제목 띠 (#f6f6f6) + 오른쪽 현재 위치
본문
푸터
```

## 디자인 값

원본 사이트에서 계산된 스타일을 측정해 그대로 옮겼습니다.

| 요소 | 값 |
|---|---|
| 페이지 제목 띠 | 배경 `#f6f6f6`, `padding: 15px 0 13px`, 아래 1px `#EEE` |
| 제목 | 22px, `#333`, `letter-spacing: -2px` |
| 현재 위치 | 오른쪽 정렬, 13px, 구분자 `/` |
| 본문 소제목 | 왼쪽 청록 세로 막대, 18~20px |
| 표 (`.data-table`) | 위쪽 `2px solid #107976`, 칸마다 `1px solid #ddd` |
| 표 머리글 | 13px, `padding: 12px 7px`, 배경 `#f4fafa` |
| 표 본문 | 13px, `padding: 12px 7px`, 배경 `#fff` |

색과 폭은 각 CSS 파일 맨 위 `:root` 한 곳에서 바꿉니다.

## 클래스 이름

BEM 방식 `블록__요소--변형` 으로 통일했습니다.

| 클래스 | 용도 |
|---|---|
| `page-head`, `page-head__title` | 제목 띠 |
| `breadcrumb`, `breadcrumb__item` | 현재 위치 |
| `data-table` | 기본 표 (`--vertical` 변형) |
| `grade-table`, `rate-table`, `regulation-table`, `listpass-table`, `company-table` | 페이지별 표 |
| `note-block` | 회색 안내 박스 |
| `alert` | 빨간 주의 박스 |
| `link-btn` | 링크형 버튼 (`--active` = 선택됨) |
| `is-bold`, `is-red`, `is-mint` | 글자 강조 |

## 내용에 대해

**본문 내용은 원본 페이지에서 그대로 가져왔습니다** — 표, 수치, 요율, 이미지.
손으로 다시 옮겨 적으면 오타나 숫자 오류가 날 수 있어, 자동 변환 도구
(`tools/build-pages.mjs`)로 원본을 변환했습니다.

변환 과정에서 한 일:

1. 본문 영역만 추출 (숨겨진 팝업, 모달, 스크립트 제거)
2. Bootstrap 클래스 → 이 프로젝트의 클래스로 이름 변경
3. 이미지 경로를 `../images/` 로 변경, 캐시 방지용 `?id=2` 제거
4. `javascript:` 링크와 외부 서버 링크(`/help/*.asp`)를 `#` 또는 실제 페이지로 변경
5. **원본의 잘못된 태그를 정리** (아래 참고)

### 원본 HTML의 오류를 고쳤습니다

원본 페이지는 HTML이 올바르게 닫히지 않았습니다:

- `info_grade` — `</tr>` 이 `<tr>` 보다 1개 많음
- `info_regulation` — `</div>` 이 `<div>` 보다 1개 많음
- 여러 페이지에 대문자 태그(`<TR>`, `<TD>`) 혼용

브라우저가 자동으로 고쳐 주기 때문에 원본에서도 화면은 정상으로 보이지만,
그대로 옮기면 코드가 지저분해집니다. 그래서 짝이 맞지 않는 닫는 태그를
제거하고 태그 이름을 소문자로 통일했습니다. 결과적으로 5개 페이지 모두
모든 태그의 짝이 맞습니다.

## 확인한 것

- 5개 페이지 모두 렌더링 확인 (1440px 캡처)
- 태그 짝 검사 통과 — `div`, `table`, `tr`, `td`, `th`, `ul`, `li`, `p`, `span` 등 전부 일치
- 대문자 태그 0개
- CSS 6개 파일 모두 중괄호 균형
- 로컬 경로 125개 전부 존재, 없는 파일 0개 (헤더·푸터·로고·카톡·표 아이콘 포함)

## 확인하지 못한 것

- **표의 세부 열 너비**는 원본과 100% 같지 않을 수 있습니다. 값은 내용에 따라
  브라우저가 정하도록 두었습니다.
- 요율표(`weightchart2`)는 62줄 × 4열로, 원본과 같은 값을 같은 순서로 넣었지만
  셀 하나하나 대조하지는 않았습니다.
- 원본은 페이지마다 회원 등급에 따라 요율을 다르게 보여주는 서버 로직이 있습니다.
  여기서는 **기본(항공-도쿄, 베이직 요율)** 화면만 정적으로 넣었습니다.
- `info_company` 의 소개 이미지는 원본 그대로입니다(3.7MB). 그대로 올리면
  느릴 수 있으니 필요하면 압축하세요.

## 이미지

`images/` 에 새로 받은 파일:

| 파일 | 쓰이는 곳 |
|---|---|
| `help/kuro_info.jpg` | 소개 페이지 상단 그림 |
| `help/weightinfo.png` | 부피무게 계산 안내 |
| `help/regulation_guide.png` | 검수규정 안내 |
| `common/air_icon_red.*`, `ship_icon_red.png`, `JP_Sea.png`, `JP_Sea2.png` | 표 안 센터 아이콘 |
| `grade/basic.png`, `partner.png`, `family.png`, `royal_family.png` | 등급 마크 |
| `ilnoir.pdf` | 안내 PDF |

원본에서 받은 CSS(`.ref/`)와 HTML은 참고용입니다. 필요 없으면 지우셔도 됩니다.

## 주의

주소, 요율, 수수료, 계좌 등은 **실제 서비스의 값**입니다. 공개하기 전에
본인 내용으로 바꾸세요.
