# Bird / Cloud 이벤트 작업 메모

마지막 정리: 2026-09-16. 이 문서는 다른 컴퓨터에서 작업을 이어가기 위한 메모다. bird/cloud 템플릿과 애니메이션 코드는 현재 작성 중이며, 실제 동작 검증은 아직 하지 않았다.

## 확정된 동작

- 일반 랜덤 이벤트가 **두 개** 나온 뒤, **세 번째에는 반드시** bird/cloud 이벤트가 한 번 나온다. 이후 `일반 → 일반 → bird/cloud` 순서를 반복한다.
- 세 번째 이벤트에서 bird와 cloud **둘 중 하나를 랜덤으로 선택**한다. “두 버전”은 bird 궤적 두 개가 아니라 **bird 버전과 cloud 버전**을 뜻한다.
- bird/cloud 이벤트는 높이 약 **600px**인 div다. 클릭, 버튼, 스크롤 정지 같은 상호작용은 없다.
- bird는 `use_image/bird.png`를 사용한다. 이동과 회전이 모두 매끄럽지 않고, 일정한 간격으로 **뚝뚝 바뀌는** 느낌이어야 한다.
- cloud는 `use_image/sky2.png`를 사용한다. 등장할 때 높이를 하나 랜덤으로 정한 뒤 **왼쪽에서 오른쪽으로 수평 이동**하며 회전하지 않는다.
- bird는 **왼쪽 상단에서 출발해 오른쪽 하단에 도착**한다. 중간 경유점의 세로 위치와 회전각은 등장할 때마다 랜덤이다.
- bird와 cloud 모두 끊겨 움직이며, 한 이벤트 안에서는 만들어진 경로를 반복한다. 반복 끝에서 출발점으로 뚝 돌아간다.
- 새 bird/cloud 이벤트가 등장할 때마다 **새 랜덤 궤적**을 만든다. 하나의 고정된 궤적 두 개를 반복해서 고르는 방식은 아니다.
- bird는 가로로 진행하면서 중간 세로 위치가 조금씩 랜덤하게 달라진다. cloud의 세로 위치는 한 이벤트 안에서 일정하다. 이미지가 div 밖으로 나가지 않도록 이동 범위를 제한한다.

## 권장 구현 방식

**HTML `<img>` + CSS 배치 + 작은 JavaScript 애니메이션**이 현재 요구에 가장 간결하다. `<canvas>`는 쓰지 않는다. 여기서는 이미지를 계속 지우고 다시 그릴 필요가 없기 때문이다.

- HTML에는 `.eventTemplate`이 붙은 **공통 bird/cloud 템플릿 하나**만 둔다. 안에는 `<img>` 하나만 둔다. 별도의 bird 템플릿과 cloud 템플릿을 만들지 않는다.
- CSS는 이벤트 div의 `height: 600px`, 반응형 너비, `position: relative`, 이미지의 `position: absolute`, 필요하면 `overflow: hidden`을 맡는다.
- JS는 세 번째 이벤트에서 이미지 종류를 고르고, 해당 이벤트의 랜덤 경유점 여러 개를 만든다.
- `image.animate(keyframes, options)`로 그 이미지에 경유점들을 한 번 전달한다. 매 프레임 캔버스를 다시 그리는 타이머는 필요 없다.
- bird는 위치와 회전각을 같은 경유점에서 바꾸고, 애니메이션의 `easing`을 `steps(1, end)` 또는 `step-end`로 주어 각 구간에서 뚝 이동하게 한다.
- cloud는 처음 정한 높이를 유지하면서 가로 위치만 바꾼다. `steps(1, end)`로 끊겨 움직이고 회전하지 않는다.
- 두 종류 모두 `iterations: Infinity`로 같은 경로를 반복한다. 새 랜덤 경로는 새 bird/cloud 이벤트가 생성될 때 만든다.

순수 CSS의 고정 `@keyframes`만 쓰면 매번 **새로운** 랜덤 경로를 만들기 어렵다. CSS `random()`은 존재하지만 브라우저 지원이 제한적이므로, 이 프로젝트에서는 JS가 경로를 만들고 브라우저의 애니메이션 기능으로 움직이는 쪽을 추천한다.

