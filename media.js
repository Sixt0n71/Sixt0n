const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {pipeline}=require('node:stream/promises');
const {Transform}=require('node:stream');
const directory=path.join(__dirname,'portfolio-media');
const types={'video/mp4':'mp4','video/webm':'webm','image/gif':'gif','image/webp':'webp'};
async function upload(req,res,reply){
 const ext=types[(req.headers['content-type']||'').split(';')[0]];
 if(!ext||req.headers['x-sixton-upload']!=='1')return reply(res,415,{});
 fs.mkdirSync(directory,{recursive:true});
 const name=crypto.randomUUID()+'.'+ext, tmp=path.join(directory,name+'.part');
 let size=0;
 try{
  const limit=new Transform({transform(chunk,encoding,cb){size+=chunk.length;cb(size>512*1024*1024?Error('limit'):null,chunk);}});
  await pipeline(req,limit,fs.createWriteStream(tmp,{flags:'wx'}));if(!size)throw Error('empty');
  fs.renameSync(tmp,path.join(directory,name));reply(res,201,{src:'/media/'+name});
 }catch(e){fs.rmSync(tmp,{force:true});if(!res.destroyed)reply(res,e.message==='limit'?413:400,{});}
}
function stream(req,res,p,reply){
 const name=p.slice(7);
 if(!/^[a-f0-9-]{36}\.(mp4|webm|gif|webp)$/.test(name))return reply(res,404,{});
 const file=path.join(directory,name);
 if(!fs.existsSync(file))return reply(res,404,{});
 const size=fs.statSync(file).size, headers={'Accept-Ranges':'bytes','Content-Type':Object.keys(types).find(k=>name.endsWith('.'+types[k])),'X-Content-Type-Options':'nosniff'};
 let start=0,end=size-1,code=200;
 if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
 if(!m||(!m[1]&&!m[2]))return reply(res,416,{});
 if(m[1]){start=Number(m[1]);if(m[2])end=Math.min(Number(m[2]),end);}else start=Math.max(0,size-Number(m[2]));
 if(start>end||start>=size){res.writeHead(416,{'Content-Range':'bytes */'+size});return res.end();}
 code=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+size;
 }
 headers['Content-Length']=end-start+1;res.writeHead(code,headers);if(req.method==='HEAD')return res.end();
 const reader=fs.createReadStream(file,{start,end});res.on('close',()=>reader.destroy());reader.pipe(res);
}
function prune(before,after){const retained=new Set((after.ads||[]).map(a=>a.src));
 for(const a of before?.ads||[])if(!retained.has(a.src)&&/^\/media\/[a-f0-9-]{36}\.(mp4|webm|gif|webp)$/.test(a.src)){try{fs.unlinkSync(path.join(directory,path.basename(a.src)));}catch{}}}
module.exports={upload,stream,prune};
