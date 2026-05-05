const { useState, useRef, useEffect } = React;

function Editor({ seed, allSeeds, onClose, onChange, onWater, onBloom, onDelete, onOpen, onToast }) {
  const [body, setBody] = useState(seed ? seed.body : '');
  const [pop, setPop] = useState(null); // { x, y, query }
  const ref = useRef(null);

  useEffect(() => {
    if (seed) setBody(seed.body);
  }, [seed && seed.id]);

  // Debounced save
  useEffect(() => {
    if (!seed) return;
    if (body === seed.body) return;
    const t = setTimeout(() => onChange({ ...seed, body }), 400);
    return () => clearTimeout(t);
  }, [body]);

  if (!seed) return null;

  const stage = SG.stageOf(seed.waters);
  const S = SG.STAGES[stage];

  const handleInput = (e) => {
    const v = e.target.value;
    setBody(v);
    const caret = e.target.selectionStart;
    const before = v.slice(0, caret);
    const at = before.lastIndexOf('@');
    if (at !== -1 && /^@[\u4e00-\u9fffA-Za-z0-9]*$/.test(before.slice(at))) {
      const query = before.slice(at + 1);
      const rect = e.target.getBoundingClientRect();
      setPop({ x: rect.left + 40, y: rect.top + 40, query, caret, at });
    } else {
      setPop(null);
    }
  };

  const pickMention = (other) => {
    const key = SG.firstWords(other.body, 6).trim();
    const before = body.slice(0, pop.at);
    const after = body.slice(pop.caret);
    const newBody = before + key + after;
    setBody(newBody);
    setPop(null);
    setTimeout(() => ref.current && ref.current.focus(), 0);
  };

  const suggestions = pop
    ? allSeeds
        .filter((s) => s.id !== seed.id && !s.bloomed)
        .filter((s) => {
          const key = SG.firstWords(s.body, 6).trim();
          return key && (!pop.query || key.toLowerCase().includes(pop.query.toLowerCase()));
        })
        .slice(0, 6)
    : [];

  return (
    <>
      <div className={'backdrop show'} onClick={onClose}></div>
      <div className="editor show" onClick={(e) => e.stopPropagation()}>
        <div className="ehead">
          <div className="ehead-l">
            <span className="big-stage">{S.icon}</span>
            <span className="ehead-meta">{SG.fmtLongDate(seed.createdAt)} · 浇水 {seed.waters} 次</span>
          </div>
          <div className="ehead-actions">
            <button className="eab water" onClick={() => { onWater(seed.id); onToast('💧 浇了一次水', ''); }}>
              💧 浇水
            </button>
            <button className="eab bloom" onClick={() => onBloom(seed.id)}>
              🌸 开花了
            </button>
            <button className="eab danger" onClick={() => {
              if (confirm('删除这颗种子？')) { onDelete(seed.id); onClose(); }
            }}>删除</button>
          </div>
        </div>
        <textarea
          ref={ref}
          value={body}
          onChange={handleInput}
          placeholder="写下你的脑洞…（打 @ 可以链接到别的种子）"
        />
        <div className="efoot">
          <span className="saved">✓ 自动保存</span>
          <span>{body.length} 字 · {S.label} 阶段</span>
        </div>

        {pop && (
          <div className="mention-pop" style={{ left: pop.x, top: pop.y }}>
            {suggestions.length ? suggestions.map((s) => (
              <div key={s.id} className="mi" onClick={() => pickMention(s)}>
                <span className="s">{SG.STAGES[SG.stageOf(s.waters)].icon}</span>
                <span>{SG.preview(s.body, 12)}</span>
                <span className="t">{SG.fmtDate(s.createdAt)}</span>
              </div>
            )) : <div className="none">没找到匹配的种子</div>}
          </div>
        )}
      </div>
    </>
  );
}

window.Editor = Editor;
