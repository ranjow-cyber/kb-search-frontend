import { useState, useCallback, useRef, useEffect } from "react";

const API_BASE = "https://kb-search-production.up.railway.app";

// ─── Design tokens BASELine ──────────────────────────────────
const C = {
  blue:        "#0095d9",
  blueDark:    "#0078b0",
  blueLight:   "#e6f5fc",
  blueMid:     "#b3dff5",
  headerBg:    "#0095d9",
  sectionBg:   "#2c2c2c",
  sectionText: "#ffffff",
  white:       "#ffffff",
  bg:          "#f0f2f4",
  border:      "#d4d8dc",
  borderLight: "#e8ebee",
  text:        "#1a1a2e",
  textMid:     "#555e6b",
  textLight:   "#8c97a3",
  green:       "#28a745",
  greenBg:     "#eaf6ec",
  orange:      "#f5a623",
  orangeBg:    "#fef6e8",
  red:         "#d9534f",
  redBg:       "#fdf0ef",
  purple:      "#6f42c1",
  purpleBg:    "#f0ebfa",
};

const slugify = (t) =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ─── Auto-refresh hook ───────────────────────────────────────
function useAutoRefresh(fn, intervalMs = 30000, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(fn, intervalMs);
    return () => clearInterval(id);
  }, [fn, intervalMs, enabled]);
}

// ─── Top Header ──────────────────────────────────────────────
const Header = () => (
  <div style={{
    background: `linear-gradient(90deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
    height: 56, display: "flex", alignItems: "center",
    padding: "0 20px", justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,120,176,0.25)",
    position: "sticky", top: 0, zIndex: 200,
  }}>
    {/* Logo + tytuł */}
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "5px 10px", borderRadius: 4 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 18, height: 18 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ background: "#fff", borderRadius: 1 }}/>)}
        </div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "0.05em" }}>BASELine</span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: -6 }}>™</span>
      </div>
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.25)" }}/>
      <div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Baza Wiedzy — Wyszukiwarka AI</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>Hybrydowe wyszukiwanie semantyczne • Powered by AI</div>
      </div>
    </div>
    {/* Created by */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Created by</div>
        <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>WojnaR & Claude AI</div>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧠</div>
    </div>
  </div>
);

// ─── Section header (dark — jak w BASELine) ──────────────────
const SectionHead = ({ title, count, right, icon }) => (
  <div style={{
    background: C.sectionBg, color: C.sectionText,
    padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
    borderRadius: "4px 4px 0 0", userSelect: "none",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" }}>{title}</span>
      {count !== undefined && (
        <span style={{ background: C.blue, color: "#fff", fontSize: 10, padding: "1px 7px", borderRadius: 99, fontWeight: 700 }}>
          WIERSZY: {count}
        </span>
      )}
    </div>
    {right && <div>{right}</div>}
  </div>
);

// ─── Tab Navigation ──────────────────────────────────────────
const TabNav = ({ tab, setTab }) => {
  const tabs = [
    { id: "search", label: "Wyszukiwanie", icon: "🔍" },
    { id: "browse", label: "Artykuły",     icon: "📄" },
    { id: "add",    label: "Dodaj",         icon: "➕" },
    { id: "info",   label: "O module",      icon: "ℹ️" },
  ];
  return (
    <div style={{ background: C.white, borderBottom: `2px solid ${C.border}`, display: "flex", padding: "0 20px", gap: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          padding: "11px 20px", border: "none", background: "none",
          borderBottom: tab === t.id ? `3px solid ${C.blue}` : "3px solid transparent",
          color: tab === t.id ? C.blue : C.textMid,
          fontWeight: tab === t.id ? 700 : 400,
          fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          marginBottom: -2, transition: "all .15s",
        }}>
          <span>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
};

// ─── Card wrapper ─────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", ...style }}>
    {children}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────
const Badge = ({ label, color = C.blue, bg }) => (
  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 3, background: bg || color + "18", color, fontWeight: 600, border: `1px solid ${color}30` }}>
    {label}
  </span>
);

// ─── Score Bar ────────────────────────────────────────────────
const ScoreBar = ({ label, value, color, bg }) => (
  <div style={{ minWidth: 80 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <span style={{ fontSize: 10, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>{Math.round(value * 100)}%</span>
    </div>
    <div style={{ height: 5, background: C.borderLight, borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.round(value * 100)}%`, background: color, borderRadius: 99, transition: "width .5s ease" }}/>
    </div>
  </div>
);

