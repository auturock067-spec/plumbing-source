
(()=>{
  const input=document.querySelector('#product-search');
  const cards=[...document.querySelectorAll('[data-product]')];
  const chips=[...document.querySelectorAll('[data-filter]')];
  const count=document.querySelector('#result-count');
  const empty=document.querySelector('#no-results');
  if(!input||!count||!empty)return;
  let category='all';
  function filter(){
    const term=input.value.trim().toLocaleLowerCase();
    let shown=0;
    for(const card of cards){
      const text=card.getAttribute('data-search')||'';
      const match=(category==='all'||card.getAttribute('data-category')===category)&&text.includes(term);
      card.hidden=!match;if(match)shown++;
    }
    count.textContent=shown+' product '+(shown===1?'reference':'references')+' shown';
    empty.hidden=shown!==0;
  }
  input.addEventListener('input',filter);
  for(const chip of chips){chip.addEventListener('click',()=>{
    category=chip.getAttribute('data-filter');
    for(const item of chips)item.setAttribute('aria-pressed',String(item===chip));
    filter();
  });}
  filter();
})();
