'use strict';

// LOLLA demo storefront: static catalogue, browser-local bag, WhatsApp enquiry checkout.
// Add confirmed real prices, stock and payment only after a backend is connected.
const WHATSAPP_NUMBER = '201226396475';
const products = [
  {id:'berry-tote',name:'Berry Picnic Tote',category:'tote',pattern:'berries',image:'1557',label:'Fan favourite',description:'A wonderfully soft, quilted tote with little berries and a roomy everyday silhouette.',bg:'#f1dfe4'},
  {id:'tulip-pouch',name:'Tulip Dream Pouch',category:'pouch',pattern:'tulip',image:'1551',label:'Little favourite',description:'Pretty pink tulips, gentle quilting and space for your daily treasures.',bg:'#f5dae7'},
  {id:'midnight-tote',name:'Midnight Bloom Tote',category:'tote',pattern:'midnight',image:'1559',label:'Soft & roomy',description:'Deep midnight fabric scattered with little flowers, with padded straps and useful internal compartments.',bg:'#dfdeea'},
  {id:'heart-pouch',name:'Love Notes Pouch',category:'pouch',pattern:'hearts',image:'1571',label:'Made with love',description:'Cream quilting dotted with tiny red hearts, made for makeup and all the little things.',bg:'#f8e2e3'},
  {id:'tulip-set',name:'The Tulip Collection',category:'set',pattern:'tulip',image:'1558',label:'Matching mood',description:'A coordinated tulip print collection with a tote and complementary little accessories. Ask about available pieces.',bg:'#e6e3f1'},
  {id:'blue-floral',name:'Bluebell Makeup Bag',category:'pouch',pattern:'floral',image:'1564',label:'Just lovely',description:'A sweet blue floral pouch with a soft hand-quilted look.',bg:'#e4e5f6'},
  {id:'gingham-set',name:'Cocoa Gingham Set',category:'set',pattern:'gingham',image:'1581',label:'Picnic mood',description:'Classic cocoa checks alongside a cosy neutral padded pouch.',bg:'#f0e2db'},
  {id:'berry-pouch',name:'Berry Sweet Pouch',category:'pouch',pattern:'berries',image:'1561',label:'Fresh pick',description:'Delicate pink strawberry print on cream quilting, finished with a secure zip.',bg:'#e6ecdf'},
  {id:'midnight-set',name:'Midnight Duo',category:'set',pattern:'midnight',image:'1555',label:'Better together',description:'A matching floral tote and pouch set with practical details inside.',bg:'#e1ddec'},
  {id:'hearts-set',name:'Sweetheart Duo',category:'set',pattern:'hearts',image:'1570',label:'Love at first sight',description:'Matching white and red heart print accessories made to bring a smile.',bg:'#f9e4e5'},
  {id:'picnic-pouch',name:'Picnic Check Pouch',category:'pouch',pattern:'gingham',image:'1576',label:'Pretty pattern',description:'A cute red checked quilted pouch made for your everyday essentials.',bg:'#f5dfda'},
  {id:'pink-cloud',name:'Pink Cloud Pouch',category:'pouch',pattern:'floral',image:'1583',label:'Puffy soft',description:'Pastel pink puffed quilting with a lovely floral lining.',bg:'#f8dbe6'},
  {id:'violet-pouch',name:'Violet Garden Pouch',category:'pouch',pattern:'floral',image:'1577',label:'Colour crush',description:'An adorable quilted pouch with lively violet florals.',bg:'#ebe3f4'},
  {id:'rose-pouch',name:'Rose Cottage Pouch',category:'pouch',pattern:'floral',image:'1580',label:'Sweet details',description:'Little rose bouquets embroidered into a soft quilted look.',bg:'#f9e5ea'},
  {id:'blossom-tote',name:'Blossom Tote',category:'tote',pattern:'floral',image:'1573',label:'Handmade edit',description:'A lovely dark floral tote with padded handles and careful stitching.',bg:'#e0dfe7'},
  {id:'stripes-pouch',name:'Candy Stripe Pouch',category:'pouch',pattern:'gingham',image:'1578',label:'Daydream edit',description:'Soft striped pink-and-cream quilted style for your everyday favourites.',bg:'#f9e2e9'}
];
const sets = {
  tulip: {title:'Tulip Dream',photo:'1558',pattern:'tulip print'},
  midnight: {title:'Midnight Bloom',photo:'1555',pattern:'midnight floral print'},
  hearts: {title:'Love Notes',photo:'1570',pattern:'little red hearts print'}
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const imgSrc = id => `assets/${id}.webp`;
const labelCategory = type => ({tote:'Tote bag',pouch:'Makeup pouch',set:'Matching set'})[type] || 'Handmade piece';
const safeGet = key => {try {return JSON.parse(localStorage.getItem(key)) || {}} catch {return {}}};
const safeSave = (key,val) => {try {localStorage.setItem(key,JSON.stringify(val))} catch {}};
let bag = safeGet('lolla.bag.v1');
let likes = safeGet('lolla.likes.v1');
let categoryFilter = 'all', patternFilter = null, showAll = false;
let activeProduct = null, currentSet = 'tulip';
let toastTimer, focusBeforeDialog = null;

function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('is-visible'),2800)}
function allMatches(){return products.filter(p=>(categoryFilter==='all'||(categoryFilter==='saved'?!!likes[p.id]:p.category===categoryFilter))&&(!patternFilter||p.pattern===patternFilter));}
function renderProducts(){
  const previousActive = document.activeElement;
  const matching=allMatches(); const shown=showAll?matching:matching.slice(0,8);
  $('#resultsCount').textContent=matching.length;
  $('#showMoreButton').hidden=matching.length<=8;
  $('#showMoreButton').innerHTML=showAll?'Show fewer pieces <span>↑</span>':'See more pretty things <span>↗</span>';
  $('#productGrid').innerHTML=shown.map(p=>`<article class="product-card" data-id="${p.id}"><div class="product-visual" style="--product-bg:${p.bg}"><button class="product-image-btn" data-view="${p.id}" aria-label="View ${p.name}"><img src="${imgSrc(p.image)}" alt="${p.name} handmade by LOLLA" loading="lazy"></button><span class="product-badge">${p.label}</span><button class="product-heart ${likes[p.id]?'is-active':''}" data-heart="${p.id}" aria-label="${likes[p.id]?'Remove '+p.name+' from':'Add '+p.name+' to'} favourites" aria-pressed="${!!likes[p.id]}">${likes[p.id]?'♥':'♡'}</button></div><div class="product-info"><div><h3>${p.name}</h3><p>${labelCategory(p.category)} · Price on request</p></div><button class="product-add" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div></article>`).join('');
  if(!shown.length) $('#productGrid').innerHTML='<p class="no-results">No pieces in this edit just yet. Try another print ♡</p>';
  if(typeof cardReveal !== 'undefined' && cardReveal?.refresh) {
    requestAnimationFrame(()=>{
      cardReveal.refresh();
      markMagnetic();
      initMagnetic();
      initTilt();
    });
  }
}
function setCategory(filter){categoryFilter=filter;patternFilter=null;showAll=false;$$('[data-filter]').forEach(b=>b.classList.toggle('is-selected',b.dataset.filter===filter));$$('.pattern-card').forEach(b=>b.classList.remove('is-selected'));renderProducts();}
function setPattern(filter){patternFilter=filter;categoryFilter='all';showAll=true;$$('[data-filter]').forEach(b=>b.classList.toggle('is-selected',b.dataset.filter==='all'));$$('.pattern-card').forEach(b=>b.classList.toggle('is-selected',b.dataset.pattern===filter));renderProducts();$('#collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});toast(`Showing ${filter} pieces ♡`);}
function getById(id){return products.find(p=>p.id===id)}
function bagCount(){return Object.values(bag).reduce((sum,n)=>sum+Math.max(0,Number(n)||0),0)}
function updateBadge(){$('#bagCount').textContent=bagCount()}
function addToBag(id){const item=getById(id);if(!item)return;bag[id]=Math.min(99,(Number(bag[id])||0)+1);safeSave('lolla.bag.v1',bag);updateBadge();renderBag();toast(`${item.name} added to your happy bag ♡`)}
function removeFromBag(id){delete bag[id];safeSave('lolla.bag.v1',bag);updateBadge();renderBag()}
function setQuantity(id,delta){const next=(Number(bag[id])||0)+delta;if(next<=0)return removeFromBag(id);bag[id]=Math.min(99,next);safeSave('lolla.bag.v1',bag);updateBadge();renderBag()}
function renderBag(){const entries=Object.entries(bag).filter(([id,qty])=>getById(id)&&qty>0);$('#sendOrder').disabled=!entries.length;$('#cartItems').innerHTML=entries.length?entries.map(([id,qty])=>{const p=getById(id);return `<div class="cart-row"><img src="${imgSrc(p.image)}" alt="${p.name}"><div><h3>${p.name}</h3><small>Price on request</small><div class="qty-stepper"><button data-qty="${id}" data-delta="-1" aria-label="Remove one ${p.name}">−</button><span>${qty}</span><button data-qty="${id}" data-delta="1" aria-label="Add one ${p.name}">+</button></div></div><button class="cart-remove" aria-label="Remove ${p.name}" data-remove="${id}">×</button></div>`}).join(''):`<div class="empty-bag"><span>♡</span><h3>Your bag is waiting.</h3><p>Fill it with a little happiness!</p></div>`;}
const whatsAppURL = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
function sendBag(){const entries=Object.entries(bag).filter(([id,qty])=>getById(id)&&qty>0);if(!entries.length){toast('Add a little something first ♡');return}const lines=entries.map(([id,qty])=>`• ${getById(id).name} × ${qty}`).join('\n');const text=`Hello LOLLA! ♡\nI would like to ask about these handmade pieces:\n${lines}\n\nCould you confirm availability, prices and delivery details? Thank you!`;window.open(whatsAppURL(text),'_blank','noopener,noreferrer');}
function saveHeart(id){likes[id]=!likes[id];safeSave('lolla.likes.v1',likes);renderProducts();toast(likes[id]?'Saved to your little favourites ♡':'Removed from favourites')}
function saveFocus(){focusBeforeDialog=document.activeElement}
function restoreFocus(){if(focusBeforeDialog?.isConnected)focusBeforeDialog.focus();focusBeforeDialog=null}
function syncOverlay(){const open=$('#cartDrawer').classList.contains('is-open')||$('#productModal').classList.contains('is-open');$('#overlay').hidden=!open;document.body.classList.toggle('lock-scroll',open)}
function openCart(){closeModal(false);saveFocus();renderBag();$('#cartDrawer').classList.add('is-open');$('#cartDrawer').setAttribute('aria-hidden','false');syncOverlay();$('#cartDrawer .drawer-close').focus()}
function closeCart(restore=true){$('#cartDrawer').classList.remove('is-open');$('#cartDrawer').setAttribute('aria-hidden','true');syncOverlay();if(restore)restoreFocus()}
function openProduct(id){const p=getById(id);if(!p)return;closeCart(false);saveFocus();activeProduct=id;$('#modalImage').src=imgSrc(p.image);$('#modalImage').alt=p.name;$('#modalTitle').textContent=p.name;$('#modalCategory').textContent=`LOLLA / ${labelCategory(p.category).toUpperCase()}`;$('#modalDescription').textContent=p.description;$('#modalWhatsApp').href=whatsAppURL(`Hello LOLLA! ♡ I would like to ask about ${p.name}. Could you confirm the price and availability?`);$('#productModal').classList.add('is-open');$('#productModal').setAttribute('aria-hidden','false');syncOverlay();$('#productModal .modal-close').focus()}
function closeModal(restore=true){$('#productModal').classList.remove('is-open');$('#productModal').setAttribute('aria-hidden','true');syncOverlay();if(restore)restoreFocus()}
function closeLayers(){closeCart(false);closeModal(false);restoreFocus()}
function updateSet(next){if(!sets[next])return;currentSet=next;const image=$('#setImage');image.classList.add('switching');setTimeout(()=>{image.src=imgSrc(sets[next].photo);image.alt=`${sets[next].title} matching handmade collection`;image.classList.remove('switching')},170);$$('.set-swatch').forEach(button=>button.classList.toggle('is-selected',button.dataset.set===next))}
function updateSelectionTag(){const chosen=[];if($('#setTote').checked)chosen.push('TOTE');if($('#setPouch').checked)chosen.push('POUCH');$('#setSelectionTag').textContent=(chosen.join(' + ')||'PICK YOUR PIECES')+' ♡'}
function enquireSet(){const chosen=[];if($('#setTote').checked)chosen.push('tote bag');if($('#setPouch').checked)chosen.push('matching makeup pouch');if(!chosen.length){toast('Pick at least one lovely piece ♡');return}const text=`Hello LOLLA! ♡\nI would love to ask about a custom matching set.\nPrint: ${sets[currentSet].title} (${sets[currentSet].pattern})\nPieces: ${chosen.join(' + ')}\n\nCould you tell me the price and availability?`;window.open(whatsAppURL(text),'_blank','noopener,noreferrer')}
function initStickerBoard(){const board=$('#stickerBoard'),stickers=$$('.draggable-sticker');let z=10;
  stickers.forEach(sticker=>{
    let state=null;
    sticker.addEventListener('pointerdown',e=>{if(e.button!==0)return;const initialX=Number(sticker.dataset.x||0),initialY=Number(sticker.dataset.y||0);state={px:e.clientX,py:e.clientY,x:initialX,y:initialY,drag:false};sticker.setPointerCapture(e.pointerId);sticker.style.zIndex=++z;});
    sticker.addEventListener('pointermove',e=>{if(!state)return;const dx=e.clientX-state.px,dy=e.clientY-state.py;if(Math.hypot(dx,dy)>6)state.drag=true;if(!state.drag)return;sticker.classList.add('is-dragging');const maxX=board.clientWidth*.45,maxY=board.clientHeight*.48;const x=Math.min(maxX,Math.max(-maxX,state.x+dx)),y=Math.min(maxY,Math.max(-maxY,state.y+dy));sticker.style.setProperty('--x',x+'px');sticker.style.setProperty('--y',y+'px');sticker.dataset.x=x;sticker.dataset.y=y;});
    const end=()=>{if(!state)return;const dragged=state.drag;state=null;sticker.classList.remove('is-dragging');if(!dragged)openProduct(sticker.dataset.product)};
    sticker.addEventListener('pointerup',end);sticker.addEventListener('pointercancel',()=>{state=null;sticker.classList.remove('is-dragging')});
    sticker.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openProduct(sticker.dataset.product)}});
  });
  $('#tidyStickers').addEventListener('click',()=>{stickers.forEach(el=>{el.style.setProperty('--x','0px');el.style.setProperty('--y','0px');el.dataset.x=el.dataset.y=0;el.style.setProperty('--rotation','var(--tilt)')});toast('All neat and pretty ♡')});
  $('#shuffleStickers').addEventListener('click',()=>{stickers.forEach((el,i)=>{const x=(Math.random()-.5)*board.clientWidth*.28;const y=(Math.random()-.5)*board.clientHeight*.3;el.style.setProperty('--x',x+'px');el.style.setProperty('--y',y+'px');el.dataset.x=x;el.dataset.y=y;el.style.setProperty('--rotation',((Math.random()-.5)*36)+'deg')});toast('A fresh little mix ✿')});
}
function initReveal(){if(!('IntersectionObserver'in window)){ $$('.reveal').forEach(el=>el.classList.add('visible'));return}const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.09,rootMargin:'0px 0px -30px 0px'});$$('.reveal').forEach(el=>observer.observe(el));}
function initScroll(){let raf=0;const header=$('.header'),heroArt=$('.hero-art');window.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{const y=window.scrollY;header.classList.toggle('is-scrolled',y>75);if(window.innerWidth>900&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&y<window.innerHeight){heroArt.style.translate=`0 ${Math.round(y*.09)}px`}raf=0})},{passive:true})}
function initEvents(){
  $('#year').textContent=new Date().getFullYear();
  $$('.filter-list button').forEach(el=>el.addEventListener('click',()=>setCategory(el.dataset.filter)));
  $$('.pattern-card').forEach(el=>el.addEventListener('click',()=>setPattern(el.dataset.pattern)));
  $('#showMoreButton').addEventListener('click',()=>{showAll=!showAll;renderProducts()});
  $('#productGrid').addEventListener('click',e=>{const view=e.target.closest('[data-view]'),add=e.target.closest('[data-add]'),heart=e.target.closest('[data-heart]');if(view)openProduct(view.dataset.view);else if(add)addToBag(add.dataset.add);else if(heart)saveHeart(heart.dataset.heart)});
  $('#bagButton').addEventListener('click',openCart);
  $('#cartItems').addEventListener('click',e=>{const remove=e.target.closest('[data-remove]'),qty=e.target.closest('[data-qty]');if(remove)removeFromBag(remove.dataset.remove);else if(qty)setQuantity(qty.dataset.qty,Number(qty.dataset.delta))});
  $('#sendOrder').addEventListener('click',sendBag);
  $('#modalAdd').addEventListener('click',()=>{if(activeProduct){addToBag(activeProduct);closeModal();openCart()}});
  $$('[data-close]').forEach(el=>el.addEventListener('click',closeLayers));$('#overlay').addEventListener('click',closeLayers);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLayers();const nav=$('#mobileNav');nav.classList.remove('is-open');$('#menuButton').setAttribute('aria-expanded','false')}});
  $('#menuButton').addEventListener('click',()=>{const nav=$('#mobileNav');const isOpen=nav.classList.toggle('is-open');$('#menuButton').setAttribute('aria-expanded',String(isOpen))});
  $$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>{$('#mobileNav').classList.remove('is-open');$('#menuButton').setAttribute('aria-expanded','false')}));
  $$('.set-swatch').forEach(el=>el.addEventListener('click',()=>updateSet(el.dataset.set)));
  $('#askForSet').addEventListener('click',enquireSet);
  $('#setTote').addEventListener('change',updateSelectionTag);
  $('#setPouch').addEventListener('change',updateSelectionTag);
}


