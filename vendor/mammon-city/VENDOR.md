# MammonCity Vendor

Source: https://github.com/PEPEANT/MammonCity

Commit: `91305e829b3a112a80778b7ffaef4a20b658e49b`

Vendored scope for the first import:

- `index.html`
- `css/phone.css`
- `js/devices/phone/phone-session.js`
- `js/devices/phone/phone-app-registry.js`
- `js/devices/phone/phone-shell-ui.js`
- `js/devices/phone/phone-router.js`
- `js/apps/dis/dis-manifest.js`
- `js/apps/dis/dis-community-service.js`
- `docs/phone-system.md`
- `docs/device-internet-structure.md`

Rule: keep these files byte-for-byte identical to the source commit. Baegeum City v2 mounts the original phone shell and DIS community design, while real DIS/Firebase behavior stays behind a local adapter until a later step.
