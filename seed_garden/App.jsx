const { useState: useS, useEffect: useE, useRef: useR } = React;

const KEY = 'xiaoshan_seed_garden_v1';

const INIT = [
  { id: 's1', body: '旧书店的猫叫「页脚」。她总在下午三点准时出现，蜷在诗歌区第二格，像一只毛茸茸的书签。\n\n今天它的尾巴指向了一本从没读过的诗集——封面是蓝色的海。',
    createdAt: '2026-04-19T15:12:00', lastWatered: '2026-04-21T10:00:00', waters: 5 },
  { id: 's2', body: '如果颜色会发声，蓝色会是低频的嗡鸣，红色是短促的爆裂，黄色像一串笑声。那白色呢？白色大概是暂停。',
    createdAt: '2026-04-17T21:40:00', lastWatered: '2026-04-17T21:40:00', waters: 1 },
  { id: 's3', body: '小舟，26 岁，插画师，住在一间朝西的公寓里。总是随身带着一支 B4 的铅笔，习惯在餐巾纸上画路过的陌生人。\n\n她画了「页脚」很多次，都没画好。',
    createdAt: '2026-04-15T11:02:00', lastWatered: '2026-04-22T09:20:00', waters: 8 },
  { id: 's4', body: '一个卖梦的小店。店里只卖用过的梦——别人做过一次、记得很清晰的那种。每个梦标价不同，最贵的是童年的夏天。',
    createdAt: '2026-04-08T19:20:00', lastWatered: '2026-04-10T19:20:00', waters: 3 },
  { id: 's5', body: '「你注意过吗，雨停的那一秒钟，世界会突然安静得像被按了暂停键。」她说这话的时候，我们正站在便利店的屋檐下。',
    createdAt: '2026-04-12T14:55:00', lastWatered: '2026-04-12T14:55:00', waters: 0 },
];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return INIT;
}
function save(seeds) {
  try { localStorage.setItem(KEY, JSON.stringify(seeds)); } catch (e) {}
}

const FONT_KEY = 'xiaoshan_seed_garden_font';

