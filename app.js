const main = document.querySelector('main');
const nav = document.querySelector('nav');
const language = document.querySelector('#language');
let en = false;
const menuToggle=document.createElement('button');
menuToggle.className='menu-toggle';menuToggle.type='button';
menuToggle.innerHTML='<i></i><i></i>';
nav.id='primary-navigation';menuToggle.setAttribute('aria-controls',nav.id);
document.querySelector('.nav-settings').append(menuToggle);
function closeMenu(){document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label',en?'Open menu':'فتح القائمة');}
menuToggle.onclick=()=>{const open=document.body.classList.toggle('menu-open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?(en?'Close menu':'إغلاق القائمة'):(en?'Open menu':'فتح القائمة'));if(open)window.sixtonReplayNavigation?.();};
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();menuToggle.focus();}});
window.addEventListener('resize',()=>{if(window.innerWidth>700)closeMenu();});
const t = (ar, english) => en ? english : ar;
let categories = window.portfolioCategories;
function element(tag, cls, value) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (value !== undefined) node.textContent = value;
  return node;
}
function link(hash, cls, label) {
  const a = element('a', cls, label); a.href = '#' + hash; return a;
}
function items(id) {
  return window.portfolioWorks.filter(work => work.category === id && work.image);
}
function title(cat) { return en ? cat.en || cat.ar : cat.ar; }
function isSleepThumbnail(work) {
  return work.title === 'تحدي النوم مع فارس';
}
function sleepDescription() {
  return t('هنا تشوفون كيف اشتغلت على ثامبنيل «تحدي النوم». على اليمين اللقطة قبل، وعلى اليسار ضفت المخدة والبطانية واخترت الأصفر للعنوان عشان يبان حتى لو شفتوه من الجوال.',
    'On the right is the starting shot. On the left, I added the pillow and duvet and chose yellow for the title so it reads clearly on a phone.');
}
function sleepComparison(src) {
  const pair=element('div','sleep-comparison');
  for (const [stage,ar,english] of [['before','قبل','BEFORE'],['after','بعد','AFTER']]) {
    const panel=element('div','sleep-panel '+stage);
    const crop=element('div','sleep-crop');
    const img=element('img'); img.src=src; img.alt=t('تحدي النوم '+ar+' التعديل','Sleep challenge '+stage+' editing'); img.loading='lazy';
    crop.append(img);
    panel.append(element('span','sleep-label',ar),crop,element('span','sleep-english',english));
    pair.append(panel);
  }
  return pair;
}
function photo(item, cls) {
  if(isSleepThumbnail(item)) return sleepComparison(item.image);
  const img = element('img', cls); img.src=item.image; img.alt=item.title || ''; img.loading='lazy'; return img;
}
function archive(parent) {
  const featured=element('div','featured-projects');
  rawqFeature(featured);thaniFeature(featured);parent.append(featured);
  if(site.loadFailed){
    parent.append(element('p','empty',t('تعذّر تحميل الأعمال. حدّث الصفحة للمحاولة مرة ثانية.','Could not load the gallery. Refresh to try again.')));
    return;
  }
  if(!categories.length) return;
  const grid=element('div','cards');
  for(const cat of categories) {
    const list=items(cat.id), card=link('work/'+cat.id,'card');
    const cover=element('div','cover');
    if(list.length) cover.append(photo(list[0],'cover-img'));
    else {
      const motif=element('span','motif '+cat.id);
      motif.setAttribute('aria-hidden','true');
      motif.append(element('i'),element('b'),element('em')); cover.append(motif);
    }
    const bar=element('div','card-bar');
    bar.append(element('h3','',title(cat)),element('span','arrow','↗'));
    card.append(cover,bar);
    if(list.length && isSleepThumbnail(list[0])) card.append(element('p','sleep-description',sleepDescription()));
    grid.append(card);
  }
  parent.append(grid);
}
let clockTimer;
function localClock(){
  const clock=element('section','local-clock');
  const face=element('time','clock-face');
  face.dir='ltr';
  const zone=element('span','clock-zone');
  const ring=element('i','clock-ring');ring.setAttribute('aria-hidden','true');
  const label=t('توقيتك المحلي','Your local time');
  clock.setAttribute('aria-label',label);
  clock.append(ring,element('span','clock-label',label),face,zone);
  const locale=en?'en-GB':'ar';
  const pad=value=>String(value).padStart(2,'0');
  let lastOffset;
  function tick(){
    const now=new Date();
    face.textContent=[now.getHours(),now.getMinutes(),now.getSeconds()].map(pad).join(':');
    face.dateTime=face.textContent;
    const offset=-now.getTimezoneOffset();
    if(offset!==lastOffset){
      const region=new Intl.DateTimeFormat(locale,{timeZoneName:'long'});
      const name=region.formatToParts(now).find(part=>part.type==='timeZoneName')?.value || region.resolvedOptions().timeZone;
      const minutes=Math.abs(offset);
      const utc='UTC'+(offset<0?'-':'+')+pad(Math.floor(minutes/60))+':'+pad(minutes%60);
      const code=element('bdi','',utc);code.dir='ltr';
      zone.dir=en?'ltr':'rtl';
      zone.replaceChildren(name+' · ',code);
      lastOffset=offset;
    }
    clockTimer=setTimeout(tick,1000-now.getMilliseconds());
  }
  tick();return clock;
}
function render() {
  closeMenu();
  clearTimeout(clockTimer);
  const [page,id]=location.hash.slice(1).split('/');
  const current=['about','work','ads'].includes(page)?page:'home';
  document.body.dataset.page=current;
  nav.replaceChildren();
  for(const [key,label] of [['home',copyText("3")],['work',copyText("4")],['ads',copyText('ads')],['about',copyText("5")]]) {
    const a=link(key,'nav-link');
    const icon=element('span','route-icon');icon.setAttribute('aria-hidden','true');
    const routePaths={"home":"M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9","work":"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z","ads":"M4 4h16v16H4zM10 8l6 4-6 4z","about":"M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2"};
    icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="'+routePaths[key]+'"/></svg>';
    a.append(icon,element('span','',label));
    if(key===current)a.setAttribute('aria-current','page');
    nav.append(a);
  }
  window.rawqDispose?.();window.rawqDispose=null;
  clearPlayers();main.replaceChildren();
  paintBrand();
  paintFooter();
  if(current==='work' && id==='thani'){thaniCaseStudy();document.title='ثَني — '+site.brand;return;}
  if(current==='work' && id==='rawq'){rawqCaseStudy();document.title=(en?'RAWQ — Coffee identity':'رَوِّق — هوية كوفي')+' — '+site.brand;return;}
  if(current==='ads'){adGallery();document.title=copyText('ads')+' — '+site.brand;return;}
  if(current==='home'){
    main.append(cinematicHero());
    main.append(studioOverview(),element('h2','section-title',copyText("11")));archive(main);
    main.append(localClock());
  } else if(current==='about'){
    const bio=element('article','bio-page');
    bio.append(element('h1','page-title',copyText("13")),element('p','bio-opening',copyText("14")),element('p','bio-body',copyText("15")));
    const cv=element('a','button',t('عرض سيرتي الذاتية (PDF)','View my CV (Arabic PDF)'));
    cv.href='assets/faisal-alatawi-cv.pdf';
    cv.target='_blank';
    cv.rel='noopener';
    bio.append(cv);
    const inquiry=element('section','bio-inquiry');
    inquiry.append(element('h2','',copyText('projectTitle')),element('p','',copyText('offer')));
    const wa=site.contacts.find(c=>c.type==='whatsapp'&&contactURL(c));
    if(wa){
      const order=element('a','button',copyText('projectButton'));
      order.href=contactURL(wa);order.target='_blank';order.rel='noopener noreferrer';decorateWhatsApp(order);inquiry.append(order);
    }else inquiry.append(link('work','button',copyText("10")));
    bio.append(inquiry);main.append(bio);
  } else {
    const cat=categories.find(c=>c.id===id);
    main.append(link(cat?'work':'home','back',cat?copyText("16"):copyText("12")),element('h1','page-title',cat?title(cat):copyText("17")));
    if(!cat) {
      main.append(element('p','bio-body',t(
        'هنا تشوفون جانب من شغلي. بعض التصاميم أفكار شخصية جرّبتها عشان أشارككم أسلوبي، وبعضها نفّذته بطلب من عملاء.',
        'Some of these designs started as personal ideas I wanted to explore. Others were commissioned by clients. Together, they give you a sense of my work.'
      )));
      archive(main);
    }
    else {
      const list=items(cat.id), grid=element('div','gallery');
      for(const work of list){const figure=element('figure');figure.append(photo(work,'work-img'));if(work.title)figure.append(element('figcaption','',work.title));if(isSleepThumbnail(work))figure.append(element('p','sleep-description',sleepDescription()));grid.append(figure);}
      main.append(list.length?grid:element('p','empty',copyText("19")));
    }
  }
  document.title=(main.querySelector('h1')?.innerText.replace(/\n/g,' ') || 'Sixton')+' — '+site.brand;
}
language.onclick=()=>{en=!en;document.documentElement.dir=en?'ltr':'rtl';document.documentElement.lang=en?'en':'ar';language.textContent=en?'ع':'EN';language.setAttribute('aria-label',copyText("20"));render();};
window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true});window.scrollTo(0,0);});
bootSite();









