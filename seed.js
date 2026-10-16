const $=id=>document.getElementById(id);
let data;
const regions=['North West','North East & Yorkshire','Midlands','East of England','London','South East','South West'];
const managers=['Morgan Vale','Riley Stone','Avery Reed','Taylor Quinn'];
const places=['Ashford Vale','Birchwood','Cedar Valley','Dalesbridge','Eastmere','Fernborough','Greenhaven','Highbrook','Ivybridge Vale','Juniper Coast','Kingsmere','Larchfield','Meadowbrook','Northhaven','Oakbridge'];
const types=['University Hospitals NHS Foundation Trust','Community Health NHS Trust'];
const items=['Licence received','User accounts requested','User accounts received','Super users defined','Caldicott form received','Access levels defined','Revalidation access','M Share — CCGs','M Share — GP cluster','M Share — Divisional structure','SUS DSA signed and returned','IP data enabled','OP data enabled','A&E data enabled','Initial training date agreed'];

if(!Array.isArray(data)){
  data=places.map((place,i)=>{
    const archived=i>=5&&i<10;
    const end=archived?new Date(Date.UTC(2026,i-4,1)):new Date(Date.UTC(2027,3+i%10,1+(i*7)%27));
    const first=i===0;
    return {
      id:'DEMO'+String(i+1).padStart(3,'0'),
      name:place+' '+types[i%2],
      manager:managers[i%managers.length],
      region:regions[i%regions.length],
      status:i<5?'Active':i<10?'Archived':'Implementation',
      end:end.toISOString().slice(0,10),
      training:2+i%6,
      start:archived?'2025-01-01':'2026-05-01',
      review:'2026-11-'+String(2+i).padStart(2,'0'),
      last:String(18+i*7),
      address:(20+i)+' Example Lane, '+place,
      postcode:'ZZ1 1ZZ',
      telephone:'01632 960'+String(100+i).padStart(3,'0'),
      notes:first?'Synthetic demonstration account. Contract review is planned for November 2026. All names, contact details and figures are illustrative.':'Synthetic demonstration account. All names, contact details and figures are illustrative.',
      checks:items.map((_,j)=>j<(i%16)),
      contacts:first?[
        {id:'C1',name:'Casey Rowan',job:'Information Manager',email:'casey.rowan@example.invalid',phone:'01632 960101',type:'Primary'},
        {id:'C2',name:'Robin Vale',job:'Data Lead',email:'robin.vale@example.invalid',phone:'01632 960102',type:'Secondary'}
      ]:[]
    };
  });
}
