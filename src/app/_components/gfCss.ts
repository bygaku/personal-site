/** Works / Home で共有するデザイン体系。各ページが <style> で読み込む。 */
export const GF_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');

.gf-root{
  --bg:#080B11; --panel:#0E131C; --line:#1B2330; --field:rgba(255,255,255,.02);
  --ink:#E6EAF2; --ink-dim:#8894A8; --ink-faint:#5D687B; --hover-line:#2D3B4F;
  --cover-bg:#05070B; --scrim:rgba(6,9,14,.28); --halo:.75; --halo-blur:26px;
  --overlay:rgba(4,6,10,.72); --chip-on:rgba(255,255,255,.03); --kind-ink:#05070B;
  position:relative; min-height:100vh; background:var(--bg); color:var(--ink);
  font-family:'Zen Kaku Gothic New',system-ui,sans-serif; -webkit-font-smoothing:antialiased;
  transition:background .35s ease, color .35s ease;
}
.gf-root.is-light{
  --bg:#EDF0F4; --panel:#FFFFFF; --line:#D3DAE3; --field:rgba(255,255,255,.75);
  --ink:#141A22; --ink-dim:#57647A; --ink-faint:#8593A6; --hover-line:#9FAEC2;
  --cover-bg:#DDE3EA; --scrim:rgba(255,255,255,.14); --halo:.5; --halo-blur:30px;
  --overlay:rgba(225,230,237,.7); --chip-on:rgba(20,40,70,.045); --kind-ink:#FFFFFF;
}

.gf-grid{position:fixed; inset:0; width:100%; height:100%; z-index:0; pointer-events:none;}
.gf-page{position:relative; z-index:1; max-width:1560px; margin:0 auto; padding:56px 24px 96px;}

/* ---- header ---- */
.gf-head-row{display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:14px;}
.gf-eyebrow{font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.28em;
  color:var(--ink-faint); text-transform:uppercase; margin:0;}
.gf-theme{background:transparent; border:1px solid var(--line); border-radius:2px;
  color:var(--ink-dim); padding:7px 13px; cursor:pointer;
  font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.2em;
  transition:color .2s,border-color .2s;}
.gf-theme:hover{color:var(--ink); border-color:var(--hover-line);}
.gf-h1{font-family:'IBM Plex Mono',monospace; font-weight:500; font-size:clamp(40px,7vw,84px);
  letter-spacing:.14em; line-height:1; margin:0 0 22px;}
.gf-lede{font-size:14px; line-height:2; color:var(--ink-dim); margin:0; max-width:52ch;}

/* ---- nav (home) ---- */
.gf-nav{display:flex; gap:18px; align-items:center;}
.gf-nav a{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.2em;
  color:var(--ink-faint); transition:color .2s;}
.gf-nav a:hover{color:var(--ink);}
.gf-nav a.is-here{color:var(--ink);}

/* ---- section (home) ---- */
.gf-section{margin-top:64px; border-top:1px solid var(--line); padding-top:22px;}
.gf-section-head{display:flex; align-items:baseline; justify-content:space-between; gap:16px; margin-bottom:22px;}
.gf-section-title{font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.26em;
  color:var(--ink-faint); margin:0; text-transform:uppercase;}
.gf-more{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.16em;
  color:var(--ink-dim); border-bottom:1px solid transparent; transition:color .2s,border-color .2s;}
.gf-more:hover{color:var(--ink); border-color:var(--hover-line);}

/* ---- alias cards (home) ---- */
.gf-alias-grid{display:grid; grid-template-columns:1fr; gap:14px;}
@media (min-width:700px){.gf-alias-grid{grid-template-columns:repeat(3,1fr); gap:18px;}}
.gf-alias-card{position:relative; border:1px solid var(--line); border-radius:3px;
  padding:22px 20px 20px; background:var(--field); overflow:hidden;
  transition:border-color .25s;}
.gf-alias-card:hover{border-color:var(--accent);}
.gf-alias-card::before{content:""; position:absolute; left:0; top:0; width:3px; height:100%;
  background:var(--accent); opacity:.85;}
