let site, live=false, logged=false, revision=0, db=null, tab='works', pending=false;
const uid=()=>crypto.randomUUID?.()||Math.random().toString(36).slice(2);
const initialLogo=document.querySelector('.lockup img').getAttribute('src');
const initialIcon=document.querySelector('link[rel=icon]').getAttribute('href');
function copyText(key){const v=site.copy[key]||window.defaultCopy[key];return v[en?1:0]||v[0];}
function defaultSite(){return {brand:'Sixton',logo:'',icon:'',font:'ammon',ads:[],copy:{},categories:window.portfolioCategories,works:window.portfolioWorks.map(w=>({...w,id:w.id||uid()})),contacts:[{id:'wa',type:'whatsapp',label:'واتساب',value:'0562413511'}]};}
async function request(path,obj){
 const r=await fetch('/api/'+path,obj===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
 if(r.status===401 && location.pathname.startsWith('/admin')){location.replace('/admin');throw Error('انتهت الجلسة');}
 if(!r.ok)throw Error(({401:'سجّل الدخول بكلمة المرور الصحيحة.',409:'تغيّرت البيانات من جلسة ثانية. حدّث الصفحة قبل التعديل.',429:'محاولات كثيرة. أعد المحاولة بعد عشر دقائق.',413:'حجم الملفات أكبر من مساحة الحفظ المتاحة.'})[r.status]||'تعذّر الاتصال بالخادم.');
 return r.json();
}
function localDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('sixton-admin-v1',2);r.onupgradeneeded=()=>{for(const name of ['site','media'])if(!r.result.objectStoreNames.contains(name))r.result.createObjectStore(name);};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function bootSite(){
 site=defaultSite();let saved;
 if(location.protocol!=='file:'){try{const v=await request('site');if(Number.isInteger(v.revision)){live=true;logged=v.logged;revision=v.revision;saved=v.data;}}catch{}}
 if(!live){try{db=await localDB();saved=await new Promise((resolve,reject)=>{const r=db.transaction('site').objectStore('site').get('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}catch{}}
 let gallery={categories:site.categories,works:site.works};
 if(live){
   try{gallery=await request('gallery');}
   catch{gallery.loadFailed=true;}
 }
 site={...site,...saved,...gallery};applyState();render();
}
function withEdition(defaults,saved){
 const result={...defaults,...saved};
 if(saved && !saved.editionLoaded){
   const works=result.works.slice(), categories=result.categories.slice();
   for(const w of defaults.works){
     if(!works.some(item=>item.id===w.id)) works.push(w);
     if(!categories.some(c=>c.id===w.category))categories.push(defaults.categories.find(c=>c.id===w.category));
   }
   result.works=works;result.categories=categories;
 }
 result.editionLoaded=true;return result;
}
function applyState(){categories=site.categories;window.portfolioWorks=site.works;}
function paintBrand(){
 document.querySelector('.lockup span').textContent=site.brand;document.querySelector('.lockup').setAttribute('aria-label',site.brand);
 document.querySelector('.lockup img').src=site.logo||initialLogo;
 for(const l of document.querySelectorAll('link[rel=icon],link[rel=apple-touch-icon]'))l.href=site.icon||initialIcon;
 document.documentElement.dataset.font=site.font;
}
function contactURL(c){
 if(c.type==='whatsapp'){let n=c.value.replace(/[\s()+-]/g,'');if(/^05\d{8}$/.test(n))n='966'+n.slice(1);return /^\d{8,15}$/.test(n)?'https://wa.me/'+n:null;}
 try{const u=new URL(c.value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}
}
function decorateWhatsApp(anchor){
 anchor.classList.add('whatsapp-link');
 const icon=element('span','whatsapp-icon');
 icon.setAttribute('aria-hidden','true');
 icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 20.7l1.4-4.8A8.5 8.5 0 1 1 20.5 11.8Z"/><path d="m8.1 7.6 1-.4 1.2 2.5-.9 1.1a8.5 8.5 0 0 0 3.5 3.4l1-.9 2.5 1.2-.3 1c-.3 1-1.5 1.3-2.4 1-3.5-1-6.4-3.9-7.1-6.5-.2-.9.5-2.1 1.5-2.4Z"/></svg>';
 anchor.prepend(icon);
}
function paintFooter(){
 const foot=document.querySelector('#contact');foot.replaceChildren();
 const area=element('div','contact-area');
 if(site.contacts.length)area.append(element('h2','',copyText('contact')));
 const links=element('div','socials');for(const c of site.contacts){const url=contactURL(c);if(!url)continue;
 const a=element('a','social',c.label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.append(element('span','', '↗'));if(c.type==='whatsapp')decorateWhatsApp(a);links.append(a);}
 area.append(links);
 const directory=element('div','footer-directory');
 for(const [key,label] of [['home','3'],['work','4'],['ads','ads'],['about','5']]){
   const entry=link(key,'footer-link',copyText(label));
   const arrow=element('span','','↗');arrow.setAttribute('aria-hidden','true');
   entry.append(arrow);directory.append(entry);
 }
 const signature=link('home','footer-signature',site.brand);
 signature.dir='ltr';foot.append(directory,area,signature);
}
