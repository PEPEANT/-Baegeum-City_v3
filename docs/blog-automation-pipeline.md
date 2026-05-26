# Blog Automation Pipeline

Conclusion: the product is the pipeline, not the login step. Naver Blog is only one publishing adapter.

## Purpose

Turn public DCInside posts, images, videos, and comments into reviewed Naver Blog drafts without losing the original archive.

The pipeline should preserve the creator archive locally first, then publish only reviewed material outward.

## Core Flow

```text
source URL
-> local package
-> asset/comment/embed archive
-> rewritten draft
-> validation gate
-> Naver private post
-> human review
-> public release
-> performance tracking
```

Current implementation lives in `tools/naver_blog_pipeline.py`.

## Current Commands

```powershell
python tools/naver_blog_pipeline.py fetch --url "<dcinside-url>" --blog metasports
python tools/naver_blog_pipeline.py validate --package "content/naver-drafts/1056312-ai-one-person-dev-void"
python tools/naver_blog_pipeline.py editor-payload --package "content/naver-drafts/1056312-ai-one-person-dev-void"
python tools/naver_blog_pipeline.py status
python tools/naver_blog_pipeline.py mark --id 1056312 --stage review_passed
```

OAuth and Naver publishing commands:

```powershell
python tools/naver_blog_pipeline.py auth-url
python tools/naver_blog_pipeline.py exchange-code --code "<code>" --state "<state>"
python tools/naver_blog_pipeline.py list-categories
python tools/naver_blog_pipeline.py publish-private
```

Secrets stay outside git through `.env`, environment variables, or `.naver-token.json`.

## Local Package

Each source post becomes a package under `content/naver-drafts/`.

Required files:

- `meta.json`: source title, source URL, date, target blog
- `original.html`: archived source body
- `original.md`: readable source text
- `media.json`: body images, links, videos, attachments
- `downloaded_assets.json`: local asset download manifest
- `comments.json`: raw collected comments
- `comments_summary.md`: filtered reaction summary for editorial use
- `embeds.json`: YouTube/video/link records
- `rewritten.md`: human-readable rewritten draft
- `naver_api_content.html`: API-oriented body where image placeholders are explicit
- `naver_editor_clipboard.txt`: SmartEditor-ready text with short image anchors
- `editor_upload_plan.json`: mapping from anchors to package assets
- `browser_editor_payload.json`: single handoff JSON for a browser/editor adapter

## Central Ledger

The central state file is `content/blog-pipeline/ledger.json`.

Current stages:

- `draft_ready`: package exists, assets and comments are collected, draft is generated
- `naver_temp_saved`: text draft has been saved in the Naver SmartEditor temporary-save area
- `naver_private_published`: Naver private post has been created
- `review_passed`: human review says the post is safe to publish
- `public_published`: public Naver URL exists
- `refresh_needed`: old post needs a factual or link update
- `retired`: do not republish

Each ledger item tracks source URL, target blog, local package, Naver URL, asset count, comment count, YouTube count, and next action.

Re-running `fetch` must refresh package files and stats without downgrading a later ledger stage such as `naver_temp_saved`.

## Quality Gates

Before a post can leave `draft_ready`:

- `validate` must pass with zero asset errors.
- Body image count must be nonzero when the original post has images.
- YouTube links must be represented as a link or embed block.
- Comments must be summarized, not copied wholesale.
- The rewritten draft must keep the original emotional line but avoid raw copy-paste.
- Public posting requires human review, not just script success.

## Naver Constraints

Naver API is good for private draft creation and image attachment, but it may not preserve exact in-body image placement.

Browser clipboard image paste works in SmartEditor, but long placeholder text can split around the pasted image. Editor drafts therefore use short anchors such as `[[IMG_001]]`, with the mapping stored in `editor_upload_plan.json`.

Do not use coordinate-only keyboard/mouse placement as the primary image adapter. A test on 2026-05-26 showed that viewport scroll can send an image to the wrong placeholder even when clipboard paste succeeds.

Successful browser adapter method verified on 2026-05-26:

```text
click exact short anchor
-> Home
-> Shift+End
-> paste image from clipboard
-> verify anchor removed and image count increased
```

The reusable helper lives in `tools/naver_smarteditor_browser_adapter.mjs`.

The current Naver editor page exposes non-public SmartEditor save routes such as `/RabbitTempPostWrite.naver`, `/RabbitTempPostUpdate.naver`, `/RabbitWrite.naver`, and `/PostWriteFormManagerOptions.naver`. Treat these as unstable implementation details, not a public API contract.

The public Naver OpenAPI situation must be verified before depending on it. Naver has a 2020 notice saying the login-based Blog write Open API ended, while the open API guide still lists `blog/writePost.json`; the pipeline should keep API publishing optional until a token-backed dry run succeeds.

If API image placement is not acceptable, add a browser-editor adapter as a separate stage:

```text
naver_api_private
or
naver_editor_private
```

Do not make browser login the core architecture. Login is only a transport concern.

## Next Required Work

1. Build the browser-editor adapter against `browser_editor_payload.json`, not raw coordinates.
2. Add metrics collection after public release: views, comments, likes, search query notes.
3. Add duplicate detection before rewriting similar DCInside posts.
4. Add a prompt/template registry so each category has a repeatable rewrite style.
5. Add category-specific quality checks for AI development logs, games, manga/IP posts, and personal essays.
