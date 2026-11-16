// Portfolio hero — silver mist, fine paths and a centered composition.
function cinematicHero(){
  const hero=element("section","mist-hero");
  const atmosphere=element("div","mist-atmosphere");
  atmosphere.setAttribute('aria-hidden','true');
  atmosphere.innerHTML='<div class="mist-cloud mist-cloud-top"></div><div class="mist-cloud mist-cloud-bottom"></div><svg class="mist-paths" viewBox="0 0 1400 760" preserveAspectRatio="none" fill="none"><path d="M0 190H170Q220 190 260 145L330 80M1400 190H1220Q1170 190 1120 140L1060 80M0 530H160Q220 530 260 580L320 640M1400 530H1240Q1180 530 1140 580L1080 640"/><path class="mist-ray" d="M650 470V760M700 500V760M750 470V760"/></svg>';
  const content=element("div","mist-content");
  const badge=element('p','mist-badge',copyText("studioText4"));
  const title=element("h1","mist-title");
  title.append(element('span','',copyText("studioText6")),element('span','mist-title-soft',copyText("studioText7")));
  const description=element('p','mist-description',copyText("studioText8"));
  const actions=element("div","mist-actions");
  actions.append(link('work','mist-primary',copyText("studioText10")),link('about','mist-secondary',copyText("studioText11")));
  content.append(badge,title,description,actions);
  const disciplines=element("div","mist-disciplines");
  const labels=[['01','هويات بصرية','Visual identity','work'],['02','موشن جرافيك','Motion design','ads'],['03','تصميم إبداعي','Creative design','work'],['04','تطوير واجهات','Web development','about']];
  labels.forEach(([number,ar,english,route],i)=>{
    const item=link(route,'mist-discipline discipline-'+i);
    const icon=element("span","discipline-symbol");icon.setAttribute('aria-hidden','true');
    const paths=['M5 18 12 4l7 14ZM8 14h8','m5 6 14 6-14 6ZM4 3v18','M12 3 21 12 12 21 3 12ZM12 7v10M7 12h10','m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16'];
    icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="'+paths[i]+'"/></svg>';
    const label=element('span','discipline-label',t(ar,english));label.append(element('small','',number+' / SIXT0N'));
    item.append(icon,label);disciplines.append(item);
  });
  const foot=element("div","mist-foot");
  const scroll=element('button','mist-scroll',copyText("studioText15"));scroll.type='button';
  scroll.onclick=()=>document.querySelector('.studio-overview')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  foot.append(scroll,element('span','mist-foot-note','DESIGN / DEVELOP / CREATE'));
  hero.append(atmosphere,content,disciplines,foot);
  if(window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches){
    let lastMove=0;
    hero.onpointermove=event=>{
      if(event.timeStamp-lastMove<32)return;
      lastMove=event.timeStamp;
      const rect=hero.getBoundingClientRect();
      hero.style.setProperty('--mist-x',((event.clientX-rect.left)/rect.width-.5)*22+'px');
      hero.style.setProperty('--mist-y',((event.clientY-rect.top)/rect.height-.5)*16+'px');
    };
    hero.onpointerleave=()=>{hero.style.setProperty('--mist-x','0px');hero.style.setProperty('--mist-y','0px');};
  }
  const wrap=element("div","mist-opening");
  const tools=element("div","creative-strip");tools.setAttribute('aria-label',copyText("studioText18"));
  for(const label of ['Photoshop','After Effects','Visual Identity','UI / UX','Development'])tools.append(element('span','',label));
  wrap.append(hero,tools);return wrap;
}
function studioOverview(){
  const section=element('section','studio-shelf');
  const head=element('header','shelf-head');
  head.append(element('h2','',t('من أعمالي','Selected work')),link('work','shelf-more',t('كل الأعمال ↗','All work ↗')));
  const projects=[{
    name:t('هوية رَوِّق','RAWWIQ identity'),
    description:t('من رسم الشعار إلى طباعته على الكوب. استعرض تطبيقات الهوية ومقاسات كل قطعة.','From the first logo sketch to the printed cup. Explore the applications and production dimensions.'),
    image:'assets/rawwiq-hot-cup.jpg',route:'work/rawq',action:t('استعرض الهوية','Explore the identity')
  }];
  const roblox = site.categories.find(category => category.ar.trim().toLowerCase() === 'roblox');
  const robloxWorks = roblox ? items(roblox.id) : [];
  if (robloxWorks.length) {
    projects.unshift({
      name: t('\u0623\u0639\u0645\u0627\u0644 \u0631\u0648\u0628\u0644\u0648\u0643\u0633', 'Roblox artwork'),
      description: t('\u062a\u0635\u0627\u0645\u064a\u0645 Roblox', 'Roblox game thumbnails'),
      image: robloxWorks[0].image,
      route: 'work/' + roblox.id,
      action: t('\u0627\u0641\u062a\u062d \u0627\u0644\u0645\u0639\u0631\u0636', 'Open gallery')
    });
  }
  const thumbnail=site.works.find(work=>work.title==='تحدي النوم مع فارس');
  if(thumbnail)projects.push({
    name:t('تحدي النوم مع فارس','Faris sleep challenge'),
    description:sleepDescription(), comparison:true,
    image:thumbnail.image,route:'work/'+thumbnail.category,action:t('افتح معرض الثامبنيلات','Open the thumbnail gallery')
  });
  const layout=element('div','shelf-layout'), details=element('div','shelf-details'), picker=element('div','shelf-picker');
  picker.setAttribute('role','group');picker.setAttribute('aria-label',t('اختر مشروعًا','Choose a project'));
  const title=element('h3'),description=element('p'),open=element('a','shelf-open'),preview=element('a','shelf-preview'),photo=element('img');
  photo.loading='lazy';preview.append(photo);
  const summary=element('div','shelf-summary');summary.setAttribute('aria-live','polite');summary.append(title,description,open);
  function select(project){
    title.textContent=project.name;description.textContent=project.description;open.textContent=project.action+' ↗';
    open.href=preview.href='#'+project.route;if(project.comparison){preview.replaceChildren(sleepComparison(project.image));}else{photo.src=project.image;photo.alt=project.name;preview.replaceChildren(photo);}
    for(const [index,button] of Array.from(picker.children).entries())button.setAttribute('aria-pressed',String(projects[index]===project));
  }
  for(const project of projects){
    const button=element('button');
    const thumbnail=element('img');thumbnail.alt='';thumbnail.loading='lazy';thumbnail.src=project.image;
    button.append(thumbnail,element('span','',project.name));button.type='button';button.onclick=()=>select(project);picker.append(button);
  }
  select(projects[0]);details.append(picker,summary);layout.append(preview,details);
  const links=element('div','shelf-links'), cv=element('a','',t('سيرتي الذاتية (PDF)','My CV (Arabic PDF)'));
  cv.href='assets/faisal-alatawi-cv.pdf';cv.target='_blank';cv.rel='noopener';
  links.append(link('ads','',t('أعمال الموشن','Motion work')),cv);
  const contact=site.contacts.find(item=>item.type==='whatsapp'&&contactURL(item));
  if(contact){
    const order=element('a','',t('ناقش مشروعك معي ↗','Discuss your project ↗'));
    order.href=contactURL(contact);order.target='_blank';order.rel='noopener';links.append(order);
  }
  section.append(head,layout,links);return section;
}

