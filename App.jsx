import { useState, useCallback, useRef, useEffect } from "react";

const API_BASE = "https://kb-search-production.up.railway.app";

const slugify = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const ScoreBadge = ({ label, value, color }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"4px 10px", borderRadius:6, background:color+"18", border:`1px solid ${color}40`, minWidth:64 }}>
    <span style={{ fontSize:11, color:"#94a3b8", textTransform:"uppercase" }}>{label}</span>
    <span style={{ fontSize:15, fontWeight:700, color, fontFamily:"monospace" }}>{(value*100).toFixed(0)}%</span>
  </div>
);

const SourceTag = ({ type }) => {
  const map = { article:{label:"artykuł",color:"#6366f1"}, attachment:{label:"załącznik",color:"#0ea5e9"} };
  const { label, color } = map[type]||{label:type,color:"#64748b"};
  return <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:color+"20", color, fontWeight:600 }}>{label}</span>;
};

const TabBtn = ({ value, current, onClick, label, icon }) => (
  <button onClick={() => onClick(value)} style={{
    flex:1, padding:"10px 8px", borderRadius:8, border:"none",
    background: current===value ? "#6366f1" : "transparent",
    color: current===value ? "#fff" : "#64748b",
    cursor:"pointer", fontSize:12, fontWeight:600, transition:"all .2s",
    display:"flex", alignItems:"center", justifyContent:"center", gap:4,
  }}><span>{icon}</span><span style={{ display:"none" }}>{label}</span>
  <span style={{ fontSize:11 }}>{label}</span>
  </button>
);

const ModeBtn = ({ value, current, onClick, label, desc }) => (
  <button onClick={() => onClick(value)} style={{
    padding:"8px 14px", borderRadius:8, border:"1px solid",
    borderColor: current===value ? "#6366f1" : "#334155",
    background: current===value ? "#6366f130" : "#1e293b",
    color: current===value ? "#818cf8" : "#64748b",
    cursor:"pointer", fontSize:12, fontWeight:600,
  }}>{label}<span style={{ display:"block", fontSize:10, opacity:.7 }}>{desc}</span></button>
);

const Input = ({ label, value, onChange, placeholder, multiline, rows=4 }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:"block", fontSize:12, color:"#94a3b8", marginBottom:6, fontWeight:600 }}>{label}</label>
    {multiline
      ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
          style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"#f1f5f9", fontSize:13, fontFamily:"inherit", resize:"vertical", outline:"none", boxSizing:"border-box" }} />
      : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 12px", color:"#f1f5f9", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
    }
  </div>
);

const Toast = ({ msg, type }) => (
  msg ? <div style={{
    position:"fixed", bottom:24, right:24, padding:"12px 20px", borderRadius:10,
    background: type==="ok" ? "#10b98120" : "#ef444420",
    border: `1px solid ${type==="ok" ? "#10b981" : "#ef4444"}`,
    color: type==="ok" ? "#10b981" : "#fca5a5",
    fontSize:13, fontWeight:600, zIndex:999, maxWidth:340,
  }}>{type==="ok" ? "✅" : "❌"} {msg}</div> : null
);

