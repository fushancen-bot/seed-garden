// ===== Seed Garden utilities =====

const STAGES = {
  seedling:  { icon: '🌰', label: '种子', min: 0,  max: 1 },
  sprout:    { icon: '🌱', label: '萌芽', min: 2,  max: 4 },
  growing:   { icon: '🌿', label: '生长', min: 5,  max: Infinity },
};

function stageOf(waters) {
  if (waters <= 1) return 'seedling';
  if (waters <= 4) return 'sprout';
  return 'growing';
}

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
function fmtTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function fmtLongDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()} · ${d.getMonth() + 1}月${d.getDate()}日`;
}
function hoursSince(iso) {
  return (Date.now() - new Date(iso).getTime()) / 3.6e6;
}

// Take a body string + seed list (excluding self) and pick up to `limit`
// others that share any meaningful word (>=2 chars) OR whose short title
// appears explicitly. Light-touch: doesn't need tagging.
function autoRelated(body, self, all, limit = 3) {
  if (!body) return [];
  const othersLive = all.filter((s) => s.id !== self.id && !s.bloomed);
  const bodyL = body;
  const scored = othersLive
    .map((s) => {
      let score = 0;
      const sTitle = firstWords(s.body, 8);
      if (sTitle && bodyL.includes(sTitle)) score += 5;
      // shared rare-ish bigrams
      const myChars = new Set(bodyL.replace(/[^\u4e00-\u9fffA-Za-z]/g, ''));
      const otherChars = new Set(s.body.replace(/[^\u4e00-\u9fffA-Za-z]/g, ''));
      let overlap = 0;
      myChars.forEach((c) => { if (otherChars.has(c)) overlap++; });
      score += overlap / 12;
      return { s, score };
    })
    .filter((x) => x.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((x) => x.s);
}

function firstWords(body, n) {
  return (body || '').split('\n')[0].slice(0, n);
}

function preview(body, n = 14) {
  const first = (body || '').split('\n')[0];
  return first.slice(0, n) + (first.length > n ? '…' : '');
}

// Parse @mentions by scanning body text for substrings matching the FIRST 2-8
// chars of any other live seed's first line. This means typing the name
// auto-links with OR without @.
function extractMentions(body, self, all) {
  if (!body) return [];
  const others = all.filter((s) => s.id !== self.id && !s.bloomed);
  const found = new Set();
  others.forEach((s) => {
    const key = firstWords(s.body, 6).trim();
    if (key && key.length >= 2 && body.includes(key)) found.add(s.id);
  });
  return [...found].map((id) => others.find((x) => x.id === id));
}

window.SG = { STAGES, stageOf, fmtDate, fmtTime, fmtLongDate, hoursSince, autoRelated, firstWords, preview, extractMentions };
