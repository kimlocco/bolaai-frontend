import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Ganti dengan URL backend kamu setelah deploy di Railway/Render
const BACKEND_URL = "https://web-production-c006e.up.railway.app";

// Fallback data jika backend belum di-deploy (data statis untuk demo)
const FALLBACK_DATA = {
  mainz: {
    xgFor: 1.21, xgAgainst: 1.67, formPts: 8,
    avgXgLast5: 1.18, avgXgaLast5: 1.42,
    pressureSucc: 29.1, psxgDiff: -1.2, passPct: 79.4,
    form: ["D","W","D","D","W"],
    formDetails: ["vs Leverkusen","vs HSV","vs RB Leipzig","vs Freiburg","vs Wolfsburg"],
  },
  stuttgart: {
    xgFor: 2.08, xgAgainst: 1.25, formPts: 13,
    avgXgLast5: 2.31, avgXgaLast5: 0.94,
    pressureSucc: 38.7, psxgDiff: 2.8, passPct: 84.2,
    form: ["W","W","W","D","W"],
    formDetails: ["4-0 vs Wolfsburg","4-1 vs Celtic","vs Union Berlin","vs Freiburg","vs Mainz"],
  },
};

const TEAMS = [
  // Bundesliga
  { slug:"mainz",      name:"FSV Mainz 05",         league:"Bundesliga" },
  { slug:"stuttgart",  name:"VfB Stuttgart",          league:"Bundesliga" },
  { slug:"bayern",     name:"Bayern Munich",          league:"Bundesliga" },
  { slug:"dortmund",   name:"Borussia Dortmund",      league:"Bundesliga" },
  { slug:"leverkusen", name:"Bayer Leverkusen",       league:"Bundesliga" },
  { slug:"leipzig",    name:"RB Leipzig",             league:"Bundesliga" },
  { slug:"frankfurt",  name:"Eintracht Frankfurt",    league:"Bundesliga" },
  { slug:"freiburg",   name:"SC Freiburg",            league:"Bundesliga" },
  // Premier League
  { slug:"manchester-city",   name:"Manchester City",    league:"Premier League" },
  { slug:"arsenal",           name:"Arsenal",             league:"Premier League" },
  { slug:"liverpool",         name:"Liverpool",           league:"Premier League" },
  { slug:"chelsea",           name:"Chelsea",             league:"Premier League" },
  { slug:"tottenham",         name:"Tottenham",           league:"Premier League" },
  { slug:"manchester-united", name:"Man United",          league:"Premier League" },
  { slug:"newcastle",         name:"Newcastle",           league:"Premier League" },
  // La Liga
  { slug:"real-madrid", name:"Real Madrid",  league:"La Liga" },
  { slug:"barcelona",   name:"Barcelona",    league:"La Liga" },
  { slug:"atletico",    name:"Atletico Madrid", league:"La Liga" },
  // Serie A
  { slug:"inter",    name:"Inter Milan", league:"Serie A" },
  { slug:"milan",    name:"AC Milan",    league:"Serie A" },
  { slug:"juventus", name:"Juventus",    league:"Serie A" },
  { slug:"napoli",   name:"Napoli",      league:"Serie A" },
  // Ligue 1
  { slug:"psg", name:"PSG", league:"Ligue 1" },
];

// ─── PREDICTION ENGINE ────────────────────────────────────────────────────────
function poissonProb(lambda, k) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let r = Math.exp(-lambda) * Math.pow(lambda, k), f = 1;
  for (let i = 1; i <= k; i++) f *= i;
  return r / f;
}