function App() {
  const [seeds, setSeeds] = useS(load);
  const [filter, setFilter] = useS('all');
  const [openId, setOpenId] = useS(null);
  const [drawer, setDrawer] = useS(false);
  const [toast, setToast] = useS(null);
  const [font, setFont] = useS(() => {
    try { return localStorage.getItem(FONT_KEY) || 'serif'; } catch (e) { return 'serif'; }
  });
  const importRef = useR(null);

  useE(() => save(seeds), [seeds]);
  useE(() => {
    document.documentElement.setAttribute('data-font', font);
    try { localStorage.setItem(FONT_KEY, font); } catch (e) {}
  }, [font]);

  const showToast = (text, variant) => {
    setToast({ text, variant: variant || '' });
    setTimeout(() => setToast(null), 1800);
  };

  const plant = (text) => {
    const now = new Date().toISOString();
    const s = { id: 's' + Date.now(), body: text, createdAt: now, lastWatered: now, waters: 0 };
    setSeeds([s, ...seeds]);
    showToast('🌰 种下了');
  };

  const update = (u) => setSeeds(seeds.map((s) => (s.id === u.id ? { ...s, ...u, waters: Math.max(s.waters, u.waters || 0) + (u.body !== s.body ? 1 : 0), lastWatered: u.body !== s.body ? new Date().toISOString() : s.lastWatered } : s)));

  const water = (id) => setSeeds(seeds.map((s) => s.id === id ? { ...s, waters: s.waters + 1, lastWatered: new Date().toISOString() } : s));

  const bloom = (id) => {
    setSeeds(seeds.map((s) => s.id === id ? { ...s, bloomed: true, bloomedAt: new Date().toISOString() } : s));
    setOpenId(null);
    showToast('🌸 它开花啦', 'bloom');
  };

  const restore = (id) => {
    setSeeds(seeds.map((s) => s.id === id ? { ...s, bloomed: false, bloomedAt: null } : s));
    showToast('🌿 放回花园了');
  };

  const del = (id) => setSeeds(seeds.filter((s) => s.id !== id));

  const exportSeed = (s) => {
    const blob = new Blob([s.body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (SG.preview(s.body, 14) || 'seed') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = () => {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const data = JSON.stringify({ version: 1, exportedAt: d.toISOString(), seeds }, null, 2);
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seed-garden-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📦 已导出全部数据');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const incoming = Array.isArray(parsed) ? parsed : (parsed.seeds || []);
        const valid = incoming.filter((s) => s && s.id && s.body);
        if (!valid.length) { showToast('没找到有效的种子数据'); return; }
        const existingIds = new Set(seeds.map((s) => s.id));
        const fresh = valid.filter((s) => !existingIds.has(s.id));
        const dup = valid.length - fresh.length;
        const msg = dup
          ? `发现 ${valid.length} 颗种子，其中 ${dup} 颗已存在会跳过，导入剩余 ${fresh.length} 颗？`
          : `发现 ${valid.length} 颗种子，合并导入？`;
        if (fresh.length === 0) { showToast('全部种子已存在，无需导入'); return; }
        if (confirm(msg)) {
          setSeeds((prev) => [...fresh, ...prev]);
          showToast(`🌱 导入了 ${fresh.length} 颗种子`);
        }
      } catch (_) {
        showToast('文件解析失败，请确认是 JSON 格式');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const live = seeds.filter((s) => !s.bloomed);
  const bloomed = seeds.filter((s) => s.bloomed);

  const counts = {
    all: live.length,
    seedling: live.filter((s) => SG.stageOf(s.waters) === 'seedling').length,
    sprout: live.filter((s) => SG.stageOf(s.waters) === 'sprout').length,
    growing: live.filter((s) => SG.stageOf(s.waters) === 'growing').length,
  };

  const filtered = filter === 'all' ? live : live.filter((s) => SG.stageOf(s.waters) === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const groups = sorted.reduce((acc, s) => {
    const k = SG.fmtDate(s.createdAt);
    (acc[k] = acc[k] || []).push(s);
    return acc;
  }, {});

  const openSeed = seeds.find((s) => s.id === openId);

  return (
    <>
      <header>
        <div className="title-row">
          <h1><span>小山的</span><span className="accent">种子花园</span><span className="leaf">✦</span></h1>
          <div className="head-controls">
            <div className="font-pill">
              <button className={'fbtn' + (font === 'serif' ? ' sel' : '')} onClick={() => setFont('serif')}>宋体</button>
              <button className={'fbtn' + (font === 'system' ? ' sel' : '')} onClick={() => setFont('system')}>系统</button>
            </div>
            <div className="font-pill">
              <button className="fbtn" onClick={exportAll}>↓ 导出</button>
              <label className="fbtn import-label" htmlFor="sg-import-file">↑ 导入</label>
              <input
                id="sg-import-file"
                ref={importRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
            </div>
          </div>
        </div>
        <div className="garden-meta">a place to keep seeds · {live.length} alive</div>
        <div className="filters">
          <button className={'fchip' + (filter === 'all' ? ' sel' : '')} onClick={() => setFilter('all')}>全部 <span className="c">{counts.all}</span></button>
          <button className={'fchip' + (filter === 'seedling' ? ' sel' : '')} onClick={() => setFilter('seedling')}>🌰 种子 <span className="c">{counts.seedling}</span></button>
          <button className={'fchip' + (filter === 'sprout' ? ' sel' : '')} onClick={() => setFilter('sprout')}>🌱 萌芽 <span className="c">{counts.sprout}</span></button>
          <button className={'fchip' + (filter === 'growing' ? ' sel' : '')} onClick={() => setFilter('growing')}>🌿 生长 <span className="c">{counts.growing}</span></button>
        </div>
      </header>

      <Composer onPlant={plant} />

      <div className="seeds">
        {sorted.length === 0 ? (
          <div className="empty">
            <div className="e">🌰</div>
            这里还没有种子，写一个吧～
          </div>
        ) : Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <div className="date-sep">{date}</div>
            {items.map((s) => (
              <Seed key={s.id} seed={s} allSeeds={live} onOpen={setOpenId} />
            ))}
          </div>
        ))}
      </div>

      <div className="footer-note">
        <div className="l"></div>
        <div>这里的想法都是活的，你常回来看看它就会长。</div>
      </div>

      <button className="bloom-toggle" onClick={() => setDrawer(true)}>
        🌸 开花了的 · {bloomed.length}
      </button>

      <BloomDrawer
        show={drawer}
        onClose={() => setDrawer(false)}
        seeds={bloomed}
        onRestore={restore}
        onExport={exportSeed}
      />

      {openSeed && (
        <Editor
          seed={openSeed}
          allSeeds={live}
          onClose={() => setOpenId(null)}
          onChange={update}
          onWater={water}
          onBloom={bloom}
          onDelete={del}
          onOpen={setOpenId}
          onToast={showToast}
        />
      )}

      <div className={'toast' + (toast ? ' show' : '') + (toast && toast.variant === 'bloom' ? ' bloom' : '')}>
        {toast && toast.text}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
