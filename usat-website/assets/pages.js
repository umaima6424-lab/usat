/* ===== MONETISATION: add your own links here (affiliate, sponsor, ad page). Empty = placeholder slot shown ===== */
const MONETIZE={links:[
 /* {label:'Recommended',title:'Best USAT books',text:'Short description',url:'https://your-link'} */
]};

(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const parse=t=>t.trim().split('\n').map(l=>{const p=l.split('|');return{q:p[0].trim(),o:p.slice(1,5).map(s=>s.trim()),a:+p[5],e:(p[6]||'').trim(),t:(p[7]||'').trim()}});
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const lsBest=k=>+store.get('usat-best-'+k)||0;

/* ----- decks ----- */
const DECKS=[
{k:'physics',n:'Physics',d:'Mechanics, waves, optics, electricity, magnetism and modern physics.',q:parse(PHY)},
{k:'chemistry',n:'Chemistry',d:'Atomic structure, bonding, equilibrium, electrochemistry and organic basics.',q:parse(CHE)},
{k:'maths',n:'Mathematics',d:'Algebra, trigonometry, calculus, coordinate geometry, vectors and probability.',q:parse(MAT)},
{k:'cs',n:'Computer Science',d:'Number systems, logic gates, programming, networks, databases and algorithms.',q:parse(CSC)},
{k:'biology',n:'Biology',d:'Cell biology, genetics, human physiology, plant physiology and ecology.',q:parse(BIO)},
{k:'qr',n:'Quantitative Reasoning',d:'Past-paper style practice on the six QR areas: arithmetic, algebra, geometry, equations, statistics and scenario-based maths. Every answer has a worked solution.',q:parse(QRP),topics:true},
{k:'commerce',n:'Commerce (USAT-COM)',d:'Accounting, commerce and economics practice for the commerce category.',q:parse(COMQ),topics:true},
{k:'arts',n:'Arts & Humanities (USAT-A)',d:'General knowledge, Islamiyat and Pakistan Studies for the arts category.',q:parse(ARTQ),topics:true}
];
const SENT=parse(SCQ);
const vocab=VOC.trim().split('\n').map(l=>{const p=l.split('|');return{w:p[0],s:p[1],a:p[2]}});
const PASSQ=PASS.map(p=>({...p,q:p.q.map(x=>parse(x)[0])}));

/* ----- sponsor / monetisation slot ----- */
let spi=0;
function sponsor(){
  const L=MONETIZE.links;
  if(L.length){const l=L[spi++%L.length];return `<a class="sp" href="${esc(l.url)}" target="_blank" rel="sponsored noopener"><small>${esc(l.label||'Sponsored')}</small><div><b>${esc(l.title)}</b><span>${esc(l.text||'')}</span></div><span class="btn sm">Open →</span></a>`}
  return `<div class="sp"><small>Sponsored</small><div><b>Your sponsored link goes here</b><span>Add your affiliate or ad URL in the MONETIZE list at the top of the script.</span></div><span></span></div>`;
}

/* ----- quiz component ----- */
let activeQuiz=null;
function shuffle(arr){const x=arr.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function makeQuiz(root,src,key){
  const mix=it=>{const idx=shuffle(it.o.map((_,n)=>n));return{...it,o:idx.map(n=>it.o[n]),a:idx.indexOf(it.a)}};
  let items=src.map(mix),i=0,ans=Array(items.length).fill(null),fin=false;
  const score=()=>ans.reduce((s,a,n)=>s+(a===items[n].a?1:0),0);
  const reset=list=>{items=list;i=0;ans=Array(items.length).fill(null);fin=false;render()};
  function render(){
    if(fin)return result();
    const it=items[i],a=ans[i],n=items.length,done=ans.filter(x=>x!==null).length;
    root.innerHTML=`<div class="qz"><div class="qz-top"><span>Question <b>${i+1}</b> of ${n}${it.t?` · <em class="tg">${esc(it.t)}</em>`:''}</span><span>Score <b>${score()}</b>/${done}</span></div>
    <div class="bar"><i style="width:${(done/n)*100}%"></i></div>
    <h4 class="qq">${esc(it.q)}</h4>
    <div class="opts">${it.o.map((o,j)=>{let c='';if(a!==null){c=j===it.a?'right':(j===a?'wrong':'dim')}return `<button class="opt ${c}" data-o="${j}" ${a!==null?'disabled':''}><b>${'ABCD'[j]}</b><span>${esc(o)}</span></button>`}).join('')}</div>
    ${a!==null?`<div class="expl"><strong>${a===it.a?'Correct.':'Not quite.'}</strong> ${it.e?esc(it.e):'The right answer is '+esc(it.o[it.a])+'.'}</div>`:'<p class="hint">Tap an answer. On a keyboard press A–D or 1–4.</p>'}
    <div class="qz-nav"><button class="btn ghost sm" data-act="prev" ${i===0?'disabled style="opacity:.35"':''}>← Back</button>
    ${n>5?`<button class="btn ghost sm" data-act="shuf">⇄ Shuffle</button>`:''}
    ${i<n-1?`<button class="btn sm ${a!==null?'nudge':''}" data-act="next">Next →</button>`:`<button class="btn sm ${a!==null?'nudge':''}" data-act="fin">See my score</button>`}</div>
    <div class="dots">${items.map((_,j)=>`<button data-j="${j}" aria-label="Question ${j+1}" class="${j===i?'cur ':''}${ans[j]===null?'':(ans[j]===items[j].a?'ok':'no')}">${j+1}</button>`).join('')}</div></div>`;
  }
  function result(){
    const s=score(),n=items.length,p=Math.round(s/n*100);
    if(key&&p>lsBest(key)){store.set('usat-best-'+key,p);refreshBest()}
    const miss=items.map((it,j)=>({it,j})).filter(x=>ans[x.j]!==x.it.a);
    const msg=p>=80?'Excellent. You are test ready in this area.':p>=60?'Good work. Review the missed questions and try again.':p>=40?'Keep going. Revise the topic, then retry.':'Start with the formulas and syllabus, then attempt again.';
    root.innerHTML=`<div class="qz result"><div class="mono">Your score</div><div class="big">${s}/${n}</div><p>${p}% · ${msg}</p>
    <div class="rbtn"><button class="btn" data-act="again">Try again</button><button class="btn ghost" data-act="shuf2">Shuffle &amp; retry</button></div>
    ${miss.length?`<div class="miss"><div class="mono" style="background:none;border:0;padding:0">Revise these ${miss.length}</div>${miss.map(x=>`<div>${x.j+1}. ${esc(x.it.q)}<br>Answer: <span>${esc(x.it.o[x.it.a])}</span>${x.it.e?`<br><small>${esc(x.it.e)}</small>`:''}${ans[x.j]===null?'<br><small>(not attempted)</small>':''}</div>`).join('')}</div>`:''}
    ${items.length>5?sponsor():''}</div>`;
  }
  const api={
    pick(j){if(!fin&&ans[i]===null&&j<items[i].o.length){ans[i]=j;render();const nb=root.querySelector('[data-act="next"],[data-act="fin"]');nb&&nb.scrollIntoView({block:'nearest',behavior:'smooth'})}},
    next(){if(!fin&&i<items.length-1){i++;render()}},
    prev(){if(!fin&&i>0){i--;render()}}
  };
  root.onclick=e=>{
    const o=e.target.closest('[data-o]'),b=e.target.closest('[data-act]'),d=e.target.closest('[data-j]');
    activeQuiz=api;
    if(o){api.pick(+o.dataset.o);return}
    if(d){i=+d.dataset.j;render();return}
    if(!b)return;const a=b.dataset.act;
    if(a==='next')api.next();else if(a==='prev')api.prev();else if(a==='fin'){fin=true;render()}else if(a==='again')reset(items);else if(a==='shuf'||a==='shuf2')reset(shuffle(items.map(mix)));
  };
  activeQuiz=api;render();
}
document.addEventListener('keydown',e=>{
  if(!activeQuiz||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA/.test(e.target.tagName))return;
  const k=e.key.toLowerCase(),m={'1':0,'2':1,'3':2,'4':3,a:0,b:1,c:2,d:3}[k];
  if(m!==undefined)activeQuiz.pick(m);else if(k==='arrowright'||k==='n')activeQuiz.next();else if(k==='arrowleft'||k==='p')activeQuiz.prev();
});

/* ----- tabs helper ----- */
function tabs(nav,defs,cb,start=0){
  nav.innerHTML=defs.map((d,j)=>`<button class="tab ${j===start?'on':''}" data-t="${j}">${d.label}</button>`).join('');
  nav.onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;$$('.tab',nav).forEach(x=>x.classList.toggle('on',x===b));cb(+b.dataset.t)};
  cb(start);
}


function refreshBest(){}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SYLD=JSON.parse(store.get('usat-syl')||'{}');
document.addEventListener('click',e=>{const b=e.target.closest('[data-syl] [data-k]');if(!b)return;const k=b.dataset.k;SYLD[k]=!SYLD[k];b.classList.toggle('on',!!SYLD[k]);b.setAttribute('aria-pressed',!!SYLD[k]);store.set('usat-syl',JSON.stringify(SYLD))});
$$('[data-syl] [data-k]').forEach(b=>{if(SYLD[b.dataset.k]){b.classList.add('on');b.setAttribute('aria-pressed','true')}});
$$('[data-deck]').forEach(el=>{
  const d=DECKS.find(x=>x.k===el.dataset.deck);if(!d)return;
  el.innerHTML='<div class="topics"></div><div class="qroot"></div>';
  const tp=$('.topics',el),root=$('.qroot',el);
  if(d.topics){
    const names=[...new Set(d.q.map(x=>x.t))];
    tp.innerHTML='<span class="mono">Practise by topic</span><div class="chips"><button class="chip on" data-tp="">All '+d.q.length+'</button>'+names.map(n=>'<button class="chip" data-tp="'+esc(n)+'">'+esc(n)+' · '+d.q.filter(x=>x.t===n).length+'</button>').join('')+'</div>';
    tp.onclick=e=>{const b=e.target.closest('[data-tp]');if(!b)return;$$('.chip',tp).forEach(c=>c.classList.toggle('on',c===b));const t=b.dataset.tp;makeQuiz(root,t?d.q.filter(x=>x.t===t):d.q,t?null:d.k)};
  }
  makeQuiz(root,d.q,d.k);
});
$$('[data-sentence]').forEach(el=>makeQuiz(el,SENT,'sentence'));
$$('[data-vocab]').forEach(el=>{
  el.innerHTML='<div class="tools"><input class="search" type="search" placeholder="Search a word…" aria-label="Search vocabulary"><span class="mono">'+vocab.length+' cards · hover or tap to flip</span></div><div class="fcs"></div>';
  const g=$('.fcs',el);
  const draw=q=>{g.innerHTML=vocab.filter(v=>v.w.toLowerCase().includes(q)).map(v=>'<button class="fc"><div class="fi"><div class="ff front"><small>Word</small>'+esc(v.w)+'</div><div class="ff back"><span><b>Syn</b>'+esc(v.s)+'</span><span><b>Ant</b>'+esc(v.a)+'</span></div></div></button>').join('')||'<p>No match.</p>'};
  draw('');$('.search',el).oninput=e=>draw(e.target.value.trim().toLowerCase());
  g.onclick=e=>{const c=e.target.closest('.fc');if(c)c.classList.toggle('flip')};
});
$$('[data-passages]').forEach(el=>{
  el.innerHTML='<div class="pass">'+PASSQ.map((p,n)=>'<div class="ps" data-p="'+n+'"><button aria-expanded="false"><span><small>Passage '+(n+1)+'</small>'+esc(p.t)+'</span><span class="plus">+</span></button><div class="body"><p class="txt">'+esc(p.x)+'</p><div class="pq"></div></div></div>').join('')+'</div>';
  el.onclick=e=>{const b=e.target.closest('.ps>button');if(!b)return;const ps=b.parentElement,open=ps.classList.toggle('open');b.setAttribute('aria-expanded',open);const box=$('.pq',ps);if(open&&!box.dataset.done){box.dataset.done=1;makeQuiz(box,PASSQ[+ps.dataset.p].q,null)}};
});
$$('[data-quotes]').forEach(el=>{
  const quotes=QUO.trim().split('\n').map(l=>{const p=l.split('|');return{c:p[0],t:p[1],a:p[2]}});
  const qc=['All',...new Set(quotes.map(q=>q.c))];
  el.innerHTML='<div class="tabs"></div><div class="qg"></div>';
  tabs($('.tabs',el),qc.map(c=>({label:esc(c)})),j=>{$('.qg',el).innerHTML=quotes.filter(q=>j===0||q.c===qc[j]).map(q=>'<figure class="qt"><p>'+esc(q.t)+'</p><cite>— '+esc(q.a)+'</cite></figure>').join('')});
});
$$('[data-essays]').forEach(el=>{
  const essays=ESS.trim().split('\n').map(l=>{const p=l.split('|');return{t:p[0],n:p[1],h:p[2]}});
  const et=['All','Argumentative','Narrative'];
  el.innerHTML='<div class="tabs"></div><div class="es"></div>';
  tabs($('.tabs',el),et.map(c=>({label:c})),j=>{$('.es',el).innerHTML=essays.filter(x=>j===0||x.t===et[j]).map(x=>'<div><em class="'+(x.t==='Narrative'?'n':'')+'">'+x.t+'</em><p><b>'+esc(x.n)+'</b><span>'+esc(x.h)+'</span></p></div>').join('')});
});
$$('[data-check]').forEach(el=>{
  const CL=['Read the complete USAT syllabus for my category','Make a one-page formula sheet','Learn 10 new vocabulary words daily','Finish 50 MCQs in each subject','Practise 25 quantitative reasoning MCQs','Read and solve 10 comprehension passages','Write 4 timed essays (2 argumentative, 2 narrative)','Take 2 full 100-minute mock tests','Check HEC dates, roll number slip and test centre'];
  const cs=JSON.parse(store.get('usat-check')||'[]');
  el.innerHTML='<div class="cb"><i></i></div><div class="check"></div>';
  const bar=$('.cb i',el),box=$('.check',el);
  const paint=()=>{bar.style.width=Math.round(cs.length/CL.length*100)+'%'};
  box.innerHTML=CL.map((c,i)=>'<label><input type="checkbox" data-i="'+i+'" '+(cs.includes(i)?'checked':'')+'> '+esc(c)+'</label>').join('');paint();
  box.onchange=e=>{const i=+e.target.dataset.i,k=cs.indexOf(i);k<0?cs.push(i):cs.splice(k,1);store.set('usat-check',JSON.stringify(cs));paint()};
});
$$('[data-sponsor]').forEach(el=>el.innerHTML=sponsor());
const nav=$('#nav');if(nav){$('#menu').onclick=()=>nav.classList.toggle('open');nav.onclick=e=>{if(e.target.tagName==='A')nav.classList.remove('open')}}
const prog=$('#prog'),up=$('#up');
addEventListener('scroll',()=>{const h=document.documentElement;prog.style.width=(scrollY/(h.scrollHeight-innerHeight||1)*100)+'%';up.classList.toggle('show',scrollY>900)},{passive:true});
up.onclick=()=>scrollTo({top:0,behavior:'smooth'});
})();
