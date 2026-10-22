# Generates production-architecture.svg (six-month, production-grade stage) used by architecture.md section 11
o=[];a=o.append
a('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 900" width="680" height="900" role="img">')
a('<title>Shazlo production-grade architecture for the six-month stage</title>')
a('''<style>
text{font-family:"Segoe UI",Arial,sans-serif;fill:#2c2c2a}
.th{font-size:14px;font-weight:600}.ts{font-size:12px;fill:#5f5e5a}
.box{fill:#f7f6f2;stroke:#888780;stroke-width:.8}
.arr{stroke:#5f5e5a;stroke-width:1.5;fill:none}
.dash{fill:none;stroke:#b4b2a9;stroke-width:1;stroke-dasharray:4 4}
.teal rect{fill:#e1f5ee;stroke:#0f6e56;stroke-width:.8}.teal .th{fill:#085041}.teal .ts{fill:#0f6e56}
.purple rect{fill:#eeedfe;stroke:#534ab7;stroke-width:.8}.purple .th{fill:#3c3489}.purple .ts{fill:#534ab7}
</style>''')
a('<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="#5f5e5a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>')
def txt(c,x,y,t,anc="middle"): a(f'<text class="{c}" x="{x}" y="{y}" text-anchor="{anc}" dominant-baseline="central">{t}</text>')
def box(x,y,w,h,rx=8): a(f'<rect class="box" x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>')
def arrow(x1,y1,x2,y2,both=False):
    ms=' marker-start="url(#arrow)"' if both else ''
    a(f'<line class="arr" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" marker-end="url(#arrow)"{ms}/>')
def cont(x,y,w,h,label,ly): a(f'<rect class="dash" x="{x}" y="{y}" width="{w}" height="{h}" rx="12"/>'); a(f'<text class="ts" x="{x+14}" y="{ly}">{label}</text>')
cont(20,20,640,84,"Clients",38)
for i,(t,s) in enumerate([("Customer app","React Native"),("Vendor portal","React, Vercel"),("Admin screens","SQLAdmin, pages"),("Website","Vite, Vercel")]):
    x=40+155*i; box(x,46,140,48); txt("th",x+70,62,t); txt("ts",x+70,80,s); arrow(x+70,106,x+70,130)
cont(20,132,640,80,"Edge",150)
box(40,158,280,44); txt("th",180,173,"Cloudflare"); txt("ts",180,191,"CDN, WAF, rate limits, Access")
box(360,158,280,44); txt("th",500,173,"Load balancer"); txt("ts",500,191,"Caddy, health checks, 2 hosts")
arrow(322,180,358,180)
arrow(170,214,170,246); a('<text class="ts" x="180" y="234">api</text>')
arrow(510,214,510,246); a('<text class="ts" x="520" y="234">vendor-api, admin</text>')
a('<g class="teal"><rect x="20" y="248" width="300" height="268" rx="16"/>'); txt("th",170,270,"Core service"); txt("ts",170,288,"Identity, discovery, commerce"); a('</g>')
a('<g class="purple"><rect x="360" y="248" width="300" height="268" rx="16"/>'); txt("th",510,270,"Vendor-admin service"); txt("ts",510,288,"Seller back-office"); a('</g>')
core=[("Web, 2 instances","Django + DRF"),("Worker","ARQ, retries"),("Scheduler","timers, reconcile"),("Feed, taste","pgvector, queues"),("Orders, stock, payments","Razorpay")]
vend=[("Web, 2 instances","FastAPI"),("Worker","ARQ, imports, mail"),("Scheduler","statements, reconcile"),("Catalog, fulfilment","SQLAlchemy"),("Admin screens","SQLAdmin")]
for rows,x0 in ((core,34),(vend,374)):
    for i,(t,s) in enumerate(rows):
        y=302+42*i; box(x0,y,272,34,4); txt("th",x0+12,y+17,t,"start"); txt("ts",x0+260,y+17,s,"end")
arrow(358,380,322,380); a('<text class="ts" x="340" y="370" text-anchor="middle">call</text>')
arrow(322,420,358,420,True); a('<text class="ts" x="340" y="440" text-anchor="middle">event</text>')
arrow(170,518,170,548); arrow(510,518,510,548)
cont(20,550,640,100,"Data",568)
for x,t,s in [(34,"Managed Postgres","primary + replica, 2 databases"),(242,"Redis","queues, state (AOF), cache"),(450,"Object storage","images, backups, WAL")]:
    box(x,576,196,62); txt("th",x+98,598,t); txt("ts",x+98,618,s)
cont(20,672,640,84,"Outside services",690)
for i,(t,s) in enumerate([("Razorpay","Payments"),("Modal","Embeddings"),("Google","Push, sign-in"),("Messaging","Vendor mail"),("Image CDN","Cloudinary, R2")]):
    x=34+120*i; box(x,698,112,48); txt("th",x+56,714,t); txt("ts",x+56,732,s)
cont(20,778,640,84,"Platform",796)
box(34,804,296,48); txt("th",182,820,"Observability"); txt("ts",182,838,"OpenTelemetry, logs, alerts")
box(350,804,296,48); txt("th",498,820,"CI/CD"); txt("ts",498,838,"Actions, registry, staged deploy")
a('</svg>')
open('production-architecture.svg','w',encoding='utf-8').write("\n".join(o))
