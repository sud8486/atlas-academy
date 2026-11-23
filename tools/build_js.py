# Generates data-js/*.js from data/*.json so the site works from file:// (no server, no fetch).
import json,os,datetime,sys
P=sys.argv[1] if len(sys.argv)>1 else '/home/claude/portal'; D=P+'/data'; J=P+'/data-js'
os.makedirs(J+'/q',exist_ok=True)
L=lambda p: json.load(open(f'{D}/{p}',encoding='utf8'))
series=L('test-series.json'); notes=L('notes/notes.json')
cat={'built':datetime.date.today().isoformat(),'exams':L('exams.json'),'subjects':L('subjects.json'),'series':series,'notes':notes['notes'],'empty_notes':notes['empty_sources'],
     'totals':{'exams':len(L('exams.json')),'subjects':len(L('subjects.json')),'series':len(series),'tests':sum(len(s['tests']) for s in series),'questions':sum(s['question_count'] for s in series),'notes':len(notes['notes'])}}
dump=lambda o: json.dumps(o,ensure_ascii=False,separators=(',',':'))
open(J+'/catalog.js','w',encoding='utf8').write('window.CATALOG='+dump(cat)+';\n')
for s in series:
    open(f"{J}/q/{s['id']}.js",'w',encoding='utf8').write(f"(window.__Q=window.__Q||{{}})[{json.dumps(s['id'])}]="+dump(L(f"questions/{s['id']}.json"))+';\n')
print('catalog',os.path.getsize(J+'/catalog.js'),'series files',len(series))
# notes full text for search (whitespace collapsed; PDFs remain the exact copy)
import re as _re
nt={}
for n in notes['notes']:
    txt=''
    for part in n['parts']:
        if part.get('txt'):
            t=open(f"{P}/{part['txt']}",encoding='utf8').read()
            txt+='\n'.join(_re.sub(r'[ \t]{2,}',' ',l).strip() for l in t.splitlines() if l.strip() and not _re.match(r'^\s*Page \d+ of \d+\s*$',l))+'\n'
    nt[n['id']]=txt
open(J+'/notes-text.js','w',encoding='utf8').write('window.NOTES_TEXT='+dump(nt)+';\n')
print('notes-text',os.path.getsize(J+'/notes-text.js'))
