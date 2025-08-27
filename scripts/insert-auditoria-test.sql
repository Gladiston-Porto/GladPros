INSERT INTO Auditoria (tabela, registroId, acao, usuarioId, ip, payload) VALUES
('Usuario', 2, 'CREATE', 2, '192.168.1.100', '{"nomeCompleto": "Gladiston Porto", "email": "gladiston.porto@gladpros.com"}'),
('Usuario', 2, 'UPDATE', 2, '192.168.1.100', '{"before": {"telefone": "(11)1111-1111"}, "after": {"telefone": "(11)99999-9999"}}'),
('Usuario', 2, 'LOGIN', 2, '192.168.1.101', '{"userAgent": "Mozilla/5.0 Chrome/127.0.0.0", "timestamp": "2025-08-20T10:30:00Z"}'),
('Usuario', 2, 'LOGOUT', 2, '192.168.1.101', '{"duration": "2h30m", "timestamp": "2025-08-20T13:00:00Z"}'),
('Usuario', 5, 'CREATE', 2, '192.168.1.102', '{"nomeCompleto": "Usuario Teste", "email": "teste@gladpros.com"}'),
('Usuario', 5, 'UPDATE', 5, '192.168.1.103', '{"before": {"status": "INATIVO"}, "after": {"status": "ATIVO"}}');
