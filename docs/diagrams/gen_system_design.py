# Generates system-design.svg (static, light colours) used by 03-system-architecture.md
rows_core = [("App API","Django + DRF"),("Feed, taste","NumPy, pgvector"),("Orders, stock","atomic reserve"),("Payments","Razorpay, webhook"),("Jobs, outbox","cron, HMAC"),("shazlo_core","Postgres, pgvector")]
rows_mkt = [("Vendor, admin API","FastAPI"),("Catalog authoring","SQLAlchemy"),("Fulfilment, payouts","calls Core"),("Admin screens","SQLAdmin"),("Jobs, outbox","cron, HMAC"),("shazlo_vendor","Postgres")]
o=[]
a=o.append
a('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 824" width="680" height="824" role="img">')
a('<title>Shazlo system design: Core (identity, discovery, commerce) and Vendor-admin service</title>')
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
def txt(cls,x,y,t,anchor="middle"):
    a(f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}" dominant-baseline="central">{t}</text>')
def box(x,y,w,h,rx=8): a(f'<rect class="box" x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>')
def arrow(x1,y1,x2,y2): a(f'<line class="arr" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" marker-end="url(#arrow)"/>')
def cont(x,y,w,h,label,ly): a(f'<rect class="dash" x="{x}" y="{y}" width="{w}" height="{h}" rx="12"/>'); a(f'<text class="ts" x="{x+14}" y="{ly}">{label}</text>')
cont(20,20,640,96,"Clients",38)
for i,(t,s) in enumerate([("Customer app","React Native"),("Vendor portal","React + Vite"),("Admin screens","SQLAdmin"),("Website","Vite, Vercel")]):
    x=40+155*i; box(x,48,140,56); txt("th",x+70,68,t); txt("ts",x+70,87,s); arrow(x+70,118,x+70,146)
cont(20,148,640,80,"Edge, on the VM",166)
box(40,174,280,44); txt("th",180,190,"Cloudflare"); txt("ts",180,207,"DNS, TLS, WAF, Access")
box(360,174,280,44); txt("th",500,190,"Caddy"); txt("ts",500,207,"Reverse proxy, blocks /internal")
arrow(322,196,358,196)
arrow(170,230,170,266); a('<text class="ts" x="180" y="252">api.shazlo.store</text>')
arrow(510,230,510,266); a('<text class="ts" x="520" y="252">vendor-api, admin</text>')
a('<g class="teal"><rect x="20" y="268" width="300" height="310" rx="16"/>'); txt("th",170,290,"Core service"); txt("ts",170,308,"Identity, discovery, commerce"); a('</g>')
a('<g class="purple"><rect x="360" y="268" width="300" height="310" rx="16"/>'); txt("th",510,290,"Vendor-admin service"); txt("ts",510,308,"Seller back-office, FastAPI"); a('</g>')
for rows,x0 in ((rows_core,34),(rows_mkt,374)):
    for i,(t,s) in enumerate(rows):
        y=322+42*i; box(x0,y,272,34,4); txt("th",x0+12,y+17,t,"start"); txt("ts",x0+260,y+17,s,"end")
arrow(358,400,322,400); a('<text class="ts" x="340" y="390" text-anchor="middle">call</text>')
a('<line class="arr" x1="322" y1="440" x2="358" y2="440" marker-end="url(#arrow)" marker-start="url(#arrow)"/>'); a('<text class="ts" x="340" y="460" text-anchor="middle">event</text>')
arrow(170,580,170,612); arrow(510,580,510,612)
cont(20,614,640,86,"Outside services",632)
ext=[(34,"Razorpay","Payments"),(127,"Modal","CLIP"),(220,"Google","FCM, sign-in"),(470,"Alerts","Mail, WA"),(563,"Images","Cloudinary")]
for x,t,s in ext:
    box(x,642,86,48); txt("th",x+43,659,t); txt("ts",x+43,677,s)
box(20,726,640,58,12); txt("th",340,746,"One small VM running Docker Compose"); txt("ts",340,766,"GitHub Actions deploys each repo; nightly backups to object storage")
a('</svg>')
open('system-design.svg','w',encoding='utf-8').write("\n".join(o))
