import { useState, useEffect, useRef, useCallback } from "react";

const BACKEND_URL = "https://web-production-c006e.up.railway.app";

const TEAMS = [
  { slug:"mainz", name:"FSV Mainz 05", league:"Bundesliga" },
  { slug:"stuttgart", name:"VfB Stuttgart", league:"Bundesliga" },
  { slug:"bayern", name:"Bayern Munich", league:"Bundesliga" },
  { slug:"dortmund", name:"Borussia Dortmund", league:"Bundesliga" },
  { slug:"leverkusen", name:"Bayer Leverkusen", league:"Bundesliga" },
  { slug:"leipzig", name:"RB Leipzig", league:"Bundesliga" },
  { slug:"frankfurt", name:"Eintracht Frankfurt", league:"Bundesliga" },
  { slug:"freiburg", name:"SC Freiburg", league:"Bundesliga" },
  { slug:"manchester-city", name:"Manchester City", league:"Premier League" },
  { slug:"arsenal", name:"Arsenal", league:"Premier League" },
  { slug:"liverpool", name:"Liverpool", league:"Premier League" },
  { slug:"chelsea", name:"Chelsea", league:"Premier League" },
  { slug:"tottenham", name:"Tottenham", league:"Premier League" },
  { slug:"manchester-united", name:"Man United", league:"Premier League" },
  { slug:"newcastle", name:"Newcastle", league:"Premier League" },
  { slug:"real-madrid", name:"Real Madrid", league:"La Liga" },
  { slug:"barcelona", name:"Barcelona", league:"La Liga" },
  { slug:"atletico", name:"Atletico Madrid", league:"La Liga" },
  { slug:"inter", name:"Inter Milan", league:"Serie A" },
  { slug:"milan", name:"AC Milan", league:"Serie A" },
  { slug:"juventus", name:"Juventus", league:"Serie A" },
  { slug:"napoli", name:"Napoli", league:"Serie A" },
  { slug:"psg", name:"PSG", league:"Ligue 1" },
];

const FALLBACK = {
  mainz: { xgFor:1.21, xgAgainst:1.67, formPts:8, avgXgLast5:1.18, avgXgaLast5:1.42, pressureSucc:29.1, psxgDiff:-1.2, passPct:79.4, form:["D","W","D","D","W"] },
  stuttgart: { xgFor:2.08, xgAgainst:1.25, formPts:13, avgXgLast5:2.31, avgXgaLast5:0.94, pressureSucc:38.7, psxgDiff:2.8, passPct:84.2, form:["W","W","W","D","W"] },
};
const DEF = { xgFor:1.5, xgAgainst:1.3, formPts:8, avgXgLast5:1.5, avgXgaLast5:1.3, pressureSucc:30, psxgDiff:0, passPct:80, form:["W","D","L","W","D"] };

function poisson(lam, k) {
  if (lam <= 0) return k === 0 ? 1 : 0;
  let r = Math.exp(-lam) * Math.pow(lam, k), f = 1;
  for (let i = 1; i <= k; i++) f *= i;
  return r / f;
}

function predict(h, a, h2h, odds) {
  let hL = (h.avgXgLast5 + a.avgXgaLast5) / 2 * 1.10;
  let aL = (a.avgXgLast5 + h.avgXgaLast5) / 2;
  const ff = 1 + ((h.formPts - a.formPts) / 15) * 0.15;
  hL *= ff; aL /= ff;
  hL *= (1 - Math.max(-0.15, Math.min(0.15, (a.psxgDiff||0)*0.02)));
  aL *= (1 - Math.max(-0.15, Math.min(0.15, (h.psxgDiff||0)*0.02)));
  const pf = 1 + ((h.pressureSucc||30)/100 - (a.pressureSucc||30)/100) * 0.20;
  hL *= pf; aL /= pf;
  hL = Math.max(0.3, Math.min(hL, 5.5));
  aL = Math.max(0.3, Math.min(aL, 5.5));
  let hW=0, d=0, aW=0, lines=[];
  for (let i=0; i<=7; i++) for (let j=0; j<=7; j++) {
    const p = poisson(hL,i)*poisson(aL,j);
    lines.push({h:i,a:j,p});
    if(i>j) hW+=p; else if(i===j) d+=p; else aW+=p;
  }
  let mH=0.33,mD=0.27,mA=0.40;
  if(odds?.home){ const rH=1/odds.home,rD=1/odds.draw,rA=1/odds.away,s=rH+rD+rA; mH=rH/s;mD=rD/s;mA=rA/s; }
  const fH=0.6*hW+0.4*mH, fD=0.6*d+0.4*mD, fA=0.6*aW+0.4*mA, tot=fH+fD+fA;
  const nH=fH/tot, nD=fD/tot, nA=fA/tot;
  lines.sort((a,b)=>b.p-a.p);
  let o25=0,o35=0,btts=(1-poisson(hL,0))*(1-poisson(aL,0));
  for(const s of lines){ if(s.h+s.a>2) o25+=s.p; if(s.h+s.a>3) o35+=s.p; }
  const mx=Math.max(nH,nD,nA);
  return {
    homeWin:Math.round(nH*100), draw:Math.round(nD*100), awayWin:Math.round(nA*100),
    confidence: mx>0.52?"HIGH":mx>0.40?"MEDIUM":"LOW",
    confColor: mx>0.52?"#00ff88":mx>0.40?"#ffcc00":"#ff6b6b",
    topScores: lines.slice(0,6).map(s=>({score:`${s.h}-${s.a}`,prob:Math.round(s.p*100)})),
    xg:{home:hL.toFixed(2),away:aL.toFixed(2)},
    btts:Math.round(btts*100), over25:Math.round(o25*100), over35:Math.round(o35*100),
  };
}

