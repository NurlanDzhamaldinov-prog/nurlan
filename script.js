(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const menuButton = $('#mobileMenuBtn'), drawer = $('#mobileDrawer');
  const header = $('.topbar');
  let lang = 'ru';
  try { lang = localStorage.getItem('nurlan-language') === 'en' ? 'en' : 'ru'; } catch {}
  let menuOpen = false;
  const setLanguage = value => {
    lang = value;
    document.documentElement.lang = lang;
    $$('[data-ru][data-en]').forEach(el => { el.textContent = el.dataset[lang]; });
    $('#langToggle').textContent = lang === 'ru' ? 'RU / EN' : 'EN / RU';
    $('#langToggle').setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
    menuButton.textContent = menuOpen ? (lang === 'ru' ? 'ЗАКРЫТЬ' : 'CLOSE') : (lang === 'ru' ? 'МЕНЮ' : 'MENU');
    menuButton.setAttribute('aria-label',menuOpen ? (lang === 'ru' ? 'Закрыть меню' : 'Close menu') : (lang === 'ru' ? 'Открыть меню' : 'Open menu'));
    $$('.gallery-open').forEach((el,i)=>el.setAttribute('aria-label',(lang==='ru'?'Открыть фотографию ':'Open photograph ')+(i+1)));
    $$('.poster-open').forEach(el=>el.setAttribute('aria-label',(lang==='ru'?'Открыть афишу — ':'Open poster — ')+el.closest('.event-card').querySelector('h3').textContent));
    $('.dialog-close').setAttribute('aria-label',lang==='ru'?'Закрыть':'Close');
    try { localStorage.setItem('nurlan-language',lang); } catch {}
    if(window.ScrollTrigger) requestAnimationFrame(()=>ScrollTrigger.refresh());
  };
  function setMenu(open, returnFocus = true) {
    menuOpen = open;
    drawer.hidden = !open; drawer.inert = !open;
    menuButton.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('menu-open',open);
    $('main').inert = open; $('footer').inert = open;
    $$('.topbar > a, .topbar > nav, .top-socials, #langToggle').forEach(el => { el.inert = open; });
    setLanguage(lang);
    if(open) { drawer.querySelector('a').focus(); if(window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(drawer.querySelectorAll('a'),{y:18,opacity:0},{y:0,opacity:1,stagger:.06,duration:.45,clearProps:'all'}); }
    else if(returnFocus) menuButton.focus();
  }
  $('#langToggle').addEventListener('click',()=>setLanguage(lang==='ru'?'en':'ru'));
  menuButton.addEventListener('click',()=>setMenu(!menuOpen));
  drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ setMenu(false,false); const target=$(a.getAttribute('href')); target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); }));
  document.addEventListener('keydown',e=>{
    if(!menuOpen)return;
    if(e.key==='Escape')setMenu(false);
    if(e.key==='Tab') { const stops=[menuButton,...drawer.querySelectorAll('a')]; const i=stops.indexOf(document.activeElement); if(e.shiftKey && i<=0){e.preventDefault();stops.at(-1).focus();} else if(!e.shiftKey && i===stops.length-1){e.preventDefault();stops[0].focus();} }
  });
  matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches && menuOpen)setMenu(false,false);});
  window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>40),{passive:true});
  header.classList.toggle('scrolled',scrollY>40);
  setLanguage(lang);

  // A sleeve preview follows both pointer and keyboard selection. Links remain native.
  const preview=$('#releasePreview'); let previewVersion=0;
  function showRelease(card,index){
    $$('.release-card').forEach(el=>el.classList.toggle('active',el===card));
    const src=card.querySelector('img').getAttribute('src');
    const version=++previewVersion;
    const img=new Image();
    img.onload=()=>{if(version!==previewVersion)return;preview.src=src;$('#releasePreviewNumber').textContent=String(index+1).padStart(2,'0')+' / '+$$('.release-card').length;
      if(window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo(preview,{opacity:.35,scale:.985},{opacity:1,scale:1,duration:.4,overwrite:true});};
    img.src=src;
  }
  $$('.release-card').forEach((card,i)=>{card.addEventListener('mouseenter',()=>showRelease(card,i));card.addEventListener('focus',()=>showRelease(card,i));});
  $('.release-card').classList.add('active');

  // Native dialog supplies focus containment and Escape behavior.
  const dialog=$('#photoDialog'); let previousFocus;
  $$('.gallery-open, .poster-open').forEach(button=>button.addEventListener('click',()=>{
    previousFocus=button; const img=button.querySelector('img');
    $('#dialogImage').src=img.src;$('#dialogImage').alt=img.alt;$('#dialogCaption').textContent=img.alt;
    dialog.showModal();document.body.classList.add('photo-open');
  }));
  $('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('photo-open');previousFocus?.focus();});

  // Motion is progressive enhancement. No hidden content if GSAP fails to load.
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    const motion=gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)',()=>{
      gsap.from('.hero h1 span',{yPercent:105,opacity:0,duration:1.3,stagger:.075,ease:'power3.out',clearProps:'all'});
      gsap.from('.hero-copy, .hero-brand-line, .hero-top-note',{y:16,opacity:0,duration:1,delay:.3,stagger:.12,clearProps:'all'});
      gsap.from('.hero-image',{scale:1.045,duration:1.8,ease:'power2.out',clearProps:'transform'});
      $$('.section-head, .releases-intro, .music-platforms, .event-card, .about-copy p, .contact-grid').forEach(el=>gsap.from(el,{y:24,opacity:0,duration:.85,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 94%',once:true},clearProps:'all'}));
      gsap.from('.reveal-line > span',{yPercent:110,duration:1.05,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:'.manifesto',start:'top 88%',once:true},clearProps:'all'});
      $$('.gallery-item').forEach(el=>gsap.from(el,{clipPath:'inset(8% 0 8% 0)',opacity:.2,duration:1.1,scrollTrigger:{trigger:el,start:'top 94%',once:true},clearProps:'all'}));
    });
    motion.add('(min-width:761px) and (prefers-reduced-motion: no-preference)',()=>{
      gsap.to('.hero-photo-panel',{y:70,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero-title-wrap',{y:40,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.gallery-top',{y:-35,ease:'none',scrollTrigger:{trigger:'.gallery-editorial',start:'top bottom',end:'bottom top',scrub:1}});
      gsap.to('.gallery-bottom',{y:25,ease:'none',scrollTrigger:{trigger:'.gallery-editorial',start:'top bottom',end:'bottom top',scrub:1}});
    });
    document.fonts.ready.then(()=>ScrollTrigger.refresh());
    window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
  }

  let installPrompt=null;
  const install=$('#installAppBtn');
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
  window.addEventListener('appinstalled',()=>{installPrompt=null;install.hidden=true;});
  install.addEventListener('click',async()=>{
    if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();await prompt.userChoice;}catch{}return;}
    const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    const installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
    const text=installed ? (lang==='ru'?'Сайт уже открыт как приложение.':'The site is already running as an app.') : ios ? (lang==='ru'?'В Safari: «Поделиться» → «На экран Домой».':'In Safari: Share → Add to Home Screen.') : (lang==='ru'?'Откройте меню браузера и выберите «Установить приложение», если этот пункт доступен. Вы также можете добавить сайт в закладки.':'Open your browser menu and choose Install app if available. You can also bookmark this site.');
    let status=$('#installStatus');if(!status){status=document.createElement('p');status.id='installStatus';status.setAttribute('role','status');$('.install-card').append(status);}status.textContent=text;
  });
  if ('serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol)) {
    const workers = navigator.serviceWorker;
    let controlled = Boolean(workers.controller);
    let reloading = false;
    workers.addEventListener('controllerchange', () => {
      // Refresh only an existing controlled page, once; never reload a first visit.
      if (controlled && !reloading) {
        reloading = true;
        location.reload();
      }
      controlled = true;
    });
    const register = () => workers.register('./sw.js', { updateViaCache: 'none' })
      .then(registration => {
        const check = () => registration.update().catch(() => {});
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') check();
        });
        window.addEventListener('online', check);
      }).catch(() => {});
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
})();