참고: [Element.animate()](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate), [`steps()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/steps), [CSS `random()` 지원](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/random).

## 현재 코드에서 이어 붙일 위치

1. `index.html`: 숨겨진 `#eventSources` 안에서 현재 `.canvasGrid`가 끝난 뒤, `#eventSources`를 닫는 `</div>` **바로 앞**에 공통 bird/cloud 이벤트 템플릿을 추가한다. 템플릿에 `.eventTemplate`을 붙여야 기존 `eventSources` 목록에 포함된다. `onclick="stopScroll()"`은 붙이지 않는다.
2. `style.css`: 기존 이벤트 그리드 CSS 근처에 600px 높이의 공통 이벤트와 그 안의 이미지 스타일을 추가한다. 모바일에서 고정 너비 때문에 화면 밖으로 나가지 않게 너비를 반응형으로 잡는다.
3. `script.js`: `eventSources` 선언 근처에 공통 이벤트 원본과 `일반 이벤트가 몇 개 나왔는지` 세는 변수를 둔다.
4. `randomEvent()`의 `availableEventSources` 필터에서는 bird/cloud 공통 템플릿을 **일반 랜덤 후보에서 제외**한다. 그렇지 않으면 세 번째 차례가 아닌데도 랜덤으로 등장할 수 있다.
5. `randomEvent()`에서 `selectedSource`를 고르는 부분만 조정한다. 일반 이벤트 카운터가 `0` 또는 `1`이면 기존 후보 중 하나를 고르고 카운터를 올린다. `2`이면 공통 bird/cloud 템플릿을 강제로 고르고 카운터를 `0`으로 돌린다. 선택한 템플릿을 복제하여 `.eventArea`에 붙이는 기존 코드는 공유한다.
6. 복제한 `newEvent`를 `.eventArea`에 추가한 **직후**, 그 이벤트 안에 공통 이미지가 있을 때만 bird/cloud 종류와 랜덤 경로를 선택하고 애니메이션을 시작한다. 기존 퍼즐·그림 그리기 처리 코드는 건드리지 않는다.

현재 `script.js` 맨 아래에는 페이지 로드 시 `randomEvent()`를 한 번 호출한다. 별도 변경이 없으면 **그 첫 이벤트도 일반 이벤트 한 개로 센다.** `randomEvent()`는 스크롤이 바닥에 닿을 때도 호출된다.

## 중복 없이 만들기 위한 기준

- 공통 HTML 템플릿 **하나**와 공통 애니메이션 시작 함수 **하나**를 사용한다. 현재 경유점 생성은 `startBirdCloud()` 안에 있다.
- bird/cloud 차이는 종류별 데이터(이미지 경로, 이미지 크기, 회전 여부, 움직임 방식)에 둔다. 같은 선택·복제·배치 코드를 두 번 작성하지 않는다.
- 기존 `pickRandom()`과 `randomNumber()`를 재사용한다.
- 무한 스크롤에서 반복 애니메이션이 많이 쌓일 수 있다. 필요해지면 화면 밖 이미지를 일시정지하는 `IntersectionObserver` 관리를 검토한다.

## 움직임 조절: 현재 코드에서 바꿀 값

`script.js`의 `startBirdCloud()` 안을 기준으로 한다. 숫자는 현재 기본값이며 연출에 맞춰 조정할 수 있다.

| 원하는 변화 | 수정할 코드 | 현재 의미 |
| --- | --- | --- |
| 전체 속도 | `duration: 9000` | 한 경로를 9초에 재생. 줄이면 빠름 |
| 끊겨 이동하는 구간 수 | `i <= 8`과 `progress = i / 8` | 8구간. **두 숫자를 함께** 바꿀 것 |
| bird 중간 경로의 세로 흔들림 | `randomNumber(-40, 40)` | 기준 경로에서 위아래 최대 40px |
| bird의 회전 폭 | `randomNumber(-25, 25)` | 중간 경유점의 각도 범위(도) |
| bird의 시작·도착 높이 | `baseY = maxY * progress` | `0 → maxY`, 즉 왼쪽 위 → 오른쪽 아래 |
| cloud의 수평 이동 높이 | `cloudY = randomNumber(0, maxY)` | 등장할 때 높이를 한 번 랜덤 선택하고 유지 |
| 왼쪽 → 오른쪽 가로 이동 | `x = maxX * progress` | `0 → maxX`; 두 이미지에 공통 |
| 끊기는 움직임 | `easing: "steps(1,end)"` | 각 구간 경계에서 위치가 뚝 바뀜 |
| 반복 | `iterations: Infinity` | 같은 경로를 계속 재생 |

`maxX`와 `maxY`는 이벤트 영역 크기에서 이미지 크기를 뺀 이동 가능 거리다. `style.css`의 `.birdCloudTemplate { height: 600px; width: 100%; }`는 무대 크기, `.birdCloudImage.bird { width: 100px; }`와 `.birdCloudImage.cloud { width: 180px; }`는 이미지 크기다. 이미지 크기를 바꾸면 이동 가능 거리도 다시 계산된다. `overflow: hidden`은 영역 밖으로 나간 부분을 가린다. 회전 중에는 이미지 모서리가 잘릴 수 있다.

현재 `script.js`에는 `randomNumner(-25,25)`라는 오타가 남아 있다. **`randomNumber(-25,25)`로 고쳐야 bird 애니메이션이 실행된다.** 이 문서를 갱신하면서 JS 파일은 수정하지 않았다.

## 아직 확인할 것

- bird/cloud가 세 번째마다 등장하는지와 이미지 로딩·애니메이션이 브라우저에서 정상 작동하는지 테스트한다.
- 이미지 크기, 9초 이동 시간, 8구간, 세로 흔들림과 회전 범위의 실제 시각 효과를 조정한다.
- 무한 스크롤에서 반복 애니메이션이 많이 쌓일 경우 화면 밖 애니메이션을 일시정지할지 검토한다.

## 주의

이전 대화에서 제안된 **bird 전용 `<canvas>` 코드, bird 궤적 두 버전 배열, 캔버스 드로잉 타이머**는 최종 요구와 맞지 않는다. 그것을 그대로 넣지 말 것. 현재 코드의 `.drawingCanvas`는 별도의 **사용자가 그림을 그리는 이벤트**이며 bird/cloud와 관계없다.

사용자는 JavaScript 초급자다. 다음 작업에서는 코드만 제시하지 말고 **기존 코드에서 정확히 어느 부분을 찾고, 무엇을 추가/교체하는지, 각 줄이 왜 필요한지** 쉬운 말로 설명할 것. 사용자가 명시적으로 요청하지 않으면 `index.html`, `style.css`, `script.js`를 직접 수정하지 말 것.
