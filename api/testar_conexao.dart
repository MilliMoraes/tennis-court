import 'dart:io';
import 'package:postgres/postgres.dart';

Future<void> main() async {
  final senha = Platform.environment['ACECOURT_DB_SENHA'];

  if (senha == null || senha.isEmpty) {
    stderr.writeln('Informe a senha do PostgreSQL antes de rodar o teste.');
    exitCode = 1;
    return;
  }

  final conexao = await Connection.open(
    Endpoint(
      host: '127.0.0.1',
      port: 5432,
      database: 'acecourt',
      username: 'postgres',
      password: senha,
    ),
    settings: const ConnectionSettings(sslMode: SslMode.disable),
  );

  try {
    final resultado = await conexao.execute('SELECT COUNT(*) FROM quadras');
    print('Conectado ao acecourt. Quadras cadastradas: ${resultado.first[0]}');
  } finally {
    await conexao.close();
  }
}