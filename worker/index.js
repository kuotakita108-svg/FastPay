const userTransactions=new Map()
const adminTransactions=[
  {id:'FP-1048',customer:'Nadia Putri',email:'nadia@example.com',method:'QRIS',amount:1250000,status:'Berhasil',created_at:new Date(Date.now()-1080000).toISOString()},
  {id:'FP-1047',customer:'Rizky Pratama',email:'rizky@example.com',method:'Virtual Account',amount:875000,status:'Berhasil',created_at:new Date(Date.now()-2580000).toISOString()}
]
const customers=[{id:'CUS-1001',name:'Nadia Putri',email:'nadia@example.com',transactions:18,total_spent:12850000},{id:'CUS-1002',name:'Rizky Pratama',email:'rizky@example.com',transactions:12,total_spent:8300000}]
const productGroups={
  Pulsa:{Telkomsel:[5,10,25,50,100],Indosat:[10,25,50,100],XL:[10,25,50,100],Tri:[10,25,50],AXIS:[10,25,50]},
  'Paket Data':{Telkomsel:[5,10,15,25],Indosat:[7,15,25],XL:[8,15,25],Tri:[6,12,25],AXIS:[3,8,15]},
  'E-Wallet':{DANA:[20,50,100,200],OVO:[20,50,100,200],GoPay:[20,50,100,200],ShopeePay:[20,50,100,200],LinkAja:[20,50,100]},
  'Token PLN':{PLN:[20,50,100,200,500]},
  'Voucher Game':{'Mobile Legends':[86,172,257,344],'Free Fire':[70,140,355,720],'PUBG Mobile':[60,325,660]},
  BPJS:{'BPJS Kesehatan':[1,2,3]},PDAM:{'PDAM Jakarta':[1],'PDAM Bandung':[1],'PDAM Surabaya':[1]},
  'Internet & TV':{IndiHome:[1],Biznet:[1],MyRepublic:[1],'MNC Vision':[1],'K-Vision':[1]},Pascabayar:{'Telkomsel Halo':[1],'XL Prioritas':[1],'Indosat Postpaid':[1]}
}
const products=Object.entries(productGroups).flatMap(([category,providers])=>Object.entries(providers).flatMap(([operator,values])=>values.map((value,index)=>{const money=['Pulsa','E-Wallet','Token PLN'].includes(category),data=category==='Paket Data',game=category==='Voucher Game',nominal=money?value*1000:value,name=money?`${category==='Pulsa'?'Pulsa':category==='Token PLN'?'Token PLN':'Top Up '+operator} ${nominal.toLocaleString('id-ID')}`:data?`${operator} Internet ${value} GB / 30 Hari`:game?`${value} ${operator==='PUBG Mobile'?'UC':'Diamonds'}`:`Bayar ${operator}`;return{id:`${category}-${operator}-${value}`.replaceAll(' ','-').toUpperCase(),operator,name,category,nominal,price:money?nominal+750:data?value*3500+9000:game?value*250+500:2500+index*500,stock:999}})))
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=UTF-8','cache-control':'no-store'}})
const body=async request=>{try{return await request.json()}catch{return{}}}
const tokenUser=request=>{const token=(request.headers.get('authorization')||'').replace('Bearer ','');try{return JSON.parse(atob(token.split('.')[0])).id}catch{return''}}
const authResult=user=>{const payload=btoa(JSON.stringify({id:user.id,role:user.role,exp:Date.now()+86400000}));return{token:`${payload}.fastpay`,user}}
function login(input){if((input.username||'').toLowerCase()!=='octa')return null;const users={octa11:{id:'USR-001',username:'octa',name:'Octa User',role:'user',balance:275000,phone:'081234567890',email:'octa@gmail.com'},octa22:{id:'MST-001',username:'octa',name:'Octa Master',role:'master',balance:25000000,phone:'081234567890',email:'master@fastpay.id'},octa33:{id:'ADM-001',username:'octa',name:'Octa Admin',role:'admin',balance:8500000,phone:'081234567890',email:'admin@fastpay.id'}};return users[input.password]||null}
function detect(phone){const groups={Telkomsel:['0811','0812','0813','0821','0822','0852','0853'],Indosat:['0814','0815','0816','0855','0856','0857','0858'],XL:['0817','0818','0819','0859','0877','0878'],Tri:['0895','0896','0897','0898','0899'],AXIS:['0831','0832','0833','0838']};return Object.entries(groups).find(([,prefixes])=>prefixes.some(prefix=>phone.startsWith(prefix)))?.[0]||''}
export default{async fetch(request,env){const url=new URL(request.url),path=url.pathname,method=request.method;if(!path.startsWith('/api/'))return env.ASSETS.fetch(request)
  if(path==='/api/v1/health')return json({status:'ok',service:'FastPay Cloudflare'})
  if(path==='/api/v1/auth/login'&&method==='POST'){const input=await body(request),user=login(input);return user?json(authResult(user)):json({error:'username atau password salah'},401)}
  if(path==='/api/v1/auth/register'&&method==='POST'){const input=await body(request);if(!input.name||!input.phone||!input.email?.includes('@')||!input.username||input.password?.length<6)return json({error:'lengkapi data dengan benar; password minimal 6 karakter'},422);const user={id:`USR-${Date.now()}`,username:input.username.toLowerCase(),name:input.name,role:'user',balance:0,phone:input.phone,email:input.email.toLowerCase()};return json(authResult(user),201)}
  if(path==='/api/v1/products')return json(products)
  if(path==='/api/v1/customers')return json(customers)
  if(path==='/api/v1/dashboard')return json({transactions:adminTransactions.length,transaction_growth:8.4,customers:customers.length,customer_growth:5.2,success_rate:98.7,recent:adminTransactions,chart:[{label:'Sen',revenue:4200000},{label:'Sel',revenue:5600000},{label:'Rab',revenue:4800000},{label:'Kam',revenue:7200000},{label:'Jum',revenue:8600000},{label:'Sab',revenue:6800000},{label:'Min',revenue:9100000}],payment_methods:[{name:'QRIS',share:45},{name:'E-Wallet',share:30},{name:'Virtual Account',share:25}]})
  if(path==='/api/v1/services/lookup'&&method==='POST'){const input=await body(request),target=String(input.target||'').replace(/\D/g,'').replace(/^62/,'0');if(target.length<8)return json({error:'nomor atau ID pelanggan belum lengkap'},422);const provider=['pulsa','data'].includes(input.service)?detect(target):(input.provider||({pln:'PLN',bpjs:'BPJS Kesehatan'}[input.service]||''));if(!provider)return json({error:'operator atau layanan belum dipilih'},422);return json({valid:true,provider,customer_name:['ANDI P****','SITI N****','OCTA P****'][Number(target.at(-1))%3],target,message:`Data ${provider} berhasil diverifikasi`})}
  const personal=path==='/api/v1/me/transactions',admin=path==='/api/v1/transactions';if(personal||admin){const key=personal?tokenUser(request):'admin';if(personal&&!key)return json({error:'sesi tidak valid'},401);if(method==='GET')return json(personal?(userTransactions.get(key)||[]):adminTransactions);if(method==='POST'){const input=await body(request),item={id:`FP-${Date.now()}`,customer:input.customer,email:input.email,method:input.method,amount:Number(input.amount),status:'Berhasil',created_at:new Date().toISOString()};if(personal)userTransactions.set(key,[item,...(userTransactions.get(key)||[])]);else adminTransactions.unshift(item);return json(item,201)}}
  return json({error:'endpoint tidak ditemukan'},404)
}}
