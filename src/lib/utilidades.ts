import { type MedicoConUsuario } from './tipos';

// Obtiene lista única de especialidades
export const obtenerEspecialidades = (medicos: MedicoConUsuario[]) => {
    if (!medicos || medicos.length === 0) return [];
    const eps = medicos.map(m => m.especialidad).filter(Boolean);
    return Array.from(new Set(eps));
};

// Obtiene ciudades según la especialidad seleccionada
export const obtenerCiudades = (medicos: MedicoConUsuario[], esp: string) => {
    if (!esp) return [];
    const ciu = medicos
        .filter(m => m.especialidad === esp)
        .map(m => m.ciudad)
        .filter(Boolean);
    return Array.from(new Set(ciu));
};

// Obtiene hospitales según especialidad y ciudad
export const obtenerHospitales = (medicos: MedicoConUsuario[], esp: string, ciu: string) => {
    if (!esp || !ciu) return [];
    const hosp = medicos
        .filter(m => m.especialidad === esp && m.ciudad === ciu)
        .map(m => m.hospital)
        .filter(Boolean);
    return Array.from(new Set(hosp));
};