const bg = "#010812";
const card = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" };
const lbl = { fontSize:9, color:"#3a5570", letterSpacing:2, marginBottom:5, display:"block", textTransform:"uppercase" };
const inp = { background:"rgba(0,8,24,0.9)", border:"1px solid rgba(255,255,255,0.09)", color:"#cce0ff", padding:"8px 10px", borderRadius:8, fontSize:12, outline:"none", fontFamily:"monospace", width:"100%" };

function Bar({label, pct, color, sub}) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:12,color:"#aabbcc"}}>{label}</span>
        <span style={{fontSize:20,color,fontWeight:900}}>{pct}%</span>
      </div>
      <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 1.2s"}}/>
      </div>
      {sub && <div style={{fontSize:9,color:"#3a5570",marginTop:2}}>{sub}</div>}
    </div>
  );
}

function FormDot({r}) {
  const map={W:"#00ff88",D:"#ffcc00",L:"#ff6b6b"};
  return <div style={{width:22,height:22,borderRadius:4,fontSize:9,fontWeight:800,background:`${map[r]||"#888"}22`,border:`1px solid ${map[r]||"#888"}`,color:map[r]||"#888",display:"flex",alignItems:"center",justifyContent:"center"}}>{r}</div>;
}

export default function App() {
  const [home, setHome] = useState("mainz");
  const [away, setAway] = useState("stuttgart");
  const [odds, setOdds] = useState({home:3.25,draw:3.70,away:2.20});
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [src, setSrc] = useState("");
  const [hStats, setHStats] = useState(null);
  const [aStats, setAStats] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const [tab, setTab] = useState("predict");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const homeTeam = TEAMS.find(t=>t.slug===home);
  const awayTeam = TEAMS.find(t=>t.slug===away);

  const run = useCallback(async () => {
    if (home===away) return;
    setState("loading"); setResult(null); setMsgs([]); setTab("predict");
    try {
      let hs, as_, h2h={homeWins:1,awayWins:1,draws:1};
      try {
        const res = await fetch(`${BACKEND_URL}/match/${home}/${away}`,{signal:AbortSignal.timeout(60000)});
        if (res.ok) {
          const data = await res.json();
          const d = data.derived;
          hs = { avgXgLast5:d.home_avg_xg_last5||1.5, avgXgaLast5:d.home_avg_xga_last5||1.3, formPts:d.home_form_pts||8, pressureSucc:d.home_press_succ||30, psxgDiff:d.home_psxg_diff||0, passPct:d.home_pass_pct||80, xgFor:d.home_xg_per_game||1.5, xgAgainst:d.home_avg_xga_last5||1.3, form:data.home?.form?.form_string?.split("")||["W","D","L","W","D"] };
          as_ = { avgXgLast5:d.away_avg_xg_last5||1.5, avgXgaLast5:d.away_avg_xga_last5||1.3, formPts:d.away_form_pts||8, pressureSucc:d.away_press_succ||30, psxgDiff:d.away_psxg_diff||0, passPct:d.away_pass_pct||80, xgFor:d.away_xg_per_game||1.5, xgAgainst:d.away_avg_xga_last5||1.3, form:data.away?.form?.form_string?.split("")||["W","D","L","W","D"] };
          h2h = { homeWins:data.h2h?.home_wins||0, awayWins:data.h2h?.away_wins||0, draws:data.h2h?.draws||0 };
          setSrc("🟢 Live — FBref / StatsBomb");
        } else throw new Error();
      } catch {
        hs = {...(FALLBACK[home]||DEF)};
        as_ = {...(FALLBACK[away]||DEF)};
        setSrc("🔴 Fallback (offline)");
      }
      setHStats(hs); setAStats(as_);
      const res = predict(hs, as_, h2h, odds);
      setResult(res); setState("done");

      // AI intro
      setChatLoad(true); setTab("chat");
      try {
        const ctx = `${homeTeam?.name} vs ${awayTeam?.name} | xG: ${res.xg.home}-${res.xg.away} | Win%: ${res.homeWin}/${res.draw}/${res.awayWin} | BTTS:${res.btts}% O2.5:${res.over25}%`;
        const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:`Kamu BOLA.AI, analis sepak bola data-driven. Context: ${ctx}. Jawab singkat, pakai angka, Bahasa Indonesia.`,messages:[{role:"user",content:`Analisis singkat ${homeTeam?.name} vs ${awayTeam?.name}, highlight 2-3 faktor utama.`}]})});
        const d = await r.json();
        const txt = d.content?.map(b=>b.text||"").join("")||"";
        setMsgs([{role:"ai",content:txt.replace(/\n/g,"<br>")}]);
      } catch { setMsgs([{role:"ai",content:"Analisis siap. Tanya apa saja tentang pertandingan ini!"}]); }
      setChatLoad(false); setTab("predict");
    } catch(e) { setState("error"); }
  }, [home, away, odds]);

  const sendChat = async () => {
    if (!input.trim()||chatLoad) return;
    const nm = [...msgs,{role:"user",content:input}];
    setMsgs(nm); setInput(""); setChatLoad(true);
    try {
      const apiM = nm.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.content.replace(/<[^>]*>/g,"")}));
      const ctx = result ? `${homeTeam?.name} vs ${awayTeam?.name} | ${result.homeWin}/${result.draw}/${result.awayWin}% | xG ${result.xg.home}-${result.xg.away}` : "";
      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`BOLA.AI analis. Context: ${ctx}`,messages:apiM})});
      const d = await r.json();
      setMsgs(p=>[...p,{role:"ai",content:(d.content?.map(b=>b.text||"").join("")||"Error").replace(/\n/g,"<br>")}]);
    } catch { setMsgs(p=>[...p,{role:"ai",content:"Error koneksi."}]); }
    setChatLoad(false);
  };

  const leagues = [...new Set(TEAMS.map(t=>t.league))];

  return (
    <div style={{minHeight:"100vh",background:bg,fontFamily:"monospace",color:"#cce0ff"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(0,255,136,0.2)} *{box-sizing:border-box} select option{background:#0a1428}`}</style>

      {/* HEADER */}
      <div style={{background:"rgba(0,3,12,0.95)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"12px 16px",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:760,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,letterSpacing:2}}>⚽ BOLA<span style={{color:"#00ff88"}}>.AI</span></div>
            <div style={{fontSize:9,color:"#2a4060"}}>FBref · StatsBomb · Poisson · Market Odds</div>
          </div>
          <div style={{textAlign:"right",fontSize:9}}>
            <div style={{color:"#3a5570",marginBottom:2}}>BACKEND</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#00ff88"}}/>
              <span style={{color:"#00ff88"}}>ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:760,margin:"0 auto",padding:"12px 12px 24px",display:"flex",flexDirection:"column",gap:10}}>

        {/* SELECTOR */}
        <div style={card}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 30px 1fr",gap:10,alignItems:"end",marginBottom:12}}>
            <div>
              <span style={lbl}>🏠 Home</span>
              <select value={home} onChange={e=>setHome(e.target.value)} style={inp}>
                {leagues.map(lg=><optgroup key={lg} label={lg}>{TEAMS.filter(t=>t.league===lg).map(t=><option key={t.slug} value={t.slug}>{t.name}</option>)}</optgroup>)}
              </select>
            </div>
            <div style={{textAlign:"center",color:"#2a4060",fontWeight:700,paddingBottom:8}}>VS</div>
            <div>
              <span style={lbl}>✈️ Away</span>
              <select value={away} onChange={e=>setAway(e.target.value)} style={inp}>
                {leagues.map(lg=><optgroup key={lg} label={lg}>{TEAMS.filter(t=>t.league===lg).map(t=><option key={t.slug} value={t.slug}>{t.name}</option>)}</optgroup>)}
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[["home","🏠 Odds Home"],["draw","🤝 Draw"],["away","✈️ Away"]].map(([k,lb])=>(
              <div key={k}>
                <span style={lbl}>{lb}</span>
                <input type="number" step="0.05" min="1" value={odds[k]} onChange={e=>setOdds(p=>({...p,[k]:parseFloat(e.target.value)||1}))} style={inp}/>
              </div>
            ))}
          </div>
          <button onClick={run} disabled={home===away||state==="loading"} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:home===away||state==="loading"?"rgba(255,255,255,0.04)":"linear-gradient(135deg,#00ff88,#00cc88)",color:home===away||state==="loading"?"#444":"#001a0d",fontWeight:900,fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"monospace"}}>
            {state==="loading" ? "⏳ FETCHING DATA..." : "🔮 ANALISIS"}
          </button>
          {src && <div style={{marginTop:8,fontSize:10,textAlign:"center",color:src.includes("Live")?"#00ff88":"#ff9944"}}>{src}</div>}
        </div>

        {/* TABS */}
        {state==="done" && result && (
          <>
            <div style={{display:"flex",gap:6}}>
              {[["predict","🎯 Prediksi"],["stats","📊 Stats"],["chat","💬 Chat"]].map(([t,l])=>(
                <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:8,borderRadius:8,border:"none",background:tab===t?"rgba(0,255,136,0.10)":"rgba(255,255,255,0.03)",color:tab===t?"#00ff88":"#445566",fontSize:11,cursor:"pointer",fontFamily:"monospace",borderBottom:tab===t?"2px solid #00ff88":"2px solid transparent"}}>{l}</button>
              ))}
            </div>

            {tab==="predict" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{...card,textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#3a5570",letterSpacing:3,marginBottom:6}}>PREDIKSI — FBref + Market</div>
                  <div style={{fontSize:9,color:"#3a5570",marginBottom:14}}>{homeTeam?.name} vs {awayTeam?.name}</div>
                  <Bar label={`🏠 ${homeTeam?.name}`} pct={result.homeWin} color="#4488ff" sub={`Odds: ${odds.home}`}/>
                  <Bar label="🤝 Draw" pct={result.draw} color="#ffcc00" sub={`Odds: ${odds.draw}`}/>
                  <Bar label={`✈️ ${awayTeam?.name}`} pct={result.awayWin} color="#00ff88" sub={`Odds: ${odds.away}`}/>
                  <div style={{marginTop:10,display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{padding:"2px 8px",borderRadius:10,fontSize:9,background:`${result.confColor}22`,border:`1px solid ${result.confColor}`,color:result.confColor}}>Confidence: {result.confidence}</span>
                    <span style={{padding:"2px 8px",borderRadius:10,fontSize:9,background:"rgba(170,187,204,0.1)",border:"1px solid rgba(170,187,204,0.3)",color:"#aabbcc"}}>xG {result.xg.home} - {result.xg.away}</span>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[["BTTS",`${result.btts}%`,"#ffcc00"],["Over 2.5",`${result.over25}%`,"#ff9944"],["Over 3.5",`${result.over35}%`,"#ff6b6b"]].map(([l,v,c])=>(
                    <div key={l} style={{...card,textAlign:"center"}}>
                      <div style={{fontSize:8,color:"#3a5570"}}>{l}</div>
                      <div style={{fontSize:16,color:c,fontWeight:800}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={card}>
                  <span style={lbl}>Probabilitas Skor</span>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {result.topScores.map(({score,prob},i)=>(
                      <div key={score} style={{padding:"4px 12px",borderRadius:20,fontSize:12,background:i===0?"rgba(0,255,136,0.10)":"rgba(255,255,255,0.04)",border:`1px solid ${i===0?"rgba(0,255,136,0.3)":"rgba(255,255,255,0.08)"}`,color:i===0?"#00ff88":"#889aaa",fontWeight:i===0?700:400}}>
                        {score} <span style={{fontSize:10,opacity:0.6}}>{prob}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab==="stats" && hStats && aStats && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={card}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",marginBottom:12,textAlign:"center"}}>
                    <div style={{color:"#4488ff",fontSize:12,fontWeight:700}}>{homeTeam?.name}</div>
                    <div style={{fontSize:9,color:"#3a5570",padding:"0 8px"}}>STATS</div>
                    <div style={{color:"#00ff88",fontSize:12,fontWeight:700}}>{awayTeam?.name}</div>
                  </div>
                  {[["xG/Game",hStats.avgXgLast5,aStats.avgXgLast5,true],["xGA/Game",hStats.avgXgaLast5,aStats.avgXgaLast5,false],["Form Pts",hStats.formPts,aStats.formPts,true],["Press%",hStats.pressureSucc,aStats.pressureSucc,true],["PSxG-GA",hStats.psxgDiff,aStats.psxgDiff,true],["Pass%",hStats.passPct,aStats.passPct,true]].map(([lb,hv,av,hi])=>{
                    const h=parseFloat(hv)||0, a=parseFloat(av)||0;
                    return (
                      <div key={lb} style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:8}}>
                        <div style={{textAlign:"right",fontSize:12,fontWeight:700,color:hi?h>=a?"#00ff88":"#889aaa":h<=a?"#00ff88":"#889aaa"}}>{typeof hv==="number"?hv.toFixed(1):hv}</div>
                        <div style={{fontSize:9,color:"#3a5570",textAlign:"center",minWidth:80}}>{lb}</div>
                        <div style={{fontSize:12,fontWeight:700,color:hi?a>h?"#00ff88":"#889aaa":a<h?"#00ff88":"#889aaa"}}>{typeof av==="number"?av.toFixed(1):av}</div>
                      </div>
                    );
                  })}
                </div>
                {[{team:homeTeam,form:hStats.form,c:"#4488ff"},{team:awayTeam,form:aStats.form,c:"#00ff88"}].map(({team,form,c})=>(
                  <div key={team?.slug} style={card}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{color:c,fontWeight:700}}>{team?.name}</span>
                      <span style={{fontSize:9,color:"#3a5570"}}>FORM 5 LAGA</span>
                    </div>
                    <div style={{display:"flex",gap:6}}>{(form||[]).map((r,i)=><FormDot key={i} r={r}/>)}</div>
                  </div>
                ))}
              </div>
            )}

            {tab==="chat" && (
              <div style={{...card,display:"flex",flexDirection:"column"}}>
                <div style={{fontSize:9,color:"#2a4060",marginBottom:12}}>💬 CHAT — {homeTeam?.name?.toUpperCase()} VS {awayTeam?.name?.toUpperCase()}</div>
                <div style={{overflowY:"auto",maxHeight:360,marginBottom:10}}>
                  {msgs.length===0&&!chatLoad&&<div style={{textAlign:"center",color:"#2a4060",fontSize:11,marginTop:30}}>Jalankan analisis dulu...</div>}
                  {msgs.map((m,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:m.role==="ai"?"flex-start":"flex-end",marginBottom:12}}>
                      {m.role==="ai"&&<div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#00ff88,#00aaff)",display:"flex",alignItems:"center",justifyContent:"center",marginRight:8,flexShrink:0}}>⚽</div>}
                      <div style={{maxWidth:"82%",padding:"9px 13px",borderRadius:m.role==="ai"?"3px 14px 14px 14px":"14px 3px 14px 14px",background:m.role==="ai"?"rgba(0,255,136,0.07)":"rgba(0,150,255,0.10)",border:m.role==="ai"?"1px solid rgba(0,255,136,0.15)":"1px solid rgba(0,150,255,0.15)",color:"#cce0ff",fontSize:13,lineHeight:1.65}}>
                        <div dangerouslySetInnerHTML={{__html:m.content}}/>
                      </div>
                    </div>
                  ))}
                  {chatLoad&&<div style={{color:"#00ff88",fontSize:12,padding:8}}>⚽ Menganalisis...</div>}
                  <div ref={bottomRef}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Tanya soal xG, form, value bet..." style={{...inp,flex:1}}/>
                  <button onClick={sendChat} disabled={chatLoad||!input.trim()} style={{padding:"9px 14px",borderRadius:8,border:"none",background:"rgba(0,255,136,0.10)",color:"#00ff88",cursor:"pointer",fontSize:15}}>→</button>
                </div>
              </div>
            )}
          </>
        )}

        {state==="idle"&&(
          <div style={{...card,textAlign:"center",padding:32}}>
            <div style={{fontSize:32,marginBottom:12}}>⚽</div>
            <div style={{fontSize:13,color:"#445566",lineHeight:2}}>Pilih dua tim lalu klik <strong style={{color:"#00ff88"}}>ANALISIS</strong><br/>Data langsung dari <strong style={{color:"#cce0ff"}}>FBref / StatsBomb</strong></div>
          </div>
        )}
        {state==="error"&&<div style={{...card,textAlign:"center",padding:24,color:"#ff6b6b"}}>❌ Error. Coba lagi.</div>}
        <div style={{textAlign:"center",fontSize:9,color:"#1a3050"}}>BOLA.AI · FBref/StatsBomb · Prediksi Probabilistik</div>
      </div>
    </div>
  );
}