const ResultCard = ({ result, query }) => {
  const [exp, setExp] = useState(false);
  const hl = (text) => {
    if (!query||!text) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi");
    return text.split(re).map((p,i) => re.test(p) ? <mark key={i} style={{ background:"#fde68a", borderRadius:2, padding:"0 2px" }}>{p}</mark> : p);
  };
  return (
    <div style={{ background:"#1e293b", borderRadius:12, padding:"18px 22px", border:"1px solid #334155", marginBottom:12, transition:"border-color .2s" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#6366f1"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="#334155"}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap" }}>
            {result.category && <span style={{ fontSize:11, color:"#64748b", background:"#0f172a", padding:"2px 8px", borderRadius:99 }}>{result.category}</span>}
            {result.source_types.map(t=><SourceTag key={t} type={t}/>)}
          </div>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#f1f5f9" }}>{hl(result.title)}</h3>
          {result.summary && <p style={{ margin:"6px 0 0", fontSize:13, color:"#94a3b8" }}>{hl(result.summary)}</p>}
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <ScoreBadge label="FTS" value={result.fts_score} color="#f59e0b"/>
          <ScoreBadge label="Sem." value={result.semantic_score} color="#10b981"/>
        </div>
      </div>
      {result.matched_chunks.length>0 && (
        <div style={{ marginTop:12 }}>
          <button onClick={()=>setExp(e=>!e)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6366f1", fontSize:12, padding:0, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ transform:exp?"rotate(90deg)":"none", display:"inline-block", transition:".2s" }}>▶</span>
            {exp?"Ukryj":"Pokaż"} fragment ({result.matched_chunks.length})
          </button>
          {exp && result.matched_chunks.map((chunk,i)=>(
            <div key={i} style={{ marginTop:8, padding:"10px 14px", background:"#0f172a", borderLeft:"3px solid #6366f1", borderRadius:"0 8px 8px 0", fontSize:12, color:"#94a3b8", lineHeight:1.7 }}>…{hl(chunk)}…</div>
          ))}
        </div>
      )}
    </div>
  );
};

const ArticleCard = ({ article, onSearch }) => (
  <div style={{ background:"#1e293b", borderRadius:10, padding:"14px 16px", border:"1px solid #334155", marginBottom:8, cursor:"pointer", transition:"border-color .2s" }}
    onMouseEnter={e=>e.currentTarget.style.borderColor="#6366f1"}
    onMouseLeave={e=>e.currentTarget.style.borderColor="#334155"}
    onClick={()=>onSearch(article.title)}>
    <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
      <div style={{ flex:1 }}>
        {article.category && <span style={{ fontSize:10, color:"#64748b", background:"#0f172a", padding:"1px 6px", borderRadius:99, marginBottom:4, display:"inline-block" }}>{article.category}</span>}
        <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{article.title}</div>
        {article.summary && <div style={{ fontSize:11, color:"#64748b", marginTop:3 }}>{article.summary}</div>}
      </div>
      <span style={{ fontSize:11, color:"#6366f1", flexShrink:0 }}>🔍 szukaj</span>
    </div>
  </div>
);

const AddArticleForm = ({ onSuccess }) => {
  const [title, setTitle]       = useState("");
  const [summary, setSummary]   = useState("");
  const [content, setContent]   = useState("");
  const [author, setAuthor]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [articleId, setArticleId] = useState(null);
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleSave = async () => {
    if (!title.trim()||!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/articles`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ title:title.trim(), slug:slugify(title), summary:summary.trim()||null, content:content.trim(), author:author.trim()||null, category_id:null }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setArticleId(data.id);
      onSuccess(`Artykuł "${title}" dodany (ID: ${data.id})`);
    } catch(e) { onSuccess(`Błąd: ${e.message}`, "err"); }
    finally { setSaving(false); }
  };

  const handleUpload = async () => {
    if (!file||!articleId) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${API_BASE}/articles/${articleId}/attachments`, { method:"POST", body:fd });
      if (!res.ok) throw new Error(await res.text());
      onSuccess(`Załącznik "${file.name}" wgrany i indeksowany!`);
      setFile(null);
    } catch(e) { onSuccess(`Błąd: ${e.message}`, "err"); }
    finally { setUploading(false); }
  };

  const reset = () => { setTitle(""); setSummary(""); setContent(""); setAuthor(""); setArticleId(null); setFile(null); };

  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:"24px", border:"1px solid #334155" }}>
      <h2 style={{ margin:"0 0 20px", fontSize:18, fontWeight:700, color:"#f1f5f9" }}>📝 Dodaj nowy artykuł</h2>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:12, color:"#6366f1", fontWeight:700, marginBottom:12, letterSpacing:"0.08em", textTransform:"uppercase" }}>Krok 1 — Treść artykułu</div>
        <Input label="Tytuł *" value={title} onChange={setTitle} placeholder="np. Jak skonfigurować VPN"/>
        <Input label="Krótki opis" value={summary} onChange={setSummary} placeholder="Jednozdaniowy opis artykułu"/>
        <Input label="Treść artykułu *" value={content} onChange={setContent} placeholder="Pełna treść (Markdown OK)..." multiline rows={8}/>
        <Input label="Autor" value={author} onChange={setAuthor} placeholder="np. Jan Kowalski"/>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={handleSave} disabled={saving||!title.trim()||!content.trim()} style={{ padding:"10px 24px", borderRadius:9, border:"none", background:(!title.trim()||!content.trim())?"#334155":"#6366f1", color:"#fff", cursor:(!title.trim()||!content.trim())?"not-allowed":"pointer", fontSize:13, fontWeight:700 }}>
            {saving?"⟳ Zapisuję…":articleId?"✅ Zapisano!":"💾 Zapisz artykuł"}
          </button>
          {articleId && <button onClick={reset} style={{ padding:"10px 16px", borderRadius:9, border:"1px solid #334155", background:"transparent", color:"#64748b", cursor:"pointer", fontSize:13 }}>Nowy artykuł</button>}
        </div>
      </div>
      <div style={{ borderTop:"1px solid #334155", paddingTop:24, opacity:articleId?1:0.4 }}>
        <div style={{ fontSize:12, color:"#0ea5e9", fontWeight:700, marginBottom:12, letterSpacing:"0.08em", textTransform:"uppercase" }}>Krok 2 — Dodaj załącznik (opcjonalnie)</div>
        {!articleId && <div style={{ fontSize:12, color:"#475569", marginBottom:12 }}>ℹ Najpierw zapisz artykuł w Kroku 1</div>}
        <div onClick={()=>articleId&&fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(articleId)setFile(e.dataTransfer.files[0]);}}
          style={{ border:`2px dashed ${file?"#10b981":"#334155"}`, borderRadius:10, padding:"24px", textAlign:"center", cursor:articleId?"pointer":"not-allowed", background:file?"#10b98110":"#0f172a", transition:"all .2s", marginBottom:12 }}>
          <div style={{ fontSize:28, marginBottom:8 }}>{file?"📎":"📂"}</div>
          {file
            ? <div style={{ fontSize:13, color:"#10b981", fontWeight:600 }}>{file.name} ({(file.size/1024).toFixed(0)} KB)</div>
            : <div style={{ fontSize:13, color:"#475569" }}>Przeciągnij plik lub kliknij<br/><span style={{ fontSize:11 }}>PDF, DOCX, MD, TXT</span></div>
          }
          <input ref={fileRef} type="file" accept=".pdf,.docx,.md,.txt" style={{ display:"none" }} onChange={e=>setFile(e.target.files[0])}/>
        </div>
        <button onClick={handleUpload} disabled={!file||!articleId||uploading} style={{ padding:"10px 24px", borderRadius:9, border:"none", background:(!file||!articleId)?"#334155":"#0ea5e9", color:"#fff", cursor:(!file||!articleId)?"not-allowed":"pointer", fontSize:13, fontWeight:700 }}>
          {uploading?"⟳ Wysyłam i indeksuję…":"⬆ Wgraj załącznik"}
        </button>
      </div>
    </div>
  );
};

