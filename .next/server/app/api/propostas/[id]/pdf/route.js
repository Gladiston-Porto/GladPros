(()=>{var e={};e.id=4746,e.ids=[4746],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33911:(e,t,o)=>{"use strict";o.d(t,{db:()=>i});class a{constructor(e){this.proposta={},this.propostaLog={},this.propostaEtapa={},this.propostaMaterial={},this.cliente={},this.usuario={}}$connect(){return Promise.resolve()}$disconnect(){return Promise.resolve()}$transaction(e){return e({})}generatePropostaNumber(){let e=new Date,t=e.getFullYear(),o=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0"),r=Math.floor(1e3*Math.random()).toString().padStart(3,"0");return Promise.resolve(`PROP-${t}${o}${a}-${r}`)}}let r=globalThis;class s extends a{async generatePropostaNumber(){let e=new Date,t=e.getFullYear(),o=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0"),r=Math.floor(1e3*Math.random()).toString().padStart(3,"0");return`PROP-${t}${o}${a}-${r}`}}let i=r.prisma??new s},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},84914:(e,t,o)=>{"use strict";o.r(t),o.d(t,{patchFetch:()=>$,routeModule:()=>h,serverHooks:()=>b,workAsyncStorage:()=>x,workUnitAsyncStorage:()=>f});var a={};o.r(a),o.d(a,{DELETE:()=>m,GET:()=>c,POST:()=>u,PUT:()=>g});var r=o(96559),s=o(48088),i=o(37719),n=o(32190),d=o(33911);let p=async e=>e;class l{static async generatePDF(e,t,o={}){let a=await p(e),r={...{includeValues:!0,includeEtapas:!0,includeMateriais:!0,includeAnexos:!1,template:t.isClientAccess?"client":"internal",watermark:t.isClientAccess?"CONFIDENCIAL":"",header:{empresa:"GladPros",contato:"contato@gladpros.com"}},...o};return{buffer:await this.renderPDF(a,r),filename:this.generateFilename(e,r.template),contentType:"application/pdf"}}static generateHTML(e,t){let o="client"===t.template;return`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proposta ${e.numeroProposta}</title>
      <style>
        ${this.getPDFStyles(t)}
      </style>
    </head>
    <body>
      ${t.watermark?`<div class="watermark">${t.watermark}</div>`:""}
      
      <!-- Cabe\xe7alho -->
      <header>
        <div class="header-content">
          <div class="company-info">
            <h1>${t.header.empresa}</h1>
            ${t.header.contato?`<p>${t.header.contato}</p>`:""}
          </div>
          <div class="proposal-info">
            <h2>PROPOSTA COMERCIAL</h2>
            <p><strong>N\xba:</strong> ${e.numeroProposta}</p>
            <p><strong>Data:</strong> ${e.enviadaParaOCliente?new Date(e.enviadaParaOCliente).toLocaleDateString("pt-BR"):"N\xe3o enviada"}</p>
          </div>
        </div>
      </header>

      <!-- Informa\xe7\xf5es do Cliente -->
      <section class="client-info">
        <h3>Dados do Cliente</h3>
        <div class="info-grid">
          <div>
            <p><strong>Nome:</strong> ${e.contatoNome||"N/A"}</p>
            <p><strong>Email:</strong> ${e.contatoEmail||"N/A"}</p>
          </div>
          ${e.localExecucaoEndereco?`
          <div>
            <p><strong>Local de Execu\xe7\xe3o:</strong></p>
            <p>${e.localExecucaoEndereco}</p>
          </div>
          `:""}
        </div>
      </section>

      <!-- Escopo do Trabalho -->
      <section class="scope">
        <h3>Escopo do Trabalho</h3>
        ${e.titulo?`<h4>${e.titulo}</h4>`:""}
        ${e.descricaoEscopo?`<p>${e.descricaoEscopo}</p>`:""}
      </section>

      ${t.includeEtapas&&e.etapas.length>0?`
      <!-- Etapas -->
      <section class="etapas">
        <h3>Etapas do Trabalho</h3>
        <table>
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Descri\xe7\xe3o</th>
              ${t.includeValues?"<th>Valor Estimado</th>":""}
            </tr>
          </thead>
          <tbody>
            ${e.etapas.map((e,o)=>`
            <tr>
              <td>${o+1}. ${e.titulo}</td>
              <td>${e.descricao||"-"}</td>
              ${t.includeValues?`<td>USD ${e.valorEstimado?.toFixed(2)||"0.00"}</td>`:""}
            </tr>
            `).join("")}
          </tbody>
        </table>
      </section>
      `:""}

      ${t.includeMateriais&&e.materiais.length>0?`
      <!-- Materiais -->
      <section class="materiais">
        <h3>Materiais</h3>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Qtd</th>
              <th>Unidade</th>
              ${t.includeValues?"<th>Valor Unit.</th>":""}
              ${t.includeValues?"<th>Total</th>":""}
            </tr>
          </thead>
          <tbody>
            ${e.materiais.map(e=>`
            <tr>
              <td>
                <strong>${e.nome}</strong>
                ${e.descricao?`<br><small>${e.descricao}</small>`:""}
              </td>
              <td>${e.quantidade}</td>
              <td>${e.unidade}</td>
              ${t.includeValues?`<td>USD ${e.valorUnitario?.toFixed(2)||"0.00"}</td>`:""}
              ${t.includeValues?`<td>USD ${((e.valorUnitario||0)*e.quantidade).toFixed(2)}</td>`:""}
            </tr>
            `).join("")}
          </tbody>
        </table>
      </section>
      `:""}

      <!-- Condi\xe7\xf5es Comerciais -->
      ${t.includeValues?`
      <section class="commercial">
        <h3>Condi\xe7\xf5es Comerciais</h3>
        <div class="commercial-info">
          ${e.valorEstimado?`<p><strong>Valor Total:</strong> USD ${e.valorEstimado.toFixed(2)}</p>`:""}
          ${e.precoPropostaCliente?`<p><strong>Pre\xe7o Final:</strong> USD ${e.precoPropostaCliente.toFixed(2)}</p>`:""}
          ${e.descontosOfertados?`<p><strong>Desconto:</strong> ${e.descontosOfertados}%</p>`:""}
          ${e.garantia?`<p><strong>Garantia:</strong> ${e.garantia}</p>`:""}
          ${e.validadeProposta?`<p><strong>Validade:</strong> ${new Date(e.validadeProposta).toLocaleDateString("pt-BR")}</p>`:""}
        </div>
        ${e.condicoesGerais?`
        <div class="terms">
          <h4>Condi\xe7\xf5es Gerais</h4>
          <p>${e.condicoesGerais}</p>
        </div>
        `:""}
        ${e.exclusoes?`
        <div class="exclusions">
          <h4>Exclus\xf5es</h4>
          <p>${e.exclusoes}</p>
        </div>
        `:""}
      </section>
      `:""}

      <!-- Observa\xe7\xf5es -->
      ${e.observacoesParaCliente?`
      <section class="observations">
        <h3>Observa\xe7\xf5es</h3>
        <p>${e.observacoesParaCliente}</p>
      </section>
      `:""}

      <!-- Rodap\xe9 -->
      <footer>
        <div class="signature-area">
          <div class="signature-box">
            <p><strong>Assinatura do Cliente</strong></p>
            <div class="signature-line"></div>
            <p>Data: ___/___/______</p>
          </div>
          <div class="signature-box">
            <p><strong>Respons\xe1vel T\xe9cnico</strong></p>
            <div class="signature-line"></div>
            <p>${t.header.empresa}</p>
          </div>
        </div>
        
        <div class="footer-info">
          <p>Esta proposta \xe9 v\xe1lida at\xe9 ${e.validadeProposta?new Date(e.validadeProposta).toLocaleDateString("pt-BR"):"30 dias a partir da data de emiss\xe3o"}</p>
          ${o?"<p><em>Documento gerado automaticamente - Confidencial</em></p>":""}
        </div>
      </footer>
    </body>
    </html>
    `}static getPDFStyles(e){return`
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        background-color: white;
      }
      
      ${e.watermark?`
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 80px;
        color: rgba(0, 0, 0, 0.1);
        font-weight: bold;
        z-index: -1;
        pointer-events: none;
      }
      `:""}
      
      header {
        border-bottom: 3px solid #2563eb;
        margin-bottom: 30px;
        padding-bottom: 20px;
      }
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      
      .company-info h1 {
        font-size: 24px;
        color: #2563eb;
        margin-bottom: 5px;
      }
      
      .proposal-info {
        text-align: right;
      }
      
      .proposal-info h2 {
        font-size: 20px;
        color: #1f2937;
        margin-bottom: 10px;
      }
      
      section {
        margin-bottom: 30px;
      }
      
      h3 {
        font-size: 16px;
        color: #2563eb;
        margin-bottom: 15px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 5px;
      }
      
      h4 {
        font-size: 14px;
        color: #374151;
        margin-bottom: 10px;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      
      th, td {
        border: 1px solid #d1d5db;
        padding: 8px;
        text-align: left;
      }
      
      th {
        background-color: #f9fafb;
        font-weight: bold;
        color: #374151;
      }
      
      tr:nth-child(even) {
        background-color: #f9fafb;
      }
      
      .commercial-info {
        background-color: #f0f9ff;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 15px;
      }
      
      .terms, .exclusions {
        background-color: #fef3c7;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 15px;
      }
      
      .signature-area {
        display: flex;
        justify-content: space-between;
        margin: 50px 0 20px 0;
      }
      
      .signature-box {
        text-align: center;
        width: 45%;
      }
      
      .signature-line {
        border-bottom: 1px solid #000;
        margin: 20px 0;
        height: 40px;
      }
      
      footer {
        border-top: 1px solid #e5e7eb;
        padding-top: 20px;
        margin-top: 50px;
      }
      
      .footer-info {
        text-align: center;
        font-size: 10px;
        color: #6b7280;
      }
      
      @media print {
        body {
          background: white;
        }
        
        .watermark {
          print-color-adjust: exact;
        }
      }
      
      @page {
        margin: 2cm;
        size: A4;
      }
    `}static async renderPDF(e,t){let o=this.generateHTML(e,t);return Buffer.from(o,"utf-8")}static generateFallbackPDF(e,t){let o=`
      Proposta ${e.numeroProposta}
      
      Cliente: ${e.contatoNome||"N/A"}
      Email: ${e.contatoEmail||"N/A"}
      
      Escopo: ${e.descricaoEscopo||"N/A"}
      
      ${t.includeValues&&e.precoPropostaCliente?`Valor: USD ${e.precoPropostaCliente.toFixed(2)}`:""}
      
      Documento gerado em ${new Date().toLocaleDateString("pt-BR")}
    `;return Buffer.from(o,"utf-8")}static generateFilename(e,t){let o=new Date().toISOString().split("T")[0];return`${"client"===t?"proposta":"proposta-internal"}-${e.numeroProposta}-${o}.pdf`}static validateForPDF(e){let t=[];return e.numeroProposta||t.push("N\xfamero da proposta \xe9 obrigat\xf3rio"),e.contatoNome||t.push("Nome do contato \xe9 obrigat\xf3rio"),e.descricaoEscopo||t.push("Descri\xe7\xe3o do escopo \xe9 obrigat\xf3ria"),{valid:0===t.length,errors:t}}}async function c(e,{params:t}){try{let{searchParams:o}=new URL(e.url),a=o.get("template")||"client",r="false"!==o.get("includeValues"),s="false"!==o.get("includeEtapas"),i="false"!==o.get("includeMateriais"),p=await d.db.proposta.findUnique({where:{id:parseInt(t.id)},include:{etapas:!0,materiais:!0,anexos:!0}});if(!p)return n.NextResponse.json({error:"Proposta n\xe3o encontrada"},{status:404});let c=l.validateForPDF(p);if(!c.valid)return n.NextResponse.json({error:"Proposta inv\xe1lida para gera\xe7\xe3o de PDF",details:c.errors},{status:400});let{buffer:u,filename:g,contentType:m}=await l.generatePDF(p,{userId:1,userRole:"admin",permissions:["propostas.view","propostas.export"],isClientAccess:"client"===a},{includeValues:r,includeEtapas:s,includeMateriais:i,includeAnexos:!1,template:a,watermark:"client"===a?"CONFIDENCIAL":"",header:{empresa:"GladPros",contato:"contato@gladpros.com"}}),h=new Headers;return h.set("Content-Type",m),h.set("Content-Disposition",`attachment; filename="${g}"`),h.set("Cache-Control","no-cache"),new n.NextResponse(u,{status:200,headers:h})}catch(e){return console.error("Erro ao gerar PDF da proposta:",e),n.NextResponse.json({error:"Erro interno do servidor",message:e instanceof Error?e.message:"Erro desconhecido"},{status:500})}}async function u(){return n.NextResponse.json({error:"M\xe9todo n\xe3o permitido"},{status:405})}async function g(){return n.NextResponse.json({error:"M\xe9todo n\xe3o permitido"},{status:405})}async function m(){return n.NextResponse.json({error:"M\xe9todo n\xe3o permitido"},{status:405})}let h=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/propostas/[id]/pdf/route",pathname:"/api/propostas/[id]/pdf",filename:"route",bundlePath:"app/api/propostas/[id]/pdf/route"},resolvedPagePath:"C:\\Users\\gladi\\Documents\\gladpros-nextjs\\src\\app\\api\\propostas\\[id]\\pdf\\route.ts",nextConfigOutput:"standalone",userland:a}),{workAsyncStorage:x,workUnitAsyncStorage:f,serverHooks:b}=h;function $(){return(0,i.patchFetch)({workAsyncStorage:x,workUnitAsyncStorage:f})}},96487:()=>{}};var t=require("../../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),a=t.X(0,[7719,580],()=>o(84914));module.exports=a})();