.gf-alias-name{font-size:18px; font-weight:700; margin:0 0 4px; color:var(--accent);}
.gf-alias-en{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.18em;
  color:var(--ink-faint); margin:0 0 12px;}
.gf-alias-bio{font-size:13px; line-height:1.95; color:var(--ink-dim); margin:0;}
.gf-alias-link{display:inline-block; margin-top:14px; font-family:'IBM Plex Mono',monospace;
  font-size:10px; letter-spacing:.16em; color:var(--ink-dim); transition:color .2s;}
.gf-alias-link:hover{color:var(--accent);}

/* ---- controls ---- */
.gf-controls{margin:52px 0 34px; border-top:1px solid var(--line); padding-top:22px;
  display:flex; flex-direction:column; gap:14px;}
.gf-chips{display:flex; flex-wrap:wrap; gap:8px;}
.gf-chip{appearance:none; cursor:pointer; background:transparent; color:var(--ink-dim);
  border:1px solid var(--line); border-radius:2px; padding:8px 14px;
  font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em;
  transition:color .2s,border-color .2s,background .2s;}
.gf-chip.is-alias{font-family:'Zen Kaku Gothic New',sans-serif; letter-spacing:.04em; font-size:12px;
  display:inline-flex; align-items:center; gap:8px;}
.gf-chip:hover{color:var(--ink); border-color:var(--hover-line);}
.gf-chip.is-on{color:var(--accent); border-color:var(--accent); background:var(--chip-on);}
.gf-dot{width:6px; height:6px; border-radius:50%; background:var(--accent); display:inline-block;}

.gf-tools{display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-top:4px;}
.gf-search{flex:1 1 240px; min-width:0; background:var(--field); color:var(--ink);
  border:1px solid var(--line); border-radius:2px; padding:10px 13px; font-size:13px;
  font-family:inherit; transition:border-color .2s;}
.gf-search::placeholder{color:var(--ink-faint);}
.gf-search:focus{outline:none; border-color:var(--hover-line);}
.gf-sort{background:var(--field); color:var(--ink-dim); border:1px solid var(--line);
  border-radius:2px; padding:10px 12px; font-size:12px; font-family:'IBM Plex Mono',monospace;}
.gf-sort:focus{outline:none; border-color:var(--hover-line);}
.gf-count{font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.18em; color:var(--ink-faint);}

/* ---- grid of cards ---- */
.gf-list{display:grid; grid-template-columns:repeat(2,1fr); gap:14px;}
@media (min-width:600px){.gf-list{grid-template-columns:repeat(3,1fr); gap:18px;}}
@media (min-width:1000px){.gf-list{grid-template-columns:repeat(4,1fr); gap:22px;}}
@media (min-width:1400px){.gf-list{grid-template-columns:repeat(5,1fr);}}

.gf-card{appearance:none; background:none; border:0; padding:0; margin:0; cursor:pointer;
  text-align:left; color:inherit; font:inherit; display:block;}
.gf-card:focus-visible{outline:2px solid var(--accent); outline-offset:6px;}

.gf-card-frame{position:relative;}
.gf-halo{position:absolute; inset:6%; width:88%; height:88%; object-fit:cover;
  filter:blur(var(--halo-blur)) saturate(1.5); opacity:0; transform:scale(1);
  transition:opacity .35s ease, transform .35s ease; pointer-events:none; z-index:0;}
.gf-card:hover .gf-halo{opacity:var(--halo); transform:scale(1.14);}

.gf-cover{position:relative; aspect-ratio:1/1; overflow:hidden; border-radius:3px;
  background:var(--cover-bg); isolation:isolate;}
.gf-cover-bg{position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  transform:scale(1.35); filter:blur(22px) saturate(1.25) brightness(.85);}
.gf-cover-scrim{position:absolute; inset:0; background:var(--scrim);}
.gf-cover-img{position:relative; width:100%; height:100%; object-fit:contain; display:block;
  transition:transform .45s cubic-bezier(.2,.7,.2,1);}
.gf-card:hover .gf-cover-img{transform:scale(1.07);}

