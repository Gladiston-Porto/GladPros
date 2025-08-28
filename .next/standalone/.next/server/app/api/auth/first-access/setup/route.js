(()=>{var e={};e.id=6604,e.ids=[6604],e.modules={1708:e=>{"use strict";e.exports=require("node:process")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},7066:e=>{"use strict";e.exports=require("node:tty")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13641:(e,t,o)=>{"use strict";o.d(t,{z:()=>a.z});var a=o(31183)},16698:e=>{"use strict";e.exports=require("node:async_hooks")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31183:(e,t,o)=>{"use strict";o.d(t,{z:()=>r});var a=o(29942);let r=global.__prisma??new a.PrismaClient({log:["error"]})},31421:e=>{"use strict";e.exports=require("node:child_process")},33873:e=>{"use strict";e.exports=require("path")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:e=>{"use strict";e.exports=require("node:os")},51455:e=>{"use strict";e.exports=require("node:fs/promises")},55511:e=>{"use strict";e.exports=require("crypto")},57018:(e,t,o)=>{"use strict";o.r(t),o.d(t,{patchFetch:()=>x,routeModule:()=>m,serverHooks:()=>f,workAsyncStorage:()=>g,workUnitAsyncStorage:()=>h});var a={};o.r(a),o.d(a,{POST:()=>c});var r=o(96559),s=o(48088),i=o(37719),n=o(32190),l=o(13641),d=o(82598),u=o(18318),p=o(69812);async function c(e){try{let t=await e.json().catch(()=>({})),a=p.tT.safeParse(t);if(!a.success)return n.NextResponse.json({error:"Dados inv\xe1lidos para configura\xe7\xe3o de primeiro acesso"},{status:400});let{userId:r,newPassword:s,pin:i,securityQuestion:c,securityAnswer:m}=a.data,g=d.r.validatePassword(s);if(!g.valid)return n.NextResponse.json({error:"Senha n\xe3o atende aos crit\xe9rios de seguran\xe7a: "+g.errors.join(", ")},{status:400});if(!/^\d{4}$/.test(i))return n.NextResponse.json({error:"PIN deve conter exatamente 4 d\xedgitos"},{status:400});if(m.trim().length<3)return n.NextResponse.json({error:"Resposta de seguran\xe7a deve ter pelo menos 3 caracteres"},{status:400});let h=(await l.z.$queryRaw`
      SELECT id, primeiroAcesso, email, nomeCompleto
      FROM Usuario 
      WHERE id = ${r}
      LIMIT 1
    `)[0];if(!h)return n.NextResponse.json({error:"Usu\xe1rio n\xe3o encontrado"},{status:404});if(!h.primeiroAcesso)return n.NextResponse.json({error:"Usu\xe1rio j\xe1 completou o primeiro acesso"},{status:400});let[f,x,v]=await Promise.all([d.r.hashPassword(s),u.default.hash(i,12),u.default.hash(m.toLowerCase().trim(),12)]);await l.z.$executeRaw`
      UPDATE Usuario 
      SET 
        senha = ${f},
        senhaProvisoria = FALSE,
        pinSeguranca = ${x},
        perguntaSecreta = ${c},
        respostaSecreta = ${v},
        primeiroAcesso = FALSE,
        atualizadoEm = NOW()
      WHERE id = ${r}
    `,await l.z.$executeRaw`
      INSERT INTO HistoricoSenha (usuarioId, senhaHash, criadoEm)
      VALUES (${r}, ${f}, NOW())
    `,await l.z.$executeRaw`
      DELETE FROM TentativaLogin 
      WHERE usuarioId = ${r}
    `,await l.z.$executeRaw`
      UPDATE CodigoMFA 
      SET usado = TRUE 
      WHERE usuarioId = ${r}
    `;try{let{AuditoriaService:t}=await o.e(3603).then(o.bind(o,73603));await t.registrar({tabela:"Usuario",registroId:r,acao:"UPDATE",usuarioId:r,ip:e.headers.get("x-forwarded-for")?.split(",")[0]||"unknown",payload:{acao_detalhada:"PRIMEIRO_ACESSO_COMPLETO",configuracoes:{senhaDefinida:!0,pinDefinido:!0,perguntaSegurancaDefinida:!0},timestamp:new Date().toISOString()}})}catch(e){console.error("Erro ao registrar auditoria:",e)}try{let e=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Configura\xe7\xe3o Finalizada - GladPros</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0; margin-bottom: 10px;">GladPros</h1>
              <h2 style="color: #28a745; font-weight: normal;">🎉 Conta Configurada!</h2>
            </div>
            
            <p>Parab\xe9ns, <strong>${h.nomeCompleto}</strong>!</p>
            
            <p>Sua conta foi configurada com sucesso no sistema GladPros.</p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin-top: 0; color: #155724;"><strong>✅ Configura\xe7\xf5es Aplicadas:</strong></p>
              <ul style="margin: 10px 0; color: #155724;">
                <li>Nova senha definida e ativada</li>
                <li>PIN de seguran\xe7a configurado</li>
                <li>Pergunta de seguran\xe7a definida</li>
                <li>Acesso completo liberado</li>
              </ul>
            </div>
            
            <p>Voc\xea j\xe1 pode acessar todas as funcionalidades do sistema!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #2c5aa0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Acessar Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              Este email foi enviado automaticamente pelo sistema GladPros.
            </p>
          </div>
        </body>
        </html>
      `;await fetch("/api/internal/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:h.email,subject:"GladPros - Configura\xe7\xe3o de conta finalizada",html:e})}).catch(()=>null)}catch(e){console.error("Erro ao enviar email de confirma\xe7\xe3o:",e)}return n.NextResponse.json({success:!0,message:"Configura\xe7\xe3o conclu\xedda com sucesso",user:{id:h.id,email:h.email,nomeCompleto:h.nomeCompleto,primeiroAcesso:!1}})}catch(e){return console.error("[API] First access setup error:",e),n.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}let m=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/auth/first-access/setup/route",pathname:"/api/auth/first-access/setup",filename:"route",bundlePath:"app/api/auth/first-access/setup/route"},resolvedPagePath:"C:\\Users\\gladi\\Documents\\gladpros-nextjs\\src\\app\\api\\auth\\first-access\\setup\\route.ts",nextConfigOutput:"standalone",userland:a}),{workAsyncStorage:g,workUnitAsyncStorage:h,serverHooks:f}=m;function x(){return(0,i.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:h})}},57975:e=>{"use strict";e.exports=require("node:util")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},69812:(e,t,o)=>{"use strict";o.d(t,{B0:()=>m,Dm:()=>x,E9:()=>f,KS:()=>h,PQ:()=>j,X5:()=>p,Zk:()=>I,cQ:()=>A,if:()=>S,rf:()=>c,tT:()=>g,yp:()=>v});var a=o(24501);let r=a.Yj().email("Email inv\xe1lido").max(255,"Email muito longo").toLowerCase().trim(),s=a.Yj().min(6,"Senha deve ter pelo menos 6 caracteres").max(128,"Senha muito longa").refine(e=>!!/[a-z]/.test(e)&&!!/[A-Z0-9]/.test(e),"Senha deve conter pelo menos: 1 letra min\xfascula e 1 mai\xfascula ou n\xfamero"),i=a.Yj().min(2,"Nome deve ter pelo menos 2 caracteres").max(100,"Nome muito longo").trim().refine(e=>/^[a-zA-ZÀ-ÿ\s]+$/.test(e),"Nome deve conter apenas letras e espa\xe7os"),n=a.Yj().length(4,"PIN deve ter exatamente 4 d\xedgitos").refine(e=>/^\d{4}$/.test(e),"PIN deve conter apenas n\xfameros"),l=a.Yj().length(6,"C\xf3digo MFA deve ter exatamente 6 d\xedgitos").refine(e=>/^\d{6}$/.test(e),"C\xf3digo MFA deve conter apenas n\xfameros"),d=a.Yj().min(5,"Pergunta de seguran\xe7a muito curta").max(200,"Pergunta de seguran\xe7a muito longa").trim(),u=a.Yj().min(2,"Resposta muito curta").max(100,"Resposta muito longa").trim().toLowerCase(),p=a.Ik({email:r,password:a.Yj().min(1,"Senha \xe9 obrigat\xf3ria")}),c=a.Ik({userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),code:l,tipoAcao:a.k5(["LOGIN","PRIMEIRO_ACESSO","RESET_PASSWORD"]).optional()}),m=a.Ik({email:r});a.Ik({userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),novaSenha:s,pin:n,perguntaSeguranca:d,respostaSeguranca:u});let g=a.Ik({userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),newPassword:s,pin:n,securityQuestion:d,securityAnswer:u});a.Ik({token:a.Yj().min(1,"Token \xe9 obrigat\xf3rio"),novaSenha:s});let h=a.Ik({token:a.Yj().min(1,"Token \xe9 obrigat\xf3rio"),senha:s}),f=a.Ik({email:r}),x=a.Ik({email:r});a.Ik({nomeCompleto:i,email:r,tipo:a.k5(["ADMIN","USUARIO","CLIENTE"]),departamento:a.Yj().max(100,"Departamento muito longo").optional(),cargo:a.Yj().max(100,"Cargo muito longo").optional()}),a.Ik({nomeCompleto:i.optional(),email:r.optional(),tipo:a.k5(["ADMIN","USUARIO","CLIENTE"]).optional(),departamento:a.Yj().max(100,"Departamento muito longo").optional(),cargo:a.Yj().max(100,"Cargo muito longo").optional(),status:a.k5(["ATIVO","INATIVO","SUSPENSO"]).optional()}).refine(e=>Object.keys(e).length>0,"Pelo menos um campo deve ser fornecido para atualiza\xe7\xe3o");let v=a.gM("method",[a.Ik({method:a.eu("pin"),userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),pin:n}),a.Ik({method:a.eu("security"),userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),answer:u})]),I=a.Ik({userId:a.ai().int().positive("ID do usu\xe1rio inv\xe1lido"),tipoAcao:a.k5(["LOGIN","PRIMEIRO_ACESSO","RESET_PASSWORD","RESET","DESBLOQUEIO"]).optional()}),E=a.Ik({nomeCompleto:a.Yj().optional(),email:r,role:a.Yj().optional(),ativo:a.zM().optional(),criadoEm:a.KC([a.Yj(),a.ai(),a.p6()]).optional()}),S=a.Ik({filename:a.Yj().min(1).max(128).optional(),users:a.YO(E).min(1)}),A=a.Ik({email:r.optional(),nomeCompleto:i.optional(),role:a.k5(["ADMIN","GERENTE","USUARIO","FINANCEIRO","ESTOQUE","CLIENTE"]).optional(),status:a.k5(["ATIVO","INATIVO"]).optional(),telefone:a.Yj().max(32).optional().or(a.eu("")).transform(e=>e||void 0).refine(e=>{if(!e)return!0;let t=e.replace(/\D/g,"");return t.length>=10&&t.length<=11},"Telefone deve ter entre 10 e 11 d\xedgitos. Exemplo: (11)99999-9999"),dataNascimento:a.KC([a.Yj(),a.p6()]).optional().transform(e=>{if(!e)return;if(e instanceof Date){if(isNaN(e.getTime()))return;let t=e.getFullYear(),o=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");return`${t}-${o}-${a}`}let t=String(e).trim();if(t.match(/^(\d{4})-(\d{2})-(\d{2})$/))return t;let o=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(o){let[,e,t,a]=o,r=parseInt(t,10),s=parseInt(e,10);if(s<1||s>12||r<1||r>31)return"INVALID_DATE";let i=t.padStart(2,"0"),n=e.padStart(2,"0");return`${a}-${n}-${i}`}return"INVALID_DATE"}).refine(e=>!e||"INVALID_DATE"!==e&&!isNaN(new Date(e+"T00:00:00.000Z").getTime()),"Data de nascimento inv\xe1lida. Use o formato MM/DD/YYYY (ex: 05/18/1979)"),endereco1:a.Yj().max(191).optional().or(a.eu("")).transform(e=>e||void 0),endereco2:a.Yj().max(191).optional().or(a.eu("")).transform(e=>e||void 0),cidade:a.Yj().max(96).optional().or(a.eu("")).transform(e=>e||void 0),estado:a.Yj().max(32).optional().or(a.eu("")).transform(e=>e||void 0),cep:a.Yj().max(16).optional().or(a.eu("")).transform(e=>e||void 0).refine(e=>{if(!e)return!0;let t=e.replace(/\D/g,"");return t.length>=5&&t.length<=9&&t===e.replace(/\D/g,"")},"CEP deve conter apenas n\xfameros. Exemplo: 01234567"),anotacoes:a.Yj().optional().or(a.eu("")).transform(e=>e&&e.trim().length>0?e:void 0)}),j=a.Ik({ativo:a.zM()})},73024:e=>{"use strict";e.exports=require("node:fs")},76760:e=>{"use strict";e.exports=require("node:path")},77598:e=>{"use strict";e.exports=require("node:crypto")},78335:()=>{},78474:e=>{"use strict";e.exports=require("node:events")},82598:(e,t,o)=>{"use strict";o.d(t,{r:()=>r});var a=o(18318);class r{static validatePassword(e){let t=[];return(!e||e.length<9)&&t.push("Senha deve ter no m\xednimo 9 caracteres"),/[A-Z]/.test(e)||t.push("Senha deve conter pelo menos 1 letra mai\xfascula"),/[0-9]/.test(e)||t.push("Senha deve conter pelo menos 1 n\xfamero"),/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(e)||t.push("Senha deve conter pelo menos 1 s\xedmbolo especial"),{valid:0===t.length,errors:t}}static async hashPassword(e){return a.default.hash(e,12)}static async verifyPassword(e,t){return a.default.compare(e,t)}static generateProvisionalPassword(){let e="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789",t="!@#$%&*",o="";o+="ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(25*Math.random())],o+="23456789"[Math.floor(8*Math.random())],o+=t[Math.floor(Math.random()*t.length)];for(let t=0;t<6;t++)o+=e[Math.floor(Math.random()*e.length)];return o.split("").sort(()=>Math.random()-.5).join("")}static getPasswordStrength(e){let t=0,o=[];e.length>=9&&(t+=20,o.push("M\xednimo 9 caracteres")),/[A-Z]/.test(e)&&(t+=20,o.push("Letra mai\xfascula")),/[a-z]/.test(e)&&(t+=10,o.push("Letra min\xfascula")),/[0-9]/.test(e)&&(t+=20,o.push("N\xfamero")),/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(e)&&(t+=20,o.push("S\xedmbolo especial")),e.length>=12&&(t+=10,o.push("Senha longa (12+ caracteres)"));let a="Muito fraca",r="#ef4444";return t>=90?(a="Muito forte",r="#22c55e"):t>=70?(a="Forte",r="#84cc16"):t>=50?(a="Moderada",r="#eab308"):t>=30&&(a="Fraca",r="#f97316"),{score:t,label:a,color:r,criteriaMet:o}}}},96487:()=>{}};var t=require("../../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),a=t.X(0,[7719,580,9942,4501,8318],()=>o(57018));module.exports=a})();