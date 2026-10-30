"""Build the three reviewed static references. Run from any directory, then localize.mjs."""
import json,re,html
from pathlib import Path
root=Path(__file__).resolve().parents[1]
products=json.loads((root/'docs/product-references.json').read_text(encoding='utf-8'))
def esc(value):return html.escape(str(value),quote=True)
def bi(tag,pair,attrs=''):
    return f'<{tag} data-en="{esc(pair[0])}" data-zh="{esc(pair[1])}" {attrs}>{esc(pair[0])}</{tag}>'
def language_link(path,pair,attrs=''):
    return bi('a',pair,f'href="{esc(path)}" data-language-link {attrs}')
config=json.loads((root/'site.json').read_text(encoding='utf-8'))
config['hero']='Find the right fitting. Ask better questions.'
config['intro']='A visual reference for technical buyers. Explore product types, check the questions that matter, and prepare a clearer bilingual RFQ.'
config['locales']['zh-CN']['hero']='认识管件，问对问题。'
config['locales']['zh-CN']['intro']='面向技术采购者的图文参考库。了解产品类型，核查关键问题，整理更清晰的中英文询价清单。'
config['catalogTranslations']={
 'A clearer starting point for procurement.':'让采购调研有一个清晰起点。',
 'Product types, not supplier offers':'产品类型参考，并非供应商报价',
 'Original illustration · Not a product photo':'原创示意图 · 非实物照片',
 '03 detailed references':'3 个详细产品参考',
 'EN / 中文 content':'中英文内容',
 'No account required':'无需注册账户',
 'From product research to a better specification.':'从产品调研，走向更清晰的规格要求。',
 'Prepare your RFQ →':'整理询价清单 →',
 'Read product reference':'查看详细参考',
 'Product reference':'产品参考'
}
page=(root/'public/index.html').read_text(encoding='utf-8')
page=page.replace('<link rel="stylesheet" href="./rfq-builder.css">','<link rel="stylesheet" href="./rfq-builder.css"><link rel="stylesheet" href="./catalog.css">') if './catalog.css' not in page else page
hero=f'''<section class="hero"><div class="container hero-inner"><div><div class="eyebrow">Plumbing &amp; piping procurement</div><h1>{esc(config['hero'])}</h1><p class="lead">{esc(config['intro'])}</p><div class="actions"><a class="btn btn-dark" href="#products">Explore products →</a><a class="btn btn-light" href="#rfq-builder">Build RFQ checklist</a></div><div class="hero-proof"><span>03 detailed references</span><span>EN / 中文 content</span><span>No account required</span></div></div><aside class="hero-note"><figure class="hero-visual"><img src="./images/ball-valve.svg" width="800" height="480" alt="Ball valve" decoding="async" fetchpriority="high"></figure><div class="hero-caption"><div><span class="hero-code">Product reference</span><br><strong>Ball valve</strong></div><span>Original illustration · Not a product photo</span></div></aside></div></section>'''
page=re.sub(r'<section class="hero">[\s\S]*?</section>',lambda m:hero,page,count=1)
page=re.sub(r'<div class="editorial-bar">[\s\S]*?</div></div>','',page)
bar='<div class="editorial-bar"><div class="container"><span>From product research to a better specification.</span><a href="#rfq-builder">Prepare your RFQ →</a></div></div>'
page=page.replace(hero,hero+bar,1)
for product in products:
    name=product['name'][0]
    pattern=r'<article class="card product-card"[\s\S]*?</article>'
    def add_link(match):
        text=match.group(0)
        if '<h3>'+name+'</h3>' not in text:return text
        text=re.sub(r'<a class="detail-link"[\s\S]*?</a>','',text)
        return text.replace('</article>',f'<a class="detail-link" href="./products/{product["slug"]}.html" data-language-link>Read product reference</a></article>')
    page=re.sub(pattern,add_link,page)
