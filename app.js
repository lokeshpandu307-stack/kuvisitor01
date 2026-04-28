const USERS = [
  {email:'admin@kaveri.edu', password:'admin123', role:'Admin'},
  {email:'desk@kaveri.edu', password:'desk123', role:'Campus Desk'}
];
const PURPOSES = ['Official Meeting','High-Level Meeting','Vendor / Service Work','Guest / Speaker Visit','Interview / Placement','Delivery / Courier','Research / Collaboration','Other'];
let currentUser = null;
const $ = id => document.getElementById(id);
const todayISO = () => new Date().toISOString().slice(0,10);
const nowTime = () => new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
const store = {
  get visitors(){ return JSON.parse(localStorage.getItem('kv_visitors') || '[]'); },
  set visitors(v){ localStorage.setItem('kv_visitors', JSON.stringify(v)); },
  get attempts(){ return Number(localStorage.getItem('kv_invalid_attempts') || 0); },
  set attempts(v){ localStorage.setItem('kv_invalid_attempts', v); }
};
function toast(msg){ $('toast').textContent=msg; $('toast').classList.add('show'); setTimeout(()=>$('toast').classList.remove('show'),2400); }
function id(prefix='KV'){ const y=new Date().getFullYear(); const n=Math.floor(10000+Math.random()*89999); return `${prefix}-${y}-${n}`; }
function token(){ return 'KVT-' + Math.random().toString(36).slice(2,10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase(); }
function login(){
  const email=$('loginEmail').value.trim().toLowerCase(), pass=$('loginPassword').value.trim();
  const u=USERS.find(x=>x.email===email && x.password===pass);
  if(!u) return toast('Invalid email or password');
  currentUser=u; localStorage.setItem('kv_user', JSON.stringify(u));
  $('loginPage').classList.add('hidden'); $('app').classList.remove('hidden'); $('roleBadge').textContent=u.role;
  initApp();
}
function logout(){ localStorage.removeItem('kv_user'); location.reload(); }
function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  $(page).classList.remove('hidden');
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active', n.dataset.page===page));
  $('pageTitle').textContent = ({dashboard:'Dashboard',register:'Register Visitor',approvals:'Approvals',scan:'QR Scan',visitors:'Visitor Records',reports:'Reports',settings:'Settings'})[page];
  renderAll();
}
function initApp(){
  $('todayText').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  if(!localStorage.getItem('kv_visitors')) seedData(false);
  PURPOSES.forEach(p=>{ const o=document.createElement('option'); o.value=o.textContent=p; $('vPurpose').appendChild(o); });
  $('vDate').value=todayISO(); $('vFrom').value='10:00'; $('vTo').value='12:00'; purposeFields(); renderAll();
}
function seedData(force){
  if(force && !confirm('Reset all demo data?')) return;
  const d=todayISO();
  store.visitors = [
    {visitorId:'KV-2026-00123', token:'KVT-DEMO-00123', name:'Ramesh Kumar', phone:'9876543210', email:'ramesh@email.com', org:'ABC Technologies', purpose:'Official Meeting', extra:'Office work', date:d, from:'10:00', to:'12:00', status:'Approved', entryTime:'', exitTime:'', idCard:'', idReturned:false, desk:'', createdBy:'Admin'},
    {visitorId:'KV-2026-00124', token:'KVT-DEMO-00124', name:'Suresh Reddy', phone:'9848012345', email:'suresh@vendor.com', org:'PowerFix Services', purpose:'Vendor / Service Work', extra:'Electrical maintenance', date:d, from:'09:30', to:'13:00', status:'Inside', entryTime:'09:52 AM', exitTime:'', idCard:'ID-104', idReturned:false, desk:'Main Reception', createdBy:'Campus Desk'},
    {visitorId:'KV-2026-00125', token:'KVT-DEMO-00125', name:'Ananya Sharma', phone:'9123456780', email:'ananya@hrcorp.com', org:'HR Corp', purpose:'Interview / Placement', extra:'Placement discussion', date:d, from:'11:00', to:'14:00', status:'Completed', entryTime:'11:08 AM', exitTime:'12:20 PM', idCard:'ID-099', idReturned:true, desk:'Placement Cell', createdBy:'Admin'},
    {visitorId:'KV-2026-00126', token:'KVT-DEMO-00126', name:'Vikram Singh', phone:'9000011111', email:'vikram@gov.in', org:'Education Dept', purpose:'High-Level Meeting', extra:'Whom to Meet: Dean', date:d, from:'15:00', to:'16:00', status:'Pending', entryTime:'', exitTime:'', idCard:'', idReturned:false, desk:'', createdBy:'Campus Desk'}
  ];
  store.attempts = 0; toast('Demo data ready'); renderAll();
}
function purposeFields(){
  const p=$('vPurpose').value; let html='';
  if(p==='High-Level Meeting') html = `<div class="form-grid"><div><label>Whom to Meet</label><select id="vExtra"><option>Vice-Chancellor</option><option>Dean</option><option>Registrar</option><option>Director</option><option>Other Higher Official</option></select></div><div><label>Department / Office</label><input id="vExtra2" placeholder="VC Office / Dean Office" /></div></div>`;
  else if(p==='Vendor / Service Work') html = `<div class="form-grid"><div><label>Work Type</label><input id="vExtra" placeholder="Electrical / AC / Software / Hardware" /></div><div><label>Company Name</label><input id="vExtra2" placeholder="Vendor company" /></div></div>`;
  else if(p==='Guest / Speaker Visit') html = `<div class="form-grid"><div><label>Event Name</label><input id="vExtra" placeholder="Seminar / Workshop" /></div><div><label>Department</label><input id="vExtra2" placeholder="CSE / Agriculture" /></div></div>`;
  else if(p==='Interview / Placement') html = `<div class="form-grid"><div><label>Company Name</label><input id="vExtra" placeholder="Company" /></div><div><label>HR Contact Optional</label><input id="vExtra2" placeholder="HR name / phone" /></div></div>`;
  else html = `<label>Additional Details</label><input id="vExtra" placeholder="Short description" /><input id="vExtra2" class="hidden" />`;
  $('dynamicFields').innerHTML = html;
}
function checkDuplicate(){
  const phone=$('vPhone').value.trim(), email=$('vEmail').value.trim().toLowerCase();
  const match = store.visitors.find(v => (phone && v.phone===phone) || (email && v.email.toLowerCase()===email));
  const box=$('duplicateAlert');
  if(match){
    box.classList.remove('hidden');
    const visits = store.visitors.filter(v=>v.phone===match.phone || v.email.toLowerCase()===match.email.toLowerCase()).length;
    box.innerHTML = `<b>Existing Visitor Found:</b> ${match.name} • ${visits} previous visit(s). Details can be auto-filled.`;
    if(!$('vName').value) $('vName').value=match.name;
    if(!$('vOrg').value) $('vOrg').value=match.org || '';
  } else box.classList.add('hidden');
}
function clearForm(){ ['vName','vPhone','vEmail','vOrg'].forEach(x=>$(x).value=''); $('vPurpose').value='Official Meeting'; $('vDate').value=todayISO(); $('vFrom').value='10:00'; $('vTo').value='12:00'; $('duplicateAlert').classList.add('hidden'); purposeFields(); }
function registerVisitor(){
  const name=$('vName').value.trim(), phone=$('vPhone').value.trim(), email=$('vEmail').value.trim(), purpose=$('vPurpose').value;
  if(!name || !phone || !email) return toast('Name, phone and email are required');
  const extra1 = $('vExtra') ? $('vExtra').value : ''; const extra2 = $('vExtra2') ? $('vExtra2').value : '';
  const visitor = {visitorId:id(), token:token(), name, phone, email, org:$('vOrg').value.trim(), purpose, extra:[extra1,extra2].filter(Boolean).join(' | '), date:$('vDate').value, from:$('vFrom').value, to:$('vTo').value, status:'Pending', entryTime:'', exitTime:'', idCard:'', idReturned:false, desk:'', createdBy:currentUser.role};
  const all=store.visitors; all.unshift(visitor); store.visitors=all; clearForm(); showPage('approvals'); toast('Visitor registered and sent for approval');
}
function canApprove(v){ return !(v.purpose==='High-Level Meeting' && currentUser.role!=='Admin'); }
function approveVisitor(vid){
  let all=store.visitors; const v=all.find(x=>x.visitorId===vid); if(!v) return;
  if(!canApprove(v)) return toast('High-Level Meeting requires Admin approval only');
  v.status='Approved'; v.approvedBy=currentUser.role; v.approvedAt=new Date().toISOString(); store.visitors=all; renderAll(); toast('Approved. WhatsApp message generated.'); showWhatsApp(v);
}
function rejectVisitor(vid){ let all=store.visitors; const v=all.find(x=>x.visitorId===vid); if(!v) return; v.status='Rejected'; v.rejectedBy=currentUser.role; store.visitors=all; renderAll(); toast('Visitor rejected'); }
function statusBadge(s){ return `<span class="badge ${s.toLowerCase().replaceAll(' ','-')}">${s}</span>`; }
function renderApprovals(){
  const pending=store.visitors.filter(v=>v.status==='Pending');
  $('approvalList').innerHTML = pending.length ? table(['Visitor','Purpose','Date/Time','Rule','Action'], pending.map(v=>[
    `<b>${v.name}</b><br><small>${v.phone}<br>${v.email}</small>`,
    `${v.purpose}<br><small>${v.extra||''}</small>`, `${v.date}<br>${v.from} - ${v.to}`, v.purpose==='High-Level Meeting'?'Admin only':'Admin / Desk',
    `<button class="primary small-btn" onclick="approveVisitor('${v.visitorId}')">Approve</button> <button class="danger small-btn" onclick="rejectVisitor('${v.visitorId}')">Reject</button>`
  ])) : '<p class="muted">No pending approvals.</p>';
}
function renderDashboard(){
  const d=todayISO(), all=store.visitors.filter(v=>v.date===d);
  $('kTotal').textContent=all.length; $('kInside').textContent=all.filter(v=>v.status==='Inside').length; $('kExited').textContent=all.filter(v=>v.status==='Completed').length; $('kPending').textContent=all.filter(v=>v.status==='Pending'||v.status==='Approved').length; $('kInvalid').textContent=store.attempts;
  $('liveTable').innerHTML = table(['Name','Purpose','Status','Entry','Exit'], all.slice(0,6).map(v=>[`<b>${v.name}</b><br><small>${v.visitorId}</small>`, v.purpose, statusBadge(v.status), v.entryTime||'-', v.exitTime||'-']));
  renderPurposeChart(all);
}
function renderPurposeChart(all){
  const counts={}; all.forEach(v=>counts[v.purpose]=(counts[v.purpose]||0)+1); const max=Math.max(1,...Object.values(counts));
  $('purposeChart').innerHTML = Object.entries(counts).map(([k,c])=>`<div class="bar-row"><span>${k}</span><div class="bar"><div style="width:${(c/max)*100}%"></div></div><b>${c}</b></div>`).join('') || '<p class="muted">No data today.</p>';
}
function renderVisitors(){
  const q=($('searchBox')?.value||'').toLowerCase();
  let all=store.visitors.filter(v=>[v.name,v.phone,v.email,v.purpose,v.visitorId].join(' ').toLowerCase().includes(q));
  $('visitorTable').innerHTML = table(['Visitor','Purpose','Date/Time','Status','ID Card','Actions'], all.map(v=>[
    `<b>${v.name}</b><br><small>${v.visitorId}<br>${v.phone}<br>${v.email}</small>`, `${v.purpose}<br><small>${v.extra||''}</small>`, `${v.date}<br>${v.from} - ${v.to}`, statusBadge(v.status), v.idCard || '-',
    `<button class="ghost small-btn" onclick="previewPass('${v.visitorId}');showPage('scan')">Pass</button> <button class="ghost small-btn" onclick="showWhatsAppById('${v.visitorId}')">WhatsApp</button>`
  ]));
}
function table(headers, rows){
  return `<table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function makeQR(str){
  let bits=''; for(let i=0;i<81;i++){ bits += ((str.charCodeAt(i%str.length)+i*7)%3===0) ? '<i></i>' : '<span></span>'; }
  return `<div class="qr">${bits}</div>`;
}
function passHTML(v){
  return `<div class="pass-card"><div class="pass-head"><img src="assets/kaveri-logo.png" alt="logo"><h2>Official Visitor Pass</h2><p>Valid only for selected date & time</p></div><div class="pass-body"><div class="pass-title"><b>${v.name}</b>${statusBadge(v.status)}</div>${makeQR(v.token)}<div class="pass-row"><span>Visitor ID</span><b>${v.visitorId}</b></div><div class="pass-row"><span>Phone</span><b>${v.phone}</b></div><div class="pass-row"><span>Email</span><b>${v.email}</b></div><div class="pass-row"><span>Purpose</span><b>${v.purpose}</b></div><div class="pass-row"><span>Date</span><b>${v.date}</b></div><div class="pass-row"><span>Time</span><b>${v.from} - ${v.to}</b></div><div class="pass-row"><span>Scan</span><b>Campus Desk</b></div><small class="muted">Token: ${v.token}</small></div></div>`;
}
function previewPass(vid){ const v=store.visitors.find(x=>x.visitorId===vid); $('passPreview').innerHTML = v ? passHTML(v) : 'Pass not found'; $('scanInput').value = v?.visitorId || ''; }
function scanPass(){
  const val=$('scanInput').value.trim(); if(!val) return toast('Enter Visitor ID or token');
  let all=store.visitors; const v=all.find(x=>x.visitorId===val || x.token===val);
  if(!v){ store.attempts=store.attempts+1; $('scanResult').innerHTML=`<div class="scan-result scan-invalid"><h3>❌ INVALID PASS</h3><p>Reason: Fake / unknown QR token.</p></div>`; renderAll(); return; }
  previewPass(v.visitorId);
  const today=todayISO();
  if(v.status==='Rejected' || v.status==='Pending'){ store.attempts=store.attempts+1; $('scanResult').innerHTML=`<div class="scan-result scan-invalid"><h3>❌ INVALID PASS</h3><p>Reason: ${v.status}. Approval required.</p></div>`; store.visitors=all; renderAll(); return; }
  if(v.date!==today){ store.attempts=store.attempts+1; $('scanResult').innerHTML=`<div class="scan-result scan-invalid"><h3>❌ INVALID PASS</h3><p>Reason: Wrong date. Valid on ${v.date}.</p></div>`; renderAll(); return; }
  if(v.status==='Approved'){
    $('scanResult').innerHTML=`<div class="scan-result scan-valid"><h3>✅ VALID PASS</h3><p>${v.name} is approved. Issue visitor ID card and mark entry.</p><input id="idCardNo" placeholder="Enter ID Card No. e.g., ID-108"><button class="primary" onclick="markEntry('${v.visitorId}')">Give ID Card & Mark Entry</button></div>`; return;
  }
  if(v.status==='Inside'){
    $('scanResult').innerHTML=`<div class="scan-result scan-warning"><h3>🟡 ALREADY ENTERED</h3><p>Entry Time: ${v.entryTime}. Use below button when visitor exits.</p><button class="primary" onclick="markExit('${v.visitorId}')">Collect ID & Mark Exit</button></div>`; return;
  }
  if(v.status==='Completed'){
    $('scanResult').innerHTML=`<div class="scan-result scan-invalid"><h3>❌ PASS ALREADY USED</h3><p>Visit completed at ${v.exitTime}. QR expired after exit.</p></div>`; return;
  }
}
function markEntry(vid){
  let all=store.visitors; const v=all.find(x=>x.visitorId===vid); if(!v) return;
  const idNo=$('idCardNo').value.trim(); if(!idNo) return toast('Enter ID Card number');
  v.status='Inside'; v.entryTime=nowTime(); v.idCard=idNo; v.desk=currentUser.role; store.visitors=all; renderAll(); scanPass(); toast('Entry recorded and ID issued');
}
function markExit(vid){
  let all=store.visitors; const v=all.find(x=>x.visitorId===vid); if(!v) return;
  v.status='Completed'; v.exitTime=nowTime(); v.idReturned=true; store.visitors=all; renderAll(); scanPass(); toast('Exit recorded and ID returned');
}
function whatsappText(v){
  return `Hello ${v.name},\n\nYour visitor pass for Kaveri University has been approved.\n\n🆔 Visitor ID: ${v.visitorId}\n📅 Date: ${v.date}\n⏰ Time: ${v.from} – ${v.to}\n📌 Purpose: ${v.purpose}\n\n🔗 View Your Pass:\nhttps://kaveri-pass.vercel.app/${v.visitorId}\n\nPlease present the QR code at the campus desk upon arrival.\n\nThank you,\nKaveri University`;
}
function showWhatsApp(v){
  const msg=whatsappText(v); const link=`https://wa.me/91${v.phone}?text=${encodeURIComponent(msg)}`;
  $('approvalList').insertAdjacentHTML('afterbegin', `<div class="whatsapp"><b>WhatsApp Message Preview</b>\n\n${msg}\n\n<a target="_blank" href="${link}">Open WhatsApp Send Link</a></div>`);
}
function showWhatsAppById(vid){ const v=store.visitors.find(x=>x.visitorId===vid); if(!v) return; alert(whatsappText(v)); }
function renderReports(){
  const all=store.visitors.filter(v=>v.date===todayISO());
  $('reportSummary').innerHTML = table(['Metric','Value'], [['Total Visitors', all.length], ['Inside', all.filter(v=>v.status==='Inside').length], ['Completed', all.filter(v=>v.status==='Completed').length], ['Pending/Approved', all.filter(v=>v.status==='Pending'||v.status==='Approved').length], ['Invalid Attempts', store.attempts]]);
}
function downloadCSV(){
  const all=store.visitors.filter(v=>v.date===todayISO());
  const headers=['Visitor ID','Name','Phone','Email','Organization','Purpose','Date','From','To','Status','Entry Time','Exit Time','ID Card','ID Returned','Desk'];
  const rows=all.map(v=>[v.visitorId,v.name,v.phone,v.email,v.org,v.purpose,v.date,v.from,v.to,v.status,v.entryTime,v.exitTime,v.idCard,v.idReturned,v.desk]);
  const csv=[headers,...rows].map(r=>r.map(x=>`"${String(x||'').replaceAll('"','""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='kaveri-visitor-report.csv'; a.click();
}
function printReport(){ window.print(); }
function renderAll(){ if(!$('app') || $('app').classList.contains('hidden')) return; renderDashboard(); renderApprovals(); renderVisitors(); renderReports(); }
window.addEventListener('load',()=>{ const saved=localStorage.getItem('kv_user'); if(saved){ currentUser=JSON.parse(saved); $('loginPage').classList.add('hidden'); $('app').classList.remove('hidden'); $('roleBadge').textContent=currentUser.role; initApp(); } });