// ─── Mode Selector ────────────────────────────────────────────
const ModeSelector = ({ mode, setMode }) => {
  const modes = [
    { id: "hybrid",   label: "Hybrydowe",     desc: "FTS + AI" },
    { id: "fts",      label: "Słów kluczowych", desc: "Dokładne" },
    { id: "semantic", label: "Semantyczne",    desc: "Znaczenie" },
  ];
  return (
    <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", height: 38 }}>
      {modes.map((m, i) => (
        <button key={m.id} onClick={() => setMode(m.id)} style={{
          padding: "0 14px", border: "none",
          borderRight: i < 2 ? `1px solid ${C.border}` : "none",
          background: mode === m.id ? C.blue : C.white,
          color: mode === m.id ? "#fff" : C.textMid,
          fontSize: 12, fontWeight: mode === m.id ? 700 : 400,
          cursor: "pointer", transition: "all .15s", lineHeight: 1.3,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div>{m.label}</div>
          <div style={{ fontSize: 9, opacity: .75 }}>{m.desc}</div>
        </button>
      ))}
    </div>
  );
};

// ─── Result Row ───────────────────────────────────────────────
const ResultRow = ({ result, query, index }) => {
  const [exp, setExp] = useState(false);
  const hl = (text) => {
    if (!query || !text) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.split(re).map((p, i) =>
      re.test(p) ? <mark key={i} style={{ background: "#fff176", padding: "0 1px", borderRadius: 2 }}>{p}</mark> : p
    );
  };
  const isGood = result.hybrid_score > 0.6 || result.semantic_score > 0.6;
  return (
    <div style={{ borderBottom: `1px solid ${C.borderLight}`, transition: "background .12s" }}
      onMouseEnter={e => e.currentTarget.style.background = C.blueLight}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{ padding: "11px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* rank */}
        <div style={{ width: 26, height: 26, borderRadius: 13, background: isGood ? C.blue : C.border, color: isGood ? "#fff" : C.textLight, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          {index}
        </div>
        {/* content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{hl(result.title)}</span>
            {result.category && <Badge label={result.category}/>}
            {result.source_types.includes("attachment") && <Badge label="📎 załącznik" color={C.purple} bg={C.purpleBg}/>}
            {isGood && <Badge label="✓ Wysoka trafność" color={C.green} bg={C.greenBg}/>}
          </div>
          {result.summary && <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, marginBottom: 4 }}>{hl(result.summary)}</div>}
          {result.matched_chunks.length > 0 && (
            <button onClick={() => setExp(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", color: C.blue, fontSize: 11, padding: 0, fontWeight: 600 }}>
              {exp ? "▲ Ukryj fragment" : `▼ Fragment z załącznika (${result.matched_chunks.length})`}
            </button>
          )}
          {exp && result.matched_chunks.map((c, i) => (
            <div key={i} style={{ marginTop: 6, padding: "7px 10px", background: C.orangeBg, borderLeft: `3px solid ${C.orange}`, borderRadius: "0 3px 3px 0", fontSize: 11, color: C.textMid, lineHeight: 1.7 }}>
              …{hl(c)}…
            </div>
          ))}
        </div>
        {/* scores */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, minWidth: 110 }}>
          <ScoreBar label="FTS" value={result.fts_score} color={C.orange} bg={C.orangeBg}/>
          <ScoreBar label="Semantic" value={result.semantic_score} color={C.green} bg={C.greenBg}/>
          <ScoreBar label="Hybrid" value={result.hybrid_score} color={C.blue} bg={C.blueLight}/>
        </div>
      </div>
    </div>
  );
};

// ─── Article Row (browse) ─────────────────────────────────────
const ArticleRow = ({ article, onSearch, index }) => (
  <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background .12s" }}
    onMouseEnter={e => e.currentTarget.style.background = C.blueLight}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    onClick={() => onSearch(article.title)}>
    <div style={{ width: 26, height: 26, borderRadius: 3, background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: C.blue, fontWeight: 700, fontSize: 11 }}>{index}</div>
    <div style={{ width: 28, height: 28, background: C.blueLight, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📄</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>{article.title}</div>
      {article.summary && <div style={{ fontSize: 11, color: C.textLight, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.summary}</div>}
    </div>
    {article.category && <Badge label={article.category}/>}
    <div style={{ fontSize: 11, color: C.blue, fontWeight: 600, flexShrink: 0 }}>Szukaj →</div>
  </div>
);

// ─── Form Input ───────────────────────────────────────────────
const FLabel = ({ label, required }) => (
  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
    {label} {required && <span style={{ color: C.red }}>*</span>}
  </div>
);
const inp = { width: "100%", border: `1px solid ${C.border}`, borderRadius: 3, padding: "7px 10px", fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: C.white, transition: "border-color .15s" };
const FInput = ({ value, onChange, placeholder }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp}
    onFocus={e => e.target.style.borderColor = C.blue}
    onBlur={e => e.target.style.borderColor = C.border}/>
);
const FTextarea = ({ value, onChange, placeholder, rows = 6 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inp, resize: "vertical" }}
    onFocus={e => e.target.style.borderColor = C.blue}
    onBlur={e => e.target.style.borderColor = C.border}/>
);

// ─── Stat Box ─────────────────────────────────────────────────
const StatBox = ({ icon, value, label, color, sub }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
    <div style={{ width: 42, height: 42, borderRadius: 4, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.textLight }}>{sub}</div>}
    </div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────
const Toast = ({ msg, type }) => msg ? (
  <div style={{ position: "fixed", bottom: 20, right: 20, padding: "12px 18px", borderRadius: 4, background: type === "ok" ? C.greenBg : C.redBg, border: `1px solid ${type === "ok" ? C.green : C.red}`, color: type === "ok" ? C.green : C.red, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
    {type === "ok" ? "✅" : "❌"} {msg}
  </div>
) : null;

// ─── Info Tab ─────────────────────────────────────────────────
const InfoTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    {/* O module */}
    <Card>
      <SectionHead title="O module" icon="💡"/>
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.8, margin: "0 0 10px" }}>
          Moduł <strong>Wyszukiwarki AI</strong> dla BASELine umożliwia inteligentne przeszukiwanie bazy wiedzy. Rozumie znaczenie pytań — nie tylko szuka słów kluczowych.
        </p>
        <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.8, margin: 0 }}>
          Przykład: zapytanie <em>"nie mogę wejść na konto"</em> znajdzie artykuł <em>"Procedura odzyskiwania dostępu"</em> — bez użycia tych samych słów.
        </p>
        <div style={{ marginTop: 14, padding: "10px 12px", background: C.blueLight, borderRadius: 3, border: `1px solid ${C.blueMid}` }}>
          <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, marginBottom: 4 }}>STWORZONO</div>
          <div style={{ fontSize: 12, color: C.textMid }}>🧠 WojnaR & Claude AI (Anthropic)</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Projekt zbudowany w całości z pomocą AI w jednej sesji</div>
        </div>
      </div>
    </Card>

    {/* Tryby */}
    <Card>
      <SectionHead title="Tryby wyszukiwania" icon="🔍"/>
      <div style={{ padding: 16 }}>
        {[
          { icon: "⚡", name: "Słów kluczowych (FTS)", color: C.orange, desc: 'Szuka dokładnych słów jak Ctrl+F. "hasło" znajdzie "hasła", "hasłem". Szybkie i precyzyjne dla znanych fraz.', good: "znasz dokładną frazę" },
          { icon: "🧠", name: "Semantyczne", color: C.green, desc: "Rozumie znaczenie — model AI zamienia tekst na wektor 384 liczb i porównuje podobieństwo matematyczne.", good: "opisujesz problem własnymi słowami" },
          { icon: "🔀", name: "Hybrydowe (domyślne)", color: C.blue, desc: "Łączy oba tryby algorytmem RRF. Artykuł wysoko w obu listach = najwyższy wynik końcowy.", good: "w większości przypadków" },
        ].map(m => (
          <div key={m.name} style={{ marginBottom: 12, padding: "10px 12px", border: `1px solid ${m.color}30`, borderRadius: 3, background: m.color + "08" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span>{m.icon}</span>
              <span style={{ fontWeight: 700, color: m.color, fontSize: 12 }}>{m.name}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>{m.desc}</div>
            <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>✅ Użyj gdy: {m.good}</div>
          </div>
        ))}
      </div>
    </Card>

    {/* Scoring */}
    <Card>
      <SectionHead title="Jak działają procenty?" icon="📊"/>
      <div style={{ padding: 16 }}>
        {[
          { label: "FTS %", color: C.orange, desc: "Wynik dopasowania słów kluczowych. Najlepszy wynik w zapytaniu = 100%, pozostałe proporcjonalnie mniej." },
          { label: "Semantic %", color: C.green, desc: "Cosine similarity między wektorami — miara kąta między punktami w przestrzeni 384-wymiarowej. 100% = identyczne znaczenie, 50-70% = powiązany temat." },
          { label: "Hybrid %", color: C.blue, desc: "Algorytm RRF: każdy artykuł dostaje 1/(60+pozycja) z obu list. Znormalizowane do 100% — pokazuje ogólną trafność." },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: 12, display: "flex", gap: 10 }}>
            <div style={{ width: 80, flexShrink: 0 }}>
              <div style={{ background: s.color, color: "#fff", padding: "3px 8px", borderRadius: 3, fontSize: 11, fontWeight: 700, textAlign: "center" }}>{s.label}</div>
            </div>
            <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </Card>

    {/* Technologie */}
    <Card>
      <SectionHead title="Technologie" icon="🛠"/>
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { t: "Python 3.12",    d: "Język backendu",          c: C.orange },
            { t: "FastAPI",        d: "REST API framework",       c: C.green },
            { t: "SQLite + FTS5",  d: "Baza danych + full-text",  c: C.blue },
            { t: "fastembed AI",   d: "Model embeddingów ~130MB", c: C.purple },
            { t: "Railway",        d: "Hosting backendu",         c: C.blue },
            { t: "Vercel",         d: "Hosting frontendu",        c: "#000" },
            { t: "React + Vite",   d: "Frontend framework",       c: "#61dafb" },
            { t: "RRF Ranking",    d: "Algorytm hybrydowy",       c: C.orange },
          ].map(x => (
            <div key={x.t} style={{ padding: "6px 8px", border: `1px solid ${x.c}30`, borderRadius: 3, background: x.c + "08" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: x.c }}>{x.t}</div>
              <div style={{ fontSize: 10, color: C.textLight }}>{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [query, setQuery]         = useState("");
  const [mode, setMode]           = useState("hybrid");
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [error, setError]         = useState(null);
  const [tab, setTab]             = useState("search");
  const [lastSearch, setLastSearch] = useState(null);

  const [articles, setArticles]             = useState([]);
  const [browseLoading, setBrowseLoading]   = useState(false);
  const [selCat, setSelCat]                 = useState(null);
  const [lastRefresh, setLastRefresh]       = useState(null);
  const [toast, setToast]                   = useState(null);

  // add form
  const [title, setTitle]       = useState("");
  const [summary, setSummary]   = useState("");
  const [content, setContent]   = useState("");
  const [author, setAuthor]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [savedId, setSavedId]   = useState(null);
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  // kategorie
  const [allCats, setAllCats]         = useState([]);
  const [selArticleCat, setSelArticleCat] = useState("");
  const [newCatName, setNewCatName]   = useState("");
  const [showNewCat, setShowNewCat]   = useState(false);
  const [savingCat, setSavingCat]     = useState(false);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Auto-refresh artykułów co 30s gdy na zakładce browse ──
  const refreshArticles = useCallback(async (silent = false) => {
    if (!silent) setBrowseLoading(true);
    try {
      const res = await fetch(`${API_BASE}/articles/list`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.map(a => ({ ...a, article_id: a.id })));
        setLastRefresh(new Date());
      }
    } catch (e) { console.error(e); }
    finally { if (!silent) setBrowseLoading(false); }
  }, []);

  // Ładuj kategorie przy starcie
  useEffect(() => {
    fetch(`${API_BASE}/categories`).then(r => r.json()).then(setAllCats).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "browse") refreshArticles();
  }, [tab]);

  // auto-refresh co 30s gdy na browse
  useAutoRefresh(() => refreshArticles(true), 30000, tab === "browse");

  // ── Auto-refresh wyników wyszukiwania co 60s ──
  const doSearch = useCallback(async (q = query, silent = false) => {
    if (!q.trim()) return;
    if (!silent) { setLoading(true); setError(null); setSearched(true); }
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}&mode=${mode}&top_k=10`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResults(await res.json());
      setLastSearch(new Date());
    } catch (e) {
      if (!silent) setError("Błąd połączenia z serwerem.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [query, mode]);

  // auto-refresh wyników co 60s gdy mamy aktywne wyszukiwanie
  useAutoRefresh(() => { if (searched && query) doSearch(query, true); }, 60000, searched && tab === "search");

  const handleCreateCat = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const cat = await res.json();
      setAllCats(prev => [...prev.filter(c => c.id !== cat.id), cat]);
      setSelArticleCat(String(cat.id));
      setNewCatName("");
      setShowNewCat(false);
      showToast(`Kategoria "${cat.name}" utworzona`);
    } catch (e) { showToast(`Błąd: ${e.message}`, "err"); }
    finally { setSavingCat(false); }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/articles`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), slug: slugify(title), summary: summary.trim() || null, content: content.trim(), author: author.trim() || null, category_id: selArticleCat ? parseInt(selArticleCat) : null }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSavedId(data.id);
      showToast(`✅ Artykuł "${title}" zapisany (ID: ${data.id})`);
    } catch (e) { showToast(`Błąd: ${e.message}`, "err"); }
    finally { setSaving(false); }
  };

  const handleUpload = async () => {
    if (!file || !savedId) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${API_BASE}/articles/${savedId}/attachments`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      showToast(`✅ Załącznik "${file.name}" wgrany i zaindeksowany`);
      setFile(null);
    } catch (e) { showToast(`Błąd: ${e.message}`, "err"); }
    finally { setUploading(false); }
  };

  const resetForm = () => { setTitle(""); setSummary(""); setContent(""); setAuthor(""); setSavedId(null); setFile(null); };

  const cats = [...new Set(articles.map(a => a.category).filter(Boolean))];
  const filtered = selCat ? articles.filter(a => a.category === selCat) : articles;

  const fmtTime = (d) => d ? d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : null;

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
      <Header/>
      <TabNav tab={tab} setTab={setTab}/>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 20px" }}>

        {/* ── SEARCH ── */}
        {tab === "search" && (
          <>
            {/* Search panel */}
            <Card style={{ marginBottom: 16 }}>
              <SectionHead title="Wyszukiwanie w bazie wiedzy" icon="🔍"
                right={lastSearch && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>ostatnie: {fmtTime(lastSearch)}</span>}
              />
              <div style={{ padding: "14px 14px 10px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 280, display: "flex", border: `1px solid ${C.border}`, borderRadius: 3, overflow: "hidden", background: C.white }}>
                    <div style={{ padding: "0 12px", display: "flex", alignItems: "center", background: C.bg, borderRight: `1px solid ${C.border}` }}>
                      <span style={{ color: C.textLight }}>🔍</span>
                    </div>
                    <input value={query} onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && doSearch()}
                      placeholder="Wpisz zapytanie lub opis problemu..."
                      style={{ flex: 1, border: "none", outline: "none", padding: "9px 12px", fontSize: 13, color: C.text, background: C.white }}/>
                    {query && <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }} style={{ padding: "0 10px", border: "none", background: "none", cursor: "pointer", color: C.textLight, fontSize: 16 }}>×</button>}
                  </div>
                  <ModeSelector mode={mode} setMode={setMode}/>
                  <button onClick={() => doSearch()} disabled={loading || !query.trim()} style={{
                    padding: "0 22px", height: 38, borderRadius: 3, border: "none",
                    background: (!query.trim() || loading) ? C.border : C.blue,
                    color: (!query.trim() || loading) ? C.textLight : "#fff",
                    fontWeight: 700, fontSize: 13, cursor: (!query.trim() || loading) ? "not-allowed" : "pointer",
                    transition: "background .15s",
                  }}>{loading ? "⏳ Szukam…" : "Szukaj"}</button>
                  {searched && <button onClick={() => doSearch(query, true)} title="Odśwież wyniki" style={{ padding: "0 12px", height: 38, borderRadius: 3, border: `1px solid ${C.border}`, background: C.white, color: C.blue, cursor: "pointer", fontSize: 14 }}>🔄</button>}
                </div>
                {/* Quick tags */}
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.textLight }}>Szybkie wyszukiwanie:</span>
                  {["hasło", "VPN", "backup", "onboarding", "2FA", "certyfikat", "dostęp", "umowa"].map(s => (
                    <button key={s} onClick={() => { setQuery(s); doSearch(s); }} style={{ padding: "2px 10px", borderRadius: 3, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 11, cursor: "pointer", transition: "all .1s" }}
                      onMouseEnter={e => { e.target.style.background = C.blueLight; e.target.style.color = C.blue; }}
                      onMouseLeave={e => { e.target.style.background = C.white; e.target.style.color = C.textMid; }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </Card>

            {error && <div style={{ padding: "10px 14px", background: C.redBg, border: `1px solid ${C.red}40`, borderRadius: 3, color: C.red, fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>}

            {loading && (
              <Card style={{ padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 13, color: C.textLight }}>Przeszukuję bazę wiedzy…</div>
              </Card>
            )}

            {!loading && searched && results.length === 0 && !error && (
              <Card style={{ padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: 14, color: C.textMid, fontWeight: 600 }}>Brak wyników dla: <em>"{query}"</em></div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>Spróbuj trybu semantycznego lub innych słów kluczowych</div>
              </Card>
            )}

            {!loading && results.length > 0 && (
              <Card>
                <SectionHead title="Wyniki wyszukiwania" count={results.length}
                  right={<span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>tryb: <strong style={{ color: "#fff" }}>{mode}</strong> {lastSearch && `• ${fmtTime(lastSearch)}`}</span>}
                />
                {results.map((r, i) => <ResultRow key={r.article_id} result={r} query={query} index={i + 1}/>)}
              </Card>
            )}

            {!searched && !loading && (
              <Card style={{ padding: "56px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, background: C.blueLight, borderRadius: 8, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📚</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>Wyszukaj w bazie wiedzy</div>
                <div style={{ fontSize: 13, color: C.textLight, maxWidth: 400, margin: "0 auto" }}>
                  Wpisz pytanie, opis problemu lub słowa kluczowe. System rozumie znaczenie — nie musisz znać dokładnych fraz.
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── BROWSE ── */}
        {tab === "browse" && (
          <>
            {/* Stats */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <StatBox icon="📄" value={articles.length} label="Artykuły w bazie" color={C.blue} sub={lastRefresh ? `odświeżono: ${fmtTime(lastRefresh)}` : null}/>
              <StatBox icon="🗂" value={cats.length} label="Kategorie" color={C.green}/>
              <StatBox icon="🔄" value="auto" label="Auto-odświeżanie" color={C.orange} sub="co 30 sekund"/>
            </div>

            {browseLoading && <Card style={{ padding: 40, textAlign: "center" }}><span style={{ color: C.textLight }}>⏳ Ładowanie artykułów…</span></Card>}

            {!browseLoading && (
              <Card>
                <SectionHead title="Lista artykułów" count={filtered.length}
                  right={
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <button onClick={() => { setSelCat(null); }} style={{ padding: "2px 8px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.3)", background: !selCat ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", fontSize: 11, cursor: "pointer" }}>Wszystkie</button>
                      {cats.map(c => (
                        <button key={c} onClick={() => setSelCat(c === selCat ? null : c)} style={{ padding: "2px 8px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.3)", background: selCat === c ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", fontSize: 11, cursor: "pointer" }}>{c}</button>
                      ))}
                      <button onClick={() => refreshArticles()} title="Odśwież" style={{ padding: "2px 8px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 11, cursor: "pointer" }}>🔄 Odśwież</button>
                    </div>
                  }
                />
                {/* table header */}
                <div style={{ display: "flex", padding: "6px 14px", background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <div style={{ width: 26, marginRight: 12 }}>#</div>
                  <div style={{ width: 28, marginRight: 12 }}></div>
                  <div style={{ flex: 1 }}>Nazwa</div>
                  <div style={{ width: 120 }}>Kategoria</div>
                  <div style={{ width: 80, textAlign: "right" }}>Akcja</div>
                </div>
                {filtered.length === 0
                  ? <div style={{ padding: 32, textAlign: "center", color: C.textLight, fontSize: 13 }}>Brak artykułów. Dodaj je w zakładce "Dodaj".</div>
                  : filtered.map((a, i) => <ArticleRow key={a.article_id} article={a} index={i + 1} onSearch={t => { setQuery(t); setTab("search"); doSearch(t); }}/>)
                }
              </Card>
            )}
          </>
        )}

        {/* ── ADD ── */}
        {tab === "add" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <SectionHead title="Krok 1 — Treść artykułu" icon="📝"/>
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 12 }}><FLabel label="Nazwa artykułu" required/><FInput value={title} onChange={setTitle} placeholder="np. Jak skonfigurować VPN"/></div>
                <div style={{ marginBottom: 12 }}><FLabel label="Opis (summary)"/><FInput value={summary} onChange={setSummary} placeholder="Jednozdaniowy opis"/></div>
                <div style={{ marginBottom: 12 }}><FLabel label="Treść artykułu" required/><FTextarea value={content} onChange={setContent} placeholder="Pełna treść artykułu..." rows={8}/></div>
                <div style={{ marginBottom: 16 }}><FLabel label="Autor"/><FInput value={author} onChange={setAuthor} placeholder="np. Jan Kowalski"/></div>
                <div style={{ marginBottom: 16 }}>
                  <FLabel label="Kategoria"/>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <select value={selArticleCat} onChange={e => setSelArticleCat(e.target.value)}
                      style={{ flex:1, border:`1px solid ${C.border}`, borderRadius:3, padding:"7px 10px", fontSize:13, color:C.text, outline:"none", background:C.white, cursor:"pointer" }}>
                      <option value="">— Wybierz kategorię —</option>
                      {allCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={() => setShowNewCat(v => !v)} style={{ padding:"7px 12px", borderRadius:3, border:`1px solid ${C.border}`, background:showNewCat?C.blueLight:C.white, color:C.blue, fontSize:12, cursor:"pointer", fontWeight:600, whiteSpace:"nowrap" }}>
                      {showNewCat ? "✕ Anuluj" : "+ Nowa kategoria"}
                    </button>
                  </div>
                  {showNewCat && (
                    <div style={{ marginTop:8, display:"flex", gap:8 }}>
                      <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                        onKeyDown={e => e.key==="Enter" && handleCreateCat()}
                        placeholder="Nazwa nowej kategorii..."
                        style={{ flex:1, border:`1px solid ${C.blue}`, borderRadius:3, padding:"6px 10px", fontSize:13, outline:"none" }}/>
                      <button onClick={handleCreateCat} disabled={savingCat || !newCatName.trim()} style={{ padding:"6px 14px", borderRadius:3, border:"none", background:C.blue, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                        {savingCat ? "…" : "Utwórz"}
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleSave} disabled={saving || !title.trim() || !content.trim()} style={{ padding: "8px 20px", borderRadius: 3, border: "none", background: (!title.trim() || !content.trim()) ? C.border : C.blue, color: (!title.trim() || !content.trim()) ? C.textLight : "#fff", fontWeight: 700, fontSize: 13, cursor: (!title.trim() || !content.trim()) ? "not-allowed" : "pointer" }}>
                    {saving ? "⏳ Zapisuję…" : savedId ? "✅ Zapisano!" : "💾 Zapisz artykuł"}
                  </button>
                  {savedId && <button onClick={resetForm} style={{ padding: "8px 14px", borderRadius: 3, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 13, cursor: "pointer" }}>+ Nowy</button>}
                </div>
              </div>
            </Card>

            <Card style={{ opacity: savedId ? 1 : 0.55 }}>
              <SectionHead title="Krok 2 — Załącznik (opcjonalnie)" icon="📎"/>
              <div style={{ padding: 16 }}>
                {!savedId && <div style={{ padding: "8px 12px", background: C.orangeBg, border: `1px solid ${C.orange}40`, borderRadius: 3, fontSize: 12, color: "#856404", marginBottom: 12 }}>ℹ Najpierw zapisz artykuł w Kroku 1</div>}
                <div
                  onClick={() => savedId && fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (savedId) setFile(e.dataTransfer.files[0]); }}
                  style={{ border: `2px dashed ${file ? C.green : C.border}`, borderRadius: 3, padding: "28px 16px", textAlign: "center", cursor: savedId ? "pointer" : "not-allowed", background: file ? C.greenBg : C.bg, marginBottom: 12, transition: "all .2s" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{file ? "📎" : "📂"}</div>
                  {file
                    ? <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{file.name}<br/><span style={{ fontSize: 11, fontWeight: 400, color: C.textLight }}>({(file.size / 1024).toFixed(0)} KB)</span></div>
                    : <div style={{ fontSize: 13, color: C.textLight }}>Przeciągnij plik lub kliknij aby wybrać<br/><span style={{ fontSize: 11 }}>PDF, DOCX, MD, TXT</span></div>
                  }
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.md,.txt" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])}/>
                </div>
                <button onClick={handleUpload} disabled={!file || !savedId || uploading} style={{ padding: "8px 20px", borderRadius: 3, border: "none", background: (!file || !savedId) ? C.border : C.green, color: (!file || !savedId) ? C.textLight : "#fff", fontWeight: 700, fontSize: 13, cursor: (!file || !savedId) ? "not-allowed" : "pointer" }}>
                  {uploading ? "⏳ Wysyłam…" : "⬆ Wgraj załącznik"}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ── INFO ── */}
        {tab === "info" && <InfoTab/>}

      </div>

      {/* Footer */}
      <div style={{ background: C.sectionBg, color: "rgba(255,255,255,0.4)", fontSize: 11, textAlign: "center", padding: "12px 20px", marginTop: 40 }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>BASELine™</span> Wyszukiwarka AI • Stworzone przez <span style={{ color: "rgba(255,255,255,0.7)" }}>WojnaR</span> z pomocą <span style={{ color: "rgba(255,255,255,0.7)" }}>Claude AI (Anthropic)</span> • Hybrydowe FTS + Semantic Search
      </div>

      <Toast msg={toast?.msg} type={toast?.type}/>
    </div>
  );
}
