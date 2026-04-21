import { useState, useCallback, useRef, useEffect } from "react";

const API_BASE = "https://kb-search-production.up.railway.app";

// ─── Design tokens — styl BASELine ──────────────────────────
const C = {
  blue:      "#0078c8",
  blueDark:  "#005fa3",
  blueLight: "#e8f4fd",
  blueMid:   "#cce4f6",
  white:     "#ffffff",
  bg:        "#f4f6f8",
  border:    "#d0d7de",
  borderLight: "#e8ecf0",
  text:      "#1a2332",
  textMid:   "#4a5568",
  textLight: "#8a9ab0",
  green:     "#28a745",
  greenBg:   "#e8f5eb",
  orange:    "#f59e0b",
  orangeBg:  "#fef3cd",
  red:       "#dc3545",
  redBg:     "#fdecea",
  purple:    "#6f42c1",
  purpleBg:  "#f0ebfa",
};

const slugify = (t) =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

// ─── Top nav bar ─────────────────────────────────────────────
const TopBar = () => (
  <div style={{ background: C.blue, height: 52, display:"flex", alignItems:"center", padding:"0 20px", gap:24, boxShadow:"0 2px 6px rgba(0,0,0,0.18)", position:"sticky", top:0, zIndex:100 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:28, height:28, background:"#fff", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:14, fontWeight:900, color:C.blue }}>KB</span>
      </div>
      <span style={{ color:"#fff", fontWeight:700, fontSize:15, letterSpacing:"0.02em" }}>Baza Wiedzy</span>
    </div>
    <div style={{ width:1, height:24, background:"rgba(255,255,255,0.25)" }}/>
    <span style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>Moduł wyszukiwania kontekstowego</span>
  </div>
);

// ─── Tab bar ─────────────────────────────────────────────────
const TabBar = ({ tab, setTab }) => {
  const tabs = [
    { id:"search", label:"Wyszukiwanie", icon:"🔍" },
    { id:"browse", label:"Artykuły", icon:"📄" },
    { id:"add",    label:"Dodaj artykuł", icon:"➕" },
    { id:"info",   label:"O module", icon:"ℹ️" },
  ];
  return (
    <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, display:"flex", padding:"0 24px" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>setTab(t.id)} style={{
          padding:"12px 18px", border:"none", background:"none",
          borderBottom: tab===t.id ? `3px solid ${C.blue}` : "3px solid transparent",
          color: tab===t.id ? C.blue : C.textMid,
          fontWeight: tab===t.id ? 700 : 400,
          fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
          transition:"all .15s", marginBottom:-1,
        }}>
          <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
};

// ─── Page container ──────────────────────────────────────────
const Page = ({ children }) => (
  <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 24px" }}>{children}</div>
);

// ─── Card ────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, ...style }}>
    {children}
  </div>
);

// ─── Section header ──────────────────────────────────────────
const SectionHeader = ({ title, count, extra }) => (
  <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.borderLight}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:C.bg, borderRadius:"6px 6px 0 0" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{title}</span>
      {count !== undefined && <span style={{ fontSize:11, background:C.blueMid, color:C.blue, padding:"1px 7px", borderRadius:99, fontWeight:700 }}>{count}</span>}
    </div>
    {extra}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────
const Badge = ({ label, color=C.blue, bg=C.blueLight }) => (
  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:3, background:bg, color, fontWeight:600, border:`1px solid ${color}30` }}>{label}</span>
);

