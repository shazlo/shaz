# Generates two detailed system-design diagrams (static SVG for the docs, plus widget bodies for chat).
STYLE='''<style>
svg{--b:#b4b2a9}
text{font-family:"Segoe UI",Arial,sans-serif;fill:#2c2c2a}
.th{font-size:14px;font-weight:600}.ts{font-size:12px;fill:#5f5e5a}
.box{fill:#f7f6f2;stroke:#888780;stroke-width:.8}
.arr{stroke:#5f5e5a;stroke-width:1.5;fill:none}
.c-teal rect{fill:#e1f5ee;stroke:#0f6e56;stroke-width:.8}.c-teal .th{fill:#085041}.c-teal .ts{fill:#0f6e56}
.c-purple rect{fill:#eeedfe;stroke:#534ab7;stroke-width:.8}.c-purple .th{fill:#3c3489}.c-purple .ts{fill:#534ab7}
.c-amber circle{fill:#faeeda;stroke:#854f0b;stroke-width:.8}.c-amber .ts{fill:#633806;font-weight:600}
</style>'''
MARK='<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>'
class D:
    def __init__(s): s.o=[]
    def a(s,x): s.o.append(x)
    def txt(s,c,x,y,t,anc="middle"): s.a(f'<text class="{c}" x="{x}" y="{y}" text-anchor="{anc}" dominant-baseline="central">{t}</text>')
    def box(s,x,y,w,h,rx=8): s.a(f'<rect class="box" x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" stroke-width="0.5"/>')
    def arrow(s,x1,y1,x2,y2,both=False):
        ms=' marker-start="url(#arrow)"' if both else ''
        s.a(f'<line class="arr" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" marker-end="url(#arrow)"{ms}/>')
    def cont(s,x,y,w,h,label,ly):
        s.a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="none" stroke="var(--b)" stroke-width="0.5" stroke-dasharray="4 4"/>'); s.a(f'<text class="ts" x="{x+14}" y="{ly}">{label}</text>')
    def badge(s,x,y,n):
        s.a(f'<g class="c-amber"><circle cx="{x}" cy="{y}" r="9" stroke-width="0.5"/><text class="ts" x="{x}" y="{y}" text-anchor="middle" dominant-baseline="central">{n}</text></g>')
    def row(s,x,y,w,t,r):
        s.box(x,y,w,34,4); s.txt("th",x+12,y+17,t,"start"); s.txt("ts",x+w-12,y+17,r,"end")
    def two(s,x,y,w,h,t,sub):
        s.box(x,y,w,h); s.txt("th",x+w/2,y+17,t); s.txt("ts",x+w/2,y+36,sub)

# ---------------- diagram 1: components, data stores, connections ----------------
d=D()
d.cont(20,20,640,84,"Clients",38)
for i,(t,sub) in enumerate([("Customer app","React Native"),("Vendor portal","React, browser"),("Admin screens","browser"),("Website","browser")]):
    x=40+155*i; d.two(x,46,140,48,t,sub) if False else (d.box(x,46,140,48),d.txt("th",x+70,62,t),d.txt("ts",x+70,80,sub)); d.arrow(x+70,106,x+70,130)
