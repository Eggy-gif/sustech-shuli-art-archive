const assets = window.archiveAssets;
const authors = window.archiveAuthors;
const state = {year:'all',category:'全部',query:''};
const getAuthor = id => authors.find(author => author.id === id);
const yearLabel = value => value === null ? '年份待补充' : `${value} 年`;
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function card(asset) {
  const article = element('article','asset-card');
  const button = element('button','asset-image');
  button.type = 'button';
  button.setAttribute('aria-label',`查看 ${asset.title}`);
  const image = element('img'); image.src = asset.image; image.alt = asset.title; image.loading = 'lazy'; image.decoding = 'async';
  button.append(image,element('span','image-open','↗'));
  button.addEventListener('click',()=>openDetail(asset.id));
  const bottom = element('div','asset-bottom');
  const author = element('a','',`${getAuthor(asset.authorId).name} ↗`); author.href = `#author/${asset.authorId}`;
  bottom.append(author,element('span','',yearLabel(asset.year)));
  article.append(button,element('span','asset-category',asset.category),element('h3','',asset.title),bottom);
  return article;
}
function drawCards(target,items) { target.replaceChildren(...items.map(card)); }
drawCards(document.querySelector('#featured'),[24,2,26,7].map(id=>assets.find(a=>a.id===id)));
function renderArchive() {
  const query = state.query.trim().toLocaleLowerCase();
  const filtered = assets.filter(a=>(state.year === 'all' || String(a.year) === state.year) && (state.category === '全部' || a.category === state.category) && `${a.title} ${a.category} ${getAuthor(a.authorId).name} ${a.source}`.toLocaleLowerCase().includes(query));
  drawCards(document.querySelector('#asset-grid'),filtered);
  document.querySelector('#count').textContent = `${filtered.length} / ${assets.length} 份艺术资产`;
  document.querySelector('#empty').hidden = filtered.length !== 0;
  document.querySelectorAll('[data-year]').forEach(b=>{b.classList.toggle('active',b.dataset.year===state.year);b.setAttribute('aria-pressed',String(b.dataset.year===state.year));});
  document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===state.category);b.setAttribute('aria-pressed',String(b.dataset.category===state.category));});
}
const years = [...new Set(assets.filter(a=>a.year!==null).map(a=>String(a.year)))].sort().reverse();
for (const year of ['all',...years,...(assets.some(a=>a.year===null)?['null']:[])]) {
  const count = assets.filter(a=>year==='all'||String(a.year)===year).length;
  const button = element('button','',`${year==='all'?'全部年份':year==='null'?'年份待补充':`${year} 年`} · ${count}`);
  button.dataset.year = year; button.addEventListener('click',()=>{state.year=year;renderArchive();});
  document.querySelector('#year-filters').append(button);
}
for (const category of ['全部',...new Set(assets.map(a=>a.category))]) {
  const button=element('button','',category);button.dataset.category=category;
  button.addEventListener('click',()=>{state.category=category;renderArchive();});
  document.querySelector('#categories').append(button);
}
document.querySelector('#search').addEventListener('input',event=>{state.query=event.target.value;renderArchive();});
document.querySelector('#reset').addEventListener('click',()=>{Object.assign(state,{year:'all',category:'全部',query:''});document.querySelector('#search').value='';renderArchive();});
for (const author of authors) {
  const link=element('a','author-card');link.href=`#author/${author.id}`;
  const text=element('div');text.append(element('h2','',author.name),element('p','',`${author.role} / ${assets.filter(a=>a.authorId===author.id).length} 件作品`));
  link.append(element('div','avatar',author.id==='uncredited'?'?':author.name.slice(0,1)),text,element('span','arrow','↗'));
  document.querySelector('#author-list').append(link);
}
function route() {
  const [requested,id] = location.hash.slice(1).split('/');
  const pageName = ['home','archive','authors','author'].includes(requested) ? requested : 'home';
  document.querySelectorAll('.page').forEach(p=>{p.hidden=p.id!==pageName;});
  document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===(pageName==='author'?'authors':pageName);a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(pageName==='author') {
    const author=getAuthor(id)||authors[0];
    const wrapper=element('div','profile');const text=element('div');text.append(element('p','eyebrow','CREATOR / 创作者档案'),element('h1','',author.name),element('p','',author.role),element('p','',author.bio));wrapper.append(element('div','avatar',author.id==='uncredited'?'?':author.name.slice(0,1)),text);
    document.querySelector('#author-profile').replaceChildren(wrapper);
    const works=assets.filter(a=>a.authorId===author.id);drawCards(document.querySelector('#author-works'),works);document.querySelector('#author-count').textContent=`${works.length} 件作品`;
  }
  document.title = `${({home:'栗藏',archive:'艺术资产',authors:'创作者',author:'作者档案'})[pageName]} · 树礼艺术资产馆`;
  window.scrollTo(0,0);
}
const dialog=document.querySelector('#detail');let currentId;let previousFocus;
function openDetail(id) {
  currentId=id;const asset=assets.find(a=>a.id===id);
  document.querySelector('#detail-img').src=asset.image;document.querySelector('#detail-img').alt=asset.title;
  document.querySelector('#detail-title').textContent=asset.title;
  document.querySelector('#detail-number').textContent=`SHULI ARCHIVE / ${String(id).padStart(3,'0')}`;
  document.querySelector('#detail-category').textContent=asset.category;
  document.querySelector('#detail-year').textContent=yearLabel(asset.year);
  document.querySelector('#detail-source').textContent=asset.source;
  const author=document.querySelector('#detail-author');author.textContent=`${getAuthor(asset.authorId).name} → 查看作者页`;author.href=`#author/${asset.authorId}`;
  const download=document.querySelector('#download');download.href=asset.image;download.download=`树礼-${asset.title}.webp`;
  document.querySelector('#full-image').href=asset.image;
  if(!dialog.open){previousFocus=document.activeElement;dialog.showModal();document.body.style.overflow='hidden';}
}
function closeDetail(){dialog.close();}
dialog.addEventListener('close',()=>{document.body.style.overflow='';previousFocus?.focus({preventScroll:true});});
document.querySelector('#close').addEventListener('click',closeDetail);
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeDetail();}});
document.querySelector('#detail-author').addEventListener('click',closeDetail);
for (const [selector,offset] of [['#previous',-1],['#next',1]])document.querySelector(selector).addEventListener('click',()=>{const index=assets.findIndex(a=>a.id===currentId);openDetail(assets[(index+offset+assets.length)%assets.length].id);});
window.addEventListener('hashchange',()=>{if(dialog.open)closeDetail();route();});
renderArchive();route();
