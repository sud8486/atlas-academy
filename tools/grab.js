// usage: node grab.js file.html VARNAME out.json   (VARNAME may be "#data" for <script id=data type=application/json>)
const fs=require('fs'),vm=require('vm');
const [,,file,name,out]=process.argv;
const s=fs.readFileSync(file,'utf8');
let val;
if(name.startsWith('#')){
  const re=new RegExp('<script[^>]*id="'+name.slice(1)+'"[^>]*>([\\s\\S]*?)</script>');
  val=JSON.parse(s.match(re)[1]);
}else{
  const re=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=\\s*');
  const m=re.exec(s); if(!m) throw 'not found';
  let i=m.index+m[0].length; const start=i; const open=s[i]; if(!'[{'.includes(open)) throw 'not literal: '+s.slice(i,i+40);
  let depth=0,q=null;
  for(;i<s.length;i++){const c=s[i];
    if(q){ if(c==='\\'){i++;continue} if(c===q)q=null; continue;}
    if(c==='"'||c==="'"||c==='`'){q=c;continue}
    if(c==='/'&&s[i+1]==='/'){i=s.indexOf('\n',i);continue}
    if(c==='/'&&s[i+1]==='*'){i=s.indexOf('*/',i)+1;continue}
    if(c==='['||c==='{')depth++; else if(c===']'||c==='}'){depth--; if(depth===0){i++;break}}
  }
  val=vm.runInNewContext('('+s.slice(start,i)+')',{});
}
fs.writeFileSync(out,JSON.stringify(val));
console.log(file,name,'ok',JSON.stringify(val).length);
