const http=require('http');
const fs=require('fs');
const path=require('path');
const zlib=require('zlib');

const root=process.cwd();
const port=8000;
const mime={
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.webp':'image/webp',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.ico':'image/x-icon',
  '.xml':'application/xml; charset=utf-8',
  '.txt':'text/plain; charset=utf-8'
};
const compressible=new Set(['.html','.css','.js','.json','.svg','.xml','.txt']);

http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    let rel=decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if(!rel) rel='index.html';
    const file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()){
      res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});
      res.end('Not found'); return;
    }
    const ext=path.extname(file).toLowerCase();
    const body=fs.readFileSync(file);
    const headers={
      'content-type':mime[ext]||'application/octet-stream',
      'cache-control':'no-store',
      'vary':'Accept-Encoding'
    };
    const ae=req.headers['accept-encoding']||'';
    if(compressible.has(ext) && /gzip/.test(ae)){
      const gz=zlib.gzipSync(body,{level:9});
      headers['content-encoding']='gzip';
      headers['content-length']=String(gz.length);
      res.writeHead(200,headers);res.end(gz);
    }else{
      headers['content-length']=String(body.length);
      res.writeHead(200,headers);res.end(body);
    }
  }catch(e){
    res.writeHead(500,{'content-type':'text/plain; charset=utf-8'});
    res.end(String(e));
  }
}).listen(port,'127.0.0.1',()=>console.log('gzip server on '+port));