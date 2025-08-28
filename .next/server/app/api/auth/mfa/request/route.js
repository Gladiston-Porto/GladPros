(()=>{var e={};e.id=3765,e.ids=[2849,3765],e.modules={1708:e=>{"use strict";e.exports=require("node:process")},2849:(e,t,a)=>{"use strict";a.d(t,{EmailService:()=>s});var i=a(49526);function r(e){let{subject:t,preheader:a,title:i,subtitle:r,content:s,appUrl:n="http://localhost:3000",assetsBaseUrl:d,supportEmail:l="suporte@gladpros.com",ctaButton:c,footerNote:p}=e,u=d?`${d}/images/LOGO_200.png`:`${n}/images/LOGO_200.png`;return`
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>${o(t)}</title>
  <style>
    @font-face {
      font-family: 'Neuropol';
      src: url('${d||n}/fonts/Neuropol.woff2') format('woff2');
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
  <div class="preheader">${o(a)}</div>
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
              <h1 class="h1">${i}</h1>
              ${r?`<p class="subtitle">${r}</p>`:""}
              
              ${s}
              
              ${c?`
              <div style="text-align:center; margin:24px 0;">
                <a class="cta" href="${c.url}" target="_blank" rel="noopener">${o(c.text)}</a>
              </div>`:""}
              
              <div style="height:16px;"></div>
              
              <p class="subtitle">Precisa de ajuda? Fale com a nossa equipe: <a href="mailto:${o(l)}">${o(l)}</a></p>
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
</html>`.trim()}function o(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}class s{static{this.transporter=null}static{this.isInitialized=!1}static getConfig(){return{host:process.env.SMTP_HOST||"localhost",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,user:process.env.SMTP_USER||"",pass:process.env.SMTP_PASS||""}}static async initializeTransporter(){if(this.isInitialized)return;let e=this.getConfig();this.transporter=i.createTransport({host:e.host,port:e.port,secure:e.secure,auth:{user:e.user,pass:e.pass},tls:{rejectUnauthorized:!1}});try{await this.transporter.verify(),this.isInitialized=!0}catch{}}static async getTransporter(){return await this.initializeTransporter(),this.transporter}static async sendMFA({to:e,userName:t,code:a,expiresInMinutes:i=5,isFirstAccess:r=!1}){try{let o=this.getMFATemplate({userName:t,code:a,expiresInMinutes:i,isFirstAccess:r});return await this.sendEmail({to:e,subject:o.subject,html:o.html,text:o.text})}catch{return{success:!1,error:"Erro desconhecido"}}}static async sendPasswordReset({to:e,userName:t,resetLink:a,expiresInHours:i=1}){try{let r=this.getPasswordResetTemplate({userName:t,resetLink:a,expiresInHours:i});return await this.sendEmail({to:e,subject:r.subject,html:r.html,text:r.text})}catch(e){return{success:!1,error:e.message}}}static async sendProvisionalPassword({to:e,userName:t,provisionalPassword:a,expiresInDays:i=7}){try{let r=this.getProvisionalPasswordTemplate({userName:t,provisionalPassword:a,expiresInDays:i});return await this.sendEmail({to:e,subject:r.subject,html:r.html,text:r.text})}catch{return{success:!1,error:"Erro ao enviar senha provis\xf3ria"}}}static async sendEmail({to:e,subject:t,html:a,text:i}){try{let r=await this.getTransporter(),o={from:`"GladPros Sistema" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:e,subject:t,html:a,text:i||a.replace(/<[^>]*>/g,"")},s=await r.sendMail(o);return{success:!0,messageId:s.messageId}}catch(e){return{success:!1,error:e.message}}}static getMFATemplate({userName:e,code:t,expiresInMinutes:a,isFirstAccess:i}){let o=i?"primeiro acesso":"login",s=`GladPros — C\xf3digo de verifica\xe7\xe3o: ${t}`,n=`Seu c\xf3digo de verifica\xe7\xe3o para ${o} na GladPros.`,d=`
      <p>Ol\xe1, <strong>${e}</strong>!</p>
      <p>Voc\xea solicitou <strong>${o}</strong> em sua conta GladPros. Para continuar, use o c\xf3digo de verifica\xe7\xe3o abaixo:</p>
      
      <div class="code-display">
        <div class="code-text">${t}</div>
      </div>
      
      <p><strong>⏰ Este c\xf3digo expira em ${a} minutos.</strong></p>
      
      <div class="card warning-card">
        <div style="font-weight:700; margin-bottom:6px;">🔒 Dicas de Seguran\xe7a</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Nunca compartilhe este c\xf3digo com ningu\xe9m</li>
          <li>Nossa equipe nunca solicitar\xe1 este c\xf3digo por telefone ou email</li>
          <li>Se n\xe3o foi voc\xea que solicitou, ignore este email com seguran\xe7a</li>
        </ul>
      </div>
    `,l=r({subject:s,preheader:n,title:"C\xf3digo de Verifica\xe7\xe3o",subtitle:`Confirma\xe7\xe3o necess\xe1ria para ${o}`,content:d});return{subject:s,html:l,text:`
GladPros - C\xf3digo de Verifica\xe7\xe3o

Ol\xe1, ${e}

Voc\xea solicitou ${o} em sua conta GladPros.
Seu c\xf3digo de verifica\xe7\xe3o \xe9: ${t}

Este c\xf3digo expira em ${a} minutos.

SEGURAN\xc7A:
- Nunca compartilhe este c\xf3digo com ningu\xe9m
- Nossa equipe nunca solicitar\xe1 este c\xf3digo por telefone ou email
- Se n\xe3o foi voc\xea que solicitou, ignore este email

Este email foi enviado automaticamente pelo sistema GladPros.
    `.trim()}}static getPasswordResetTemplate({userName:e,resetLink:t,expiresInHours:a}){let i="GladPros — Redefini\xe7\xe3o de senha solicitada",o=r({subject:i,preheader:"Link para redefinir sua senha na GladPros. Expire em breve.",title:"Redefini\xe7\xe3o de Senha",subtitle:"Solicita\xe7\xe3o para altera\xe7\xe3o da sua senha de acesso",content:`
      <p>Ol\xe1, <strong>${e}</strong>!</p>
      <p>Recebemos uma solicita\xe7\xe3o para <strong>redefinir a senha</strong> da sua conta GladPros.</p>
      
      <div class="card info-card">
        <div style="font-weight:700; margin-bottom:6px;">🔗 Link para redefini\xe7\xe3o</div>
        <p style="margin:8px 0; word-break:break-all; font-size:14px;">
          ${t}
        </p>
      </div>
      
      <p><strong>⏰ Este link expira em ${a} hora(s).</strong></p>
      
      <div class="card danger-card">
        <div style="font-weight:700; margin-bottom:6px;">⚠️ Importante</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Se voc\xea n\xe3o solicitou esta redefini\xe7\xe3o, ignore este email</li>
          <li>Sua senha atual permanecer\xe1 inalterada at\xe9 que voc\xea use este link</li>
          <li>Por seguran\xe7a, este link s\xf3 pode ser usado uma vez</li>
        </ul>
      </div>
    `,ctaButton:{text:"Redefinir Minha Senha",url:t},footerNote:"Se voc\xea n\xe3o solicitou a redefini\xe7\xe3o de senha, pode ignorar este email com seguran\xe7a."});return{subject:i,html:o,text:`GladPros - Redefini\xe7\xe3o de senha

Ol\xe1, ${e}

Recebemos uma solicita\xe7\xe3o para redefinir sua senha.
Clique no link: ${t}

Este link expira em ${a} hora(s).`}}static getProvisionalPasswordTemplate({userName:e,provisionalPassword:t,expiresInDays:a}){let i="GladPros — Bem-vindo! Sua senha provis\xf3ria",o=`
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
      
      <p><strong>⏰ Esta senha provis\xf3ria expira em ${a} dias.</strong></p>
      
      <div class="card warning-card">
        <div style="font-weight:700; margin-bottom:6px;">🔒 Dicas de Seguran\xe7a</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Altere esta senha provis\xf3ria no primeiro acesso</li>
          <li>Nunca compartilhe suas credenciais com ningu\xe9m</li>
          <li>Use uma senha forte e \xfanica para sua conta</li>
        </ul>
      </div>
    `,s=r({subject:i,preheader:"Sua conta foi criada. Use a senha provis\xf3ria para o primeiro acesso.",title:`Bem-vindo, ${e}!`,subtitle:"Sua conta foi criada com sucesso",content:o,ctaButton:{text:"Acessar Sistema",url:"http://localhost:3000/login"},footerNote:"Em caso de d\xfavidas, entre em contato com o suporte."});return{subject:i,html:s,text:`GladPros - Bem-vindo!

Ol\xe1, ${e}

Sua conta foi criada! Senha provis\xf3ria: ${t}

Esta senha expira em ${a} dias.

Altere-a no primeiro acesso para maior seguran\xe7a.`}}}},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},7066:e=>{"use strict";e.exports=require("node:tty")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13641:(e,t,a)=>{"use strict";a.d(t,{z:()=>i.z});var i=a(31183)},14985:e=>{"use strict";e.exports=require("dns")},16698:e=>{"use strict";e.exports=require("node:async_hooks")},21820:e=>{"use strict";e.exports=require("os")},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31183:(e,t,a)=>{"use strict";a.d(t,{z:()=>r});var i=a(29942);let r=global.__prisma??new i.PrismaClient({log:["error"]})},31421:e=>{"use strict";e.exports=require("node:child_process")},33873:e=>{"use strict";e.exports=require("path")},34631:e=>{"use strict";e.exports=require("tls")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:e=>{"use strict";e.exports=require("node:os")},51455:e=>{"use strict";e.exports=require("node:fs/promises")},53501:(e,t,a)=>{"use strict";a.d(t,{q:()=>s});var i=a(55511),r=a.n(i),o=a(13641);class s{static get delegate(){try{return o.z.codigoMFA}catch{return}}static generateCode(){return Math.floor(1e5+9e5*Math.random()).toString()}static hashCode(e){return r().createHash("sha256").update(e).digest("hex")}static async createMFACode({usuarioId:e,tipoAcao:t="LOGIN",ip:a,userAgent:i}){this.delegate?.deleteMany?await this.delegate.deleteMany({where:{usuarioId:e,tipoAcao:t,OR:[{usado:!0},{expiresAt:{lt:new Date}}]}}):await o.z.$executeRaw`
        DELETE FROM CodigoMFA
        WHERE usuarioId = ${e}
        AND tipoAcao = ${t}
        AND (usado = TRUE OR expiresAt < NOW())
      `;let r=this.generateCode(),s=this.hashCode(r),n=new Date(Date.now()+3e5);if(this.delegate?.create)return{code:r,id:(await this.delegate.create({data:{usuarioId:e,codigo:s,tipoAcao:t,expiresAt:n,usado:!1,ip:a,userAgent:i},select:{id:!0}})).id};{await o.z.$executeRaw`
        INSERT INTO CodigoMFA (usuarioId, codigo, tipoAcao, expiresAt, ip, userAgent)
        VALUES (${e}, ${s}, ${t}, ${n}, ${a}, ${i})
      `;let d=await o.z.$queryRaw`
        SELECT id FROM CodigoMFA
        WHERE usuarioId = ${e}
        AND tipoAcao = ${t}
        AND usado = FALSE
        ORDER BY criadoEm DESC
        LIMIT 1
      `;return{code:r,id:d[0]?.id||0}}}static async verifyMFACode({usuarioId:e,code:t,tipoAcao:a="LOGIN"}){let i=this.hashCode(t),r=this.delegate?.findFirst?await this.delegate.findFirst({where:{usuarioId:e,codigo:i,tipoAcao:a},orderBy:{criadoEm:"desc"},select:{id:!0,expiresAt:!0,usado:!0}}):(await o.z.$queryRaw`
          SELECT id, expiresAt, usado
          FROM CodigoMFA
          WHERE usuarioId = ${e}
          AND codigo = ${i}
          AND tipoAcao = ${a}
          ORDER BY criadoEm DESC
          LIMIT 1
        `)[0];return r?r.usado?{valid:!1,error:"C\xf3digo j\xe1 foi utilizado"}:new Date>r.expiresAt?{valid:!1,error:"C\xf3digo expirado"}:(this.delegate?.update?await this.delegate.update({where:{id:r.id},data:{usado:!0}}):await o.z.$executeRaw`
        UPDATE CodigoMFA SET usado = TRUE WHERE id = ${r.id}
      `,{valid:!0,codeId:r.id}):{valid:!1,error:"C\xf3digo inv\xe1lido"}}static async cleanupExpiredCodes(){return this.delegate?.deleteMany?(await this.delegate.deleteMany({where:{OR:[{usado:!0},{expiresAt:{lt:new Date}}]}})).count:Number(await o.z.$executeRaw`
        DELETE FROM CodigoMFA 
        WHERE expiresAt < NOW() OR usado = TRUE
      `)}static async countRecentAttempts(e,t=15){let a=new Date(Date.now()-60*t*1e3);if(this.delegate?.count)return await this.delegate.count({where:{usuarioId:e,criadoEm:{gt:a}}});{let t=await o.z.$queryRaw`
        SELECT COUNT(*) as count
        FROM CodigoMFA
        WHERE usuarioId = ${e}
        AND criadoEm > ${a}
      `;return t[0]?.count||0}}}},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},57975:e=>{"use strict";e.exports=require("node:util")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},69812:(e,t,a)=>{"use strict";a.d(t,{B0:()=>m,Dm:()=>f,E9:()=>h,KS:()=>x,PQ:()=>S,X5:()=>p,Zk:()=>E,cQ:()=>w,if:()=>A,rf:()=>u,tT:()=>g,yp:()=>v});var i=a(24501);let r=i.Yj().email("Email inv\xe1lido").max(255,"Email muito longo").toLowerCase().trim(),o=i.Yj().min(6,"Senha deve ter pelo menos 6 caracteres").max(128,"Senha muito longa").refine(e=>!!/[a-z]/.test(e)&&!!/[A-Z0-9]/.test(e),"Senha deve conter pelo menos: 1 letra min\xfascula e 1 mai\xfascula ou n\xfamero"),s=i.Yj().min(2,"Nome deve ter pelo menos 2 caracteres").max(100,"Nome muito longo").trim().refine(e=>/^[a-zA-ZÀ-ÿ\s]+$/.test(e),"Nome deve conter apenas letras e espa\xe7os"),n=i.Yj().length(4,"PIN deve ter exatamente 4 d\xedgitos").refine(e=>/^\d{4}$/.test(e),"PIN deve conter apenas n\xfameros"),d=i.Yj().length(6,"C\xf3digo MFA deve ter exatamente 6 d\xedgitos").refine(e=>/^\d{6}$/.test(e),"C\xf3digo MFA deve conter apenas n\xfameros"),l=i.Yj().min(5,"Pergunta de seguran\xe7a muito curta").max(200,"Pergunta de seguran\xe7a muito longa").trim(),c=i.Yj().min(2,"Resposta muito curta").max(100,"Resposta muito longa").trim().toLowerCase(),p=i.Ik({email:r,password:i.Yj().min(1,"Senha \xe9 obrigat\xf3ria")}),u=i.Ik({userId:i.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),code:d,tipoAcao:i.k5(["LOGIN","PRIMEIRO_ACESSO","RESET_PASSWORD"]).optional()}),m=i.Ik({email:r});i.Ik({userId:i.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),novaSenha:o,pin:n,perguntaSeguranca:l,respostaSeguranca:c});let g=i.Ik({userId:i.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),newPassword:o,pin:n,securityQuestion:l,securityAnswer:c});i.Ik({token:i.Yj().min(1,"Token \xe9 obrigat\xf3rio"),novaSenha:o});let x=i.Ik({token:i.Yj().min(1,"Token \xe9 obrigat\xf3rio"),senha:o}),h=i.Ik({email:r}),f=i.Ik({email:r});i.Ik({nomeCompleto:s,email:r,tipo:i.k5(["ADMIN","USUARIO","CLIENTE"]),departamento:i.Yj().max(100,"Departamento muito longo").optional(),cargo:i.Yj().max(100,"Cargo muito longo").optional()}),i.Ik({nomeCompleto:s.optional(),email:r.optional(),tipo:i.k5(["ADMIN","USUARIO","CLIENTE"]).optional(),departamento:i.Yj().max(100,"Departamento muito longo").optional(),cargo:i.Yj().max(100,"Cargo muito longo").optional(),status:i.k5(["ATIVO","INATIVO","SUSPENSO"]).optional()}).refine(e=>Object.keys(e).length>0,"Pelo menos um campo deve ser fornecido para atualiza\xe7\xe3o");let v=i.gM("method",[i.Ik({method:i.eu("pin"),userId:i.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),pin:n}),i.Ik({method:i.eu("security"),userId:i.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),answer:c})]),E=i.Ik({userId:i.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),tipoAcao:i.k5(["LOGIN","PRIMEIRO_ACESSO","RESET_PASSWORD","RESET","DESBLOQUEIO"]).optional()}),b=i.Ik({nomeCompleto:i.Yj().optional(),email:r,role:i.Yj().optional(),ativo:i.zM().optional(),criadoEm:i.KC([i.Yj(),i.ai(),i.p6()]).optional()}),A=i.Ik({filename:i.Yj().min(1).max(128).optional(),users:i.YO(b).min(1)}),w=i.Ik({email:r.optional(),nomeCompleto:s.optional(),role:i.k5(["ADMIN","GERENTE","USUARIO","FINANCEIRO","ESTOQUE","CLIENTE"]).optional(),status:i.k5(["ATIVO","INATIVO"]).optional(),telefone:i.Yj().max(32).optional().or(i.eu("")).transform(e=>e||void 0).refine(e=>{if(!e)return!0;let t=e.replace(/\D/g,"");return t.length>=10&&t.length<=11},"Telefone deve ter entre 10 e 11 d\xedgitos. Exemplo: (11)99999-9999"),dataNascimento:i.KC([i.Yj(),i.p6()]).optional().transform(e=>{if(!e)return;if(e instanceof Date){if(isNaN(e.getTime()))return;let t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),i=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${i}`}let t=String(e).trim();if(t.match(/^(\d{4})-(\d{2})-(\d{2})$/))return t;let a=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(a){let[,e,t,i]=a,r=parseInt(t,10),o=parseInt(e,10);if(o<1||o>12||r<1||r>31)return"INVALID_DATE";let s=t.padStart(2,"0"),n=e.padStart(2,"0");return`${i}-${n}-${s}`}return"INVALID_DATE"}).refine(e=>!e||"INVALID_DATE"!==e&&!isNaN(new Date(e+"T00:00:00.000Z").getTime()),"Data de nascimento inv\xe1lida. Use o formato MM/DD/YYYY (ex: 05/18/1979)"),endereco1:i.Yj().max(191).optional().or(i.eu("")).transform(e=>e||void 0),endereco2:i.Yj().max(191).optional().or(i.eu("")).transform(e=>e||void 0),cidade:i.Yj().max(96).optional().or(i.eu("")).transform(e=>e||void 0),estado:i.Yj().max(32).optional().or(i.eu("")).transform(e=>e||void 0),cep:i.Yj().max(16).optional().or(i.eu("")).transform(e=>e||void 0).refine(e=>{if(!e)return!0;let t=e.replace(/\D/g,"");return t.length>=5&&t.length<=9&&t===e.replace(/\D/g,"")},"CEP deve conter apenas n\xfameros. Exemplo: 01234567"),anotacoes:i.Yj().optional().or(i.eu("")).transform(e=>e&&e.trim().length>0?e:void 0)}),S=i.Ik({ativo:i.zM()})},73024:e=>{"use strict";e.exports=require("node:fs")},74075:e=>{"use strict";e.exports=require("zlib")},76760:e=>{"use strict";e.exports=require("node:path")},77598:e=>{"use strict";e.exports=require("node:crypto")},78335:()=>{},78474:e=>{"use strict";e.exports=require("node:events")},79551:e=>{"use strict";e.exports=require("url")},79646:e=>{"use strict";e.exports=require("child_process")},81630:e=>{"use strict";e.exports=require("http")},89331:(e,t,a)=>{"use strict";a.r(t),a.d(t,{patchFetch:()=>f,routeModule:()=>m,serverHooks:()=>h,workAsyncStorage:()=>g,workUnitAsyncStorage:()=>x});var i={};a.r(i),a.d(i,{POST:()=>u});var r=a(96559),o=a(48088),s=a(37719),n=a(32190),d=a(13641),l=a(53501),c=a(2849),p=a(69812);async function u(e){if("phase-production-build"===process.env.NEXT_PHASE||"phase-production-server"===process.env.NEXT_PHASE||"phase-static"===process.env.NEXT_PHASE||"phase-export"===process.env.NEXT_PHASE)return n.NextResponse.json({error:"Service temporarily unavailable"},{status:503});let t=await e.json().catch(()=>({})),a=p.B0.safeParse(t);if(!a.success)return n.NextResponse.json({code:"INVALID_BODY",message:"email obrigat\xf3rio"},{status:400});let{email:i}=a.data,r=(await d.z.$queryRaw`
    SELECT id, email, status, nomeCompleto as nome, primeiroAcesso FROM Usuario WHERE email = ${i} LIMIT 1
  `)[0];if(!r||"ATIVO"!==r.status)return n.NextResponse.json({ok:!0});let{code:o}=await l.q.createMFACode({usuarioId:r.id,tipoAcao:"LOGIN"}),s=Number(process.env.MFA_CODE_TTL_MIN??5);return await c.EmailService.sendMFA({to:r.email,userName:r.nome||r.email,code:o,expiresInMinutes:s,isFirstAccess:!!r.primeiroAcesso}),n.NextResponse.json({ok:!0})}let m=new r.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/auth/mfa/request/route",pathname:"/api/auth/mfa/request",filename:"route",bundlePath:"app/api/auth/mfa/request/route"},resolvedPagePath:"C:\\Users\\gladi\\Documents\\gladpros-nextjs\\src\\app\\api\\auth\\mfa\\request\\route.ts",nextConfigOutput:"standalone",userland:i}),{workAsyncStorage:g,workUnitAsyncStorage:x,serverHooks:h}=m;function f(){return(0,s.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:x})}},91645:e=>{"use strict";e.exports=require("net")},94735:e=>{"use strict";e.exports=require("events")},96487:()=>{}};var t=require("../../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),i=t.X(0,[7719,580,9942,4501,9526],()=>a(89331));module.exports=i})();