.gf-kind{position:absolute; left:8px; top:8px; z-index:2;
  font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.16em;
  padding:4px 7px; border-radius:2px; color:var(--kind-ink); background:var(--accent);
  opacity:0; transform:translateY(-3px); transition:opacity .28s, transform .28s;}
.gf-card:hover .gf-kind{opacity:.94; transform:translateY(0);}
.gf-kind.is-static{position:static; opacity:1; transform:none; display:inline-block; margin-bottom:14px;}

.gf-card-text{padding:12px 2px 0;}
.gf-card-title{font-size:14px; font-weight:500; margin:0 0 5px; line-height:1.45;}
.gf-card-sub{font-size:12px; color:var(--accent); margin:0 0 4px; min-height:1em;}
.gf-card-meta{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.06em;
  color:var(--ink-faint); margin:0; line-height:1.6;}

/* ---- empty / footer ---- */
.gf-empty{padding:80px 0; text-align:center; color:var(--ink-dim); font-size:14px;}
.gf-reset{margin-top:16px; background:none; border:1px solid var(--line); color:var(--ink);
  padding:9px 18px; border-radius:2px; cursor:pointer; font:inherit; font-size:13px;}
.gf-reset:hover{border-color:var(--hover-line);}
.gf-foot{margin-top:72px; padding-top:20px; border-top:1px solid var(--line);
  font-size:11px; color:var(--ink-faint); line-height:1.9;}

/* ---- detail ---- */
.gf-overlay{position:fixed; inset:0; z-index:40; display:flex; align-items:center; justify-content:center;
  padding:20px; background:var(--overlay); backdrop-filter:blur(10px);
  animation:gf-fade .22s ease both;}
.gf-panel{position:relative; width:min(1000px,100%); max-height:88vh; overflow-y:auto;
  background:var(--panel); border:1px solid var(--line); border-radius:4px;
  animation:gf-pop .34s cubic-bezier(.16,.9,.3,1) both;}
@keyframes gf-fade{from{opacity:0}to{opacity:1}}
@keyframes gf-pop{from{opacity:0; transform:scale(.94) translateY(14px)}to{opacity:1; transform:none}}
.gf-close{position:absolute; right:12px; top:12px; z-index:3; width:34px; height:34px;
  background:var(--field); border:1px solid var(--line); border-radius:2px;
  color:var(--ink-dim); cursor:pointer; font-size:13px;}
.gf-close:hover{color:var(--ink); border-color:var(--hover-line);}
.gf-panel-grid{display:grid; grid-template-columns:1fr;}
@media (min-width:820px){.gf-panel-grid{grid-template-columns:380px 1fr;}}
.gf-panel-cover{padding:26px;}
.gf-note{margin:12px 0 0; font-family:'IBM Plex Mono',monospace; font-size:10px;
  letter-spacing:.06em; color:var(--ink-faint);}
.gf-panel-body{padding:26px 30px 34px;}
@media (min-width:820px){.gf-panel-body{padding:34px 34px 34px 6px;}}
.gf-panel-title{font-size:clamp(24px,3.4vw,34px); font-weight:700; margin:0 0 18px; line-height:1.3;}
.gf-panel-lead{font-size:14px; line-height:2.05; color:var(--ink-dim); margin:0 0 26px;}
.gf-spec{margin:0 0 26px; border-top:1px solid var(--line);}
.gf-spec-row{display:grid; grid-template-columns:88px 1fr; gap:12px;
  padding:10px 0; border-bottom:1px solid var(--line);}
.gf-spec dt{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em;
  color:var(--ink-faint); margin:0; padding-top:2px;}
.gf-spec dd{margin:0; font-size:13px; color:var(--ink);}
.gf-links{display:flex; flex-wrap:wrap; gap:8px;}
.gf-link{text-decoration:none; font-size:12px; padding:9px 15px; border-radius:2px;
  border:1px solid var(--line); color:var(--ink-dim); transition:color .2s,border-color .2s;}
.gf-link:hover{color:var(--accent); border-color:var(--accent);}

@media (prefers-reduced-motion:reduce){
  .gf-card,.gf-cover-img,.gf-halo,.gf-kind,.gf-panel,.gf-overlay,.gf-root,.gf-alias-card{transition:none!important; animation:none!important;}
}
`;
