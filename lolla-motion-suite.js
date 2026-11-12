
/* LOLLA Premium Motion Suite — selected effects 01,06,07,11,12,13,14,17,19.
   Dependency-free; respects reduced-motion, visibility and touch devices. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
  const smooth = t => t*t*(3-2*t);

  // 06 and 07: content-preserving split word animations (nested italics remain intact).
  const splitWords=(el,mode)=>{
    if(!el||el.dataset.motionPrepared)return;
    el.dataset.motionPrepared='true';
    el.classList.add(mode==='blur'?'lolla-blur-text':'lolla-split-text');
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;while(node=walker.nextNode())if(node.textContent.trim())nodes.push(node);
    let index=0;
    nodes.forEach(textNode=>{
      const parts=textNode.textContent.match(/\s+|[^\s]+/g)||[];
      const fragment=document.createDocumentFragment();
      parts.forEach(part=>{
        if(/^\s+$/.test(part)){fragment.appendChild(document.createTextNode(part));return}
        const span=document.createElement('span');
        span.className='lolla-motion-word';
        span.style.setProperty('--word-index',index++);
        span.textContent=part;
        fragment.appendChild(span);
      });
      textNode.replaceWith(fragment);
    });
  };
  const heroTitle=$('.hero h1');
  splitWords(heroTitle,'blur');
  const titles=$$('.section-head h2,.shop-head h2,.sticker-caption h2,.story-copy h2,.social-head h2,.faq h2,.lolla-stack-heading h2');
  titles.forEach(el=>splitWords(el,'split'));
  const revealTitles=[heroTitle,...titles].filter(Boolean);
  if(reduced||!('IntersectionObserver' in window)){
    revealTitles.forEach(el=>el.classList.add('is-motion-visible'));
  }else{
    const io=new IntersectionObserver(entries=>{
      for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-motion-visible');io.unobserve(e.target)}
    },{threshold:.13,rootMargin:'0px 0px -35px 0px'});
    revealTitles.forEach(el=>io.observe(el));
  }

  // 01: accessible true 3D X-axis flipping display.
  const rotator=$('.lolla-rotator');
  if(rotator){
    const front=$('.lolla-rotate-front',rotator),next=$('.lolla-rotate-next',rotator);
    const labels=['daydreamers','pretty moments','little joys','you ♡'];
    let current=0,working=false,interval=null;
    const step=()=>{
      if(working||reduced)return;
      working=true;const target=(current+1)%labels.length;
      next.textContent=labels[target];
      rotator.classList.add('is-turning');
      setTimeout(()=>{
        current=target;front.textContent=labels[current];
        rotator.setAttribute('aria-label',labels[current]);
        rotator.classList.remove('is-turning');working=false;
      },760);
    };
    if(!reduced&&'IntersectionObserver'in window){
      const io=new IntersectionObserver(entries=>{
        entries.forEach(e=>{
          if(e.isIntersecting&&!document.hidden&&!interval)interval=setInterval(step,3300);
          else if(!e.isIntersecting&&interval){clearInterval(interval);interval=null}
        });
      },{threshold:.1});
      io.observe(rotator);
      document.addEventListener('visibilitychange',()=>{
        if(document.hidden&&interval){clearInterval(interval);interval=null}
      });
    }
  }

  // 12: functional curated stacked collection cards; opening item uses original product modal.
  const stack=$('.lolla-stack-section');
  const stackCards=$$('.lolla-stack-card');
  stack?.addEventListener('click',event=>{
    const target=event.target.closest('[data-view]');
    if(target&&typeof openProduct==='function')openProduct(target.dataset.view);
  });

  // 11: preserve existing cloud/card transform animation by using independent translate property.
  const hero=$('.hero');
  const layers=[
    ['.cloud--one',15,6],['.cloud--two',-12,9],['.cloud--three',8,6],
    ['.sky-puff--left',-13,10],['.sky-puff--right',12,12],
    ['.hero-star',6,13],['.hero-handmade-sticker',-9,11],
    ['.hero-product-card--main',18,4],['.hero-product-card--small',-12,12]
  ].flatMap(([selector,scrollFactor,mouseFactor])=>
    $$(selector,hero||document).map(el=>({el,scrollFactor,mouseFactor})));
  let mouseX=0,mouseY=0,renderMouseX=0,renderMouseY=0,raf=0,lastScroll=window.scrollY;
  const ticker=$('.ticker-track');
  const expand=$('.lolla-expand'), expandMedia=$('.lolla-expand-media'),expandCopy=$('.lolla-expand-copy');
  let lastAt=performance.now(), lastY=window.scrollY,velocity=0,timeout=0;
  const render=()=>{
    raf=0;const nowY=window.scrollY;
    if(!reduced&&hero){
      const box=hero.getBoundingClientRect();
      if(box.bottom>0&&box.top<innerHeight){
        renderMouseX+=(mouseX-renderMouseX)*.09;
        renderMouseY+=(mouseY-renderMouseY)*.09;
        const scrollP=clamp((-box.top)/Math.max(1,box.height));
        layers.forEach(layer=>{
          const dx=renderMouseX*layer.mouseFactor;
          const dy=renderMouseY*layer.mouseFactor+scrollP*layer.scrollFactor;
          layer.el.style.translate=dx.toFixed(1)+'px '+dy.toFixed(1)+'px';
        });
        if(Math.abs(mouseX-renderMouseX)>.008||Math.abs(mouseY-renderMouseY)>.008)raf=requestAnimationFrame(render);
      }
    }
    if(!reduced&&stackCards.length){
      stackCards.forEach((card,i)=>{
        const next=stackCards[i+1];if(!next)return;
        const offset=parseFloat(getComputedStyle(card).top)||100;
        const d=next.getBoundingClientRect().top-offset;
        const p=smooth(clamp(1-d/(innerHeight*.65)));
        card.style.transform='scale('+(1-.057*p).toFixed(3)+')';
        card.style.filter='brightness('+(1-.065*p).toFixed(3)+')';
      });
    }
    if(expand&&expandMedia){
      const bounds=expand.getBoundingClientRect();
      if(bounds.top<innerHeight&&bounds.bottom>0){
        if(reduced){
          expandMedia.style.setProperty('--expand-scale','1');
          expandMedia.style.setProperty('--expand-radius','12px');
          expandCopy.style.setProperty('--expand-text-opacity','1');
          expandCopy.style.setProperty('--expand-text-y','0px');
        } else {
          const p=smooth(clamp((innerHeight*.9-bounds.top)/Math.max(1,bounds.height*.75)));
          expandMedia.style.setProperty('--expand-scale',(.82+.18*p).toFixed(3));
          expandMedia.style.setProperty('--expand-radius',(42-30*p).toFixed(1)+'px');
          expandCopy.style.setProperty('--expand-text-opacity',clamp((p-.25)*2).toFixed(3));
          expandCopy.style.setProperty('--expand-text-y',(30*(1-p)).toFixed(1)+'px');
        }
      }
    }
    lastScroll=nowY;
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(render)};
  if(!reduced&&fine&&hero){
    hero.addEventListener('pointermove',e=>{
      const b=hero.getBoundingClientRect();
      mouseX=clamp((e.clientX-b.left)/b.width,-1,2)-.5;
      mouseY=clamp((e.clientY-b.top)/b.height,-1,2)-.5;
      schedule();
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{mouseX=mouseY=0;schedule()});
  }
  const onScroll=()=>{
    // 14: existing ticker speeds up in response to scrolling, then relaxes gently.
    if(ticker&&!reduced){
      const now=performance.now(),delta=Math.abs(window.scrollY-lastY),dt=Math.max(16,now-lastAt);
      const current=clamp(delta/dt,0,2.4);
      velocity=velocity*.67+current*.33;
      ticker.style.animationDuration=(35/(1+velocity*.82)).toFixed(1)+'s';
      lastY=window.scrollY;lastAt=now;
      clearTimeout(timeout);
      timeout=setTimeout(()=>{velocity=0;ticker.style.animationDuration='35s'},260);
    }
    schedule();
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  schedule();

  // 17: cursor-directed glare on the product card, never obstructing clicks.
  if(fine&&!reduced){
    const grid=$('#productGrid');
    grid?.addEventListener('pointermove',e=>{
      const card=e.target.closest('.product-visual');if(!card)return;
      const rect=card.getBoundingClientRect();
      card.style.setProperty('--glare-x',((e.clientX-rect.left)/rect.width*100).toFixed(1)+'%');
      card.style.setProperty('--glare-y',((e.clientY-rect.top)/rect.height*100).toFixed(1)+'%');
    },{passive:true});
  }

  // 19: delightful, low-cost sparks only on meaningful user actions.
  if(!reduced){
    let activeSparks=0;
    document.addEventListener('click',e=>{
      const trigger=e.target.closest('[data-heart],[data-add],#askForSet,.pill-button--berry,.lolla-stack-open');
      if(!trigger||activeSparks>48)return;
      const r=trigger.getBoundingClientRect();
      const x=e.detail===0?r.left+r.width/2:e.clientX;
      const y=e.detail===0?r.top+r.height/2:e.clientY;
      const colours=['#e49dc4','#b5c2ef','#f5c2d5','#f1d5a7','#c597d5'];
      for(let i=0;i<7;i++){
        const el=document.createElement('span');
        el.className='lolla-spark';
        el.style.setProperty('--sx',x+'px');
        el.style.setProperty('--sy',y+'px');
        const angle=i*Math.PI*2/7;
        const radius=22+(i%3)*10;
        el.style.setProperty('--dx',Math.cos(angle)*radius+'px');
        el.style.setProperty('--dy',Math.sin(angle)*radius-14+'px');
        el.style.setProperty('--spark-color',colours[i%colours.length]);
        document.body.appendChild(el);activeSparks++;
        setTimeout(()=>{el.remove();activeSparks=Math.max(0,activeSparks-1)},760);
      }
    },{passive:true});
  }
})();
