import concurrent.futures as cf, hashlib, os, time, urllib.request, sys
urls=[u.strip() for u in open("urls.txt") if u.strip()]
def get(u):
    name=hashlib.sha1(u.encode()).hexdigest()[:16]+".html"
    p=os.path.join("raw",name)
    if os.path.exists(p) and os.path.getsize(p)>1000: return u,name,"cached"
    for attempt in range(3):
        try:
            req=urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0 (FF21 site migration)"})
            with urllib.request.urlopen(req,timeout=30) as r:
                data=r.read(); code=r.status; final=r.geturl()
            open(p,"wb").write(data); time.sleep(0.3)
            return u,name,f"{code} {final if final!=u else ''}"
        except Exception as e:
            err=str(e); time.sleep(2)
    return u,name,"ERR "+err
with cf.ThreadPoolExecutor(4) as ex, open("index.tsv","w") as out:
    for u,name,st in ex.map(get,urls):
        out.write(f"{u}\t{name}\t{st}\n")