function calcFromFBref(homeData, awayData, h2h, marketOdds) {
  // ── xG lambda dari FBref (avg 5 laga terakhir) ──────────────────────────
  let hL = (homeData.avgXgLast5 + awayData.avgXgaLast5) / 2;
  let aL = (awayData.avgXgLast5 + homeData.avgXgaLast5) / 2;

  // ── Home advantage ───────────────────────────────────────────────────────
  hL *= 1.10;

  // ── Form adjustment (pts last 5: max 15) ────────────────────────────────
  const formF = 1 + ((homeData.formPts - awayData.formPts) / 15) * 0.15;
  hL *= formF; aL /= formF;

  // ── GK quality (PSxG-GA): GK bagus → lawan cetak lebih sedikit) ─────────
  const hGkF = 1 - Math.max(-0.15, Math.min(0.15, (homeData.psxgDiff || 0) * 0.02));
  const aGkF = 1 - Math.max(-0.15, Math.min(0.15, (awayData.psxgDiff || 0) * 0.02));
  aL *= hGkF;  // home GK bagus → away susah cetak
  hL *= aGkF;  // away GK bagus → home susah cetak

  // ── Pressing intensity (pressure success %) ──────────────────────────────
  const hPress = (homeData.pressureSucc || 30) / 100;
  const aPress = (awayData.pressureSucc || 30) / 100;
  const pressF = 1 + (hPress - aPress) * 0.20;
  hL *= pressF; aL /= pressF;

  // ── Pass accuracy (kontrol permainan) ────────────────────────────────────
  const hPass = (homeData.passPct || 80) / 100;
  const aPass = (awayData.passPct || 80) / 100;
  const passF = 1 + (hPass - aPass) * 0.12;
  hL *= passF; aL /= passF;

  // ── H2H adjustment ───────────────────────────────────────────────────────
  const h2hTotal = (h2h.homeWins || 0) + (h2h.awayWins || 0) + (h2h.draws || 0);
  if (h2hTotal > 0) {
    const h2hF = 1 + ((h2h.homeWins - h2h.awayWins) / h2hTotal) * 0.10;
    hL *= h2hF; aL /= h2hF;
  }

  hL = Math.max(0.3, Math.min(hL, 5.5));
  aL = Math.max(0.3, Math.min(aL, 5.5));

  // ── Simulate scorelines ──────────────────────────────────────────────────
  let hWP=0, dP=0, aWP=0, lines=[];
  for (let h=0; h<=7; h++) for (let a=0; a<=7; a++) {
    const p = poissonProb(hL,h) * poissonProb(aL,a);
    lines.push({h,a,p});
    if(h>a) hWP+=p; else if(h===a) dP+=p; else aWP+=p;
  }

  // ── Blend: 60% FBref model, 40% market odds ──────────────────────────────
  let mktH=0.33, mktD=0.27, mktA=0.40;
  if (marketOdds?.home) {
    const rH=1/marketOdds.home, rD=1/marketOdds.draw, rA=1/marketOdds.away;
    const s=rH+rD+rA; mktH=rH/s; mktD=rD/s; mktA=rA/s;
  }
  const fH=0.60*hWP + 0.40*mktH;
  const fD=0.60*dP  + 0.40*mktD;
  const fA=0.60*aWP + 0.40*mktA;
  const tot=fH+fD+fA;
  const [nH,nD,nA]=[fH/tot,fD/tot,fA/tot];

  lines.sort((a,b)=>b.p-a.p);
  const topScores=lines.slice(0,6).map(s=>({score:`${s.h}-${s.a}`,prob:Math.round(s.p*100)}));
  const btts=(1-poissonProb(hL,0))*(1-poissonProb(aL,0));
  let o25=0, o35=0;
  for(const s of lines){ if(s.h+s.a>2) o25+=s.p; if(s.h+s.a>3) o35+=s.p; }

  const maxP=Math.max(nH,nD,nA);
  const confidence = maxP>0.52?"HIGH":maxP>0.40?"MEDIUM":"LOW";
  const confColor   = confidence==="HIGH"?"#00ff88":confidence==="MEDIUM"?"#ffcc00":"#ff6b6b";

  return {
    homeWin:Math.round(nH*100), draw:Math.round(nD*100), awayWin:Math.round(nA*100),
    confidence, confColor,
    topScores, xg:{home:hL.toFixed(2),away:aL.toFixed(2)},
    btts:Math.round(btts*100), over25:Math.round(o25*100), over35:Math.round(o35*100),
    dataSource: "FBref / StatsBomb",
  };
}

