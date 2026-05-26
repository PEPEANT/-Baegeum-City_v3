# Documentation Index

- [Blog Automation Pipeline](blog-automation-pipeline.md): DCInside 글, 이미지, 댓글, 유튜브 링크를 로컬 아카이브와 네이버 비공개 초안으로 변환하는 자동화 파이프라인 구조.

배금도시 v2 개발을 이어가기 위한 설계/운영 문서 목록이다.

- [배금도시 v2 기초 토대](baegeum-city-v2-foundation.md): 초기 구현 전 개발 원칙, 코드 크기 제한, 원본 이식 규칙, 오프라인/온라인 단계 계획.
- [배금도시 v2 재설계 기준선](baegeum-city-v2-system-redesign-baseline.md): 첫 완성 루프, 데이터 주인, 경제/시간/온라인/UI 게이트, 지금 하지 말 것과 다음 순서를 다시 고정한 기준 문서.
- [배금도시 V2 복원판 성장 설계](baegeum-city-v2-restored-growth-architecture.md): Dice City 기반 단일 HTML 복원판을 AI 연인, 감정선, 도박, 보유 시스템, 대화, 일러스트 중심으로 키우기 위한 폴더/모듈/상태 설계.
- [배금도시 v2 첫 수직 조각](baegeum-city-v2-first-slice.md): 현재 구현된 오프라인 도시 코어, 실행 방법, 검증 결과, 다음 단계.
- [배금도시 v2 첫 플레이 루프](baegeum-city-v2-first-play-loop.md): 처음 10분 동안 도시, 도박장, 환전, 홀짝 예약이 이어지는 기준 루프와 기능 판단 규칙.
- [배금도시 v2 작업 큐](baegeum-city-v2-work-queue.md): 여러 채팅에서 동시에 개발할 때 맵에디터, 인게임, 온라인/경제 트랙을 분리하는 우선순위 문서.
- [배금도시 v2 맵 계약](baegeum-city-v2-map-contract.md): 에디터 드래프트와 인게임 런타임이 공유하는 `schemaVersion`, `draftVersion`, `mapVersion`, `editorRevision` 저장 계약.
- [배금도시 v2 멀티맵 계약](baegeum-city-v2-multimap-contract.md): `baegeum-city` / `dice-city` mapId, sceneId, draftKey 분리, legacy draft fallback, 버스터미널 전환 계약.
- [배금도시 v2 도시 구역 계약](baegeum-city-v2-city-district-contract.md): `baegeum-city`는 생활/허브 도시, `dice-city`는 도박/밤거리/위험 도시로 나누는 role/district/buildingType 계약.
- [배금도시 v2 맵 에디터 v1](baegeum-city-v2-map-editor-v0.md): 실제 게임 렌더러 기반 월드 에디터, 건설 카드 배치, 선택 액션바, 광고판 팔레트, 로컬 드래프트 저장.
- [배금도시 v2 월드 오브젝트 시스템](baegeum-city-v2-world-object-system.md): 자동차/문/NPC/상점/테이블 같은 오브젝트의 충돌, 상호작용, 필요 아이템, 런타임 상태 계약.
- [배금도시 v2 도박장 건물 설계](baegeum-city-v2-gambling-venues.md): 건물별 도박장 종류, 한국어 간판, 입구, 실내 씬, 온라인 방 ID 설계.
- [배금도시 v2 월드 시간 설계](baegeum-city-v2-world-clock.md): `WorldClock`, 현재 1분/초 기본 속도, 낮밤, 반복 이벤트, 가상 인터넷/NPC/온라인 시간 기준.
- [배금도시 v2 UI 디자인 규칙](baegeum-city-v2-ui-design-rules.md): 초기 HUD 단순화, 설정 패널, 미니맵/폰/시간 배치 제한.
- [배금도시 v2 OST](baegeum-city-v2-ost.md): `dis-site` RECLAIM_2.5 BGM 원본 파일, 설정 패널 재생 방식, 음악 추가 규칙.
- [배금도시 v2 채팅](baegeum-city-v2-chat.md): Drawing World 채팅 원본 고정, 월드 채팅 v1, 말풍선, 향후 온라인 전환 규칙.
- [배금도시 v2 온라인 상태/프로토콜 설계](baegeum-city-v2-online-state-protocol.md): 플레이어/관전자/관리자 상태, 채널 분리, 서버 권위 경제 규칙.
- [배금도시 v2 온라인 로비 계약](baegeum-city-v2-online-lobby-contract.md): 온라인 연결 성공 후에만 열리는 로비, 방 목록/참가/관전자/버전 게이트, Iron Line 참고 범위와 금지 범위.
- [배금도시 v2 Economy Master](baegeum-city-v2-economy-master.md): `cash / bank / chips / ledger` 기준, 변경 경로, 카지노 전 경제 구현 순서.
- [배금도시 v2 경제 루프 계약](baegeum-city-v2-economy-loop-contract.md): 돈 생성/소멸, 환전, 송금, 베팅 정산, 시간 이벤트, 서버 권위 경제 빈칸을 고정하는 계약.
- [배금도시 v2 경제 Ledger 설계](baegeum-city-v2-economy-ledger.md): 현금/계좌/칩/아이템 변화 기록, append-only entry, 로컬 HUD 연결, 서버 권위 전환 기준.
- [배금도시 v2 Inventory Master](baegeum-city-v2-inventory-master.md): 아이템 id/type/count/stack/source 계약, 가방 슬롯, 음식/교환권/보상 아이템 규칙.
- [배금도시 v2 Interaction Master](baegeum-city-v2-interaction-master.md): PC `E`와 모바일 `ACTION`이 같은 후보/조건/결과 흐름을 쓰도록 고정한 상호작용 계약.
- [배금도시 v2 Game Action / Effect Master](baegeum-city-v2-game-action-effect-master.md): 상호작용 이후 요청, 중복 방지, 상태 변경 effect, ledger 연결을 표준화한 실행 계약.
- [배금도시 v2 플레이어 상태 런타임](baegeum-city-v2-player-state-runtime.md): 로컬 `playerState`, 설정 패널 디버그, city/venue_lobby 전환 구현.
- [배금도시 v2 운영/데이터 확장성 규칙](baegeum-city-v2-operations-data-rules.md): ID, 저장, 권한, 안티치트, 재접속, 서버 시간, 감사 로그, 마이그레이션.
- [배금도시 v2 캐릭터 스킨](baegeum-city-v2-character-skins.md): Drawing World 원본 스킨 시스템 vendor 규칙, 테스트장, 본게임 연결 상태.
- [배금도시 v2 가상 인터넷/폰 이식 계획](baegeum-city-v2-virtual-internet-phone-plan.md): MammonCity 시작 화면, 로그인, 스마트폰, DIS 커뮤니티, 주식 앱을 단계적으로 붙이는 계획.
- [배금도시 v2 가상 인터넷 런타임](baegeum-city-v2-virtual-internet-runtime.md): `WorldClock`, 현재 채널, 현재 장소, 최근 채팅을 DIS 게시글 피드로 연결하는 현재 구현.
- [배금도시 v2 기능 감각 검증](baegeum-city-v2-feature-affordance-audit.md): 건물/입구/간판/앱이 실제 작동 단위인지 숫자로 확인하는 런타임 검증 패널과 구현 기준.