function markMagnetic(){
  ['.pill-button','.outline-button','.bag-trigger','.filter-list button','.set-swatch','.sticker-actions button'].forEach(sel=>{
    $$(sel).forEach(el=>el.setAttribute('data-magnetic',''));
  });
}
function initLoadIn(){
  requestAnimationFrame(()=>document.body.classList.add('is-loaded'));
}
function initRevealDirections(){
  $$('.shop-head .reveal, .section-head.reveal, .sticker-caption.reveal').forEach((el,i)=>{if(!el.dataset.reveal) el.dataset.reveal = i % 2 ? 'right' : 'left';});
  $$('.story-copy .reveal, .footer-head .reveal, .love-note .reveal').forEach(el=>{if(!el.dataset.reveal) el.dataset.reveal='left';});
}
function initProgressBar(){
  const bar=document.createElement('div');
  bar.className='premium-progress';
  document.body.appendChild(bar);
  let raf=0;
  const update=()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const p=max>0?window.scrollY/max:0;
    bar.style.transform=`scaleX(${Math.max(0,Math.min(1,p))})`;
    raf=0;
  };
  window.addEventListener('scroll',()=>{if(!raf) raf=requestAnimationFrame(update)},{passive:true});
  window.addEventListener('resize',update,{passive:true});
  update();
}
function initMagnetic(){
  if(window.innerWidth<901 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('[data-magnetic]').forEach(el=>{
    if(el.dataset.magneticBound) return;
    el.dataset.magneticBound='1';
    const reset=()=>{el.style.transform='';};
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`translate(${x*8}px, ${y*8}px)`;
    });
    el.addEventListener('mouseleave',reset);
    el.addEventListener('blur',reset);
  });
}
function initMouseParallax(){
  if(window.innerWidth<901 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero=$('.hero'); if(!hero) return;
  const layers=[
    ['.cloud--one',12],['.cloud--two',16],['.cloud--three',10],['.cloud--four',14],
    ['.hero-product-card--main',18],['.hero-product-card--small',22],['.hero-handmade-sticker',28],['.hero-flower',20],['.scribble--sun',24]
  ].map(([sel,speed])=>({el:$(sel),speed})).filter(v=>v.el);
  let tx=0,ty=0,cx=0,cy=0,raf=0;
  const animate=()=>{
    cx += (tx-cx)*0.08; cy += (ty-cy)*0.08;
    layers.forEach(({el,speed})=>{
      el.style.transform = `translate3d(${cx*speed}px, ${cy*speed}px,0)`;
    });
    if(Math.abs(tx-cx)>0.001 || Math.abs(ty-cy)>0.001) raf=requestAnimationFrame(animate); else raf=0;
  };
  hero.addEventListener('mousemove',e=>{
    const r=hero.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5);
    ty=((e.clientY-r.top)/r.height-.5);
    if(!raf) raf=requestAnimationFrame(animate);
  });
  hero.addEventListener('mouseleave',()=>{tx=0;ty=0;if(!raf) raf=requestAnimationFrame(animate)});
}
function initCardReveal(){
  const cards=()=>$$('.product-card');
  const showNow=()=>cards().forEach((el,i)=>{el.style.transitionDelay=`${Math.min(i*55,360)}ms`; requestAnimationFrame(()=>el.classList.add('is-visible'));});
  if(!('IntersectionObserver' in window)){showNow(); return {refresh:showNow};}
  let observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible'); observer.unobserve(entry.target);}})},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
  const refresh=()=>{
    cards().forEach((el,i)=>{
      el.classList.remove('is-visible');
      el.style.transitionDelay=`${Math.min(i*55,360)}ms`;
      observer.observe(el);
    });
  };
  refresh();
  return {refresh};
}
function initTilt(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets=['.product-card','.hero-product-card','.social-grid a'];
  const apply=(el,e,intensity=10)=>{
    const r=el.getBoundingClientRect();
    const rx=((e.clientY-r.top)/r.height-.5)*-intensity;
    const ry=((e.clientX-r.left)/r.width-.5)*intensity;
    el.style.transform = `${el.classList.contains('pattern-card') ? `rotate(${getComputedStyle(el).getPropertyValue('--rot')}) ` : ''}perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
  };
  const reset=(el)=>{el.style.transform='';};
  targets.forEach(sel=>{$$(sel).forEach(el=>{if(window.innerWidth<901 || el.dataset.tiltBound) return; el.dataset.tiltBound='1'; el.addEventListener('mousemove',e=>apply(el,e,el.classList.contains('hero-product-card')?7:6)); el.addEventListener('mouseleave',()=>reset(el));})});
}

const cardReveal = initCardReveal();
renderProducts();
cardReveal.refresh();
renderBag();
updateBadge();
initRevealDirections();
markMagnetic();
initEvents();
initStickerBoard();
initReveal();
initScroll();
initLoadIn();
initProgressBar();
initMagnetic();
// Cloudscape now handles depth parallax independently without disturbing photograph rotation.
initTilt();
