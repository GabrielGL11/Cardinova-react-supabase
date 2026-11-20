-- 1) Borrar citas duplicadas existentes (deja la más antigua de cada grupo)
DELETE FROM citas a
USING citas b
WHERE a.id_medico = b.id_medico
  AND a.fecha = b.fecha
  AND a.hora = b.hora
  AND a.estado <> 'Cancelada' AND b.estado <> 'Cancelada'
  AND a.ctid > b.ctid;

-- 2) Impedir duplicados a futuro (mismo médico, fecha y hora, salvo canceladas)
CREATE UNIQUE INDEX IF NOT EXISTS citas_unica_medico_fecha_hora
ON citas (id_medico, fecha, hora)
WHERE estado <> 'Cancelada';
