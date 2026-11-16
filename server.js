'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const media = require('./media.js');
const galleryAdmin = require('./gallery-admin.js');
const base = __dirname;
const publicDir = fs.existsSync(path.join(base,'dist','index.html')) ? path.join(base,'dist') : base;
const db = path.join(base,'portfolio-data.json');
const worksRoot = path.join(base,'works');
fs.mkdirSync(worksRoot,{recursive:true});
const imageTypes = {'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.gif':'image/gif'};
const byName = new Intl.Collator('ar',{numeric:true});
async function directoryEntries(folder){
 return (await fs.promises.readdir(folder,{withFileTypes:true})).sort((a,b)=>byName.compare(a.name,b.name));
}
async function folderGallery(){
 const categories=[], works=[];
 for(const folder of await directoryEntries(worksRoot)){
  if(!folder.isDirectory()||folder.name.startsWith('.'))continue;
  const id=Buffer.from(folder.name).toString('base64url');
  categories.push({id,ar:folder.name,en:folder.name});
  for(const file of await directoryEntries(path.join(worksRoot,folder.name))){
   const ext=path.extname(file.name);
   if(!file.isFile()||file.name.startsWith('.')||!imageTypes[ext.toLowerCase()])continue;
   const image='/work-images/'+[folder.name,file.name].map(encodeURIComponent).join('/');
   works.push({id:image,category:id,title:path.basename(file.name,ext),image});
  }
 }
 return {categories,works};
}
const passwordFile=path.join(base,'private','admin-password.txt');
if(!process.env.SIXTON_ADMIN_PASSWORD&&!fs.existsSync(passwordFile))fs.writeFileSync(passwordFile,crypto.randomBytes(18).toString('base64url'),{mode:0o600,flag:'wx'});
const password = process.env.SIXTON_ADMIN_PASSWORD || fs.readFileSync(passwordFile,'utf8').trim();
const sessions = new Map(), attempts = new Map();
const port = Number(process.env.PORT || 3000);
const types = {'.pdf':'application/pdf','.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.otf':'font/otf','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif'};
const read = () => fs.existsSync(db) ? JSON.parse(fs.readFileSync(db,'utf8')) : {revision:0, data:null};
const reply=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj));};
async function body(req,limit=96*1024*1024){let size=0;const parts=[];for await(const part of req){size+=part.length;if(size>limit)throw Error('413');parts.push(part);}return JSON.parse(Buffer.concat(parts).toString());}
const digest = s => crypto.createHash('sha256').update(String(s)).digest();
http.createServer(async(req,res)=>{
 try{
  const url = new URL(req.url,'http://localhost'), p=url.pathname;
  const token=(req.headers.cookie||'').match(/(?:^|;\s*)sixton=([\w-]+)/)?.[1];
  const logged=(sessions.get(token)||0)>Date.now();
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:");
  if(p==='/admin'||p==='/admin/'||p==='/admin/editor.js'||p==='/admin/login.js'||p==='/admin/folders.js'||p==='/admin/admin-extra.css'){
   if(req.method!=='GET')return reply(res,405,{});
   const editor=['/admin/editor.js','/admin/folders.js','/admin/admin-extra.css'].includes(p);
   if(editor&&!logged)return reply(res,401,{});
   const name=editor?path.basename(p):p.endsWith('/login.js')?'login.js':logged?'panel.html':'login.html';
   const page=fs.readFileSync(path.join(base,'private',name));
   res.writeHead(200,{'Cache-Control':'no-store','Vary':'Cookie','Content-Type':types[path.extname(name)]});return res.end(page);
  }
  if(p.startsWith('/media/')&&['GET','HEAD'].includes(req.method))return media.stream(req,res,p,reply);
  if(p==='/api/upload'&&req.method==='POST'){
   if(!logged)return reply(res,401,{});

   if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return reply(res,403,{});
   return await media.upload(req,res,reply);
  }
  if(p==='/api/site'&&req.method==='GET')return reply(res,200,{...read(),logged});
  if(p==='/api/gallery'&&req.method==='GET')return reply(res,200,await folderGallery());
  if(p.startsWith('/work-images/')&&['HEAD','GET'].includes(req.method)){
   const parts=p.slice('/work-images/'.length).split('/').map(decodeURIComponent);
   if(parts.length!==2||parts.some(n=>!n||n.startsWith('.')||/[\\/:\x00]/.test(n)))return reply(res,404,{});
   const [folder,file]=parts,dir=path.join(worksRoot,folder),target=path.join(dir,file);
   const type=imageTypes[path.extname(file).toLowerCase()];
   if(!type||!(await fs.promises.lstat(dir).catch(()=>null))?.isDirectory()||!(await fs.promises.lstat(target).catch(()=>null))?.isFile())return reply(res,404,{});
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'});
   if(req.method==='HEAD')return res.end();
   return fs.createReadStream(target).on('error',()=>res.destroy()).pipe(res);
  }
  if(p.startsWith('/api/')){
   if(req.method!=='POST'||!/^application\/json\b/.test(req.headers['content-type']||''))return reply(res,405,{});
   if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return reply(res,403,{});
   if(p==='/api/login'){
    const ip=req.socket.remoteAddress, now=Date.now(), attempt=attempts.get(ip);
    if(attempt?.until>now&&attempt.count>=10)return reply(res,429,{});
    const input=await body(req,4096);
    if(!crypto.timingSafeEqual(digest(input.password),digest(password))){attempts.set(ip,{count:(attempt?.until>now?attempt.count:0)+1,until:now+600000});return reply(res,401,{});}
    attempts.delete(ip);const key=crypto.randomBytes(32).toString('base64url');sessions.set(key,now+8*3600000);
    res.setHeader('Set-Cookie','sixton='+key+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800'+(req.socket.encrypted||req.headers.origin?.startsWith('https://')?'; Secure':''));return reply(res,200,{});
   }
   if(!logged)return reply(res,401,{});
   if(p==='/api/gallery-manage'){const input=await body(req,24*1024*1024);galleryAdmin.mutate(input);return reply(res,200,await folderGallery());}
   if(p==='/api/logout'){sessions.delete(token);res.setHeader('Set-Cookie','sixton=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return reply(res,200,{});}
   if(p==='/api/save'){
    const input=await body(req), old=read();
    if(input.revision!==old.revision)return reply(res,409,{});
    const d=input.data;if(!d||!Array.isArray(d.categories)||!Array.isArray(d.works)||!d.copy||typeof d.brand!=='string')return reply(res,400,{});
    const next={revision:old.revision+1,data:d};fs.writeFileSync(db+'.tmp',JSON.stringify(next),{mode:0o600});fs.renameSync(db+'.tmp',db);
    media.prune(old.data,d);return reply(res,200,{revision:next.revision});
   }
   return reply(res,404,{});
  }
  const name=decodeURIComponent(p).replace(/^\//,'')||'index.html';
  if(!['assets/faisal-alatawi-cv.pdf','index.html','style.css','portfolio.css','theme.css','hero.js','app.js','site.js','ads.js','works.js','copy.js','rawq.js','rawq.css','motion.js','motion.css'].includes(name)&&!/^assets\/[\w-][\w.-]*\.(?:png|jpeg|jpg|webp|avif|ttf|otf)$/i.test(name))return reply(res,404,{});
  const file=path.join(publicDir,name);if(!fs.existsSync(file))return reply(res,404,{});
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
 }catch(e){if(!res.headersSent)reply(res,e.message==='413'?413:400,{});else res.end();}
}).listen(port,()=>{console.log('Sixton: http://localhost:'+port+'/admin');if(!process.env.SIXTON_ADMIN_PASSWORD)console.log('Admin password: '+password);});
