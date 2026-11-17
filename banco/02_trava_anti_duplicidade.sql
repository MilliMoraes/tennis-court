-- Requer public.horarios e public.reservas com a estrutura de 01_modelagem.sql.
BEGIN;

-- Mantém a carga inicial e a instalação do gatilho na mesma transação.
LOCK TABLE public.reservas IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE public.ocupacoes_horario (
    horario_id bigint PRIMARY KEY REFERENCES public.horarios(id),
    reserva_id bigint NOT NULL UNIQUE,
    FOREIGN KEY (reserva_id, horario_id)
        REFERENCES public.reservas (id, horario_id) ON DELETE CASCADE
        DEFERRABLE INITIALLY DEFERRED
);

-- Se já houver duas reservas que ocupam o mesmo horário, a migração falha.
INSERT INTO public.ocupacoes_horario (horario_id, reserva_id)
SELECT horario_id, id
FROM public.reservas
WHERE status IN ('pendente', 'confirmada');

CREATE FUNCTION public.sincronizar_ocupacao_horario()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.horario_id = NEW.horario_id
           AND OLD.status IN ('pendente', 'confirmada')
           AND NEW.status IN ('pendente', 'confirmada') THEN
            RETURN NEW;
        END IF;

        DELETE FROM public.ocupacoes_horario WHERE reserva_id = OLD.id;
    END IF;

    IF NEW.status IN ('pendente', 'confirmada') THEN
        INSERT INTO public.ocupacoes_horario (horario_id, reserva_id)
        VALUES (NEW.horario_id, NEW.id)
        ON CONFLICT (horario_id) DO NOTHING;

        IF NOT FOUND THEN
            RAISE EXCEPTION USING
                ERRCODE = '23P01',
                MESSAGE = 'Este horário já está ocupado por outra reserva.',
                CONSTRAINT = 'ocupacoes_horario_pkey';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER reservas_sincronizar_ocupacao
AFTER INSERT OR UPDATE OF status, horario_id ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.sincronizar_ocupacao_horario();

COMMIT;
