let selectedTrainingId='',trainingPage=1;
for(const r of data){if(!r.trainingPeriods){const end=r.end||'2027-04-30',d=new Date(end+'T12:00:00Z');d.setUTCFullYear(d.getUTCFullYear()-1);d.setUTCDate(d.getUTCDate()+1);r.trainingPeriods=[{id:'TP-initial',start:d.toISOString().slice(0,10),end,available:Number(r.training)||0,sessions:[]}];r.trainingCurrentId=r.trainingPeriods[0].id}r.trainingCurrentId??=r.trainingPeriods[0]?.id;for(const p of r.trainingPeriods){p.contractId??=r.contracts.find(c=>c.start===p.start&&c.end===p.end)?.id||(p.id===r.trainingCurrentId?currentContract(r)?.id:'');for(const s of p.sessions){s.hedContact??=s.contact||'';s.location??='';delete s.contact}}}
const isoShift=(value,days)=>{const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)};
const sampleDate=(start,end,fraction)=>{const span=Math.max(0,Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000));return isoShift(start,Math.round(span*fraction))};
let examplesAdded=false;
for(const [index,id] of ['DEMO001','DEMO002','DEMO003'].entries()){
  const r=data.find(x=>x.id===id),c=r?.contracts?.[0],p=r?.trainingPeriods?.[0];
  if(!r||r.demoExamplesVersion||r.contracts.length!==1||r.trainingPeriods.length!==1||p.sessions.length||c.status!=='Current'||Number(p.available)<1.5)continue;
  const oldStart=new Date(c.end+'T12:00:00Z');oldStart.setUTCFullYear(oldStart.getUTCFullYear()-1);oldStart.setUTCDate(oldStart.getUTCDate()+1);
  if(p.end===c.end&&p.start===oldStart.toISOString().slice(0,10))p.start=c.start;
  const activeStart=c.start>p.start?c.start:p.start,activeEnd=c.end<p.end?c.end:p.end;
  if(activeStart>activeEnd)continue;
  if(c.cost==='')c.cost=4200+index*450;
  if(!c.comment)c.comment='Current synthetic service agreement.';
  const previousEnd=isoShift(c.start<p.start?c.start:p.start,-1),previousStart=isoShift(previousEnd,-364);
  r.contracts.unshift({id:id+'-PREV',status:'Previous',start:previousStart,end:previousEnd,accountManager:r.manager,cost:2800+index*350,autoRenew:false,comment:'Completed synthetic service agreement.',training:1.5});
  r.trainingPeriods.push({id:'TP-example-previous',contractId:id+'-PREV',start:previousStart,end:previousEnd,available:3,sessions:[
    {id:'T-example-intro',date:sampleDate(previousStart,previousEnd,.25),title:'Platform introduction',hedContact:'Alex Mercer',location:'Teams',days:.5,summary:'Introduction to access, navigation and standard reports.'},
    {id:'T-example-data',date:sampleDate(previousStart,previousEnd,.62),title:'Data quality workshop',hedContact:'Sam Ellis',location:'On-site',days:1,summary:'Practised validation checks with synthetic examples.'}
  ]});
  const examples=[
    ['Getting started','Alex Mercer','Teams',.5,'Overview of core workflows and user access.'],
    ['Data upload workshop','Sam Ellis','On-site',.5,'Walked through sample upload and validation steps.'],
    ['Reporting refresher','Jordan Hart','Teams',.5,'Built and reviewed example reports.']
  ];
  p.sessions=examples.map(([title,hedContact,location,days,summary],i)=>({id:'T-example-current-'+i,date:sampleDate(activeStart,activeEnd,[.22,.51,.78][i]),title,hedContact,location,days,summary}));
  if(index===0){const nextStart=isoShift(c.end,1),nextEnd=isoShift(nextStart,364);r.contracts.push({id:id+'-NEXT',status:'Draft',start:nextStart,end:nextEnd,accountManager:r.manager,cost:'',autoRenew:false,comment:'Proposed synthetic renewal.',training:0})}
  syncTrainingSummary(r);
  r.demoExamplesVersion=1;examplesAdded=true;
}
function roundDays(n){return Math.round((n+Number.EPSILON)*100)/100}
function usedDays(p){return roundDays(p.sessions.reduce((n,s)=>n+Number(s.days),0))}
function syncTrainingSummary(r){const p=r.trainingPeriods?.find(p=>p.id===r.trainingCurrentId);r.training=p?roundDays(p.available-usedDays(p)):0;const c=r.contracts.find(c=>c.status==='Current');if(c)c.training=r.training}
function setTrainingRemaining(r,remaining){const p=r.trainingPeriods.find(p=>p.id===r.trainingCurrentId);if(p)p.available=roundDays(Number(remaining)+usedDays(p))}
function trainingPeriod(){return current.trainingPeriods.find(p=>p.id===selectedTrainingId)||current.trainingPeriods.find(p=>p.id===current.trainingCurrentId)||current.trainingPeriods[0]}
function historicalTrainingPeriod(p,contract){return p.id!==current.trainingCurrentId||p.end<todayISO()||contract?.status==='Previous'||Boolean(contract?.end&&contract.end<todayISO())}
function renderTraining(){
  const host=$('trainingPeriodRows'),q=$('trainingSearch').value.toLowerCase().trim();host.replaceChildren();
  if(!current.trainingPeriods.length){host.append(el('p','No training periods. Add a period to record training.','record-empty'));return}
  [...current.trainingPeriods].sort((a,b)=>b.start.localeCompare(a.start)).forEach(p=>{
    const contract=current.contracts.find(c=>c.id===p.contractId)||current.contracts.find(c=>c.start===p.start&&c.end===p.end);
    const historical=historicalTrainingPeriod(p,contract);
    const section=el('section',undefined,'training-contract-section');
    const heading=el('div',undefined,'training-contract-heading'),identity=el('div');
    identity.append(el('h3','Contract dates: '+date(contract?.start||p.start)+' – '+date(contract?.end||p.end)));
    const badge=el('span',historical?'Historical':'Current','record-status '+(historical?'status-Previous':'status-Current'));
    const available=Number(p.available);
    const controls=el('div',undefined,'training-contract-controls'),edit=el('button','Edit period'),remove=el('button','Delete period','delete-button');
    edit.disabled=remove.disabled=historical;
    edit.onclick=()=>editTrainingPeriod(false,p.id);remove.onclick=()=>deleteTrainingPeriod(p.id);
    controls.append(badge,edit,remove);heading.append(identity,controls);section.append(heading);
    const daysHead=el('div',undefined,'training-days-heading'),add=el('button','+ Add training day','primary');
    add.disabled=historical;
    if(historical)add.title='Training days cannot be added to a historical contract.';
    add.onclick=()=>editTrainingSession(undefined,p.id);daysHead.append(add);section.append(daysHead);
    const wrap=el('div',undefined,'tablewrap'),table=el('table',undefined,'simple-table training-table'),thead=el('thead'),headerRow=el('tr'),tbody=el('tbody');
    for(const label of ['Training date','Title','HED contact','Location','Days taken','Days remaining','Summary','Action'])headerRow.append(el('th',label));
    thead.append(headerRow);table.append(thead,tbody);wrap.append(table);section.append(wrap);
    let balance=available;
    const rows=[...p.sessions].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)).map(s=>{balance=roundDays(balance-s.days);return {...s,balance}}).filter(s=>(s.title+' '+s.hedContact+' '+s.location+' '+s.summary).toLowerCase().includes(q));
    rows.forEach(s=>{
      const row=el('tr');[date(s.date),s.title,s.hedContact||'—'].forEach(v=>row.append(el('td',String(v))));
      const locationCell=el('td'),locationInput=el('input');
      locationInput.type='text';locationInput.value=s.location||'';locationInput.placeholder='Add location';locationInput.setAttribute('aria-label',s.title+' · Location');
      locationInput.disabled=historical;
      locationInput.oninput=()=>{const source=p.sessions.find(x=>x.id===s.id);source.location=locationInput.value;persist()};
      locationCell.append(locationInput);row.append(locationCell);
      [Number(s.days).toFixed(2),s.balance.toFixed(2),s.summary||'—'].forEach(v=>row.append(el('td',String(v))));
      const cell=el('td'),group=el('div',undefined,'action-group'),editDay=el('button','Edit'),removeDay=el('button','Delete','delete-button');
      editDay.disabled=removeDay.disabled=historical;
      editDay.onclick=()=>editTrainingSession(s.id,p.id);removeDay.setAttribute('aria-label','Delete training day '+s.title);removeDay.onclick=()=>deleteTrainingSession(p.id,s.id);
      group.append(editDay,removeDay);cell.append(group);row.append(cell);tbody.append(row);
    });
    if(!rows.length)tableEmpty(tbody,8,q?'No training days match your search in this contract.':'No training days recorded for this contract.');
    host.append(section);
  });
}
function deleteTrainingPeriod(periodId){const owner=current,index=owner.trainingPeriods.findIndex(p=>p.id===periodId);if(index<0)return;const previousCurrent=owner.trainingCurrentId,previousSelected=selectedTrainingId;const [removed]=owner.trainingPeriods.splice(index,1);if(previousCurrent===periodId)owner.trainingCurrentId=owner.trainingPeriods.length?[...owner.trainingPeriods].sort((a,b)=>b.start.localeCompare(a.start))[0].id:'';if(previousSelected===periodId)selectedTrainingId=owner.trainingCurrentId;trainingPage=1;syncTrainingSummary(owner);const saved=persist();refresh();renderRows();const undo=el('button','Undo');undo.onclick=()=>{owner.trainingPeriods.splice(index,0,removed);owner.trainingCurrentId=previousCurrent;syncTrainingSummary(owner);persist();if(current.id===owner.id){selectedTrainingId=previousSelected;refresh();renderRows()}};if(saved)showUndo('Training period deleted.'+(removed.sessions.length?' Its '+removed.sessions.length+' session'+(removed.sessions.length===1?' was':'s were')+' removed.':''),undo)}
function deleteTrainingSession(periodId,sessionId){const owner=current,period=owner.trainingPeriods.find(p=>p.id===periodId),index=period?.sessions.findIndex(s=>s.id===sessionId)??-1;if(index<0)return;const [removed]=period.sessions.splice(index,1);syncTrainingSummary(owner);const saved=persist();refresh();const undo=el('button','Undo');undo.onclick=()=>{period.sessions.splice(index,0,removed);syncTrainingSummary(owner);persist();if(current.id===owner.id)refresh()};if(saved)showUndo('Training session deleted.',undo)}
function rejectInput(input,message){input.setCustomValidity(message);input.reportValidity();input.oninput=()=>input.setCustomValidity('');return false}
function editTrainingSession(id,periodId){const p=current.trainingPeriods.find(p=>p.id===periodId)||trainingPeriod(),s=p.sessions.find(s=>s.id===id)||{date:p.start,title:'',location:'',days:0.5,hedContact:'',summary:''};editor(id?'Edit training day':'Add training day',[{key:'date',label:'Training date',type:'date',value:s.date,required:true},{key:'title',label:'Title',value:s.title,required:true},{key:'hedContact',label:'HED contact',value:s.hedContact},{key:'location',label:'Location',value:s.location,placeholder:'Enter location',required:true},{key:'days',label:'Days taken',type:'number',value:s.days,required:true},{key:'summary',label:'Summary',type:'textarea',value:s.summary,wide:true}],(v,inputs)=>{if(v.date<p.start||v.date>p.end)return rejectInput(inputs.date,'Choose a date within the selected contract period.');if(v.days<=0)return rejectInput(inputs.days,'Days taken must be greater than zero.');const used=p.sessions.filter(x=>x.id!==id).reduce((n,x)=>n+x.days,0);if(roundDays(used+v.days)>p.available)return rejectInput(inputs.days,'This exceeds the days available. Edit the period allowance first if additional days have been agreed.');if(id)Object.assign(s,v);else p.sessions.push({id:'T-'+crypto.randomUUID(),...v});syncTrainingSummary(current)})}
function editTrainingPeriod(create=false,periodId){
  const p=create?{contractId:'',start:'',end:'',available:0,sessions:[]}:current.trainingPeriods.find(p=>p.id===periodId)||trainingPeriod();
  editor(create?'Add training period':'Edit training period',[
    {key:'contractId',label:'Contract',value:p.contractId||'',options:['',...current.contracts.map(c=>c.id)],placeholder:'Choose contract',required:create},
    {key:'start',label:'Contract period start',type:'date',value:p.start,required:true},
    {key:'end',label:'Contract period end',type:'date',value:p.end,required:true},
    {key:'available',label:'Days available',type:'number',value:p.available,required:true},
    {key:'isCurrent',label:'Use as current training period',type:'checkbox',value:create?current.trainingPeriods.length===0:p.id===current.trainingCurrentId}
  ],(v,inputs)=>{
    if(v.end<v.start)return rejectInput(inputs.end,'End date must be on or after the start date.');
    const contract=current.contracts.find(c=>c.id===v.contractId);
    if(create&&contract&&(v.start<contract.start||v.end>contract.end))return rejectInput(inputs.start,'Choose dates within the selected contract.');
    if(current.trainingPeriods.some(x=>x!==p&&x.contractId===v.contractId&&v.start<=x.end&&v.end>=x.start))return rejectInput(inputs.start,'Training periods for the same contract cannot overlap.');
    if(v.available<usedDays(p))return rejectInput(inputs.available,'Allowance cannot be lower than days already taken.');
    if(p.sessions.some(s=>s.date<v.start||s.date>v.end))return rejectInput(inputs.start,'The period must include all its recorded training dates.');
    if(!create&&p.id===current.trainingCurrentId&&!v.isCurrent)return rejectInput(inputs.isCurrent,'Choose another period as current before unsetting this one.');
    Object.assign(p,{contractId:v.contractId,start:v.start,end:v.end,available:v.available});
    if(create){p.id='TP-'+crypto.randomUUID();current.trainingPeriods.push(p)}
    if(v.isCurrent||current.trainingPeriods.length===1)current.trainingCurrentId=p.id;
    selectedTrainingId=p.id;syncTrainingSummary(current);
  });
  if(create)$('edit-contractId').onchange=()=>{const contract=current.contracts.find(c=>c.id===$('edit-contractId').value);if(contract){$('edit-start').value=contract.start;$('edit-end').value=contract.end}};
}
const route=location.hash.match(/^#trust\/(.+)$/);if(route&&data.some(r=>r.id===route[1]))showDetail(route[1]);else showList(['Active','Archived','Implementation'].includes(location.hash.slice(1))?location.hash.slice(1):'Active');
if(examplesAdded)persist();
let lastContractDay=new Date().toDateString();
setInterval(()=>{const today=new Date().toDateString();if(today===lastContractDay)return;lastContractDay=today;renderRows();if(!$('detail').classList.contains('hide'))refresh()},60000);

