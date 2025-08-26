Estrutura de Banco de Dados (resumo)

clientes: id, nome, tipo, email, telefone, documento, endereco
propostas: cliente_id, status, materiais, etapas, valor_estimado
projetos: proposta_id, status, devolucoes, inspecoes
estoque: codigo, nome, quantidade_disponivel, quantidade_minima
usuarios: id, email, senha, nivel, avatar_url, ativo
financeiro_empresa: tipo, descricao, valor, projeto_id
refresh_tokens, sessoes: tokens ativos
notificacoes: usuario_id, titulo, mensagem, setor, lida, criada_em
tickets: usuario_id, setor_destino, assunto, descricao, status