// ─── INFO TAB ────────────────────────────────────────────────
const InfoSection = ({ icon, title, color, children }) => (
  <div style={{ background:"#1e293b", borderRadius:14, padding:"22px 24px", border:`1px solid ${color}30`, marginBottom:16 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
      <span style={{ fontSize:24 }}>{icon}</span>
      <h3 style={{ margin:0, fontSize:16, fontWeight:700, color }}>{title}</h3>
    </div>
    {children}
  </div>
);

const InfoText = ({ children }) => (
  <p style={{ margin:"0 0 10px", fontSize:13, color:"#94a3b8", lineHeight:1.8 }}>{children}</p>
);

const Pill = ({ label, color="#6366f1" }) => (
  <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:99, background:color+"20", color, fontSize:12, fontWeight:600, margin:"3px 4px 3px 0" }}>{label}</span>
);

const CompareRow = ({ mode, icon, color, title, how, good, bad }) => (
  <div style={{ background:"#0f172a", borderRadius:10, padding:"14px 16px", marginBottom:10, border:`1px solid ${color}30` }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ fontWeight:700, color, fontSize:14 }}>{mode}</span>
      <span style={{ fontSize:12, color:"#64748b" }}>— {title}</span>
    </div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:6 }}><span style={{ color:"#64748b" }}>Jak działa: </span>{how}</div>
    <div style={{ fontSize:12, color:"#10b981", marginBottom:4 }}>✅ Dobre gdy: {good}</div>
    <div style={{ fontSize:12, color:"#f87171" }}>⚠ Słabe gdy: {bad}</div>
  </div>
);

