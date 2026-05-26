# 배금도시 v2 채팅

결론: 현재 채팅은 `PEPEANT/-drawing-world`의 채팅 구조를 참고해 배금도시 로컬 채팅 v1로 연결했고, 채널 스키마는 온라인 전환을 고려해 먼저 고정했다.

## Current Behavior

- 왼쪽 아래 `채팅` 버튼으로 채팅 패널을 연다.
- `T` 또는 `Enter`로 채팅 입력을 바로 열 수 있다.
- 배금시티에 있을 때 현재 채널은 `world:baegeum-city`다.
- 다이스시티에 있을 때 현재 채널은 `world:dice-city`다.
- 건물 실내에 들어가면 현재 채널은 해당 건물의 `venue:<venue-id>`로 자동 전환된다.
- 채팅 로그는 채널별로 분리된다. 도시 채팅과 카지노 채팅은 서로 섞이지 않는다.
- 내 메시지는 플레이어 머리 위 말풍선으로 잠깐 표시된다.
- 휴대폰 포커스 상태에서는 채팅 패널을 숨겨 화면 충돌을 막는다.

## Channel Schema

장소 채팅은 별도 `chat:<id>` 채널을 만들지 않는다. 플레이어가 실제로 속한 공간 ID가 곧 채팅 채널이다.

```js
{
  world: "world:baegeum-city",
  venue: "venue:blackjack-casino-01",
  table: "table:blackjack-casino-01:main",
  spectator: "spectator:blackjack-casino-01",
  admin: "admin:blackjack-casino-01"
}
```

## Message Shape

```js
{
  id: "chat-id",
  channel: "world:baegeum-city",
  author: "local-player",
  name: "YOU",
  color: "#8fe0ff",
  text: "message",
  at: 0,
  worldTime: "08:00"
}
```

## Source Reference

- 원본 저장소: `https://github.com/PEPEANT/-drawing-world`
- 원본 커밋: `ab60cc00753aae303bde8feffebb0faf94347185`
- 고정 파일: `public/src/ui/chat.js`, `public/styles/chat.css`, `server/websocket.js`, `server/rooms.js`, `server/protocol.js`

## Next Online Step

온라인 단계에서는 이 로컬 `WorldChat`을 `Drawing World`의 `handleChat` 방식으로 교체한다. 서버는 메시지를 검증하고 현재 채널 참가자에게만 `broadcast`해야 한다.

폰 DIS 커뮤니티는 실시간 채팅과 분리한다. 현재 DIS는 원본 디자인 기반 오프라인 게시판 미리보기로만 붙어 있고, 월드 채팅은 위치 기반 실시간 채널로 유지한다.
