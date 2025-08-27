import bcrypt from "bcryptjs";

export class PasswordService {
  // Critérios: mínimo 9 chars, 1 maiúscula, 1 número, 1 símbolo
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || password.length < 9) {
      errors.push("Senha deve ter no mínimo 9 caracteres");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Senha deve conter pelo menos 1 letra maiúscula");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Senha deve conter pelo menos 1 número");
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Senha deve conter pelo menos 1 símbolo especial");
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  static generateProvisionalPassword(): string {
    // Gera senha provisória que atende aos critérios
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const symbols = "!@#$%&*";
    
    let password = "";
    
    // Garantir pelo menos 1 maiúscula
    password += "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 25)];
    
    // Garantir pelo menos 1 número
    password += "23456789"[Math.floor(Math.random() * 8)];
    
    // Garantir pelo menos 1 símbolo
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar com mais 6 caracteres aleatórios
    for (let i = 0; i < 6; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Embaralhar a senha para não ter padrão fixo
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
  
  static getPasswordStrength(password: string): { 
    score: number; 
    label: string; 
    color: string;
    criteriaMet: string[];
  } {
    let score = 0;
    const criteriaMet: string[] = [];
    
    if (password.length >= 9) {
      score += 20;
      criteriaMet.push("Mínimo 9 caracteres");
    }
    
    if (/[A-Z]/.test(password)) {
      score += 20;
      criteriaMet.push("Letra maiúscula");
    }
    
    if (/[a-z]/.test(password)) {
      score += 10;
      criteriaMet.push("Letra minúscula");
    }
    
    if (/[0-9]/.test(password)) {
      score += 20;
      criteriaMet.push("Número");
    }
    
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 20;
      criteriaMet.push("Símbolo especial");
    }
    
    if (password.length >= 12) {
      score += 10;
      criteriaMet.push("Senha longa (12+ caracteres)");
    }
    
    // Determinar label e cor
    let label = "Muito fraca";
    let color = "#ef4444"; // red-500
    
    if (score >= 90) {
      label = "Muito forte";
      color = "#22c55e"; // green-500
    } else if (score >= 70) {
      label = "Forte";
      color = "#84cc16"; // lime-500
    } else if (score >= 50) {
      label = "Moderada";
      color = "#eab308"; // yellow-500
    } else if (score >= 30) {
      label = "Fraca";
      color = "#f97316"; // orange-500
    }
    
    return { score, label, color, criteriaMet };
  }
}
