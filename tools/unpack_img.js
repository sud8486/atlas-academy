const fs=require('fs'),vm=require('vm'),path=require('path');
const OUT='/home/claude/portal/assets/qimg';
let total=0;const index={};
for(const s of ['biology','chemistry','general_science']){
  const dir='/home/claude/imgsrc/'+s; index[s]={};
  for(const f of fs.readdirSync(dir)){
    const n=f.replace('.js',''); const ctx={window:{}}; vm.runInNewContext(fs.readFileSync(dir+'/'+f,'utf8'),ctx);
    const imgs=ctx.window.__IMG; index[s][n]=Object.keys(imgs);
    for(const [k,v] of Object.entries(imgs)){
      const m=v.match(/^data:image\/(\w+);base64,(.*)$/s); if(!m){console.log('bad',s,n,k);continue}
      const p=path.join(OUT,s,'t'+n,k); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,Buffer.from(m[2],'base64')); total++;
    }
  }
}
fs.writeFileSync('/home/claude/tools/img_index.json',JSON.stringify(index));
console.log('images written',total);
