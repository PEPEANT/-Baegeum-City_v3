# Drawing World Vendor

Source: https://github.com/PEPEANT/-drawing-world

Commit: `ab60cc00753aae303bde8feffebb0faf94347185`

Vendored scope:

- `public/src/ui/skin-presets.js`
- `public/src/ui/skin-fill.js`
- `public/src/ui/skin-files.js`
- `public/src/ui/lobby.js`
- `public/src/ui/chat.js`
- `public/src/player-render.js`
- `public/src/config.js`
- `public/ai-bot/skin-select.js`
- `public/styles/skin-editor.css`
- `public/styles/chat.css`
- `server/websocket.js`
- `server/rooms.js`
- `server/protocol.js`

Rule: keep these files byte-for-byte identical to the source commit. Add Baegeum City integration in `src/skins/`, `src/ui/`, and `src/systems/` instead of editing vendored files.
