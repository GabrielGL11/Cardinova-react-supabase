import { type PacienteConUsuario } from '../../lib/tipos';
import { toast } from 'sonner';

interface PropsPasoDatos {
    paciente: PacienteConUsuario;
    setPaciente: React.Dispatch<React.SetStateAction<PacienteConUsuario>>;
    onBuscarPaciente: (cedula: string) => Promise<PacienteConUsuario | null>;
    onAtras: () => void;
    onGuardar: () => void;
}

/**
 * COMPONENTE PASO 3: PASODATOSPACIENTE
 * Gestión de datos del paciente utilizando la estructura relacional definida en tipos.ts.
 * La cédula se encuentra dentro de 'usuarios' y el teléfono en la raíz del 'paciente'.
 */
export const PasoDatosPaciente = ({ paciente, setPaciente, onBuscarPaciente, onAtras, onGuardar }: PropsPasoDatos) => {

    const handleActualizarCedula = (cedula: string) => {
        setPaciente(prev => ({ 
            ...prev, 
            usuarios: { ...prev.usuarios!, cedula } 
        }));
    };

    const buscarPaciente = async () => {
        const cedula = paciente.usuarios?.cedula;
        if (!cedula) return;

        const resultado = await onBuscarPaciente(cedula);
        
        if (resultado) {
            setPaciente(resultado);
            toast.success("Paciente encontrado");
        } else {
            setPaciente(prev => ({ 
                ...prev, 
                id_paciente: Date.now().toString(),
                // Inicializamos respetando los campos de tu interface PacienteConUsuario
                usuarios: { nombre: '', apellido: '', cedula: cedula },
                telefono: '' 
            }));
            toast.info("Nuevo paciente: complete los datos");
        }
    };

    return (
        <>
            <h3>Datos del Paciente</h3>
            <input 
                type="text" 
                placeholder="Cédula" 
                value={paciente.usuarios?.cedula || ''} 
                onChange={(e) => handleActualizarCedula(e.target.value)} 
                onBlur={buscarPaciente} 
                required
            />
            <input 
                type="text" 
                placeholder="Nombre" 
                value={paciente.usuarios?.nombre || ''} 
                onChange={(e) => setPaciente(prev => ({ ...prev, usuarios: { ...prev.usuarios!, nombre: e.target.value } }))} 
                required 
            />
            <input 
                type="text" 
                placeholder="Apellido" 
                value={paciente.usuarios?.apellido || ''} 
                onChange={(e) => setPaciente(prev => ({ ...prev, usuarios: { ...prev.usuarios!, apellido: e.target.value } }))} 
                required 
            />
            {/* El correo se obtiene del campo 'correo' de tu interface Usuario */}
            <input 
                type="email" 
                placeholder="Correo" 
                value={paciente.usuarios?.correo || ''} 
                onChange={(e) => setPaciente(prev => ({ ...prev, usuarios: { ...prev.usuarios!, correo: e.target.value } }))} 
                required
            />
            <input 
                type="tel" 
                placeholder="Teléfono" 
                value={paciente.telefono || ''} 
                onChange={(e) => setPaciente(prev => ({ ...prev, telefono: e.target.value }))} 
                required
            />
            
            <div className="grupo-botones">
                <button type="button" className="boton-volver" onClick={onAtras}>Atrás</button>
                <button type="button" className="boton-registro" onClick={onGuardar}>Finalizar Registro</button>
            </div>
        </>
    );
};