function Seed({ seed, allSeeds, onOpen }) {
  const stage = SG.stageOf(seed.waters);
  const S = SG.STAGES[stage];
  const recent = SG.hoursSince(seed.lastWatered) < 24;

  // Render body with mentions highlighted
  const mentions = SG.extractMentions(seed.body, seed, allSeeds);
  let rendered = seed.body;
  const spans = [];
  if (mentions.length) {
    // Build highlight segments
    const marks = mentions.
    map((m) => ({ id: m.id, key: SG.firstWords(m.body, 6).trim() })).
    filter((m) => m.key);
    let rest = seed.body;
    let k = 0;
    while (rest.length) {
      let nextIdx = -1,nextMark = null;
      marks.forEach((mk) => {
        const i = rest.indexOf(mk.key);
        if (i !== -1 && (nextIdx === -1 || i < nextIdx)) {nextIdx = i;nextMark = mk;}
      });
      if (nextIdx === -1) {spans.push(rest);break;}
      if (nextIdx > 0) spans.push(rest.slice(0, nextIdx));
      spans.push(
        <span
          key={'m' + k++}
          className="mention"
          onClick={(e) => {e.stopPropagation();onOpen(nextMark.id);}}>
          {nextMark.key}</span>
      );
      rest = rest.slice(nextIdx + nextMark.key.length);
    }
    rendered = spans;
  }

  const related = SG.autoRelated(seed.body, seed, allSeeds, 3);

  return (
    <div
      className={'seed ' + stage + (recent ? ' recent' : '')}
      onClick={() => onOpen(seed.id)}>
      
      <span className="stage" title={S.label}>{S.icon}</span>
      <div className="head">
        <span className="time" title="种下的时间">{SG.fmtTime(seed.createdAt)}</span>
        <span className="stage-label">{S.label}</span>
        <span className="waters">浇水 {seed.waters} 次</span>
        {recent && <span className="recent-badge">最近浇过水</span>}
      </div>
      <div className="body">{rendered}</div>
      {related.length > 0 &&
      <div className="links">
          <span className="llabel">相关：</span>
          {related.map((r) =>
        <span
          key={r.id}
          className="ll"
          onClick={(e) => {e.stopPropagation();onOpen(r.id);}}>
          {SG.preview(r.body, 10)}</span>
        )}
        </div>
      }
    </div>);

}

window.Seed = Seed;