// Re-packs each science test's images into data-js/img/<series>/t<N>.js keyed by the path used in the data.
const fs=require('fs'),vm=require('vm');
const OUT=(process.argv[2]||'/home/claude/portal')+'/data-js/img'; let n=0,files=0;
for(const s of ['biology','chemistry','general_science']){
  const dir='/home/claude/imgsrc/'+s; fs.mkdirSync(`${OUT}/${s}`,{recursive:true});
  for(const f of fs.readdirSync(dir)){
    const t=f.replace('.js',''), ctx={window:{}}; vm.runInNewContext(fs.readFileSync(dir+'/'+f,'utf8'),ctx);
    const o={}; for(const [k,v] of Object.entries(ctx.window.__IMG)){o[`assets/qimg/${s}/t${t}/${k}`]=v;n++;}
    fs.writeFileSync(`${OUT}/${s}/t${t}.js`,'Object.assign(window.__IMGS=window.__IMGS||{},'+JSON.stringify(o)+');\n'); files++;
  }
}
console.log('bundles',files,'images',n);
