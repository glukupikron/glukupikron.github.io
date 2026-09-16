# Bird / Cloud 이벤트 작업 메모

마지막 정리: 2026-09-16. 이 문서는 다른 컴퓨터에서 작업을 이어가기 위한 메모다. **bird/cloud 기능은 아직 구현하지 않았다.** 기존 `index.html`, `style.css`, `script.js`는 이 문서를 만들면서 수정하지 않았다.

## 확정된 동작

- 일반 랜덤 이벤트가 **두 개** 나온 뒤, **세 번째에는 반드시** bird/cloud 이벤트가 한 번 나온다. 이후 `일반 → 일반 → bird/cloud` 순서를 반복한다.
- 세 번째 이벤트에서 bird와 cloud **둘 중 하나를 랜덤으로 선택**한다. “두 버전”은 bird 궤적 두 개가 아니라 **bird 버전과 cloud 버전**을 뜻한다.
- bird/cloud 이벤트는 높이 약 **600px**인 div다. 클릭, 버튼, 스크롤 정지 같은 상호작용은 없다.
- bird는 `use_image/bird.png`를 사용한다. 이동과 회전이 모두 매끄럽지 않고, 일정한 간격으로 **뚝뚝 바뀌는** 느낌이어야 한다.
- cloud는 bird와 **다른 이동 경로**를 사용하며 회전하지 않는다.
- 새 bird/cloud 이벤트가 등장할 때마다 **새 랜덤 궤적**을 만든다. 하나의 고정된 궤적 두 개를 반복해서 고르는 방식은 아니다.
- 궤적은 완전한 순간이동보다, 가로로 진행하면서 세로 위치가 조금씩 랜덤하게 달라지는 식으로 만들면 자연스럽다. 이미지가 div 밖으로 나가지 않도록 이동 범위를 제한한다.

## 권장 구현 방식

**HTML `<img>` + CSS 배치 + 작은 JavaScript 애니메이션**이 현재 요구에 가장 간결하다. `<canvas>`는 쓰지 않는다. 여기서는 이미지를 계속 지우고 다시 그릴 필요가 없기 때문이다.

- HTML에는 `.eventTemplate`이 붙은 **공통 bird/cloud 템플릿 하나**만 둔다. 안에는 `<img>` 하나만 둔다. 별도의 bird 템플릿과 cloud 템플릿을 만들지 않는다.
- CSS는 이벤트 div의 `height: 600px`, 반응형 너비, `position: relative`, 이미지의 `position: absolute`, 필요하면 `overflow: hidden`을 맡는다.
- JS는 세 번째 이벤트에서 이미지 종류를 고르고, 해당 이벤트의 랜덤 경유점 여러 개를 만든다.
- `image.animate(keyframes, options)`로 그 이미지에 경유점들을 한 번 전달한다. 매 프레임 캔버스를 다시 그리는 타이머는 필요 없다.
- bird는 위치와 회전각을 같은 경유점에서 바꾸고, 애니메이션의 `easing`을 `steps(1, end)` 또는 `step-end`로 주어 각 구간에서 뚝 이동하게 한다.
- cloud는 경유점마다 **위치만** 바꾼다. cloud도 끊겨 움직일지, 부드럽게 움직일지는 아직 사용자가 확정하지 않았다. 회전은 넣지 않는다.
- 같은 이벤트가 화면에 머무는 동안 경로를 반복할지, 한 번 지나간 뒤 멈출지도 아직 확정하지 않았다. 확정 전에는 복잡한 반복/재생성 코드를 추가하지 않는다.

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

- 공통 HTML 템플릿 **하나**, 공통 경로 생성 함수 **하나**, 공통 애니메이션 시작 함수 **하나**를 사용한다.
- bird/cloud 차이는 종류별 데이터(이미지 경로, 이미지 크기, 회전 여부, 움직임 방식)에 둔다. 같은 선택·복제·배치 코드를 두 번 작성하지 않는다.
- 기존 `pickRandom()`과 `randomNumber()`를 재사용한다.
- 무한 스크롤에서 같은 이벤트가 많이 쌓일 수 있다. 반복 애니메이션을 선택한다면 화면 밖 이미지를 일시정지하는 간단한 `IntersectionObserver` 관리도 검토한다. 한 번만 재생하고 끝낸다면 필요하지 않다.

## 아직 확인/결정할 것

- 현재 `use_image/`에는 `bird.png`가 있지만 **cloud 이미지 파일은 아직 없다.** 실제 파일명과 크기를 정한 뒤 연결해야 한다.
- cloud 이동은 부드럽게 할지, bird처럼 끊기게 할지.
- 각 이벤트에서 만든 랜덤 경로를 한 번만 재생할지, 같은 경로를 반복할지. “새 랜덤 궤적”은 현재 **새 이벤트가 등장할 때마다** 새로 만든다는 의미로 기록했다.
- bird/cloud 각각의 이미지 크기, 이벤트 div의 가로 너비, 전체 이동 시간, 점프 간격.

## 주의

이전 대화에서 제안된 **bird 전용 `<canvas>` 코드, bird 궤적 두 버전 배열, 캔버스 드로잉 타이머**는 최종 요구와 맞지 않는다. 그것을 그대로 넣지 말 것. 현재 코드의 `.drawingCanvas`는 별도의 **사용자가 그림을 그리는 이벤트**이며 bird/cloud와 관계없다.

사용자는 JavaScript 초급자다. 다음 작업에서는 코드만 제시하지 말고 **기존 코드에서 정확히 어느 부분을 찾고, 무엇을 추가/교체하는지, 각 줄이 왜 필요한지** 쉬운 말로 설명할 것. 사용자가 명시적으로 요청하지 않으면 `index.html`, `style.css`, `script.js`를 직접 수정하지 말 것.
