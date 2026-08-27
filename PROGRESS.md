# 프로젝트 진행 기록

마지막 확인일: 2026-08-27

이 문서는 현재 프로젝트의 구조, 구현된 기능, 아직 수정할 부분과 앞으로의 방향을 기록한다.

## 작업 원칙

- 사용자는 JavaScript를 배우는 중이므로 코드를 한 번에 갈아엎지 않는다.
- 기존 코드와 함수 구조를 최대한 유지한다.
- 수정이 필요하면 무엇을 추가·변경·삭제하는지와 그 이유를 차근차근 설명한다.
- 사용자가 명시적으로 요청하지 않는 한 Codex가 파일을 직접 수정하지 않는다.
- 임의로 요구사항을 추가하지 않는다. 특히 랜덤 단어는 중복 선택을 허용한다.

## 현재 파일 구조

- `index.html`: 이벤트 원본, 실제 이벤트 출력 영역, 테스트용 긴 페이지, 스크립트 연결
- `style.css`: 편지, 입력 영역, 배경, 모바일 레이아웃, 흩어진 단어 스타일
- `script.js`: 자동 스크롤, 랜덤 이벤트 복제, 편지 열기·쓰기, 글자 애니메이션, 랜덤 단어 생성
- `use_image/`: 편지와 배경에 사용하는 이미지 및 SVG

## 현재 구현된 기능

### 자동 스크롤

- `setInterval(autoScroll, 25)`로 페이지가 자동으로 아래로 이동한다.
- `stopScroll()`은 현재 자동 스크롤 타이머를 정지한다.
- `scrollAgain()`은 기존 타이머를 정리한 뒤 자동 스크롤을 다시 시작한다.
- 편지 이벤트의 바깥 요소를 클릭하면 인라인 `onclick="stopScroll()"`이 실행된다.
- 테스트 debris를 클릭하면 `scrollAgain()`이 실행된다.

### 랜덤 이벤트 구조

- `#eventSources` 안에는 화면에 바로 표시하지 않는 원본 `.eventTemplate`이 있다.
- 현재 이벤트 원본은 `.letterTemplate` 하나다.
- `randomEvent()`가 원본 중 하나를 랜덤으로 선택하고 `cloneNode(true)`로 복제한다.
- 복제된 이벤트는 `.eventArea`에 추가된다.
- 앞으로 다른 종류의 `.eventTemplate`을 `#eventSources`에 추가할 수 있다.
- 언제 다음 랜덤 이벤트를 호출할지는 아직 결정하지 않았다.

### 편지 이벤트

- `.clipImage`를 클릭하면 해당 편지의 클립과 기존 이미지가 사라지고 `.letterPaper`가 열린다.
- 이벤트 위임을 사용하므로 나중에 복제된 편지의 버튼과 이미지도 클릭할 수 있다.
- `.letterButton`을 누르면 같은 `.letterTemplate` 안의 입력값을 찾는다.
- 입력한 글은 같은 편지 안의 `.writtenLetter`에 표시된다.
- `.writtenLetter`는 여러 편지를 지원하기 위해 ID가 아닌 클래스다.
- 새 편지 이벤트는 숨겨진 원본을 복제하므로 처음에는 깨끗한 상태로 생성된다.

### 편지 글자 애니메이션

- Anime.js 2.0.2가 HTML에서 먼저 로드되고 그다음 `script.js`가 로드된다.
- `animateWrittenLetter()`가 입력 문자열의 공백이 아닌 각 글자를 `.moji` span으로 만든다.
- 각 글자가 순서대로 투명도 0에서 1로 나타난다.
- `loop: false`이므로 한 번 실행하고 마지막 글자가 남는다.
- Write 버튼을 다시 누르면 기존 내용을 비우고 새 입력값으로 애니메이션을 다시 실행한다.

### 반응형 편지 화면

- `.letterTemplate`은 `width: 100%`, `max-width: 600px`이며 좌우 자동 margin으로 데스크톱에서 중앙에 놓인다.
- 모바일 미디어 쿼리에서는 `.letterPaper`가 `90vw`를 사용한다.
- `.writtenLetter`는 모바일에서 `width: auto`와 더 작은 `font-size: 14px`를 사용한다.
- `box-sizing: border-box`가 전체 요소에 적용되어 padding과 border가 지정 너비에 포함된다.
- `#testdebris`는 모바일에서 `left` 대신 `right: 0`을 사용한다.

### 배경

- `body::before`에 노이즈 SVG와 움직이는 그라디언트를 겹쳐 사용한다.
- 가상 요소는 `position: fixed`로 화면을 덮고 `z-index: -1`로 콘텐츠 뒤에 놓인다.
- `body`의 `position: relative`와 `isolation: isolate`가 배경 레이어의 기준과 쌓임 맥락을 만든다.

### 랜덤 단어 기능의 현재 상태

