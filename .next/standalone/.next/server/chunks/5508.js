"use strict";exports.id=5508,exports.ids=[5508],exports.modules={35508:(e,t,a)=>{a.d(t,{BlockingService:()=>u});var i=a(13641);class u{static get tentativaDelegate(){return i.z.tentativaLogin}static get usuarioDelegate(){if("1"===process.env.USE_PRISMA_DELEGATES)return i.z.usuario}static{this.BLOCK_THRESHOLDS=[{attempts:5,blockMinutes:1},{attempts:8,blockMinutes:5},{attempts:12,blockMinutes:30},{attempts:15,blockMinutes:120},{attempts:20,blockMinutes:0}]}static async recordFailedAttempt({userId:e,email:t,ip:a,userAgent:u,motivo:s}){this.tentativaDelegate?.create?await this.tentativaDelegate.create({data:{usuarioId:e??null,email:t??"unknown",sucesso:!1,ip:a??null,userAgent:u??null,motivo:s||null}}):await i.z.$executeRaw`
        INSERT INTO TentativaLogin (usuarioId, email, sucesso, ip, userAgent, motivo)
        VALUES (${e||null}, ${t||"unknown"}, FALSE, ${a||null}, ${u||null}, ${s||null})
      `,e&&await this.updateUserBlockStatus(e)}static async clearFailedAttempts(e){this.usuarioDelegate?.update?await this.usuarioDelegate.update({where:{id:e},data:{bloqueado:!1,bloqueadoEm:null}}):await i.z.$executeRaw`
        UPDATE Usuario 
        SET bloqueado = FALSE, bloqueadoEm = NULL 
        WHERE id = ${e}
      `}static async checkUserBlock(e){let t=this.usuarioDelegate?.findUnique?await this.usuarioDelegate.findUnique({where:{id:e},select:{bloqueado:!0,bloqueadoEm:!0,pinSeguranca:!0,perguntaSecreta:!0}}):(await i.z.$queryRaw`
          SELECT bloqueado, bloqueadoEm, pinSeguranca, perguntaSecreta
          FROM Usuario 
          WHERE id = ${e}
        `)[0];if(!t||!t.bloqueado||!t.bloqueadoEm)return{blocked:!1};let a=await this.getFailedAttemptCount(e),u=this.getBlockThreshold(a);if(0===u.blockMinutes)return{blocked:!0,requiresPinUnlock:!!t.pinSeguranca,requiresSecurityQuestion:!!t.perguntaSecreta,attemptCount:a};if(!t.bloqueadoEm)return{blocked:!1};let s=new Date(t.bloqueadoEm.getTime()+60*u.blockMinutes*1e3);return new Date>=s?(this.usuarioDelegate?.update?await this.usuarioDelegate.update({where:{id:e},data:{bloqueado:!1,bloqueadoEm:null}}):await i.z.$executeRaw`
          UPDATE Usuario 
          SET bloqueado = FALSE, bloqueadoEm = NULL 
          WHERE id = ${e}
        `,{blocked:!1}):{blocked:!0,unlockAt:s,requiresPinUnlock:!!t.pinSeguranca,requiresSecurityQuestion:!!t.perguntaSecreta,attemptCount:a}}static async updateUserBlockStatus(e){await this.getFailedAttemptCount(e)>=5&&(this.usuarioDelegate?.update?await this.usuarioDelegate.update({where:{id:e},data:{bloqueado:!0,bloqueadoEm:new Date}}):await i.z.$executeRaw`
          UPDATE Usuario 
          SET bloqueado = TRUE, bloqueadoEm = NOW() 
          WHERE id = ${e}
        `)}static async getFailedAttemptCount(e){let t=await i.z.$queryRaw`
      SELECT COUNT(*) as count
      FROM TentativaLogin 
      WHERE usuarioId = ${e}
        AND sucesso = FALSE
        AND criadaEm > COALESCE(
          (SELECT MAX(criadaEm) FROM TentativaLogin WHERE usuarioId = ${e} AND sucesso = TRUE),
          DATE_SUB(NOW(), INTERVAL 24 HOUR)
        )
        AND criadaEm > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `;return t[0]?.count||0}static getBlockThreshold(e){for(let t of this.BLOCK_THRESHOLDS)if(e<=t.attempts)return t;return this.BLOCK_THRESHOLDS[this.BLOCK_THRESHOLDS.length-1]}static async unlockWithPin(e,t){let u=this.usuarioDelegate?.findUnique?await this.usuarioDelegate.findUnique({where:{id:e},select:{pinSeguranca:!0,bloqueado:!0}}):(await i.z.$queryRaw`
          SELECT pinSeguranca, bloqueado
          FROM Usuario 
          WHERE id = ${e}
        `)[0];if(!u)return{success:!1,error:"Usu\xe1rio n\xe3o encontrado"};if(!u.bloqueado)return{success:!1,error:"Usu\xe1rio n\xe3o est\xe1 bloqueado"};if(!u.pinSeguranca)return{success:!1,error:"PIN de seguran\xe7a n\xe3o cadastrado"};let s=await a.e(8318).then(a.bind(a,18318));return await s.compare(t,u.pinSeguranca)?(await this.clearFailedAttempts(e),{success:!0}):{success:!1,error:"PIN inv\xe1lido"}}static async unlockWithSecurityQuestion(e,t){let u=this.usuarioDelegate?.findUnique?await this.usuarioDelegate.findUnique({where:{id:e},select:{respostaSecreta:!0,bloqueado:!0}}):(await i.z.$queryRaw`
          SELECT respostaSecreta, bloqueado
          FROM Usuario 
          WHERE id = ${e}
        `)[0];if(!u)return{success:!1,error:"Usu\xe1rio n\xe3o encontrado"};if(!u.bloqueado)return{success:!1,error:"Usu\xe1rio n\xe3o est\xe1 bloqueado"};if(!u.respostaSecreta)return{success:!1,error:"Resposta de seguran\xe7a n\xe3o cadastrada"};let s=await a.e(8318).then(a.bind(a,18318));return await s.compare(t.toLowerCase().trim(),u.respostaSecreta)?(await this.clearFailedAttempts(e),{success:!0}):{success:!1,error:"Resposta inv\xe1lida"}}}}};