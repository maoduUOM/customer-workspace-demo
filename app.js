const implementationFields=['CustomerID','ImplementationMeetingRequired','LicenceReceived','UserAccountsRequested','UserAccountsReceived','SuperUsersDefined','CaldicottFormReceived','AccessLevelsDefined','RevalidationAccess','MarketShareReportsDivisionalStructure','SUSDSASignedAndReturned','SUSAgreement','KickOfTrainingDateAgreed','Comment','ImplementationComplete'];
const booleanFields=implementationFields.filter(k=>!['CustomerID','Comment'].includes(k));
const nhsTypes=['NHS Trust','NHS Foundation Trust','Integrated Care Board','Other'];
try{const saved=JSON.parse(localStorage.getItem('trust-portfolio-demo-v1'));if(Array.isArray(saved)&&saved.length)data=saved}catch{}
for(const r of data){r.status=['Archive','Archived'].includes(r.status)?'Archive':r.status==='Implementation'?'Implementation':'Active';r.nhsType??='NHS Trust';r.multipleTrusts??=false;r.autoRenew??=false;r.implementation??={};const legacy={LicenceReceived:0,UserAccountsRequested:1,UserAccountsReceived:2,SuperUsersDefined:3,CaldicottFormReceived:4,AccessLevelsDefined:5,RevalidationAccess:6,MarketShareReportsDivisionalStructure:9,SUSDSASignedAndReturned:10,KickOfTrainingDateAgreed:14};for(const key of booleanFields)r.implementation[key]??=key in legacy?!!r.checks?.[legacy[key]]:false;r.implementation.Comment??='';r.contacts??=[];r.contracts??=[{id:r.id+'-001',start:r.start,end:r.end,training:r.training,autoRenew:!!r.autoRenew,status:'Current'}];delete r.days;for(const c of r.contracts)delete c.days}
for(let i=5;i<10;i++){
  const r=data.find(x=>x.id==='DEMO'+String(i+1).padStart(3,'0'));
  const oldEnd=new Date(Date.UTC(2027,3+i%10,1+(i*7)%27)).toISOString().slice(0,10);
  const c=r?.contracts?.length===1?r.contracts[0]:null;
  if(r?.status!=='Archive'||r.end!==oldEnd||r.start!=='2026-05-01'||c?.end!==oldEnd||c.start!=='2026-05-01'||c.status!=='Current'||(r.trainingPeriods&&(r.trainingPeriods.length!==1||r.trainingPeriods[0].end!==oldEnd||r.trainingPeriods[0].sessions?.length)))continue;
  const end=new Date(Date.UTC(2026,i-4,1)).toISOString().slice(0,10);
  r.start=c.start='2025-01-01';r.end=c.end=end;
  if(r.trainingPeriods?.length===1&&r.trainingPeriods[0].end===oldEnd){r.trainingPeriods[0].start='2025-01-01';r.trainingPeriods[0].end=end}
}
for(const r of data)for(const c of r.contacts){c.main??=c.type==='Primary';c.secondary??=c.type==='Secondary';c.cost??=''}
for(const r of data)if(typeof r.notes==='string')r.notes=r.notes.replace(/^Fictional demonstration account\./,'Synthetic demonstration account.');
let view='Active',page=1,current=data[0],activeTab='overview';
const date=v=>v?new Date(v+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Not set';
const currentContract=r=>r.contracts.find(c=>c.status==='Current');
const contractEnd=r=>currentContract(r)?.end||'';
function daysUntil(end,today=new Date()){if(!/^\d{4}-\d{2}-\d{2}$/.test(end||''))return null;const [y,m,d]=end.split('-').map(Number);const target=Date.UTC(y,m-1,d),start=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());return Math.max(0,Math.round((target-start)/86400000))}
const todayISO=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const canArchive=r=>{const signed=r.contracts.filter(c=>c.status!=='Draft');return signed.length>0&&signed.every(c=>c.end&&c.end<todayISO())};
const archiveMessage='Archive is available only after all non-draft contracts have ended.';
for(const r of data)if(r.status==='Archive'&&!canArchive(r))r.status='Active';
const daysRemainingFor=r=>r.status==='Archive'?0:daysUntil(contractEnd(r));
const trainingDaysFor=r=>r.status==='Archive'?0:Number(r.training)||0;
const daysText=n=>n===null?'Not set':n+' '+(n===1?'day':'days');
function el(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e}
function persist(){const notice=$('notice');try{localStorage.setItem('trust-portfolio-demo-v1',JSON.stringify(data));notice.replaceChildren();notice.classList.add('hide');return true}catch{notice.textContent='Unable to save: browser storage is unavailable or full. Changes will be lost on reload.';notice.classList.remove('hide');return false}}
function showUndo(message,button){const notice=$('notice');notice.replaceChildren(document.createTextNode(message+' '),button);notice.classList.remove('hide')}
function showList(next='Active'){view=next;page=1;$('list').classList.remove('hide');$('detail').classList.add('hide');$('crumb').textContent='';document.querySelectorAll('[data-view]').forEach(e=>e.classList.toggle('selected',e.dataset.view===view));$('listTitle').textContent=view==='Implementation'?'Implementation':view+' trusts';$('listIntro').textContent=view==='Implementation'?'Review and update customers in implementation.':'Find a trust and review its account details.';$('implementationHint').classList.toggle('hide',view!=='Implementation');renderRows();history.replaceState(null,'','#'+view)}
function getRows(){const q=$('search').value.trim().toLowerCase();return data.filter(r=>r.status===(view==='Archived'?'Archive':view)&&(!q||(r.name+' '+r.id+' '+r.manager).toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name))}
function resetPage(){page=1;$('clearSearch').hidden=!$('search').value;renderRows()}function clearSearch(){$('search').value='';resetPage();$('search').focus()}function changePage(n){page+=n;renderRows()}
function makeHead(target,labels){target.replaceChildren();const tr=el('tr');labels.forEach(label=>{const display=label==='CustomerID'?'Customer':label;const th=el('th',display.replace(/([a-z])([A-Z])/g,'$1\u200b$2'));th.setAttribute('scope','col');th.title=display;tr.append(th)});target.append(tr)}
function trustLink(r){const a=el('a',undefined,'trustname');a.href='#trust/'+r.id;const name=el('span',r.name),sub=el('small',r.id+' · '+r.status);name.append(sub);a.append(name);a.onclick=e=>{e.preventDefault();showDetail(r.id)};return a}
function implementationRow(r){const row=el('tr');for(const key of implementationFields){const cell=el('td');if(key==='CustomerID')cell.append(trustLink(r));else if(key==='Comment'){const input=el('textarea');input.value=r.implementation.Comment;input.setAttribute('aria-label',r.name+' · Comment');input.oninput=()=>{r.implementation.Comment=input.value;persist()};cell.append(input)}else{const input=el('input');input.type='checkbox';input.checked=r.implementation[key];input.setAttribute('aria-label',r.name+' · '+key);if(key==='ImplementationComplete')cell.className=input.checked?'implementation-complete':'implementation-progress';input.onchange=()=>{r.implementation[key]=input.checked;if(key==='ImplementationComplete')cell.className=input.checked?'implementation-complete':'implementation-progress';persist();if(current.id===r.id)updateSummary()};cell.append(input)}row.append(cell)}return row}
function renderRows(){
  const all=getRows(),size=Number($('pageSize').value),pages=Math.max(1,Math.ceil(all.length/size));
  page=Math.max(1,Math.min(page,pages));
  const impl=view==='Implementation';
  $('trustTable').className=impl?'implementation-table':'simple-table';
  makeHead($('listHead'),impl?implementationFields:['Customer','Account manager','Region','Contract ends','Contracted days remaining','Training days remaining','Next account review','Days since last review','Auto renew','Status','Action']);
  $('rows').replaceChildren();
  all.slice((page-1)*size,page*size).forEach(r=>{
    if(impl){$('rows').append(implementationRow(r));return}
    const row=el('tr'),name=el('td'),days=daysRemainingFor(r),archived=r.status==='Archive';
    name.append(trustLink(r));row.append(name);
    [r.manager,r.region,date(contractEnd(r)),daysText(days),daysText(trainingDaysFor(r)),archived?'':date(r.review),archived?'':r.last||'Not set',r.autoRenew?'Yes':'No',r.status].forEach((v,i)=>{
      const cell=el('td');
      if(i===8)cell.append(el('span',v,'pill status-'+r.status));else cell.textContent=v;
      if(i===3&&days!==null){cell.className=days<60?'days-critical':days<100?'days-warning':'';cell.title=days<60?'Under 60 contracted days remaining':days<100?'Under 100 contracted days remaining':'Contracted days remaining'}
      row.append(cell)
    });
    const cell=el('td'),button=el('button',archived?'Restore':'Archive');
    button.setAttribute('aria-label',button.textContent+' '+r.name);
    if(!archived&&!canArchive(r)){button.disabled=true;button.title=archiveMessage}
    button.onclick=()=>{if(r.status!=='Archive'&&!canArchive(r))return;r.status=archived?'Active':'Archive';persist();renderRows()};
    cell.append(button);row.append(cell);$('rows').append(row)
  });
  if(!all.length){const row=el('tr'),cell=el('td','No matching trusts.','empty-row');cell.colSpan=impl?15:11;row.append(cell);$('rows').append(row)}
  $('listLabel').textContent=all.length?`Showing ${(page-1)*size+1}–${Math.min(page*size,all.length)} of ${all.length} trusts`:'No matching trusts';
  $('pageLabel').textContent=`Page ${page} of ${pages}`;$('prevPage').disabled=page===1;$('nextPage').disabled=page===pages
}
function tab(name){activeTab=name;document.querySelectorAll('.tabpage').forEach(e=>e.classList.toggle('hide',e.id!==name));document.querySelectorAll('[data-tab]').forEach(e=>e.classList.toggle('active',e.dataset.tab===name))}
function showDetail(id){current=data.find(r=>r.id===id)||data[0];selectedTrainingId=current.trainingCurrentId;trainingPage=1;$('trainingSearch').value='';$('list').classList.add('hide');$('detail').classList.remove('hide');$('crumb').textContent=' / Customer details';refresh();tab('overview');history.replaceState(null,'','#trust/'+current.id);window.scrollTo(0,0)}
function updateSummary(){const complete=!!current.implementation.ImplementationComplete;$('implSummary').textContent=complete?'Implementation complete':'Implementation in progress';$('implSummary').classList.toggle('implementation-complete',complete);$('implSummary').classList.toggle('implementation-progress',!complete)}
function accountValue(group,label,value){const field=el('div',undefined,'account-field');field.append(el('div',label,'label'),el('div',String(value),'value'));group.append(field)}
function accountGroup(title){const group=el('section',undefined,'account-group');group.append(el('h3',title));$('accountFields').append(group);return group}
function refresh(){
  const r=current;syncTrainingSummary(r);
  $('customerName').textContent=r.name;
  $('customerSubtitle').replaceChildren(el('span',r.status==='Archive'?'Archived':r.status,'pill status-'+r.status),el('span',r.region+' · '+r.nhsType));
  $('accountFields').replaceChildren();
  const customer=accountGroup('Customer');
  [['Customer code',r.id],['Region',r.region],['Postcode',r.postcode||'Not set'],['Customer address',r.address||'Not set'],['Customer telephone',r.telephone||'Not set']].forEach(([label,value])=>accountValue(customer,label,value));
  const contract=accountGroup('Account & contract');
  const active=currentContract(r);
  [['Account manager',r.manager],['Contract start',date(active?.start)],['Contract end',date(active?.end)],['Contracted days remaining',daysText(daysRemainingFor(r))],['Next account review',date(r.review)]].forEach(([label,value])=>accountValue(contract,label,value));
  const licence=accountGroup('Licence coverage');
  const packages=selectedLicences(r);
  if(packages.length){const list=el('ul',undefined,'licence-summary');packages.forEach(name=>list.append(el('li',name)));licence.append(list)}
  else licence.append(el('p','Not recorded','account-empty'));
  const manage=el('button','Manage licences','textbutton');manage.onclick=()=>tab('licence');licence.append(manage);
  appendAccountControls(r,{customer,contract});
  $('notes').textContent=r.notes||'No notes added.';
  makeHead($('detailImplHead'),implementationFields);$('detailImplRows').replaceChildren(implementationRow(r));updateSummary();renderContacts();renderContracts();renderLicences();renderTraining();
}

