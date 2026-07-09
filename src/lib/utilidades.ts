import { type Medico } from '../lib/tipos';

/**
 * UTILIDADES DE FILTRADO
 * Ahora reciben la lista completa de médicos (data) como primer argumento.
 */

// Obtener especialidades únicas
export const obtenerEspecialidades = (medicos: Medico[]): string[] => 
    Array.from(new Set(medicos.map(m => m.especialidad)));

// Obtener ciudades únicas basadas en una especialidad
export const obtenerCiudades = (medicos: Medico[], esp: string): string[] => 
    Array.from(new Set(medicos.filter(m => m.especialidad === esp).map(m => m.ciudad)));

// Obtener hospitales únicos basados en especialidad y ciudad
export const obtenerHospitales = (medicos: Medico[], esp: string, ciu: string): string[] => 
    Array.from(new Set(medicos.filter(m => m.especialidad === esp && m.ciudad === ciu).map(m => m.hospital)));

// Filtrar la lista de médicos completa
export const obtenerMedicosFiltrados = (medicos: Medico[], esp: string, ciu: string, hosp: string): Medico[] => 
    medicos.filter(m => m.especialidad === esp && m.ciudad === ciu && m.hospital === hosp);