const ArchDiagram = () => (
  <div style={{ background:"#0f172a", borderRadius:12, padding:"20px", marginTop:8, fontFamily:"monospace", fontSize:12, color:"#64748b", lineHeight:2 }}>
    <div style={{ color:"#f1f5f9", marginBottom:4 }}>Przepływ zapytania użytkownika:</div>
    <div><span style={{ color:"#818cf8" }}>👤 Użytkownik</span> wpisuje zapytanie</div>
    <div style={{ paddingLeft:16 }}>↓</div>
    <div style={{ paddingLeft:16 }}><span style={{ color:"#f59e0b" }}>⚡ FTS (Full-Text Search)</span> — szuka słów kluczowych w SQLite</div>
    <div style={{ paddingLeft:16 }}>↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓</div>
    <div style={{ paddingLeft:16 }}><span style={{ color:"#10b981" }}>🧠 Semantic</span> — zamienia zapytanie na wektor (fastembed)</div>
    <div style={{ paddingLeft:16 }}>↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓</div>
    <div style={{ paddingLeft:16, color:"#6366f1" }}>🔀 RRF Ranking — łączy oba wyniki w jeden ranking</div>
    <div style={{ paddingLeft:16 }}>↓</div>
    <div style={{ paddingLeft:16, color:"#f1f5f9" }}>📋 Posortowane wyniki → użytkownik</div>
  </div>
);

