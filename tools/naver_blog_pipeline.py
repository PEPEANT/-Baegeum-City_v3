#!/usr/bin/env python3
"""
Build a Naver Blog draft package from a DCInside post.

This tool intentionally separates three jobs:
1. Fetch and archive the source post, assets, embeds, and comments.
2. Generate a Naver-ready rewritten draft as local files.
3. Optionally publish that draft as a private Naver Blog post with OAuth.

No Naver password is needed. Publishing uses a NAVER_ACCESS_TOKEN.
"""

from __future__ import annotations

import argparse
import email.message
import html
import json
import mimetypes
import os
import re
import secrets
import sys
import time
import urllib.parse
from dataclasses import dataclass
from html.parser import HTMLParser
from http.cookiejar import CookieJar
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import HTTPCookieProcessor, Request, build_opener


USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0 Safari/537.36"
)
SOURCE_URL = (
    "https://gall.dcinside.com/mgallery/board/view/"
    "?id=thesingularity&no=1056312"
)
DEFAULT_OUT = Path("content/naver-drafts/1056312-ai-one-person-dev-void")
DEFAULT_LEDGER = Path("content/blog-pipeline/ledger.json")
NAVER_WRITE_URL = "https://openapi.naver.com/blog/writePost.json"
NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize"
NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token"
STAGE_NEXT_ACTION = {
    "draft_ready": "publish_private_after_auth",
    "naver_temp_saved": "insert_images_or_publish_private",
    "naver_private_published": "review_private_draft",
    "review_passed": "publish_public_or_manual_release",
    "public_published": "collect_metrics",
    "refresh_needed": "refresh_draft",
    "retired": "none",
}
STAGE_RANK = {
    "draft_ready": 10,
    "naver_temp_saved": 20,
    "naver_private_published": 30,
    "review_passed": 40,
    "public_published": 50,
    "refresh_needed": 60,
    "retired": 90,
}


def normalize_url(url: str) -> str:
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        return "https://gall.dcinside.com" + url
    return url


def request_bytes(opener: Any, url: str, *, data: bytes | None = None, referer: str | None = None, headers: dict[str, str] | None = None) -> tuple[bytes, email.message.Message]:
    merged = {"User-Agent": USER_AGENT}
    if referer:
        merged["Referer"] = referer
    if headers:
        merged.update(headers)
    req = Request(url, data=data, headers=merged)
    with opener.open(req, timeout=30) as res:
        return res.read(), res.headers


def read_text(opener: Any, url: str, *, referer: str | None = None) -> str:
    raw, _ = request_bytes(opener, url, referer=referer)
    return raw.decode("utf-8", "ignore")


def hidden_value(page_html: str, element_id: str) -> str:
    pattern = rf'id="{re.escape(element_id)}"[^>]*value="([^"]*)"'
    match = re.search(pattern, page_html)
    return html.unescape(match.group(1)) if match else ""


def first_text(pattern: str, text: str, default: str = "") -> str:
    match = re.search(pattern, text, re.S)
    if not match:
        return default
    value = re.sub(r"<.*?>", "", match.group(1))
    return html.unescape(re.sub(r"\s+", " ", value)).strip()


def safe_filename(name: str, fallback: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]+', "-", name).strip(" .")
    return cleaned or fallback


def content_type_ext(content_type: str, fallback_url: str = "") -> str:
    ctype = content_type.split(";")[0].strip().lower()
    ext = mimetypes.guess_extension(ctype) or ""
    if ext == ".jpe":
        ext = ".jpg"
    if ext:
        return ext
    parsed = urllib.parse.urlparse(fallback_url)
    guessed = Path(parsed.path).suffix
    return guessed if guessed else ".bin"


def sniff_ext(raw: bytes) -> str | None:
    if raw.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if raw.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if raw.startswith(b"GIF87a") or raw.startswith(b"GIF89a"):
        return ".gif"
    if raw.startswith(b"RIFF") and raw[8:12] == b"WEBP":
        return ".webp"
    if raw[4:12] in {b"ftypmp42", b"ftypisom", b"ftypM4V ", b"ftypMSNV"}:
        return ".mp4"
    return None


def parse_content_disposition_filename(header: str) -> str | None:
    if not header:
        return None
    parts = header.split(";")
    for part in parts:
        part = part.strip()
        if part.lower().startswith("filename*="):
            value = part.split("=", 1)[1].strip().strip('"')
            if "''" in value:
                _, encoded = value.split("''", 1)
                return urllib.parse.unquote(encoded)
        if part.lower().startswith("filename="):
            return part.split("=", 1)[1].strip().strip('"')
    return None


class WriteDivExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.capture = False
        self.done = False
        self.depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k: v or "" for k, v in attrs}
        class_name = attr.get("class", "")
        if not self.capture and not self.done and tag == "div" and "write_div" in class_name:
            self.capture = True
            self.depth = 1
            self.parts.append(self.get_starttag_text() or "")
            return
        if self.capture:
            if tag == "div":
                self.depth += 1
            self.parts.append(self.get_starttag_text() or "")

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.capture:
            self.parts.append(self.get_starttag_text() or "")

    def handle_endtag(self, tag: str) -> None:
        if not self.capture:
            return
        self.parts.append(f"</{tag}>")
        if tag == "div":
            self.depth -= 1
            if self.depth <= 0:
                self.capture = False
                self.done = True

    def handle_data(self, data: str) -> None:
        if self.capture:
            self.parts.append(data)

    def handle_entityref(self, name: str) -> None:
        if self.capture:
            self.parts.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        if self.capture:
            self.parts.append(f"&#{name};")


class MarkdownExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.link_stack: list[dict[str, str]] = []

    def newline(self) -> None:
        self.parts.append("\n")

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k: v or "" for k, v in attrs}
        if tag in {"p", "div", "li", "h1", "h2", "h3"}:
            self.newline()
        if tag == "br":
            self.newline()
        if tag == "a":
            self.link_stack.append({"href": normalize_url(attr.get("href", "")), "text": ""})
        if tag == "img":
            src = normalize_url(attr.get("data-original") or attr.get("data-src") or attr.get("src") or "")
            if not src or "gallview_loading_ori.gif" in src:
                return
            alt = attr.get("alt") or attr.get("title") or attr.get("conalt") or "image"
            if "dccon.php" in src:
                self.parts.append(f"\n[디시콘:{alt}]\n")
            else:
                self.parts.append(f"\n[이미지:{alt}]\n")

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self.link_stack:
            link = self.link_stack.pop()
            href = link.get("href", "")
            text = link.get("text", "").strip()
            if href and (not text or href not in text):
                self.parts.append(f" ({href})")
        if tag in {"p", "div", "li", "h1", "h2", "h3"}:
            self.newline()

    def handle_data(self, data: str) -> None:
        text = data.replace("\xa0", " ")
        if self.link_stack:
            self.link_stack[-1]["text"] += text
        self.parts.append(text)


class MediaCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.images: list[dict[str, Any]] = []
        self.videos: list[dict[str, Any]] = []
        self.links: list[dict[str, Any]] = []
        self.iframes: list[dict[str, Any]] = []
        self._current_link: dict[str, Any] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k: v or "" for k, v in attrs}
        if tag == "img":
            src = normalize_url(attr.get("data-original") or attr.get("data-src") or attr.get("src") or "")
            if not src or "gallview_loading_ori.gif" in src:
                return
            kind = "dccon" if "dccon.php" in src or "written_dccon" in attr.get("class", "") else "image"
            self.images.append(
                {
                    "kind": kind,
                    "url": src,
                    "alt": attr.get("alt") or attr.get("title") or attr.get("conalt") or "",
                    "fileno": attr.get("data-fileno") or "",
                    "tempno": attr.get("data-tempno") or "",
                }
            )
        if tag in {"video", "source"}:
            src = normalize_url(attr.get("src", ""))
            if src:
                self.videos.append({"url": src, "tag": tag, "type": attr.get("type", "")})
        if tag == "iframe":
            src = normalize_url(attr.get("src", ""))
            if src:
                self.iframes.append({"url": src})
        if tag == "a":
            self._current_link = {"url": normalize_url(attr.get("href", "")), "text": ""}

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._current_link:
            if self._current_link["url"]:
                self.links.append(self._current_link)
            self._current_link = None

    def handle_data(self, data: str) -> None:
        if self._current_link:
            self._current_link["text"] += data.replace("\xa0", " ")


def extract_write_div(page_html: str) -> str:
    parser = WriteDivExtractor()
    parser.feed(page_html)
    return "".join(parser.parts)


def markdown_from_html(fragment: str) -> str:
    parser = MarkdownExtractor()
    parser.feed(fragment)
    text = "".join(parser.parts)
    lines = []
    previous_blank = False
    for raw in text.splitlines():
        line = re.sub(r"[ \t\r\f\v]+", " ", raw).strip()
        if not line:
            if not previous_blank:
                lines.append("")
            previous_blank = True
            continue
        lines.append(line)
        previous_blank = False
    return "\n".join(lines).strip() + "\n"


def collect_media(fragment: str) -> MediaCollector:
    collector = MediaCollector()
    collector.feed(fragment)
    return collector


def collect_appended_files(page_html: str) -> list[dict[str, str]]:
    match = re.search(r'<ul class="appending_file">(.*?)</ul>', page_html, re.S)
    if not match:
        return []
    files = []
    for link, name in re.findall(r'<a href="([^"]+)">([^<]*)</a>', match.group(1), re.S):
        files.append({"url": normalize_url(html.unescape(link)), "name": html.unescape(name).strip()})
    return files


def youtube_id(url: str) -> str | None:
    parsed = urllib.parse.urlparse(url)
    host = parsed.netloc.lower()
    if host.endswith("youtu.be"):
        return parsed.path.strip("/") or None
    if "youtube.com" in host:
        query = urllib.parse.parse_qs(parsed.query)
        if query.get("v"):
            return query["v"][0]
        if parsed.path.startswith("/embed/"):
            return parsed.path.split("/embed/", 1)[1].split("/", 1)[0]
    return None


def build_embeds(links: list[dict[str, Any]], iframes: list[dict[str, Any]], videos: list[dict[str, Any]]) -> list[dict[str, Any]]:
    embeds: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in links + iframes:
        url = item.get("url", "")
        if not url or url in seen:
            continue
        seen.add(url)
        yid = youtube_id(url)
        if yid:
            embeds.append(
                {
                    "type": "youtube",
                    "url": url,
                    "id": yid,
                    "thumbnail": f"https://img.youtube.com/vi/{yid}/hqdefault.jpg",
                    "text": item.get("text", "").strip(),
                }
            )
        elif url.startswith("http"):
            embeds.append({"type": "link", "url": url, "text": item.get("text", "").strip()})
    for item in videos:
        url = item.get("url", "")
        if url and url not in seen:
            seen.add(url)
            embeds.append({"type": "video", "url": url, "mime": item.get("type", "")})
    return embeds


def download_asset(opener: Any, url: str, dest: Path, *, referer: str, preferred_name: str | None = None) -> dict[str, Any]:
    raw, headers = request_bytes(opener, url, referer=referer)
    content_type = headers.get("Content-Type", "application/octet-stream")
    cd_name = parse_content_disposition_filename(headers.get("Content-Disposition", ""))
    if dest.suffix == ".bin":
        ext = sniff_ext(raw) or content_type_ext(content_type, url)
        dest = dest.with_suffix(ext)
    display_name = preferred_name or cd_name
    if display_name and dest.name.startswith("attachment-"):
        dest = dest.with_name(dest.stem + "-" + safe_filename(display_name, "file")[:80])
        if not dest.suffix:
            dest = dest.with_suffix(sniff_ext(raw) or content_type_ext(content_type, url))
    dest.write_bytes(raw)
    return {
        "url": url,
        "file": dest.name,
        "bytes": len(raw),
        "content_type": content_type,
    }