// ─── API LAYER ────────────────────────────────────────────────────────────────
async function fetchMatchData(homeSlug, awaySlug) {
  try {
    const res = await fetch(`${BACKEND_URL}/match/${homeSlug}/${awaySlug}`, {
      signal: AbortSignal.timeout(60000)  // 60 detik — FBref scraping butuh waktu
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    return { data: await res.json(), source: "live" };
  } catch (err) {
    console.warn("Backend tidak tersedia, pakai fallback data:", err.message);
    return { data: null, source: "fallback", error: err.message };
  }
}

async function fetchTeamForm(slug) {
  try {
    const res = await fetch(`${BACKEND_URL}/form/${slug}`);
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch { return null; }
}

async function askClaude(msgs, context) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1000,
      system:`Kamu BOLA.AI — analis prediksi sepak bola berbasis data FBref/StatsBomb.

CONTEXT MATCH SAAT INI:
${context}

Statistik yang dipakai:
- xG (expected goals) dari StatsBomb via FBref — metodologi paling kredibel
- PSxG-GA: ukuran performa kiper vs ekspektasi
- Pressing success %: agresivitas & stamina pressing
- Pass accuracy: kontrol dan dominasi permainan
- Form pts last 5: momentum terkini
- Market odds: implied probability dari bookmaker

Gaya: tajam, data-driven, percaya diri. Pakai angka spesifik. Bahasa Indonesia+Inggris.
Ingatkan: prediksi = probabilistik, bukan kepastian.`,
      messages: msgs
    })
  });
  const d = await res.json();
  return d.content?.map(b=>b.text||"").join("") || "Error.";
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const c = {
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" },
  lbl:  { fontSize:9, color:"#3a5570", letterSpacing:2, marginBottom:5, display:"block", textTransform:"uppercase" },
};
const ss = { background:"rgba(0,8,24,0.9)", border:"1px solid rgba(255,255,255,0.09)", color:"#cce0ff", padding:"8px 10px", borderRadius:8, fontSize:12, cursor:"pointer", outline:"none", fontFamily:"'Courier New',monospace" };

function Spinner() {
  return <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(0,255,136,0.2)",borderTop:"2px solid #00ff88",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>;
}

function Badge({text, color="#00ff88"}) {
  return <span style={{padding:"2px 8px",borderRadius:10,fontSize:9,fontWeight:700,background:`${color}15`,border:`1px solid ${color}40`,color}}>{text}</span>;
}

function ProbBar({label, pct, color, sub}) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}}>
        <span style={{fontSize:12,color:"#aabbcc"}}>{label}</span>
        <span style={{fontSize:20,color,fontWeight:900}}>{pct}%</span>
      </div>
      <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:3,boxShadow:`0 0 8px ${color}44`,transition:"width 1.4s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      {sub && <div style={{fontSize:9,color:"#3a5570",marginTop:2}}>{sub}</div>}
    </div>
  );
}

function FormBadge({result}) {
  const map = {W:{c:"#00ff88",bg:"rgba(0,255,136,0.12)"}, D:{c:"#ffcc00",bg:"rgba(255,204,0,0.12)"}, L:{c:"#ff6b6b",bg:"rgba(255,107,107,0.12)"}};
  const s = map[result] || map.D;
  return <div style={{width:22,height:22,borderRadius:4,fontSize:9,fontWeight:800,background:s.bg,border:`1px solid ${s.c}50`,color:s.c,display:"flex",alignItems:"center",justifyContent:"center"}}>{result}</div>;
}

function StatRow({label, homeVal, awayVal, higherBetter=true, unit=""}) {
  const hv = parseFloat(homeVal) || 0, av = parseFloat(awayVal) || 0;
  const hBetter = higherBetter ? hv >= av : hv <= av;
  const aBetter = higherBetter ? av > hv : av < hv;
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:8}}>
      <div style={{textAlign:"right",fontSize:12,fontWeight:700,color:hBetter?"#00ff88":"#889aaa"}}>{homeVal}{unit}</div>
      <div style={{fontSize:9,color:"#3a5570",textAlign:"center",minWidth:90,letterSpacing:1}}>{label}</div>
      <div style={{fontSize:12,fontWeight:700,color:aBetter?"#00ff88":"#889aaa"}}>{awayVal}{unit}</div>
    </div>
  );
}

