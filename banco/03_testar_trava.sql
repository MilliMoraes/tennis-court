-- Execute após 01 e 02. Os registros de teste são revertidos no final.
BEGIN;

DO $$
DECLARE
    dono bigint;
    quadra_a bigint;
    quadra_b bigint;
    horario_a bigint;
    horario_seguinte bigint;
    horario_b bigint;
    primeira_reserva bigint;
    segunda_reserva bigint;
    inicio_base timestamptz := date_trunc('hour', now()) + interval '2 days';
BEGIN
    INSERT INTO public.proprietarios (nome, identificador_autenticacao)
    VALUES ('Proprietário de teste', 'teste-trava-' || txid_current())
    RETURNING id INTO dono;

    INSERT INTO public.quadras (proprietario_id, nome, piso, valor_hora_centavos)
    VALUES (dono, 'Quadra A de teste', 'Saibro', 6000) RETURNING id INTO quadra_a;
    INSERT INTO public.quadras (proprietario_id, nome, piso, valor_hora_centavos)
    VALUES (dono, 'Quadra B de teste', 'Saibro', 6000) RETURNING id INTO quadra_b;

    INSERT INTO public.horarios (quadra_id, inicio, fim)
    VALUES (quadra_a, inicio_base, inicio_base + interval '1 hour')
    RETURNING id INTO horario_a;

    BEGIN
        INSERT INTO public.horarios (quadra_id, inicio, fim)
        VALUES (quadra_a, inicio_base + interval '30 minutes',
                inicio_base + interval '90 minutes');
        RAISE EXCEPTION 'Falha: a grade aceitou dois horários sobrepostos.';
    EXCEPTION WHEN exclusion_violation THEN
        RAISE NOTICE 'OK: horários sobrepostos da mesma quadra foram rejeitados.';
    END;

    INSERT INTO public.horarios (quadra_id, inicio, fim)
    VALUES (quadra_a, inicio_base + interval '1 hour', inicio_base + interval '2 hours')
    RETURNING id INTO horario_seguinte;

    INSERT INTO public.horarios (quadra_id, inicio, fim)
    VALUES (quadra_b, inicio_base, inicio_base + interval '1 hour')
    RETURNING id INTO horario_b;

    INSERT INTO public.reservas (
        horario_id, nome_cliente, telefone_normalizado, expira_em, hash_codigo_acesso
    )
    VALUES (horario_a, 'Cliente A', '31900000001', now() + interval '5 minutes', 'teste-a')
    RETURNING id INTO primeira_reserva;

    BEGIN
        INSERT INTO public.reservas (
            horario_id, nome_cliente, telefone_normalizado, status, hash_codigo_acesso
        )
        VALUES (horario_a, 'Cliente B', '31900000002', 'confirmada', 'teste-b');
        RAISE EXCEPTION 'Falha: duas reservas ocuparam o mesmo horário.';
    EXCEPTION WHEN exclusion_violation THEN
        RAISE NOTICE 'OK: uma reserva pendente bloqueia nova reserva no mesmo horário.';
    END;

    UPDATE public.reservas SET status = 'confirmada' WHERE id = primeira_reserva;
    INSERT INTO public.reservas (
        horario_id, nome_cliente, telefone_normalizado, status, hash_codigo_acesso
    )
    VALUES (horario_seguinte, 'Cliente C', '31900000003', 'confirmada', 'teste-c'),
           (horario_b, 'Cliente D', '31900000004', 'confirmada', 'teste-d');

    RAISE NOTICE 'OK: horários consecutivos e quadras diferentes foram aceitos.';

    UPDATE public.reservas SET status = 'cancelada' WHERE id = primeira_reserva;
    INSERT INTO public.reservas (
        horario_id, nome_cliente, telefone_normalizado, expira_em, hash_codigo_acesso
    )
    VALUES (horario_a, 'Cliente B', '31900000002', now() + interval '5 minutes', 'teste-b')
    RETURNING id INTO segunda_reserva;

    BEGIN
        UPDATE public.reservas SET status = 'confirmada' WHERE id = primeira_reserva;
        RAISE EXCEPTION 'Falha: a reativação criou uma ocupação duplicada.';
    EXCEPTION WHEN exclusion_violation THEN
        RAISE NOTICE 'OK: cancelamento libera o horário e reativação em conflito falha.';
    END;

    UPDATE public.reservas SET status = 'expirada' WHERE id = segunda_reserva;
    INSERT INTO public.reservas (
        horario_id, nome_cliente, telefone_normalizado, status, hash_codigo_acesso
    )
    VALUES (horario_a, 'Cliente E', '31900000005', 'confirmada', 'teste-e');

    RAISE NOTICE 'OK: expiração deixa o horário disponível para outra reserva.';
END;
$$;

-- Valida também as chaves estrangeiras que seriam verificadas no COMMIT.
SET CONSTRAINTS ALL IMMEDIATE;
ROLLBACK;
