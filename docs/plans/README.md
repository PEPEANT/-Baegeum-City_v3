# Restored Planning Drafts

Conclusion: this folder is for feature plans that must exist before UI, ranking, chat, job, online, relationship, or casino systems are implemented in the restored build.

Use this folder for generated drafts from:

```bash
npm run plan:restored -- <slug> --title="Feature Title" --surface=phone --domain=ranking --write
```

Rules:

- Plans here are not implementation permission by themselves.
- Plans should describe state, UI, assets, ranking, job, chat, online authority, and verification before code is added.
- Keep one plan per feature slice.
- Promote a plan into an owning system document when it becomes a real contract.
- Do not put runtime code or asset files in this folder.

Recommended first drafts:

- `restored-phone-chat-shell.md`
- `restored-ui-surface-redesign.md`
- `restored-online-adapter.md`

Current drafts:

- `restored-ranking-job-system.md`: phone ranking app, local preview boards, job/occupation boards, and online authority boundaries.
