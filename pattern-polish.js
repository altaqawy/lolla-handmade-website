/* LOLLA Print Gallery: non-blocking micro-motion, respects reduced-motion. */
(function initPatternGalleryPolish(){
  const section=document.querySelector('#patterns');
  const row=document.querySelector('#patternRow');
  if(!section||!row)return;
  const cards=[...row.querySelectorAll('.pattern-card')];
  cards.forEach((card,i)=>card.style.setProperty('--pattern-index',i));
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce && 'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){section.classList.add('patterns-animated');observer.disconnect();break;}
      }
    },{threshold:.15,rootMargin:'0px 0px -65px 0px'});
    observer.observe(row);
  }
  if(!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let frame=0,lastEvent=null;
    row.addEventListener('pointermove',event=>{
      lastEvent=event;
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        const rect=row.getBoundingClientRect();
        row.style.setProperty('--glow-x',`${lastEvent.clientX-rect.left}px`);
        row.style.setProperty('--glow-y',`${lastEvent.clientY-rect.top}px`);
        frame=0;
      });
    },{passive:true});
  }
})();