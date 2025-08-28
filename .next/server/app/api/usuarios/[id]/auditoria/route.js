(()=>{var e={};e.id=6424,e.ids=[6424],e.modules={1708:e=>{"use strict";e.exports=require("node:process")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},7066:e=>{"use strict";e.exports=require("node:tty")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13641:(e,r,s)=>{"use strict";s.d(r,{z:()=>t.z});var t=s(31183)},16698:e=>{"use strict";e.exports=require("node:async_hooks")},27925:(e,r,s)=>{"use strict";s.r(r),s.d(r,{patchFetch:()=>v,routeModule:()=>d,serverHooks:()=>x,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>l});var t={};s.r(t),s.d(t,{GET:()=>p});var o=s(96559),i=s(48088),a=s(37719),u=s(32190),n=s(13641);async function p(e,{params:r}){if("phase-production-build"===process.env.NEXT_PHASE||"phase-production-server"===process.env.NEXT_PHASE||"phase-static"===process.env.NEXT_PHASE||"phase-export"===process.env.NEXT_PHASE)return u.NextResponse.json({error:"Service temporarily unavailable"},{status:503});try{let{id:e}=await r,s=parseInt(e);if(isNaN(s))return u.NextResponse.json({message:"ID de usu\xe1rio inv\xe1lido"},{status:400});let t=await n.z.$queryRaw`
      SELECT 
        a.id,
        a.tabela,
        a.registroId,
        a.acao,
        a.usuarioId,
        a.ip,
        a.payload,
        a.criadoEm,
        u.nomeCompleto,
        u.email
      FROM Auditoria a
      LEFT JOIN Usuario u ON a.usuarioId = u.id
      WHERE a.registroId = ${s} AND a.tabela = 'Usuario'
         OR a.usuarioId = ${s}
      ORDER BY a.criadoEm DESC
      LIMIT 100
    `;return u.NextResponse.json(t)}catch(e){return console.error("Erro ao buscar auditoria:",e),u.NextResponse.json({message:"Erro interno do servidor"},{status:500})}}let d=new o.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/usuarios/[id]/auditoria/route",pathname:"/api/usuarios/[id]/auditoria",filename:"route",bundlePath:"app/api/usuarios/[id]/auditoria/route"},resolvedPagePath:"C:\\Users\\gladi\\Documents\\gladpros-nextjs\\src\\app\\api\\usuarios\\[id]\\auditoria\\route.ts",nextConfigOutput:"standalone",userland:t}),{workAsyncStorage:c,workUnitAsyncStorage:l,serverHooks:x}=d;function v(){return(0,a.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:l})}},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31183:(e,r,s)=>{"use strict";s.d(r,{z:()=>o});var t=s(29942);let o=global.__prisma??new t.PrismaClient({log:["error"]})},31421:e=>{"use strict";e.exports=require("node:child_process")},33873:e=>{"use strict";e.exports=require("path")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:e=>{"use strict";e.exports=require("node:os")},51455:e=>{"use strict";e.exports=require("node:fs/promises")},57975:e=>{"use strict";e.exports=require("node:util")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},73024:e=>{"use strict";e.exports=require("node:fs")},76760:e=>{"use strict";e.exports=require("node:path")},77598:e=>{"use strict";e.exports=require("node:crypto")},78335:()=>{},78474:e=>{"use strict";e.exports=require("node:events")},96487:()=>{}};var r=require("../../../../../webpack-runtime.js");r.C(e);var s=e=>r(r.s=e),t=r.X(0,[7719,580,9942],()=>s(27925));module.exports=t})();