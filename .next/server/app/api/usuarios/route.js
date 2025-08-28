(()=>{var e={};e.id=213,e.ids=[213],e.modules={1708:e=>{"use strict";e.exports=require("node:process")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},7066:e=>{"use strict";e.exports=require("node:tty")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13641:(e,r,s)=>{"use strict";s.d(r,{z:()=>t.z});var t=s(31183)},14985:e=>{"use strict";e.exports=require("dns")},16698:e=>{"use strict";e.exports=require("node:async_hooks")},21820:e=>{"use strict";e.exports=require("os")},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31183:(e,r,s)=>{"use strict";s.d(r,{z:()=>a});var t=s(29942);let a=global.__prisma??new t.PrismaClient({log:["error"]})},31421:e=>{"use strict";e.exports=require("node:child_process")},33873:e=>{"use strict";e.exports=require("path")},34631:e=>{"use strict";e.exports=require("tls")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:e=>{"use strict";e.exports=require("node:os")},51455:e=>{"use strict";e.exports=require("node:fs/promises")},53692:(e,r,s)=>{"use strict";s.r(r),s.d(r,{patchFetch:()=>M,routeModule:()=>N,serverHooks:()=>w,workAsyncStorage:()=>T,workUnitAsyncStorage:()=>y});var t={};s.r(t),s.d(t,{GET:()=>S,POST:()=>R,runtime:()=>g});var a=s(96559),o=s(48088),i=s(37719),n=s(32190),l=s(24501),p=s(18318),d=s(13641),u=s(55511),c=s.n(u);function m(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var h=s(85811);let g="nodejs";function f(){return"phase-production-build"===process.env.NEXT_PHASE||"phase-production-server"===process.env.NEXT_PHASE||"phase-static"===process.env.NEXT_PHASE||"phase-export"===process.env.NEXT_PHASE}async function v(e,r=2,s=500){let t;for(let a=0;a<=r;a++)try{return await e()}catch(o){let e=o?.code||o?.errorCode;if("PrismaClientInitializationError"!==o?.name&&"P1001"!==e||a===r)throw o;t=o,await new Promise(e=>setTimeout(e,s))}throw t}let x=l.k5(["ADMIN","GERENTE","USUARIO","FINANCEIRO","ESTOQUE","CLIENTE"]),E=l.k5(["ATIVO","INATIVO"]);async function S(e){if(f())return n.NextResponse.json({error:"Service temporarily unavailable"},{status:503});try{let{searchParams:r}=new URL(e.url),s=l.Ik({q:l.Yj().optional(),role:x.optional(),status:E.optional(),sortKey:l.k5(["nome","email","role","ativo","criadoEm"]).optional(),sortDir:l.k5(["asc","desc"]).optional(),page:l.Yj().optional().transform(e=>e?parseInt(e,10):1).refine(e=>!isNaN(e)&&e>=1,"page inv\xe1lida"),pageSize:l.Yj().optional().transform(e=>e?parseInt(e,10):20).refine(e=>!isNaN(e)&&e>=1&&e<=100,"pageSize inv\xe1lido")}).safeParse({q:r.get("q")??void 0,role:r.get("role")??void 0,status:r.get("status")??void 0,sortKey:r.get("sortKey")??void 0,sortDir:r.get("sortDir")??void 0,page:r.get("page")??void 0,pageSize:r.get("pageSize")??void 0});if(!s.success)return n.NextResponse.json({error:"INVALID_QUERY",issues:s.error.flatten()},{status:400});let{page:t,pageSize:a,q:o,role:i,status:p,sortKey:u,sortDir:c}=s.data,m=(t-1)*a,h=[],g=[];if(o){h.push("(email LIKE ? OR nomeCompleto LIKE ? OR nome LIKE ?)");let e=`%${o}%`;g.push(e,e,e)}i&&(h.push("(role = ? OR nivel = ?)"),g.push(i,i)),p&&(h.push("status = ?"),g.push(p));let f=h.length?`WHERE ${h.join(" AND ")}`:"",S=(()=>{switch(u){case"nome":return"COALESCE(nomeCompleto, nome)";case"email":return"email";case"role":return"COALESCE(role, nivel)";case"ativo":return"status";default:return"criadoEm"}})(),b=c&&"ASC"===c.toUpperCase()?"ASC":"DESC",A=`SELECT * FROM Usuario ${f} ORDER BY ${S} ${b} LIMIT ? OFFSET ?`,R=[...g,a,m],N=await v(()=>d.z.$queryRawUnsafe(A,...R)),T=`SELECT COUNT(*) as cnt FROM Usuario ${f}`,y=await v(()=>d.z.$queryRawUnsafe(T,...g)),w=Number(y?.[0]?.cnt??0),M=N.map(e=>{let r=e.nome??e.nomeCompleto??null,s=e.role??e.nivel??null,t=e.zipcode??e.cep??null;return{id:e.id,email:e.email,nomeCompleto:r??e.email,role:s,status:e.status??null,telefone:e.telefone??null,endereco1:e.endereco1??null,endereco2:e.endereco2??null,cidade:e.cidade??null,estado:e.estado??null,cep:t,anotacoes:e.anotacoes??null,ultimoLoginEm:e.ultimoLoginEm??null,criadoEm:e.criadoEm??null,atualizadoEm:e.atualizadoEm??null,avatarUrl:e.avatarUrl??null}});return n.NextResponse.json({items:M,total:w,page:t,pageSize:a},{status:200})}catch(e){return console.error("GET /api/usuarios error:",e),n.NextResponse.json({error:"INTERNAL_ERROR",message:"Erro interno do servidor"},{status:500})}}let b=l.Yj().max(32),A=l.Ik({email:l.Yj().email(),nomeCompleto:l.Yj().optional(),role:x.optional(),status:E.optional(),telefone:l.Yj().max(32).optional().or(l.eu("")).transform(e=>e||void 0).refine(e=>{if(!e)return!0;let r=e.replace(/\D/g,"");return r.length>=10&&r.length<=11},{message:"Telefone deve ter entre 10 e 11 d\xedgitos. Exemplo: (11)99999-9999"}),dataNascimento:l.KC([l.Yj(),l.p6()]).optional().transform(e=>{if(!e)return;if(e instanceof Date){if(isNaN(e.getTime()))return;let r=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),t=String(e.getDate()).padStart(2,"0");return`${r}-${s}-${t}`}let r=String(e).trim();if(r.match(/^(\d{4})-(\d{2})-(\d{2})$/))return r;let s=r.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(s){let[,e,r,t]=s,a=parseInt(r,10),o=parseInt(e,10);if(o<1||o>12||a<1||a>31)return"INVALID_DATE";let i=r.padStart(2,"0"),n=e.padStart(2,"0");return`${t}-${n}-${i}`}return"INVALID_DATE"}).refine(e=>!e||"INVALID_DATE"!==e&&!isNaN(new Date(e+"T00:00:00.000Z").getTime()),{message:"Data de nascimento inv\xe1lida. Use o formato MM/DD/YYYY (ex: 05/18/1979)"}),endereco1:l.Yj().max(191).optional().or(l.eu("")).transform(e=>e||void 0),endereco2:l.Yj().max(191).optional().or(l.eu("")).transform(e=>e||void 0),cidade:l.Yj().max(96).optional().or(l.eu("")).transform(e=>e||void 0),estado:b.optional().or(l.eu("")).transform(e=>e||void 0),cep:l.Yj().max(16).optional().or(l.eu("")).transform(e=>e||void 0).refine(e=>{if(!e)return!0;let r=e.replace(/\D/g,"");return r.length>=5&&r.length<=9&&r===e.replace(/\D/g,"")},{message:"CEP deve conter apenas n\xfameros. Exemplo: 01234567"}),anotacoes:l.Yj().optional().or(l.eu("")).transform(e=>e&&e.trim().length>0?e:void 0)});async function R(e){let r;if(f())return n.NextResponse.json({error:"Service temporarily unavailable"},{status:503});try{r=await e.json()}catch{return n.NextResponse.json({error:"INVALID_BODY",message:"JSON inv\xe1lido"},{status:400})}let s=A.safeParse(r);if(!s.success){let e=s.error.issues,r={};for(let s of e){let e=s.path[0];s.message.includes("INVALID_DATE_FORMAT")||s.message.includes("Data de nascimento inv\xe1lida")?r[e]="Data de nascimento inv\xe1lida. Use o formato MM/DD/YYYY (exemplo: 05/18/1979)":"telefone"===e&&s.message.includes("10 e 11 d\xedgitos")?r[e]="Telefone deve ter entre 10 e 11 d\xedgitos. Exemplo: (11)99999-9999":"cep"===e&&s.message.includes("apenas n\xfameros")?r[e]="CEP deve conter apenas n\xfameros. Exemplo: 01234567":"email"===e?r[e]="E-mail inv\xe1lido":r[e]=s.message}return n.NextResponse.json({error:"VALIDATION_ERROR",message:"Dados inv\xe1lidos. Verifique os campos destacados.",fields:r,issues:s.error.flatten()},{status:400})}let{email:t,nomeCompleto:a,role:o,status:i,telefone:l,dataNascimento:u,endereco1:g,endereco2:x,cidade:E,estado:S,cep:b,anotacoes:R}=s.data;try{if((await v(()=>d.z.$queryRaw`
      SELECT id FROM Usuario WHERE email = ${t} LIMIT 1
  `)).length>0)return n.NextResponse.json({error:"EMAIL_TAKEN",message:"E-mail j\xe1 cadastrado"},{status:409});let e=function(e=12){let r="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",s=c().randomBytes(e),t="";for(let a=0;a<e;a++)t+=r[s[a]%r.length];return t}(12),r=await p.default.hash(e,10),s=await v(()=>d.z.$queryRaw`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Usuario'
      `),f=new Set(s.map(e=>String(e.COLUMN_NAME))),A=["email","senha"],N=[t,r];f.has("status")&&(A.push("status"),N.push(i??"ATIVO")),f.has("nivel")?(A.push("nivel"),N.push(o??"USUARIO")):f.has("role")&&(A.push("role"),N.push(o??"USUARIO")),f.has("nomeCompleto")?(A.push("nomeCompleto"),N.push(a??null)):f.has("nome")&&(A.push("nome"),N.push(a??null)),f.has("telefone")&&(A.push("telefone"),N.push(l??null)),f.has("dataNascimento")&&(A.push("dataNascimento"),N.push(u??null)),f.has("endereco1")&&(A.push("endereco1"),N.push(g??"")),f.has("endereco2")&&(A.push("endereco2"),N.push(x??"")),f.has("cidade")&&(A.push("cidade"),N.push(E??"")),f.has("estado")&&(A.push("estado"),N.push(S??null)),f.has("zipcode")?(A.push("zipcode"),N.push(b??null)):f.has("cep")&&(A.push("cep"),N.push(b??null)),f.has("anotacoes")&&(A.push("anotacoes"),N.push(R??null)),f.has("primeiroAcesso")&&(A.push("primeiroAcesso"),N.push(!0)),f.has("senhaProvisoria")&&(A.push("senhaProvisoria"),N.push(!0)),f.has("criadoEm")&&(A.push("criadoEm"),N.push(new Date)),f.has("atualizadoEm")&&(A.push("atualizadoEm"),N.push(new Date));let T=A.map(()=>"?").join(", "),y=A.map(e=>`\`${e}\``).join(", "),w=`INSERT INTO Usuario (${y}) VALUES (${T})`;await v(()=>d.z.$executeRawUnsafe(w,...N));let M=(await v(()=>d.z.$queryRaw`
      SELECT id, email, status, criadoEm FROM Usuario WHERE email = ${t} LIMIT 1
  `))[0],D=process.env.APP_URL??"http://localhost:3000",I=process.env.ASSETS_BASE_URL??"",O=process.env.SUPPORT_EMAIL??"suporte@gladpros.com",_=a??M.email,{subject:$,html:C}=function(e){let{name:r,email:s,tempPassword:t,appUrl:a,assetsBaseUrl:o,supportEmail:i="suporte@gladpros.com"}=e,n=o?`${o}/images/LOGO_200.png`:`${a}/images/LOGO_200.png`,l="Bem-vindo \xe0 GladPros — Acesso inicial e verifica\xe7\xe3o MFA",p=`${a.replace(/\/$/,"")}/login`,d=`${a.replace(/\/$/,"")}/ajuda`,u=`
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>${m(l)}</title>
  <style>
    @font-face {
      font-family: 'Neuropol';
      src: url('${o||a}/fonts/Neuropol.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }
    body,table,td,a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table,td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
    body { margin:0; padding:0; width:100% !important; background:#f6f8fb; }
    a { color:#0098DA; text-decoration:none; }
    .hover-underline:hover { text-decoration:underline; }
    .wrapper { width:100%; background:#f6f8fb; padding:24px 0; }
    .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.08); }
    .header {
      background-color: #3E4095;
      background: linear-gradient(90deg, #3E4095, #0098DA);
      padding: 20px 24px;
      color: #ffffff;
    }
    .brand { display:flex; align-items:center; gap:12px; }
    .brand-name {
      font-family: 'Neuropol','Segoe UI',Arial,Helvetica,sans-serif;
      font-size: 18px; letter-spacing:0.5px;
    }
    .body { padding: 24px; font-family: "Gill Sans MT","Gill Sans",Calibri,"Trebuchet MS",Arial,sans-serif; color:#1F2937; line-height:1.55; }
    .h1 {
      font-family: 'Neuropol','Segoe UI',Arial,Helvetica,sans-serif;
      font-size: 22px; color:#111827; margin:0 0 8px 0;
    }
    .muted { color:#6B7280; font-size:14px; margin:0 0 16px 0; }
    .card {
      border:1px solid #E5E7EB; border-radius:12px; padding:16px; margin:16px 0;
      background: #F9FAFB;
    }
    .key { font-size:12px; color:#6B7280; }
    .val {
      background:#EEF6FB; color:#0F365E; border:1px solid #D1E7F5;
      padding:8px 12px; border-radius:10px; display:inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    .cta {
      display:inline-block; margin:8px 0 0 0; background:#0098DA; color:#ffffff !important;
      padding:12px 18px; border-radius:12px; font-weight:600;
    }
    .cta:hover { filter: brightness(1.05); }
    .step { display:flex; gap:12px; align-items:flex-start; padding:10px 0; }
    .badge {
      flex:0 0 auto; width:28px; height:28px; border-radius:8px; display:grid; place-items:center; font-weight:700; color:#fff;
      box-shadow:0 4px 12px rgba(0,0,0,.08);
      background: linear-gradient(135deg, #3E4095, #0098DA);
    }
    .step p { margin:0; }
    .footer {
      padding: 16px 24px; font-family: "Gill Sans MT","Gill Sans",Calibri,"Trebuchet MS",Arial,sans-serif;
      color:#6B7280; font-size:12px; text-align:center;
    }
    .preheader {
      display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden;
      mso-hide:all; font-size:1px; line-height:1px; max-height:0; max-width:0;
    }
    @media (max-width: 620px) {
      .body { padding: 18px; }
      .header { padding: 16px 18px; }
    }
  </style>
</head>
<body>
  <div class="preheader">${m("Sua conta foi criada. Use a senha provis\xf3ria para o primeiro login; confirmaremos via MFA e voc\xea definir\xe1 a nova senha.")}</div>
  <table role="presentation" class="wrapper" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td class="header">
              <div class="brand">
                <img src="${n}" width="140" alt="GladPros" style="display:block; border:0;"/>
                <div class="brand-name">GladPros</div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="body">
              <h1 class="h1">Ol\xe1, ${m(r)}!</h1>
              <p class="muted">Sua conta foi criada com sucesso. Utilize as credenciais abaixo <strong>apenas para o primeiro acesso</strong> ao sistema.</p>

              <div class="card">
                <div style="margin-bottom:8px;">
                  <div class="key">E-mail</div>
                  <div class="val">${m(s)}</div>
                </div>
                <div>
                  <div class="key">Senha provis\xf3ria</div>
                  <div class="val">${m(t)}</div>
                </div>
              </div>

              <div style="text-align:center;">
                <a class="cta" href="${p}" target="_blank" rel="noopener">Acessar o sistema</a>
              </div>

              <div style="height:16px;"></div>

              <div style="font-weight:600; margin-bottom:6px;">Como ser\xe1 o seu primeiro acesso?</div>

              <div class="step">
                <div class="badge">1</div>
                <p>Entre em <a class="hover-underline" href="${p}" target="_blank" rel="noopener">${p}</a> usando seu <strong>e-mail</strong> e a <strong>senha provis\xf3ria</strong>.</p>
              </div>
              <div class="step">
                <div class="badge">2</div>
                <p>Enviaremos um <strong>c\xf3digo de verifica\xe7\xe3o (MFA)</strong> por e-mail. Digite-o para confirmar sua identidade.</p>
              </div>
              <div class="step">
                <div class="badge">3</div>
                <p>Voc\xea ser\xe1 direcionado para <strong>definir uma nova senha</strong>. Ap\xf3s salvar, o acesso ser\xe1 liberado ao painel.</p>
              </div>

              <div style="height:16px;"></div>

              <div class="card" style="background:#FFF7ED; border-color:#FED7AA;">
                <div style="font-weight:700; color:#9A3412; margin-bottom:6px;">Dicas de seguran\xe7a</div>
                <ul style="margin:0 0 0 18px; padding:0;">
                  <li>N\xe3o compartilhe esta senha provis\xf3ria.</li>
                  <li>Crie uma senha forte na troca (8+ caracteres, letras, n\xfameros e s\xedmbolos).</li>
                  <li>Se voc\xea n\xe3o solicitou esta conta, por favor, ignore este e-mail.</li>
                </ul>
              </div>

              <div style="height:10px;"></div>

              <p class="muted">Precisa de ajuda? Fale com a nossa equipe: <a href="mailto:${m(i)}">${m(i)}</a>${d?` ou acesse <a href="${d}" target="_blank" rel="noopener">${d}</a>`:""}.</p>
            </td>
          </tr>

          <tr>
            <td class="footer">
              \xa9 ${new Date().getFullYear()} GladPros • Todos os direitos reservados<br />
              Este e-mail foi enviado para ${m(s)} por ser um contato cadastrado no sistema.<br />
              Caso n\xe3o reconhe\xe7a, ignore esta mensagem.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();return{subject:l,html:u,text:`Ol\xe1, ${r}!

Sua conta foi criada com sucesso. Use estas credenciais apenas para o primeiro acesso:
E-mail: ${s}
Senha provis\xf3ria: ${t}

Acesse: ${p}

Como ser\xe1 o primeiro acesso:
1) Entre com e-mail e senha provis\xf3ria.
2) Receba o c\xf3digo MFA por e-mail e confirme.
3) Defina sua nova senha e pronto!

Dicas de seguran\xe7a:
- N\xe3o compartilhe a senha provis\xf3ria.
- Crie uma senha forte na troca.
- Se n\xe3o solicitou a conta, ignore este e-mail.

Suporte: ${i}`}}({name:_,email:M.email,tempPassword:e,appUrl:D,assetsBaseUrl:I,supportEmail:O});try{await (0,h.s)(M.email,$,C)}catch(e){console.warn("[SMTP MAILER ERROR]",e)}return n.NextResponse.json({ok:!0,message:"Usu\xe1rio criado com sucesso",...M},{status:201})}catch(r){console.error("POST /api/usuarios error:",r);let e=r?.message||String(r);if("P2010"===r?.code&&e.includes("Incorrect date value"))return n.NextResponse.json({error:"VALIDATION_ERROR",message:"Data de nascimento inv\xe1lida. Use o formato MM/DD/YYYY (exemplo: 05/18/1979)",fields:{dataNascimento:"Data de nascimento inv\xe1lida. Use o formato MM/DD/YYYY (exemplo: 05/18/1979)"}},{status:400});if(e.toLowerCase().includes("telefone"))return n.NextResponse.json({error:"VALIDATION_ERROR",message:"Telefone inv\xe1lido. Deve ter entre 10 e 11 d\xedgitos.",fields:{telefone:"Telefone deve ter entre 10 e 11 d\xedgitos. Exemplo: (11)99999-9999"}},{status:400});if(e.toLowerCase().includes("cep"))return n.NextResponse.json({error:"VALIDATION_ERROR",message:"CEP inv\xe1lido. Deve conter apenas n\xfameros.",fields:{cep:"CEP deve conter apenas n\xfameros. Exemplo: 01234567"}},{status:400});return n.NextResponse.json({error:"INTERNAL_ERROR",message:"Erro interno do servidor. Verifique os dados e tente novamente."},{status:500})}}let N=new a.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/usuarios/route",pathname:"/api/usuarios",filename:"route",bundlePath:"app/api/usuarios/route"},resolvedPagePath:"C:\\Users\\gladi\\Documents\\gladpros-nextjs\\src\\app\\api\\usuarios\\route.ts",nextConfigOutput:"standalone",userland:t}),{workAsyncStorage:T,workUnitAsyncStorage:y,serverHooks:w}=N;function M(){return(0,i.patchFetch)({workAsyncStorage:T,workUnitAsyncStorage:y})}},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},57975:e=>{"use strict";e.exports=require("node:util")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},73024:e=>{"use strict";e.exports=require("node:fs")},74075:e=>{"use strict";e.exports=require("zlib")},76760:e=>{"use strict";e.exports=require("node:path")},77598:e=>{"use strict";e.exports=require("node:crypto")},78335:()=>{},78474:e=>{"use strict";e.exports=require("node:events")},79551:e=>{"use strict";e.exports=require("url")},79646:e=>{"use strict";e.exports=require("child_process")},81630:e=>{"use strict";e.exports=require("http")},85811:(e,r,s)=>{"use strict";s.d(r,{H:()=>n,s:()=>i});var t=s(49526);let a=null;process.env.SMTP_HOST&&(a=t.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT??587),secure:"true"===String(process.env.SMTP_SECURE??"false"),auth:process.env.SMTP_USER&&process.env.SMTP_PASS?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:void 0}));let o=global;async function i(e,r,s){let t=process.env.SMTP_USER||"",i=process.env.SMTP_FROM||process.env.MAIL_FROM||(t?`GladPros <${t}>`:"GladPros <no-reply@localhost>"),n=e=>{let r=e.match(/<([^>]+)>/);return r?r[1]:e},l=process.env.SMTP_ENVELOPE_FROM||t||n(i),p=n(i)!==l?l:void 0,d={from:i,to:e,subject:r,html:s,date:new Date().toISOString(),envelope:{from:l,to:e},...p?{sender:p}:{}};if(a)try{let e=await a.sendMail(d);return o.__lastMail={...d,info:e},e}catch(e){throw e}return o.__lastMail=d,d}function n(){return global.__lastMail??null}},91645:e=>{"use strict";e.exports=require("net")},94735:e=>{"use strict";e.exports=require("events")},96487:()=>{}};var r=require("../../../webpack-runtime.js");r.C(e);var s=e=>r(r.s=e),t=r.X(0,[7719,580,9942,4501,8318,9526],()=>s(53692));module.exports=t})();