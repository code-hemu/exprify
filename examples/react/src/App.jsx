import { useState, useRef } from 'react';
import Exprify from 'exprify';
import './App.css';

const QUICK_CONVERSIONS = [
  { label: '98.6 °F → °C', expr: '98.6 F to C' },
  { label: '1 ft → inch', expr: '1 ft to inch' },
  { label: '1 kg → lb', expr: '1 kg to lb' },
  { label: '1 gal → L', expr: '1 gallon to L' },
  { label: '100 cm → m', expr: '100 cm to m' },
  { label: '1 nmi → m', expr: '1 nmi to m' },
  { label: '1 day → s', expr: '1 day to s' },
  { label: '1 kW → W', expr: '1 kW to W' },
  { label: '0 °C → °F', expr: '0 C to F' },
  { label: '212 °F → K', expr: '212 F to K' },
  { label: '1 rad → deg', expr: '1 rad to deg' },
  { label: '1 F → mF', expr: '1 F to mF' },
];

export default function App() {
  const [expr] = useState(() => new Exprify());
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function evaluate(expression) {
    if (!expression.trim()) return;
    setError('');
    try {
      const out = expr.evaluate(expression);
      setResult(String(out));
      setInput(expression);
    } catch (e) {
      setError(e.message);
      setResult('');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    evaluate(input);
  }

  function handleQuick(expression) {
    setInput(expression);
    evaluate(expression);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') evaluate(input);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Exprify</h1>
        <p className="subtitle">Unit Converter &mdash; React Example</p>
      </header>

      <main className="main">
        <form className="input-row" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="input"
            placeholder="e.g. 98.6 F to C"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="eval-btn" type="submit">
            =
          </button>
        </form>

        {result && <div className="result">{result}</div>}
        {error && <div className="error">{error}</div>}

        <section className="presets">
          <h2>Quick Conversions</h2>
          <div className="preset-grid">
            {QUICK_CONVERSIONS.map(({ label, expr: expression }) => (
              <button
                key={expression}
                className="preset-btn"
                onClick={() => handleQuick(expression)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