const InfoTab = () => (
  <div>
    {/* Co to jest */}
    <InfoSection icon="💡" title="Co to jest ta aplikacja?" color="#818cf8">
      <InfoText>
        To <strong style={{ color:"#f1f5f9" }}>wyszukiwarka kontekstowa bazy wiedzy</strong> — działa jak Google, ale przeszukuje tylko Twoje artykuły i dokumenty. Możesz zadawać pytania w naturalnym języku, a system znajdzie najbardziej pasujące artykuły nawet jeśli nie użyjesz dokładnych słów z tytułu.
      </InfoText>
      <InfoText>
        Przykład: wpisujesz <em style={{ color:"#a5b4fc" }}>"nie mogę się zalogować"</em> — system znajdzie artykuł <em style={{ color:"#a5b4fc" }}>"Procedura odzyskiwania dostępu"</em>, bo rozumie <strong style={{ color:"#f1f5f9" }}>znaczenie</strong>, nie tylko słowa.
      </InfoText>
    </InfoSection>

    {/* Tryby wyszukiwania */}
    <InfoSection icon="🔍" title="Jak działają tryby wyszukiwania?" color="#f59e0b">
      <InfoText>Masz do wyboru trzy tryby — każdy działa inaczej:</InfoText>
      <CompareRow
        mode="FTS" icon="⚡" color="#f59e0b"
        title="Full-Text Search (wyszukiwanie pełnotekstowe)"
        how='Działa jak Ctrl+F w dokumencie — szuka dokładnych słów lub ich fragmentów. Np. "hasło" znajdzie "hasła", "hasłem", "hasłach".'
        good="znasz dokładną frazę, szukasz numeru, kodu, nazwy własnej"
        bad="użyjesz synonimu lub innego sformułowania tego samego problemu"
      />
      <CompareRow
        mode="Semantic" icon="🧠" color="#10b981"
        title="Wyszukiwanie semantyczne (znaczeniowe)"
        how='Zamienia tekst na "wektor znaczeń" (384 liczb) i porównuje podobieństwo matematyczne. Rozumie że "nie mogę się zalogować" = "odzyskiwanie dostępu".'
        good="opisujesz problem własnymi słowami, nie znasz terminologii"
        bad="szukasz bardzo konkretnej frazy, numeru seryjnego, kodu błędu"
      />
      <CompareRow
        mode="Hybrid" icon="🔀" color="#6366f1"
        title="Hybrydowe (FTS + Semantic razem)"
        how="Uruchamia oba tryby jednocześnie, a wyniki łączy algorytmem RRF (Reciprocal Rank Fusion) — artykuły które są wysoko w obu listach trafiają na górę."
        good="w większości przypadków — najlepsze wyniki"
        bad="(praktycznie nie ma wad — dlatego to domyślny tryb)"
      />
      <ArchDiagram/>
    </InfoSection>

    {/* Technologie */}
    <InfoSection icon="🛠" title="Z czego zbudowana jest aplikacja?" color="#0ea5e9">
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:12, color:"#64748b", marginBottom:6, fontWeight:600 }}>BACKEND (serwer)</div>
        <div style={{ marginBottom:8 }}>
          <Pill label="Python" color="#f59e0b"/>
          <Pill label="FastAPI" color="#10b981"/>
          <Pill label="SQLite" color="#0ea5e9"/>
          <Pill label="fastembed" color="#6366f1"/>
        </div>
        <InfoText>
          <strong style={{ color:"#f1f5f9" }}>Python</strong> — język programowania w którym napisany jest serwer.<br/>
          <strong style={{ color:"#f1f5f9" }}>FastAPI</strong> — framework do tworzenia API, obsługuje zapytania z przeglądarki.<br/>
          <strong style={{ color:"#f1f5f9" }}>SQLite</strong> — lekka baza danych (jeden plik na dysku), przechowuje artykuły i embeddingi.<br/>
          <strong style={{ color:"#f1f5f9" }}>fastembed</strong> — biblioteka AI która zamienia tekst na wektory liczbowe (embeddingi).
        </InfoText>
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:12, color:"#64748b", marginBottom:6, fontWeight:600 }}>FRONTEND (przeglądarka)</div>
        <div style={{ marginBottom:8 }}>
          <Pill label="React" color="#61dafb"/>
          <Pill label="JavaScript" color="#f7df1e" />
        </div>
        <InfoText>
          <strong style={{ color:"#f1f5f9" }}>React</strong> — biblioteka do budowania interfejsów użytkownika (to co widzisz i klikasz).
        </InfoText>
      </div>
      <div>
        <div style={{ fontSize:12, color:"#64748b", marginBottom:6, fontWeight:600 }}>HOSTING (gdzie to działa)</div>
        <div style={{ marginBottom:8 }}>
          <Pill label="Railway" color="#a855f7"/>
          <Pill label="Docker" color="#0ea5e9"/>
          <Pill label="GitHub" color="#f1f5f9"/>
        </div>
        <InfoText>
          <strong style={{ color:"#f1f5f9" }}>Railway</strong> — platforma chmurowa gdzie działa serwer (darmowy plan).<br/>
          <strong style={{ color:"#f1f5f9" }}>Docker</strong> — "pojemnik" w którym spakowana jest aplikacja z wszystkimi zależnościami.<br/>
          <strong style={{ color:"#f1f5f9" }}>GitHub</strong> — repozytorium kodu, Railway automatycznie wdraża zmiany po każdym commicie.
        </InfoText>
      </div>
    </InfoSection>

    {/* Co to są embeddingi */}
    <InfoSection icon="🧮" title="Czym są embeddingi? (wyjaśnienie dla laika)" color="#10b981">
      <InfoText>
        Wyobraź sobie że każde słowo lub zdanie możesz opisać jako punkt w przestrzeni. <strong style={{ color:"#f1f5f9" }}>Słowa o podobnym znaczeniu leżą blisko siebie</strong>, słowa o różnym znaczeniu — daleko.
      </InfoText>
      <div style={{ background:"#0f172a", borderRadius:10, padding:"16px", marginBottom:12, fontSize:12, color:"#64748b", lineHeight:2 }}>
        <div style={{ color:"#10b981" }}>Blisko siebie (podobne znaczenie):</div>
        <div style={{ paddingLeft:12 }}>"nie mogę się zalogować" ↔ "problem z dostępem" ↔ "zapomniane hasło"</div>
        <div style={{ color:"#f87171", marginTop:8 }}>Daleko od siebie (różne znaczenie):</div>
        <div style={{ paddingLeft:12 }}>"zapomniane hasło" ↔ "konfiguracja sieci VPN" ↔ "harmonogram backupów"</div>
      </div>
      <InfoText>
        Model AI (<strong style={{ color:"#f1f5f9" }}>BAAI/bge-small-en-v1.5</strong>, ~130 MB) przetwarza każdy artykuł i zamienia go na listę 384 liczb — to właśnie jest <em style={{ color:"#a5b4fc" }}>embedding</em>. Gdy wpisujesz zapytanie, system zamienia je na taki sam format i sprawdza które artykuły są "matematycznie najbliżej".
      </InfoText>
    </InfoSection>

    {/* Schemat bazy */}
    <InfoSection icon="🗄" title="Co jest przechowywane w bazie danych?" color="#a855f7">
      {[
        { table:"kb_articles", desc:"Artykuły — tytuł, treść, kategoria, autor", color:"#6366f1" },
        { table:"kb_attachments", desc:"Załączniki — ścieżka do pliku, wyekstrahowany tekst (PDF/DOCX/MD)", color:"#0ea5e9" },
        { table:"kb_embeddings", desc:"Wektory embeddingów — 384 liczby dla każdego fragmentu tekstu", color:"#10b981" },
        { table:"kb_categories", desc:"Kategorie artykułów (Bezpieczeństwo, Infrastruktura itd.)", color:"#f59e0b" },
        { table:"kb_search_logs", desc:"Logi wyszukiwań — co szukano, ile wyników, jak długo trwało", color:"#a855f7" },
      ].map(r=>(
        <div key={r.table} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
          <span style={{ fontFamily:"monospace", fontSize:12, color:r.color, background:r.color+"15", padding:"2px 8px", borderRadius:6, flexShrink:0, marginTop:2 }}>{r.table}</span>
          <span style={{ fontSize:13, color:"#94a3b8" }}>{r.desc}</span>
        </div>
      ))}
    </InfoSection>
  </div>
);

