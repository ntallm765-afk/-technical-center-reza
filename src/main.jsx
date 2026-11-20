import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Phone, MessageCircle, MapPin, ShieldCheck, Wrench, Tv, Radio, Fan, Speaker, Usb, Satellite, LogIn, LogOut, Plus, Pencil, Trash2, X, Save, Upload, AlertCircle} from 'lucide-react';
import {supabase, isConfigured} from './supabase';
import './style.css';

const defaults = [
 {id:'d32',name:'تغيير ليدات شاشة 32 بوصة',size:'32 بوصة',min_price:600,max_price:850,image_url:'',sort_order:1},
 {id:'d40',name:'تغيير ليدات شاشة 40 بوصة',size:'40 بوصة',min_price:700,max_price:950,image_url:'',sort_order:2},
 {id:'d43',name:'تغيير ليدات شاشة 43 بوصة',size:'43 بوصة',min_price:850,max_price:1200,image_url:'',sort_order:3},
 {id:'d50',name:'تغيير ليدات شاشة 50 بوصة',size:'50 بوصة',min_price:1500,max_price:2200,image_url:'',sort_order:4},
 {id:'d55',name:'تغيير ليدات شاشة 55 بوصة',size:'55 بوصة',min_price:2000,max_price:2800,image_url:'',sort_order:5}
];
const extraServices = [
 ['ضبط وتركيب أطباق الاستقبال',Satellite],['ملفات قنوات حديثة باستمرار',Tv],['شحن فلاشات الشاشة والريسيفر',Usb],
 ['صيانة الأجهزة المنزلية (خلاط ومروحة سقف ومروحة حائط)',Fan],['صيانة أجهزة الصوت والصبات',Speaker]
];
const initialSettings = {shop_name:'المركز الفني للصيانة',engineer:'المهندس رضا محمد فتحي',phone1:'01066216816',phone2:'01145319938',whatsapp:'01066216816',address:'قرية الوفاء – البر التاني – بجوار مسجد الحاج محمد فتحي'};
const wa = n => 'https://wa.me/2'+String(n||'01066216816').replace(/\D/g,'');
function App(){
 const [products,setProducts]=useState(defaults),[settings,setSettings]=useState(initialSettings),[loading,setLoading]=useState(true);
 const [session,setSession]=useState(null),[adminOpen,setAdminOpen]=useState(false),[loginEmail,setLoginEmail]=useState(''),[loginPass,setLoginPass]=useState(''),[loginError,setLoginError]=useState('');
 const [editing,setEditing]=useState(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const [adminRole,setAdminRole]=useState(false);
 useEffect(()=>{load(); if(!supabase)return; supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>subscription.unsubscribe();},[]);
 useEffect(()=>{if(session)checkRole();else setAdminRole(false)},[session]);
 async function load(){
   if(!supabase){setLoading(false);return}
   const [p,s]=await Promise.all([supabase.from('products').select('*').eq('active',true).order('sort_order'),supabase.from('site_settings').select('value').eq('id',1).maybeSingle()]);
   if(!p.error && p.data?.length) setProducts(p.data);
   if(!s.error && s.data?.value) setSettings({...initialSettings,...s.data.value});
   setLoading(false);
 }
 async function checkRole(){
   const {data,error}=await supabase.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
   setAdminRole(!error && !!data);
 }
 async function login(e){e.preventDefault();setLoginError('');const {error}=await supabase.auth.signInWithPassword({email:loginEmail,password:loginPass});if(error)setLoginError('تعذر تسجيل الدخول. راجع البريد وكلمة المرور أو إعدادات المدير.');else{setLoginPass('');setAdminOpen(false)}}
 async function logout(){await supabase.auth.signOut();setAdminRole(false)}
 async function saveProduct(e){
   e.preventDefault(); if(!adminRole)return; setBusy(true);
   const f=new FormData(e.currentTarget), id=editing?.id;
   const row={name:f.get('name'),size:f.get('size'),min_price:Number(f.get('min_price')),max_price:Number(f.get('max_price')),sort_order:Number(f.get('sort_order')||1),active:true};
   const file=f.get('image');
   try{
    if(file && file.size){const ext=file.name.split('.').pop().toLowerCase();const path=`${crypto.randomUUID()}.${ext}`;const up=await supabase.storage.from('product-images').upload(path,file,{upsert:false});if(up.error)throw up.error;row.image_url=supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;}
    const result=id?await supabase.from('products').update(row).eq('id',id):await supabase.from('products').insert(row);
    if(result.error)throw result.error;
    setEditing(null);await load();setNotice('تم حفظ المنتج بنجاح');
   }catch(err){setNotice('لم يتم الحفظ: '+(err.message||'حدث خطأ'))}finally{setBusy(false)}
 }
 async function removeProduct(id){if(!adminRole||!confirm('هل تريد حذف هذا المنتج؟'))return;const {error}=await supabase.from('products').delete().eq('id',id);setNotice(error?'تعذر الحذف: '+error.message:'تم حذف المنتج');await load()}
 async function saveSettings(e){e.preventDefault();if(!adminRole)return;setBusy(true);const f=new FormData(e.currentTarget);const value={shop_name:f.get('shop_name'),engineer:f.get('engineer'),phone1:f.get('phone1'),phone2:f.get('phone2'),whatsapp:f.get('whatsapp'),address:f.get('address')};const {error}=await supabase.from('site_settings').upsert({id:1,value});setNotice(error?'تعذر حفظ البيانات: '+error.message:'تم حفظ بيانات المحل');if(!error)setSettings(value);setBusy(false)}
 const contactWA=wa(settings.whatsapp);
 return <><header><nav className="nav wrap"><a className="brand" href="#"><span className="brandIcon"><Wrench/></span><span>{settings.shop_name}<small>{settings.engineer}</small></span></a><a className="navLink" href="#contact">تواصل معنا</a></nav><div className="hero wrap"><div><span className="eyebrow">صيانة باحترافية وضمان</span><h1>شاشتك وأجهزتك<br/><em>في أيدٍ أمينة</em></h1><p>صيانة الشاشات والريسيفرات والأجهزة الإلكترونية والمنزلية، مع أسعار استرشادية وضمان واضح.</p><div className="actions"><a className="btn orange" href={`tel:${settings.phone1}`}><Phone size={18}/> اتصل الآن</a><a className="btn green" href={contactWA} target="_blank" rel="noreferrer"><MessageCircle size={18}/> واتساب</a></div></div><div className="heroVisual"><div className="screen"><Tv size={92}/><span>TECHNICAL CARE</span></div><div className="toolBubble"><Wrench size={32}/></div></div></div></header>
 <main className="wrap">
 <section id="products"><div className="sectionHead"><span>خدماتنا وأسعارنا</span><h2>تغيير ليدات الشاشات</h2><p>الأسعار بالجنيه المصري وتتحدد نهائيًا بعد الفحص</p></div>{loading?<p className="center">جاري تحميل الأسعار...</p>:<div className="productGrid">{products.map((p,i)=><article className="product card" key={p.id}><div className="productPhoto">{p.image_url?<img src={p.image_url} alt={`شاشة ${p.size}`}/>:<Tv size={74}/>}</div><h3>{p.name}</h3><p>تغيير ليدات الشاشة</p><strong>{p.min_price} – {p.max_price} جنيه</strong><a className="btn blue full" href={`${contactWA}?text=${encodeURIComponent('أرغب في الاستفسار عن '+p.name)}`} target="_blank" rel="noreferrer">اطلب الخدمة عبر واتساب</a></article>)}</div>}</section>
 <section><div className="sectionHead"><span>راحة بال وثقة</span><h2>ضمان المركز الفني</h2></div><div className="threeGrid"><div className="card warranty"><ShieldCheck/><b>سنة كاملة</b><p>ضمان على ليدات أي شاشة</p></div><div className="card warranty"><ShieldCheck/><b>3 شهور</b><p>ضمان على صيانة أي شاشة</p></div><div className="card warranty"><ShieldCheck/><b>3 شهور</b><p>ضمان على أي ريسيفر</p></div></div></section>
 <section><div className="sectionHead"><span>خدمات متنوعة</span><h2>خدمات أخرى</h2></div><div className="serviceGrid">{extraServices.map(([name,Icon])=><div className="card service" key={name}><span><Icon/></span><b>{name}</b></div>)}</div></section>
 <section id="contact" className="contact"><div><span className="eyebrow">يسعدنا تواصلكم</span><h2>تواصل مع المركز الفني</h2><p>{settings.engineer}</p><p><MapPin size={18}/> {settings.address}</p><p><Phone size={18}/> <a href={`tel:${settings.phone1}`}>{settings.phone1}</a>　|　<a href={`tel:${settings.phone2}`}>{settings.phone2}</a></p><div className="actions"><a className="btn green" href={contactWA} target="_blank" rel="noreferrer"><MessageCircle/> راسلنا على واتساب</a><a className="btn light" href={`tel:${settings.phone1}`}>اتصل الآن</a></div></div><div className="contactMark"><Wrench size={60}/><b>خدمتكم شرف لنا</b></div></section>
 <section className="adminEntry"><div><h3>إدارة الموقع</h3><p>دخول مخصص لإدارة المنتجات والأسعار وبيانات المحل.</p></div><button className="btn dark" onClick={()=>setAdminOpen(true)}><LogIn size={17}/> دخول الإدارة</button></section>
 </main><footer>© {new Date().getFullYear()} {settings.shop_name} – {settings.engineer}</footer>
 {adminOpen&&<div className="modalBackdrop" onClick={()=>setAdminOpen(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setAdminOpen(false)}><X/></button>{!session?<><h2>تسجيل دخول الإدارة</h2><p>استخدم حساب المدير الذي أنشأته في Supabase.</p><form onSubmit={login} className="form"><label>البريد الإلكتروني<input type="email" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/></label><label>كلمة المرور<input type="password" required value={loginPass} onChange={e=>setLoginPass(e.target.value)}/></label>{loginError&&<p className="error">{loginError}</p>}<button className="btn blue full">دخول آمن</button></form></>:!adminRole?<><h2>الحساب غير مصرح له</h2><p>تم تسجيل الدخول، لكن هذا الحساب ليس ضمن مديري الموقع. أضف الحساب إلى جدول admin_users من لوحة Supabase.</p><button className="btn dark" onClick={logout}>تسجيل الخروج</button></>:<><div className="adminTitle"><div><h2>لوحة إدارة الموقع</h2><p>مرحبًا بك في إدارة المركز الفني</p></div><button className="btn dark" onClick={logout}><LogOut size={16}/> خروج</button></div>{notice&&<p className="notice">{notice}</p>}<div className="adminTabs"><button onClick={()=>setEditing({})}><Plus size={16}/> إضافة منتج</button><button onClick={()=>document.getElementById('settingsForm').scrollIntoView({behavior:'smooth'})}>بيانات المحل</button></div><div className="manageList">{products.map(p=><div className="manageRow" key={p.id}><span>{p.name}<small>{p.min_price} – {p.max_price} جنيه</small></span><button onClick={()=>setEditing(p)}><Pencil size={16}/></button><button className="danger" onClick={()=>removeProduct(p.id)}><Trash2 size={16}/></button></div>)}</div>{editing&&<form className="form editor" onSubmit={saveProduct}><div className="adminTitle"><h3>{editing.id?'تعديل المنتج':'إضافة منتج'}</h3><button type="button" className="iconBtn" onClick={()=>setEditing(null)}><X/></button></div><label>اسم الخدمة<input name="name" required defaultValue={editing.name||''}/></label><label>مقاس الشاشة<input name="size" required defaultValue={editing.size||''}/></label><div className="two"><label>أقل سعر<input name="min_price" type="number" min="0" required defaultValue={editing.min_price??''}/></label><label>أعلى سعر<input name="max_price" type="number" min="0" required defaultValue={editing.max_price??''}/></label></div><label>ترتيب العرض<input name="sort_order" type="number" defaultValue={editing.sort_order||1}/></label><label>صورة المنتج<input name="image" type="file" accept="image/*"/></label><button className="btn blue full" disabled={busy}><Save size={17}/> {busy?'جارٍ الحفظ...':'حفظ المنتج'}</button></form>}<form id="settingsForm" className="form editor" onSubmit={saveSettings}><h3>بيانات المحل والتواصل</h3>{[['shop_name','اسم المحل'],['engineer','اسم المهندس'],['phone1','رقم الاتصال الأول'],['phone2','رقم الاتصال الثاني'],['whatsapp','رقم واتساب'],['address','العنوان']].map(([k,label])=><label key={k}>{label}<input name={k} defaultValue={settings[k]}/></label>)}<button className="btn blue full" disabled={busy}>حفظ بيانات المحل</button></form></>}</div></div>}
 {notice&&!adminOpen&&<div className="toast">{notice}</div>}
 {!isConfigured&&<div className="setupNotice"><AlertCircle size={18}/> الموقع في وضع المعاينة. أضف إعدادات Supabase في متغيرات البيئة لتفعيل قاعدة البيانات وتسجيل الدخول.</div>}
 </>}
createRoot(document.getElementById('root')).render(<App/>);
