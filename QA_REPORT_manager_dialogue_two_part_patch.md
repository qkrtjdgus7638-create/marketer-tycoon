# QA REPORT - 팀장 대사 2문장 구조 패치

## 확인 항목

| 항목 | 결과 |
|---|---|
| app.js 문법 검사 | 통과 (`node --check`) |
| 다음 방향 문장 호출 | 제거됨 (`composeManagerDialogueLine`에서 `dialogueNextPool` 미호출) |
| 카드명 직접 삽입 | 주요 대사에서 `cardActionPhrase()`로 대체 |
| 기존 결과 계산 로직 | 유지 |
| 기존 데이터 병합 구조 | 유지 |

## 주의
파일 내부에는 이전 버전의 `dialogueNextPool()` 함수가 남아 있습니다. 하지만 새 `composeManagerDialogueLine()`이 이 함수를 호출하지 않으므로 실제 결과 대사에는 다음 방향 문장이 붙지 않습니다.
