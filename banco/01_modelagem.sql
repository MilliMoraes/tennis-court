-- Execute em um banco vazio. Em seguida, execute 02_trava_anti_duplicidade.sql.
BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE public.proprietarios (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome text NOT NULL CHECK (btrim(nome) <> ''),
    identificador_autenticacao text NOT NULL UNIQUE
        CHECK (btrim(identificador_autenticacao) <> '')
);

CREATE TABLE public.quadras (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proprietario_id bigint NOT NULL REFERENCES public.proprietarios(id),
    nome text NOT NULL CHECK (btrim(nome) <> ''),
    piso text NOT NULL CHECK (btrim(piso) <> ''),
    coberta boolean,
    tem_iluminacao boolean NOT NULL DEFAULT FALSE,
    valor_hora_centavos integer NOT NULL CHECK (valor_hora_centavos >= 0),
    ativa boolean NOT NULL DEFAULT TRUE
);

CREATE TABLE public.horarios (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quadra_id bigint NOT NULL REFERENCES public.quadras(id),
    inicio timestamptz NOT NULL,
    fim timestamptz NOT NULL,
    disponibilizado boolean NOT NULL DEFAULT TRUE,
    CHECK (fim = inicio + interval '1 hour'),
    UNIQUE (quadra_id, inicio),
    CONSTRAINT horarios_mesma_quadra_sem_sobreposicao EXCLUDE USING gist (
        quadra_id WITH =,
        tstzrange(inicio, fim, '[)') WITH &&
    )
);

CREATE TABLE public.reservas (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    horario_id bigint NOT NULL REFERENCES public.horarios(id),
    nome_cliente text NOT NULL CHECK (btrim(nome_cliente) <> ''),
    telefone_normalizado text NOT NULL CHECK (btrim(telefone_normalizado) <> ''),
    status text NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'confirmada', 'concluida', 'expirada', 'cancelada')),
    criada_em timestamptz NOT NULL DEFAULT now(),
    expira_em timestamptz,
    hash_codigo_acesso text NOT NULL CHECK (btrim(hash_codigo_acesso) <> ''),
    CHECK (expira_em IS NULL OR expira_em > criada_em),
    CHECK (status <> 'pendente' OR expira_em IS NOT NULL),
    UNIQUE (id, horario_id)
);

CREATE INDEX reservas_por_horario ON public.reservas (horario_id);

CREATE TABLE public.controle_diario (
    telefone_normalizado text NOT NULL,
    data_local date NOT NULL,
    quantidade_computada integer NOT NULL DEFAULT 0 CHECK (quantidade_computada >= 0),
    PRIMARY KEY (telefone_normalizado, data_local)
);

CREATE TABLE public.pagamentos (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reserva_id bigint NOT NULL REFERENCES public.reservas(id),
    metodo text NOT NULL CHECK (metodo IN ('pix', 'cartao_credito', 'cartao_debito')),
    valor_centavos integer NOT NULL CHECK (valor_centavos >= 0),
    status text NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'aprovado', 'recusado', 'expirado')),
    criado_em timestamptz NOT NULL DEFAULT now(),
    confirmado_em timestamptz,
    referencia_externa text UNIQUE
);

CREATE INDEX pagamentos_por_reserva ON public.pagamentos (reserva_id);

CREATE TABLE public.reembolsos (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pagamento_id bigint NOT NULL UNIQUE REFERENCES public.pagamentos(id),
    valor_centavos integer NOT NULL CHECK (valor_centavos > 0),
    status text NOT NULL DEFAULT 'solicitado'
        CHECK (status IN ('solicitado', 'efetivado', 'falhou')),
    solicitado_em timestamptz NOT NULL DEFAULT now(),
    efetivado_em timestamptz,
    referencia_externa text UNIQUE
);

CREATE TABLE public.eventos_reserva (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reserva_id bigint NOT NULL REFERENCES public.reservas(id),
    tipo text NOT NULL CHECK (btrim(tipo) <> ''),
    ocorrido_em timestamptz NOT NULL DEFAULT now(),
    origem text NOT NULL CHECK (origem IN ('cliente', 'proprietario', 'sistema', 'provedor'))
);

CREATE INDEX eventos_por_reserva ON public.eventos_reserva (reserva_id, ocorrido_em);

CREATE TABLE public.avisos_cancelamento (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reserva_id bigint NOT NULL UNIQUE REFERENCES public.reservas(id),
    canal text NOT NULL CHECK (btrim(canal) <> ''),
    status_envio text NOT NULL DEFAULT 'pendente'
        CHECK (status_envio IN ('pendente', 'enviado', 'falhou')),
    criado_em timestamptz NOT NULL DEFAULT now(),
    enviado_em timestamptz
);

COMMIT;