/* SIXTON_TEXT_MOTION_BUNDLE */
(()=>{
  if(window.sixtonTypewriter)return;window.sixtonTypewriter=true;
  if(!('IntersectionObserver' in window))return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const selector='h1,h2,h3,h4,p,li,dt,dd,figcaption,.nav-link,.rawq-eyebrow,.rawq-feature-cta,.back,.button,.mist-primary,.mist-secondary,.discipline-label,.mist-foot-note,.section-kicker,main button:not(.rawq-image-open):not(.rawq-close)';
  const seen=new WeakSet(),states=new Map();let frame=0;
  const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
  const characters=text=>segmenter?Array.from(segmenter.segment(text),part=>part.segment):Array.from(text);
  function finish(node,state){observer.unobserve(node);for(const word of state.words)if(word.box.isConnected)word.box.replaceWith(document.createTextNode(word.text));for(const run of [...node.querySelectorAll('tw-run')].reverse())run.replaceWith(...run.childNodes);node.classList.remove('is-typing');states.delete(node);}
  function tick(now){frame=0;for(const [node,state] of states){if(!node.isConnected){observer.unobserve(node);states.delete(node);continue;}if(state.start===null)continue;if(document.hidden || document.fonts?.status === 'loading'){ state.lastFrame = null; continue; }
      if(now<state.start)continue;
      // Count visible frame time so background tabs and font loading cannot consume the entrance.
      state.elapsed = (state.elapsed || 0) + (state.lastFrame == null ? 0 : Math.min(64,now-state.lastFrame));
      state.lastFrame=now;
      const count=Math.min(state.total,Math.floor(state.elapsed/state.duration*state.total));let remaining=count;for(const word of state.words){const n=Math.max(0,Math.min(word.chars.length,remaining));if(n!==word.shown){word.ink.textContent=word.chars.slice(0,n).join('');word.shown=n;}remaining-=word.chars.length;}if(count===state.total)finish(node,state);}
    if([...states.values()].some(s=>s.start!==null))frame=requestAnimationFrame(tick);
  }
  const observer=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top).forEach((entry,i)=>{const state=states.get(entry.target);if(!state)return;observer.unobserve(entry.target);state.start=performance.now()+Math.min(i,3)*100;entry.target.classList.add('is-typing');});if(!frame)frame=requestAnimationFrame(tick);},{threshold:0,rootMargin:'0px 0px -12px 0px'});
  function prepare(node,force=false){
    if(seen.has(node)||!node.textContent.trim()||node.closest('[hidden],[aria-hidden="true"],dialog,.clock-face,.clock-zone')||(!force&&getComputedStyle(node).visibility==='hidden'))return;
    if(node.parentElement?.closest(selector)?.closest('main,footer,nav'))return;
    seen.add(node);const nodes=[];const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT,{acceptNode(text){return text.textContent.trim()&&!text.parentElement.closest('svg,style,script,tw-word,[aria-hidden="true"]')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});while(walker.nextNode())nodes.push(walker.currentNode);
    const words=[];for(const textNode of nodes){const fragment=document.createDocumentFragment();for(const text of textNode.textContent.split(/(\s+)/)){if(!text)continue;if(/^\s+$/.test(text)){fragment.append(document.createTextNode(text));continue;}const box=document.createElement('tw-word'),source=document.createElement('tw-source'),ink=document.createElement('tw-ink');source.textContent=text;ink.setAttribute('aria-hidden','true');box.append(source,ink);fragment.append(box);words.push({box,ink,text,chars:characters(text),shown:0});}const run=document.createElement("tw-run");run.append(fragment);textNode.replaceWith(run);}
    if(!words.length)return;const total=words.reduce((n,w)=>n+w.chars.length,0);states.set(node,{words,total,start:null,duration:Math.min(2450,Math.max(node.matches("h1") ? 1450 : 500,total*29))});observer.observe(node);
  }
  function scan(){for(const [node,state] of states)if(!node.isConnected){observer.unobserve(node);states.delete(node);}if(reduce.matches)return;document.querySelectorAll('main,footer,nav').forEach(root=>root.querySelectorAll(selector).forEach(node=>prepare(node)));}
  let queued=false;const changes=new MutationObserver(records=>{if(!records.some(r=>r.type==='attributes'||[...r.addedNodes].some(n=>n.nodeType===1&&!/^TW-/.test(n.tagName))))return;if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});});changes.observe(document.body,{childList:true,subtree:true});window.sixtonReplayNavigation=()=>{if(reduce.matches)return;document.querySelectorAll('nav .nav-link').forEach((node,i)=>{const old=states.get(node);if(old)finish(node,old);seen.delete(node);prepare(node,true);const state=states.get(node);if(state){observer.unobserve(node);state.start=performance.now()+i*100;node.classList.add('is-typing');}});if(!frame)frame=requestAnimationFrame(tick);};document.addEventListener('focusin',event=>{for(const [node,state] of states)if(node.contains(event.target))finish(node,state);});
  reduce.addEventListener('change',()=>{if(reduce.matches){for(const [node,state] of states)finish(node,state);if(frame)cancelAnimationFrame(frame);frame=0;}else scan();});scan();
})();






