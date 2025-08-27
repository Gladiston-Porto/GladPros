Fluxo de Autenticação

Cadastro: senha hash (bcrypt), email único

Login:

Rate limit após 5 tentativas

MFA por email com código de 6 dígitos (10min)

Geração de access token (15min) e refresh token (7 dias)

Sessão salva com refresh_tokens e sessoes

Logout remove apenas o refresh token

Níveis de acesso aplicados nas rotas e no frontend

Upload de avatar salvo em local mais eficiente (CDN ou pasta pública)

Recuperação de senha com token JWT e tempo de expiração válido