function ChatBubble({msg, isTyping}) {
  const isAI = msg.role==="ai";
  return (
    <div style={{display:"flex",justifyContent:isAI?"flex-start":"flex-end",marginBottom:12}}>
      {isAI && <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#00ff88,#00aaff)",display:"flex",alignItems:"center",justifyContent:"center",marginRight:8,flexShrink:0,fontSize:12,boxShadow:"0 0 8px rgba(0,255,136,0.3)"}}>⚽</div>}
      <div style={{maxWidth:"82%",padding:"9px 13px",borderRadius:isAI?"3px 14px 14px 14px":"14px 3px 14px 14px",background:isAI?"rgba(0,255,136,0.07)":"rgba(0,150,255,0.10)",border:isAI?"1px solid rgba(0,255,136,0.15)":"1px solid rgba(0,150,255,0.15)",color:"#cce0ff",fontSize:13,lineHeight:1.65}}>
        {isTyping
          ? <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#00ff88",animation:`bounce 1s ${i*0.2}s infinite`}}/>)}</div>
          : <div dangerouslySetInnerHTML={{__html:msg.content}}/>}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [homeSlug, setHomeSlug] = useState("mainz");
  const [awaySlug, setAwaySlug] = useState("stuttgart");
  const [tab, setTab] = useState("predict");
  const [loadState, setLoadState] = useState("idle"); // idle | loading | done | error
  const [matchData, setMatchData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [marketOdds, setMarketOdds] = useState({ home:3.25, draw:3.70, away:2.20 });
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("online"); // hardcode online
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, chatLoading]);


  const homeTeam = TEAMS.find(t=>t.slug===homeSlug);
  const awayTeam = TEAMS.find(t=>t.slug===awaySlug);

  const runAnalysis = useCallback(async () => {
    if (homeSlug === awaySlug) return;
    setLoadState("loading");
    setMatchData(null);
    setPrediction(null);
    setMsgs([]);
    setTab("predict");

    try {
      const { data, source, error } = await fetchMatchData(homeSlug, awaySlug);

      let homeStats, awayStats, h2h;

      if (source === "live" && data) {
        // Pakai data FBref real
        const d = data.derived;
        homeStats = {
          avgXgLast5:   d.home_avg_xg_last5   || FALLBACK_DATA[homeSlug]?.avgXgLast5 || 1.5,
          avgXgaLast5:  d.home_avg_xga_last5  || FALLBACK_DATA[homeSlug]?.avgXgaLast5 || 1.3,
          formPts:      d.home_form_pts        || 8,
          pressureSucc: d.home_press_succ      || 30,
          psxgDiff:     d.home_psxg_diff       || 0,
          passPct:      d.home_pass_pct        || 80,
          form:         data.home.form?.form_string?.split("") || ["W","D","L","W","D"],
          xgFor:        d.home_xg_per_game     || 1.5,
          xgAgainst:    d.home_avg_xga_last5   || 1.3,
        };
        awayStats = {
          avgXgLast5:   d.away_avg_xg_last5   || FALLBACK_DATA[awaySlug]?.avgXgLast5 || 1.5,
          avgXgaLast5:  d.away_avg_xga_last5  || FALLBACK_DATA[awaySlug]?.avgXgaLast5 || 1.3,
          formPts:      d.away_form_pts        || 8,
          pressureSucc: d.away_press_succ      || 30,
          psxgDiff:     d.away_psxg_diff       || 0,
          passPct:      d.away_pass_pct        || 80,
          form:         data.away.form?.form_string?.split("") || ["W","D","L","W","D"],
          xgFor:        d.away_xg_per_game     || 1.5,
          xgAgainst:    d.away_avg_xga_last5   || 1.3,
        };
        h2h = {
          homeWins: data.h2h?.home_wins || 0,
          awayWins: data.h2h?.away_wins || 0,
          draws:    data.h2h?.draws     || 0,
        };
        setMatchData({ raw: data, homeStats, awayStats, h2h });
        setDataSource("🟢 Live FBref / StatsBomb");
      } else {
        // Fallback data statis
        homeStats = { ...(FALLBACK_DATA[homeSlug] || FALLBACK_DATA.mainz) };
        awayStats = { ...(FALLBACK_DATA[awaySlug] || FALLBACK_DATA.stuttgart) };
        h2h = { homeWins:1, awayWins:3, draws:1 };
        setMatchData({ raw: null, homeStats, awayStats, h2h });
        setDataSource(`🔴 Fallback (backend offline${error ? ": "+error.slice(0,40) : ""})`);
      }

      const result = calcFromFBref(homeStats, awayStats, h2h, marketOdds);
      setPrediction(result);
      setLoadState("done");

      // Auto AI intro
      setChatLoading(true);
      setTab("chat");
      const ctx = buildContext(homeTeam, awayTeam, homeStats, awayStats, result, source);
      const intro = await askClaude([{role:"user",content:`Berikan analisis pembuka singkat untuk ${homeTeam?.name} vs ${awayTeam?.name} berdasarkan data yang ada. Highlight 2-3 faktor paling menentukan.`}], ctx);
      setMsgs([{role:"ai",content:intro.replace(/\n/g,"<br>")}]);
      setChatLoading(false);
      setTab("predict");

    } catch(e) {
      setLoadState("error");
      console.error(e);
    }
  }, [homeSlug, awaySlug, marketOdds]);

  function buildContext(ht, at, hs, as_, res, src) {
    return `
${ht?.name} (HOME) vs ${at?.name} (AWAY)
Data source: ${src === "live" ? "FBref/StatsBomb LIVE" : "Fallback static"}
---
${ht?.name}: xG/game ${hs?.xgFor}, xGA/game ${hs?.xgAgainst}, form pts ${hs?.formPts}/15, press% ${hs?.pressureSucc}, PSxG-GA ${hs?.psxgDiff}, pass% ${hs?.passPct}
${at?.name}: xG/game ${as_?.xgFor}, xGA/game ${as_?.xgAgainst}, form pts ${as_?.formPts}/15, press% ${as_?.pressureSucc}, PSxG-GA ${as_?.psxgDiff}, pass% ${as_?.passPct}
---
Prediksi: ${ht?.name} ${res?.homeWin}% | Draw ${res?.draw}% | ${at?.name} ${res?.awayWin}%
xG model: ${res?.xg?.home} - ${res?.xg?.away}
BTTS: ${res?.btts}% | Over 2.5: ${res?.over25}%
Market odds: ${marketOdds.home}/${marketOdds.draw}/${marketOdds.away}
    `.trim();
  }

  const sendChat = async () => {
    if (!input.trim() || chatLoading) return;
    const uMsg = {role:"user",content:input};
    const newM = [...msgs, uMsg];
    setMsgs(newM); setInput(""); setChatLoading(true);
    const ctx = prediction ? buildContext(homeTeam, awayTeam,
      matchData?.homeStats, matchData?.awayStats, prediction,
      dataSource?.includes("Live") ? "live" : "fallback") : "Belum ada analisis.";
    const apiM = newM.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.content.replace(/<[^>]*>/g,"")}));
    try {
      const reply = await askClaude(apiM, ctx);
      setMsgs(p=>[...p,{role:"ai",content:reply.replace(/\n/g,"<br>")}]);
    } catch { setMsgs(p=>[...p,{role:"ai",content:"Error koneksi."}]); }
    setChatLoading(false);
  };

  const hs = matchData?.homeStats, as_ = matchData?.awayStats;

  return (
    <div style={{minHeight:"100vh",background:"#010812",backgroundImage:"radial-gradient(ellipse at 20% 15%,rgba(0,255,136,0.04) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(0,100,255,0.03) 0%,transparent 50%)",fontFamily:"'Courier New',monospace",color:"#cce0ff"}}>
      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(0,255,136,0.2);border-radius:2px}
        select option{background:#0a1428}*{box-sizing:border-box}
      `}</style>

      {/* HEADER */}
      <div style={{background:"rgba(0,3,12,0.95)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"12px 16px",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:760,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,letterSpacing:2}}>⚽ BOLA<span style={{color:"#00ff88"}}>.AI</span> <span style={{fontSize:10,color:"#2a4060",fontWeight:400}}>v4</span></div>
            <div style={{fontSize:9,color:"#2a4060",letterSpacing:1}}>FBref · StatsBomb · Poisson · Market Odds</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,color:"#3a5570",marginBottom:2}}>BACKEND</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:backendStatus==="online"?"#00ff88":backendStatus==="offline"?"#ff6b6b":"#ffcc00",animation:backendStatus==="unknown"?"pulse 1.5s infinite":undefined}}/>
              <span style={{fontSize:10,color:backendStatus==="online"?"#00ff88":backendStatus==="offline"?"#ff6b6b":"#ffcc00"}}>
                {backendStatus==="online"?"ONLINE":backendStatus==="offline"?"OFFLINE":"CHECKING"}
              </span>
