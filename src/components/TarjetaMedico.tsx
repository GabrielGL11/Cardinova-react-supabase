import { type MedicoConUsuario } from '../lib/tipos'; 
import '../styles/FormularioCita.css';

/**
 * TarjetaMedico: Componente corregido para usar MedicoConUsuario.
 * Se asegura de que los nombres de las propiedades coincidan con la interfaz extendida.
 */
export const TarjetaMedico = ({ medico }: { medico?: MedicoConUsuario }) => {
    // Si no hay médico, no renderiza nada para evitar errores
    if (!medico) return null;

    return (
        <div className="tarjeta-medico">
            <h4 className="tarjeta-titulo">Médico Seleccionado:</h4>
            
            {/* Accedemos a 'usuarios' que ahora existe gracias a MedicoConUsuario */}
            <p><strong>Nombre:</strong> {medico.usuarios?.nombre || 'No disponible'} {medico.usuarios?.apellido || ''}</p>
            <p><strong>Especialidad:</strong> {medico.especialidad || 'No disponible'}</p>
            <p><strong>Hospital:</strong> {medico.hospital || 'No disponible'}</p>
        </div>
    );
};