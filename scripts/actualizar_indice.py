import argparse
import hashlib
import html
import json
import logging
import os
import re
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG = ROOT / "fuentes_indice.json"
DEFAULT_OUTPUT = ROOT / "indice.json"
DEFAULT_OUTPUT_JS = ROOT / "indice.js"
DEFAULT_LOG = ROOT / "scripts" / "indice.log"
LOCK_PATH = ROOT / "scripts" / ".indice.lock"
LAST_RUN_PATH = ROOT / "scripts" / ".indice.last_run"


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def today_utc():
    return datetime.now(timezone.utc).date().isoformat()


def local_name(tag):
    return tag.rsplit("}", 1)[-1].lower()


def safe_url(value, base=""):
    if not value:
        return None
    value = str(value).strip()
    if not value:
        return None
    value = urljoin(base, value)
    if not re.match(r"^https?://", value, re.I):
        return None
    return value


def strip_html(value):
    if not value:
        return ""
    value = html.unescape(value)
    value = re.sub(r"<script\b[^>]*>.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<style\b[^>]*>.*?</style>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def first_image(value):
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', value or "", flags=re.I)
    return match.group(1) if match else None


def parse_date(value):
    if not value:
        return None
    value = str(value).strip()
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except Exception:
        pass
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except Exception:
        return None


def truncate(value, limit=300):
    value = re.sub(r"\s+", " ", str(value or "")).strip()
    if len(value) <= limit:
        return value
    return value[: limit - 1].rstrip() + "…"


def child_text(element, names):
    for child in element:
        if local_name(child.tag) in names:
            return "".join(child.itertext()).strip()
    return ""


def make_item(source, url, title, summary, published_at, image, tags):
    base = source.get("url") or source.get("search_url") or ""
    url = safe_url(url, base)
    if not url:
        return None
    title = truncate(strip_html(title), 180)
    if not title:
        return None
    image = safe_url(image, base) if image else None
    clean_tags = []
    for tag in tags or []:
        tag = truncate(strip_html(tag), 40)
        if tag and tag not in clean_tags:
            clean_tags.append(tag)
    item_id = f"{source['id']}:{hashlib.sha1(url.encode('utf-8')).hexdigest()[:12]}"
    return {
        "id": item_id,
        "source_id": source["id"],
        "source_name": source["name"],
        "category": source.get("category", "maker"),
        "language": source.get("language", "multi"),
        "title": title,
        "url": url,
        "summary": truncate(strip_html(summary), 320),
        "published_at": published_at,
        "image": image,
        "tags": clean_tags[:8],
        "method": source.get("method"),
        "fetched_at": now_iso(),
    }


def parse_github(source, payload):
    items = []
    for repo in (payload.get("items") or [])[: source.get("max_items", 12)]:
        tags = ["github"] + [str(t) for t in (repo.get("topics") or [])]
        if repo.get("language"):
            tags.append(str(repo["language"]))
        item = make_item(
            source,
            repo.get("html_url"),
            repo.get("full_name") or repo.get("name") or "",
            repo.get("description") or "",
            parse_date(repo.get("updated_at") or repo.get("pushed_at")),
            None,
            tags,
        )
        if item:
            items.append(item)
    return items


def parse_discourse(source, payload):
    items = []
    topics = ((payload.get("topic_list") or {}).get("topics") or [])[: source.get("max_items", 12)]
    base = source.get("base_url") or "https://forum.arduino.cc"
    for topic in topics:
        title = topic.get("title") or ""
        slug = topic.get("slug") or "t"
        topic_id = topic.get("id")
        url = f"{base}/t/{slug}/{topic_id}" if topic_id else ""
        excerpt = strip_html(topic.get("excerpt") or "")
        if excerpt == strip_html(title):
            excerpt = ""
        tags = ["arduino", "foro"] + [str(t) for t in (topic.get("tags") or [])]
        item = make_item(
            source,
            url,
            title,
            excerpt,
            parse_date(topic.get("created_at") or topic.get("last_posted_at")),
            None,
            tags,
        )
        if item:
            items.append(item)
    return items


def parse_feed(source, raw):
    raw = raw.lstrip(b"\xef\xbb\xbf")
    try:
        parser = ET.XMLParser(resolve_entities=False)
        root = ET.fromstring(raw, parser=parser)
    except (ET.ParseError, ValueError) as exc:
        raise ValueError(f"XML invalido: {exc}") from exc
    entries = [node for node in root.iter() if local_name(node.tag) in ("item", "entry")]
    items = []
    for entry in entries[: source.get("max_items", 12)]:
        title = child_text(entry, ("title",))
        link = ""
        for child in entry:
            if local_name(child.tag) != "link":
                continue
            href = child.attrib.get("href")
            rel = child.attrib.get("rel", "alternate")
            if href and rel in ("alternate", ""):
                link = href
                break
            if not link and child.text:
                link = child.text.strip()
        if not link:
            link = child_text(entry, ("link", "id"))
        summary = ""
        for names in (("summary",), ("description",), ("content",)):
            summary = child_text(entry, names)
            if summary:
                break
        image = None
        for node in entry.iter():
            if local_name(node.tag) in ("enclosure", "content", "thumbnail", "image"):
                candidate = node.attrib.get("url") or node.attrib.get("href")
                if candidate and re.search(r"\.(jpe?g|png|webp|gif|avif)(\?|#|$)", candidate, re.I):
                    image = candidate
                    break
        if not image:
            image = first_image(" ".join(child_text(entry, ("description", "summary", "content"))))
        published_at = parse_date(child_text(entry, ("pubdate", "published", "updated", "date")))
        tags = []
        for child in entry:
            if local_name(child.tag) == "category":
                tag = child.attrib.get("term") or "".join(child.itertext())
                if tag:
                    tags.append(tag)
        item = make_item(source, link, title, summary, published_at, image, tags)
        if item:
            items.append(item)
    return items


def build_url(source):
    url = source.get("url")
    if not url:
        return None
    params = source.get("params") or {}
    if params:
        url += ("&" if "?" in url else "?") + urlencode(params)
    return url


def fetch_source(source, config, args, counter):
    url = build_url(source)
    if not url:
        raise ValueError("URL vacia")
    if counter["count"] >= counter["max"]:
        raise RuntimeError(f"Limite de requests alcanzado ({counter['max']})")
    headers = {
        "User-Agent": config.get("user_agent", "ProjectusIndexer/1.0"),
        "Accept": "application/json, application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    }
    if source.get("type") == "github_search":
        headers["Accept"] = "application/vnd.github+json"
        headers["X-GitHub-Api-Version"] = "2022-11-28"
        token = os.environ.get(config.get("github_token_env", "GITHUB_TOKEN"))
        if token:
            headers["Authorization"] = f"Bearer {token}"
    counter["count"] += 1
    request = Request(url, headers=headers)
    timeout = args.timeout if args.timeout is not None else config.get("timeout_seconds", 20)
    with urlopen(request, timeout=timeout) as response:
        raw = response.read()
        return response.status, response.headers.get("Content-Type", ""), raw, url


def parse_source(source, status, content_type, raw):
    source_type = source.get("type")
    if source_type == "github_search":
        return parse_github(source, json.loads(raw.decode("utf-8")))
    if source_type == "discourse_latest":
        return parse_discourse(source, json.loads(raw.decode("utf-8")))
    if source_type in ("rss", "atom"):
        return parse_feed(source, raw)
    raise ValueError(f"Tipo no soportado: {source_type}")


def base_status(source):
    return {
        "id": source.get("id"),
        "name": source.get("name"),
        "method": source.get("method"),
        "type": source.get("type"),
        "status": "skipped",
        "http_status": None,
        "count": 0,
        "fetched_at": None,
        "duration_ms": None,
        "error": None,
        "stale": False,
        "url": None,
    }


def deep_link_status(source):
    status = base_status(source)
    status["status"] = "deep_link_only"
    return status


def acquire_lock(force=False):
    LOCK_PATH.parent.mkdir(parents=True, exist_ok=True)
    if force:
        try:
            LOCK_PATH.unlink()
        except FileNotFoundError:
            pass
    try:
        fd = os.open(LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(fd, str(os.getpid()).encode("ascii"))
        return fd
    except FileExistsError:
        return None


def release_lock(fd):
    if fd is None:
        return
    try:
        os.close(fd)
    except OSError:
        pass
    try:
        LOCK_PATH.unlink()
    except FileNotFoundError:
        pass


def load_previous(path):
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    grouped = {}
    for item in data.get("items") or []:
        source_id = item.get("source_id")
        if source_id:
            grouped.setdefault(source_id, []).append(item)
    return grouped


def dedupe_and_sort(items):
    unique = {}
    for item in items:
        url = item.get("url")
        if not url:
            continue
        previous = unique.get(url)
        if previous is None or (item.get("published_at") or "") > (previous.get("published_at") or ""):
            unique[url] = item
    result = list(unique.values())
    result.sort(key=lambda item: item.get("published_at") or "", reverse=True)
    return result


def write_outputs(payload, output, output_js):
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    output_js.write_text(
        "window.INDICE_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )


def main(argv=None):
    parser = argparse.ArgumentParser(description="Genera indice.json e indice.js desde APIs y RSS permitidos.")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--output-js", type=Path, default=DEFAULT_OUTPUT_JS)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--only-source", action="append", default=[])
    parser.add_argument("--max-requests", type=int)
    parser.add_argument("--timeout", type=float)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args(argv)

    config = json.loads(args.config.read_text(encoding="utf-8"))
    sources = config.get("sources") or []
    only = set(args.only_source or [])

    if args.dry_run:
        for source in sources:
            if source.get("method") == "deep_link" or not source.get("enabled"):
                continue
            if only and source.get("id") not in only:
                continue
            print(f"{source.get('id')}: {source.get('method')} {build_url(source)}")
        return 0

    if not args.force and LAST_RUN_PATH.exists() and LAST_RUN_PATH.read_text(encoding="utf-8").strip() == today_utc():
        print("Ya se ejecuto hoy. Usa --force para forzar.")
        return 0

    LOCK_PATH.parent.mkdir(parents=True, exist_ok=True)
    DEFAULT_LOG.parent.mkdir(parents=True, exist_ok=True)
    handlers = [logging.StreamHandler(sys.stderr)]
    try:
        handlers.append(logging.FileHandler(DEFAULT_LOG, encoding="utf-8"))
    except OSError:
        pass
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=handlers,
    )

    lock_fd = acquire_lock(args.force)
    if lock_fd is None:
        print("Hay otra ejecucion en curso. Si no es asi, borra scripts/.indice.lock.")
        return 1

    try:
        previous = load_previous(args.output)
        max_requests = args.max_requests if args.max_requests is not None else config.get("max_requests_per_run", 12)
        counter = {"count": 0, "max": max_requests}
        delay = config.get("request_delay_seconds", 2)
        all_items = []
        statuses = []
        successes = 0
        attempted = 0

        for source in sources:
            status = base_status(source)
            if source.get("method") == "deep_link":
                statuses.append(deep_link_status(source))
                continue
            if not source.get("enabled"):
                statuses.append(status)
                continue
            if only and source.get("id") not in only:
                statuses.append(status)
                continue

            attempted += 1
            started = time.time()
            try:
                http_status, content_type, raw, request_url = fetch_source(source, config, args, counter)
                items = parse_source(source, http_status, content_type, raw)
                all_items.extend(items)
                status.update(
                    {
                        "status": "ok",
                        "http_status": http_status,
                        "count": len(items),
                        "fetched_at": now_iso(),
                        "duration_ms": int((time.time() - started) * 1000),
                        "url": request_url,
                    }
                )
                successes += 1
                logging.info("%s: %s items", source.get("id"), len(items))
            except Exception as exc:
                previous_items = previous.get(source.get("id"), [])
                for item in previous_items:
                    item = dict(item)
                    item["stale"] = True
                    all_items.append(item)
                status.update(
                    {
                        "status": "error",
                        "http_status": getattr(exc, "code", None),
                        "count": len(previous_items),
                        "fetched_at": previous_items[0].get("fetched_at") if previous_items else None,
                        "duration_ms": int((time.time() - started) * 1000),
                        "error": f"{type(exc).__name__}: {exc}",
                        "stale": bool(previous_items),
                        "url": build_url(source),
                    }
                )
                logging.warning("%s: %s", source.get("id"), exc)
            statuses.append(status)
            if counter["count"] < counter["max"]:
                time.sleep(delay)

        payload = {
            "schema_version": 1,
            "generated_at": now_iso(),
            "user_agent": config.get("user_agent"),
            "sources": statuses,
            "items": dedupe_and_sort(all_items),
        }
        write_outputs(payload, args.output, args.output_js)
        if successes:
            LAST_RUN_PATH.write_text(today_utc(), encoding="utf-8")
        logging.info(
            "Indice generado: %s items, %s fuentes ok, %s intentos",
            len(payload["items"]),
            successes,
            attempted,
        )
        if attempted and successes == 0:
            return 1
        return 0
    finally:
        release_lock(lock_fd)


if __name__ == "__main__":
    raise SystemExit(main())
