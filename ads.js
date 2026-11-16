const mediaTypes=['video/mp4','video/webm','image/gif','image/webp'];
function mediaTransaction(mode,operation){return new Promise((resolve,reject)=>{const tx=db.transaction('media',mode), r=operation(tx.objectStore('media'));tx.oncomplete=()=>resolve(r.result);tx.onabort=()=>reject(tx.error);tx.onerror=()=>reject(tx.error);});}
let mediaUrls=[];
function clearPlayers(){for(const u of mediaUrls)URL.revokeObjectURL(u);mediaUrls=[];}
async function showPlayer(ad,card){
 const player=element(ad.type?.startsWith('image/')?'img':'video');
 if(player.tagName==='VIDEO'){player.controls=true;player.playsInline=true;player.preload='metadata';if(ad.poster)player.poster=ad.poster;}
 else {player.alt=ad.title;player.loading='lazy';}
 card.prepend(player);
 if(ad.src.startsWith('local:')){
  try{const file=await mediaTransaction('readonly',s=>s.get(ad.src));if(!file)throw Error();if(!player.isConnected)return;const u=URL.createObjectURL(file);mediaUrls.push(u);player.src=u;}catch{player.replaceWith(element('p','','تعذّر تحميل الملف من هذا الجهاز.'));}
 }else player.src=ad.src;
}
function adGallery(){
 const hero=element('section','ad-intro');
 hero.append(element('h1','page-title',copyText('adHeadline')),element('p','intro',copyText('adPitch')));
 const whatsapp=site.contacts.find(c=>c.type==='whatsapp'&&contactURL(c));
 if(whatsapp){
  const order=element('a','button',copyText('adOrder'));
  const url=new URL(contactURL(whatsapp));
  url.searchParams.set('text',copyText('adMessage'));
  order.href=url.href;order.target='_blank';order.rel='noopener noreferrer';decorateWhatsApp(order);hero.append(order);
 }
 main.append(hero);
 const thani={
   title:t('ثَني | المجموعة الكلاسيكية','THANI | The Classic Collection'),
   description:t('شاهد التيشيرت والكاب من كل زاوية في فيلم المجموعة الكلاسيكية.','Explore the signature tee and cap from every angle in the classic collection film.'),
   date:'2026-11-14',type:'video/mp4',src:'assets/thani-film.mp4',poster:'assets/thani-film-poster.jpg'
 };
 main.append(element('h2','section-title',copyText('adExamples')));
 const grid=element('div','ads-grid');main.append(grid);
 for(const ad of [thani,...site.ads].sort((a,b)=>b.date.localeCompare(a.date))){const card=element('article','ad-card');grid.append(card);card.append(element('h2','',ad.title));
 if(ad.style)card.append(element('p','',ad.style));if(ad.description)card.append(element('p','',ad.description));showPlayer(ad,card);if(ad===thani)card.append(thaniProducts());}
}

function thaniProducts(){
  const gallery=element('section','thani-products');
  gallery.append(element('h3','',t('قطع المجموعة','Collection pieces')));
  const list=element('div','thani-product-grid');
  const pieces=[
    ['tee','التيشيرت','T-shirt'],['shorts','الشورت','Shorts'],['shoe','الشوز الكلاسيكي','Classic sneaker'],
    ['cap','الكاب','Cap'],['watch','الساعة','Watch'],['mug','الكوب','Mug']
  ];
  for(const [id,ar,english] of pieces){
    const name=t(ar,english),card=element('a','thani-piece');
    card.href='assets/thani-'+id+'.jpg';card.target='_blank';card.rel='noopener';
    card.setAttribute('aria-label',t('تكبير صورة ','Enlarge photo of ')+name);
    const img=element('img');img.src=card.href;img.alt=name;img.loading='lazy';img.decoding='async';
    const caption=element('span','',name),arrow=element('span','','↗');arrow.setAttribute('aria-hidden','true');
    caption.append(arrow);card.append(img,caption);list.append(card);
  }
  gallery.append(list);return gallery;
}