interface MedicoConDias {
    diasDisponibles: string[];
}

const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

export const normalizarDia = (dia: string): string =>
    dia.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

// HU-02: identifica el día de la semana de una fecha 'YYYY-MM-DD'.
// Date.UTC + getUTCDay evita desfases de día por zona horaria.
export const obtenerDiaSemana = (fecha: string): string => {
    const [y, m, d] = fecha.split('-').map(Number);
    return DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
};

// HU-02: acepta solo días disponibles del médico; los domingos siempre se rechazan.
export const esFechaValida = (fecha: string, medico: MedicoConDias): boolean => {
    if (!fecha) return false;
    const dia = obtenerDiaSemana(fecha);
    if (dia === "domingo") return false;
    return medico.diasDisponibles.map(normalizarDia).includes(dia);
};

// HU-01: exactamente 10 dígitos numéricos.
export const validarCedula = (cedula: string): boolean => {
    return /^\d{10}$/.test(cedula);
};

// Evita citas duplicadas: mismo médico, fecha y hora (ignora canceladas).
interface CitaClave {
    id_medico: string;
    fecha: string;
    hora: string;
    estado?: string;
}

const normalizarHora = (hora: string): string => hora.substring(0, 5);

export const esCitaDuplicada = (nueva: CitaClave, existentes: CitaClave[]): boolean =>
    existentes.some(c =>
        c.estado !== 'Cancelada' &&
        c.id_medico === nueva.id_medico &&
        c.fecha === nueva.fecha &&
        normalizarHora(c.hora) === normalizarHora(nueva.hora)
    );
