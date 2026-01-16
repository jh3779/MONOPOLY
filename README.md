# MONOPOLY

주루마블 간단하게 만들어봤는데 최대 팀 4팀으로 구성 돼 있음

# 주류마블 (6x6 외곽 보드)

## 실행
- `index.html`을 브라우저에서 열기

## 파일 구성
- `index.html`: 화면 구조/모달
- `css/styles.css`: 스타일
- `js/app.js`: 게임 로직/타일 데이터

## 타일 수정
- `js/app.js`의 `tileData` 배열
- 필드: `name`, `color`, `content`
- 필드: `penalty`, `isBonus`, `effect`

## 이미지 추가
- `js/app.js`의 `tileImages` 배열
- 배열 순서는 타일 순서와 동일

## 모달 표시 요소
- `#modal-title`
- `#modal-content`
- `#modal-subtext`
- `#modal-penalty`
- `#modal-image`

## 저장 데이터
- `STORAGE_KEY` 기준으로 로컬 저장

## 가이드
- `TILE_EDIT_GUIDE.md`
- `LANDING_CONFIRM_GUIDE.md`
