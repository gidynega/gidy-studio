const themes={
 mint:{bg:'#f1f6f1',ink:'#173c35',accent:'#39836f',body:'#526b64',shape:'#b9e5d7'},
 midnight:{bg:'#111b35',ink:'#f3f5ff',accent:'#8ee9dc',body:'#c2cbe0',shape:'#364b79'},
 sunset:{bg:'#fff1e7',ink:'#63351f',accent:'#d76b42',body:'#825b49',shape:'#f6c49f'},
 violet:{bg:'#f1edff',ink:'#35245f',accent:'#8066d8',body:'#655a85',shape:'#d1c4ff'}
};
let slides=[{eyebrow:'GIDY STUDIO',title:'Welcome to Gidy Studio',body:'Create your first professional presentation.',theme:'mint',layout:'title'}], current=0;
let undoStack=[], redoStack=[], lastSnapshot='';
let transitionPending=false;
function snapshot(){return JSON.stringify({slides,current});}
function recordUndo(){const snap=snapshot();undoStack.push(snap);if(undoStack.length>60)undoStack.shift();redoStack=[];lastSnapshot=snap;updateHistoryButtons();}
function updateHistoryButtons(){$('undo').disabled=!undoStack.length;$('redo').disabled=!redoStack.length;}
function restoreSnapshot(snap){const data=JSON.parse(snap);slides=data.slides;current=Math.min(data.current,slides.length-1);render();lastSnapshot=snapshot();updateHistoryButtons();}
function undo(){if(!undoStack.length)return;redoStack.push(snapshot());restoreSnapshot(undoStack.pop());msg('Last change undone.');}
function redo(){if(!redoStack.length)return;undoStack.push(snapshot());restoreSnapshot(redoStack.pop());msg('Change restored.');}
const templates={
 'mint-pro':{theme:'mint',layout:'split',eyebrow:'PROFESSIONAL PRESENTATION'},
 'dark-tech':{theme:'midnight',layout:'split',eyebrow:'FUTURE TECHNOLOGY'},
 'sunset-story':{theme:'sunset',layout:'title',eyebrow:'A STORY TO SHARE'},
 'violet-academic':{theme:'violet',layout:'standard',eyebrow:'LEARNING & RESEARCH'},
 'minimal-quote':{theme:'violet',layout:'quote',eyebrow:'KEY MESSAGE'}
};
const $=id=>document.getElementById(id);
function msg(t){$('status').textContent=t}
// V5 canvas positioning: positions are stored as percentages so they adapt to slide size.
const canvasKeys=['eyebrow','title','body','image'];
let selectedCanvasKey=null;
function addCanvasElement(type){
 recordUndo();const id='obj_'+Date.now()+'_'+Math.floor(Math.random()*10000);
 const item={id,type,text:type==='text'?'Double-click to edit text':type==='icon'?'★':'',x:12,y:18,w:type==='text'?34:22,h:type==='text'?16:22,fill:type==='circle'?'#83a8ff':'#ff75c8',font:'Arial'};
 slides[current].elements=slides[current].elements||[];slides[current].elements.push(item);
 slides[current].objects=slides[current].objects||{};slides[current].objects[id]={x:item.x,y:item.y,w:item.w,h:item.h};selectedCanvasKey=id;render();msg('New '+type+' added. Drag it to move and use the corner to resize.');
}
function renderExtraElements(){
 const p=$('slidePreview');p.querySelectorAll('[data-extra-object="1"]').forEach(n=>n.remove());
 (slides[current].elements||[]).forEach((o,i)=>{const n=document.createElement('div');n.dataset.extraObject='1';n.dataset.canvasKey=o.id;n.className='canvas-object extra-object'+(o.id===selectedCanvasKey?' is-selected':'');
 n.style.cssText='position:absolute;left:'+o.x+'%;top:'+o.y+'%;width:'+o.w+'%;height:'+o.h+'%;background:'+(o.type==='text'||o.type==='icon'||o.type==='arrow'?'transparent':o.fill)+';border-radius:'+(o.type==='circle'?'50%':'0')+';clip-path:'+(o.type==='triangle'?'polygon(50% 0, 0 100%, 100% 100%)':'none')+';display:flex;align-items:center;justify-content:center;padding:5px;box-sizing:border-box;color:'+(o.type==='text'||o.type==='icon'||o.type==='arrow'?o.fill:'#17233b')+';font-weight:700;font-family:'+JSON.stringify(o.font||'Arial')+';font-size:clamp(12px,3vw,34px);white-space:pre-wrap;overflow:hidden;z-index:'+(10+i)+';';
 n.textContent=o.text||(o.type==='arrow'?'➜':'');if(o.type==='text'||o.type==='icon'){n.contentEditable='true';n.style.border='1px dashed #7c8ba8';n.style.fontSize='clamp(10px,2vw,24px)';n.addEventListener('input',()=>{o.text=n.textContent});}
 p.appendChild(n);if(o.id===selectedCanvasKey){$('objectColor').value=/^#[0-9a-fA-F]{6}$/.test(o.fill||'')?o.fill:'#ff75c8';const h=document.createElement('span');h.className='resize-handle';h.setAttribute('data-html2canvas-ignore','true');n.appendChild(h);}
 });
}
function applyCanvasTransforms(){
 const p=$('slidePreview'),s=slides[current];
 const nodes={eyebrow:p.querySelector('.eyebrow'),title:p.querySelector('h3'),body:p.querySelector('p'),image:p.querySelector('.slide-image')};
 Object.entries(nodes).forEach(([key,node])=>{
  node.classList.add('canvas-object');node.dataset.canvasKey=key;
  const pos=s.objects&&s.objects[key];
  if(pos){node.style.position='absolute';node.style.left=pos.x+'%';node.style.top=pos.y+'%';node.style.width=pos.w+'%';node.style.height=pos.h+'%';node.style.maxWidth='none';node.style.maxHeight='none';node.style.margin='0';node.style.boxSizing='border-box';}
  else {node.style.position='';node.style.left='';node.style.top='';node.style.width='';node.style.height='';node.style.maxWidth='';node.style.maxHeight='';node.style.margin='';}
 });
}
function ensureObjectPosition(key,node){
 const s=slides[current];if(!s.objects)s.objects={};if(s.objects[key])return s.objects[key];
 const pr=$('slidePreview').getBoundingClientRect(),r=node.getBoundingClientRect();
 const pos={x:Math.max(0,(r.left-pr.left)/pr.width*100),y:Math.max(0,(r.top-pr.top)/pr.height*100),w:Math.min(100,r.width/pr.width*100),h:Math.min(100,r.height/pr.height*100)};
 s.objects[key]=pos;return pos;
}
let activeCanvasPointer=null;
function drawAlignmentGuides(x,y){const p=$('slidePreview');p.querySelectorAll('.alignment-guide').forEach(n=>n.remove());if(Math.abs(x-50)<2){const g=document.createElement('i');g.className='alignment-guide vertical';g.setAttribute('data-html2canvas-ignore','true');p.appendChild(g)}if(Math.abs(y-50)<2){const g=document.createElement('i');g.className='alignment-guide horizontal';g.setAttribute('data-html2canvas-ignore','true');p.appendChild(g)}}
function snapValue(v){return $('snapGrid').checked?Math.round(v/5)*5:v}
function updateObjectColor(){const key=selectedCanvasKey;if(!key){msg('Select a text box or shape first.');return}const obj=(slides[current].elements||[]).find(o=>o.id===key);if(!obj){msg('Choose a text box or shape to change its color.');return}recordUndo();obj.fill=$('objectColor').value;render();msg('Selected object color updated.')}
$('showGrid').addEventListener('change',()=>{$('slidePreview').classList.toggle('grid-visible',$('showGrid').checked)});
$('objectColor').addEventListener('input',()=>{const key=selectedCanvasKey,obj=(slides[current].elements||[]).find(o=>o.id===key);if(!obj)return;obj.fill=$('objectColor').value;const n=$('slidePreview').querySelector('[data-canvas-key="'+key+'"]');if(n){if(obj.type==='text')n.style.color=obj.fill;else n.style.background=obj.fill}});
$('objectColor').addEventListener('change',()=>{if(selectedCanvasKey)msg('Object color changed. Tap Save project to keep it.')});
$('slidePreview').addEventListener('pointerdown',e=>{
 const handle=e.target.closest('.resize-handle');const node=e.target.closest('.canvas-object');if(!node)return;
 const key=node.dataset.canvasKey;if(!key)return;selectedCanvasKey=key;
 const p=$('slidePreview'),pr=p.getBoundingClientRect(),pos=ensureObjectPosition(key,node);recordUndo();
 document.querySelectorAll('.canvas-object').forEach(n=>n.classList.remove('is-selected'));
 node.classList.add('is-selected');
 let h=node.querySelector('.resize-handle');if(!h){h=document.createElement('span');h.className='resize-handle';h.setAttribute('aria-label','Resize object');h.setAttribute('data-html2canvas-ignore','true');node.appendChild(h)}
 activeCanvasPointer={id:e.pointerId,key,node,startX:e.clientX,startY:e.clientY,start:{...pos},mode:handle?'resize':'move',width:pr.width,height:pr.height};
 node.setPointerCapture(e.pointerId);e.preventDefault();
});
$('slidePreview').addEventListener('pointermove',e=>{
 const a=activeCanvasPointer;if(!a||a.id!==e.pointerId)return;
 const dx=(e.clientX-a.startX)/a.width*100,dy=(e.clientY-a.startY)/a.height*100,p=slides[current].objects[a.key];
 if(a.mode==='resize'){p.w=Math.max(5,Math.min(100-a.start.x,a.start.w+dx));p.h=Math.max(4,Math.min(100-a.start.y,a.start.h+dy));}
 else {let nx=Math.max(0,Math.min(100-a.start.w,a.start.x+dx)),ny=Math.max(0,Math.min(100-a.start.h,a.start.y+dy));nx=snapValue(nx);ny=snapValue(ny);if(Math.abs((nx+a.start.w/2)-50)<1.5)nx=50-a.start.w/2;if(Math.abs((ny+a.start.h/2)-50)<1.5)ny=50-a.start.h/2;p.x=Math.max(0,Math.min(100-a.start.w,nx));p.y=Math.max(0,Math.min(100-a.start.h,ny));}drawAlignmentGuides(p.x+a.start.w/2,p.y+a.start.h/2);
 a.node.style.left=p.x+'%';a.node.style.top=p.y+'%';a.node.style.width=p.w+'%';a.node.style.height=p.h+'%';const extra=(slides[current].elements||[]).find(o=>o.id===a.key);if(extra){extra.x=p.x;extra.y=p.y;extra.w=p.w;extra.h=p.h;}
});
$('slidePreview').addEventListener('pointerup',e=>{if(activeCanvasPointer&&activeCanvasPointer.id===e.pointerId){activeCanvasPointer=null;$('slidePreview').querySelectorAll('.alignment-guide').forEach(n=>n.remove());msg('Canvas object aligned. Tap Save project to keep your changes.')}});
$('slidePreview').addEventListener('pointercancel',()=>{activeCanvasPointer=null;$('slidePreview').querySelectorAll('.alignment-guide').forEach(n=>n.remove())});
function render(){
 $('slidePreview').classList.toggle('grid-visible',$('showGrid')?.checked!==false);
 const s=slides[current], th=themes[s.theme]||themes.mint, p=$('slidePreview');
 p.classList.remove('transition-fade','transition-push','transition-zoom');if(transitionPending){const effect=s.transition||'fade';if(effect!=='none')p.classList.add('transition-'+effect);transitionPending=false;}
 p.querySelectorAll('.canvas-object').forEach(n=>{n.classList.remove('is-selected');const h=n.querySelector('.resize-handle');if(h)h.remove()});
 p.classList.remove('anim-fade','anim-rise','anim-zoom','anim-slide');if(s.animation&&s.animation!=='none')p.classList.add('anim-'+s.animation);p.classList.remove('layout-standard','layout-title','layout-split','layout-image-focus','layout-quote');p.classList.add('layout-'+(s.layout||'standard'));p.style.background=s.backgroundImage?'linear-gradient(#0003,#0003),url('+JSON.stringify(s.backgroundImage)+') center/cover no-repeat':th.bg;p.style.color=th.ink;p.querySelector('.eyebrow').textContent=s.eyebrow;
 p.querySelector('.eyebrow').style.color=th.accent;p.querySelector('h3').textContent=s.title;p.querySelector('h3').style.color=th.ink;
 p.querySelector('p').textContent=s.body;p.querySelector('p').style.color=th.body;p.querySelector('h3').style.fontSize=(s.titleSize||44)+'px';p.querySelector('h3').style.fontWeight=s.titleBold===false?'500':'800';p.querySelector('h3').style.fontStyle=s.titleItalic?'italic':'normal';p.querySelector('h3').style.color=s.titleColor||th.ink;p.querySelector('p').style.fontSize=(s.bodySize||20)+'px';p.classList.remove('text-left','text-center','text-right');p.classList.add('text-'+(s.textAlign||((s.layout==='title'||s.layout==='quote')?'center':'left')));const img=p.querySelector('.slide-image');if(s.image){img.src=s.image;img.classList.add('visible')}else{img.removeAttribute('src');img.classList.remove('visible')}p.querySelector('.shape').style.background=th.shape;
 p.querySelector('.page').textContent=String(current+1).padStart(2,'0');
 const mediaBox=$('slideMedia');mediaBox.innerHTML='';mediaBox.style.display='none';mediaBox.classList.remove('audio-only');if(s.media&&typeof s.media.data==='string'&&s.media.data.startsWith('data:')){const player=document.createElement(s.media.kind==='audio'?'audio':'video');player.src=s.media.data;player.controls=true;player.preload='metadata';if(s.media.kind==='video'){player.playsInline=true;player.setAttribute('playsinline','');}mediaBox.appendChild(player);if(s.media.kind==='audio')mediaBox.classList.add('audio-only');if(s.mediaCaption){const cap=document.createElement('div');cap.className='media-caption';cap.textContent=s.mediaCaption;mediaBox.appendChild(cap)}mediaBox.style.display='grid';}
 applyCanvasTransforms();renderExtraElements();
 $('eyebrow').value=s.eyebrow;$('title').value=s.title;$('body').value=s.body;$('speakerNotes').value=s.speakerNotes||'';$('theme').value=s.theme;$('layout').value=s.layout||'standard';$('titleSize').value=s.titleSize||44;$('bodySize').value=s.bodySize||20;$('titleColor').value=s.titleColor||th.ink;$('textAlign').value=s.textAlign||((s.layout==='title'||s.layout==='quote')?'center':'left');$('titleBold').checked=s.titleBold!==false;$('titleItalic').checked=!!s.titleItalic;$('imageUpload').value='';$('removeImage').disabled=!s.image;$('mediaCaption').value=s.mediaCaption||'';$('videoUpload').value='';$('audioUpload').value='';$('removeMedia').disabled=!s.media;
 $('slideAnimation').value=s.animation||'fade';$('slideTransition').value=s.transition||'fade';$('backgroundUpload').value='';const active=(s.elements||[]).find(o=>o.id===selectedCanvasKey);if(active)$('objectFont').value=active.font||'Arial';$('slideCount').textContent=`Slide ${current+1} of ${slides.length}`;
 $('slideList').innerHTML='';
 slides.forEach((x,i)=>{const b=document.createElement('button');b.className='slide-item'+(i===current?' active':'');b.innerHTML=`<div class="thumb">${i+1}</div><span></span>`;b.querySelector('span').textContent=x.title||'Untitled slide';b.onclick=()=>goToSlide(i);$('slideList').appendChild(b)});
}
function update(){let s=slides[current];s.eyebrow=$('eyebrow').value;s.title=$('title').value;s.body=$('body').value;s.theme=$('theme').value;s.layout=$('layout').value;render()}
['eyebrow','title','body','theme','layout','titleSize','bodySize','titleColor','textAlign','titleBold','titleItalic'].forEach(id=>$(id).addEventListener('input',()=>{recordUndo();let s=slides[current];s.eyebrow=$('eyebrow').value;s.title=$('title').value;s.body=$('body').value;s.theme=$('theme').value;s.layout=$('layout').value;s.titleSize=Number($('titleSize').value);s.bodySize=Number($('bodySize').value);s.titleColor=$('titleColor').value;s.textAlign=$('textAlign').value;s.titleBold=$('titleBold').checked;s.titleItalic=$('titleItalic').checked;applyLiveFormatting();renderListOnly()}));
function applyLiveFormatting(){const s=slides[current],p=$('slidePreview'),th=themes[s.theme]||themes.mint;p.querySelector('.eyebrow').textContent=s.eyebrow;p.querySelector('h3').textContent=s.title;p.querySelector('p').textContent=s.body;p.style.background=th.bg;p.querySelector('.eyebrow').style.color=th.accent;p.querySelector('h3').style.color=s.titleColor||th.ink;p.querySelector('h3').style.fontSize=(s.titleSize||44)+'px';p.querySelector('h3').style.fontWeight=s.titleBold===false?'500':'800';p.querySelector('h3').style.fontStyle=s.titleItalic?'italic':'normal';p.querySelector('p').style.color=th.body;p.querySelector('p').style.fontSize=(s.bodySize||20)+'px';p.classList.remove('text-left','text-center','text-right');p.classList.add('text-'+(s.textAlign||'left'));applyCanvasTransforms();} 

$('addText').onclick=()=>addCanvasElement('text');$('addRect').onclick=()=>addCanvasElement('rect');$('addCircle').onclick=()=>addCanvasElement('circle');$('addTriangle').onclick=()=>addCanvasElement('triangle');$('addArrow').onclick=()=>addCanvasElement('arrow');$('addIcon').onclick=()=>addCanvasElement('icon');
$('objectFont').onchange=()=>{const o=(slides[current].elements||[]).find(x=>x.id===selectedCanvasKey);if(!o||!['text','icon'].includes(o.type)){msg('Select a text box or icon first.');return}recordUndo();o.font=$('objectFont').value;render();msg('Font updated.')};
$('slideAnimation').onchange=()=>{recordUndo();slides[current].animation=$('slideAnimation').value;render();msg('Object animation updated.')};
$('slideTransition').onchange=()=>{recordUndo();slides[current].transition=$('slideTransition').value;render();msg('Slide transition saved for this slide.')};
$('speakerNotes').addEventListener('input',()=>{slides[current].speakerNotes=$('speakerNotes').value;});
$('mediaCaption').addEventListener('input',()=>{slides[current].mediaCaption=$('mediaCaption').value;const cap=$('slideMedia').querySelector('.media-caption');if(cap)cap.textContent=$('mediaCaption').value;});
function loadSlideMedia(file,kind){if(!file)return;if(kind==='video'&&!['video/mp4','video/webm'].includes(file.type)){msg('Choose an MP4 or WebM video.');return}if(kind==='audio'&&!['audio/mpeg','audio/wav','audio/ogg','audio/mp4','audio/x-wav'].includes(file.type)){msg('Choose an MP3, WAV, OGG or M4A audio file.');return}if(file.size>3*1024*1024){msg('For reliable phone storage, choose a media file smaller than 3 MB.');return}const reader=new FileReader();reader.onload=()=>{recordUndo();slides[current].media={kind,data:reader.result,name:file.name};render();msg(kind+' added to this slide. Save or back up your project.');};reader.onerror=()=>msg('Could not read this media file.');reader.readAsDataURL(file)}
$('videoUpload').onchange=e=>{loadSlideMedia(e.target.files&&e.target.files[0],'video');e.target.value=''};
$('audioUpload').onchange=e=>{loadSlideMedia(e.target.files&&e.target.files[0],'audio');e.target.value=''};
$('removeMedia').onclick=()=>{if(!slides[current].media){msg('This slide has no audio or video.');return}recordUndo();delete slides[current].media;delete slides[current].mediaCaption;render();msg('Slide media removed.')};

$('backgroundUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')||f.size>5*1024*1024){msg('Choose an image smaller than 5 MB.');e.target.value='';return}const r=new FileReader();r.onload=()=>{recordUndo();slides[current].backgroundImage=r.result;render();msg('Background image added. Save the project to keep it.')};r.readAsDataURL(f)};
$('removeBackground').onclick=()=>{recordUndo();delete slides[current].backgroundImage;render();msg('Background image removed.')};
$('deleteObject').onclick=()=>{if(!selectedCanvasKey){msg('Select an object first.');return}recordUndo();const s=slides[current];s.elements=(s.elements||[]).filter(o=>o.id!==selectedCanvasKey);if(s.objects)delete s.objects[selectedCanvasKey];selectedCanvasKey=null;render();msg('Selected object deleted.');};
$('layerUp').onclick=()=>{const a=slides[current].elements||[],i=a.findIndex(o=>o.id===selectedCanvasKey);if(i<0||i===a.length-1)return;recordUndo();[a[i],a[i+1]]=[a[i+1],a[i]];render();};
$('layerDown').onclick=()=>{const a=slides[current].elements||[],i=a.findIndex(o=>o.id===selectedCanvasKey);if(i<=0)return;recordUndo();[a[i],a[i-1]]=[a[i-1],a[i]];render();};
function renderListOnly(){[...$('slideList').children].forEach((b,i)=>{b.querySelector('span').textContent=slides[i].title||'Untitled slide'})}
$('addSlide').onclick=()=>{recordUndo();slides.push({eyebrow:'NEW SECTION',title:'Your new slide',body:'Add your explanation here.',theme:slides[current].theme,layout:'standard'});current=slides.length-1;render()};
$('deleteSlide').onclick=()=>{if(slides.length===1){msg('A presentation must have at least one slide.');return}recordUndo();slides.splice(current,1);current=Math.max(0,current-1);render();msg('Slide deleted.')};
$('duplicate').onclick=()=>{recordUndo();slides.splice(current+1,0,{...slides[current]});current++;render()};
function goToSlide(index){const next=Math.max(0,Math.min(slides.length-1,index));if(next===current)return;current=next;transitionPending=true;render();}
$('prev').onclick=()=>goToSlide(current-1);$('next').onclick=()=>goToSlide(current+1);
function setPresentMode(on){document.body.classList.toggle('presenting',on);$('present').style.display=on?'none':'';$('exitPresent').style.display=on?'':'none';if(on){document.querySelector('.presentation-nav').scrollIntoView({block:'nearest'});msg('Presentation mode. Use Previous/Next or your keyboard arrow keys. Press Escape to exit.')}else{msg('Returned to editing mode.')}}
$('present').onclick=()=>setPresentMode(true);$('exitPresent').onclick=()=>setPresentMode(false);
document.addEventListener('keydown',e=>{if(!document.body.classList.contains('presenting'))return;if(e.key==='Escape'){setPresentMode(false);return}if(e.key==='ArrowRight'){e.preventDefault();goToSlide(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();goToSlide(current-1)}});
$('newDeck').onclick=()=>{if(!confirm('Start a new presentation? Export or save your current work first.'))return;recordUndo();slides=[{eyebrow:'GIDY STUDIO',title:'Untitled presentation',body:'Start creating something amazing.',theme:'mint',layout:'title'}];current=0;render();msg('New presentation created.')};
$('save').onclick=()=>{try{localStorage.setItem('gidyStudioProject',JSON.stringify({version:10,slides}));msg('Project saved on this device.')}catch(e){msg('Could not save. The images may be too large; try a smaller image.')}};
$('backup').onclick=()=>{try{const data={app:'Gidy Studio',version:10,exportedAt:new Date().toISOString(),slides};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Gidy-Studio-Project-Backup.json';a.click();URL.revokeObjectURL(url);msg('Project backup downloaded.')}catch(e){msg('Backup failed: '+e.message)}};
$('importProject').onclick=()=>$('importFile').click();
$('importFile').onchange=e=>{const file=e.target.files&&e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);const incoming=Array.isArray(data)?data:data.slides;if(!Array.isArray(incoming)||!incoming.length||incoming.length>200)throw new Error('This backup does not contain a valid slide list.');const clean=incoming.map(s=>{if(!s||typeof s!=='object')throw new Error('Invalid slide data.');return {speakerNotes:String(s.speakerNotes||'').slice(0,20000),mediaCaption:String(s.mediaCaption||'').slice(0,160),...(s.media&&['audio','video'].includes(s.media.kind)&&typeof s.media.data==='string'&&s.media.data.startsWith('data:')&&s.media.data.length<5*1024*1024?{media:{kind:s.media.kind,data:s.media.data,name:String(s.media.name||'media').slice(0,180)}}:{}),transition:['fade','push','zoom','none'].includes(s.transition)?s.transition:'fade',elements:Array.isArray(s.elements)?s.elements.filter(o=>o&&typeof o.id==='string'&&['text','rect','circle','triangle','arrow','icon'].includes(o.type)).slice(0,100):[],eyebrow:String(s.eyebrow||'').slice(0,120),title:String(s.title||'Untitled slide').slice(0,300),body:String(s.body||'').slice(0,10000),theme:themes[s.theme]?s.theme:'mint',layout:['standard','title','split','image-focus','quote'].includes(s.layout)?s.layout:'standard',animation:['fade','rise','zoom','slide','none'].includes(s.animation)?s.animation:'fade',backgroundImage:typeof s.backgroundImage==='string'&&s.backgroundImage.startsWith('data:image/')&&s.backgroundImage.length<8*1024*1024?s.backgroundImage:undefined,titleSize:Number.isFinite(Number(s.titleSize))?Math.max(20,Math.min(64,Number(s.titleSize))):44,bodySize:Number.isFinite(Number(s.bodySize))?Math.max(12,Math.min(32,Number(s.bodySize))):20,titleColor:/^#[0-9a-fA-F]{6}$/.test(s.titleColor||'')?s.titleColor:undefined,textAlign:['left','center','right'].includes(s.textAlign)?s.textAlign:undefined,titleBold:s.titleBold!==false,titleItalic:!!s.titleItalic,...(s.objects&&typeof s.objects==='object'?{objects:Object.fromEntries(Object.entries(s.objects).filter(([k,v])=>['eyebrow','title','body','image'].includes(k)&&v&&['x','y','w','h'].every(n=>Number.isFinite(Number(v[n])))).map(([k,v])=>[k,{x:Math.max(0,Math.min(100,Number(v.x))),y:Math.max(0,Math.min(100,Number(v.y))),w:Math.max(1,Math.min(100,Number(v.w))),h:Math.max(1,Math.min(100,Number(v.h)))}]))}:{}),...(typeof s.image==='string'&&s.image.startsWith('data:image/')&&s.image.length<8*1024*1024?{image:s.image}:{})};});recordUndo();slides=clean;current=0;render();msg('Project imported successfully. Tap Save project to store it on this device.');}catch(err){msg('Import failed: '+err.message)}finally{$('importFile').value=''}};reader.onerror=()=>msg('Could not read that backup file.');reader.readAsText(file)};
try{const stored=JSON.parse(localStorage.getItem('gidyStudioProject')||'null');const recovered=Array.isArray(stored)?stored:stored&&stored.slides;if(Array.isArray(recovered)&&recovered.length){slides=recovered.map(s=>({...s,speakerNotes:String(s.speakerNotes||''),transition:['fade','push','zoom','none'].includes(s.transition)?s.transition:'fade',elements:Array.isArray(s.elements)?s.elements:[],theme:themes[s.theme]?s.theme:'mint',layout:['standard','title','split','image-focus','quote'].includes(s.layout)?s.layout:'standard'}));current=0;}}catch(e){console.warn('Saved project could not be restored',e)}
$('imageUpload').onchange=e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){msg('Please choose an image file.');return}if(file.size>5*1024*1024){msg('Please choose an image smaller than 5 MB.');e.target.value='';return}const reader=new FileReader();reader.onload=()=>{recordUndo();slides[current].image=reader.result;render();msg('Image added to this slide. Save the project to keep it.');};reader.onerror=()=>msg('Could not read that image. Please try another.');reader.readAsDataURL(file)};
$('applyTemplate').onclick=()=>{const t=templates[$('template').value];if(!t)return;recordUndo();slides=slides.map((s,i)=>({...s,theme:t.theme,layout:t.layout,eyebrow:i===0?t.eyebrow:(s.eyebrow||t.eyebrow)}));render();msg('Professional template applied to all slides. You can customize each slide now.')};
$('removeImage').onclick=()=>{recordUndo();delete slides[current].image;render();msg('Slide image removed.')};
$('undo').onclick=undo;$('redo').onclick=redo;
document.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;if(!mod)return;const key=e.key.toLowerCase();if(key==='z'&&!e.shiftKey){e.preventDefault();undo()}else if(key==='y'||(key==='z'&&e.shiftKey)){e.preventDefault();redo()}});
$('animate').onclick=()=>{const p=$('slidePreview'),a=slides[current].animation||'fade';p.classList.remove('anim-fade','anim-rise','anim-zoom','anim-slide');void p.offsetWidth;if(a!=='none')p.classList.add('anim-'+a);msg('Animation preview playing: '+a+'.')};
$('generate').onclick=()=>{const topic=$('prompt').value.trim();if(!topic){msg('Enter a topic first.');return}
 const chunks=[
  ['OVERVIEW',topic,`Introduce ${topic} and explain why it matters.`],
  ['KEY CONCEPTS','Core concepts and foundations',`Explain the most important ideas related to ${topic}.`],
  ['DETAILED EXPLANATION','How it works',`Present the main principles, steps, or mechanisms of ${topic}.`],
  ['PRACTICAL APPLICATION','Examples and applications',`Give practical examples and real-world applications of ${topic}.`],
  ['SUMMARY','Key takeaways',`Summarize the most important points about ${topic}.`]
 ];
 recordUndo();slides=chunks.map((c,i)=>({eyebrow:c[0],title:c[1],body:c[2],theme:['mint','midnight','sunset','violet','mint'][i],layout:['title','split','standard','image-focus','title'][i]}));current=0;render();msg('A 5-slide outline was generated. Edit every slide to add accurate detail.')};
function pptObjectBox(s,key,fallback){const o=s.objects&&s.objects[key];if(!o)return fallback;return {x:Math.max(0,Math.min(12.4,Number(o.x)/100*12.4)),y:Math.max(0,Math.min(6.9,Number(o.y)/100*6.9)),w:Math.max(.3,Math.min(12.4-Number(o.x)/100*12.4,Number(o.w)/100*12.4)),h:Math.max(.2,Math.min(6.9-Number(o.y)/100*6.9,Number(o.h)/100*6.9))};}
$('exportPpt').onclick=async()=>{if(!window.PptxGenJS){msg('PowerPoint library did not load. Check your internet connection and reload.');return}
 try{const pptx=new PptxGenJS();pptx.layout='LAYOUT_WIDE';pptx.author='Gidy Studio';pptx.subject='Presentation created with Gidy Studio';pptx.title='Gidy Studio Presentation';
 slides.forEach((s,i)=>{const t=themes[s.theme]||themes.mint;let sl=pptx.addSlide();sl.background={color:t.bg.replace('#','')};if(s.backgroundImage){sl.addImage({data:s.backgroundImage,x:0,y:0,w:13.333,h:7.5});}const layout=s.layout||'standard';let title={x:.7,y:1.55,w:11.3,h:1.8,align:'left'},body={x:.75,y:3.65,w:10.8,h:2.1,align:'left'},img={x:8.0,y:2.0,w:3.6,h:3.4};if(layout==='title'||layout==='quote'){title={x:1.1,y:2.0,w:10.5,h:1.8,align:'center'};body={x:1.5,y:4.0,w:9.5,h:1.4,align:'center'};}else if(layout==='split'){title={x:.7,y:2.0,w:5.2,h:1.7,align:'left'};body={x:.75,y:4.0,w:5.1,h:1.6,align:'left'};img={x:6.5,y:1.8,w:5.0,h:4.5};}else if(layout==='image-focus'){title={x:1.0,y:1.15,w:10.3,h:1.0,align:'center'};body={x:1.2,y:2.1,w:9.9,h:.8,align:'center'};img={x:2.8,y:3.0,w:6.5,h:3.2};}title=pptObjectBox(s,'title',title);body=pptObjectBox(s,'body',body);const eyebrowBox=pptObjectBox(s,'eyebrow',{x:.7,y:.55,w:11,h:.35});sl.addText(s.eyebrow,{...eyebrowBox,fontFace:'Aptos',fontSize:13,bold:true,color:t.accent.replace('#',''),charSpacing:2});sl.addText(s.title,{...title,fontFace:'Aptos Display',align:s.textAlign||title.align,fontSize:Math.max(16,Math.min(54,(s.titleSize||44)*.72)),bold:s.titleBold!==false,italic:!!s.titleItalic||layout==='quote',color:(s.titleColor||t.ink).replace('#',''),breakLine:false,fit:'shrink'});sl.addText(s.body,{...body,align:s.textAlign||body.align,fontFace:'Aptos',fontSize:Math.max(10,Math.min(28,(s.bodySize||20)*.72)),color:t.body.replace('#',''),breakLine:false,fit:'shrink'});if(s.image){img=pptObjectBox(s,'image',img);sl.addImage({data:s.image,...img,sizingCrop:true});}(s.elements||[]).forEach(o=>{const b={x:o.x/100*12.4,y:o.y/100*6.9,w:o.w/100*12.4,h:o.h/100*6.9};if(o.type==='text'||o.type==='icon'||o.type==='arrow'){sl.addText(o.text||(o.type==='arrow'?'➜':''),{...b,fontFace:o.font||'Aptos',fontSize:o.type==='icon'?30:20,color:(o.fill||'#17233b').replace('#',''),fit:'shrink',bold:true});}else{const st=o.type==='circle'?pptx.ShapeType.ellipse:o.type==='triangle'?pptx.ShapeType.triangle:o.type==='arrow'?pptx.ShapeType.rightArrow:pptx.ShapeType.rect;sl.addShape(st,{...b,fill:{color:(o.fill||'#ff75c8').replace('#','')},line:{color:(o.fill||'#ff75c8').replace('#','')}});}});sl.addText(String(i+1).padStart(2,'0'),{x:11.8,y:6.65,w:.7,h:.3,fontSize:10,color:t.body.replace('#',''),align:'right'});});
 await pptx.writeFile({fileName:'Gidy-Studio-Presentation.pptx'});msg('PowerPoint downloaded. Note: embedded audio/video is preview-only in V10 and is not embedded in PPTX export yet.') }catch(e){msg('PPTX export failed: '+e.message)}};
$('exportPdf').onclick=async()=>{if(!window.html2canvas||!window.jspdf){msg('PDF libraries did not load. Check internet and reload.');return}
 try{const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'});const p=$('slidePreview'),old=current;
 for(let i=0;i<slides.length;i++){current=i;render();const canvas=await html2canvas(p,{scale:2,backgroundColor:null});if(i)pdf.addPage();pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,841.89,595.28)}
 current=old;render();pdf.save('Gidy-Studio-Presentation.pdf');msg('PDF downloaded. Note: interactive audio/video playback is not included in PDF export.') }catch(e){msg('PDF export failed: '+e.message)}};
render();lastSnapshot=snapshot();updateHistoryButtons();