function tableEmpty(target,cols,text){const row=el('tr'),cell=el('td',text,'empty-row');cell.colSpan=cols;row.append(cell);target.append(row)}
function renderContacts(){$('contactRows').replaceChildren();sortedContacts().forEach(c=>{const row=el('tr');[c.name,c.job,c.email,c.phone].forEach((v,i)=>{const cell=el('td');if((i===2||i===3)&&v){const a=el('a',v);a.href=(i===2?'mailto:':'tel:')+v;cell.append(a)}else cell.textContent=v||'—';row.append(cell)});for(const [key,label] of [['main','Main contact'],['secondary','Secondary contact']]){const cell=el('td'),input=el('input');input.type='checkbox';input.className='contact-checkbox';input.checked=!!c[key];input.setAttribute('aria-label',c.name+' · '+label);input.onchange=()=>{c[key]=input.checked;persist()};cell.append(input);row.append(cell)}row.append(el('td',c.cost===''?'—':new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(c.cost)));const statusCell=el('td'),statusSelect=el('select');['Active','Inactive'].forEach(v=>statusSelect.add(new Option(v,v)));statusSelect.value=c.userStatus||'Active';statusSelect.setAttribute('aria-label',c.name+' · User Status');statusSelect.onchange=()=>{c.userStatus=statusSelect.value;persist();renderContacts()};statusCell.append(statusSelect);row.append(statusCell);const cell=el('td'),group=el('div',undefined,'action-group'),b=el('button','Edit'),del=el('button','Delete','delete-button');b.onclick=()=>editContact(c.id);del.onclick=()=>deleteContact(c.id);group.append(b,del);cell.append(group);row.append(cell);$('contactRows').append(row)});if(!current.contacts.length)tableEmpty($('contactRows'),9,'No contacts yet. Create a new contact to get started.')}
function deleteContact(id){const owner=current,index=owner.contacts.findIndex(c=>c.id===id);if(index<0)return;const [removed]=owner.contacts.splice(index,1),saved=persist();renderContacts();const undo=el('button','Undo');undo.onclick=()=>{owner.contacts.splice(index,0,removed);persist();if(current.id===owner.id)renderContacts()};if(saved)showUndo(removed.name+' deleted.',undo)}
function appendAccountControls(r,groups){
  for(const spec of [
    {key:'nhsType',label:'NHS type',options:nhsTypes,group:groups.customer},
    {key:'status',label:'Status',options:r.status==='Implementation'?['','Active','Archive']:['Active','Archive'],group:groups.customer},
    {key:'multipleTrusts',label:'Multiple trusts',group:groups.customer},
    {key:'autoRenew',label:'Auto renew',group:groups.contract}
  ]){
    const label=el('label',undefined,'account-control');label.append(el('span',spec.label,'label'));
    const input=el(spec.options?'select':'input');
    if(spec.options){spec.options.forEach(v=>input.add(new Option(v===''?'Choose status':v==='Archive'?'Archived':v,v)));input.value=r.status==='Implementation'&&spec.key==='status'?'':r[spec.key];input.className='inline-control';if(spec.key==='status'&&r.status!=='Archive'&&!canArchive(r)){input.querySelector('option[value="Archive"]').disabled=true;input.title=archiveMessage}}
    else{input.type='checkbox';input.checked=!!r[spec.key]}
    input.setAttribute('aria-label',spec.label);
    input.onchange=()=>{if(spec.key==='status'&&input.value==='Archive'&&!canArchive(r)){input.value=r.status;return}r[spec.key]=spec.options?input.value:input.checked;if(spec.key==='autoRenew'){const c=r.contracts.find(c=>c.status==='Current');if(c)c.autoRenew=r.autoRenew}persist();refresh();renderRows()};
    label.append(input);spec.group.append(label);
  }
}

