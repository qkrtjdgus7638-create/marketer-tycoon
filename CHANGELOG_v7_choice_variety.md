# CHANGELOG v7 - 선택지 다양화/카드 확장

## 변경 요약
- 카드풀을 총 42장 기준으로 확장했다.
- 라운드별 카드 슬롯을 `핵심 / 맥락 / 상태보정` 구조로 정리했다.
- 각 라운드 후보군을 최소 9장 이상으로 넓혔다.
- `requiredCards`를 제거해 고정 선택지 느낌을 줄였다.
- R1 레퍼런스 지옥에서 `감도 연출`, `브랜드 가드`를 제외했다.
- 기존 카드명은 유지하고 설명만 행동 설명으로 다듬었다.
- 상태보정 슬롯용 선택 로직을 문서와 JS 스니펫으로 제공했다.

## 개발자 적용 순서
1. `marketer_survival_choice_variety_patch_v7.json`을 기존 `marketer_survival_story_card_patch_v2.json` 위치에 적용한다.
2. 가능하면 `choice_selection_logic_v7_snippet.js`를 참고해 `pickStoryCards`와 `cardWeight`를 보강한다.
3. 브라우저에서 R1~R12를 2~3회 플레이해 반복 카드 체감이 줄었는지 확인한다.
