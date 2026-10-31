const $=s=>document.querySelector(s);
const storeKey='walletPlusDataV1';
const quotes=['Chaque petit pas compte.','La régularité construit les projets.','Garde le cap, tranquillement.','Un budget clair, l’esprit léger.','Les bons réflexes font la différence.','Avance à ton rythme.','Chaque euro a une histoire.','Préparer demain commence aujourd’hui.','Les objectifs se construisent pas à pas.','La simplicité aide à garder le contrôle.'];
const defaults={name:'ESPRIT HUGO',color:'#7650d8',currency:'EUR',language:'fr',balance:0,hidden:false,transactions:[],goals:[]};
let data=load();
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(storeKey)||'{}')}}catch{return {...defaults}}}
function save(){localStorage.setItem(storeKey,JSON.stringify(data));render()}
function money(n){return new Intl.NumberFormat(data.language==='fr'?'fr-FR':'en-GB',{style:'currency',currency:data.currency}).format(n)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){
 document.documentElement.style.setProperty('--accent',data.color);
 $('#cardName').textContent=data.name;$('#cardCurrency').textContent=data.currency;
 $('#balance').textContent=data.hidden?'••••••':money(data.balance);
 $('#statsBalance').textContent=money(data.balance);
 $('#toggleBalance').textContent=data.hidden?'◎':'◉';
 $('#settingCardName').value=data.name;$('#settingColor').value=data.color;$('#settingCurrency').value=data.currency;$('#settingLanguage').value=data.language;
 const now=new Date(),month=now.getMonth(),year=now.getFullYear();
 const tx=data.transactions.filter(t=>{let d=new Date(t.date);return d.getMonth()===month&&d.getFullYear()===year});
 $('#monthIncome').textContent=money(tx.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0));
 $('#monthExpense').textContent=money(tx.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0));
 const html=(arr)=>arr.length?arr.map(t=>`<div class="transaction"><div class="transaction-icon">${t.type==='income'?'↙':'↗'}</div><div class="transaction-main"><strong>${esc(t.label)}</strong><small>${esc(t.category)} · ${new Date(t.date+'T12:00:00').toLocaleDateString(data.language==='fr'?'fr-FR':'en-GB')}</small></div><div class="amount ${t.type==='income'?'green':'red'}">${t.type==='income'?'+':'−'}${money(t.amount)}</div></div>`).join(''):'Aucune opération pour le moment.';
 $('#recentList').innerHTML=html([...data.transactions].slice(0,4));
 const q=$('#searchInput')?.value?.toLowerCase()||'';
 const filtered=data.transactions.filter(t=>t.label.toLowerCase().includes(q)||t.category.toLowerCase().includes(q));
 $('#historyList').innerHTML=html(filtered);
 $('#goalsList').innerHTML=data.goals.map(g=>`<div class="goal"><div class="goal-head"><strong>${esc(g.name)}</strong><span>${money(g.saved)} / ${money(g.target)}</span></div><div class="progress"><i style="width:${Math.min(100,g.saved/g.target*100)}%"></i></div></div>`).join('');
}
function showScreen(name){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===name+'Screen'));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.target===name))}
document.querySelectorAll('.tab,[data-target]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.target)));
function openOperation(type){$('#operationType').value=type;$('#dialogTitle').textContent=type==='income'?'Ajouter un revenu':type==='expense'?'Ajouter une dépense':'Ajuster le solde';$('#dialogEyebrow').textContent='NOUVELLE OPÉRATION';$('#operationLabel').placeholder=type==='income'?'Ex. Salaire':'Ex. Café';$('#operationAmount').value='';$('#operationLabel').value=type==='adjust'?'Ajustement':'';$('#operationDate').value=new Date().toISOString().slice(0,10);$('#operationDialog').showModal()}
$('#incomeButton').onclick=()=>openOperation('income');$('#expenseButton').onclick=()=>openOperation('expense');$('#adjustButton').onclick=()=>openOperation('adjust');
$('#operationForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let type=$('#operationType').value,amount=Number($('#operationAmount').value);if(!amount||amount<=0)return; if(type==='adjust'){data.balance=amount}else{data.transactions.unshift({id:crypto.randomUUID?.()||String(Date.now()),type,amount,label:$('#operationLabel').value.trim(),category:$('#operationCategory').value,date:$('#operationDate').value});data.balance+=type==='income'?amount:-amount}$('#operationDialog').close();save()});
$('#toggleBalance').onclick=()=>{data.hidden=!data.hidden;save()};
$('#settingCardName').onchange=e=>{data.name=e.target.value.trim()||defaults.name;save()};
$('#settingColor').oninput=e=>{data.color=e.target.value;render()};
$('#settingColor').onchange=save;
$('#settingCurrency').onchange=e=>{data.currency=e.target.value;save()};
$('#settingLanguage').onchange=e=>{data.language=e.target.value;save()};
$('#searchInput').oninput=render;
$('#exportButton').onclick=()=>{let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wallet-plus-backup.json';a.click();URL.revokeObjectURL(a.href)};
$('#importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let imported=JSON.parse(await f.text());if(!Array.isArray(imported.transactions)||typeof imported.balance!=='number')throw Error();data={...defaults,...imported};save();alert('Sauvegarde importée.')}catch{alert('Fichier de sauvegarde invalide.')}e.target.value=''};
$('#newGoalButton').onclick=()=>{ $('#simpleTitle').textContent='Nouvel objectif';$('#simpleFields').innerHTML='<label class="field">Nom<input id="goalName" required maxlength="35" placeholder="Ex. Nouveau téléphone"></label><label class="field">Montant cible<input id="goalTarget" type="number" min="1" step=".01" required placeholder="500"></label><label class="field">Déjà économisé<input id="goalSaved" type="number" min="0" step=".01" value="0"></label>';$('#simpleDialog').showModal()};
$('#simpleDialog').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();let name=$('#goalName')?.value?.trim(),target=Number($('#goalTarget')?.value),saved=Number($('#goalSaved')?.value||0);if(!name||target<=0)return;data.goals.push({name,target,saved});$('#simpleDialog').close();save()});
$('#profileButton').onclick=()=>alert('La gestion multi-profils sera ajoutée dans une prochaine version.');
$('#dailyQuote').textContent=quotes[Math.floor(Date.now()/86400000)%quotes.length];
$('#greeting').textContent=new Date().getHours()<12?'BONJOUR':new Date().getHours()<18?'BON APRÈS-MIDI':'BONNE SOIRÉE';
render();
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