/* VISITOR_CARD_REVEALS */
/* Shared visitor experience: no account, device or saved preference is required. */
(()=>{
  if(!('IntersectionObserver' in window)||!Element.prototype.animate)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),seen=new WeakSet(),pending=new Set(),active=new Set();
  const selector='main .card,main .ad-card,main .rawq-feature,main .rawq-figure,main .gallery>figure,main .bio-inquiry,main .shelf-head,main .shelf-preview,main .shelf-details,main .mist-discipline,main .shelf-links,main .creative-strip,main .bio-section';
  const observer=new IntersectionObserver(entries=>{
    entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top).forEach((entry,i)=>{const node=entry.target;observer.unobserve(node);pending.delete(node);node.dataset.scrollReveal='done';if(reduce.matches)return;const animation=node.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:Math.min(i,3)*85,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});active.add(animation);animation.onfinish=animation.oncancel=()=>active.delete(animation);});
  },{threshold:0,rootMargin:'0px 0px -20px 0px'});
  function scan(){for(const node of pending)if(!node.isConnected){observer.unobserve(node);pending.delete(node);}if(reduce.matches)return;document.querySelectorAll(selector).forEach(node=>{if(seen.has(node))return;seen.add(node);pending.add(node);node.dataset.scrollReveal='pending';observer.observe(node);});}
  const changes=new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&!/^TW-/.test(n.tagName))))scan();});changes.observe(document.querySelector('main'),{childList:true,subtree:true});
  document.addEventListener('focusin',event=>{const node=event.target.closest?.('[data-scroll-reveal="pending"]');if(node){observer.unobserve(node);pending.delete(node);node.dataset.scrollReveal='done';}});
  reduce.addEventListener('change',()=>{if(reduce.matches){for(const node of pending){observer.unobserve(node);node.dataset.scrollReveal='done';}pending.clear();for(const animation of active)animation.cancel();}else scan();});scan();
})();

