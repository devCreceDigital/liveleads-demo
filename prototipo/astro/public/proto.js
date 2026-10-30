/* LiveLeads · prototipo navegable. Todo el estado vive en memoria (y en sessionStorage si está disponible). */
(function(){
  var TAGS = [
    {n:"Quiere comprar", d:"dice que lo quiere, lo separa o pide el link", c:"#2bb39a", k:["separ","quiero","lo llevo","me la","link","yape"]},
    {n:"Pregunta precio", d:"pregunta cuánto cuesta o el precio", c:"#7b83f0", k:["precio","cuanto","cuánto","q. p","cuesta"]},
    {n:"Pregunta talla", d:"pregunta por tallas, colores o medidas", c:"#f5a623", k:["talla"," m?","color","negro","medida"]},
    {n:"Envío", d:"pregunta si envían a su ciudad o cuánto demora", c:"#29a8e0", k:["envi","envío","provincia","delivery","llega"]}
  ];
  var EXTRA = [{n:"Queja", d:"reclama por un pedido o atención", c:"#ef5350", k:["reclamo","no llegó","queja"]},{n:"Saludo", d:"solo saluda o comenta sin intención", c:"#8f9ab4", k:["hola","saludos","jaja"]}];

  var st = load() || {
    user:"@tutienda", mail:"tienda@correo.com", labels:[], days:7, pack:0, wa:true, waMsg:"Hola, vengo del live, mi TikTok es @", stores:[{u:"@tutienda",wa:true}], rec:[],
    products:[
      {code:"B12", name:"Blusa de lino", price:45, cat:"Blusas", avail:true, desc:"Manga corta, tela fresca", vars:{S:1,M:2,L:1}},
      {code:"B15", name:"Blusa de lino blanca", price:39.9, cat:"Blusas", avail:true, desc:"", units:1},
      {code:"C03", name:"Casaca negra", price:89, cat:"Casacas", avail:false, desc:"Forro polar", units:0}
    ],
    lives:[
      {id:"l1", ago:1, at:"29 oct. 2026 · 8:00 p. m.", dur:"1 h 12 min", c:148},
      {id:"l2", ago:2, at:"28 oct. 2026 · 8:30 p. m.", dur:"58 min", c:121},
      {id:"l3", ago:3, at:"27 oct. 2026 · 9:00 p. m.", dur:"1 h 30 min", c:143},
      {id:"l4", ago:12, at:"18 oct. 2026 · 8:00 p. m.", dur:"1 h 5 min", c:96}
    ],
    people:[
      {live:"l1", u:"rosa.ejemplo", t:"Pregunta precio", s:"pendiente", hot:true, said:[["20:42","q. precio de la casaca negra?"],["20:44","precio porfa 🙏"]]},
      {live:"l1", u:"luz.ejemplo", t:"Quiere comprar", s:"pendiente", said:[["20:47","me la separas la B12 en M"]]},
      {live:"l1", u:"mari.ejemplo", t:"Pregunta talla", s:"pendiente", said:[["20:51","tienes talla M en negro?"]]},
      {live:"l1", u:"kevin.ejemplo", t:"Envío", s:"pendiente", said:[["20:55","envías a Trujillo?"]]},
      {live:"l1", u:"ana.ejemplo", t:"Quiere comprar", s:"escrito", said:[["21:02","lo llevo, cómo pago?"]]},
      {live:"l1", u:"pedro.ejemplo", t:"Pregunta precio", s:"whatsapp", said:[["21:05","cuánto cuesta la B15?"]], wa:"987654321", conf:false},
      {live:"l1", u:"lulu.ejemplo", t:"Pregunta talla", s:"pendiente", said:[["21:09","hay L?"]]},
      {live:"l2", u:"sofi.ejemplo", t:"Quiere comprar", s:"pendiente", said:[["20:41","la quiero en azul"],["20:43","la quiero en azul"]], hot:true},
      {live:"l2", u:"javi.ejemplo", t:"Envío", s:"escrito", said:[["20:58","llega a Cusco?"]]},
      {live:"l3", u:"nora.ejemplo", t:"Pregunta precio", s:"pendiente", said:[["21:12","cuánto la blusa?"]]},
      {live:"l3", u:"beto.ejemplo", t:"Quiere comprar", s:"whatsapp", said:[["21:20","te yapeo ahora"]], wa:"912345678"},
      {live:"l4", u:"carla.ejemplo", t:"Pregunta talla", s:"escrito", said:[["20:30","tienes talla S?"]]}
    ]
  };
  if (!st.labels.length && st._seeded) {}
  var view = "login", resState = "todos", resTag = "", liveTag = "", payM = "yape", editIdx = -1;
  var PACKS = [{p:20,d:15},{p:40,d:30},{p:80,d:60}];
  var TITLES = {live:"Live", rescatar:"Por rescatar", historial:"Historial", etiquetas:"Etiquetas", catalogo:"Catálogo", perfil:"Perfil"};
  var APP = Object.keys(TITLES);

  var NOOP=new Proxy(function(){},{get:function(t,k){return k===Symbol.toPrimitive?function(){return ""}:NOOP},set:function(){return true},apply:function(){return NOOP}});
  function $(s,r){return (r||document).querySelector(s)||NOOP}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function save(){try{sessionStorage.setItem("ll-proto-7",JSON.stringify(st))}catch(e){}}
  function load(){try{return JSON.parse(sessionStorage.getItem("ll-proto-7"))}catch(e){return null}}
  function soles(n){return "S/ "+Number(n).toFixed(2)}
  function tagOf(n){return st.labels.concat(TAGS,EXTRA).filter(function(t){return t.n===n})[0]||{n:n,c:"#8f9ab4"}}
  function tagHtml(n){var t=tagOf(n);return '<span class="tag" style="background:'+t.c+'26;color:'+t.c+'"><i class="sw" style="background:'+t.c+'"></i>'+n+'</span>'}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function toast(msg){var t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(function(){t.hidden=true},2200)}

  var ICO_MSG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1-5A8 8 0 1 1 21 12z"/></svg>';
  var ICO_DM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/></svg>';
  function tagMeta(n){var t=tagOf(n);return '<span class="p-meta" style="color:'+t.c+'">'+esc(n)+'</span>';}
  function personRow(p,i){
    var last=p.said[p.said.length-1], t=tagOf(p.t), n=p.said.length;
    var dm=p.s==="pendiente"?'<button class="pill dm" data-dm="'+i+'">'+ICO_DM+'Escribirle al DM</button>':(p.s==="escrito"?'<button class="pill done" data-dm="'+i+'">Escrito ✓</button>':'<button class="pill done" data-msgs="'+i+'">En WhatsApp</button>');
    return '<div class="person"><div class="p-main"><i class="pdot" style="background:'+t.c+'"></i><div><b class="p-name" style="color:'+t.c+'">'+esc(p.u)+(p.hot?" 🔥":"")+'</b>'+tagMeta(p.t)+'</div><span class="p-quote">“'+esc(last[1])+'”</span></div><div class="p-acts"><button class="pill" data-msgs="'+i+'">'+ICO_MSG+n+(n===1?" mensaje":" mensajes")+'</button>'+dm+'</div></div>';
  }
  document.addEventListener("click",function(e){
    var m=e.target.closest("[data-msgs]"); if(m){openPerson(+m.getAttribute("data-msgs"));return;}
    var d=e.target.closest("[data-dm]"); if(d) sendDm(+d.getAttribute("data-dm"));
  });
  function sendDm(i){var p=st.people[i];toast("Abrimos @"+p.u+" en TikTok para que le escribas");if(p.s==="pendiente"){p.s="escrito";save();render();}}

  var MAX_STORES=3, saUser="";
  function activeStore(){ var a=st.stores.filter(function(x){return x.u===st.user})[0]; if(!a){ st.stores[0].u=st.user; a=st.stores[0]; } return a; }
  function renderStores(){
    var a=activeStore(); a.wa=st.wa; var full=st.stores.length>=MAX_STORES;
    $("#store-btn").textContent=st.user+" ▾";
    $("#store-menu").innerHTML=st.stores.map(function(x,i){return '<button class="'+(x.u===st.user?"on":"")+'" data-store="'+i+'">'+esc(x.u)+(x.u===st.user?" ✓":"")+'</button>'}).join("")+'<button data-go="perfil" data-anchor="tiendas">Administrar tiendas</button>';
    $("#st-count").textContent=st.stores.length+" de "+MAX_STORES;
    $("#st-list").innerHTML=st.stores.map(function(x,i){var on=x.u===st.user;return '<div class="store-row"><span class="dot'+(x.wa?"":" off")+'"></span><span class="grow"><b>'+esc(x.u)+'</b><br><span class="dim" style="font-size:12.5px">'+(x.wa?"WhatsApp conectado":"WhatsApp sin conectar")+'</span></span>'+(on?'<span class="badge-ok">Activa</span>':'<button class="pill" data-store="'+i+'">Cambiar</button>')+'</div>'}).join("");
    $("#st-add").hidden=full;
    $("#st-help").textContent=full?"Llegaste al límite de "+MAX_STORES+" tiendas. Para cambiar una, escríbenos por WhatsApp.":"Puedes tener hasta "+MAX_STORES+" tiendas con el mismo Monedero. No se cobra por tienda.";
  }
  function saStep(n){ [1,2,3].forEach(function(i){ $("#sa-"+i).hidden=i!==n; $("#ss-"+i).className=i<=n?"on":""; }); }
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-store]");
    if(b){ if(L.on){toast("Termina tu live para cambiar de tienda");return;} var x=st.stores[+b.getAttribute("data-store")]; st.user=x.u; st.wa=x.wa; save(); $("#store-menu").hidden=true; render(); toast("Ahora estás en "+x.u); return; }
    if(e.target.id==="store-btn"){ $("#store-menu").hidden=!$("#store-menu").hidden; return; }
    if(!e.target.closest("#store-menu")) $("#store-menu").hidden=true;
    var c=e.target.closest("[data-sa]");
    if(c){ st.stores.push({u:saUser,wa:false}); save(); closeAll(); render(); toast("Tienda "+saUser+" agregada"); }
  });
  $("#st-add").onclick=function(){ $("#sa-u").value=""; $("#sa-err").hidden=true; saStep(1); openOv("#m-store"); };
  $("#sa-next1").onclick=function(){
    var v=$("#sa-u").value.trim(), err=""; if(v&&v[0]!=="@") v="@"+v;
    if(!/^@[\w.]{2,}$/.test(v)) err="Escribe el @ de TikTok de la tienda.";
    else if(st.stores.some(function(x){return x.u.toLowerCase()===v.toLowerCase()})) err="Esa tienda ya está en tu cuenta.";
    $("#sa-err").textContent=err; $("#sa-err").hidden=!err; if(err)return;
    saUser=v; $("#sa-found").textContent=v; saStep(2);
  };
  $("#sa-next2").onclick=function(){saStep(3);};
  $("#sa-back").onclick=function(){saStep(1);};

  /* ---------- router ---------- */
  function go(v, anchor){
    var here = location.pathname.replace(/\/+$/, "") || "/";
    if (window.LL_ROUTES && window.LL_ROUTES[v] && here !== window.LL_ROUTES[v]) { save(); location.href = window.LL_ROUTES[v] + (anchor?"#"+anchor:""); return; }
    view = v; closeAll();
    var inApp = APP.indexOf(v) > -1;
    $("#shell").hidden = !inApp;
    $$("[data-view]").forEach(function(el){ el.hidden = el.getAttribute("data-view") !== v; });
    if (inApp) {
      $("#top-title").textContent = TITLES[v];
      $$(".nav").forEach(function(n){ n.classList.toggle("on", n.getAttribute("data-go")===v); });
      if (innerWidth <= 820) { $("#shell").classList.remove("mopen"); $("#side-scrim").hidden = true; }
    }
    render();
    if (anchor) { var a=document.getElementById(anchor); if(a) a.scrollIntoView({behavior:"smooth"}); } else window.scrollTo(0,0);
  }
  document.addEventListener("click", function(e){
    var g = e.target.closest("[data-go]"); if (g) { e.preventDefault(); go(g.getAttribute("data-go"), g.getAttribute("data-anchor")); return; }
    var t = e.target.closest("[data-toast]"); if (t) { toast(t.getAttribute("data-toast")); }
    if (e.target.closest("[data-close]") || e.target.id==="scrim") closeAll();
  });
  function closeAll(){ ["#drawer","#m-prod","#m-pay","#m-sum","#m-wa","#m-end","#m-store","#scrim"].forEach(function(s){$(s).hidden=true}); }
  function openOv(s){ $("#scrim").hidden=false; $(s).hidden=false; }

  $("#burger").onclick = function(){
    var sh=$("#shell");
    if (innerWidth <= 820) { sh.classList.toggle("mopen"); $("#side-scrim").hidden = !sh.classList.contains("mopen"); }
    else sh.classList.toggle("closed");
  };
  $("#side-scrim").onclick = function(){ $("#shell").classList.remove("mopen"); this.hidden=true; };

  /* ---------- auth ---------- */
  $("#f-login").onsubmit = function(e){ e.preventDefault();
    var ok = $("#l-user").value.trim() && $("#l-pass").value.trim();
    $("#l-err").hidden = !!ok; if (!ok) return;
    if ($("#l-user").value.trim().indexOf("@")===0) st.user=$("#l-user").value.trim();
    go(st.labels.length ? "live" : "ob-etiquetas"); };
  $("#f-reg").onsubmit = function(e){ e.preventDefault();
    var tt=$("#r-tt").value.trim(), m=$("#r-mail").value.trim(), p=$("#r-pass").value, err="";
    if (!/^@?[\w.]{2,}$/.test(tt)) err="Escribe tu @ de TikTok.";
    else if (!/^\S+@\S+\.\S+$/.test(m)) err="Revisa tu correo.";
    else if (p.length<8) err="La contraseña necesita al menos 8 caracteres.";
    $("#r-err").textContent=err; $("#r-err").hidden=!err; if (err) return;
    st.user = tt[0]==="@"?tt:"@"+tt; st.mail=m; st.labels=[]; st.wa=false; save(); $("#v-mail").textContent=m; go("verificar"); };
  $("#f-ver").onsubmit = function(e){ e.preventDefault(); var ok=/^\d{6}$/.test($("#v-code").value); $("#v-err").hidden=ok; if(ok){ toast("Correo confirmado. Ya tienes 7 días gratis"); go("ob-etiquetas"); } };

  /* ---------- onboarding ---------- */
  $("#ob-reco").onclick = function(){ st.labels = TAGS.map(function(t){return Object.assign({},t)}); save(); renderOb(); toast("Listo: 4 etiquetas guardadas"); };
  $("#ob-next1").onclick = function(){ go("ob-tiktok"); };
  function renderOb(){
    $("#ob-list").innerHTML = st.labels.map(function(t){return '<div class="item"><i class="sw" style="background:'+t.c+';width:14px;height:14px"></i><span class="grow"><b>'+esc(t.n)+'</b><br><span class="dim" style="font-size:13px">'+esc(t.d)+'</span></span></div>'}).join("");
    $("#ob-next1").disabled = !st.labels.length;
    $("#ob-reco").hidden = !!st.labels.length;
  }

  /* ---------- live ---------- */
  var POOL = [["luz.ejemplo","holaa saludos desde Arequipa 👋"],["rosa.ejemplo","q. precio de la casaca negra?"],["jhon.ejemplo","jajaja ya llegué"],["mari.ejemplo","tienes talla M?"],["kevin.ejemplo","envías a Trujillo?"],["rosa.ejemplo","precio porfa 🙏"],["ana.ejemplo","me la separas la B12"],["pedro.ejemplo","cuánto cuesta la B15?"],["lulu.ejemplo","hay en color negro?"],["rosa.ejemplo","la quiero!! cómo pago?"],["sofi.ejemplo","delivery a Lima norte?"],["javi.ejemplo","❤️❤️"],["mari.ejemplo","y en L?"],["ana.ejemplo","ya te yapeo"]];
  var L = {on:false, i:0, feed:[], timer:null, clock:null, t0:0, count:{}, done:{}, missed:0};
  var SIMS = [["ok","Conexión: normal"],["nolive","Conexión: sin live"],["fail","Conexión: con falla"]], sim = 0;
  function labelsNow(){ return st.labels.length ? st.labels : TAGS; }
  function rank(n){ var l=labelsNow(); for (var i=0;i<l.length;i++) if (l[i].n===n) return i; return 99; }
  function classify(txt){
    var low=txt.toLowerCase(), labels=st.labels.length?st.labels:TAGS;
    for (var i=0;i<labels.length;i++){ var k=labels[i].k||[labels[i].n.toLowerCase()]; for (var j=0;j<k.length;j++) if (low.indexOf(k[j])>-1) return labels[i].n; }
    return null;
  }
  $("#demo-sim").onclick = function(){ sim=(sim+1)%SIMS.length; this.textContent=SIMS[sim][1]; };
  function connect(){
    var b=$("#live-start"); $("#live-err").hidden=true; b.disabled=true; b.textContent="Esperando live…"; $("#live-acc-state").textContent="Buscando el live de "+st.user+"…";
    setTimeout(function(){
      b.disabled=false; b.textContent="Iniciar live"; $("#live-acc-state").textContent="Listo para conectar";
      if (SIMS[sim][0]==="nolive"){ $("#err-t").textContent="Aún no vemos tu live"; $("#err-d").textContent="Ábrelo en TikTok con "+st.user+" y toca Reintentar."; $("#live-err").hidden=false; return; }
      if (SIMS[sim][0]==="fail"){ $("#err-t").textContent="Tu live está activo, pero no logramos conectarnos"; $("#err-d").textContent="No es un problema tuyo. Toca Reintentar. Si sigue igual, escríbenos por WhatsApp."; $("#live-err").hidden=false; return; }
      L={on:true,i:0,feed:[],count:{},done:{},missed:0,t0:Date.now()};
      document.body.classList.add("live-on");
      $("#live-idle").hidden=true; $("#live-idle-foot").hidden=true; $("#live-on").hidden=false; $("#top-live").hidden=false;
      L.timer=setInterval(tick,1300); L.clock=setInterval(clock,1000); tick(); renderLive();
    },1600);
  }
  $("#live-start").onclick = function(){ if (!st.days){ toast("Recarga días para conectar tu live"); go("perfil","plan"); return; } connect(); };
  $("#err-retry").onclick = connect;
  function clock(){ var s=Math.floor((Date.now()-L.t0)/1000); $("#top-timer").textContent="EN VIVO · "+String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); }
  function tick(){
    var c=POOL[L.i%POOL.length]; L.i++;
    L.count[c[0]]=(L.count[c[0]]||0)+1;
    L.feed.unshift({u:c[0], txt:c[1], t:classify(c[1]), hot:L.count[c[0]]>1, isNew:L.count[c[0]]===1});
    if (window.scrollY>160){ L.missed++; var n=$("#live-new"); n.hidden=false; n.textContent="↑ "+L.missed+(L.missed===1?" nuevo":" nuevos"); renderStats(); }
    else renderLive();
  }
  function liveNew(){ L.missed=0; $("#live-new").hidden=true; renderLive(); }
  $("#live-new").onclick=function(){ window.scrollTo(0,0); liveNew(); };
  window.addEventListener("scroll",function(){ if (L.on && L.missed && window.scrollY<80) liveNew(); });
  function livePeople(){
    var m={}, a=[];
    L.feed.slice().reverse().forEach(function(f){ var p=m[f.u]; if(!p){ p=m[f.u]={u:f.u,t:null,n:0,last:"",fresh:true}; a.push(p); } p.n++; p.last=f.txt; p.fresh=p.n===1; if(f.t) p.t=f.t; });
    return a.filter(function(p){return p.t}).sort(function(x,y){ return (rank(x.t)-rank(y.t)) || (y.n-x.n); });
  }
  function renderStats(){
    var ppl=livePeople(), open=ppl.filter(function(p){return !L.done[p.u]});
    $("#st-c").textContent=L.feed.length; $("#st-b").textContent=ppl.length; $("#st-h").textContent=ppl.filter(function(p){return p.n>1}).length; $("#seg-n").textContent=open.length;
    return open;
  }
  $("#live-stop").onclick = function(){ openOv("#m-end"); };
  $("#end-ok").onclick = function(){
    clearInterval(L.timer); clearInterval(L.clock);
    var ppl=livePeople(), tags={}, id="l"+Date.now(), mins=Math.max(1,Math.round((Date.now()-L.t0)/60000));
    st.lives.unshift({id:id, ago:0, at:"Hoy · recién terminado", dur:mins+" min", c:L.feed.length});
    ppl.slice().reverse().forEach(function(f){
      tags[f.t]=(tags[f.t]||0)+1;
      var said=L.feed.filter(function(x){return x.u===f.u}).reverse().map(function(x){return ["hoy",x.txt]});
      st.people.unshift({live:id, u:f.u, t:f.t, s:"pendiente", hot:f.n>1, said:said});
    });
    $("#sum-c").textContent=L.feed.length; $("#sum-b").textContent=ppl.length;
    $("#sum-tags").innerHTML=Object.keys(tags).sort(function(a,b){return rank(a)-rank(b)}).map(function(t){return '<div>'+tagHtml(t)+'<b>'+tags[t]+'</b></div>'}).join("");
    $("#sum-txt").textContent=ppl.length?"Ya las ordenamos: primero quienes quieren comprar.":"Esta vez nadie mostró intención de compra.";
    L.on=false; document.body.classList.remove("live-on");
    $("#live-on").hidden=true; $("#live-idle").hidden=false; $("#live-idle-foot").hidden=false; $("#top-live").hidden=true;
    save(); closeAll(); render(); openOv("#m-sum");
  };
  $("#say-btn").onclick = function(){
    var c={}; L.feed.forEach(function(f){ if(f.t) c[f.t]=(c[f.t]||0)+1; });
    var top=Object.keys(c).sort(function(a,b){return c[b]-c[a]})[0];
    var tips={"Pregunta precio":"Varios preguntan el precio. Dilo en voz alta y déjalo fijado: «La casaca negra está a S/ 89».","Pregunta talla":"Preguntan por tallas. Muestra la prenda y di qué tallas quedan.","Envío":"Preguntan por envíos. Cuenta a qué ciudades llegas y en cuántos días.","Quiere comprar":"Hay gente lista para comprar. Explica cómo separar y pagar con Yape o Plin."};
    var b=$("#say-box"); b.hidden=false; b.textContent = top ? "💡 "+(tips[top] || "Responde primero a quienes insisten 🔥.") :"💡 Aún no hay preguntas. Saluda a los que van llegando y presenta tu producto estrella.";
  };
  function renderLive(){
    var labels=labelsNow(), open=renderStats(), q=$("#live-q").value.trim().toLowerCase();
    var cnt={}; open.forEach(function(p){cnt[p.t]=(cnt[p.t]||0)+1});
    $("#live-filter").innerHTML='<button class="chip'+(liveTag?"":" on")+'" data-lt=">'+open.length+' Todos</button>'+labels.map(function(t){return '<button class="chip'+(liveTag===t.n?" on":"")+'" data-lt="'+esc(t.n)+'">'+(cnt[t.n]||0)+' '+esc(t.n)+'</button>'}).join("");
    var list=open.filter(function(p){return (!liveTag||p.t===liveTag)&&(!q||(p.u+" "+L.feed.filter(function(f){return f.u===p.u}).map(function(f){return f.txt}).join(" ")).toLowerCase().indexOf(q)>-1)});
    $("#live-feed").innerHTML=list.slice(0,20).map(function(p){var t=tagOf(p.t);return '<div class="person"><div class="p-main"><i class="pdot" style="background:'+t.c+'"></i><div><b class="p-name" style="color:'+t.c+'">'+esc(p.u)+(p.n>1?" 🔥":"")+(p.fresh?" 🆕":"")+'</b>'+tagMeta(p.t)+(p.n>1?'<span class="p-meta dim">×'+p.n+'</span>':'')+'</div><span class="p-quote">“'+esc(p.last)+'”</span></div><div class="p-acts one"><button class="pill" data-at="'+esc(p.u)+'">✓ Atender</button></div></div>'}).join("") || '<div class="empty"><span class="ic">💬</span>'+(q?"No encontramos ese comentario.":"Aquí aparecen quienes quieren comprar.")+'</div>';
    var chat=L.feed.filter(function(f){return !q||(f.u+" "+f.txt).toLowerCase().indexOf(q)>-1}).slice(0,30);
    $("#live-chat").innerHTML=chat.map(function(f){var c=f.t?tagOf(f.t).c:"var(--soft)";return '<div class="chatline"><div class="top-l"><span class="nm" style="color:'+c+'">'+esc(f.u)+'</span><span class="tm">ahora</span></div><span>'+esc(f.txt)+'</span></div>'}).join("") || '<div class="empty"><span class="ic">💬</span>Esperando el primer comentario…</div>';
  }
  $("#live-filter").onclick=function(e){var b=e.target.closest("[data-lt]");if(!b)return;liveTag=b.getAttribute("data-lt");renderLive();};
  $("#live-feed").onclick=function(e){var b=e.target.closest("[data-at]");if(!b)return;L.done[b.getAttribute("data-at")]=1;renderLive();toast("Atendida. Sigue guardada en Por rescatar");};
  $("#live-seg").onclick=function(e){var b=e.target.closest("[data-v]");if(!b)return;$("#live-on").setAttribute("data-v",b.getAttribute("data-v"));$$("#live-seg button").forEach(function(x){x.classList.toggle("on",x===b)});};
  $("#live-lens").onclick=function(){var i=$("#live-q");i.hidden=!i.hidden;if(!i.hidden)i.focus();else{i.value="";renderLive();}};
  $("#live-q").oninput=renderLive;

  /* ---------- por rescatar ---------- */
  function renderRes(){
    var labels=labelsNow(), last=st.lives[0], q=$("#res-q").value.trim().toLowerCase();
    var mine=st.people.map(function(p,i){return Object.assign({i:i},p)}).filter(function(p){return p.live===last.id});
    $("#res-sub").textContent="Último live · "+last.at;
    var cnt={}; mine.forEach(function(p){cnt[p.t]=(cnt[p.t]||0)+1});
    $("#res-tags").innerHTML='<button class="chip'+(resTag?"":" on")+'" data-rt="">'+mine.length+' Todos</button>'+labels.map(function(t){return '<button class="chip'+(resTag===t.n?" on":"")+'" data-rt="'+esc(t.n)+'">'+(cnt[t.n]||0)+' '+esc(t.n)+'</button>'}).join("");
    $$("#res-state .chip").forEach(function(c){c.classList.toggle("on",c.getAttribute("data-st")===resState)});
    var order={pendiente:0,escrito:1,whatsapp:2};
    var list=mine.filter(function(p){return (resState==="todos"||p.s===resState)&&(!resTag||p.t===resTag)&&(!q||(p.u+" "+p.said.map(function(x){return x[1]}).join(" ")).toLowerCase().indexOf(q)>-1)})
      .sort(function(a,b){return (order[a.s]-order[b.s]) || (rank(a.t)-rank(b.t)) || (b.said.length-a.said.length)});
    $("#res-list").innerHTML=list.map(function(p){return personRow(p,p.i)}).join("") || '<div class="empty"><span class="ic">◎</span>No hay personas con este filtro.<br><span class="dim">Cuando hagas tu live, aparecen aquí ordenadas por interés.</span><button class="btn sm" data-go="live">Ir a Live</button></div>';
    var pend=mine.filter(function(p){return p.s==="pendiente"}).length; $("#nav-badge").textContent=pend; $("#nav-badge").hidden=!pend;
  }
  $("#res-q").oninput=renderRes;
  $("#res-state").onclick=function(e){var b=e.target.closest("[data-st]");if(!b)return;resState=b.getAttribute("data-st");renderRes();};
  $("#res-tags").onclick=function(e){var b=e.target.closest("[data-rt]");if(!b)return;resTag=b.getAttribute("data-rt");renderRes();};
  var cur=-1;
  function openPerson(i){
    cur=i; var p=st.people[i], t=tagOf(p.t), n=p.said.length;
    $("#d-dot").style.background=t.c; $("#d-name").textContent=p.u+(p.hot?" 🔥":""); $("#d-name").style.color=t.c;
    $("#d-count").textContent=n+(n===1?" mensaje":" mensajes");
    var grp=[],seen={};p.said.forEach(function(s){var k=s[1].toLowerCase();if(seen[k]){seen[k].n++}else{seen[k]={x:s[1],n:1};grp.push(seen[k])}});
    $("#d-tl").innerHTML=grp.map(function(g){return '<div class="bubble"><span>'+esc(g.x)+'</span>'+(g.n>1?'<span class="xn">×'+g.n+'</span>':'')+'</div>'}).join("");
    var labels=labelsNow().concat(EXTRA);
    $("#d-sel").innerHTML=labels.map(function(l){return '<option'+(l.n===p.t?" selected":"")+'>'+esc(l.n)+'</option>'}).join("");
    $("#d-wa-box").hidden=p.s==="whatsapp"||!st.wa; $("#d-wa-off").hidden=p.s==="whatsapp"||st.wa; $("#d-num").value="";
    var isWa=p.s==="whatsapp"; $("#d-conf").hidden=!isWa;
    if(isWa){ $("#d-conf-t").textContent=p.conf?"Cuenta confirmada":"Cuenta sin confirmar"; $("#d-conf-d").textContent=p.conf?"Ya puedes compartir los datos del pedido.":"Antes de compartir datos del pedido, confirma que @"+p.u+" es suya."; $("#d-conf-b").hidden=!!p.conf; }
    $("#d-open").innerHTML=ICO_DM+"Escribirle al DM";
    $("#d-done").textContent=p.s==="escrito"?"Marcar como pendiente":"Marcar como escrito";
    openOv("#drawer");
  }
  $("#d-sel").onchange=function(){st.people[cur].t=this.value;save();render();toast("Etiqueta cambiada. La IA aprende de esto.");};
  $("#d-open").onclick=function(){sendDm(cur);};
  $("#d-conf-b").onclick=function(){st.people[cur].conf=true;save();toast("Le preguntamos: ¿Eres tú? tiktok.com/@"+st.people[cur].u);openPerson(cur);};
  $("#d-done").onclick=function(){var p=st.people[cur];p.s=p.s==="escrito"?"pendiente":"escrito";save();render();closeAll();};
  $("#d-wa").onclick=function(){var n=$("#d-num").value.trim();if(!/^9\d{8}$/.test(n)){$("#d-num").classList.add("in","err");toast("El número tiene 9 dígitos y empieza con 9");return;}$("#d-num").classList.remove("err");st.people[cur].s="whatsapp";st.people[cur].wa=n;save();render();closeAll();toast("Guardado. Ya puedes escribirle por WhatsApp");};

  /* ---------- historial ---------- */
  var hisDays=7, hisOpen=null, hisTag="", hisState="todos", hisHot=false, hisSort="interes";
  function hisStaticInfo(){
    $("#his-q-top").innerHTML=["precio de la casaca","talla M","envío a provincia","cómo pagar"].map(function(q){return '<span class="chip">'+q+'</span>'}).join("");
    var hours=[2,3,5,9,14,11,6];
    $("#his-bars").innerHTML=hours.map(function(v){return '<i class="'+(v===14?"hi":"")+'" style="height:'+v/14*100+'%"></i>'}).join("");
    $("#his-peak").textContent="Tu mejor horario: 21:00 a 22:00.";
  }
  function renderHis(){
    hisStaticInfo();
    var q=$("#his-q").value.trim().toLowerCase(), labels=labelsNow();
    var lives=st.lives.filter(function(l){return l.ago<=hisDays}), ids={}, comments=0;
    lives.forEach(function(l){ids[l.id]=1;comments+=l.c});
    var all=st.people.map(function(p,i){return Object.assign({i:i},p)}).filter(function(p){return ids[p.live]});
    var found=all.filter(function(p){return !q||(p.u+" "+p.said.map(function(x){return x[1]}).join(" ")).toLowerCase().indexOf(q)>-1});
    var pend=all.filter(function(p){return p.s==="pendiente"}).length, wa=all.filter(function(p){return p.s==="whatsapp"}).length;
    $("#his-stats").innerHTML='<div class="hstat"><b>'+comments+'</b>Comentaron</div><button class="hstat'+(hisState==="todos"?" on":"")+'" data-hst="todos"><b>'+all.length+'</b>Con intención de compra</button><button class="hstat'+(hisState==="pendiente"?" on":"")+'" data-hst="pendiente"><b>'+pend+'</b>Por escribir</button><button class="hstat'+(hisState==="whatsapp"?" on":"")+'" data-hst="whatsapp"><b>'+wa+'</b>En WhatsApp</button>';
    var okState=function(p){return (hisState==="todos"||p.s===hisState)&&(!hisHot||p.hot||p.said.length>1)};
    var cnt={}, base=found.filter(okState); base.forEach(function(p){cnt[p.t]=(cnt[p.t]||0)+1});
    $("#his-tags").innerHTML='<button class="chip'+(hisTag?"":" on")+'" data-ht="">'+base.length+' Todos</button>'+labels.map(function(t){return '<button class="chip'+(hisTag===t.n?" on":"")+'" data-ht="'+esc(t.n)+'">'+(cnt[t.n]||0)+' '+esc(t.n)+'</button>'}).join("");
    var list=base.filter(function(p){return !hisTag||p.t===hisTag}).sort(function(a,b){return hisSort==="mensajes"?(b.said.length-a.said.length)||(rank(a.t)-rank(b.t)):(rank(a.t)-rank(b.t))||(b.said.length-a.said.length)});
    var nF=(hisState!=="todos"?1:0)+(hisHot?1:0)+(hisSort!=="interes"?1:0);
    $("#his-fbtn").textContent="Filtros"+(nF?" · "+nF:"");
    $$("#his-range .chip").forEach(function(c){c.classList.toggle("on",+c.getAttribute("data-r")===hisDays)});
    $$("#his-state .chip").forEach(function(c){c.classList.toggle("on",c.getAttribute("data-hst")===hisState)});
    $$("#his-sort .chip").forEach(function(c){c.classList.toggle("on",c.getAttribute("data-so")===hisSort)});
    $("#his-hot").classList.toggle("on",hisHot);
    var narrowed=q||nF||hisTag, shown=lives.filter(function(l){return !narrowed||list.some(function(p){return p.live===l.id})});
    if (hisOpen===null && shown[0]) hisOpen=shown[0].id;
    $("#his-note").textContent=shown.length+(shown.length===1?" sesión":" sesiones")+" · "+list.length+" leads";
    $("#his-lives").innerHTML=shown.map(function(l){
      var mine=list.filter(function(p){return p.live===l.id}), open=narrowed||hisOpen===l.id;
      var head='<button class="sess-head'+(open?" open":"")+'" data-sess="'+l.id+'"><i class="pdot" style="background:var(--ok);grid-row:auto"></i><span style="min-width:0"><b>'+esc(st.user)+'</b> <span class="badge-ok">Finalizado</span><br><span class="sess-meta">'+esc(l.at)+' · '+esc(l.dur)+'</span></span><span class="sess-count">'+mine.length+' leads '+(open?"⌃":"⌄")+'</span></button>';
      if (!open) return '<div class="sess">'+head+'</div>';
      return '<div class="sess">'+head+'<div class="sess-body"><div>'+mine.map(function(p){return personRow(p,p.i)}).join("")+'</div></div></div>';
    }).join("") || '<div class="empty"><span class="ic">◷</span>Nadie coincide con estos filtros.<button class="btn sm" id="his-empty-clear">Limpiar filtros</button></div>';
  }
  function hisClear(){hisTag="";hisState="todos";hisHot=false;hisSort="interes";$("#his-q").value="";renderHis();}
  $("#his-range").onclick=function(e){var b=e.target.closest("[data-r]");if(!b)return;hisDays=+b.getAttribute("data-r");hisOpen=null;renderHis();};
  $("#f-his").onsubmit=function(e){e.preventDefault();renderHis();};
  $("#his-q").oninput=renderHis;
  $("#his-fbtn").onclick=function(){var f=$("#his-fpanel");f.hidden=!f.hidden;this.setAttribute("aria-expanded",String(!f.hidden));};
  $("#his-clear").onclick=hisClear;
  $("#his-hot").onclick=function(){hisHot=!hisHot;renderHis();};
  $("#his-sort").onclick=function(e){var b=e.target.closest("[data-so]");if(b){hisSort=b.getAttribute("data-so");renderHis();}};
  $("#his-tags").onclick=function(e){var c=e.target.closest("[data-ht]");if(c){hisTag=c.getAttribute("data-ht");renderHis();}};
  document.addEventListener("click",function(e){var c=e.target.closest("[data-hst]");if(c){hisState=c.getAttribute("data-hst");renderHis();}if(e.target.id==="his-empty-clear")hisClear();});
  $("#his-lives").onclick=function(e){var h=e.target.closest("[data-sess]");if(h){var id=h.getAttribute("data-sess");hisOpen=hisOpen===id?"":id;renderHis();}};

  /* ---------- etiquetas ---------- */
  function renderTags(){
    var have=st.labels.map(function(t){return t.n});
    $("#tag-sugg").innerHTML=TAGS.concat(EXTRA).filter(function(t){return have.indexOf(t.n)<0}).map(function(t){return '<button class="chip" data-add="'+esc(t.n)+'"><i class="sw" style="background:'+t.c+'"></i> + '+esc(t.n)+'</button>'}).join("");
    $("#tag-list").innerHTML=st.labels.map(function(t,i){return '<div class="item"><i class="sw" style="background:'+t.c+';width:14px;height:14px"></i><span class="grow"><b>'+esc(t.n)+'</b><input class="in" data-desc="'+i+'" value="'+esc(t.d||"")+'" placeholder="Describe cuándo va aquí un comentario" style="margin-top:6px;padding:8px 10px;font-size:13px"></span><button class="x" data-del="'+i+'" aria-label="Borrar etiqueta">✕</button></div>'}).join("") || '<div class="empty"><span class="ic">⚌</span>No hay etiquetas todavía<br><span class="dim">Toca una sugerida o escribe la tuya</span></div>';
  }
  $("#tag-sugg").onclick=function(e){var b=e.target.closest("[data-add]");if(!b)return;var t=TAGS.concat(EXTRA).filter(function(x){return x.n===b.getAttribute("data-add")})[0];st.labels.push(Object.assign({},t));save();renderTags();toast("Etiqueta agregada");};
  $("#tag-list").onclick=function(e){var b=e.target.closest("[data-del]");if(!b)return;st.labels.splice(+b.getAttribute("data-del"),1);save();renderTags();toast("Etiqueta borrada");};
  $("#tag-list").oninput=function(e){var i=e.target.getAttribute("data-desc");if(i!==null){st.labels[+i].d=e.target.value;save();}};
  $("#f-tag").onsubmit=function(e){e.preventDefault();var v=$("#tag-in").value.trim();if(!v)return;if(st.labels.some(function(t){return t.n.toLowerCase()===v.toLowerCase()})){toast("Esa etiqueta ya existe");return;}var cols=["#c47cf0","#ff8a65","#4dd0e1","#aed581"];st.labels.push({n:v,d:"",c:cols[st.labels.length%cols.length],k:[v.toLowerCase()]});$("#tag-in").value="";save();renderTags();toast("Etiqueta agregada");};

  /* ---------- catálogo ---------- */
  function renderCat(){
    var q=$("#cat-q").value.trim().toLowerCase();
    $("#cat-list").innerHTML=st.products.map(function(p,i){return [p,i]}).filter(function(x){return !q||(x[0].code+" "+x[0].name).toLowerCase().indexOf(q)>-1}).map(function(x){var p=x[0];var u=p.vars?Object.keys(p.vars).reduce(function(a,k){return a+(+p.vars[k]||0)},0):p.units;var meta=p.avail&&u>0?(p.vars?Object.keys(p.vars).join(" ")+" · ":"")+u+" unid.":"Agotado";return '<button class="item" data-prod="'+x[1]+'" style="'+(p.avail&&u>0?"":"opacity:.55")+'"><span class="ico" style="width:40px;height:40px;background:var(--row);color:var(--dim);box-shadow:none">▦</span><span class="grow"><span class="code">'+esc(p.code)+'</span> <b>'+esc(p.name)+'</b><br><span class="dim" style="font-size:13px">'+esc(p.cat)+' · '+meta+'</span></span><b>'+soles(p.price)+'</b></button>'}).join("") || '<div class="empty"><span class="ic">▦</span>No encontramos ese producto.</div>';
  }
  $("#cat-q").oninput=renderCat;
  $("#cat-new").onclick=function(){openProd(-1)};
  $("#cat-list").onclick=function(e){var b=e.target.closest("[data-prod]");if(b)openProd(+b.getAttribute("data-prod"));};
  function nextCode(){var n=12;while(st.products.some(function(p){return p.code==="B"+n}))n++;return "B"+n;}
  function openProd(i){
    editIdx=i; var p=i>-1?st.products[i]:{code:"",name:"",price:"",cat:"General",avail:true,desc:"",units:1};
    $("#p-title").textContent=i>-1?"Editar producto":"Nuevo producto";
    $("#p-code").value=p.code; $("#p-code").placeholder=nextCode(); $("#p-name").value=p.name; $("#p-desc").value=p.desc||"";
    $("#p-price").value=p.price!==""?soles(p.price):""; $("#p-cat").value=p.cat;
    $("#p-avail").setAttribute("aria-pressed",String(!!p.avail));
    var hv=!!p.vars; $("#p-var").setAttribute("aria-pressed",String(hv)); $("#p-var-box").hidden=!hv; $("#p-units-f").hidden=hv;
    $("#p-units").value=p.units||0;
    var v=p.vars||{S:0,M:0,L:0};
    $("#p-var-grid").innerHTML=["S","M","L","XL"].map(function(k){return '<label class="field"><span>'+k+'</span><input class="in" data-var="'+k+'" inputmode="numeric" value="'+(v[k]||0)+'"></label>'}).join("");
    $("#p-err").hidden=true; codeHelp(); openOv("#m-prod");
  }
  function codeHelp(){
    var c=$("#p-code").value.trim().toUpperCase()||$("#p-code").placeholder;
    var dup=st.products.some(function(p,i){return i!==editIdx&&p.code===c});
    $("#p-code").classList.toggle("err",dup);
    $("#p-code-help").className="help"+(dup?" err":"");
    $("#p-code-help").textContent=dup?c+" ya está en uso. Prueba con "+nextCode()+".":"Tus clientes lo piden así en el live: «quiero "+c+"»";
    return !dup;
  }
  $("#p-code").oninput=function(){this.value=this.value.toUpperCase().replace(/\s/g,"");codeHelp();};
  $("#p-price").onfocus=function(){this.value=this.value.replace(/[^\d.]/g,"");};
  $("#p-price").onblur=function(){var n=parseFloat(this.value.replace(/[^\d.]/g,""));this.value=isNaN(n)?"":soles(n);};
  $$(".toggle").forEach(function(t){ if(t.id!=="pf-wa") t.addEventListener("click",function(){ var on=t.getAttribute("aria-pressed")!=="true"; t.setAttribute("aria-pressed",String(on)); if(t.id==="p-var"){$("#p-var-box").hidden=!on;$("#p-units-f").hidden=on;} }); });
  $("#f-prod").onsubmit=function(e){e.preventDefault();
    var code=($("#p-code").value.trim()||$("#p-code").placeholder).toUpperCase(), name=$("#p-name").value.trim(), price=parseFloat($("#p-price").value.replace(/[^\d.]/g,"")), err="";
    if(!codeHelp()) err="Ese código ya existe.";
    else if(isNaN(price)||price<=0) err="Escribe el precio en soles, por ejemplo 45.";
    else if(!name) err="Ponle un nombre al producto.";
    $("#p-err").textContent=err;$("#p-err").hidden=!err;if(err)return;
    var p={code:code,name:name,price:price,cat:$("#p-cat").value,avail:$("#p-avail").getAttribute("aria-pressed")==="true",desc:$("#p-desc").value.trim()};
    if($("#p-var").getAttribute("aria-pressed")==="true"){p.vars={};$$("[data-var]").forEach(function(i){var n=parseInt(i.value,10)||0;if(n)p.vars[i.getAttribute("data-var")]=n;});if(!Object.keys(p.vars).length)p.vars={M:0};}else p.units=parseInt($("#p-units").value,10)||0;
    if(editIdx>-1)st.products[editIdx]=p;else st.products.unshift(p);
    save();renderCat();closeAll();toast(editIdx>-1?"Producto actualizado":"Producto guardado · "+code+" a "+soles(price));
  };

  /* ---------- perfil / plan ---------- */
  function waLink(){ return "https://wa.me/51987654821?text="+encodeURIComponent(st.waMsg); }
  function copyLink(){
    var ok=function(){toast("Enlace copiado");}, no=function(){var i=$("#wl-url");if(i.select)i.select();toast("Copia el enlace seleccionado");};
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(waLink()).then(ok,no); else no();
  }
  $("#wl-copy").onclick=copyLink;
  $("#live-link").onclick=copyLink;
  $("#wl-msg").oninput=function(){st.waMsg=this.value;save();$("#wl-url").value=waLink();};
  function renderPerfil(){
    $$(".acc-name").forEach(function(e){e.textContent=st.user});
    $("#pf-mail").textContent=st.mail;
    $("#pf-wa").setAttribute("aria-pressed",String(st.wa)); $("#pf-wa-dot").className="dot"+(st.wa?"":" off"); $("#pf-wa-txt").textContent=st.wa?"WhatsApp conectado · +51 9•• ••• 821":"WhatsApp desconectado"; $("#h-wa").className="dot"+(st.wa?"":" off"); $("#h-wa2").className="dot"+(st.wa?"":" off"); $("#h-wa2-t").textContent=st.wa?"WhatsApp":"WhatsApp sin conectar";
    $("#pf-prev").textContent=$("#pf-msg").value;
    var end=new Date(2026,9,30+st.days); var ms=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    $("#mon-days").textContent=st.days;
    $("#pf-days").textContent="Hasta el "+end.getDate()+" "+ms[end.getMonth()]+" · 1 día = un día de lives · Compartido entre tus tiendas";
    $("#rec-list").innerHTML=st.rec.map(function(r){return '<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'}).join("")+'<div><span>Al crear tu cuenta</span><span>7 días gratis</span></div>';
    renderStores();
    $("#wl-box").hidden=!st.wa; $("#live-link").hidden=!st.wa;
    if(document.activeElement!==$("#wl-msg")) $("#wl-msg").value=st.waMsg;
    $("#wl-url").value=waLink();
    $("#pf-gift").hidden=!!st.paid;
    $("#plan-pill").textContent="Monedero · "+st.days+" días";
    $("#pf-packs").innerHTML=PACKS.map(function(k,i){return '<button class="chip'+(st.pack===i?" on":"")+'" data-pack="'+i+'">'+k.d+' días · S/ '+k.p+'</button>'}).join("");
    $("#pf-pay").textContent="Pagar S/ "+PACKS[st.pack].p+" por "+PACKS[st.pack].d+" días";
  }
  $("#pf-packs").onclick=function(e){var b=e.target.closest("[data-pack]");if(!b)return;st.pack=+b.getAttribute("data-pack");renderPerfil();};
  $("#pf-msg").oninput=function(){$("#pf-prev").textContent=this.value;};
  $("#pf-wa").onclick=function(){if(!st.wa){openOv("#m-wa");return;}st.wa=false;save();renderPerfil();toast("WhatsApp desconectado");};
  $("#wa-done").onclick=function(){st.wa=true;save();closeAll();renderPerfil();toast("WhatsApp conectado");};
  $("#pf-pay").onclick=function(){$("#pay-amt").textContent=PACKS[st.pack].d+" días · S/ "+PACKS[st.pack].p;setPay("yape");openOv("#m-pay");};
  function setPay(m){payM=m;$$("#pay-method .chip").forEach(function(c){c.classList.toggle("on",c.getAttribute("data-m")===m)});$("#pay-qr").hidden=m==="tarjeta";$("#pay-card").hidden=m!=="tarjeta";$("#pay-app").textContent=m==="plin"?"Plin":"Yape";$("#pay-ok").textContent=m==="tarjeta"?"Pagar S/ "+PACKS[st.pack].p:"Ya pagué";}
  $("#pay-method").onclick=function(e){var b=e.target.closest("[data-m]");if(b)setPay(b.getAttribute("data-m"));};
  $("#pay-ok").onclick=function(){var b=this;b.disabled=true;b.textContent="Confirmando pago…";setTimeout(function(){b.disabled=false;st.days+=PACKS[st.pack].d;st.paid=true;st.rec.unshift(["30 oct. 2026","+"+PACKS[st.pack].d+" días · S/ "+PACKS[st.pack].p]);save();closeAll();renderPerfil();toast("Pago aprobado. Sumamos "+PACKS[st.pack].d+" días a tu plan");},1300);};

  function render(){
    if (!st.lives) st.lives=[];
    if (view==="ob-etiquetas") renderOb();
    if (view==="live") renderLive();
    if (view==="rescatar") renderRes();
    if (view==="historial") renderHis();
    if (view==="etiquetas") renderTags();
    if (view==="catalogo") renderCat();
    renderPerfil(); renderRes();
    $("#v-mail").textContent = st.mail;
  }
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAll();});

  var start = (window.LL_START) || "login";
  go(start, location.hash ? location.hash.slice(1) : null);
})();
