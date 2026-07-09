// -- INTERFACES BÁSICAS (Correspondientes a tus tablas SQL) --

export interface Usuario {
    id_usuario: string;
    nombre: string;
    apellido: string;
    cedula: string;
    correo: string;
    contrasena: string;
    rol: 'medico' | 'paciente' | 'admin';
}

export interface Medico {
    id_medico: string;
    id_usuario: string;
    especialidad: string;
    ciudad: string;
    hospital: string;
}

export interface Paciente {
    id_paciente: string;
    id_usuario: string;
    telefono: string;
}

export interface HorarioMedico {
    id_horario: number;
    id_medico: string;
    dia: string;
    hora: string;
}

export interface Cita {
    id_cita?: string;
    id_medico: string;
    id_paciente: string;
    fecha: string;
    hora: string;
    motivo: string;
    tipo_atencion: 'Presencial' | 'Virtual';
    estado?: 'Programada' | 'Cancelada' | 'Completada';
}

// -- INTERFACES EXTENDIDAS PARA JOIN (Soporte para Supabase) --
// Estas permiten acceder a los datos relacionados de la tabla 'usuarios'
// cuando haces consultas con: ?select=*,usuarios(nombre,apellido)

export interface MedicoConUsuario extends Medico {
    usuarios?: {
        nombre: string;
        apellido: string;
        correo?: string;
    };
    dias_disponibles?: string[];
    horarios?: string[];
}

export interface PacienteConUsuario extends Paciente {
    usuarios?: {
        nombre: string;
        apellido: string;
        cedula: string;
        correo?: string;
    };
}

export interface CitaCompleta extends Cita {
    medicos?: MedicoConUsuario;
    pacientes?: PacienteConUsuario;
}

// -- OTROS --

export interface FiltrosBusqueda {
    especialidad: string;
    ciudad: string;
    hospital: string;
    id_medico: string;
}