- [Baegeum City V2 Restored Recomposition Plan](baegeum-city-v2-restored-recomposition-plan.md): Bottleneck audit and split order for the Dice City-derived restored build, including AI roaming actors, city/place contracts, phone UI, and future UI surfaces.
- [Baegeum City V2 Restored UI, Online, Ranking, And Chat Roadmap](baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md): Forward plan for restored UI surfaces, phone-first design, online expansion, rankings, and chat growth.
- [Baegeum City V2 Restored Asset Pipeline](baegeum-city-v2-restored-asset-pipeline.md): Asset folder roles, manifest ids, mp3/image classification, and checks for future illustrations, phone art, casino art, and audio.
- [Baegeum City V2 Restored Intake](baegeum-city-v2-restored-intake.md): Receiving lane for human-provided files, links, drafts, character ideas, and reference material before manifest/catalog promotion.
- [Baegeum City V2 Restored Inventory](baegeum-city-v2-restored-inventory.md): My Info carried-item inventory rules for shop goods, phones, bags, and consumables while excluding houses and real estate.
- [Restored Planning Drafts](plans/README.md): Folder rules for feature-plan drafts that must exist before restored UI, ranking, job, chat, online, relationship, or casino implementation.
- [Restored Ranking And Job System Plan](plans/restored-ranking-job-system.md): Concrete planning draft for phone rankings, local preview leaderboards, job/occupation boards, and online authority boundaries.
- [Restored Three City Home Navigation Plan](plans/restored-three-city-home-navigation.md): Planning draft for starting inside the player home, moving to house-front, and expanding through Baegeum City, Dice City, and Seosan City with location-aware tabs.
- [Restored Login Home, Online, And Phone Migration Plan](plans/restored-login-home-online-phone-migration.md): Planning draft for retiring visible save-code UI, using a login home, adapting MammonCity2 phone/online references, and keeping online authority explicit.
- [Restored UI Surface Redesign Plan](plans/restored-ui-surface-redesign.md): Pre-redesign checklist for the restored playable shell, including My Info, home, outside, phone, city, asset, ranking, chat, and online boundaries.
- [Restored Feature Plan Template](templates/restored-feature-plan-template.md): Required sections for restored feature plans, including job/occupation impact, ranking impact, chat impact, online authority, assets, and verification.

## AI Operating Loop

- [AI Agent Boot Packet](ai-agent-boot-packet.md): Copy-paste handoff payload for new AI sessions so they read the right files, run the loop, verify, and record state.
- [AI Code Health Audit Plan](ai-code-health-audit-plan.md): Bug-first audit plan for spaghetti growth, shared state, local persistence, silent failures, and root-cause repair loops.
- [AI Code Health Inventory 2026-05-26](ai-code-health-inventory-2026-05-26.md): First audit inventory for large files, `window.BaegeumCity`, localStorage islands, silent catches, and the next runtime-facade repair candidate.
- [AI Git Baseline Strategy](ai-git-baseline-strategy.md): Working-tree safety rules for the current many-untracked-files state, including when agents must ask before staging, committing, deleting, or moving files.
- [AI Ouroboros Loop](ai-ouroboros-loop.md): Local observe, decide, execute, verify, record loop for autonomous Codex progress.
- [AI Review Board](ai-review-board.md): Human-facing control panel for the current loop objective, last verified state, risk flags, approval queue, and next safe action.
- [AI Spaghetti And Bug Root Cause](ai-spaghetti-bug-root-cause.md): Root-cause map for spaghetti growth, bug classes, stale persistence, silent failures, and the next audit sequence.
- [AI Working State](ai-working-state.md): Current priority, next loop candidate, approval queue, and handoff notes.