start=page.index('<div class="searchbox">');end=page.index('<div class="meta" id="result-count"',start)
if 'class="catalog-toolbar"' not in page:
    page=page[:start]+'<div class="catalog-toolbar">'+page[start:end]+'</div>'+page[end:]
(root/'public/index.html').write_text(page,encoding='utf-8')
(root/'site.json').write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

output=root/'public/products';output.mkdir(exist_ok=True)
for product in products:
    name=product['name'];slug=product['slug']
    title=[f'{name[0]} | PlumbingSource',f'{name[1]} | PlumbingSource']
    image='../images/'+product['image']
    other_links=''.join(language_link(p['slug']+'.html',p['name']) for p in products if p['slug']!=slug)
    nav=''.join([language_link('../index.html#products',['Product library','产品参考库']),language_link('../index.html#rfq-builder',['RFQ checklist','询价清单'])])
    header=f'''<header><div class="container top"><a class="brand" href="../index.html" data-language-link aria-label="PlumbingSource"><span class="monogram">P/</span>PlumbingSource</a><nav class="detail-nav" aria-label="Navigation">{nav}<button class="language-switch" id="language-switch" type="button" lang="zh-CN" aria-label="Switch to Chinese" hidden>中文</button></nav></div></header>'''
    breadcrumb=language_link('../index.html',['Home','首页'])+'<span>/</span>'+language_link('../index.html#products',['Product library','产品参考库'])+'<span>/</span>'+bi('span',name)
    rows=''.join('<tr>'+bi('th',label,'scope="row"')+bi('td',value)+'</tr>' for label,value in product['fields'])
    source_cards=''.join('<article class="source-card"><a href="'+esc(s['url'])+'" target="_blank" rel="noopener noreferrer">'+esc(s['title'])+'</a>'+bi('p',s['scope'])+'</article>' for s in product['sources'])
    pitfalls='<ul class="checklist pitfalls">'+''.join(bi('li',item) for item in product['mistakes'])+'</ul>'
    questions='<ol class="checklist">'+''.join(bi('li',item) for item in product['questions'])+'</ol>'
    caption=['Original project illustration. Generic product type; not a photograph, dimensioned drawing or a depiction of the linked manufacturer model.','项目原创示意图。仅展示通用产品类型，并非实物照片、尺寸图或所链接制造商型号的外观。']
    open_image=bi('a',['Open illustration ↗','打开示意图 ↗'],f'href="{image}" target="_blank" rel="noopener"')
    figure=f'<figure class="detail-art"><img src="{image}" width="800" height="480" alt="{esc(name[0])}" data-en-alt="{esc(name[0])}" data-zh-alt="{esc(name[1])}" decoding="async"><figcaption>{bi("span",caption)}<br>{open_image}</figcaption></figure>'
    summary=bi('span',['Product-type reference','产品类型参考'],'class="reference-label"')+bi('h1',name)+bi('p',product['tagline'],'class="lead"')+bi('p',product['overview'])+language_link('../index.html#rfq-builder',['Prepare an RFQ checklist →','整理询价清单 →'],'class="btn btn-dark"')
    body=f'''<main class="container" id="detail-main"><nav class="breadcrumb" aria-label="Breadcrumb">{breadcrumb}</nav><div class="detail-hero">{figure}<div class="detail-summary">{summary}</div></div><div class="detail-layout"><div>
<section id="specifications">{bi('div',['01 / SPECIFY','01 / 明确规格'],'class="kicker"')}{bi('h2',['What to specify','需要明确哪些规格'])}{bi('p',['These are fields to confirm, not supplied model ratings. Exact values depend on the selected product and service.','以下为需要确认的字段，并非供货型号的额定参数；准确数值取决于所选产品及使用工况。'],'class="section-intro"')}<table class="spec-table"><tbody>{rows}</tbody></table></section>
<section id="mistakes">{bi('div',['02 / CHECK','02 / 避免误选'],'class="kicker"')}{bi('h2',['Common mistakes to avoid','常见误选与核查提醒'])}{pitfalls}</section>
<section id="questions">{bi('div',['03 / ASK','03 / 采购提问'],'class="kicker"')}{bi('h2',['Questions for a manufacturer','向制造商提出的问题'])}{questions}</section>
<section id="compare">{bi('h2',['Do not confuse it with…','不要与这些类型混淆'])}{bi('p',product['compare'],'class="compare-note"')}</section>
<section id="sources">{bi('div',['04 / VERIFY','04 / 资料来源'],'class="kicker"')}{bi('h2',['Sources and scope','资料来源及适用范围'])}{bi('p',['Manufacturer links are research references, not supplier endorsements. We do not reproduce their photos or assert that the illustration matches their model.','制造商链接仅用于调研参考，不代表供应商背书。本站未转载其产品照片，也不声称示意图对应其具体型号。'],'class="section-intro"')}{source_cards}{bi('p',['Source review: 30 October 2026 · Confirm the current revision before procurement.','资料核查日期：2026 年 10 月 30 日 · 采购前请确认当前版本。'],'class="source-date"')}</section>
</div><aside class="detail-aside">{bi('h2',['On this reference','本页内容'])}{bi('a',['Specification fields','规格字段'],'href="#specifications"')}{bi('a',['Common mistakes','常见误选'],'href="#mistakes"')}{bi('a',['Buyer questions','采购问题'],'href="#questions"')}{bi('a',['Sources','资料来源'],'href="#sources"')}{bi('p',['Other detailed references','其他详细参考'])}{other_links}</aside></div><div class="notice">{bi('strong',['Independent reference. ','独立参考说明。 '])}{bi('span',['Educational procurement preparation only, not engineering approval, certification or a quotation. Ask a qualified professional to verify suitability for the actual system.','仅用于学习及采购前整理，不代表工程批准、认证或实际报价。实际系统的适用性应由具备资质的专业人员核查。'])}</div></main>'''
    document='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+bi('title',title)+'<meta name="robots" content="noindex,nofollow"><meta name="description" content="'+esc(product['tagline'][0])+'" data-en-content="'+esc(product['tagline'][0])+'" data-zh-content="'+esc(product['tagline'][1])+'"><link rel="stylesheet" href="../styles.css"><link rel="stylesheet" href="../catalog.css"></head><body class="detail-page">'+bi('a',['Skip to reference','跳转到产品参考'],'class="skip-link" href="#detail-main"')+header+body+'<footer><div class="container footer-inner"><strong>PlumbingSource</strong>'+bi('span',['Independent knowledge · No supplier endorsement','独立知识项目 · 不为供应商背书'])+'</div></footer><script src="../product-detail.js" defer></script></body></html>\n'
    (output/(slug+'.html')).write_text(document,encoding='utf-8')

# Keep the existing RFQ integration intact while compiling the new catalog strings.
generator=root/'scripts/localize.mjs'
source=generator.read_text(encoding='utf-8')
if 'Object.assign(translations,config.catalogTranslations' not in source:
    source=source.replace('pair(config,chinese);','pair(config,chinese);\nObject.assign(translations,config.catalogTranslations||{});')
match=re.search(r'const runtime=(.+);\n',source)
runtime=json.loads(match.group(1))
if "querySelectorAll('[data-language-link]')" not in runtime:
    runtime=runtime.replace('    if(remember){',"    document.querySelectorAll('[data-language-link]').forEach(a=>{const url=new URL(a.getAttribute('href'),location.href);url.searchParams.set('lang',language);a.href=url.href;});\n    if(remember){")
source=source[:match.start(1)]+json.dumps(runtime,ensure_ascii=False)+source[match.end(1):]
generator.write_text(source,encoding='utf-8')
print('Built three bilingual product references and upgraded the image-led catalog.')