function renderContracts(){$('contractRows').replaceChildren();current.contracts.forEach(c=>{const row=el('tr');[c.id,date(c.start),date(c.end),daysText(daysUntil(c.end)),c.autoRenew,c.status].forEach((v,i)=>{const td=el('td');if(i===4){const input=el('input');input.type='checkbox';input.checked=!!c.autoRenew;input.setAttribute('aria-label',c.id+' · Auto renew');input.onchange=()=>{c.autoRenew=input.checked;if(c.status==='Current')current.autoRenew=c.autoRenew;persist();refresh();renderRows()};td.append(input)}else td.textContent=String(v);row.append(td)});const cell=el('td'),b=el('button','Edit');b.onclick=()=>editContract(c.id);const del=el('button','Delete','delete-button');del.onclick=()=>deleteContract(c.id);cell.append(b,document.createTextNode(' '),del);row.append(cell);$('contractRows').append(row)});if(!current.contracts.length)tableEmpty($('contractRows'),7,'No contracts added.')}
function editor(title,specs,onSave){$('modalTitle').textContent=title;$('modalFields').replaceChildren();const inputs={};specs.forEach(s=>{const label=el('label');if(s.wide)label.className='wide';label.append(el('span',s.label,'field-label'));const input=el(s.options?'select':s.type==='textarea'?'textarea':'input');input.id='edit-'+s.key;input.name=s.key;if(s.options)s.options.forEach(v=>input.add(new Option(v===''?'Choose status':v==='Archive'?'Archived':v,v)));else if(s.type!=='textarea')input.type=s.type||'text';else input.rows=6;if(s.type==='checkbox')input.checked=!!s.value;else input.value=s.value??'';if(s.required)input.required=true;if(s.maxLength)input.maxLength=s.maxLength;if(s.placeholder)input.placeholder=s.placeholder;if(s.type==='number'){input.min=0;input.step=s.step||'0.01'}inputs[s.key]=input;label.append(input);$('modalFields').append(label)});$('editForm').onsubmit=e=>{e.preventDefault();const values={};specs.forEach(s=>values[s.key]=s.type==='checkbox'?inputs[s.key].checked:s.type==='number'?Number(inputs[s.key].value):inputs[s.key].value.trim());if(onSave(values,inputs)===false)return;persist();refresh();renderRows();$('modal').close()};$('modal').showModal()}
function editAccount(){
  const r=current,c=currentContract(r);
  const specs=[
    {key:'name',label:'Customer name',value:r.name,required:true,wide:true},
    {key:'address',label:'Customer address',type:'textarea',value:r.address||'',wide:true},
    {key:'postcode',label:'Postcode',value:r.postcode||''},
    {key:'telephone',label:'Customer telephone',type:'tel',value:r.telephone||''},
    {key:'manager',label:'Account manager',value:r.manager,required:true},
    {key:'region',label:'Region',value:r.region,required:true},
    {key:'status',label:'Status',value:r.status==='Implementation'?'':r.status,options:r.status==='Implementation'?['','Active','Archive']:['Active','Archive']},
    {key:'nhsType',label:'NHS type',value:r.nhsType,options:nhsTypes},
    {key:'multipleTrusts',label:'Multiple trusts',type:'checkbox',value:r.multipleTrusts},
    {key:'autoRenew',label:'Auto renew contract',type:'checkbox',value:r.autoRenew},
    ...(c?[{key:'start',label:'Contract start',type:'date',value:c.start,required:true},{key:'end',label:'Current contract end',type:'date',value:c.end,required:true}]:[]),
    {key:'review',label:'Next account review',type:'date',value:r.review}
  ];
  editor('Edit customer details',specs,(v,inputs)=>{
    if(c&&v.end<v.start){inputs.end.setCustomValidity('Contract end must be on or after the start date.');inputs.end.reportValidity();inputs.end.oninput=()=>inputs.end.setCustomValidity('');return false}
    if(!v.status)v.status=r.status;
    if(v.status==='Archive'&&!canArchive({...r,contracts:r.contracts.map(x=>x===c?{...x,end:v.end}:x)}))return rejectInput(inputs.status,archiveMessage);
    Object.assign(r,v);
    if(c)Object.assign(c,{start:v.start,end:v.end,autoRenew:v.autoRenew});
  });
}
function editNotes(){editor('Edit key notes',[{key:'notes',label:'Notes',type:'textarea',value:current.notes,wide:true}],v=>{current.notes=v.notes})}
function editContact(id){const c=current.contacts.find(c=>c.id===id)||{name:'',job:'',email:'',phone:'',main:false,secondary:false,cost:''};editor(id?'Edit contact':'Create new contact',[{key:'name',label:'Full name',value:c.name,required:true},{key:'job',label:'Job title',value:c.job},{key:'email',label:'Email',type:'email',value:c.email},{key:'phone',label:'Phone',type:'tel',value:c.phone},{key:'main',label:'Main contact',type:'checkbox',value:c.main},{key:'secondary',label:'Secondary contact',type:'checkbox',value:c.secondary},{key:'cost',label:'Cost (£)',type:'number',value:c.cost},{key:'userStatus',label:'User Status',value:c.userStatus||'Active',options:['Active','Inactive']}],(v,inputs)=>{if(inputs.cost.value==='')v.cost='';if(id)Object.assign(c,v);else current.contacts.push({id:'C-'+crypto.randomUUID(),...v})})}
function editContract(id){
  const c=current.contracts.find(c=>c.id===id)||{id:current.id+'-'+String(current.contracts.length+1).padStart(3,'0'),start:'',end:'',training:0,autoRenew:false,status:'Draft'};
  editor(id?'Edit contract':'Add contract',[
    {key:'id',label:'Contract ID',value:c.id,required:true},
    {key:'status',label:'Contract status',value:c.status,options:['Draft','Current','Previous']},
    {key:'start',label:'Start date',type:'date',value:c.start,required:true},
    {key:'end',label:'End date',type:'date',value:c.end,required:true},
    {key:'autoRenew',label:'Auto renew',type:'checkbox',value:c.autoRenew}
  ],(v,inputs)=>{
    if(current.contracts.some(x=>x!==c&&x.id===v.id)){inputs.id.setCustomValidity('Use a unique contract ID.');inputs.id.reportValidity();inputs.id.oninput=()=>inputs.id.setCustomValidity('');return false}
    if(v.end<v.start){inputs.end.setCustomValidity('End date must be on or after start date.');inputs.end.reportValidity();inputs.end.oninput=()=>inputs.end.setCustomValidity('');return false}
    if(current.status==='Archive'&&v.status!=='Draft'&&v.end>=todayISO())return rejectInput(inputs.end,'Restore this customer before adding a non-draft contract that ends today or later.');
    if(v.status==='Current'){
      current.contracts.forEach(x=>{if(x!==c&&x.status==='Current')x.status='Previous'});
      Object.assign(current,{start:v.start,end:v.end,autoRenew:v.autoRenew});
    }else if(c.status==='Current'){
      Object.assign(current,{start:'',end:'',autoRenew:false});
    }
    if(id)Object.assign(c,v);else current.contracts.push(v);
  });
}
