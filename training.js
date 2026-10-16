let selectedTrainingId='',trainingPage=1;
for(const r of data){if(!r.trainingPeriods){const end=r.end||'2027-04-30',d=new Date(end+'T12:00:00Z');d.setUTCFullYear(d.getUTCFullYear()-1);d.setUTCDate(d.getUTCDate()+1);r.trainingPeriods=[{id:'TP-initial',start:d.toISOString().slice(0,10),end,available:Number(r.training)||0,sessions:[]}];r.trainingCurrentId=r.trainingPeriods[0].id}r.trainingCurrentId??=r.trainingPeriods[0]?.id;for(const p of r.trainingPeriods)for(const s of p.sessions){s.hedContact??=s.contact||'';delete s.contact}}
function roundDays(n){return Math.round((n+Number.EPSILON)*100)/100}
function usedDays(p){return roundDays(p.sessions.reduce((n,s)=>n+Number(s.days),0))}
function syncTrainingSummary(r){const p=r.trainingPeriods?.find(p=>p.id===r.trainingCurrentId);r.training=p?roundDays(p.available-usedDays(p)):0;const c=r.contracts.find(c=>c.status==='Current');if(c)c.training=r.training}
function setTrainingRemaining(r,remaining){const p=r.trainingPeriods.find(p=>p.id===r.trainingCurrentId);if(p)p.available=roundDays(Number(remaining)+usedDays(p))}
function trainingPeriod(){return current.trainingPeriods.find(p=>p.id===selectedTrainingId)||current.trainingPeriods.find(p=>p.id===current.trainingCurrentId)||current.trainingPeriods[0]}
function renderTraining(){
  const p=trainingPeriod();
  $('addTrainingButton').disabled=!p;
  $('trainingPeriodRows').replaceChildren();
  if(!p){selectedTrainingId='';tableEmpty($('trainingPeriodRows'),6,'No training periods. Add a period to record training.');$('trainingSessionsSection').classList.add('hide');return}
  selectedTrainingId=p.id;
  [...current.trainingPeriods].sort((a,b)=>b.start.localeCompare(a.start)).forEach(x=>{
    const row=el('tr');if(x.id===p.id)row.className='selected-period';
    const used=usedDays(x);
    [date(x.start)+' – '+date(x.end),x.id===current.trainingCurrentId?'Current':'Historical',Number(x.available).toFixed(2),used.toFixed(2),roundDays(x.available-used).toFixed(2)].forEach(v=>row.append(el('td',String(v))));
    const periodCell=row.firstElementChild,periodButton=el('button',periodCell.textContent,'period-select');
    periodButton.setAttribute('aria-label','Select training period '+periodCell.textContent);
    periodButton.onclick=()=>{selectedTrainingId=x.id;trainingPage=1;$('trainingSearch').value='';renderTraining()};
    periodCell.replaceChildren(periodButton);
    const cell=el('td'),group=el('div',undefined,'action-group'),edit=el('button','Edit'),remove=el('button','Delete','delete-button');
    edit.onclick=()=>{selectedTrainingId=x.id;trainingPage=1;renderTraining();editTrainingPeriod()};
    remove.setAttribute('aria-label','Delete training period '+date(x.start)+' – '+date(x.end));remove.onclick=()=>deleteTrainingPeriod(x.id);
    group.append(edit,remove);cell.append(group);row.append(cell);$('trainingPeriodRows').append(row);
  });
  $('trainingSessionsTitle').textContent='Training days · '+date(p.start)+' – '+date(p.end);
  $('trainingSessionsSection').classList.remove('hide');
  $('trainingPeriodNote').textContent=(p.id===current.trainingCurrentId?'Current period · The balance appears in Overview and the current contract.':'Historical period · Its balance is kept separately.')+' Each training day has its own row. Days remaining is calculated in date order.';
  let balance=Number(p.available);
  const sorted=[...p.sessions].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)).map(s=>{balance=roundDays(balance-s.days);return {...s,balance}});
  const q=$('trainingSearch').value.toLowerCase().trim(),rows=sorted.filter(s=>(s.title+' '+s.hedContact+' '+s.summary).toLowerCase().includes(q));
  const size=Number($('trainingSize').value)||10,pages=Math.max(1,Math.ceil(rows.length/size));
  trainingPage=Math.max(1,Math.min(trainingPage,pages));$('trainingRows').replaceChildren();
  rows.slice((trainingPage-1)*size,trainingPage*size).forEach(s=>{
    const row=el('tr');
    [date(s.date),s.title,s.hedContact||'—',Number(s.days).toFixed(2),s.balance.toFixed(2),s.summary||'—'].forEach(v=>row.append(el('td',String(v))));
    const cell=el('td'),group=el('div',undefined,'action-group'),edit=el('button','Edit'),remove=el('button','Delete','delete-button');
    edit.onclick=()=>editTrainingSession(s.id);remove.setAttribute('aria-label','Delete training day '+s.title);remove.onclick=()=>deleteTrainingSession(p.id,s.id);
    group.append(edit,remove);cell.append(group);row.append(cell);$('trainingRows').append(row);
  });
  if(!rows.length)tableEmpty($('trainingRows'),7,q?'No training days match your search.':'No training days recorded for this period. Use Add training day to record the first day.');
  $('trainingCount').textContent=rows.length?`Showing ${(trainingPage-1)*size+1}–${Math.min(trainingPage*size,rows.length)} of ${rows.length} training days`:'0 training days';
  $('trainingPageLabel').textContent=`Page ${trainingPage} of ${pages}`;$('trainingPrev').disabled=trainingPage===1;$('trainingNext').disabled=trainingPage===pages;
}
function deleteTrainingPeriod(periodId){const owner=current,index=owner.trainingPeriods.findIndex(p=>p.id===periodId);if(index<0)return;const previousCurrent=owner.trainingCurrentId,previousSelected=selectedTrainingId;const [removed]=owner.trainingPeriods.splice(index,1);if(previousCurrent===periodId)owner.trainingCurrentId=owner.trainingPeriods.length?[...owner.trainingPeriods].sort((a,b)=>b.start.localeCompare(a.start))[0].id:'';if(previousSelected===periodId)selectedTrainingId=owner.trainingCurrentId;trainingPage=1;syncTrainingSummary(owner);const saved=persist();refresh();renderRows();const undo=el('button','Undo');undo.onclick=()=>{owner.trainingPeriods.splice(index,0,removed);owner.trainingCurrentId=previousCurrent;syncTrainingSummary(owner);persist();if(current.id===owner.id){selectedTrainingId=previousSelected;refresh();renderRows()}};if(saved)showUndo('Training period deleted.'+(removed.sessions.length?' Its '+removed.sessions.length+' session'+(removed.sessions.length===1?' was':'s were')+' removed.':''),undo)}
function deleteTrainingSession(periodId,sessionId){const owner=current,period=owner.trainingPeriods.find(p=>p.id===periodId),index=period?.sessions.findIndex(s=>s.id===sessionId)??-1;if(index<0)return;const [removed]=period.sessions.splice(index,1);syncTrainingSummary(owner);const saved=persist();refresh();const undo=el('button','Undo');undo.onclick=()=>{period.sessions.splice(index,0,removed);syncTrainingSummary(owner);persist();if(current.id===owner.id)refresh()};if(saved)showUndo('Training session deleted.',undo)}
function rejectInput(input,message){input.setCustomValidity(message);input.reportValidity();input.oninput=()=>input.setCustomValidity('');return false}
function editTrainingSession(id){const p=trainingPeriod(),s=p.sessions.find(s=>s.id===id)||{date:p.start,title:'',days:0.5,hedContact:'',summary:''};editor(id?'Edit training day':'Add training day',[{key:'date',label:'Training date',type:'date',value:s.date,required:true},{key:'title',label:'Title',value:s.title,required:true},{key:'hedContact',label:'HED contact',value:s.hedContact},{key:'days',label:'Days taken',type:'number',value:s.days,required:true},{key:'summary',label:'Summary',type:'textarea',value:s.summary,wide:true}],(v,inputs)=>{if(v.date<p.start||v.date>p.end)return rejectInput(inputs.date,'Choose a date within the selected contract period.');if(v.days<=0)return rejectInput(inputs.days,'Days taken must be greater than zero.');const used=p.sessions.filter(x=>x.id!==id).reduce((n,x)=>n+x.days,0);if(roundDays(used+v.days)>p.available)return rejectInput(inputs.days,'This exceeds the days available. Edit the period allowance first if additional days have been agreed.');if(id)Object.assign(s,v);else p.sessions.push({id:'T-'+crypto.randomUUID(),...v});syncTrainingSummary(current)})}
function editTrainingPeriod(create=false){const p=create?{start:'',end:'',available:0,sessions:[]}:trainingPeriod();editor(create?'Add training period':'Edit training period',[{key:'start',label:'Contract period start',type:'date',value:p.start,required:true},{key:'end',label:'Contract period end',type:'date',value:p.end,required:true},{key:'available',label:'Days available',type:'number',value:p.available,required:true},{key:'isCurrent',label:'Use as current training period',type:'checkbox',value:create?current.trainingPeriods.length===0:p.id===current.trainingCurrentId}],(v,inputs)=>{if(v.end<v.start)return rejectInput(inputs.end,'End date must be on or after the start date.');if(current.trainingPeriods.some(x=>x!==p&&v.start<=x.end&&v.end>=x.start))return rejectInput(inputs.start,'Training periods cannot overlap.');if(v.available<usedDays(p))return rejectInput(inputs.available,'Allowance cannot be lower than days already taken.');if(p.sessions.some(s=>s.date<v.start||s.date>v.end))return rejectInput(inputs.start,'The period must include all its recorded training dates.');if(!create&&p.id===current.trainingCurrentId&&!v.isCurrent)return rejectInput(inputs.isCurrent,'Choose another period as current before unsetting this one.');Object.assign(p,{start:v.start,end:v.end,available:v.available});if(create){p.id='TP-'+crypto.randomUUID();current.trainingPeriods.push(p)}if(v.isCurrent||current.trainingPeriods.length===1)current.trainingCurrentId=p.id;selectedTrainingId=p.id;trainingPage=1;syncTrainingSummary(current)})}
const route=location.hash.match(/^#trust\/(.+)$/);if(route&&data.some(r=>r.id===route[1]))showDetail(route[1]);else showList(['Active','Archived','Implementation'].includes(location.hash.slice(1))?location.hash.slice(1):'Active');
let lastContractDay=new Date().toDateString();
setInterval(()=>{const today=new Date().toDateString();if(today===lastContractDay)return;lastContractDay=today;renderRows();if(!$('detail').classList.contains('hide'))refresh()},60000);

