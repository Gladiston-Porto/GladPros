(()=>{var t={};t.id=8349,t.ids=[8349],t.modules={1708:t=>{"use strict";t.exports=require("node:process")},3295:t=>{"use strict";t.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},7066:t=>{"use strict";t.exports=require("node:tty")},10846:t=>{"use strict";t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13641:(t,e,r)=>{"use strict";r.d(e,{z:()=>o.z});var o=r(31183)},16698:t=>{"use strict";t.exports=require("node:async_hooks")},29021:t=>{"use strict";t.exports=require("fs")},29073:(t,e,r)=>{"use strict";r.r(e),r.d(e,{patchFetch:()=>h,routeModule:()=>l,serverHooks:()=>x,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>u});var o={};r.r(o),r.d(o,{POST:()=>d});var s=r(96559),a=r(48088),n=r(37719),i=r(32190),p=r(13641);async function d(t){if("phase-production-build"===process.env.NEXT_PHASE||"phase-production-server"===process.env.NEXT_PHASE||"phase-static"===process.env.NEXT_PHASE||"phase-export"===process.env.NEXT_PHASE)return i.NextResponse.json({error:"Service temporarily unavailable"},{status:503});try{let{filename:e="propostas",filters:r={}}=await t.json(),o={};r.q&&(o.OR=[{titulo:{contains:r.q}},{numeroProposta:{contains:r.q}},{cliente:{nome:{contains:r.q}}}]),r.status&&"all"!==r.status&&(o.status=r.status),r.clienteId&&(o.clienteId=r.clienteId);let s=p.z,a=await s.proposta.findMany({where:o,include:{cliente:{select:{nome:!0,email:!0}}},orderBy:{criadoEm:"desc"}}),n=`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relat\xf3rio de Propostas</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333; 
            }
            h1 { 
              color: #2563eb; 
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            .summary { 
              background-color: #f8fafc; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #e2e8f0; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f1f5f9; 
              font-weight: bold;
              color: #1e293b;
            }
            .status { 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: bold;
            }
            .status-RASCUNHO { background-color: #f3f4f6; color: #374151; }
            .status-ENVIADA { background-color: #dbeafe; color: #1e40af; }
            .status-ASSINADA { background-color: #fef3c7; color: #d97706; }
            .status-APROVADA { background-color: #dcfce7; color: #16a34a; }
            .status-CANCELADA { background-color: #fee2e2; color: #dc2626; }
            .number { text-align: right; }
            .truncate { 
              max-width: 200px; 
              overflow: hidden; 
              text-overflow: ellipsis; 
              white-space: nowrap; 
            }
          </style>
        </head>
        <body>
          <h1>Relat\xf3rio de Propostas</h1>
          
          <div class="summary">
            <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString("pt-BR")} \xe0s ${new Date().toLocaleTimeString("pt-BR")}</p>
            <p><strong>Total de propostas:</strong> ${a.length}</p>
            ${r.q?`<p><strong>Filtro de busca:</strong> ${r.q}</p>`:""}
            ${r.status&&"all"!==r.status?`<p><strong>Status filtrado:</strong> ${r.status}</p>`:""}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>N\xfamero</th>
                <th>T\xedtulo</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Valor Cliente</th>
                <th>Criado Em</th>
                <th>Validade</th>
              </tr>
            </thead>
            <tbody>
              ${a.map(t=>`
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <tr>
                  <td><strong>${t.numeroProposta}</strong></td>
                  <td class="truncate">${t.titulo}</td>
                  <td>${t.cliente.nome}</td>
                  <td><span class="status status-${t.status}">${t.status}</span></td>
                  <td class="number">${t.precoPropostaCliente?`USD ${t.precoPropostaCliente.toFixed(2)}`:"N/A"}</td>
                  <td>${t.criadoEm.toLocaleDateString("pt-BR")}</td>
                  <td>${t.validadeProposta?t.validadeProposta.toLocaleDateString("pt-BR"):"N/A"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          ${0===a.length?'<p style="text-align: center; color: #64748b; margin: 40px 0;">Nenhuma proposta encontrada com os filtros aplicados.</p>':""}
        </body>
      </html>
    `;return new i.NextResponse(n,{headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="${e}.html"`}})}catch(t){return console.error("[PDF Export] Erro:",t),i.NextResponse.json({error:"Erro interno do servidor"},{status:500})}}let l=new s.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/propostas/export/pdf/route",pathname:"/api/propostas/export/pdf",filename:"route",bundlePath:"app/api/propostas/export/pdf/route"},resolvedPagePath:"C:\\Users\\gladi\\Documents\\gladpros-nextjs\\src\\app\\api\\propostas\\export\\pdf\\route.ts",nextConfigOutput:"standalone",userland:o}),{workAsyncStorage:c,workUnitAsyncStorage:u,serverHooks:x}=l;function h(){return(0,n.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:u})}},29294:t=>{"use strict";t.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31183:(t,e,r)=>{"use strict";r.d(e,{z:()=>s});var o=r(29942);let s=global.__prisma??new o.PrismaClient({log:["error"]})},31421:t=>{"use strict";t.exports=require("node:child_process")},33873:t=>{"use strict";t.exports=require("path")},44870:t=>{"use strict";t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:t=>{"use strict";t.exports=require("node:os")},51455:t=>{"use strict";t.exports=require("node:fs/promises")},57975:t=>{"use strict";t.exports=require("node:util")},63033:t=>{"use strict";t.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},73024:t=>{"use strict";t.exports=require("node:fs")},76760:t=>{"use strict";t.exports=require("node:path")},77598:t=>{"use strict";t.exports=require("node:crypto")},78335:()=>{},78474:t=>{"use strict";t.exports=require("node:events")},96487:()=>{}};var e=require("../../../../../webpack-runtime.js");e.C(t);var r=t=>e(e.s=t),o=e.X(0,[7719,580,9942],()=>r(29073));module.exports=o})();