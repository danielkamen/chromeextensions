// Add absolute timestamps next to <relative-time> on GitHub commit lists.

const ADDED_FLAG = "data-abs-ts-added";
const ABS_CLASS = "gh-abs-timestamp";

// Formats as local time with timezone abbreviation, "2025-06-09 11:04:33 EDT"
function formatLocal(dt) {
  const d = new Date(dt);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short"
  })
  .format(d)
  // make it "YYYY-MM-DD HH:MM:SS TZ"
  .replace(/^(\d{2})\/(\d{2})\/(\d{4})/, (_, m, d, y) => `${y}-${m}-${d}`)
  .replace(",", "");
}

function addAbsoluteTimestamp(el) {
  if (!el || el.getAttribute(ADDED_FLAG) === "1") return;

  // GitHub typically uses <relative-time datetime="...">...</relative-time>
  const iso =
    el.getAttribute("datetime") ||
    el.getAttribute("title") || // sometimes present
    el.textContent;             // fallback

  if (!iso) return;

  const abs = formatLocal(iso);

  const span = document.createElement("span");
  span.className = ABS_CLASS;
  span.style.marginLeft = "0.25rem";
  span.style.whiteSpace = "nowrap";
  span.style.opacity = "0.8";
  span.textContent = `@ ${abs}`;

  // Add a helpful title with UTC too
  const utc = new Date(iso).toISOString().replace("T", " ").replace("Z", " UTC");
  span.title = `UTC: ${utc}`;

  // Common commit list structure: the <relative-time> sits inline in the “authored on …” line.
  el.insertAdjacentElement("afterend", span);
  el.setAttribute(ADDED_FLAG, "1");
}

function processAll() {
  // GitHub uses <relative-time> and sometimes <time-ago>
  const nodes = document.querySelectorAll("relative-time, time-ago");
  nodes.forEach(addAbsoluteTimestamp);
}

// Observe dynamic updates (GitHub uses Turbo/pjax)
const observer = new MutationObserver(() => processAll());
observer.observe(document.documentElement, { childList: true, subtree: true });

// Run once on load
processAll();
