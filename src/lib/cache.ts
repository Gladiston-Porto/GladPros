import Redis from 'ioredis';

// Check if we're in build time
function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-production-server' ||
    process.env.NEXT_PHASE === 'phase-static' ||
    process.env.NEXT_PHASE === 'phase-export' ||
    process.env.CI === 'true'
  );
}

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { value: unknown; expires: number }> = new Map();
  private initialized: boolean = false;

  constructor() {
    if (!isBuildTime()) {
      this.initializeRedis();
      
      // Limpeza automática do cache em memória a cada 5 minutos
      setInterval(() => {
        this.cleanupMemoryCache();
      }, 5 * 60 * 1000);
    }
  }

  private async initializeRedis() {
    if (isBuildTime() || this.initialized) return;
    
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 2
      });

      // Testar conexão
      await this.redis.ping();
      console.log('[CACHE] Redis conectado com sucesso');
      this.initialized = true;
    } catch (error) {
      console.warn('[CACHE] Redis não disponível, usando cache em memória:', error);
      this.redis = null;
      this.initialized = true;
    }
  }

  private cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expires < now) {
        this.memoryCache.delete(key);
      }
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    if (isBuildTime()) return null;
    
    if (!this.initialized) await this.initializeRedis();
    
    try {
      if (this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Cache em memória
        const item = this.memoryCache.get(key);
        if (item && item.expires > Date.now()) {
          return item.value as T;
        }
        this.memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      console.error('[CACHE] Erro ao buscar:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<boolean> {
    if (isBuildTime()) return true;
    
    if (!this.initialized) await this.initializeRedis();
    
    try {
      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        return true;
      } else {
        // Cache em memória
        this.memoryCache.set(key, {
          value,
          expires: Date.now() + (ttlSeconds * 1000)
        });
        return true;
      }
    } catch (error) {
      console.error('[CACHE] Erro ao salvar:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (this.redis) {
        await this.redis.del(key);
        return true;
      } else {
        this.memoryCache.delete(key);
        return true;
      }
    } catch (error) {
      console.error('[CACHE] Erro ao deletar:', error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return keys.length;
      } else {
        // Cache em memória - busca por padrão simples
        let deleted = 0;
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
            deleted++;
          }
        }
        return deleted;
      }
    } catch (error) {
      console.error('[CACHE] Erro ao deletar padrão:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.redis) {
        const result = await this.redis.exists(key);
        return result === 1;
      } else {
        const item = this.memoryCache.get(key);
        return !!(item && item.expires > Date.now());
      }
    } catch (error) {
      console.error('[CACHE] Erro ao verificar existência:', error);
      return false;
    }
  }

  // Cache específico para sessões de usuário
  async setUserSession<T = unknown>(userId: number, sessionData: T, ttlSeconds: number = 86400): Promise<boolean> {
    return this.set(`user_session:${userId}`, sessionData, ttlSeconds);
  }

  async getUserSession<T = unknown>(userId: number): Promise<T | null> {
    return this.get<T>(`user_session:${userId}`);
  }

  async deleteUserSession(userId: number): Promise<boolean> {
    return this.delete(`user_session:${userId}`);
  }

  // Cache para dados de usuário
  async setUserData<T = unknown>(userId: number, userData: T, ttlSeconds: number = 1800): Promise<boolean> {
    return this.set(`user_data:${userId}`, userData, ttlSeconds);
  }

  async getUserData<T = unknown>(userId: number): Promise<T | null> {
    return this.get<T>(`user_data:${userId}`);
  }

  async invalidateUserData(userId: number): Promise<boolean> {
    return this.delete(`user_data:${userId}`);
  }

  // Cache para listas (com paginação)
  async setListData<T = unknown>(listKey: string, page: number, limit: number, data: T, ttlSeconds: number = 600): Promise<boolean> {
    const key = `list:${listKey}:${page}:${limit}`;
    return this.set(key, data, ttlSeconds);
  }

  async getListData<T = unknown>(listKey: string, page: number, limit: number): Promise<T | null> {
    const key = `list:${listKey}:${page}:${limit}`;
    return this.get<T>(key);
  }

  async invalidateListData(listKey: string): Promise<number> {
    return this.deletePattern(`list:${listKey}:*`);
  }

  // Cache para estatísticas do dashboard
  async setDashboardStats<T = unknown>(userId: number, stats: T, ttlSeconds: number = 300): Promise<boolean> {
    return this.set(`dashboard_stats:${userId}`, stats, ttlSeconds);
  }

  async getDashboardStats<T = unknown>(userId: number): Promise<T | null> {
    return this.get<T>(`dashboard_stats:${userId}`);
  }

  // Cache para configurações do sistema
  async setSystemConfig<T = unknown>(configKey: string, config: T, ttlSeconds: number = 3600): Promise<boolean> {
    return this.set(`system_config:${configKey}`, config, ttlSeconds);
  }

  async getSystemConfig<T = unknown>(configKey: string): Promise<T | null> {
    return this.get<T>(`system_config:${configKey}`);
  }

  // Métricas de cache
  async getStats(): Promise<{
    redis: boolean;
    memoryKeys: number;
    redisKeys?: number;
  }> {
    const stats = {
      redis: !!this.redis,
      memoryKeys: this.memoryCache.size
    };

    if (this.redis) {
      try {
        const info = await this.redis.info('keyspace');
        const keyspaceMatch = info.match(/db0:keys=(\d+)/);
        return {
          ...stats,
          redisKeys: keyspaceMatch ? parseInt(keyspaceMatch[1]) : 0
        };
      } catch (error) {
        console.error('[CACHE] Erro ao obter estatísticas do Redis:', error);
      }
    }

    return stats;
  }

  // Limpeza completa do cache
  async flush(): Promise<boolean> {
    try {
      if (this.redis) {
        await this.redis.flushdb();
      }
      this.memoryCache.clear();
      console.log('[CACHE] Cache limpo completamente');
      return true;
    } catch (error) {
      console.error('[CACHE] Erro ao limpar cache:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<{
    redis: boolean;
    memory: boolean;
    error?: string;
  }> {
    const result = {
      redis: false,
      memory: true,
      error: undefined as string | undefined
    };

    try {
      if (this.redis) {
        await this.redis.ping();
        result.redis = true;
      }
    } catch (error) {
      result.error = `Redis: ${error}`;
    }

    return result;
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Helper function for caching expensive operations
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 600
): Promise<T> {
  // Tentar buscar do cache primeiro
  const cached = await cacheService.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Se não estiver no cache, executar função e cachear resultado
  const result = await fetchFn();
  await cacheService.set(key, result, ttlSeconds);
  return result;
}
