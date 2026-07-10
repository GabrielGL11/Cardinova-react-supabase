import { type PacienteConUsuario } from '../../lib/tipos';
import { toast } from 'sonner';

interface PropsPasoDatos {
    paciente: PacienteConUsuario;
    setPaciente: React.Dispatch<React.SetStateAction<PacienteConUsuario>>;
    onBuscarPaciente: (cedula: string) => Promise<PacienteConUsuario | null>;
    onAtras: () => void;
    onGuardar: () => void;
}

export const PasoDatosPaciente = ({ paciente, setPaciente, onBuscarPaciente, onAtras, onGuardar }: PropsPasoDatos) => {

    const buscarPaciente = async () => {
        const cedula = paciente.usuarios?.cedula;
        if (!cedula || cedula.length < 5) return; 

        const resultado = await onBuscarPaciente(cedula);
        
        if (resultado) {
            setPaciente(resultado);
            toast.success("Paciente encontrado: se utilizarán sus datos.");
        } else {
            // Si no existe, no limpiamos todo agresivamente, 
            // solo dejamos que el usuario pueda escribir los datos.
            toast.info("Paciente nuevo: por favor complete los datos.");
        }
    };

    const handleFinalizar = () => {
        // CORRECCIÓN AQUÍ: 
        // Eliminamos la validación if (!paciente.id_usuario)
        // Ahora permitimos guardar si los datos básicos están presentes,
        // sin importar si es un usuario viejo (con ID) o nuevo (sin ID).
        
        if (paciente.usuarios?.nombre && paciente.usuarios?.cedula && paciente.usuarios?.correo) {
            onGuardar();
        } else {
            toast.warning("Complete los campos obligatorios (Nombre, Cédula, Correo)");
        }
    };

    return (
        <div className="paso-datos-container">
            <h3>Datos del Paciente</h3>
            
            <input type="text" placeholder="Cédula" value={paciente.usuarios?.cedula || ''} onChange={(e) => setPaciente(prev => ({ ...prev, usuarios: { ...prev.usuarios!, cedula: e.target.value } }))} onBlur={buscarPaciente} required />
            <input type="text" placeholder="Nombre" value={paciente.usuarios?.nombre || ''} onChange={(e) => setPaciente(prev => ({ ...prev, usuarios: { ...prev.usuarios!, nombre: e.target.value } }))} required />
            <input type="text" placeholder="Apellido" value={paciente.usuarios?.apellido || ''} onChange={(e) => setPaciente(prev => ({ ...prev, usuarios: { ...prev.usuarios!, apellido: e.target.value } }))} required />
            <input type="email" placeholder="Correo" value={paciente.usuarios?.correo || ''} onChange={(e) => setPaciente(prev => ({ ...prev, usuarios: { ...prev.usuarios!, correo: e.target.value } }))} required />
            <input type="tel" placeholder="Teléfono" value={paciente.telefono || ''} onChange={(e) => setPaciente(prev => ({ ...prev, telefono: e.target.value }))} required />
            
            <div className="grupo-botones">
                <button type="button" onClick={onAtras}>Atrás</button>
                <button type="button" onClick={handleFinalizar}>Finalizar Registro</button>
            </div>
        </div>
    );
};