- HTML에 `.wordsField`가 있다.
- CSS에 `.scatteredWord`가 있다.
- `createDiv(count)` 함수가 `setTimeout()`을 이용해 단어를 시간차로 생성한다.
- `appearDelay`는 현재 500ms다.
- `.eventArea .writtenLetter`에서 현재 작성된 편지 내용을 가져온다.
- `split(/\s+/)`으로 문장을 단어 배열로 나눈다.
- `Math.floor(Math.random() * words.length)`로 랜덤 배열 번호를 만든다.
- `words[randomIndex]`로 단어를 읽으므로 같은 단어가 여러 번 선택될 수 있다.
- 새 단어는 현재 viewport 안의 랜덤 좌표에서 생성된다.
- 좌표에 `window.scrollX`, `window.scrollY`를 더하므로 생성된 단어는 현재 화면을 따라다니지 않고 생성 당시의 문서 위치에 남는다.
- `.wordsField`는 `position: absolute`이므로 `fixed` 레이어처럼 스크롤을 따라오지 않는다.
- 현재 `createDiv()`는 다른 이벤트에 연결되지 않았다. 테스트할 때 콘솔에서 호출한다.

## 현재 코드에서 아직 수정해야 할 부분

아래 내용은 확인 당시 코드에 아직 반영되지 않았다.

### 1. HTML 주석 닫기

현재:

```html
<!--다른 div들->
```

수정 필요:

```html
<!--다른 div들-->
```

닫는 하이픈이 하나 부족하다. 이 오류 때문에 아래쪽 HTML이 주석으로 잘못 해석될 수 있다.

### 2. 여러 편지 사이에 공백 넣기

현재:

```js
.join("")
```

수정 필요:

```js
.join(" ")
```

공백이 없으면 한 편지의 마지막 단어와 다음 편지의 첫 단어가 붙는다.

### 3. 빈 문장부터 검사하기

현재는 `split()`을 먼저 실행한 뒤 빈 문장을 검사한다. 다음 순서가 더 정확하다.

```js
if (sentence === "") {
    return;
}

const words = sentence.split(/\s+/);
```

### 4. 랜덤 단어 생성 개수

현재:

```js
const wordCount = Math.min(count, 30, words.length);
```

의도에 맞는 코드:

```js
const wordCount = Math.min(count, 10);
```

목표는 최대 10개이며 중복 선택을 허용한다. 따라서 `words.length`로 반복 횟수를 제한할 필요가 없다.

### 5. 계산한 안전 좌표 사용하기

현재 `xMax`, `yMax`를 계산하지만 실제 랜덤 좌표에서는 같은 식을 다시 직접 사용한다. 다음처럼 계산된 값을 사용해야 한다.

```js
const x = window.scrollX + randomNumber(0, xMax);
const y = window.scrollY + randomNumber(0, yMax);
```

이렇게 해야 긴 단어 때문에 최대 좌표가 음수가 되는 경우를 방지할 수 있다.

### 6. 사용하지 않는 값 정리

현재 아래 값은 이후 코드에서 사용되지 않는다.

```js
const fieldRect = field.getBoundingClientRect();
const xMin = 0;
const yMin = 0;
```

오류를 만들지는 않지만 필요 없으므로 나중에 삭제할 수 있다.

## 랜덤 단어 기능 테스트 순서

1. 페이지에서 편지를 연다.
2. 단어가 포함된 글을 입력한다.
3. Write 버튼을 눌러 `.writtenLetter`에 글을 표시한다.
4. 개발자 도구 콘솔에서 다음을 실행한다.

```js
createDiv(10);
```

5. 최대 10개의 단어가 500ms 간격으로 나타나는지 확인한다.
6. 스크롤할 때 이미 생성된 단어가 viewport를 따라오지 않고 원래 문서 위치에 남는지 확인한다.
7. 모바일에서 단어가 가로 스크롤을 만들거나 화면 밖으로 빠져나가지 않는지 확인한다.

## 아직 결정하지 않은 것

- `createDiv(10)`을 어느 이벤트와 시점에 연결할지
- 다음 `randomEvent()`를 언제 호출할지
- 이미 표시된 단어를 언제 제거할지 또는 계속 누적할지
- 작성한 편지를 새로고침 후에도 보존할지
- 필요하다면 `localStorage` 등 별도의 영구 저장 방식을 사용할지
- 다른 종류의 이벤트 템플릿을 어떤 구조로 추가할지

## 데이터 저장 상태

- 플레이어가 작성한 글은 현재 DOM의 각 `.writtenLetter` 안에 있다.
- 여러 편지가 존재할 때 각 편지는 자신의 `.writtenLetter`를 가진다.
- 현재 페이지가 살아 있는 동안에는 `textContent`로 글을 다시 가져올 수 있다.
- 새로고침하거나 해당 편지 요소를 삭제하면 글도 사라진다.
- 아직 `localStorage`, 서버 또는 데이터베이스에는 저장하지 않는다.