function thaniFeature(parent){
  const card=link('work/thani','rawq-feature');
  const image=element('img');image.src='assets/thani-sheet-mug.jpg';image.alt=t('كوب ثَني بجانب رسم المقاسات','THANI mug and dimension drawing');image.loading='lazy';
  const copy=element('div','rawq-feature-copy');
  copy.append(element('span','rawq-eyebrow',t('مجموعة منتجات / دراسة تصميم','PRODUCT COLLECTION / DESIGN STUDY')),element('h2','','ثَني'),element('p','',t('ست قطع بالأبيض والأسود، من الغرزة الأولى إلى الشكل النهائي.','Six monochrome pieces, from stitch to finished form.')),element('span','rawq-feature-cta',t('استعرض المشروع ↗','Explore project ↗')));
  card.append(image,copy);parent.append(card);
}
function thaniCaseStudy(){
  const page=element('article','rawq-case'),intro=element('header','rawq-intro');
  page.append(link('work','back',t('كل الأعمال','All work')));
  intro.append(element('h1','','ثَني'),element('p','rawq-summary',t('جمعنا القطع الست حول غرزة مائلة تتكرر على القماش والجلد والخزف. في كل لوحة تشوف النتيجة على اليسار، وعلى اليمين الرسم ومقاسات القطعة.','A diagonal stitch connects six pieces across fabric, leather and ceramic. Each sheet pairs the finished piece on the left with its dimensioned drawing on the right.')));
  const film=element('video','thani-campaign-film');
  film.controls=true;film.playsInline=true;film.preload='metadata';
  film.setAttribute('aria-label',t('إعلان ثَني — التيشيرت والكاب بدوران كامل','THANI film — a full rotation of the tee and cap'));
  film.width=1280;film.height=720;film.poster='assets/thani-film-poster.jpg';film.src='assets/thani-film.mp4';

  const gallery=element('div','rawq-project-gallery');
  page.append(intro,film,element('p','rawq-dimension-note',t('الأبعاد مقاسات تصميمية مقترحة، وتُراجع على العيّنة قبل التصنيع.','These are proposed design dimensions, to be checked against a physical sample before production.')),gallery);
  const pieces=[
    ['tee','التيشيرت','T-shirt','مقاس M · عرض الصدر مفرودًا 52 سم، والطول 70 سم','Size M · flat chest 52 cm, length 70 cm'],
    ['shorts','الشورت','Shorts','مقاس M · عرض الخصر مفرودًا 36 سم، والطول الجانبي 42 سم','Size M · flat waist 36 cm, outseam 42 cm'],
    ['shoe','الشوز الكلاسيكي','Classic sneaker','طول النعل الخارجي 29 سم، وسماكته عند الكعب 2.5 سم','Outsole 29 cm, heel sole thickness 2.5 cm'],
    ['cap','الكاب','Cap','ارتفاع التاج 12 سم، وبروز الحافة 7 سم','Crown height 12 cm, visor projection 7 cm'],
    ['watch','الساعة','Watch','قطر الهيكل 40 مم، وعرض السير 20 مم','Case diameter 40 mm, strap width 20 mm'],
    ['mug','الكوب','Mug','قطر الفوهة 82 مم، والارتفاع 95 مم','Rim diameter 82 mm, height 95 mm']
  ];
  for(const [id,ar,english,dims,englishDims] of pieces){
    const label=t(ar,english),figure=element('figure','rawq-figure'),button=element('button','rawq-image-open');
    button.type='button';button.setAttribute('aria-label',t('تكبير لوحة ','Enlarge sheet: ')+label);
    const img=element('img');img.src='assets/thani-sheet-'+id+'.jpg';img.alt=label+' — '+t(dims,englishDims);img.loading='lazy';
    button.append(img,element('span','rawq-enlarge','↗'));button.onclick=()=>rawqLightbox(img.src,label);
    const caption=element('figcaption');caption.append(element('h2','',label),element('span','',t(dims,englishDims)));
    figure.append(button,caption);gallery.append(figure);
  }
  main.append(page);
  window.rawqDispose=()=>document.querySelector('.rawq-lightbox')?.close();
}
