"use strict";exports.id=3603,exports.ids=[3603],exports.modules={73603:(a,r,i)=>{i.d(r,{AuditoriaService:()=>o});var t=i(13641);class o{static async registrar({tabela:a,registroId:r,acao:i,usuarioId:o,ip:s,payload:e}){try{await t.z.$executeRaw`
        INSERT INTO Auditoria (tabela, registroId, acao, usuarioId, ip, payload)
        VALUES (${a}, ${r}, ${i}, ${o}, ${s}, ${JSON.stringify(e)})
      `}catch(a){console.error("Erro ao registrar auditoria:",a)}}static async registrarLogin(a,r,i){await this.registrar({tabela:"Usuario",registroId:a,acao:"LOGIN",usuarioId:a,ip:r,payload:{userAgent:i,timestamp:new Date().toISOString()}})}static async registrarLogout(a,r,i){await this.registrar({tabela:"Usuario",registroId:a,acao:"LOGOUT",usuarioId:a,ip:r,payload:{duration:i,timestamp:new Date().toISOString()}})}static async registrarCriacaoUsuario(a,r,i,t){await this.registrar({tabela:"Usuario",registroId:a,acao:"CREATE",usuarioId:i,ip:t,payload:r})}static async registrarAtualizacaoUsuario(a,r,i,t,o){await this.registrar({tabela:"Usuario",registroId:a,acao:"UPDATE",usuarioId:t,ip:o,payload:{before:r,after:i}})}static async registrarExclusaoUsuario(a,r,i,t){await this.registrar({tabela:"Usuario",registroId:a,acao:"DELETE",usuarioId:i,ip:t,payload:r})}static async buscarPorUsuario(a,r=100){return await t.z.$queryRaw`
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
      WHERE a.registroId = ${a} AND a.tabela = 'Usuario'
         OR a.usuarioId = ${a}
      ORDER BY a.criadoEm DESC
      LIMIT ${r}
    `}static async buscarPorTabela(a,r){return await t.z.$queryRaw`
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
      WHERE a.tabela = ${a} AND a.registroId = ${r}
      ORDER BY a.criadoEm DESC
    `}}}};