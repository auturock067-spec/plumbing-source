// PlumbingSource V0.2 — local-only bilingual RFQ preparation; no network, quotes or certification.
(()=>{
  'use strict';
  const root=document.getElementById('rfq-builder');
  if(!root)return;
  const form=root.querySelector('#rfq-form');
  const output=root.querySelector('#rfq-output');
  const status=root.querySelector('#rfq-status');
  const missingList=root.querySelector('#rfq-missing');
  const generateButton=root.querySelector('#rfq-generate');
  const copyButton=root.querySelector('#rfq-copy');
  const saveButton=root.querySelector('#rfq-save');
  const extraLabel=root.querySelector('label[for="rfq-extra"]');
  let lastResult='';
  const names={
    product:['Product type','产品类型'],
    size:['Nominal size / unit','公称尺寸及单位'],
    material:['Material / grade','材料及牌号'],
    connection:['Connection / thread standard','接口及螺纹标准'],
    pressure:['Working pressure','工作压力'],
    temperature:['Working temperature','工作温度'],
    medium:['Service medium','使用介质'],
    quantity:['Quantity (pieces)','数量（件）'],
    market:['Destination market / jurisdiction','目标市场或管辖地区'],
    notes:['Other buyer notes','其他采购备注'],
    extra:['Connection details / sealing method','接口细节及密封方式']
  };
  const products={
    elbow:['Brass threaded elbow','黄铜螺纹弯头','Male/female thread details and sealing method','内外螺纹细节及密封方式'],
    ball:['Ball valve','球阀','End connection, seat material and actuation details','端部接口、阀座材料及操作方式'],
    check:['Check valve','止回阀','Installation orientation and cracking-pressure requirement','安装方向及开启压力要求']
  };
  const fields=['size','material','connection','pressure','temperature','medium','quantity','market','extra'];
  const allFields=['product',...fields,'notes'];
  function language(){return document.documentElement.lang.toLowerCase().startsWith('zh')?1:0;}
  function formValue(key){const element=form.elements.namedItem(key);return element?String(element.value||'').trim():'';}
  function productName(key,lang){return products[key]?products[key][lang]:lang?'未选择':'Not selected';}
  function relabel(){
    const zh=language()===1;
    for(const el of root.querySelectorAll('[data-en][data-zh]'))el.textContent=el.getAttribute(zh?'data-zh':'data-en');
    const p=products[formValue('product')]||products.elbow;
    extraLabel.textContent=p[zh?3:2];
    status.textContent=zh?'所有数据仅保留在当前浏览器页面，不会发送给本站。':'All entries stay on this browser page and are not sent to the site.';
    if(lastResult)status.textContent=zh?'已生成双语清单；修改后请重新生成。':'Bilingual checklist ready; regenerate after changing entries.';
  }
  function isBad(key,value){
    if(!value)return true;
    if(key==='quantity')return !/^[1-9]\d*$/.test(value);
    if(key==='pressure')return !/^\d+(?:[.,]\d+)?$/.test(value);
    if(key==='temperature')return !/^-?\d+(?:[.,]\d+)?$/.test(value);
    return false;
  }
  function validate(data){
    const invalid=[];
    for(const key of ['product',...fields]){
      if(key==='extra'&&!data.product)continue;
      if(isBad(key,data[key]))invalid.push(key);
    }
    const zh=language()===1;
    for(const key of ['product',...fields]){
      const el=form.elements.namedItem(key);
      if(!el)continue;
      const bad=invalid.includes(key);
      el.setAttribute('aria-invalid',String(bad));
      const msg=root.querySelector('[data-error-for="'+key+'"]');
      if(msg)msg.textContent=bad?(zh?'必填或格式待核实':'Required or check format'):'';
    }
    missingList.textContent=invalid.length?(zh?'待补全或核对：':'Missing or needs correction: ')+invalid.map(k=>names[k]?names[k][zh?1:0]:(zh?'产品类型':'Product type')).join(zh?'、':', '):(zh?'关键字段已填写；仍须向制造商核实技术适用性。':'Required fields supplied; technical suitability still needs manufacturer confirmation.');
    return invalid;
  }
  function build(){
    const data={};
    for(const key of allFields)data[key]=formValue(key);
    const invalid=validate(data);
    const en=[];
    const zh=[];
    en.push('PLUMBINGSOURCE — BUYER RFQ PREPARATION CHECKLIST');
    en.push('Educational draft only. Not a quotation, engineering approval, supplier endorsement or product certification.');
    en.push('Product: '+productName(data.product,0));
    zh.push('PLUMBINGSOURCE — 采购者询价准备核对清单');
    zh.push('仅供采购前整理需求，不是报价、工程批准、供应商背书或产品认证。');
    zh.push('产品：'+productName(data.product,1));
    for(const key of fields){
      let val=data[key];
      if((key==='pressure'||key==='temperature')&&val)val+=' '+formValue(key+'Unit');
      const absent=invalid.includes(key);
      en.push(names[key][0]+': '+(absent?'[TO CONFIRM WITH SUPPLIER / BUYER]':val));
      zh.push(names[key][1]+'：'+(absent?'【待买家或供应商确认】':val));
    }
    if(data.notes){en.push(names.notes[0]+': '+data.notes);zh.push(names.notes[1]+'：'+data.notes);}
    en.push('Open items: '+(invalid.length?invalid.map(k=>names[k][0]).join(', '):'No required fields missing; technical verification still required.'));
    zh.push('待补项目：'+(invalid.length?invalid.map(k=>names[k][1]).join('、'):'关键字段无空缺；仍需进行技术核实。'));
    en.push('Confirm exact drawings/standards, sealing, pressure-temperature service, tests and local regulations with qualified parties before purchasing.');
    zh.push('采购前须向合适的专业人员及制造商核实准确图纸、标准、密封方式、压力温度工况、检测及当地法规。');
    lastResult=en.join('\n')+'\n\n'+'='.repeat(56)+'\n\n'+zh.join('\n');
    output.textContent=lastResult;
    output.hidden=false;
    copyButton.disabled=false;
    saveButton.disabled=false;
    status.textContent=language()===1?'已生成中英文清单。':'English/Chinese checklist generated.';
    return lastResult;
  }
  form.addEventListener('submit',event=>{event.preventDefault();build();output.focus();});
  form.addEventListener('input',event=>{
    if(event.target.name){
      event.target.removeAttribute('aria-invalid');
      const msg=root.querySelector('[data-error-for="'+event.target.name+'"]');
      if(msg)msg.textContent='';
    }
  });
  form.elements.namedItem('product').addEventListener('change',relabel);
  copyButton.addEventListener('click',async()=>{
    if(!lastResult)return;
    try{
      if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(lastResult);
      status.textContent=language()===1?'清单已复制。':'Checklist copied.';
    }catch{
      status.textContent=language()===1?'此浏览器无法自动复制，请手动选择下方清单文字。':'Clipboard unavailable here; manually select and copy the checklist below.';
    }
  });
  saveButton.addEventListener('click',()=>{
    if(!lastResult)return;
    const blob=new Blob(['\uFEFF',lastResult],{type:'text/plain;charset=utf-8'});
    const href=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=href;anchor.download='plumbingsource-rfq-checklist.txt';
    document.body.appendChild(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(href),2000);
    status.textContent=language()===1?'已准备好 UTF-8 文本文件。':'UTF-8 text file prepared.';
  });
  new MutationObserver(records=>{
    if(records.some(r=>r.attributeName==='lang'))relabel();
  }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  relabel();
})();