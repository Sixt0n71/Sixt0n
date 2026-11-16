/* Text reveals preserve Arabic shaping, semantics and natural line wrapping. */
(()=>{
  if(window.sixtonTextMotion)return;window.sixtonTextMotion=true;
  if(!('IntersectionObserver' in window)||!Element.prototype.animate)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const selector='h1,h2,h3,h4,p,li,dt,dd,figcaption,.rawq-eyebrow,.rawq-feature-cta,.back,.button,.mist-primary,.mist-secondary,.discipline-label,.mist-foot-note,.section-kicker';
  const seen=new WeakSet(),pending=new Set(),running=new Map();
  const scope='main,footer';
  function reveal(node,delay=0){
    observer.unobserve(node);pending.delete(node);node.classList.remove('text-reveal-pending');
    if(!node.isConnected||preference.matches)return;
    try{
      const animation=node.animate([{opacity:0,transform:'translateY(28px)',filter:'blur(4px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0px)'}],{duration:900,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
      running.set(node,animation);
      animation.onfinish=animation.oncancel=()=>running.delete(node);
    }catch{/* Text is already visible if animation is unavailable. */}
  }
  const observer=new IntersectionObserver(entries=>{
    const entering=entries.filter(e=>e.isIntersecting&&pending.has(e.target));
    entering.sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    entering.forEach((entry,i)=>reveal(entry.target,Math.min(i,4)*90));
  },{threshold:0,rootMargin:'0px 0px -24px 0px'});
  function scan(){
    for(const node of pending)if(!node.isConnected){observer.unobserve(node);pending.delete(node);}
    for(const [node,animation] of running)if(!node.isConnected)animation.cancel();
    if(preference.matches)return;
    document.querySelectorAll(scope).forEach(root=>root.querySelectorAll(selector).forEach(node=>{
      if(seen.has(node)||!node.textContent.trim()||node.closest('[hidden],[aria-hidden="true"],dialog,.clock-face,.clock-zone'))return;
      // Animate a caption or heading once, never both it and its child text.
      if(node.parentElement?.closest(selector)?.closest(scope))return;
      seen.add(node);pending.add(node);node.classList.add('text-reveal-pending');observer.observe(node);
    }));
  }
  let queued=false;
  const changes=new MutationObserver(records=>{
    if(!records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1)))return;
    if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});
  });
  changes.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('focusin',event=>{
    const node=event.target.closest?.('.text-reveal-pending');
    if(node){observer.unobserve(node);pending.delete(node);node.classList.remove('text-reveal-pending');}
    for(const [target,animation] of running)if(target.contains(event.target))animation.cancel();
  });
  preference.addEventListener('change',()=>{
    if(preference.matches){for(const node of pending){observer.unobserve(node);node.classList.remove('text-reveal-pending');}pending.clear();for(const animation of running.values())animation.cancel();}
    else scan();
  });
  scan();
})();
