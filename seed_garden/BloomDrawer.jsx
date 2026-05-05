function BloomDrawer({ show, onClose, seeds, onRestore, onExport }) {
  return (
    <div className={'bloom-drawer' + (show ? ' show' : '')}>
      <button className="bclose" onClick={onClose}>×</button>
      <h2>🌸 开花了</h2>
      <div className="sub">已经写完、搬出花园的想法</div>
      {seeds.length === 0 ? (
        <div style={{fontFamily:'var(--font-accent)',fontStyle:'italic',color:'var(--paper-ink-3)',fontSize:13,padding:'20px 0',textAlign:'center'}}>
          还没有开花的种子～
        </div>
      ) : seeds.map((s) => (
        <div key={s.id} className="bloom-item">
          <div className="bt">开花于 {SG.fmtLongDate(s.bloomedAt || s.createdAt)} · 浇水 {s.waters} 次</div>
          <div className="bb">{s.body}</div>
          <div className="bact">
            <a onClick={() => onExport(s)}>↓ 导出 .txt</a>
            <a onClick={() => onRestore(s.id)}>↺ 放回花园</a>
          </div>
        </div>
      ))}
    </div>
  );
}

window.BloomDrawer = BloomDrawer;
