function Composer({ onPlant }) {
  const [text, setText] = React.useState('');
  const ready = text.trim().length > 0;

  const plant = () => {
    if (!ready) return;
    onPlant(text.trim());
    setText('');
  };

  return (
    <div className="composer">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在花园里种下一个想法…一段话就好，它会自己长。"
      />
      <div className="bar">
        <span className="hint">写完按「种下」；之后每次回来改它就会自动浇水 ✦</span>
        <button
          className={'btn-plant' + (ready ? ' ready' : '')}
          onClick={plant}
        >
          种下
        </button>
      </div>
    </div>
  );
}

window.Composer = Composer;
