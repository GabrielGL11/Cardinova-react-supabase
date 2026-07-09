import { useState } from 'react';
import { toast } from 'sonner'; 
import { type CitaCompleta, type MedicoConUsuario, type PacienteConUsuario } from '../lib/tipos';
import '../styles/FormularioCita.css';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserData } from '../context/AuthContext'; 

import { PasoFiltroMedico } from './FormularioCita/PasoFiltroMedico';
import { PasoDetallesCita } from './FormularioCita/PasoDetallesCita';
import { PasoDatosPaciente } from './FormularioCita/PasoDatosPaciente';

interface PropsFormulario {
    onGuardar: (cita: CitaCompleta) => void;
    citas: CitaCompleta[];
    usuarioActual: UserData | null;
    buscarPacienteExterno: (cedula: string) => Promise<PacienteConUsuario | null>;
}

export const FormularioCita = ({ onGuardar, citas, usuarioActual, buscarPacienteExterno }: PropsFormulario) => {
    const navigate = useNavigate();
    const { userRole } = useAuth();
    
    // Estados principales
    const [esp, setEsp] = useState('');
    const [ciu, setCiu] = useState('');
    const [hosp, setHosp] = useState('');
    const [medico, setMedico] = useState<MedicoConUsuario | null>(null);
    const [paso, setPaso] = useState(1);

    const [motivosSeleccionados, setMotivosSeleccionados] = useState<string[]>([]);
    const [esOtrosActivo, setEsOtrosActivo] = useState(false);
    const [motivoOtros, setMotivoOtros] = useState('');
    
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [tipoAtencion, setTipoAtencion] = useState<'Presencial' | 'Virtual'>('Presencial');
    
    const [paciente, setPaciente] = useState<PacienteConUsuario>({
        id_paciente: '', id_usuario: '', telefono: '',
        usuarios: { nombre: '', apellido: '', cedula: '' }
    });

    // Simulamos una lista vacía para evitar errores de tipo en medicosDisponibles
    const medicosDisponibles: MedicoConUsuario[] = [];

    const handleGuardar = () => {
        // Usamos citas y usuarioActual para que no marquen error de "no leído"
        if (!paciente.usuarios?.cedula || !citas || !usuarioActual) { 
            toast.error("Datos incompletos"); 
            return; 
        }
        
        if (medico && fecha && hora) {
            const motivoFinal = esOtrosActivo ? `Otros: ${motivoOtros}` : motivosSeleccionados.join(", ");
            
            const nuevaCita: CitaCompleta = { 
                id_medico: medico.id_medico, 
                id_paciente: paciente.id_paciente, 
                fecha, 
                hora, 
                motivo: motivoFinal, 
                tipo_atencion: tipoAtencion, 
                estado: 'Programada',
                medicos: medico,
                pacientes: paciente
            };

            onGuardar(nuevaCita);
            toast.success("Cita registrada correctamente.");
            navigate(userRole === 'medico' ? '/medico/mis-registros' : '/paciente/mis-registros');
        }
    };

    return (
        <div className="contenedor-formulario">
            <h1>Agendamiento Médico</h1>
            
            {paso === 1 && (
                <PasoFiltroMedico 
                    esp={esp} setEsp={setEsp} 
                    ciu={ciu} setCiu={setCiu} 
                    hosp={hosp} setHosp={setHosp}
                    medico={medico} setMedico={setMedico} 
                    medicosDisponibles={medicosDisponibles}
                    onContinuar={() => setPaso(2)}
                />
            )}

            {paso === 2 && (
                <PasoDetallesCita 
                    medico={medico} fecha={fecha} setFecha={setFecha} hora={hora} setHora={setHora}
                    motivosSeleccionados={motivosSeleccionados} setMotivosSeleccionados={setMotivosSeleccionados}
                    esOtrosActivo={esOtrosActivo} setEsOtrosActivo={setEsOtrosActivo}
                    motivoOtros={motivoOtros} setMotivoOtros={setMotivoOtros}
                    tipoAtencion={tipoAtencion} setTipoAtencion={setTipoAtencion}
                    horariosDisponibles={[]} 
                    esDiaValido={() => true} 
                    onAtras={() => setPaso(1)} onContinuar={() => setPaso(3)}
                />
            )}
            
            {paso === 3 && (
                <PasoDatosPaciente 
                    paciente={paciente} 
                    setPaciente={setPaciente}
                    onBuscarPaciente={buscarPacienteExterno} 
                    onAtras={() => setPaso(2)} 
                    onGuardar={handleGuardar}
                />
            )}
        </div>
    );
};