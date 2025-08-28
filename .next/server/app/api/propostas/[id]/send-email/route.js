(()=>{var e={};e.id=1853,e.ids=[1853],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:e=>{"use strict";e.exports=require("dns")},21820:e=>{"use strict";e.exports=require("os")},26476:(e,t,r)=>{"use strict";r.d(t,{f6:()=>s,pQ:()=>o});var s=function(e){return e.RASCUNHO="RASCUNHO",e.ENVIADA="ENVIADA",e.ASSINADA="ASSINADA",e.APROVADA="APROVADA",e.CANCELADA="CANCELADA",e}({}),o=function(e){return e.CREATED="CREATED",e.UPDATED="UPDATED",e.SENT="SENT",e.SIGNED="SIGNED",e.APPROVED="APPROVED",e.CANCELLED="CANCELLED",e.ATTACH_ADDED="ATTACH_ADDED",e.ATTACH_REMOVED="ATTACH_REMOVED",e}({})},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},33911:(e,t,r)=>{"use strict";r.d(t,{db:()=>i});class s{constructor(e){this.proposta={},this.propostaLog={},this.propostaEtapa={},this.propostaMaterial={},this.cliente={},this.usuario={}}$connect(){return Promise.resolve()}$disconnect(){return Promise.resolve()}$transaction(e){return e({})}generatePropostaNumber(){let e=new Date,t=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0"),o=Math.floor(1e3*Math.random()).toString().padStart(3,"0");return Promise.resolve(`PROP-${t}${r}${s}-${o}`)}}let o=globalThis;class a extends s{async generatePropostaNumber(){let e=new Date,t=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0"),o=Math.floor(1e3*Math.random()).toString().padStart(3,"0");return`PROP-${t}${r}${s}-${o}`}}let i=o.prisma??new a},34631:e=>{"use strict";e.exports=require("tls")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},45453:(e,t,r)=>{"use strict";r.d(t,{A:()=>a});var s=r(49526);class o{constructor(){let e={host:process.env.SMTP_HOST||"localhost",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER||"",pass:process.env.SMTP_PASS||""}};this.transporter=s.createTransport(e)}async sendEmail({to:e,subject:t,html:r,cc:s,bcc:o}){try{let a=await this.transporter.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to:e,cc:s,bcc:o,subject:t,html:r});return{success:!0,messageId:a.messageId}}catch(e){return{success:!1,error:e instanceof Error?e.message:"Erro desconhecido"}}}async sendProposalSignedNotification(e,t){let r=`Proposta ${e?.numeroProposta??""} foi assinada pelo cliente`,s=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h1>Proposta Assinada</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <h2>Boa not\xedcia!</h2>
          <p>A proposta <strong>${e?.numeroProposta??""}</strong> foi assinada pelo cliente.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalhes da Proposta:</h3>
            <ul style="line-height: 1.6;">
              <li><strong>N\0mero:</strong> ${e?.numeroProposta??""}</li>
              <li><strong>Cliente:</strong> ${e?.cliente?.nome||"N/A"}</li>
              <li><strong>Valor:</strong> ${e?.valorEstimado?`$${e.valorEstimado.toLocaleString()}`:"N/A"}</li>
              <li><strong>Assinado por:</strong> ${t}</li>
              <li><strong>Data da assinatura:</strong> ${new Date().toLocaleString("pt-BR")}</li>
            </ul>
          </div>
          
          <p>A proposta agora est\xe1 no status <strong>ASSINADA</strong> e est\xe1 pronta para aprova\xe7\xe3o.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/propostas/${e?.id??""}" 
               style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Proposta no Sistema
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>GladPros - Sistema de Gest\xe3o de Propostas</p>
          <p>Este \xe9 um email autom\xe1tico, n\xe3o responda a esta mensagem.</p>
        </div>
      </div>
    `;for(let e of process.env.PROPOSAL_NOTIFICATION_EMAILS?.split(",")||["admin@gladpros.com"])await this.sendEmail({to:e.trim(),subject:r,html:s})}async sendProposalSentNotification(e,t){let r=`Nova proposta comercial para sua an\0lise - ${e?.numeroProposta??""}`,s=`${process.env.NEXTAUTH_URL}/p/${e?.numeroProposta??""}`,o=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1>Nova Proposta Comercial</h1>
        </div>
        
        <div style="padding: 20px; background: #f0fdf4;">
          <h2>Ol\xe1!</h2>
          <p>Voc\xea recebeu uma nova proposta comercial da GladPros.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalhes da Proposta:</h3>
            <ul style="line-height: 1.6;">
              <li><strong>N\0mero:</strong> ${e?.numeroProposta??""}</li>
              <li><strong>Descri\0\0o:</strong> ${e?.descricao??""}</li>
              <li><strong>Valor Estimado:</strong> ${e?.valorEstimado?`$${e.valorEstimado.toLocaleString()}`:"A consultar"}</li>
              <li><strong>Data de Cria\0\0o:</strong> ${e?.dataCriacao?new Date(e.dataCriacao).toLocaleDateString("pt-BR"):""}</li>
            </ul>
          </div>
          
          <p>Para visualizar todos os detalhes e assinar a proposta, clique no bot\xe3o abaixo:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${s}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Visualizar e Assinar Proposta
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p><strong>Importante:</strong> Este link \xe9 \xfanico e pessoal. N\xe3o compartilhe com terceiros.</p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>GladPros - Sistema de Gest\xe3o de Propostas</p>
          <p>Em caso de d\xfavidas, entre em contato conosco.</p>
        </div>
      </div>
    `;return await this.sendEmail({to:t,subject:r,html:o})}}let a=new o},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},73821:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>A,routeModule:()=>u,serverHooks:()=>m,workAsyncStorage:()=>g,workUnitAsyncStorage:()=>x});var s={};r.r(s),r.d(s,{POST:()=>c});var o=r(96559),a=r(48088),i=r(37719),n=r(32190),p=r(33911),d=r(26476),l=r(45453);async function c(e,{params:t}){try{let e=parseInt(t.id);if(isNaN(e))return n.NextResponse.json({error:"ID da proposta inv\xe1lido"},{status:400});let r=await p.db.proposta.findFirst({where:{id:e,deletedAt:null},include:{cliente:!0}});if(!r)return n.NextResponse.json({error:"Proposta n\xe3o encontrada"},{status:404});if(r.status!==d.f6.RASCUNHO)return n.NextResponse.json({error:"Apenas propostas em rascunho podem ser enviadas"},{status:400});let s=await p.db.proposta.update({where:{id:e},data:{status:d.f6.ENVIADA,enviadaParaOCliente:new Date},include:{cliente:!0}}),o=await l.A.sendProposalSentNotification(s,s.cliente.email);if(!o.success)return await p.db.proposta.update({where:{id:e},data:{status:d.f6.RASCUNHO,enviadaParaOCliente:null}}),n.NextResponse.json({error:"Erro ao enviar email: "+o.error},{status:500});return n.NextResponse.json({success:!0,message:"Proposta enviada com sucesso",proposta:s})}catch(e){return console.error("Error sending proposal:",e),n.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}let u=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/propostas/[id]/send-email/route",pathname:"/api/propostas/[id]/send-email",filename:"route",bundlePath:"app/api/propostas/[id]/send-email/route"},resolvedPagePath:"C:\\Users\\gladi\\Documents\\gladpros-nextjs\\src\\app\\api\\propostas\\[id]\\send-email\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:g,workUnitAsyncStorage:x,serverHooks:m}=u;function A(){return(0,i.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:x})}},74075:e=>{"use strict";e.exports=require("zlib")},78335:()=>{},79551:e=>{"use strict";e.exports=require("url")},79646:e=>{"use strict";e.exports=require("child_process")},81630:e=>{"use strict";e.exports=require("http")},91645:e=>{"use strict";e.exports=require("net")},94735:e=>{"use strict";e.exports=require("events")},96487:()=>{}};var t=require("../../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[7719,580,9526],()=>r(73821));module.exports=s})();