interface MedicoConDias {
    diasDisponibles: string[];
}

export const obtenerDiaSemana = (fecha: string): string => {
    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const [y, m, d] = fecha.split('-').map(Number);
    // Date.UTC + getUTCDay evita desfases de día por zona horaria
    return dias[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
};

export const esFechaValida = (fecha: string, medico: MedicoConDias): boolean => {
    const dia = obtenerDiaSemana(fecha);
    return medico.diasDisponibles.includes(dia);
};

export const validarCedula = (cedula: string): boolean => {
    return /^\d{10}$/.test(cedula); // Solo permite 10 dígitos numéricos
};