// ─── MAIN ────────────────────────────────────────────────────
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

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),4000); };

  useEffect(() => { if(tab==="browse"&&articles.length===0) loadArticles(); }, [tab]);

  const loadArticles = async () => {
    setBrowseLoading(true);
    try {
      const seen=new Set(); const all=[];
      for (const q of ["a","e","i","o","procedura","konfiguracja","polityka","backup","onboarding"]) {
        const res = await fetch(`${API_BASE}/search?q=${q}&mode=fts&top_k=50`);
        if(res.ok) (await res.json()).forEach(r=>{if(!seen.has(r.article_id)){seen.add(r.article_id);all.push(r);}});
      }
      setArticles(all);
    } catch(e){console.error(e);}
    finally{setBrowseLoading(false);}
  };

  const doSearch = useCallback(async (q=query) => {
    if(!q.trim()) return;
    setLoading(true); setError(null); setSearched(true); setTab("search");
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}&mode=${mode}&top_k=10`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      setResults(await res.json());
    } catch(e){setError("Nie można połączyć z API.");}
    finally{setLoading(false);}
  }, [query,mode]);

  const cats = [...new Set(articles.map(a=>a.category).filter(Boolean))];
  const filteredArticles = selCat ? articles.filter(a=>a.category===selCat) : articles;

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", color:"#f1f5f9", fontFamily:"'IBM Plex Mono','Fira Code',monospace", display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 16px" }}>

      {/* Header */}
      <div style={{ width:"100%", maxWidth:860, marginBottom:28 }}>
        <div style={{ fontSize:11, color:"#6366f1", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:4 }}>◈ Knowledge Base</div>
        <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:"#f8fafc", letterSpacing:"-0.03em" }}>Wyszukiwarka kontekstowa</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"#475569" }}>Hybrydowe FTS + embeddingi · SQLite · fastembed</p>
      </div>

      {/* Search box */}
      <div style={{ width:"100%", maxWidth:860, marginBottom:12 }}>
        <div style={{ display:"flex", gap:10, background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"10px 14px" }}>
          <span style={{ color:"#475569", fontSize:18, lineHeight:"36px" }}>⌕</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()}
            placeholder="Wyszukaj... np. 'jak zresetować hasło', 'VPN'"
            style={{ flex:1, background:"none", border:"none", outline:"none", color:"#f1f5f9", fontSize:15, fontFamily:"inherit" }}/>
          <button onClick={()=>doSearch()} disabled={loading||!query.trim()} style={{ padding:"6px 18px", borderRadius:8, border:"none", background:loading?"#334155":"#6366f1", color:"#fff", cursor:loading?"not-allowed":"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
            {loading?"…":"Szukaj"}
          </button>
        </div>
      </div>

      {/* Modes */}
      <div style={{ width:"100%", maxWidth:860, display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <ModeBtn value="hybrid" current={mode} onClick={setMode} label="Hybrid" desc="FTS + Semantic"/>
        <ModeBtn value="fts"    current={mode} onClick={setMode} label="FTS"    desc="słowa kluczowe"/>
        <ModeBtn value="semantic" current={mode} onClick={setMode} label="Semantic" desc="znaczenie"/>
      </div>

      {/* Tabs */}
      <div style={{ width:"100%", maxWidth:860, display:"flex", gap:4, marginBottom:24, background:"#1e293b", borderRadius:10, padding:4 }}>
        <TabBtn value="search"  current={tab} onClick={setTab} label="Wyszukiwanie" icon="🔍"/>
        <TabBtn value="browse"  current={tab} onClick={setTab} label="Przeglądaj"   icon="📚"/>
        <TabBtn value="add"     current={tab} onClick={setTab} label="Dodaj"        icon="✏️"/>
        <TabBtn value="info"    current={tab} onClick={setTab} label="Opis"         icon="ℹ️"/>
      </div>

      <div style={{ width:"100%", maxWidth:860 }}>

        {/* SEARCH */}
        {tab==="search" && (
          <>
            {error && <div style={{ background:"#7f1d1d20", border:"1px solid #ef444440", borderRadius:10, padding:"12px 16px", color:"#fca5a5", fontSize:13, marginBottom:16 }}>⚠ {error}</div>}
            {loading && <div style={{ textAlign:"center", color:"#475569", padding:40 }}><div style={{ fontSize:24, animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</div><div style={{ fontSize:13, marginTop:8 }}>Przeszukuję…</div></div>}
            {!loading&&searched&&results.length===0&&!error && <div style={{ textAlign:"center", color:"#475569", padding:40 }}><div style={{ fontSize:32 }}>∅</div><div>Brak wyników.</div></div>}
            {!loading&&results.length>0 && (
              <>
                <div style={{ fontSize:12, color:"#475569", marginBottom:12 }}>{results.length} wyników · tryb: <span style={{ color:"#6366f1" }}>{mode}</span></div>
                {results.map(r=><ResultCard key={r.article_id} result={r} query={query}/>)}
              </>
            )}
            {!searched&&!loading && (
              <div style={{ textAlign:"center", padding:"50px 0" }}>
                <div style={{ width:80, height:80, borderRadius:"50%", background:"#1e293b", margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>🗂</div>
                <div style={{ color:"#334155", marginBottom:16 }}>Wpisz zapytanie lub wybierz szybki tag</div>
                <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                  {["hasło","VPN","backup","onboarding","2FA","bezpieczeństwo"].map(s=>(
                    <button key={s} onClick={()=>{setQuery(s);doSearch(s);}} style={{ padding:"4px 12px", borderRadius:99, border:"1px solid #334155", background:"transparent", color:"#64748b", cursor:"pointer", fontSize:12 }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* BROWSE */}
        {tab==="browse" && (
          <>
            {browseLoading && <div style={{ textAlign:"center", color:"#475569", padding:40 }}><div style={{ fontSize:24, animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</div><div style={{ fontSize:13, marginTop:8 }}>Ładowanie…</div></div>}
            {!browseLoading && (
              <>
                <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
                  {[{label:"Artykuły",value:articles.length,color:"#6366f1",icon:"📄"},{label:"Kategorie",value:cats.length,color:"#10b981",icon:"🗂"}].map(s=>(
                    <div key={s.label} style={{ flex:1, minWidth:120, background:"#1e293b", borderRadius:10, padding:"14px 18px", border:`1px solid ${s.color}30` }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                      <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:12, color:"#64748b" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {cats.length>0 && (
                  <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
                    <button onClick={()=>setSelCat(null)} style={{ padding:"4px 12px", borderRadius:99, border:"1px solid", borderColor:!selCat?"#6366f1":"#334155", background:!selCat?"#6366f130":"transparent", color:!selCat?"#818cf8":"#64748b", cursor:"pointer", fontSize:12, fontWeight:600 }}>Wszystkie ({articles.length})</button>
                    {cats.map(cat=>(
                      <button key={cat} onClick={()=>setSelCat(cat===selCat?null:cat)} style={{ padding:"4px 12px", borderRadius:99, border:"1px solid", borderColor:selCat===cat?"#6366f1":"#334155", background:selCat===cat?"#6366f130":"transparent", color:selCat===cat?"#818cf8":"#64748b", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                        {cat} ({articles.filter(a=>a.category===cat).length})
                      </button>
                    ))}
                  </div>
                )}
                {filteredArticles.length===0
                  ? <div style={{ textAlign:"center", color:"#475569", padding:40, fontSize:13 }}>Brak artykułów. Dodaj je w zakładce "Dodaj".</div>
                  : filteredArticles.map(a=><ArticleCard key={a.article_id} article={{...a,id:a.article_id}} onSearch={title=>{setQuery(title);doSearch(title);}}/>)
                }
                <button onClick={()=>{setArticles([]);loadArticles();}} style={{ marginTop:12, padding:"6px 14px", borderRadius:8, border:"1px solid #334155", background:"transparent", color:"#64748b", cursor:"pointer", fontSize:12 }}>🔄 Odśwież</button>
              </>
            )}
          </>
        )}

        {/* ADD */}
        {tab==="add" && (
          <AddArticleForm onSuccess={(msg,type)=>{ showToast(msg,type||"ok"); if(!type){setArticles([]);} }}/>
        )}

        {/* INFO */}
        {tab==="info" && <InfoTab/>}
      </div>

      <Toast msg={toast?.msg} type={toast?.type}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
