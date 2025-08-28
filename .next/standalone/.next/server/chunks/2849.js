"use strict";exports.id=2849,exports.ids=[2849],exports.modules={2849:(e,a,i)=>{i.d(a,{EmailService:()=>s});var t=i(49526);function o(e){let{subject:a,preheader:i,title:t,subtitle:o,content:s,appUrl:n="http://localhost:3000",assetsBaseUrl:l,supportEmail:d="suporte@gladpros.com",ctaButton:c,footerNote:p}=e,x=l?`${l}/images/LOGO_200.png`:`${n}/images/LOGO_200.png`;return`
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>${r(a)}</title>
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
  <div class="preheader">${r(i)}</div>
  <table role="presentation" class="wrapper" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td class="header">
              <div class="brand">
                <img src="${x}" width="140" alt="GladPros" style="display:block; border:0;"/>
                <div class="brand-name">GladPros</div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="body">
              <h1 class="h1">${t}</h1>
              ${o?`<p class="subtitle">${o}</p>`:""}
              
              ${s}
              
              ${c?`
              <div style="text-align:center; margin:24px 0;">
                <a class="cta" href="${c.url}" target="_blank" rel="noopener">${r(c.text)}</a>
              </div>`:""}
              
              <div style="height:16px;"></div>
              
              <p class="subtitle">Precisa de ajuda? Fale com a nossa equipe: <a href="mailto:${r(d)}">${r(d)}</a></p>
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
</html>`.trim()}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}class s{static{this.transporter=null}static{this.isInitialized=!1}static getConfig(){return{host:process.env.SMTP_HOST||"localhost",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,user:process.env.SMTP_USER||"",pass:process.env.SMTP_PASS||""}}static async initializeTransporter(){if(this.isInitialized)return;let e=this.getConfig();this.transporter=t.createTransport({host:e.host,port:e.port,secure:e.secure,auth:{user:e.user,pass:e.pass},tls:{rejectUnauthorized:!1}});try{await this.transporter.verify(),this.isInitialized=!0}catch{}}static async getTransporter(){return await this.initializeTransporter(),this.transporter}static async sendMFA({to:e,userName:a,code:i,expiresInMinutes:t=5,isFirstAccess:o=!1}){try{let r=this.getMFATemplate({userName:a,code:i,expiresInMinutes:t,isFirstAccess:o});return await this.sendEmail({to:e,subject:r.subject,html:r.html,text:r.text})}catch{return{success:!1,error:"Erro desconhecido"}}}static async sendPasswordReset({to:e,userName:a,resetLink:i,expiresInHours:t=1}){try{let o=this.getPasswordResetTemplate({userName:a,resetLink:i,expiresInHours:t});return await this.sendEmail({to:e,subject:o.subject,html:o.html,text:o.text})}catch(e){return{success:!1,error:e.message}}}static async sendProvisionalPassword({to:e,userName:a,provisionalPassword:i,expiresInDays:t=7}){try{let o=this.getProvisionalPasswordTemplate({userName:a,provisionalPassword:i,expiresInDays:t});return await this.sendEmail({to:e,subject:o.subject,html:o.html,text:o.text})}catch{return{success:!1,error:"Erro ao enviar senha provis\xf3ria"}}}static async sendEmail({to:e,subject:a,html:i,text:t}){try{let o=await this.getTransporter(),r={from:`"GladPros Sistema" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:e,subject:a,html:i,text:t||i.replace(/<[^>]*>/g,"")},s=await o.sendMail(r);return{success:!0,messageId:s.messageId}}catch(e){return{success:!1,error:e.message}}}static getMFATemplate({userName:e,code:a,expiresInMinutes:i,isFirstAccess:t}){let r=t?"primeiro acesso":"login",s=`GladPros — C\xf3digo de verifica\xe7\xe3o: ${a}`,n=`Seu c\xf3digo de verifica\xe7\xe3o para ${r} na GladPros.`,l=`
      <p>Ol\xe1, <strong>${e}</strong>!</p>
      <p>Voc\xea solicitou <strong>${r}</strong> em sua conta GladPros. Para continuar, use o c\xf3digo de verifica\xe7\xe3o abaixo:</p>
      
      <div class="code-display">
        <div class="code-text">${a}</div>
      </div>
      
      <p><strong>⏰ Este c\xf3digo expira em ${i} minutos.</strong></p>
      
      <div class="card warning-card">
        <div style="font-weight:700; margin-bottom:6px;">🔒 Dicas de Seguran\xe7a</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Nunca compartilhe este c\xf3digo com ningu\xe9m</li>
          <li>Nossa equipe nunca solicitar\xe1 este c\xf3digo por telefone ou email</li>
          <li>Se n\xe3o foi voc\xea que solicitou, ignore este email com seguran\xe7a</li>
        </ul>
      </div>
    `,d=o({subject:s,preheader:n,title:"C\xf3digo de Verifica\xe7\xe3o",subtitle:`Confirma\xe7\xe3o necess\xe1ria para ${r}`,content:l});return{subject:s,html:d,text:`
GladPros - C\xf3digo de Verifica\xe7\xe3o

Ol\xe1, ${e}

Voc\xea solicitou ${r} em sua conta GladPros.
Seu c\xf3digo de verifica\xe7\xe3o \xe9: ${a}

Este c\xf3digo expira em ${i} minutos.

SEGURAN\xc7A:
- Nunca compartilhe este c\xf3digo com ningu\xe9m
- Nossa equipe nunca solicitar\xe1 este c\xf3digo por telefone ou email
- Se n\xe3o foi voc\xea que solicitou, ignore este email

Este email foi enviado automaticamente pelo sistema GladPros.
    `.trim()}}static getPasswordResetTemplate({userName:e,resetLink:a,expiresInHours:i}){let t="GladPros — Redefini\xe7\xe3o de senha solicitada",r=o({subject:t,preheader:"Link para redefinir sua senha na GladPros. Expire em breve.",title:"Redefini\xe7\xe3o de Senha",subtitle:"Solicita\xe7\xe3o para altera\xe7\xe3o da sua senha de acesso",content:`
      <p>Ol\xe1, <strong>${e}</strong>!</p>
      <p>Recebemos uma solicita\xe7\xe3o para <strong>redefinir a senha</strong> da sua conta GladPros.</p>
      
      <div class="card info-card">
        <div style="font-weight:700; margin-bottom:6px;">🔗 Link para redefini\xe7\xe3o</div>
        <p style="margin:8px 0; word-break:break-all; font-size:14px;">
          ${a}
        </p>
      </div>
      
      <p><strong>⏰ Este link expira em ${i} hora(s).</strong></p>
      
      <div class="card danger-card">
        <div style="font-weight:700; margin-bottom:6px;">⚠️ Importante</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Se voc\xea n\xe3o solicitou esta redefini\xe7\xe3o, ignore este email</li>
          <li>Sua senha atual permanecer\xe1 inalterada at\xe9 que voc\xea use este link</li>
          <li>Por seguran\xe7a, este link s\xf3 pode ser usado uma vez</li>
        </ul>
      </div>
    `,ctaButton:{text:"Redefinir Minha Senha",url:a},footerNote:"Se voc\xea n\xe3o solicitou a redefini\xe7\xe3o de senha, pode ignorar este email com seguran\xe7a."});return{subject:t,html:r,text:`GladPros - Redefini\xe7\xe3o de senha

Ol\xe1, ${e}

Recebemos uma solicita\xe7\xe3o para redefinir sua senha.
Clique no link: ${a}

Este link expira em ${i} hora(s).`}}static getProvisionalPasswordTemplate({userName:e,provisionalPassword:a,expiresInDays:i}){let t="GladPros — Bem-vindo! Sua senha provis\xf3ria",r=`
      <p>Ol\xe1, <strong>${e}</strong>!</p>
      <p>Sua conta foi criada com sucesso no sistema GladPros! Para acessar pela primeira vez, use as credenciais abaixo:</p>
      
      <div class="card success-card">
        <div style="font-weight:700; margin-bottom:8px;">🔑 Credenciais de Acesso</div>
        <div style="margin-bottom:8px;">
          <div style="font-size:12px; color:#15803D; margin-bottom:4px;">Senha Provis\xf3ria</div>
          <div style="background:#ffffff; color:#0F365E; border:1px solid #BBF7D0; padding:8px 12px; border-radius:8px; display:inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-weight:bold; letter-spacing:2px;">
            ${a}
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
      
      <p><strong>⏰ Esta senha provis\xf3ria expira em ${i} dias.</strong></p>
      
      <div class="card warning-card">
        <div style="font-weight:700; margin-bottom:6px;">🔒 Dicas de Seguran\xe7a</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Altere esta senha provis\xf3ria no primeiro acesso</li>
          <li>Nunca compartilhe suas credenciais com ningu\xe9m</li>
          <li>Use uma senha forte e \xfanica para sua conta</li>
        </ul>
      </div>
    `,s=o({subject:t,preheader:"Sua conta foi criada. Use a senha provis\xf3ria para o primeiro acesso.",title:`Bem-vindo, ${e}!`,subtitle:"Sua conta foi criada com sucesso",content:r,ctaButton:{text:"Acessar Sistema",url:"http://localhost:3000/login"},footerNote:"Em caso de d\xfavidas, entre em contato com o suporte."});return{subject:t,html:s,text:`GladPros - Bem-vindo!

Ol\xe1, ${e}

Sua conta foi criada! Senha provis\xf3ria: ${a}

Esta senha expira em ${i} dias.

Altere-a no primeiro acesso para maior seguran\xe7a.`}}}}};