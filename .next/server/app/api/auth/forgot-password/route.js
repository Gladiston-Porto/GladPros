(()=>{var e={};e.id=7556,e.ids=[2849,7556],e.modules={1708:e=>{"use strict";e.exports=require("node:process")},1737:(e,t,r)=>{"use strict";r.d(t,{HU:()=>i,fg:()=>s});var a=r(77598),o=r.n(a);function i(e=32){return o().randomBytes(e).toString("hex")}function s(e){return o().createHash("sha256").update(e).digest("hex")}},2849:(e,t,r)=>{"use strict";r.d(t,{EmailService:()=>s});var a=r(49526);function o(e){let{subject:t,preheader:r,title:a,subtitle:o,content:s,appUrl:n="http://localhost:3000",assetsBaseUrl:l,supportEmail:d="suporte@gladpros.com",ctaButton:c,footerNote:p}=e,u=l?`${l}/images/LOGO_200.png`:`${n}/images/LOGO_200.png`;return`
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>${i(t)}</title>
  <style>
    @font-face {
      font-family: 'Neuropol';
      src: url('${l||n}/fonts/Neuropol.woff2') format('woff2');
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
    .subtitle { color:#6B7280; font-size:14px; margin:0 0 16px 0; }
    .card {
      border:1px solid #E5E7EB; border-radius:12px; padding:16px; margin:16px 0;
      background: #F9FAFB;
    }
    .warning-card {
      background:#FFF7ED; border-color:#FED7AA; color:#9A3412;
    }
    .success-card {
      background:#F0FDF4; border-color:#BBF7D0; color:#15803D;
    }
    .info-card {
      background:#EEF6FB; border-color:#D1E7F5; color:#0F365E;
    }
    .danger-card {
      background:#FEF2F2; border-color:#FECACA; color:#B91C1C;
    }
    .code-display {
      text-align:center; margin:20px 0;
      background:#F8F9FA; border:2px dashed #0098DA; padding:20px; border-radius:12px;
    }
    .code-text {
      font-size:28px; font-weight:bold; color:#0098DA; letter-spacing:6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    .cta {
      display:inline-block; margin:16px 0; background:#0098DA; color:#ffffff !important;
      padding:12px 18px; border-radius:12px; font-weight:600; text-align:center;
    }
    .cta:hover { filter: brightness(1.05); }
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
  <div class="preheader">${i(r)}</div>
  <table role="presentation" class="wrapper" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td class="header">
              <div class="brand">
                <img src="${u}" width="140" alt="GladPros" style="display:block; border:0;"/>
                <div class="brand-name">GladPros</div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="body">
              <h1 class="h1">${a}</h1>
              ${o?`<p class="subtitle">${o}</p>`:""}
              
              ${s}
              
              ${c?`
              <div style="text-align:center; margin:24px 0;">
                <a class="cta" href="${c.url}" target="_blank" rel="noopener">${i(c.text)}</a>
              </div>`:""}
              
              <div style="height:16px;"></div>
              
              <p class="subtitle">Precisa de ajuda? Fale com a nossa equipe: <a href="mailto:${i(d)}">${i(d)}</a></p>
            </td>
          </tr>

          <tr>
            <td class="footer">
              \xa9 ${new Date().getFullYear()} GladPros • Todos os direitos reservados<br />
              ${p||"Este e-mail foi enviado automaticamente pelo sistema GladPros."}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()}function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}class s{static{this.transporter=null}static{this.isInitialized=!1}static getConfig(){return{host:process.env.SMTP_HOST||"localhost",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,user:process.env.SMTP_USER||"",pass:process.env.SMTP_PASS||""}}static async initializeTransporter(){if(this.isInitialized)return;let e=this.getConfig();this.transporter=a.createTransport({host:e.host,port:e.port,secure:e.secure,auth:{user:e.user,pass:e.pass},tls:{rejectUnauthorized:!1}});try{await this.transporter.verify(),this.isInitialized=!0}catch{}}static async getTransporter(){return await this.initializeTransporter(),this.transporter}static async sendMFA({to:e,userName:t,code:r,expiresInMinutes:a=5,isFirstAccess:o=!1}){try{let i=this.getMFATemplate({userName:t,code:r,expiresInMinutes:a,isFirstAccess:o});return await this.sendEmail({to:e,subject:i.subject,html:i.html,text:i.text})}catch{return{success:!1,error:"Erro desconhecido"}}}static async sendPasswordReset({to:e,userName:t,resetLink:r,expiresInHours:a=1}){try{let o=this.getPasswordResetTemplate({userName:t,resetLink:r,expiresInHours:a});return await this.sendEmail({to:e,subject:o.subject,html:o.html,text:o.text})}catch(e){return{success:!1,error:e.message}}}static async sendProvisionalPassword({to:e,userName:t,provisionalPassword:r,expiresInDays:a=7}){try{let o=this.getProvisionalPasswordTemplate({userName:t,provisionalPassword:r,expiresInDays:a});return await this.sendEmail({to:e,subject:o.subject,html:o.html,text:o.text})}catch{return{success:!1,error:"Erro ao enviar senha provis\xf3ria"}}}static async sendEmail({to:e,subject:t,html:r,text:a}){try{let o=await this.getTransporter(),i={from:`"GladPros Sistema" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:e,subject:t,html:r,text:a||r.replace(/<[^>]*>/g,"")},s=await o.sendMail(i);return{success:!0,messageId:s.messageId}}catch(e){return{success:!1,error:e.message}}}static getMFATemplate({userName:e,code:t,expiresInMinutes:r,isFirstAccess:a}){let i=a?"primeiro acesso":"login",s=`GladPros — C\xf3digo de verifica\xe7\xe3o: ${t}`,n=`Seu c\xf3digo de verifica\xe7\xe3o para ${i} na GladPros.`,l=`
      <p>Ol\xe1, <strong>${e}</strong>!</p>
      <p>Voc\xea solicitou <strong>${i}</strong> em sua conta GladPros. Para continuar, use o c\xf3digo de verifica\xe7\xe3o abaixo:</p>
      
      <div class="code-display">
        <div class="code-text">${t}</div>
      </div>
      
      <p><strong>⏰ Este c\xf3digo expira em ${r} minutos.</strong></p>
      
      <div class="card warning-card">
        <div style="font-weight:700; margin-bottom:6px;">🔒 Dicas de Seguran\xe7a</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Nunca compartilhe este c\xf3digo com ningu\xe9m</li>
          <li>Nossa equipe nunca solicitar\xe1 este c\xf3digo por telefone ou email</li>
          <li>Se n\xe3o foi voc\xea que solicitou, ignore este email com seguran\xe7a</li>
        </ul>
      </div>
    `,d=o({subject:s,preheader:n,title:"C\xf3digo de Verifica\xe7\xe3o",subtitle:`Confirma\xe7\xe3o necess\xe1ria para ${i}`,content:l});return{subject:s,html:d,text:`
GladPros - C\xf3digo de Verifica\xe7\xe3o

Ol\xe1, ${e}

Voc\xea solicitou ${i} em sua conta GladPros.
Seu c\xf3digo de verifica\xe7\xe3o \xe9: ${t}

Este c\xf3digo expira em ${r} minutos.

SEGURAN\xc7A:
- Nunca compartilhe este c\xf3digo com ningu\xe9m
- Nossa equipe nunca solicitar\xe1 este c\xf3digo por telefone ou email
- Se n\xe3o foi voc\xea que solicitou, ignore este email

Este email foi enviado automaticamente pelo sistema GladPros.
    `.trim()}}static getPasswordResetTemplate({userName:e,resetLink:t,expiresInHours:r}){let a="GladPros — Redefini\xe7\xe3o de senha solicitada",i=o({subject:a,preheader:"Link para redefinir sua senha na GladPros. Expire em breve.",title:"Redefini\xe7\xe3o de Senha",subtitle:"Solicita\xe7\xe3o para altera\xe7\xe3o da sua senha de acesso",content:`
      <p>Ol\xe1, <strong>${e}</strong>!</p>
      <p>Recebemos uma solicita\xe7\xe3o para <strong>redefinir a senha</strong> da sua conta GladPros.</p>
      
      <div class="card info-card">
        <div style="font-weight:700; margin-bottom:6px;">🔗 Link para redefini\xe7\xe3o</div>
        <p style="margin:8px 0; word-break:break-all; font-size:14px;">
          ${t}
        </p>
      </div>
      
      <p><strong>⏰ Este link expira em ${r} hora(s).</strong></p>
      
      <div class="card danger-card">
        <div style="font-weight:700; margin-bottom:6px;">⚠️ Importante</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Se voc\xea n\xe3o solicitou esta redefini\xe7\xe3o, ignore este email</li>
          <li>Sua senha atual permanecer\xe1 inalterada at\xe9 que voc\xea use este link</li>
          <li>Por seguran\xe7a, este link s\xf3 pode ser usado uma vez</li>
        </ul>
      </div>
    `,ctaButton:{text:"Redefinir Minha Senha",url:t},footerNote:"Se voc\xea n\xe3o solicitou a redefini\xe7\xe3o de senha, pode ignorar este email com seguran\xe7a."});return{subject:a,html:i,text:`GladPros - Redefini\xe7\xe3o de senha

Ol\xe1, ${e}

Recebemos uma solicita\xe7\xe3o para redefinir sua senha.
Clique no link: ${t}

Este link expira em ${r} hora(s).`}}static getProvisionalPasswordTemplate({userName:e,provisionalPassword:t,expiresInDays:r}){let a="GladPros — Bem-vindo! Sua senha provis\xf3ria",i=`
      <p>Ol\xe1, <strong>${e}</strong>!</p>
      <p>Sua conta foi criada com sucesso no sistema GladPros! Para acessar pela primeira vez, use as credenciais abaixo:</p>
      
      <div class="card success-card">
        <div style="font-weight:700; margin-bottom:8px;">🔑 Credenciais de Acesso</div>
        <div style="margin-bottom:8px;">
          <div style="font-size:12px; color:#15803D; margin-bottom:4px;">Senha Provis\xf3ria</div>
          <div style="background:#ffffff; color:#0F365E; border:1px solid #BBF7D0; padding:8px 12px; border-radius:8px; display:inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-weight:bold; letter-spacing:2px;">
            ${t}
          </div>
        </div>
      </div>
      
      <div class="card info-card">
        <div style="font-weight:700; margin-bottom:6px;">📋 Pr\xf3ximos Passos</div>
        <ol style="margin:8px 0 0 18px; padding:0;">
          <li>Acesse o sistema com sua senha provis\xf3ria</li>
          <li>Confirme sua identidade com o c\xf3digo MFA enviado por email</li>
          <li>Configure sua senha definitiva (m\xedn. 9 caracteres)</li>
          <li>Configure seu PIN de seguran\xe7a (4 d\xedgitos)</li>
          <li>Escolha uma pergunta de seguran\xe7a</li>
        </ol>
      </div>
      
      <p><strong>⏰ Esta senha provis\xf3ria expira em ${r} dias.</strong></p>
      
      <div class="card warning-card">
        <div style="font-weight:700; margin-bottom:6px;">🔒 Dicas de Seguran\xe7a</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Altere esta senha provis\xf3ria no primeiro acesso</li>
          <li>Nunca compartilhe suas credenciais com ningu\xe9m</li>
          <li>Use uma senha forte e \xfanica para sua conta</li>
        </ul>
      </div>
    `,s=o({subject:a,preheader:"Sua conta foi criada. Use a senha provis\xf3ria para o primeiro acesso.",title:`Bem-vindo, ${e}!`,subtitle:"Sua conta foi criada com sucesso",content:i,ctaButton:{text:"Acessar Sistema",url:"http://localhost:3000/login"},footerNote:"Em caso de d\xfavidas, entre em contato com o suporte."});return{subject:a,html:s,text:`GladPros - Bem-vindo!

Ol\xe1, ${e}

Sua conta foi criada! Senha provis\xf3ria: ${t}

Esta senha expira em ${r} dias.

Altere-a no primeiro acesso para maior seguran\xe7a.`}}}},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},7066:e=>{"use strict";e.exports=require("node:tty")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13641:(e,t,r)=>{"use strict";r.d(t,{z:()=>a.z});var a=r(31183)},14985:e=>{"use strict";e.exports=require("dns")},16698:e=>{"use strict";e.exports=require("node:async_hooks")},21820:e=>{"use strict";e.exports=require("os")},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31183:(e,t,r)=>{"use strict";r.d(t,{z:()=>o});var a=r(29942);let o=global.__prisma??new a.PrismaClient({log:["error"]})},31421:e=>{"use strict";e.exports=require("node:child_process")},33873:e=>{"use strict";e.exports=require("path")},34631:e=>{"use strict";e.exports=require("tls")},41399:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>v,routeModule:()=>x,serverHooks:()=>h,workAsyncStorage:()=>g,workUnitAsyncStorage:()=>f});var a={};r.r(a),r.d(a,{POST:()=>m,runtime:()=>u});var o=r(96559),i=r(48088),s=r(37719),n=r(32190),l=r(13641),d=r(1737),c=r(2849),p=r(69812);let u="nodejs";async function m(e){let t;if("phase-production-build"===process.env.NEXT_PHASE||"phase-production-server"===process.env.NEXT_PHASE||"phase-static"===process.env.NEXT_PHASE||"phase-export"===process.env.NEXT_PHASE)return n.NextResponse.json({error:"Service temporarily unavailable"},{status:503});let r=await e.json().catch(()=>({})),a=p.E9.safeParse(r);if(!a.success)return n.NextResponse.json({error:"E-mail inv\xe1lido"},{status:422});let o=a.data.email,i=(await l.z.$queryRaw`
    SELECT id, email FROM Usuario WHERE email = ${o.toLowerCase().trim()} LIMIT 1
  `)[0];if(i){let r=(0,d.HU)(32),a=(0,d.fg)(r),o=new Date(Date.now()+36e5);await l.z.passwordResetToken.create({data:{userId:i.id,tokenHash:a,expiresAt:o}}),t=`${function(e){let t=t=>e.headers.get(t)||"",r=t("x-forwarded-host")||t("host")||"localhost:3000",a=t("x-forwarded-proto")||"http";return`${a}://${r}`}(e)}/reset-senha/${r}`;try{console.log("[ForgotPassword] Tentando enviar email para:",i.email);let e=await c.EmailService.sendPasswordReset({to:i.email,userName:i.email,resetLink:t,expiresInHours:1});console.log("[ForgotPassword] Resultado do envio:",e),e.success||console.error("[ForgotPassword] Falha no envio de email:",e.error)}catch(e){console.error("Falha ao enviar e-mail de reset:",e)}}return n.NextResponse.json({ok:!0,resetUrl:void 0})}let x=new o.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/auth/forgot-password/route",pathname:"/api/auth/forgot-password",filename:"route",bundlePath:"app/api/auth/forgot-password/route"},resolvedPagePath:"C:\\Users\\gladi\\Documents\\gladpros-nextjs\\src\\app\\api\\auth\\forgot-password\\route.ts",nextConfigOutput:"standalone",userland:a}),{workAsyncStorage:g,workUnitAsyncStorage:f,serverHooks:h}=x;function v(){return(0,s.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:f})}},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:e=>{"use strict";e.exports=require("node:os")},51455:e=>{"use strict";e.exports=require("node:fs/promises")},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},57975:e=>{"use strict";e.exports=require("node:util")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},69812:(e,t,r)=>{"use strict";r.d(t,{B0:()=>m,Dm:()=>h,E9:()=>f,KS:()=>g,PQ:()=>y,X5:()=>p,Zk:()=>b,cQ:()=>w,if:()=>E,rf:()=>u,tT:()=>x,yp:()=>v});var a=r(24501);let o=a.Yj().email("Email inv\xe1lido").max(255,"Email muito longo").toLowerCase().trim(),i=a.Yj().min(6,"Senha deve ter pelo menos 6 caracteres").max(128,"Senha muito longa").refine(e=>!!/[a-z]/.test(e)&&!!/[A-Z0-9]/.test(e),"Senha deve conter pelo menos: 1 letra min\xfascula e 1 mai\xfascula ou n\xfamero"),s=a.Yj().min(2,"Nome deve ter pelo menos 2 caracteres").max(100,"Nome muito longo").trim().refine(e=>/^[a-zA-ZÀ-ÿ\s]+$/.test(e),"Nome deve conter apenas letras e espa\xe7os"),n=a.Yj().length(4,"PIN deve ter exatamente 4 d\xedgitos").refine(e=>/^\d{4}$/.test(e),"PIN deve conter apenas n\xfameros"),l=a.Yj().length(6,"C\xf3digo MFA deve ter exatamente 6 d\xedgitos").refine(e=>/^\d{6}$/.test(e),"C\xf3digo MFA deve conter apenas n\xfameros"),d=a.Yj().min(5,"Pergunta de seguran\xe7a muito curta").max(200,"Pergunta de seguran\xe7a muito longa").trim(),c=a.Yj().min(2,"Resposta muito curta").max(100,"Resposta muito longa").trim().toLowerCase(),p=a.Ik({email:o,password:a.Yj().min(1,"Senha \xe9 obrigat\xf3ria")}),u=a.Ik({userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),code:l,tipoAcao:a.k5(["LOGIN","PRIMEIRO_ACESSO","RESET_PASSWORD"]).optional()}),m=a.Ik({email:o});a.Ik({userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),novaSenha:i,pin:n,perguntaSeguranca:d,respostaSeguranca:c});let x=a.Ik({userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),newPassword:i,pin:n,securityQuestion:d,securityAnswer:c});a.Ik({token:a.Yj().min(1,"Token \xe9 obrigat\xf3rio"),novaSenha:i});let g=a.Ik({token:a.Yj().min(1,"Token \xe9 obrigat\xf3rio"),senha:i}),f=a.Ik({email:o}),h=a.Ik({email:o});a.Ik({nomeCompleto:s,email:o,tipo:a.k5(["ADMIN","USUARIO","CLIENTE"]),departamento:a.Yj().max(100,"Departamento muito longo").optional(),cargo:a.Yj().max(100,"Cargo muito longo").optional()}),a.Ik({nomeCompleto:s.optional(),email:o.optional(),tipo:a.k5(["ADMIN","USUARIO","CLIENTE"]).optional(),departamento:a.Yj().max(100,"Departamento muito longo").optional(),cargo:a.Yj().max(100,"Cargo muito longo").optional(),status:a.k5(["ATIVO","INATIVO","SUSPENSO"]).optional()}).refine(e=>Object.keys(e).length>0,"Pelo menos um campo deve ser fornecido para atualiza\xe7\xe3o");let v=a.gM("method",[a.Ik({method:a.eu("pin"),userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),pin:n}),a.Ik({method:a.eu("security"),userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),answer:c})]),b=a.Ik({userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),tipoAcao:a.k5(["LOGIN","PRIMEIRO_ACESSO","RESET_PASSWORD","RESET","DESBLOQUEIO"]).optional()}),S=a.Ik({nomeCompleto:a.Yj().optional(),email:o,role:a.Yj().optional(),ativo:a.zM().optional(),criadoEm:a.KC([a.Yj(),a.ai(),a.p6()]).optional()}),E=a.Ik({filename:a.Yj().min(1).max(128).optional(),users:a.YO(S).min(1)}),w=a.Ik({email:o.optional(),nomeCompleto:s.optional(),role:a.k5(["ADMIN","GERENTE","USUARIO","FINANCEIRO","ESTOQUE","CLIENTE"]).optional(),status:a.k5(["ATIVO","INATIVO"]).optional(),telefone:a.Yj().max(32).optional().or(a.eu("")).transform(e=>e||void 0).refine(e=>{if(!e)return!0;let t=e.replace(/\D/g,"");return t.length>=10&&t.length<=11},"Telefone deve ter entre 10 e 11 d\xedgitos. Exemplo: (11)99999-9999"),dataNascimento:a.KC([a.Yj(),a.p6()]).optional().transform(e=>{if(!e)return;if(e instanceof Date){if(isNaN(e.getTime()))return;let t=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");return`${t}-${r}-${a}`}let t=String(e).trim();if(t.match(/^(\d{4})-(\d{2})-(\d{2})$/))return t;let r=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(r){let[,e,t,a]=r,o=parseInt(t,10),i=parseInt(e,10);if(i<1||i>12||o<1||o>31)return"INVALID_DATE";let s=t.padStart(2,"0"),n=e.padStart(2,"0");return`${a}-${n}-${s}`}return"INVALID_DATE"}).refine(e=>!e||"INVALID_DATE"!==e&&!isNaN(new Date(e+"T00:00:00.000Z").getTime()),"Data de nascimento inv\xe1lida. Use o formato MM/DD/YYYY (ex: 05/18/1979)"),endereco1:a.Yj().max(191).optional().or(a.eu("")).transform(e=>e||void 0),endereco2:a.Yj().max(191).optional().or(a.eu("")).transform(e=>e||void 0),cidade:a.Yj().max(96).optional().or(a.eu("")).transform(e=>e||void 0),estado:a.Yj().max(32).optional().or(a.eu("")).transform(e=>e||void 0),cep:a.Yj().max(16).optional().or(a.eu("")).transform(e=>e||void 0).refine(e=>{if(!e)return!0;let t=e.replace(/\D/g,"");return t.length>=5&&t.length<=9&&t===e.replace(/\D/g,"")},"CEP deve conter apenas n\xfameros. Exemplo: 01234567"),anotacoes:a.Yj().optional().or(a.eu("")).transform(e=>e&&e.trim().length>0?e:void 0)}),y=a.Ik({ativo:a.zM()})},73024:e=>{"use strict";e.exports=require("node:fs")},74075:e=>{"use strict";e.exports=require("zlib")},76760:e=>{"use strict";e.exports=require("node:path")},77598:e=>{"use strict";e.exports=require("node:crypto")},78335:()=>{},78474:e=>{"use strict";e.exports=require("node:events")},79551:e=>{"use strict";e.exports=require("url")},79646:e=>{"use strict";e.exports=require("child_process")},81630:e=>{"use strict";e.exports=require("http")},91645:e=>{"use strict";e.exports=require("net")},94735:e=>{"use strict";e.exports=require("events")},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[7719,580,9942,4501,9526],()=>r(41399));module.exports=a})();