// ─── Score pill ──────────────────────────────────────────────
const ScorePill = ({ label, value, color, bg }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"4px 10px", borderRadius:4, background:bg, border:`1px solid ${color}40`, minWidth:58 }}>
    <span style={{ fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
    <span style={{ fontSize:14, fontWeight:700, color, fontFamily:"monospace" }}>{(value*100).toFixed(0)}%</span>
  </div>
);

// ─── Mode selector ───────────────────────────────────────────
const ModeSelector = ({ mode, setMode }) => {
  const modes = [
    { id:"hybrid",   label:"Hybrydowe",    desc:"FTS + Semantyczne" },
    { id:"fts",      label:"Słów kluczowych", desc:"Dokładne frazy" },
    { id:"semantic", label:"Semantyczne",  desc:"Znaczenie tekstu" },
  ];
  return (
    <div style={{ display:"flex", gap:0, border:`1px solid ${C.border}`, borderRadius:4, overflow:"hidden" }}>
      {modes.map((m,i) => (
        <button key={m.id} onClick={()=>setMode(m.id)} style={{
          padding:"7px 14px", border:"none", borderRight: i<2 ? `1px solid ${C.border}` : "none",
          background: mode===m.id ? C.blue : C.white,
          color: mode===m.id ? "#fff" : C.textMid,
          fontSize:12, fontWeight: mode===m.id ? 700 : 400,
          cursor:"pointer", transition:"all .15s", lineHeight:1.3,
        }}>
          <div>{m.label}</div>
          <div style={{ fontSize:10, opacity:.8 }}>{m.desc}</div>
        </button>
      ))}
    </div>
  );
};

// ─── Result row ──────────────────────────────────────────────
const ResultRow = ({ result, query, index }) => {
  const [exp, setExp] = useState(false);
  const hl = (text) => {
    if (!query||!text) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi");
    return text.split(re).map((p,i) =>
      re.test(p) ? <mark key={i} style={{ background:"#fff3cd", padding:"0 1px", borderRadius:2 }}>{p}</mark> : p
    );
  };
  return (
    <div style={{ borderBottom:`1px solid ${C.borderLight}`, transition:"background .15s" }}
      onMouseEnter={e=>e.currentTarget.style.background=C.blueLight}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{ padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:12 }}>
        {/* numer */}
        <div style={{ width:24, height:24, borderRadius:12, background:C.blue, color:"#fff", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>{index}</div>
        {/* treść */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{hl(result.title)}</span>
            {result.category && <Badge label={result.category} color={C.blue} bg={C.blueLight}/>}
            {result.source_types.includes("attachment") && <Badge label="📎 załącznik" color={C.purple} bg={C.purpleBg}/>}
          </div>
          {result.summary && <div style={{ fontSize:12, color:C.textMid, lineHeight:1.6 }}>{hl(result.summary)}</div>}
          {result.matched_chunks.length>0 && (
            <button onClick={()=>setExp(e=>!e)} style={{ marginTop:6, background:"none", border:"none", cursor:"pointer", color:C.blue, fontSize:11, padding:0, fontWeight:600 }}>
              {exp ? "▲ Ukryj fragment" : `▼ Pokaż fragment z załącznika (${result.matched_chunks.length})`}
            </button>
          )}
          {exp && result.matched_chunks.map((c,i)=>(
            <div key={i} style={{ marginTop:6, padding:"8px 12px", background:"#fffbf0", border:`1px solid ${C.orange}40`, borderLeft:`3px solid ${C.orange}`, borderRadius:"0 4px 4px 0", fontSize:11, color:C.textMid, lineHeight:1.7 }}>
              …{hl(c)}…
            </div>
          ))}
        </div>
        {/* scores */}
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <ScorePill label="FTS" value={result.fts_score} color={C.orange} bg={C.orangeBg}/>
          <ScorePill label="Sem." value={result.semantic_score} color={C.green} bg={C.greenBg}/>
        </div>
      </div>
    </div>
  );
};

// ─── Article row (browse) ─────────────────────────────────────
const ArticleRow = ({ article, onSearch }) => (
  <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.borderLight}`, display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"background .15s" }}
    onMouseEnter={e=>e.currentTarget.style.background=C.blueLight}
    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    onClick={()=>onSearch(article.title)}>
    <div style={{ width:32, height:32, background:C.blueLight, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>📄</div>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{article.title}</div>
      {article.summary && <div style={{ fontSize:11, color:C.textLight, marginTop:2 }}>{article.summary}</div>}
    </div>
    {article.category && <Badge label={article.category}/>}
    <div style={{ fontSize:11, color:C.blue, fontWeight:600, flexShrink:0 }}>Wyszukaj →</div>
  </div>
);

// ─── Form field ──────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.text, marginBottom:5 }}>
      {label} {required && <span style={{ color:C.red }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = { width:"100%", border:`1px solid ${C.border}`, borderRadius:4, padding:"8px 10px", fontSize:13, color:C.text, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.white };
const InputField = ({ value, onChange, placeholder }) => <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputStyle}/>;
const TextArea   = ({ value, onChange, placeholder, rows=6 }) => <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize:"vertical" }}/>;

// ─── Info section ────────────────────────────────────────────
const InfoBlock = ({ icon, title, color, children }) => (
  <Card style={{ marginBottom:16 }}>
    <SectionHeader title={<span>{icon} {title}</span>} />
    <div style={{ padding:"16px" }}>{children}</div>
  </Card>
);

const InfoP = ({ children }) => <p style={{ margin:"0 0 10px", fontSize:13, color:C.textMid, lineHeight:1.8 }}>{children}</p>;
const Tech = ({ label, desc, color=C.blue }) => (
  <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
    <Badge label={label} color={color} bg={color+"15"}/>
    <span style={{ fontSize:13, color:C.textMid }}>{desc}</span>
  </div>
);

const ModeInfo = ({ icon, name, color, bg, how, good, bad }) => (
  <div style={{ border:`1px solid ${C.border}`, borderRadius:4, marginBottom:10, overflow:"hidden" }}>
    <div style={{ padding:"8px 12px", background:bg, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
      <span>{icon}</span>
      <span style={{ fontWeight:700, color, fontSize:13 }}>{name}</span>
    </div>
    <div style={{ padding:"10px 12px" }}>
      <div style={{ fontSize:12, color:C.textMid, marginBottom:6 }}><strong style={{ color:C.text }}>Jak działa:</strong> {how}</div>
      <div style={{ fontSize:12, color:C.green, marginBottom:4 }}>✅ Dobre gdy: {good}</div>
      <div style={{ fontSize:12, color:C.red }}>⚠ Słabsze gdy: {bad}</div>
    </div>
  </div>
);

// ─── Toast ───────────────────────────────────────────────────
const Toast = ({ msg, type }) => msg ? (
  <div style={{ position:"fixed", bottom:24, right:24, padding:"12px 18px", borderRadius:4, background: type==="ok"?C.greenBg:C.redBg, border:`1px solid ${type==="ok"?C.green:C.red}`, color: type==="ok"?C.green:C.red, fontSize:13, fontWeight:600, zIndex:9999, boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
    {type==="ok"?"✅":"❌"} {msg}
  </div>
) : null;

// ─── Stat box ────────────────────────────────────────────────
const StatBox = ({ icon, value, label, color }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
    <div style={{ width:40, height:40, borderRadius:6, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
    <div>
      <div style={{ fontSize:24, fontWeight:800, color }}>{value}</div>
      <div style={{ fontSize:12, color:C.textLight }}>{label}</div>
    </div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [query, setQuery]       = useState("");
  const [mode, setMode]         = useState("hybrid");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState("search");

  const [articles, setArticles]           = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [selCat, setSelCat]               = useState(null);
  const [toast, setToast]                 = useState(null);

  // add form
  const [title, setTitle]     = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor]   = useState("");
  const [saving, setSaving]   = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),4000); };

  useEffect(()=>{ if(tab==="browse"&&articles.length===0) loadArticles(); },[tab]);

  const loadArticles = async () => {
    setBrowseLoading(true);
    try {
      // użyj dedykowanego endpointu który zwraca wszystkie artykuły
      const res = await fetch(`${API_BASE}/articles/list`);
      if(res.ok) {
        const data = await res.json();
        // mapuj do formatu zgodnego z resztą komponentu
        setArticles(data.map(a => ({ ...a, article_id: a.id })));
      }
    } catch(e){ console.error(e); }
    finally{ setBrowseLoading(false); }
  };

  const doSearch = useCallback(async (q=query) => {
    if(!q.trim()) return;
    setLoading(true); setError(null); setSearched(true); setTab("search");
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}&mode=${mode}&top_k=10`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      setResults(await res.json());
    } catch(e){ setError("Błąd połączenia z serwerem."); }
    finally{ setLoading(false); }
  },[query,mode]);

  const handleSave = async () => {
    if(!title.trim()||!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/articles`, { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ title:title.trim(), slug:slugify(title), summary:summary.trim()||null, content:content.trim(), author:author.trim()||null, category_id:null }) });
      if(!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSavedId(data.id);
      showToast(`Artykuł "${title}" zapisany (ID: ${data.id})`);
    } catch(e){ showToast(`Błąd: ${e.message}`,"err"); }
    finally{ setSaving(false); }
  };

  const handleUpload = async () => {
    if(!file||!savedId) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file",file);
      const res = await fetch(`${API_BASE}/articles/${savedId}/attachments`,{method:"POST",body:fd});
      if(!res.ok) throw new Error(await res.text());
      showToast(`Załącznik "${file.name}" wgrany i zaindeksowany`);
      setFile(null);
    } catch(e){ showToast(`Błąd: ${e.message}`,"err"); }
    finally{ setUploading(false); }
  };

  const resetForm = () => { setTitle(""); setSummary(""); setContent(""); setAuthor(""); setSavedId(null); setFile(null); };
  const cats = [...new Set(articles.map(a=>a.category).filter(Boolean))];
  const filtered = selCat ? articles.filter(a=>a.category===selCat) : articles;

  return (
    <div style={{ fontFamily:"'Segoe UI', 'Trebuchet MS', Arial, sans-serif", background:C.bg, minHeight:"100vh", color:C.text }}>
      <TopBar/>
      <TabBar tab={tab} setTab={setTab}/>

      <Page>

        {/* ── SEARCH ── */}
        {tab==="search" && (
          <>
            {/* Search bar */}
            <Card style={{ marginBottom:16, padding:"16px" }}>
              <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:240, display:"flex", border:`1px solid ${C.border}`, borderRadius:4, overflow:"hidden" }}>
                  <div style={{ padding:"0 12px", display:"flex", alignItems:"center", background:C.bg, borderRight:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:16, color:C.textLight }}>🔍</span>
                  </div>
                  <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()}
                    placeholder="Wyszukaj artykuł lub treść załącznika..."
                    style={{ flex:1, border:"none", outline:"none", padding:"9px 12px", fontSize:13, color:C.text, background:C.white }}/>
                </div>
                <ModeSelector mode={mode} setMode={setMode}/>
                <button onClick={()=>doSearch()} disabled={loading||!query.trim()} style={{
                  padding:"9px 20px", borderRadius:4, border:"none",
                  background: (!query.trim()||loading) ? C.border : C.blue,
                  color: (!query.trim()||loading) ? C.textLight : "#fff",
                  fontWeight:700, fontSize:13, cursor: (!query.trim()||loading) ? "not-allowed":"pointer",
                }}>{loading ? "Szukam…" : "Szukaj"}</button>
              </div>
              {/* quick tags */}
              <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ fontSize:11, color:C.textLight }}>Szybkie wyszukiwanie:</span>
                {["hasło","VPN","backup","onboarding","2FA","bezpieczeństwo","certyfikat"].map(s=>(
                  <button key={s} onClick={()=>{setQuery(s);doSearch(s);}} style={{ padding:"2px 10px", borderRadius:3, border:`1px solid ${C.border}`, background:C.white, color:C.textMid, fontSize:11, cursor:"pointer" }}>{s}</button>
                ))}
              </div>
            </Card>

            {/* Results */}
            {error && <div style={{ padding:"10px 14px", background:C.redBg, border:`1px solid ${C.red}40`, borderRadius:4, color:C.red, fontSize:13, marginBottom:12 }}>⚠ {error}</div>}

            {loading && (
              <Card style={{ padding:"40px", textAlign:"center" }}>
                <div style={{ fontSize:13, color:C.textLight }}>⏳ Przeszukuję bazę wiedzy…</div>
              </Card>
            )}

            {!loading && searched && results.length===0 && !error && (
              <Card style={{ padding:"40px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                <div style={{ fontSize:14, color:C.textMid }}>Brak wyników dla zapytania <strong>"{query}"</strong></div>
                <div style={{ fontSize:12, color:C.textLight, marginTop:4 }}>Spróbuj innych słów kluczowych lub trybu semantycznego</div>
              </Card>
            )}

            {!loading && results.length>0 && (
              <Card>
                <SectionHeader title="Wyniki wyszukiwania" count={results.length}
                  extra={<span style={{ fontSize:12, color:C.textLight }}>tryb: <strong style={{ color:C.blue }}>{mode}</strong></span>}/>
                {results.map((r,i)=><ResultRow key={r.article_id} result={r} query={query} index={i+1}/>)}
              </Card>
            )}

            {!searched && !loading && (
              <Card style={{ padding:"48px", textAlign:"center" }}>
                <div style={{ width:60, height:60, background:C.blueLight, borderRadius:8, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>📚</div>
                <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>Wyszukaj w bazie wiedzy</div>
                <div style={{ fontSize:13, color:C.textLight }}>Wpisz zapytanie lub skorzystaj z szybkich tagów powyżej</div>
              </Card>
            )}
          </>
        )}

        {/* ── BROWSE ── */}
        {tab==="browse" && (
          <>
            {/* Stats */}
            <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
              <StatBox icon="📄" value={articles.length} label="Artykuły w bazie" color={C.blue}/>
              <StatBox icon="🗂" value={cats.length} label="Kategorie" color={C.green}/>
            </div>

            {browseLoading && <Card style={{ padding:40, textAlign:"center" }}><span style={{ color:C.textLight }}>⏳ Ładowanie artykułów…</span></Card>}

            {!browseLoading && (
              <Card>
                <SectionHeader title="Lista artykułów"
                  extra={
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      <button onClick={()=>setSelCat(null)} style={{ padding:"2px 10px", borderRadius:3, border:`1px solid`, borderColor:!selCat?C.blue:C.border, background:!selCat?C.blueLight:C.white, color:!selCat?C.blue:C.textMid, fontSize:11, cursor:"pointer" }}>Wszystkie</button>
                      {cats.map(c=>(
                        <button key={c} onClick={()=>setSelCat(c===selCat?null:c)} style={{ padding:"2px 10px", borderRadius:3, border:`1px solid`, borderColor:selCat===c?C.blue:C.border, background:selCat===c?C.blueLight:C.white, color:selCat===c?C.blue:C.textMid, fontSize:11, cursor:"pointer" }}>{c}</button>
                      ))}
                    </div>
                  }
                />
                {filtered.length===0
                  ? <div style={{ padding:32, textAlign:"center", color:C.textLight, fontSize:13 }}>Brak artykułów. Dodaj je w zakładce "Dodaj artykuł".</div>
                  : filtered.map(a=><ArticleRow key={a.article_id} article={a} onSearch={t=>{setQuery(t);doSearch(t);}}/>)
                }
                <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.borderLight}` }}>
                  <button onClick={()=>{setArticles([]);loadArticles();}} style={{ padding:"4px 12px", borderRadius:3, border:`1px solid ${C.border}`, background:C.white, color:C.textMid, fontSize:12, cursor:"pointer" }}>🔄 Odśwież listę</button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── ADD ── */}
        {tab==="add" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Krok 1 */}
            <Card>
              <SectionHeader title="Krok 1 — Treść artykułu"/>
              <div style={{ padding:"16px" }}>
                <Field label="Tytuł artykułu" required><InputField value={title} onChange={setTitle} placeholder="np. Jak skonfigurować VPN"/></Field>
                <Field label="Krótki opis (summary)"><InputField value={summary} onChange={setSummary} placeholder="Jednozdaniowy opis"/></Field>
                <Field label="Treść artykułu" required><TextArea value={content} onChange={setContent} placeholder="Pełna treść artykułu (Markdown jest OK)..." rows={8}/></Field>
                <Field label="Autor"><InputField value={author} onChange={setAuthor} placeholder="np. Jan Kowalski"/></Field>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleSave} disabled={saving||!title.trim()||!content.trim()} style={{
                    padding:"8px 20px", borderRadius:4, border:"none",
                    background:(!title.trim()||!content.trim())?C.border:C.blue,
                    color:(!title.trim()||!content.trim())?C.textLight:"#fff",
                    fontWeight:700, fontSize:13, cursor:(!title.trim()||!content.trim())?"not-allowed":"pointer",
                  }}>{saving?"Zapisuję…":savedId?"✅ Zapisano":"💾 Zapisz artykuł"}</button>
                  {savedId && <button onClick={resetForm} style={{ padding:"8px 14px", borderRadius:4, border:`1px solid ${C.border}`, background:C.white, color:C.textMid, fontSize:13, cursor:"pointer" }}>Nowy artykuł</button>}
                </div>
              </div>
            </Card>

            {/* Krok 2 */}
            <Card style={{ opacity:savedId?1:0.5 }}>
              <SectionHeader title="Krok 2 — Załącznik (opcjonalnie)"/>
              <div style={{ padding:"16px" }}>
                {!savedId && <div style={{ padding:"10px 12px", background:C.orangeBg, border:`1px solid ${C.orange}40`, borderRadius:4, fontSize:12, color:"#856404", marginBottom:12 }}>ℹ Najpierw zapisz artykuł w Kroku 1</div>}
                <div
                  onClick={()=>savedId&&fileRef.current?.click()}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();if(savedId)setFile(e.dataTransfer.files[0]);}}
                  style={{ border:`2px dashed ${file?C.green:C.border}`, borderRadius:4, padding:"32px 16px", textAlign:"center", cursor:savedId?"pointer":"not-allowed", background:file?C.greenBg:C.bg, marginBottom:12 }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{file?"📎":"📂"}</div>
                  {file
                    ? <div style={{ fontSize:13, fontWeight:600, color:C.green }}>{file.name}<br/><span style={{ fontSize:11, fontWeight:400, color:C.textLight }}>({(file.size/1024).toFixed(0)} KB)</span></div>
                    : <div style={{ fontSize:13, color:C.textLight }}>Przeciągnij plik lub kliknij aby wybrać<br/><span style={{ fontSize:11 }}>Obsługiwane formaty: PDF, DOCX, MD, TXT</span></div>
                  }
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.md,.txt" style={{ display:"none" }} onChange={e=>setFile(e.target.files[0])}/>
                </div>
                <button onClick={handleUpload} disabled={!file||!savedId||uploading} style={{
                  padding:"8px 20px", borderRadius:4, border:"none",
                  background:(!file||!savedId)?C.border:C.green,
                  color:(!file||!savedId)?C.textLight:"#fff",
                  fontWeight:700, fontSize:13, cursor:(!file||!savedId)?"not-allowed":"pointer",
                }}>{uploading?"⏳ Wysyłam…":"⬆ Wgraj załącznik"}</button>
              </div>
            </Card>
          </div>
        )}

        {/* ── INFO ── */}
        {tab==="info" && (
          <>
            <InfoBlock icon="💡" title="Co to jest ten moduł?">
              <InfoP>To <strong>wyszukiwarka kontekstowa bazy wiedzy</strong> — działa jak Google, ale przeszukuje tylko Twoje artykuły i dokumenty. Rozumie znaczenie pytań, nie tylko słowa kluczowe.</InfoP>
              <InfoP>Przykład: wpisujesz <em>"nie mogę się zalogować"</em> — system znajdzie artykuł <em>"Procedura odzyskiwania dostępu"</em>, bo rozumie <strong>znaczenie</strong>, nie tylko słowa.</InfoP>
            </InfoBlock>

            <InfoBlock icon="🔍" title="Tryby wyszukiwania">
              <ModeInfo icon="⚡" name="Wyszukiwanie słów kluczowych (FTS)" color={C.orange} bg={C.orangeBg}
                how='Działa jak Ctrl+F — szuka dokładnych słów i ich odmian. Szybkie i precyzyjne.'
                good="znasz dokładną frazę, szukasz kodu błędu, nazwy własnej"
                bad="używasz innych słów niż w artykule"/>
              <ModeInfo icon="🧠" name="Wyszukiwanie semantyczne" color={C.green} bg={C.greenBg}
                how='Rozumie znaczenie — "nie mogę się zalogować" = "odzyskiwanie dostępu". Używa modelu AI.'
                good="opisujesz problem własnymi słowami, nie znasz terminologii"
                bad="szukasz konkretnego kodu błędu lub numeru seryjnego"/>
              <ModeInfo icon="🔀" name="Hybrydowe (domyślne)" color={C.blue} bg={C.blueLight}
                how="Łączy oba tryby algorytmem RRF — artykuły wysoko w obu listach trafiają na szczyt."
                good="w większości przypadków — najlepsze wyniki"
                bad="(brak istotnych wad — dlatego to tryb domyślny)"/>
            </InfoBlock>

            <InfoBlock icon="🛠" title="Technologie">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textLight, textTransform:"uppercase", marginBottom:10 }}>Backend (serwer)</div>
                  <Tech label="Python" desc="Język programowania serwera" color={C.orange}/>
                  <Tech label="FastAPI" desc="Framework REST API" color={C.green}/>
                  <Tech label="SQLite" desc="Baza danych (jeden plik)" color={C.blue}/>
                  <Tech label="fastembed" desc="Model AI do embeddingów (~130 MB)" color={C.purple}/>
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textLight, textTransform:"uppercase", marginBottom:10 }}>Infrastruktura</div>
                  <Tech label="Railway" desc="Hosting backendu (chmura)" color={C.blue}/>
                  <Tech label="Vercel" desc="Hosting frontendu" color="#000"/>
                  <Tech label="Docker" desc="Konteneryzacja aplikacji" color="#0ea5e9}"/>
                  <Tech label="GitHub" desc="Repozytorium kodu" color={C.text}/>
                </div>
              </div>
            </InfoBlock>

            <InfoBlock icon="🗄" title="Struktura bazy danych">
              {[
                { t:"kb_articles",    d:"Artykuły — tytuł, treść, kategoria, autor", c:C.blue },
                { t:"kb_attachments", d:"Załączniki — ścieżka pliku, wyekstrahowany tekst (PDF/DOCX/MD)", c:C.purple },
                { t:"kb_embeddings",  d:"Wektory AI — 384 liczby dla każdego fragmentu tekstu", c:C.green },
                { t:"kb_categories",  d:"Kategorie artykułów", c:C.orange },
                { t:"kb_search_logs", d:"Historia wyszukiwań — zapytania, czasy, wyniki", c:C.textMid },
              ].map(r=>(
                <div key={r.t} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                  <code style={{ fontSize:11, background:r.c+"15", color:r.c, padding:"2px 8px", borderRadius:3, flexShrink:0, border:`1px solid ${r.c}30` }}>{r.t}</code>
                  <span style={{ fontSize:13, color:C.textMid }}>{r.d}</span>
                </div>
              ))}
            </InfoBlock>
          </>
        )}

      </Page>
      <Toast msg={toast?.msg} type={toast?.type}/>
    </div>
  );
}
