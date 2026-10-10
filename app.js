(function(){
var $=function(s){return document.querySelector(s)},t=function(k,p){return I18n.t(k,p)};
var root=document.body.dataset.root||'',page=document.body.dataset.page;
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(n){return(n<0?'(':'')+'Rp'+Math.abs(n).toLocaleString('id-ID')+(n<0?')':'')}
function nm(a){return I18n.lang()==='id'?a.id+' ('+a.en+')':a.en+' ('+a.id+')'}
function num(s){s=String(s||'').replace(/Rp|\s|\.|,/gi,'');return s===''?0:/^\d+$/.test(s)?Number(s):NaN}
function blank(){return{id:null,date:new Date().toISOString().slice(0,10),desc:'',lines:[{code:'',d:'',c:''},{code:'',d:'',c:''}]}}
var tab='j',form=blank(),msg=null,ntext='',ndate=new Date().toISOString().slice(0,10),nres=null;
function sg(n){return(n>0?'+':n<0?'−':'')+fmt(Math.abs(n))}
function eqEff(ls){var A=0,L=0,E=0;ls.forEach(function(l){var a=Acc.byCode(l.code),v=(l.debit||0)-(l.credit||0);if(a.type==='asset')A+=v;else if(a.type==='liability')L-=v;else E-=v});return{A:A,L:L,E:E}}
function why(l){var a=Acc.byCode(l.code),s=l.debit?'D':'C',c=(a.type==='asset'&&a.normal==='C')||(a.type==='equity'&&a.normal==='D');
 return t('x.l',{a:nm(a),ty:t(c?'ty.contra':'ty.'+a.type),dir:t(s===a.normal?'x.inc':'x.dec'),side:t('side.'+s)})}
function analyzeNow(){
 var r=Analyzer.analyze(ntext);
 if(r.status!=='ok'){nres={k:'ask',m:t(r.key,{r:r.rule?t('rule.'+r.rule):'',v:r.vals||''})};return}
 var e={date:ndate,desc:ntext.trim().replace(/\s+/g,' '),lines:r.lines},s=Acc.upsert(e);
 if(!s.ok){nres={k:'ask',m:s.errors.map(function(x){return t(x.k,x.p)}).join(' ')};return}
 nres={k:'ok',e:e,r:r};ntext=''}
function nbox(){
 var h='<form id="nf" class="card" novalidate><h2>'+t('n.title')+'</h2><p class="mut">'+t('n.help')+'</p><label for="nt">'+t('f.desc')+'</label><textarea id="nt" rows="3" placeholder="'+esc(t('n.ph'))+'" style="width:100%;padding:8px;border:1px solid #b9c3d6;border-radius:8px;font:inherit">'+esc(ntext)+'</textarea><label>'+t('f.date')+' <input type="date" id="nd" value="'+ndate+'"></label> <button type="submit">'+t('n.go')+'</button></form>';
 if(!nres)return h;
 if(nres.k==='ask')return h+'<div class="card" role="alert"><p class="bad">'+esc(nres.m)+'</p></div>';
 var e=nres.e,r=nres.r,f=eqEff(e.lines),all=Acc.load(),tb=Acc.trial(all),st=Acc.statements(all);
 return h+'<div class="card" role="status"><p class="ok"><b>'+t('n.done')+':</b> '+t('rule.'+r.rule)+' — '+fmt(r.amount)+'</p><div class="tw"><table><thead><tr><th>'+t('f.date')+'</th><th>'+t('f.acct')+'</th><th class="n">'+t('f.debit')+'</th><th class="n">'+t('f.credit')+'</th></tr></thead><tbody>'+
 e.lines.map(function(l){return'<tr><td>'+e.date+'</td><td style="padding-left:'+(l.credit?28:10)+'px">'+l.code+' '+esc(nm(Acc.byCode(l.code)))+'</td><td class="n">'+(l.debit?fmt(l.debit):'')+'</td><td class="n">'+(l.credit?fmt(l.credit):'')+'</td></tr>'}).join('')+'</tbody></table></div>'+
 '<p><b>'+t('n.why')+'</b></p><ul>'+e.lines.map(function(l){return'<li>'+esc(why(l))+'</li>'}).join('')+'</ul>'+
 '<p><b>'+t('n.eq')+':</b> '+t('fs.ast')+' '+sg(f.A)+' · '+t('fs.liab')+' '+sg(f.L)+' · '+t('eq.l')+' '+sg(f.E)+'</p>'+
 (r.as.length?'<p><b>'+t('n.as')+'</b></p><ul class="mut">'+r.as.map(function(k){return'<li>'+t(k)+'</li>'}).join('')+'</ul>':'')+
 '<p class="mut">'+t('n.upd')+' — '+t('home.tb')+': '+(tb.balanced?t('bal'):t('unbal'))+' · '+t('home.ni')+': '+fmt(st.ni)+'</p>'+
 '<button class="alt" data-act="edit" data-id="'+e.id+'">'+t('n.edit')+'</button> <button class="danger" data-act="undo">'+t('n.undo')+'</button></div>'}
function nav(){
 function a(f,k,p){return'<a href="'+root+f+'"'+(page===p?' aria-current="page"':'')+'>'+t(k)+'</a>'}
 $('#nav').innerHTML='<div class="brand">ACCOUNTING<br>LEARNING LAB</div><nav aria-label="Menu">'+a('index.html','nav.home','home')+a('pages/accounting.html','nav.acc','acc')+
 '</nav><label>'+t('nav.lang')+'<select id="lg"><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></label>';
 $('#lg').value=I18n.lang();$('#lg').onchange=function(e){I18n.set(e.target.value);draw()}}
function card(l,v){return'<div class="card"><span class="mut">'+l+'</span><b>'+v+'</b></div>'}
function home(){
 var es=Acc.load(),tb=Acc.trial(es),st=Acc.statements(es),n=Acc.ledger(es).filter(function(r){return r.net!==0}).length;
 $('#main').innerHTML='<h1>'+t('home.title')+'</h1><p class="mut">'+t('tagline')+'</p><p>'+t('home.intro')+'</p>'+
 (es.length?'<div class="grid">'+card(t('home.entries'),es.length)+card(t('home.accts'),n)+card(t('home.tb'),tb.balanced?t('bal'):t('unbal'))+card(t('home.ni'),fmt(st.ni))+'</div>':'<div class="empty">'+t('home.empty')+'</div>')+
 '<a class="btn" href="'+root+'pages/accounting.html">'+t('home.start')+'</a>'}
function emp(){return'<div class="empty">'+t('empty.j')+'</div>'}
function jr(es){
 var opts='<option value="">'+t('f.sel')+'</option>'+Acc.COA.map(function(a){return'<option value="'+a.code+'">'+a.code+' '+esc(nm(a))+'</option>'}).join('');
 var rows=form.lines.map(function(l,i){return'<div class="ln"><select aria-label="'+t('f.acct')+' '+(i+1)+'" data-i="'+i+'" data-f="code">'+opts.replace('value="'+l.code+'"','value="'+l.code+'" selected')+'</select>'+
 '<input inputmode="numeric" aria-label="'+t('f.debit')+' '+(i+1)+'" placeholder="'+t('f.debit')+'" data-i="'+i+'" data-f="d" value="'+esc(l.d)+'">'+
 '<input inputmode="numeric" aria-label="'+t('f.credit')+' '+(i+1)+'" placeholder="'+t('f.credit')+'" data-i="'+i+'" data-f="c" value="'+esc(l.c)+'">'+
 '<button type="button" class="alt" data-act="rm" data-i="'+i+'" aria-label="'+t('f.rm')+'">✕</button></div>'}).join('');
 var list=es.slice().sort(function(x,y){return x.date<y.date?-1:x.date>y.date?1:0}).map(function(e){return e.lines.map(function(l,i){
  return'<tr><td>'+(i?'':e.date)+'</td><td>'+(i?'':esc(e.desc))+'</td><td style="padding-left:'+(l.credit?28:10)+'px">'+esc(nm(Acc.byCode(l.code)))+'</td><td class="n">'+(l.debit?fmt(l.debit):'')+'</td><td class="n">'+(l.credit?fmt(l.credit):'')+'</td><td>'+
  (i?'':'<button class="alt" data-act="edit" data-id="'+e.id+'">'+t('f.edit')+'</button> <button class="danger" data-act="del" data-id="'+e.id+'">'+t('f.del')+'</button>')+'</td></tr>'}).join('')}).join('');
 return'<form id="jf" novalidate><h2>'+(form.id?t('f.upd'):t('f.new'))+'</h2><label>'+t('f.date')+' <input type="date" id="fd" value="'+form.date+'"></label><label>'+t('f.desc')+' <input id="fn" size="40" value="'+esc(form.desc)+'"></label>'+rows+
 '<p class="mut">'+t('f.help')+'</p><button type="button" class="alt" data-act="add">'+t('f.addline')+'</button> <button type="submit">'+(form.id?t('f.upd'):t('f.save'))+'</button>'+
 (form.id?' <button type="button" class="alt" data-act="cancel">'+t('f.cancel')+'</button>':'')+'</form><h2>'+t('tab.j')+'</h2>'+
 (es.length?'<div class="tw"><table><thead><tr><th>'+t('f.date')+'</th><th>'+t('f.desc')+'</th><th>'+t('f.acct')+'</th><th class="n">'+t('f.debit')+'</th><th class="n">'+t('f.credit')+'</th><th></th></tr></thead><tbody>'+list+'</tbody></table></div>':emp())+
 '<button class="alt" data-act="sample">'+t('f.sample')+'</button> '+(es.length?'<button class="danger" data-act="clear">'+t('f.clear')+'</button>':'')}
function lg(es){
 var L=Acc.ledger(es).filter(function(r){return r.rows.length});if(!L.length)return emp();
 return L.map(function(r){return'<h3>'+r.a.code+' '+esc(nm(r.a))+' <span class="mut">— '+t('l.normal')+': '+t('side.'+r.a.normal)+'</span></h3><div class="tw"><table><thead><tr><th>'+t('f.date')+'</th><th>'+t('f.desc')+'</th><th class="n">'+t('f.debit')+'</th><th class="n">'+t('f.credit')+'</th></tr></thead><tbody>'+
 r.rows.map(function(x){return'<tr><td>'+x.date+'</td><td>'+esc(x.desc)+'</td><td class="n">'+(x.debit?fmt(x.debit):'')+'</td><td class="n">'+(x.credit?fmt(x.credit):'')+'</td></tr>'}).join('')+
 '</tbody><tfoot><tr><td colspan="2">'+t('l.total')+'</td><td class="n">'+fmt(r.d)+'</td><td class="n">'+fmt(r.c)+'</td></tr><tr><td colspan="2">'+t('l.bal')+'</td><td colspan="2" class="n">'+fmt(r.bal)+' ('+t('side.'+r.side)+')'+(r.abnormal?' <span class="bad">'+t('abn')+'</span>':'')+'</td></tr></tfoot></table></div>'}).join('')}
function tbv(es){
 var T=Acc.trial(es);if(!T.rows.length)return emp();
 return'<div class="tw"><table><thead><tr><th>'+t('t.code')+'</th><th>'+t('t.name')+'</th><th class="n">'+t('f.debit')+'</th><th class="n">'+t('f.credit')+'</th></tr></thead><tbody>'+
 T.rows.map(function(r){return'<tr><td>'+r.a.code+'</td><td>'+esc(nm(r.a))+'</td><td class="n">'+(r.debit?fmt(r.debit):'')+'</td><td class="n">'+(r.credit?fmt(r.credit):'')+'</td></tr>'}).join('')+
 '</tbody><tfoot><tr><td colspan="2">'+t('l.total')+'</td><td class="n">'+fmt(T.td)+'</td><td class="n">'+fmt(T.tc)+'</td></tr></tfoot></table></div><p class="'+(T.balanced?'ok':'bad')+'">'+(T.balanced?t('bal'):t('unbal'))+'</p><p class="mut">'+t('t.note')+'</p>'}
function fsv(es){
 if(!es.length)return emp();var S=Acc.statements(es);
 function R(x){return'<tr><td>'+esc(nm(x.a))+'</td><td class="n">'+fmt(x.v)+'</td></tr>'}
 function T(k,v){return'<tr class="tot"><td>'+t(k)+'</td><td class="n">'+fmt(v)+'</td></tr>'}
 function H(k){return'<tr><th colspan="2">'+t(k)+'</th></tr>'}
 function B(h,b){return'<h3>'+h+'</h3><div class="tw"><table><tbody>'+b+'</tbody></table></div>'}
 return B(t('fs.is'),H('fs.rev')+S.rev.map(R).join('')+T('fs.trev',S.totRev)+H('fs.exp')+S.exp.map(R).join('')+T('fs.texp',S.totExp)+T(S.ni>=0?'fs.ni':'fs.nl',S.ni))+
 B(t('fs.eq'),'<tr><td>'+t('fs.beg')+'</td><td class="n">'+fmt(0)+'</td></tr><tr><td>'+t('fs.cap')+'</td><td class="n">'+fmt(S.cap)+'</td></tr><tr><td>'+t(S.ni>=0?'fs.ni':'fs.nl')+'</td><td class="n">'+fmt(S.ni)+'</td></tr><tr><td>'+t('fs.draw')+'</td><td class="n">'+fmt(-S.draw)+'</td></tr>'+T('fs.end',S.totE))+
 B(t('fp'),H('fs.ast')+S.assets.map(R).join('')+T('fs.assets',S.totA)+H('fs.liab')+S.liab.map(R).join('')+T('fs.tl',S.totL)+T('fs.te',S.totE)+T('fs.le',S.totL+S.totE))+
 '<p class="'+(S.ok?'ok':'bad')+'">'+t('fs.chk')+': '+fmt(S.totA)+' = '+fmt(S.totL)+' + '+fmt(S.totE)+' — '+(S.ok?t('fs.ok'):t('fs.bad'))+'</p><p class="mut">'+t('fs.note')+'</p>'}
function acc(){
 var es=Acc.load(),tabs=[['j','tab.j'],['l','tab.l'],['t','tab.t'],['f','tab.f']];
 $('#main').innerHTML='<h1>'+t('acc.title')+'</h1><p class="mut">'+t('acc.help')+'</p>'+nbox()+'<div class="tabs" role="tablist">'+
 tabs.map(function(x){return'<button role="tab" data-tab="'+x[0]+'" aria-selected="'+(tab===x[0])+'"'+(tab===x[0]?'':' class="alt"')+'>'+t(x[1])+'</button>'}).join('')+
 '</div><div id="msg" role="status" aria-live="polite">'+(msg?'<p class="'+msg.c+'">'+msg.m+'</p>':'')+'</div><section id="pane">'+{j:jr,l:lg,t:tbv,f:fsv}[tab](es)+'</section>'}
function draw(){document.documentElement.lang=I18n.lang();nav();if(page==='acc')acc();else home()}
function readForm(){var d=$('#fd');if(!d)return;form.date=d.value;form.desc=$('#fn').value;
 document.querySelectorAll('#jf [data-i]').forEach(function(el){form.lines[+el.dataset.i][el.dataset.f]=el.value})}
function ok(k){msg={c:'ok',m:t(k)}}
document.addEventListener('click',function(ev){
 var b=ev.target.closest('button');if(!b||page!=='acc')return;var a=b.dataset.act,es=Acc.load();
 if(b.dataset.tab){readForm();tab=b.dataset.tab;msg=null;return draw()}
 if(a==='add'){readForm();form.lines.push({code:'',d:'',c:''});msg=null}
 else if(a==='rm'){readForm();if(form.lines.length>2)form.lines.splice(+b.dataset.i,1)}
 else if(a==='cancel'){form=blank();msg=null}
 else if(a==='undo'){if(nres&&nres.e&&nres.e.id)Acc.remove(nres.e.id);nres=null;ok('ok.undo')}
 else if(a==='edit'){var e=es.filter(function(x){return x.id===b.dataset.id})[0];if(!e)return;
  form={id:e.id,date:e.date,desc:e.desc,lines:e.lines.map(function(l){return{code:l.code,d:l.debit?String(l.debit):'',c:l.credit?String(l.credit):''}})};msg=null;tab='j';window.scrollTo(0,0)}
 else if(a==='del'){if(!confirm(t('c.del')))return;Acc.remove(b.dataset.id);if(form.id===b.dataset.id)form=blank();nres=null;ok('ok.del')}
 else if(a==='sample'){if(es.length&&!confirm(t('c.sample')))return;Acc.loadSample();form=blank();nres=null;ok('ok.sample')}
 else if(a==='clear'){if(!confirm(t('c.clear')))return;Acc.clear();form=blank();nres=null;ok('ok.clear')}
 else return;
 draw()});
document.addEventListener('submit',function(ev){
 if(ev.target.id==='nf'){ev.preventDefault();ntext=$('#nt').value;ndate=$('#nd').value;analyzeNow();msg=null;draw();return}
 if(ev.target.id!=='jf')return;ev.preventDefault();readForm();
 var e={date:form.date,desc:form.desc.trim(),lines:form.lines.filter(function(l){return l.code||l.d||l.c}).map(function(l){return{code:l.code,debit:num(l.d),credit:num(l.c)}})};
 if(form.id)e.id=form.id;
 var r=Acc.upsert(e);
 if(r.ok){form=blank();ok('ok.saved')}else msg={c:'bad',m:r.errors.map(function(x){return esc(t(x.k,x.p))}).join(' ')};
 draw()});
document.addEventListener('input',function(e){if(e.target.id==='nt')ntext=e.target.value;if(e.target.id==='nd')ndate=e.target.value});
function onboard(){
 var D=I18n.D,o=document.createElement('div');o.className='ov';
 o.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="obt"><h2 id="obt">'+D.en['ob.title']+'</h2><p>'+D.en['ob.sub']+'</p><h2>'+D.id['ob.title']+'</h2><p>'+D.id['ob.sub']+'</p>'+
 '<label class="opt"><input type="radio" name="ol" value="id" checked> <b>'+D.id['ob.id']+'</b><br>'+D.id['ob.idd']+'</label>'+
 '<label class="opt"><input type="radio" name="ol" value="en"> <b>'+D.id['ob.en']+'</b><br>'+D.id['ob.end']+'</label><button id="obok">Lanjutkan / Continue</button></div>';
 document.body.appendChild(o);var bt=o.querySelector('#obok');bt.focus();
 bt.onclick=function(){I18n.set(o.querySelector('input:checked').value);o.remove();draw()}}
try{draw();if(!I18n.has())onboard()}catch(e){$('#main').textContent='Error: '+e.message;console.error(e)}
})();
