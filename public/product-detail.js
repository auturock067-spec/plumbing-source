(()=>{
 const button=document.querySelector('#language-switch');
 if(!button)return;
 let language='en';
 const apply=(value,save=false)=>{
  language=value==='zh'?'zh':'en';
  document.documentElement.lang=language==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-en][data-zh]').forEach(el=>el.textContent=el.dataset[language]);
  document.querySelectorAll('[data-en-content]').forEach(el=>el.setAttribute('content',el.getAttribute('data-'+language+'-content')));
  document.querySelectorAll('[data-en-alt]').forEach(el=>el.alt=el.getAttribute('data-'+language+'-alt'));
  button.textContent=language==='zh'?'English':'中文';
  button.setAttribute('lang',language==='zh'?'en':'zh-CN');
  button.setAttribute('aria-label',language==='zh'?'切换为英文':'Switch to Chinese');
  button.hidden=false;
  document.querySelectorAll('[data-language-link]').forEach(a=>{
   const url=new URL(a.getAttribute('href'),location.href);url.searchParams.set('lang',language);a.href=url.href;
  });
  if(save){
   try{localStorage.setItem('site-language',language);}catch{}
   try{const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);}catch{}
  }
 };
 let saved='en';try{saved=localStorage.getItem('site-language')||'en';}catch{}
 const request=new URLSearchParams(location.search).get('lang');
 apply(request==='en'||request==='zh'?request:saved);
 button.addEventListener('click',()=>apply(language==='en'?'zh':'en',true));
})();
