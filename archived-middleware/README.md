Arquivos de middleware arquivados.

- `middleware-old.ts` — versão anterior com checagens RBAC e lógica distinta.
	- Commit onde existia por último: d32aa91a17be1154ad99d5b9205fcaf20c0b9f48

- `middleware-new.ts` — experimento com `jose` e payloades diferentes.
	- Commit onde existia por último: d32aa91a17be1154ad99d5b9205fcaf20c0b9f48

Como recuperar/consultar as versões do histórico:

```bash
# ver versão antiga direto no terminal
git show <HASH>:middleware-old.ts

# recuperar para um arquivo temporário
git show <HASH>:middleware-old.ts > archived-middleware/middleware-old-original.ts
```

Mantenha `middleware.ts` como a versão oficial.
