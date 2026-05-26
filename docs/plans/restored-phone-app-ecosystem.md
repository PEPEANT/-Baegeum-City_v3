# Restored Phone App Ecosystem

Conclusion: the phone should become a small in-game OS. Keep the current live apps stable, add an app-store catalog, and build messenger, relationships, and virtual community as separate phone apps instead of new bottom tabs.

## Current Audit

- Live phone app registry is `src/restored/phone/phone-app-contract.js`.
- Current live apps are `news`, `stock`, `relationships`, `app_store`, and `futures`.
- The `news` app list view is extracted into `src/restored/phone/news-app-view.js`.
- The `stock` app view is extracted into `src/restored/phone/stock-app-view.js`.
- The `futures` app view is extracted into `src/restored/phone/futures-app-view.js`.
- The `relationships` app view is extracted into `src/restored/phone/relationship-app-view.js`.
- The `app_store` view is extracted into `src/restored/phone/app-store-view.js` and renders catalog rows without mutating installed-app save data.
- The restored HTML still owns trade handlers, futures position opening/closing, and market ticks; those should move only after view extraction stays stable.
- The phone shell already gates apps by owned device. No phone means no phone apps.
- Folder phone should stay basic. Smartphone should unlock richer chat, app store, community, rankings, and futures.

## Target Phone OS

The phone has four layers:

1. Launcher: app icons, unread badges, locked states, and device badge.
2. App stage: one app view at a time inside the phone shell.
3. App store: installable planned apps and upgrade hints.
4. Notification layer: relationship messages, market alerts, community replies, and online status.

The bottom navigation must not receive phone apps. The phone dock opens the phone, then the app launcher owns the rest.

## Required Apps

Live or near-live:

- `news`: market and city headlines.
- `stock`: stocks and portfolio.
- `futures`: smartphone-only crypto/futures.
- `relationships`: lover list, relationship logs, date, confession, and partner actions.
- `app_store`: Baegeum Store, the in-game Play Store equivalent.

Planned app-store apps:

- `messenger`: BaeTalk, a KakaoTalk-style private messenger for partner DM and future player chat.
- `community`: Baegeum Gallery, a fictional DCInside-style board.
- `rankings`: local preview and future online leaderboards.
- `bank`: account, credit, debt, and loan status.
- `pay`: D-Pay wallet, DPA exchange hints, receipts, and city payments.
- `map`: city map, bus routes, taxi/sports-car fast travel.
- `online_lobby`: connected-only online lobby entry.

Use fictional in-world names in UI. KakaoTalk and DCInside are references for behavior, not names or logos to copy.

## App Boundaries

`messenger` is realtime/private chat:

- partner DM channels
- future player-to-player chat
- unread counts
- catalog fallback lines before AI text
- server authority later for public/online delivery

`relationships` is relationship state:

- partner list
- affection/trust/stability/risk
- relationship logs
- date/confession/gift actions
- lover status and breakup risk

`community` is board/forum content:

- local virtual posts
- galleries by city or topic
- comments/recommendations later
- posts generated from city events, chat snapshots, rumors, and market events
- not a replacement for realtime chat

`app_store` is installation/catalog UI:

- shows locked/planned apps
- explains phone/smartphone requirements
- can later install optional apps
- must not bypass phone ownership gates

## Design Direction

- Launcher should feel like a compact phone home screen: 3-column app icons, small badges, device label, and clean app cards.
- App Store should use app rows with icon, category, requirement, install state, and one clear action.
- BaeTalk should look like a chat list first, then a DM thread: partner avatar, last message, mood, and unread count.
- Relationships should stay softer and emotional: partner cards, mood/risk bars, recent memories, date/confession buttons.
- Baegeum Gallery should look like a dense Korean board: title rows, hit/reply/recommend counts, gallery tabs, and rumor labels.
- Finance apps should be denser and calmer: numbers, alerts, and receipts.

## Implementation Order

V0.1 app ecosystem boundary:

1. Add a phone app ecosystem catalog for live, planned, and future-online apps.
2. Guard required app ids: `app_store`, `messenger`, `relationships`, and `community`.
3. Keep current live registry unchanged until placeholder app views exist.
4. Document which live apps are still inline.

V0.2 app-store shell:

Status: implemented as a narrow smartphone-only shell.

1. `app_store` is now in the live phone registry because `src/restored/phone/app-store-view.js` exists.
2. The view renders live, planned, and future-online catalog rows from the ecosystem catalog.
3. It shows installed, locked, coming-soon, and online-prep states without mutating save data yet.
4. Folder phone must not show the store; smartphone should show the store.

V0.3 messenger and relationship bridge:

1. Add `messenger` as smartphone-only.
2. Add partner DM list fed by existing partners.
3. Let DM messages create relationship events through `relationship-event-runtime.js`.
4. Keep AI-generated text optional with catalog fallback.

V0.4 virtual community:

1. Add `community` as smartphone-only.
2. Render local posts from city, market, relationship, and chat events.
3. Keep community posts separate from realtime chat channels.
4. Add posting/commenting only after local post state has a contract.

## Verification

- `node tools/check-restored-phone-app-ecosystem.cjs`
- `node tools/check-restored-phone-app-contract.cjs`
- `node tools/check-restored-planning-kit.cjs`
- `npm run check`
- Browser check after V0.2: no phone means locked, folder phone shows only basic apps, smartphone shows app store and advanced apps.

## Do Not

- Do not add every planned app directly to the live registry without a view.
- Do not put app buttons in the bottom nav.
- Do not copy KakaoTalk or DCInside names, logos, or external network behavior.
- Do not make public chat or public board posting online before moderation and server authority exist.
- Do not let messenger directly mutate relationship values; it must emit relationship events.
