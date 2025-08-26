// src/lib/email.ts
import nodemailer from 'nodemailer';
import { renderBaseTemplate } from './emails/template-base';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
  private static isInitialized = false;

  private static getConfig(): EmailConfig {
    return {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    };
  }

  private static async initializeTransporter(): Promise<void> {
    if (this.isInitialized) return;

    const config = this.getConfig();
    
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexão uma única vez
    try {
      await this.transporter.verify();
      console.log('[Email] Transporter singleton configurado com sucesso');
      this.isInitialized = true;
    } catch (error) {
      console.error('[Email] Erro na configuração:', error);
      if (process.env.NODE_ENV === 'development') {
        console.log('[Email] Usando modo de desenvolvimento (logs)');
        this.isInitialized = true; // Permitir uso em dev mesmo com falha SMTP
      }
    }
  }

  private static async getTransporter(): Promise<ReturnType<typeof nodemailer.createTransport>> {
    await this.initializeTransporter();
    return this.transporter!;
  }

  static async sendMFA({
    to,
    userName,
    code,
    expiresInMinutes = 5,
    isFirstAccess = false
  }: {
    to: string;
    userName: string;
    code: string;
    expiresInMinutes?: number;
    isFirstAccess?: boolean;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getMFATemplate({
        userName,
        code,
        expiresInMinutes,
        isFirstAccess
      });

      return await this.sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
    } catch (error) {
      console.error('[Email] Erro ao enviar MFA:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async sendPasswordReset({
    to,
    userName,
    resetLink,
    expiresInHours = 1
  }: {
    to: string;
    userName: string;
    resetLink: string;
    expiresInHours?: number;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[EmailService] sendPasswordReset chamado para:', to)
    try {
      const template = this.getPasswordResetTemplate({
        userName,
        resetLink,
        expiresInHours
      });

      console.log('[EmailService] Template gerado, chamando sendEmail...')
      const result = await this.sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
      console.log('[EmailService] sendEmail result:', result)
      return result
    } catch (error) {
      console.error('[Email] Erro ao enviar reset:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async sendProvisionalPassword({
    to,
    userName,
    provisionalPassword,
    expiresInDays = 7
  }: {
    to: string;
    userName: string;
    provisionalPassword: string;
    expiresInDays?: number;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getProvisionalPasswordTemplate({
        userName,
        provisionalPassword,
        expiresInDays
      });

      return await this.sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
    } catch (error) {
      console.error('[Email] Erro ao enviar senha provisória:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private static async sendEmail({
    to,
    subject,
    html,
    text
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
        // Modo desenvolvimento - log no console
        console.log('\n📧 [EMAIL DEV MODE]');
        console.log('Para:', to);
        console.log('Assunto:', subject);
        console.log('Conteúdo:', text || html.replace(/<[^>]*>/g, ''));
        console.log('📧 [/EMAIL DEV MODE]\n');
        return { success: true, messageId: 'dev-mode' };
      }

      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"GladPros Sistema" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '')
      };

      const info = await transporter.sendMail(mailOptions);
      
      return { 
        success: true, 
        messageId: info.messageId 
      };

    } catch (error) {
      console.error('[Email] Erro ao enviar:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  private static getMFATemplate({
    userName,
    code,
    expiresInMinutes,
    isFirstAccess
  }: {
    userName: string;
    code: string;
    expiresInMinutes: number;
    isFirstAccess: boolean;
  }): EmailTemplate {
    const accessType = isFirstAccess ? 'primeiro acesso' : 'login';
    const subject = `GladPros — Código de verificação: ${code}`;
    const preheader = `Seu código de verificação para ${accessType} na GladPros.`;
    
    const content = `
      <p>Olá, <strong>${userName}</strong>!</p>
      <p>Você solicitou <strong>${accessType}</strong> em sua conta GladPros. Para continuar, use o código de verificação abaixo:</p>
      
      <div class="code-display">
        <div class="code-text">${code}</div>
      </div>
      
      <p><strong>⏰ Este código expira em ${expiresInMinutes} minutos.</strong></p>
      
      <div class="card warning-card">
        <div style="font-weight:700; margin-bottom:6px;">🔒 Dicas de Segurança</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Nunca compartilhe este código com ninguém</li>
          <li>Nossa equipe nunca solicitará este código por telefone ou email</li>
          <li>Se não foi você que solicitou, ignore este email com segurança</li>
        </ul>
      </div>
    `;

    const html = renderBaseTemplate({
      subject,
      preheader,
      title: "Código de Verificação",
      subtitle: `Confirmação necessária para ${accessType}`,
      content
    });

    const text = `
GladPros - Código de Verificação

Olá, ${userName}

Você solicitou ${accessType} em sua conta GladPros.
Seu código de verificação é: ${code}

Este código expira em ${expiresInMinutes} minutos.

SEGURANÇA:
- Nunca compartilhe este código com ninguém
- Nossa equipe nunca solicitará este código por telefone ou email
- Se não foi você que solicitou, ignore este email

Este email foi enviado automaticamente pelo sistema GladPros.
    `.trim();

    return {
      subject,
      html,
      text
    };
  }

  private static getPasswordResetTemplate({
    userName,
    resetLink,
    expiresInHours
  }: {
    userName: string;
    resetLink: string;
    expiresInHours: number;
  }): EmailTemplate {
    const subject = 'GladPros — Redefinição de senha solicitada';
    const preheader = 'Link para redefinir sua senha na GladPros. Expire em breve.';
    
    const content = `
      <p>Olá, <strong>${userName}</strong>!</p>
      <p>Recebemos uma solicitação para <strong>redefinir a senha</strong> da sua conta GladPros.</p>
      
      <div class="card info-card">
        <div style="font-weight:700; margin-bottom:6px;">🔗 Link para redefinição</div>
        <p style="margin:8px 0; word-break:break-all; font-size:14px;">
          ${resetLink}
        </p>
      </div>
      
      <p><strong>⏰ Este link expira em ${expiresInHours} hora(s).</strong></p>
      
      <div class="card danger-card">
        <div style="font-weight:700; margin-bottom:6px;">⚠️ Importante</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Se você não solicitou esta redefinição, ignore este email</li>
          <li>Sua senha atual permanecerá inalterada até que você use este link</li>
          <li>Por segurança, este link só pode ser usado uma vez</li>
        </ul>
      </div>
    `;

    const html = renderBaseTemplate({
      subject,
      preheader,
      title: "Redefinição de Senha",
      subtitle: "Solicitação para alteração da sua senha de acesso",
      content,
      ctaButton: {
        text: "Redefinir Minha Senha",
        url: resetLink
      },
      footerNote: "Se você não solicitou a redefinição de senha, pode ignorar este email com segurança."
    });

    return {
      subject,
      html,
      text: `GladPros - Redefinição de senha\n\nOlá, ${userName}\n\nRecebemos uma solicitação para redefinir sua senha.\nClique no link: ${resetLink}\n\nEste link expira em ${expiresInHours} hora(s).`
    };
  }

  private static getProvisionalPasswordTemplate({
    userName,
    provisionalPassword,
    expiresInDays
  }: {
    userName: string;
    provisionalPassword: string;
    expiresInDays: number;
  }): EmailTemplate {
    const subject = 'GladPros — Bem-vindo! Sua senha provisória';
    const preheader = 'Sua conta foi criada. Use a senha provisória para o primeiro acesso.';
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
    
    const content = `
      <p>Olá, <strong>${userName}</strong>!</p>
      <p>Sua conta foi criada com sucesso no sistema GladPros! Para acessar pela primeira vez, use as credenciais abaixo:</p>
      
      <div class="card success-card">
        <div style="font-weight:700; margin-bottom:8px;">🔑 Credenciais de Acesso</div>
        <div style="margin-bottom:8px;">
          <div style="font-size:12px; color:#15803D; margin-bottom:4px;">Senha Provisória</div>
          <div style="background:#ffffff; color:#0F365E; border:1px solid #BBF7D0; padding:8px 12px; border-radius:8px; display:inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-weight:bold; letter-spacing:2px;">
            ${provisionalPassword}
          </div>
        </div>
      </div>
      
      <div class="card info-card">
        <div style="font-weight:700; margin-bottom:6px;">📋 Próximos Passos</div>
        <ol style="margin:8px 0 0 18px; padding:0;">
          <li>Acesse o sistema com sua senha provisória</li>
          <li>Confirme sua identidade com o código MFA enviado por email</li>
          <li>Configure sua senha definitiva (mín. 9 caracteres)</li>
          <li>Configure seu PIN de segurança (4 dígitos)</li>
          <li>Escolha uma pergunta de segurança</li>
        </ol>
      </div>
      
      <p><strong>⏰ Esta senha provisória expira em ${expiresInDays} dias.</strong></p>
      
      <div class="card warning-card">
        <div style="font-weight:700; margin-bottom:6px;">🔒 Dicas de Segurança</div>
        <ul style="margin:8px 0 0 18px; padding:0;">
          <li>Altere esta senha provisória no primeiro acesso</li>
          <li>Nunca compartilhe suas credenciais com ninguém</li>
          <li>Use uma senha forte e única para sua conta</li>
        </ul>
      </div>
    `;

    const html = renderBaseTemplate({
      subject,
      preheader,
      title: `Bem-vindo, ${userName}!`,
      subtitle: "Sua conta foi criada com sucesso",
      content,
      ctaButton: {
        text: "Acessar Sistema",
        url: loginUrl
      },
      footerNote: "Em caso de dúvidas, entre em contato com o suporte."
    });

    return {
      subject,
      html,
      text: `GladPros - Bem-vindo!\n\nOlá, ${userName}\n\nSua conta foi criada! Senha provisória: ${provisionalPassword}\n\nEsta senha expira em ${expiresInDays} dias.\n\nAltere-a no primeiro acesso para maior segurança.`
    };
  }
}
