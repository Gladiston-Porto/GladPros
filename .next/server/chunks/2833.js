"use strict";exports.id=2833,exports.ids=[2833],exports.modules={92833:(e,a,i)=>{i.d(a,{SecurityService:()=>c});var t=i(13641),s=i(18318),d=i(55511),r=i.n(d);function o(){return t.z.historicoSenha}function n(){return t.z.tentativaLogin}class c{static async createSession(e,a,i){let s=r().randomBytes(32).toString("hex");try{await this.cleanExpiredSessions()}catch{}try{await this.revokeAllUserSessions(e)}catch{}let d=t.z.sessaoAtiva;return d?.create?await d.create({data:{usuarioId:e,token:s,ip:a||null,userAgent:i||null}}):await t.z.$executeRaw`
        INSERT INTO SessaoAtiva (usuarioId, token, ip, userAgent, ultimaAtividade, criadoEm)
        VALUES (${e}, ${s}, ${a||null}, ${i||null}, NOW(), NOW())
      `,s}static async updateSessionActivity(e){let a=t.z.sessaoAtiva;if(a?.update)return void await a.update({where:{token:e},data:{ultimaAtividade:new Date}}).catch(()=>{});await t.z.$executeRaw`
      UPDATE SessaoAtiva SET ultimaAtividade = NOW() WHERE token = ${e}
    `}static async getUserSessions(e){let a,i=t.z.sessaoAtiva;return(i?.findMany?await i.findMany({where:{usuarioId:e},orderBy:{ultimaAtividade:"desc"}}):await t.z.$queryRaw`
        SELECT id, usuarioId, token, ip, userAgent, cidade, pais, ultimaAtividade, criadoEm
        FROM SessaoAtiva
        WHERE usuarioId = ${e}
        ORDER BY ultimaAtividade DESC
      `).map(e=>({id:e.id,token:e.token,ip:e.ip||void 0,userAgent:e.userAgent||void 0,cidade:e.cidade||void 0,pais:e.pais||void 0,ultimaAtividade:e.ultimaAtividade,criadoEm:e.criadoEm}))}static async revokeSession(e){let a=t.z.sessaoAtiva;if(a?.delete)return void await a.delete({where:{id:e}}).catch(()=>{});await t.z.$executeRaw`
      DELETE FROM SessaoAtiva WHERE id = ${e}
    `}static async revokeSessionByToken(e){let a=t.z.sessaoAtiva;if(a?.deleteMany)return void await a.deleteMany({where:{token:e}});await t.z.$executeRaw`
      DELETE FROM SessaoAtiva WHERE token = ${e}
    `}static async revokeAllUserSessions(e){let a=t.z.sessaoAtiva;if(a?.deleteMany)return void await a.deleteMany({where:{usuarioId:e}});await t.z.$executeRaw`
      DELETE FROM SessaoAtiva WHERE usuarioId = ${e}
    `}static async cleanExpiredSessions(){let e=new Date(Date.now()-864e5),a=t.z.sessaoAtiva;if(a?.deleteMany)return void await a.deleteMany({where:{ultimaAtividade:{lt:e}}});await t.z.$executeRaw`
      DELETE FROM SessaoAtiva WHERE ultimaAtividade < ${e}
    `}static async addPasswordToHistory(e,a){await o().create({data:{usuarioId:e,senhaHash:a}});let i=await o().findMany({where:{usuarioId:e},orderBy:{criadaEm:"desc"},skip:5,select:{id:!0}});i.length>0&&await o().deleteMany({where:{id:{in:i.map(e=>e.id)}}})}static async isPasswordReused(e,a){for(let i of(await o().findMany({where:{usuarioId:e},orderBy:{criadaEm:"desc"},take:5,select:{senhaHash:!0}})))if(await s.default.compare(a,i.senhaHash))return!0;return!1}static async getLoginAttempts(e=100){return(await n().findMany({orderBy:{criadaEm:"desc"},take:e,select:{id:!0,email:!0,ip:!0,userAgent:!0,sucesso:!0,criadaEm:!0}})).map(e=>({id:e.id,email:e.email,ip:e.ip||void 0,userAgent:e.userAgent||void 0,sucesso:e.sucesso,criadoEm:e.criadaEm}))}static async getFailedLogins(e=24){let a=new Date(Date.now()-60*e*6e4);return(await n().findMany({where:{sucesso:!1,criadaEm:{gt:a}},orderBy:{criadaEm:"desc"},select:{id:!0,email:!0,ip:!0,userAgent:!0,sucesso:!0,criadaEm:!0}})).map(e=>({id:e.id,email:e.email,ip:e.ip||void 0,userAgent:e.userAgent||void 0,sucesso:e.sucesso,criadoEm:e.criadaEm}))}static async getLoginAttemptsByUser(e,a=100){return(await t.z.$queryRaw`
      SELECT id, email, ip, userAgent, sucesso, motivo, criadaEm
      FROM TentativaLogin
      WHERE usuarioId = ${e}
      ORDER BY criadaEm DESC
      LIMIT ${a}
    `).map(e=>({id:e.id,email:e.email,ip:e.ip||void 0,userAgent:e.userAgent||void 0,sucesso:e.sucesso,motivoFalha:e.motivo||void 0,criadoEm:e.criadaEm}))}static async getActiveSessions(){return(await t.z.sessaoAtiva.findMany({include:{usuario:{select:{nomeCompleto:!0,email:!0}}},orderBy:{ultimaAtividade:"desc"}})).map(e=>({id:e.id,token:e.token,ip:e.ip||void 0,userAgent:e.userAgent||void 0,cidade:e.cidade||void 0,pais:e.pais||void 0,ultimaAtividade:e.ultimaAtividade,criadoEm:e.criadoEm}))}}}};