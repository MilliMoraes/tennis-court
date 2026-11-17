import 'dart:convert';
import 'dart:io';

import 'package:postgres/postgres.dart';

Future<void> main() async {
  final ambiente = Platform.environment;
  final senha = ambiente['ACECOURT_DB_SENHA'];
  if (senha == null || senha.isEmpty) {
    stderr.writeln('Informe a senha do PostgreSQL no terminal.');
    exitCode = 1;
    return;
  }

  final proprietarioId = int.tryParse(
    ambiente['ACECOURT_PROPRIETARIO_ID'] ?? '',
  );

  final conexao = await Connection.open(
    Endpoint(
      host: '127.0.0.1',
      port: 5432,
      database: ambiente['ACECOURT_DB_NOME'] ?? 'acecourt',
      username: 'postgres',
      password: senha,
    ),
    settings: const ConnectionSettings(sslMode: SslMode.disable),
  );

  try {
    final servidor = await HttpServer.bind(InternetAddress.loopbackIPv4, 8080);
    print('API rodando em http://127.0.0.1:8080/quadras');

    await for (final requisicao in servidor) {
      await responder(requisicao, conexao, proprietarioId);
    }
  } finally {
    await conexao.close();
  }
}

Future<void> responder(
  HttpRequest requisicao,
  Connection conexao,
  int? proprietarioId,
) async {
  final resposta = requisicao.response;
  resposta.headers.contentType = ContentType.json;

  try {
    if (requisicao.uri.path != '/quadras') {
      erroHttp(resposta, HttpStatus.notFound, 'Rota não encontrada.');
      return;
    }

    switch (requisicao.method) {
      case 'GET':
        resposta.headers.set('Access-Control-Allow-Origin', '*');
        final resultado = await conexao.execute('''
          SELECT id, nome, piso, coberta, tem_iluminacao, valor_hora_centavos
          FROM quadras
          WHERE ativa = TRUE
          ORDER BY nome, id
        ''');
        resposta.write(jsonEncode(resultado.map(quadraJson).toList()));
        return;

      case 'POST':
        if (proprietarioId == null || proprietarioId <= 0) {
          erroHttp(
            resposta,
            HttpStatus.forbidden,
            'Configure ACECOURT_PROPRIETARIO_ID para o cadastro local.',
          );
          return;
        }
        if (requisicao.headers.contentType?.mimeType != 'application/json') {
          erroHttp(resposta, HttpStatus.unsupportedMediaType, 'Envie um JSON.');
          return;
        }

        final quadra = await cadastrarQuadra(
          requisicao,
          conexao,
          proprietarioId,
        );
        resposta.statusCode = HttpStatus.created;
        resposta.write(jsonEncode(quadra));
        return;

      default:
        resposta.headers.set('Allow', 'GET, POST');
        erroHttp(
          resposta,
          HttpStatus.methodNotAllowed,
          'Método não permitido.',
        );
    }
  } on FormatException catch (erro) {
    erroHttp(resposta, HttpStatus.badRequest, erro.message);
  } on ServerException catch (erro) {
    switch (erro.code) {
      case '23503':
        erroHttp(
          resposta,
          HttpStatus.badRequest,
          'Proprietário não cadastrado.',
        );
      case '23514':
        erroHttp(
          resposta,
          HttpStatus.badRequest,
          'Os dados da quadra não atendem às regras do banco.',
        );
      case '23505':
        erroHttp(
          resposta,
          HttpStatus.conflict,
          'O cadastro entrou em conflito.',
        );
      default:
        stderr.writeln(erro);
        erroHttp(
          resposta,
          HttpStatus.internalServerError,
          'Não foi possível acessar os dados das quadras.',
        );
    }
  } catch (erro) {
    stderr.writeln(erro);
    erroHttp(
      resposta,
      HttpStatus.internalServerError,
      'Não foi possível acessar os dados das quadras.',
    );
  } finally {
    await resposta.close();
  }
}

Future<Map<String, Object?>> cadastrarQuadra(
  HttpRequest requisicao,
  Connection conexao,
  int proprietarioId,
) async {
  final texto = await utf8.decoder.bind(requisicao).join();
  final Object? dados;
  try {
    dados = jsonDecode(texto);
  } on FormatException {
    throw const FormatException('O corpo da requisição contém JSON inválido.');
  }

  if (dados is! Map<String, dynamic>) {
    throw const FormatException('Envie os campos da quadra em um objeto JSON.');
  }

  final nome = dados['nome'];
  final piso = dados['piso'];
  final coberta = dados['coberta'];
  final temIluminacao = dados['temIluminacao'] ?? false;
  final valorHoraCentavos = dados['valorHoraCentavos'];

  if (nome is! String ||
      nome.trim().isEmpty ||
      piso is! String ||
      piso.trim().isEmpty) {
    throw const FormatException('Preencha nome e piso.');
  }
  if ((coberta != null && coberta is! bool) || temIluminacao is! bool) {
    throw const FormatException('Cobertura e iluminação devem ser booleanas.');
  }
  if (valorHoraCentavos is! int ||
      valorHoraCentavos < 0 ||
      valorHoraCentavos > 2147483647) {
    throw const FormatException('Informe um valor válido em centavos.');
  }

  final resultado = await conexao.execute(
    Sql.named('''
      INSERT INTO quadras (
        proprietario_id, nome, piso, coberta,
        tem_iluminacao, valor_hora_centavos, ativa
      )
      VALUES (
        CAST(@proprietarioId AS bigint), @nome, @piso, CAST(@coberta AS boolean),
        @temIluminacao, CAST(@valorHoraCentavos AS integer), TRUE
      )
      RETURNING id, nome, piso, coberta, tem_iluminacao, valor_hora_centavos
    '''),
    parameters: {
      'proprietarioId': proprietarioId,
      'nome': nome.trim(),
      'piso': piso.trim(),
      'coberta': coberta,
      'temIluminacao': temIluminacao,
      'valorHoraCentavos': valorHoraCentavos,
    },
  );

  return quadraJson(resultado.single);
}

Map<String, Object?> quadraJson(ResultRow linha) {
  final dados = linha.toColumnMap();
  return {
    'id': dados['id'].toString(),
    'nome': dados['nome'],
    'piso': dados['piso'],
    'coberta': dados['coberta'],
    'temIluminacao': dados['tem_iluminacao'],
    'valorHoraCentavos': dados['valor_hora_centavos'],
  };
}

void erroHttp(HttpResponse resposta, int status, String mensagem) {
  resposta.statusCode = status;
  resposta.write(jsonEncode({'erro': mensagem}));
}