d.badge(340,118,1)
d.cont(20,132,640,80,"Edge, public internet side",150)
d.box(40,158,280,44); d.txt("th",180,173,"Cloudflare"); d.txt("ts",180,191,"DNS, TLS, WAF, Access")
d.box(360,158,280,44); d.txt("th",500,173,"Caddy"); d.txt("ts",500,191,"ports 80, 443, blocks /internal")
d.arrow(322,180,358,180)
d.arrow(170,214,170,246); d.badge(190,230,2)
d.arrow(510,214,510,246); d.badge(530,230,3)
d.a('<g class="c-teal"><rect x="20" y="248" width="300" height="184" rx="16" stroke-width="0.5"/>'); d.txt("th",170,270,"Core service"); d.txt("ts",170,288,"Django, customer and commerce"); d.a('</g>')
d.a('<g class="c-purple"><rect x="360" y="248" width="300" height="184" rx="16" stroke-width="0.5"/>'); d.txt("th",510,270,"Vendor-admin service"); d.txt("ts",510,288,"FastAPI, seller back-office"); d.a('</g>')
for i,(t,r) in enumerate([("Core API","Django :8000"),("Core jobs","cron, then worker"),("Embedding cache","in memory (MVP)")]): d.row(34,300+42*i,272,t,r)
for i,(t,r) in enumerate([("Vendor API","FastAPI :8001"),("Admin UI","SQLAdmin, same process"),("Vendor jobs","cron, then worker")]): d.row(374,300+42*i,272,t,r)
d.arrow(358,358,322,358); d.badge(340,344,4)
d.arrow(322,394,358,394,True); d.badge(340,380,5)
d.arrow(110,434,110,468); d.badge(130,452,6)
d.arrow(290,434,290,468); d.badge(310,452,8)
d.arrow(410,434,410,468); d.badge(430,452,9)
d.arrow(570,434,570,468); d.badge(590,452,7)
d.cont(20,470,640,120,"Data stores: one Postgres server with two databases, plus Redis",488)
for x,t,l1,l2 in [(34,"shazlo_core","Postgres + pgvector","role core_app only"),(247,"Redis (target)","queues, feed state, cache","none in the MVP"),(460,"shazlo_vendor","Postgres","role vendor_app only")]:
    d.box(x,498,186,80); d.txt("th",x+93,516,t); d.txt("ts",x+93,538,l1); d.txt("ts",x+93,556,l2)
d.arrow(340,592,340,622); d.badge(360,608,10)
d.cont(20,624,640,70,"Backups",642)
d.box(180,650,320,36); d.txt("th",340,662,"Object storage (Cloudflare R2)"); d.txt("ts",340,678,"nightly dumps, WAL, restore tests")
d.box(20,716,640,58,12); d.txt("th",340,736,"Hosting: Docker network on one small VM at launch"); d.txt("ts",340,756,"Postgres may be a managed server in the same region instead of a container")
BODY1="\n".join(d.o); H1=800

# ---------------- diagram 2: outside integrations ----------------
e=D()
e.a('<g class="c-teal"><rect x="20" y="30" width="200" height="260" rx="16" stroke-width="0.5"/>'); e.txt("th",120,54,"Core service"); e.txt("ts",120,72,"api.shazlo.store"); e.a('</g>')
for y,t,s,n,both in [(44,"Modal (CLIP)","HTTPS: image URL in, vector out",11,False),(104,"Firebase Cloud Messaging","HTTPS push to the phone",12,False),(164,"Google sign-in","HTTPS: verify the ID token",13,False),(224,"Razorpay","orders, refunds; signed webhook",14,True)]:
    e.box(420,y,240,48); e.txt("th",540,y+16,t); e.txt("ts",540,y+34,s); e.arrow(222,y+24,418,y+24,both); e.badge(320,y+10,n)
e.a('<g class="c-purple"><rect x="20" y="330" width="200" height="190" rx="16" stroke-width="0.5"/>'); e.txt("th",120,354,"Vendor-admin service"); e.txt("ts",120,372,"vendor-api, admin"); e.a('</g>')
for y,t,s,n in [(344,"Email provider","HTTPS or SMTP: new order mail",15),(404,"Cloudinary","portal uploads, app loads images",16),(464,"WhatsApp","click-to-chat links, no API",17)]:
    e.box(420,y,240,48); e.txt("th",540,y+16,t); e.txt("ts",540,y+34,s); e.arrow(222,y+24,418,y+24); e.badge(320,y+10,n)
BODY2="\n".join(e.o); H2=560

def static(body,h): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 {h}" width="680" height="{h}" role="img">\n{STYLE}\n{MARK}\n{body}\n</svg>'
open('system-design-detail-1.svg','w',encoding='utf-8').write(static(BODY1,H1))
open('system-design-detail-2.svg','w',encoding='utf-8').write(static(BODY2,H2))