def fetch_comments(opener: Any, page_html: str, *, source_url: str) -> dict[str, Any]:
    gallery_id = hidden_value(page_html, "gallery_id") or hidden_value(page_html, "id")
    article_no = hidden_value(page_html, "no")
    e_s_n_o = hidden_value(page_html, "e_s_n_o")
    secret_article_key = hidden_value(page_html, "secret_article_key")
    if not gallery_id or not article_no or not e_s_n_o:
        return {"total_cnt": 0, "comments": [], "error": "missing comment API fields"}

    comments: list[dict[str, Any]] = []
    seen: set[str] = set()
    total_cnt = 0
    for page in range(1, 11):
        payload = urllib.parse.urlencode(
            {
                "id": gallery_id,
                "no": article_no,
                "cmt_id": gallery_id,
                "cmt_no": article_no,
                "focus_cno": "",
                "focus_pno": "",
                "e_s_n_o": e_s_n_o,
                "comment_page": str(page),
                "sort": "D",
                "prevCnt": "0",
                "board_type": "",
                "_GALLTYPE_": hidden_value(page_html, "_GALLTYPE_") or "M",
                "secret_article_key": secret_article_key,
            }
        ).encode("utf-8")
        raw, _ = request_bytes(
            opener,
            "https://gall.dcinside.com/board/comment/",
            data=payload,
            referer=source_url,
            headers={
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
        )
        data = json.loads(raw.decode("utf-8", "ignore"))
        total_cnt = int(data.get("total_cnt") or 0)
        batch = data.get("comments") or []
        if not batch:
            break
        for item in batch:
            key = str(item.get("no", ""))
            if key and key in seen:
                continue
            seen.add(key)
            memo_html = item.get("memo") or ""
            memo_text = re.sub(r"<br\s*/?>", "\n", memo_html, flags=re.I)
            memo_text = re.sub(r"<.*?>", " ", memo_text)
            memo_text = html.unescape(re.sub(r"\s+", " ", memo_text)).strip()
            comments.append(
                {
                    "no": item.get("no"),
                    "parent": item.get("parent"),
                    "reply_to": item.get("c_no"),
                    "depth": item.get("depth"),
                    "name": item.get("name"),
                    "ip": item.get("ip"),
                    "reg_date": item.get("reg_date"),
                    "memo": memo_text,
                    "raw_memo": memo_html,
                }
            )
        if total_cnt and len(comments) >= total_cnt:
            break
        time.sleep(0.2)
    return {"total_cnt": total_cnt, "comments": comments}


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def now_stamp() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def article_id_from_url(url: str, fallback: str = "") -> str:
    query = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
    if query.get("no"):
        return query["no"][0]
    match = re.search(r"/(\d+)(?:[/?#]|$)", url)
    return match.group(1) if match else fallback


def load_ledger(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"version": 1, "items": []}
    return json.loads(path.read_text(encoding="utf-8"))


def save_ledger(path: Path, ledger: dict[str, Any]) -> None:
    ledger["updated_at"] = now_stamp()
    write_json(path, ledger)


def upsert_ledger_entry(path: Path, entry: dict[str, Any]) -> None:
    ledger = load_ledger(path)
    items = ledger.setdefault("items", [])
    entry_id = entry["id"]
    for index, old in enumerate(items):
        if old.get("id") == entry_id:
            old_stage = old.get("stage", "")
            new_stage = entry.get("stage", "")
            if STAGE_RANK.get(old_stage, 0) > STAGE_RANK.get(new_stage, 0):
                entry["stage"] = old_stage
                entry["next_action"] = old.get("next_action") or STAGE_NEXT_ACTION.get(old_stage, "decide_next_action")
                entry["naver_url"] = old.get("naver_url", entry.get("naver_url", ""))
                entry["public_url"] = old.get("public_url", entry.get("public_url", ""))
                entry["notes"] = old.get("notes", [])
            merged = {**old, **entry}
            merged["created_at"] = old.get("created_at") or entry.get("created_at") or now_stamp()
            items[index] = merged
            break
    else:
        entry.setdefault("created_at", now_stamp())
        items.append(entry)
    save_ledger(path, ledger)


def package_stats(package_dir: Path) -> dict[str, Any]:
    meta_path = package_dir / "meta.json"
    comments_path = package_dir / "comments.json"
    assets_path = package_dir / "downloaded_assets.json"
    embeds_path = package_dir / "embeds.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
    comments = json.loads(comments_path.read_text(encoding="utf-8")) if comments_path.exists() else {"comments": []}
    assets = json.loads(assets_path.read_text(encoding="utf-8")) if assets_path.exists() else []
    embeds = json.loads(embeds_path.read_text(encoding="utf-8")) if embeds_path.exists() else []
    return {
        "meta": meta,
        "asset_count": len(assets),
        "body_image_count": sum(1 for item in assets if item.get("kind") == "body-image" and item.get("file")),
        "attachment_count": sum(1 for item in assets if item.get("kind") == "attachment" and item.get("file")),
        "asset_error_count": sum(1 for item in assets if item.get("error")),
        "comment_count": len(comments.get("comments", [])),
        "comment_total": comments.get("total_cnt"),
        "youtube_count": sum(1 for item in embeds if item.get("type") == "youtube"),
        "video_count": sum(1 for item in embeds if item.get("type") == "video"),
    }


def upsert_package_in_ledger(package_dir: Path, ledger_path: Path, stage: str = "draft_ready") -> None:
    stats = package_stats(package_dir)
    meta = stats.pop("meta")
    source_url = meta.get("source_url", "")
    entry = {
        "id": article_id_from_url(source_url, package_dir.name),
        "stage": stage,
        "source_url": source_url,
        "source_title": meta.get("title", ""),
        "target_blog": meta.get("target_blog", ""),
        "package": str(package_dir).replace("\\", "/"),
        "naver_url": meta.get("naver_url", ""),
        "public_url": meta.get("public_url", ""),
        "updated_at": now_stamp(),
        "stats": stats,
        "next_action": STAGE_NEXT_ACTION.get(stage, "decide_next_action"),
    }
    upsert_ledger_entry(ledger_path, entry)


def make_comments_summary(comment_data: dict[str, Any]) -> str:
    comments = [c for c in comment_data.get("comments", []) if c.get("memo")]
    total = comment_data.get("total_cnt") or len(comments)
    keywords = {
        "바이브코딩/AI 개발 공감": ["바이브", "AI", "코딩", "개발", "서비스", "기능"],
        "구조/유지보수 걱정": ["구조", "유지", "감당", "DB", "방향", "설계"],
        "공허/현타 반응": ["공허", "현타", "힘", "두려", "모르겠다"],
        "응원/조언": ["잘", "응원", "이겨", "해라", "좋", "가능"],
    }
    lines = [
        "# 댓글 반응 요약",
        "",
        f"- 수집 댓글 수: {len(comments)}개 / 표시 총량: {total}개",
        "- 블로그 본문에는 원문 댓글을 그대로 옮기기보다, 아래 흐름을 요약해서 넣는 것을 권장.",
        "",
        "## 반응 축",
        "",
    ]
    for label, words in keywords.items():
        count = sum(1 for c in comments if any(word in c["memo"] for word in words))
        lines.append(f"- {label}: {count}개")
    lines.extend(["", "## 참고용 익명 샘플", ""])
    sample_count = 0
    skip_words = [
        "쓰레기",
        "보1지",
        "초카구야",
        "이전 다음",
        "요금소",
        "신기술",
        "http",
        "www.",
    ]
    for comment in comments:
        memo = comment["memo"]
        if len(memo) < 15 or len(memo) > 180:
            continue
        if any(word in memo for word in skip_words):
            continue
        sample_count += 1
        lines.append(f"- 댓글 {sample_count}: {memo}")
        if sample_count >= 8:
            break
    lines.append("")
    return "\n".join(lines)


def image_markdown(images: list[dict[str, Any]], index: int, alt: str) -> str:
    if index >= len(images):
        return ""
    return f"\n\n![{alt}](assets/{images[index]['file']})\n\n"


def generate_rewritten_markdown(meta: dict[str, Any], downloaded: list[dict[str, Any]], embeds: list[dict[str, Any]]) -> str:
    images = [item for item in downloaded if item.get("kind") == "body-image"]
    youtube = next((item for item in embeds if item.get("type") == "youtube"), None)
    youtube_block = ""
    if youtube:
        youtube_block = (
            "\n\n"
            f"[관련 영상 보기]({youtube['url']})\n\n"
            f"![유튜브 썸네일]({youtube['thumbnail']})\n\n"
        )

    return f"""---
title: "AI가 다 해줄 줄 알았다: 혼자 게임을 만들다 공허해진 이유"
source_title: "{meta.get('title', '')}"
source_url: "{meta.get('source_url', '')}"
blog: "metasports"
status: "naver-private-draft"
tags:
  - AI게임개발
  - 바이브코딩
  - 1인개발
  - 수복
  - 시뮬라크
---

# AI가 다 해줄 줄 알았다: 혼자 게임을 만들다 공허해진 이유

처음엔 진짜 다 될 줄 알았다.

AI에게 아이디어를 던지면 게임이 나왔다. 가상도시도 만들 수 있을 것 같았고, 온라인 게임도 만들 수 있을 것 같았다. 조금만 더 밀어붙이면 혼자서도 작은 회사 하나쯤은 흉내낼 수 있을 것 같았다.

그때 나는 특이점이 이미 시작됐다고 믿었다. 버그는 과정이고, 실패는 다음 프롬프트로 넘기면 되는 문제라고 생각했다.
{image_markdown(images, 0, "초기 프로젝트 기록 이미지")}
아이디어가 생긴다.

AI를 켠다.

배포한다.

처음엔 이 속도가 너무 짜릿했다. 만들고 싶은 것이 떠오르면 바로 화면 위에 올릴 수 있었다. 예전 같으면 몇 달은 걸렸을 것들이, 이제는 며칠 또는 몇 시간 안에 형태를 갖췄다.

그런데 이상했다. 만들수록 더 확실해져야 하는데, 어느 순간부터 오히려 비어 있다는 느낌이 들었다.

## 딸깍의 속도와 남지 않는 감각

나는 계속 만들었다. 시뮬라크 월드, 온라인 게임, FPS, 수복, 퀴즈, 공연장, 여러 개의 가상 공간과 시스템들.

겉으로 보면 생산량은 늘었다. 하지만 안쪽에서는 점점 같은 질문이 커졌다.

이게 정말 내가 만들고 싶었던 것인가.

내가 원한 건 단순히 게임 하나가 아니었다. 누군가 들어와서 만들고, 남기고, 이어가고, 자기 세계를 얹을 수 있는 구조였다. 쉽게 사라지는 시대에 감정과 흔적이 끊기지 않고 남는 공간을 만들고 싶었다.
{image_markdown(images, 1, "AI 개발 과정 스크린샷")}
문제는 버그 하나가 아니었다. AI가 코드를 짜주지 못해서도 아니었다. 더 깊은 문제는 맥락이 계속 끊긴다는 데 있었다.

설명하고, 만들고, 고치고, 다시 설명한다. 어느 순간 AI는 맥락을 놓치고, 나는 다시 처음부터 구조를 붙잡아야 했다. 빠르게 만드는 능력과 오래 끌고 가는 능력은 전혀 다른 것이었다.

## 진짜 벽은 재미가 아니라 지속이었다

어느 순간 나는 내 게임을 다시 보게 됐다.

과연 재밌는가.

동접자가 붙을 만한가.

방향성은 분명한가.

그 질문 앞에서 흔들렸다. 수많은 결과물을 만들었다고 생각했지만, 정작 오래 살아남을 중심은 약했다. AI는 순간적인 구현 속도를 줬지만, 세계를 책임지는 감각까지 대신 주지는 않았다.
{image_markdown(images, 2, "프로젝트 피드백 또는 개발 기록")}
특히 온라인 게임을 만들면서 더 선명해졌다. 기술보다 어려운 건 사람이고, 기능보다 어려운 건 운영이었다. 누군가 들어오고, 악용하고, 흔들고, 예상하지 못한 방향으로 세계를 사용한다. 그때부터 게임은 코드가 아니라 관리해야 할 사회가 된다.

나는 평생 갈아 넣고도 통제하지 못하는 세계를 만들까 봐 두려웠다.

## 내가 원했던 것은 게임 하나가 아니었다

시뮬라크는 단순한 게임이 아니었다. 해체주의, 포스트모더니즘, 불교의 공사상, 메타버스와 BCI 이후의 세계까지 한 번에 밀어 넣으려 했다.

지금 생각하면 너무 컸다. 하지만 그 욕심 자체가 틀렸다고는 생각하지 않는다. 내가 붙잡고 싶었던 건 결국 하나였다.

생각과 감정과 맥락이 끊기지 않는 창작 방식.

지금의 앱과 인터페이스는 계속 끊긴다. 창작자는 도구를 오가며 다시 설명하고, 다시 붙이고, 다시 정리한다. AI가 빨라질수록 이 끊김은 더 이상하게 느껴진다.

그래서 공허했던 것 같다.

나는 게임 개발에 실패해서 멈춘 게 아니라, 지금의 창작 방식 자체가 아직 내가 원하는 세계를 담기엔 부족하다는 걸 먼저 체감해버린 쪽에 가까웠다.
{image_markdown(images, 3, "시뮬라크 또는 수복 관련 이미지")}
## 그럼에도 이 기록을 남기는 이유

이 글은 AI 개발을 하지 말자는 이야기가 아니다. 오히려 반대다. AI로 만드는 시대는 이미 왔다. 하지만 만들 수 있다는 것과 남길 수 있다는 것은 다르다.

빠르게 만드는 사람은 많아질 것이다. 하지만 오래 남는 세계를 만드는 사람은 여전히 적을 것이다.

나는 그 차이를 몸으로 맞아버렸다.

그래서 이 글을 다시 정리한다. 한 번의 푸념으로 끝내기엔, 이 감각이 너무 시대적이기 때문이다. 앞으로 더 많은 사람이 AI로 무언가를 만들고, 비슷한 속도감과 비슷한 공허를 경험하게 될 것이다.

그때 필요한 질문은 이것일지도 모른다.

우리는 AI로 무엇을 더 빨리 만들 것인가.

그리고 그중 무엇을 끝까지 남길 것인가.
{youtube_block}
## 당시 댓글 반응

원문에는 바이브코딩으로 빠르게 만들다 보면 결국 유지보수, 구조, 운영에서 현타가 온다는 반응이 많았다. 단순히 AI를 부정하는 분위기라기보다는, 빠르게 만드는 것과 오래 책임지는 것은 다르다는 쪽에 가까웠다.

원문: [{meta.get('title', 'DCInside 원문')}]({meta.get('source_url', '')})
"""


def markdown_to_simple_html(markdown: str) -> str:
    body_lines: list[str] = []
    in_list = False
    for raw in markdown.splitlines():
        line = raw.rstrip()
        if line.startswith("---"):
            continue
        if re.match(r"^[a-zA-Z_]+:", line) or line.startswith("  - "):
            continue
        if not line:
            if in_list:
                body_lines.append("</ul>")
                in_list = False
            continue
        if line.startswith("# "):
            body_lines.append(f"<h2>{html.escape(line[2:].strip())}</h2>")
            continue
        if line.startswith("## "):
            body_lines.append(f"<h3>{html.escape(line[3:].strip())}</h3>")
            continue
        img = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", line)
        if img:
            alt, src = img.groups()
            body_lines.append(f'<p><img src="{html.escape(src)}" alt="{html.escape(alt)}"></p>')
            continue
        bullet = re.match(r"- (.+)", line)
        if bullet:
            if not in_list:
                body_lines.append("<ul>")
                in_list = True
            body_lines.append(f"<li>{html.escape(bullet.group(1))}</li>")
            continue
        escaped = html.escape(line)
        linked = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', escaped)
        bolded = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", linked)
        body_lines.append(f"<p>{bolded}</p>")
    if in_list:
        body_lines.append("</ul>")
    return "\n".join(body_lines) + "\n"


def extract_image_positions(markdown: str) -> list[dict[str, str]]:
    positions = []
    for index, match in enumerate(re.finditer(r"!\[([^\]]*)\]\((assets/[^)]+)\)", markdown), start=1):
        positions.append({"anchor": f"[[IMG_{index:03d}]]", "alt": match.group(1), "path": match.group(2)})
    return positions


def markdown_to_editor_text(markdown: str) -> str:
    lines: list[str] = []
    in_front_matter = False
    image_index = 0
    for raw in markdown.splitlines():
        line = raw.rstrip()
        if line == "---":
            in_front_matter = not in_front_matter
            continue
        if in_front_matter:
            continue
        if line.startswith("# "):
            lines.append(line[2:].strip())
            lines.append("")
            continue
        if line.startswith("## "):
            lines.append("")
            lines.append(line[3:].strip())
            lines.append("")
            continue
        img = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", line)
        if img:
            src = img.group(2)
            if src.startswith("assets/"):
                image_index += 1
                lines.append(f"[[IMG_{image_index:03d}]]")
            else:
                alt = img.group(1)
                lines.append(f"[외부 이미지: {alt} / {src}]")
            lines.append("")
            continue
        line = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1: \2", line)
        line = re.sub(r"\*\*([^*]+)\*\*", r"\1", line)
        lines.append(line)
    text = "\n".join(lines)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text + "\n"


def make_upload_plan(markdown: str, downloaded: list[dict[str, Any]]) -> dict[str, Any]:
    body_images = [item for item in downloaded if item.get("kind") == "body-image" and item.get("file")]
    positions = extract_image_positions(markdown)
    return {
        "mode": "browser_editor",
        "note": "Use this when Naver API does not preserve exact in-body image placement.",
        "body_images_available": len(body_images),
        "positions_in_rewritten_draft": positions,
        "recommended_first_pass": "paste text with short image anchors, then replace each anchor with its image",
    }


def first_non_empty_line(text: str, default: str = "") -> str:
    for line in text.splitlines():
        stripped = line.strip()
        if stripped:
            return stripped
    return default


def build_editor_payload(package_dir: Path) -> dict[str, Any]:
    meta = json.loads((package_dir / "meta.json").read_text(encoding="utf-8"))
    body_path = package_dir / "naver_editor_clipboard.txt"
    plan_path = package_dir / "editor_upload_plan.json"
    body_text = body_path.read_text(encoding="utf-8")
    upload_plan = json.loads(plan_path.read_text(encoding="utf-8"))
    positions = upload_plan.get("positions_in_rewritten_draft", [])
    target_blog = meta.get("target_blog") or "metasports"

    assets = []
    for position in positions:
        relative_path = position.get("path", "")
        asset_path = package_dir / relative_path
        assets.append(
            {
                "anchor": position.get("anchor", ""),
                "alt": position.get("alt", ""),
                "relative_path": relative_path,
                "absolute_path": str(asset_path.resolve()),
                "exists": asset_path.exists(),
                "mime_type": mimetypes.guess_type(asset_path.name)[0] or "application/octet-stream",
            }
        )

    anchors_in_body = re.findall(r"\[\[IMG_\d{3}\]\]", body_text)
    return {
        "schema_version": 1,
        "mode": "naver_smarteditor_browser",
        "target_blog": target_blog,
        "write_url": f"https://blog.naver.com/PostWriteForm.naver?blogId={target_blog}",
        "source_url": meta.get("source_url", ""),
        "source_title": meta.get("title", ""),
        "title": first_non_empty_line(body_text, meta.get("title", "")),
        "body_text_path": str(body_path.resolve()),
        "body_text": body_text,
        "upload_plan_path": str(plan_path.resolve()),
        "anchors_in_body": anchors_in_body,
        "assets": assets,
        "notes": [
            "Create or refresh a private/temp Naver SmartEditor draft before public release.",
            "Do not use coordinate-only image placement as the primary automation path.",
            "Replace anchors only after verifying each target anchor still exists in the editor body.",
        ],
    }


def write_editor_payload(args: argparse.Namespace) -> None:
    package_dir = Path(args.package)
    payload = build_editor_payload(package_dir)
    out_path = Path(args.out) if args.out else package_dir / "browser_editor_payload.json"
    if args.no_body:
        payload = {**payload, "body_text": ""}
    write_json(out_path, payload)
    missing = [item for item in payload.get("assets", []) if not item.get("exists")]
    result = {
        "ok": not missing,
        "out": str(out_path),
        "title": payload.get("title", ""),
        "anchors": len(payload.get("anchors_in_body", [])),
        "assets": len(payload.get("assets", [])),
        "missing_assets": len(missing),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if missing:
        raise SystemExit(1)


def fetch_package(args: argparse.Namespace) -> None:
    out_dir = Path(args.out)
    assets_dir = out_dir / "assets"
    out_dir.mkdir(parents=True, exist_ok=True)
    assets_dir.mkdir(parents=True, exist_ok=True)

    cookie_jar = CookieJar()
    opener = build_opener(HTTPCookieProcessor(cookie_jar))
    page_html = read_text(opener, args.url, referer="https://gall.dcinside.com/")
    write_div = extract_write_div(page_html)
    if not write_div:
        raise RuntimeError("Could not find DCInside write_div content.")

    title = first_text(r'<span class="title_subject">(.*?)</span>', page_html, "untitled")
    date = first_text(r'<span class="gall_date"[^>]*>(.*?)</span>', page_html)
    view_count = first_text(r'<span class="gall_count">(.*?)</span>', page_html)
    recommend = first_text(r'<span class="gall_reply_num">(.*?)</span>', page_html)
    comment_count = first_text(r'<span class="gall_comment"><a[^>]*>(.*?)</a></span>', page_html)
    meta = {
        "source_url": args.url,
        "title": title,
        "date": date,
        "view_count": view_count,
        "recommend": recommend,
        "comment_count": comment_count,
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "target_blog": args.blog,
    }

    collector = collect_media(write_div)
    appended = collect_appended_files(page_html)
    embeds = build_embeds(collector.links, collector.iframes, collector.videos)

    (out_dir / "original.html").write_text(write_div, encoding="utf-8")
    (out_dir / "original.md").write_text(markdown_from_html(write_div), encoding="utf-8")
    write_json(out_dir / "meta.json", meta)
    write_json(out_dir / "media.json", {"images": collector.images, "videos": collector.videos, "links": collector.links, "appended_files": appended})
    write_json(out_dir / "embeds.json", embeds)

    downloaded: list[dict[str, Any]] = []
    for index, image in enumerate([i for i in collector.images if i["kind"] == "image"], start=1):
        try:
            local = download_asset(opener, image["url"], assets_dir / f"body-{index:03d}.bin", referer=args.url)
            local.update({"kind": "body-image", "alt": image.get("alt", ""), "source": "write_div"})
            downloaded.append(local)
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            downloaded.append({"kind": "body-image", "url": image["url"], "error": str(exc), "source": "write_div"})

    for index, item in enumerate(appended, start=1):
        try:
            local = download_asset(opener, item["url"], assets_dir / f"attachment-{index:03d}.bin", referer=args.url, preferred_name=item.get("name"))
            local.update({"kind": "attachment", "original_name": item.get("name", ""), "source": "appending_file"})
            downloaded.append(local)
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            downloaded.append({"kind": "attachment", "url": item["url"], "name": item.get("name", ""), "error": str(exc), "source": "appending_file"})

    write_json(out_dir / "downloaded_assets.json", downloaded)

    comments = fetch_comments(opener, page_html, source_url=args.url)
    write_json(out_dir / "comments.json", comments)
    (out_dir / "comments_summary.md").write_text(make_comments_summary(comments), encoding="utf-8")

    rewritten = generate_rewritten_markdown(meta, downloaded, embeds)
    (out_dir / "rewritten.md").write_text(rewritten, encoding="utf-8")
    (out_dir / "naver_content.html").write_text(markdown_to_simple_html(rewritten), encoding="utf-8")
    api_markdown = re.sub(r"!\[([^\]]*)\]\((assets/[^)]+)\)", r"**[\1]**", rewritten)
    (out_dir / "naver_api_content.html").write_text(markdown_to_simple_html(api_markdown), encoding="utf-8")
    (out_dir / "naver_editor_clipboard.txt").write_text(markdown_to_editor_text(rewritten), encoding="utf-8")
    write_json(out_dir / "editor_upload_plan.json", make_upload_plan(rewritten, downloaded))
    upsert_package_in_ledger(out_dir, Path(args.ledger), "draft_ready")

    print(json.dumps({"ok": True, "out": str(out_dir), "assets": len(downloaded), "comments": len(comments.get("comments", []))}, ensure_ascii=False))


def auth_url(args: argparse.Namespace) -> None:
    state = args.state or secrets.token_urlsafe(18)
    query = urllib.parse.urlencode(
        {
            "response_type": "code",
            "client_id": args.client_id or os.environ.get("NAVER_CLIENT_ID", ""),
            "redirect_uri": args.redirect_uri or os.environ.get("NAVER_REDIRECT_URI", ""),
            "state": state,
        }
    )
    print(NAVER_AUTH_URL + "?" + query)
    print(f"state={state}")


def exchange_code(args: argparse.Namespace) -> None:
    client_id = args.client_id or os.environ.get("NAVER_CLIENT_ID", "")
    client_secret = args.client_secret or os.environ.get("NAVER_CLIENT_SECRET", "")
    redirect_uri = args.redirect_uri or os.environ.get("NAVER_REDIRECT_URI", "")
    if not client_id or not client_secret or not args.code or not args.state:
        raise SystemExit("client id, client secret, code, and state are required.")
    query = urllib.parse.urlencode(
        {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "code": args.code,
            "state": args.state,
            "redirect_uri": redirect_uri,
        }
    )
    opener = build_opener()
    raw, _ = request_bytes(opener, NAVER_TOKEN_URL + "?" + query)
    token_data = json.loads(raw.decode("utf-8", "ignore"))
    Path(args.out).write_text(json.dumps(token_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote token response to {args.out}")


def load_token(args: argparse.Namespace) -> str:
    if args.access_token:
        return args.access_token
    if os.environ.get("NAVER_ACCESS_TOKEN"):
        return os.environ["NAVER_ACCESS_TOKEN"]
    token_file = Path(args.token_file)
    if token_file.exists():
        data = json.loads(token_file.read_text(encoding="utf-8"))
        token = data.get("access_token")
        if token:
            return token
    raise SystemExit("Missing NAVER_ACCESS_TOKEN. Use --access-token, env var, or .naver-token.json.")


def multipart_body(fields: list[tuple[str, str]], files: list[tuple[str, Path]]) -> tuple[bytes, str]:
    boundary = "----codexNaverBoundary" + secrets.token_hex(12)
    chunks: list[bytes] = []
    for name, value in fields:
        chunks.append(f"--{boundary}\r\n".encode())
        chunks.append(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        chunks.append(value.encode("utf-8"))
        chunks.append(b"\r\n")
    for field_name, path in files:
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        chunks.append(f"--{boundary}\r\n".encode())
        chunks.append(
            f'Content-Disposition: form-data; name="{field_name}"; filename="{path.name}"\r\n'
            f"Content-Type: {mime}\r\n\r\n".encode()
        )
        chunks.append(path.read_bytes())
        chunks.append(b"\r\n")
    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), boundary


def publish_private(args: argparse.Namespace) -> None:
    package_dir = Path(args.package)
    meta = json.loads((package_dir / "meta.json").read_text(encoding="utf-8"))
    title = args.title or "AI가 다 해줄 줄 알았다: 혼자 게임을 만들다 공허해진 이유"
    api_content = package_dir / "naver_api_content.html"
    content = (api_content if api_content.exists() else package_dir / "naver_content.html").read_text(encoding="utf-8")
    token = load_token(args)

    fields = [
        ("title", title),
        ("contents", content),
        ("options.openType", "closed"),
        ("options.allowComment", "true"),
        ("options.allowSympathy", "true"),
        ("options.allowSearch", "false"),
        ("options.scrapType", "link"),
    ]
    if args.category_no:
        fields.append(("categoryNo", str(args.category_no)))

    downloaded = json.loads((package_dir / "downloaded_assets.json").read_text(encoding="utf-8"))
    image_files: list[tuple[str, Path]] = []
    for item in downloaded:
        if item.get("kind") != "body-image" or not item.get("file"):
            continue
        path = package_dir / "assets" / item["file"]
        if path.exists():
            image_files.append(("image", path))
        if len(image_files) >= args.max_images:
            break

    body, boundary = multipart_body(fields, image_files)
    opener = build_opener()
    raw, _ = request_bytes(
        opener,
        NAVER_WRITE_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )
    response = json.loads(raw.decode("utf-8", "ignore"))
    write_json(package_dir / "publish_response.json", response)
    meta_path = package_dir / "meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    meta["naver_publish_response"] = response
    if isinstance(response, dict):
        meta["naver_url"] = response.get("url") or response.get("message", {}).get("url", "")
    write_json(meta_path, meta)
    upsert_package_in_ledger(package_dir, Path(args.ledger), "naver_private_published")
    print(json.dumps({"ok": True, "target_blog": meta.get("target_blog"), "response": response}, ensure_ascii=False))


def list_categories(args: argparse.Namespace) -> None:
    token = load_token(args)
    opener = build_opener()
    raw, _ = request_bytes(
        opener,
        "https://openapi.naver.com/blog/listCategory.json",
        headers={"Authorization": f"Bearer {token}"},
    )
    print(raw.decode("utf-8", "ignore"))


def validate_package(args: argparse.Namespace) -> None:
    package_dir = Path(args.package)
    required = [
        "meta.json",
        "original.html",
        "original.md",
        "rewritten.md",
        "naver_api_content.html",
        "naver_editor_clipboard.txt",
        "editor_upload_plan.json",
        "comments.json",
        "comments_summary.md",
        "downloaded_assets.json",
        "embeds.json",
    ]
    errors: list[str] = []
    for name in required:
        if not (package_dir / name).exists():
            errors.append(f"missing {name}")
    stats = package_stats(package_dir) if not errors else {}
    if stats:
        if stats["body_image_count"] == 0:
            errors.append("no body images downloaded")
        if stats["comment_count"] == 0:
            errors.append("no comments collected")
        if stats["asset_error_count"]:
            errors.append(f"{stats['asset_error_count']} asset downloads failed")
    clipboard_path = package_dir / "naver_editor_clipboard.txt"
    plan_path = package_dir / "editor_upload_plan.json"
    if clipboard_path.exists() and plan_path.exists():
        body_text = clipboard_path.read_text(encoding="utf-8")
        upload_plan = json.loads(plan_path.read_text(encoding="utf-8"))
        positions = upload_plan.get("positions_in_rewritten_draft", [])
        anchors_in_body = re.findall(r"\[\[IMG_\d{3}\]\]", body_text)
        expected_anchors = [item.get("anchor", "") for item in positions]
        for anchor in expected_anchors:
            if anchor and anchor not in anchors_in_body:
                errors.append(f"missing editor anchor {anchor}")
        if len(anchors_in_body) != len(expected_anchors):
            errors.append(f"editor anchor count mismatch: body={len(anchors_in_body)} plan={len(expected_anchors)}")
        for item in positions:
            relative_path = item.get("path", "")
            if relative_path and not (package_dir / relative_path).exists():
                errors.append(f"missing editor asset {relative_path}")
    result = {"ok": not errors, "package": str(package_dir), "errors": errors, "stats": {k: v for k, v in stats.items() if k != "meta"}}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)


def show_status(args: argparse.Namespace) -> None:
    ledger_path = Path(args.ledger)
    ledger = load_ledger(ledger_path)
    items = ledger.get("items", [])
    if args.json:
        print(json.dumps(ledger, ensure_ascii=False, indent=2))
        return
    print(f"ledger: {ledger_path}")
    print(f"items: {len(items)}")
    for item in items:
        stats = item.get("stats", {})
        print(
            " - "
            + f"{item.get('id')} [{item.get('stage')}] "
            + f"{item.get('source_title')} | "
            + f"assets={stats.get('asset_count', 0)} comments={stats.get('comment_count', 0)} "
            + f"youtube={stats.get('youtube_count', 0)} next={item.get('next_action')}"
        )


def mark_stage(args: argparse.Namespace) -> None:
    ledger_path = Path(args.ledger)
    ledger = load_ledger(ledger_path)
    found = None
    for item in ledger.get("items", []):
        if item.get("id") == args.id:
            found = item
            break
    if not found:
        raise SystemExit(f"No ledger item found for id={args.id}")
    found["stage"] = args.stage
    found["updated_at"] = now_stamp()
    found["next_action"] = args.next_action or STAGE_NEXT_ACTION.get(args.stage, "decide_next_action")
    if args.naver_url:
        found["naver_url"] = args.naver_url
    if args.public_url:
        found["public_url"] = args.public_url
    if args.note:
        notes = found.setdefault("notes", [])
        notes.append({"at": now_stamp(), "text": args.note})
    save_ledger(ledger_path, ledger)
    print(json.dumps({"ok": True, "id": args.id, "stage": args.stage, "next_action": found["next_action"]}, ensure_ascii=False))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="DCInside to Naver Blog private draft pipeline")
    sub = parser.add_subparsers(dest="command", required=True)

    fetch = sub.add_parser("fetch", help="Fetch DCInside source post and generate local draft package")
    fetch.add_argument("--url", default=SOURCE_URL)
    fetch.add_argument("--out", default=str(DEFAULT_OUT))
    fetch.add_argument("--blog", default="metasports")
    fetch.add_argument("--ledger", default=str(DEFAULT_LEDGER))
    fetch.set_defaults(func=fetch_package)

    auth = sub.add_parser("auth-url", help="Print Naver OAuth authorization URL")
    auth.add_argument("--client-id")
    auth.add_argument("--redirect-uri")
    auth.add_argument("--state")
    auth.set_defaults(func=auth_url)

    exchange = sub.add_parser("exchange-code", help="Exchange Naver OAuth code for token JSON")
    exchange.add_argument("--client-id")
    exchange.add_argument("--client-secret")
    exchange.add_argument("--redirect-uri")
    exchange.add_argument("--code", required=True)
    exchange.add_argument("--state", required=True)
    exchange.add_argument("--out", default=".naver-token.json")
    exchange.set_defaults(func=exchange_code)

    cats = sub.add_parser("list-categories", help="List Naver Blog categories")
    cats.add_argument("--access-token")
    cats.add_argument("--token-file", default=".naver-token.json")
    cats.set_defaults(func=list_categories)

    publish = sub.add_parser("publish-private", help="Publish package to Naver Blog as a private post")
    publish.add_argument("--package", default=str(DEFAULT_OUT))
    publish.add_argument("--access-token")
    publish.add_argument("--token-file", default=".naver-token.json")
    publish.add_argument("--category-no")
    publish.add_argument("--title")
    publish.add_argument("--max-images", type=int, default=8)
    publish.add_argument("--ledger", default=str(DEFAULT_LEDGER))
    publish.set_defaults(func=publish_private)

    validate = sub.add_parser("validate", help="Validate a generated draft package")
    validate.add_argument("--package", default=str(DEFAULT_OUT))
    validate.set_defaults(func=validate_package)

    editor_payload = sub.add_parser("editor-payload", help="Write a browser-editor payload for Naver SmartEditor")
    editor_payload.add_argument("--package", default=str(DEFAULT_OUT))
    editor_payload.add_argument("--out")
    editor_payload.add_argument("--no-body", action="store_true", help="Omit inline body_text from the payload JSON")
    editor_payload.set_defaults(func=write_editor_payload)

    status = sub.add_parser("status", help="Show pipeline ledger status")
    status.add_argument("--ledger", default=str(DEFAULT_LEDGER))
    status.add_argument("--json", action="store_true")
    status.set_defaults(func=show_status)

    mark = sub.add_parser("mark", help="Mark a ledger item stage after human review or manual publish")
    mark.add_argument("--ledger", default=str(DEFAULT_LEDGER))
    mark.add_argument("--id", required=True)
    mark.add_argument("--stage", required=True, choices=sorted(STAGE_NEXT_ACTION.keys()))
    mark.add_argument("--naver-url")
    mark.add_argument("--public-url")
    mark.add_argument("--next-action")
    mark.add_argument("--note")
    mark.set_defaults(func=mark_stage)
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
