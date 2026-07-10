import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth, type UserData } from '../context/AuthContext';
import { type MedicoConUsuario, type Cita, type PacienteConUsuario } from '../lib/tipos';
import '../styles/FormularioCita.css';

import { PasoFiltroMedico } from './FormularioCita/PasoFiltroMedico';
import { PasoDetallesCita } from './FormularioCita/PasoDetallesCita';
import { PasoDatosPaciente } from './FormularioCita/PasoDatosPaciente';

interface PropsFormulario {
    onGuardar: (cita: Cita) => void;
    citas: Cita[];
    usuarioActual: UserData | null;
    buscarPacienteExterno: (cedula: string) => Promise<PacienteConUsuario | null>;
}

export const FormularioCita = ({ onGuardar, buscarPacienteExterno }: PropsFormulario) => {
    const navigate = useNavigate();
    const { userRole } = useAuth();
    
    const [paso, setPaso] = useState(1);
    const [medicos, setMedicos] = useState<MedicoConUsuario[]>([]);
    const [medico, setMedico] = useState<MedicoConUsuario | null>(null);
    const [horarios, setHorarios] = useState<any[]>([]);
    
    const [esp, setEsp] = useState('');
    const [ciu, setCiu] = useState('');
    const [hosp, setHosp] = useState('');
    
    const [motivosSeleccionados, setMotivosSeleccionados] = useState<string[]>([]);
    const [esOtrosActivo, setEsOtrosActivo] = useState(false);
    const [motivoOtros, setMotivoOtros] = useState('');
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [tipoAtencion, setTipoAtencion] = useState<'Presencial' | 'Virtual'>('Presencial');
    
    const [paciente, setPaciente] = useState<PacienteConUsuario>({
        id_paciente: '', id_usuario: '', telefono: '',
        usuarios: { nombre: '', apellido: '', cedula: '', correo: '' }
    });

    useEffect(() => {
        const cargarMedicos = async () => {
            const { data } = await supabase.from('medicos').select('*, usuarios(nombre, apellido, correo)');
            setMedicos(data || []);
        };
        cargarMedicos();
    }, []);

    useEffect(() => {
        if (medico) {
            supabase.from('horarios_medico').select('*').eq('id_medico', medico.id_medico).then(({ data }) => setHorarios(data || []));
        }
    }, [medico]);

    const normalizarTexto = (texto: string) => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const obtenerNombreDia = (fechaStr: string) => {
        const [year, month, day] = fechaStr.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('es-ES', { weekday: 'long' });
    };

    const esDiaValido = (fechaSeleccionada: string) => {
        if (!fechaSeleccionada) return false;
        const diaNombre = normalizarTexto(obtenerNombreDia(fechaSeleccionada));
        return horarios.some(h => normalizarTexto(h.dia) === diaNombre);
    };

    const obtenerHorasParaDia = (fechaSeleccionada: string) => {
        if (!fechaSeleccionada) return [];
        const diaNombre = normalizarTexto(obtenerNombreDia(fechaSeleccionada));
        return horarios.filter(h => normalizarTexto(h.dia) === diaNombre).map(h => h.hora.substring(0, 5));
    };

    const handleGuardar = async () => {
    try {
        // 1. Gestionar el Usuario (Upsert por cédula)
        const { data: usuario, error: errorUsuario } = await supabase
            .from('usuarios')
            .upsert({
                nombre: paciente.usuarios?.nombre,
                apellido: paciente.usuarios?.apellido,
                cedula: paciente.usuarios?.cedula,
                correo: paciente.usuarios?.correo,
                contrasena: 'Temporal123',
                rol: 'paciente'
            }, { onConflict: 'cedula' })
            .select('id_usuario')
            .single();

        if (errorUsuario) throw errorUsuario;
        const userId = usuario.id_usuario;

        // 2. Gestionar el Paciente (Buscar o crear)
        let { data: pacExistente } = await supabase
            .from('pacientes')
            .select('id_paciente')
            .eq('id_usuario', userId)
            .maybeSingle();

        let idPacienteFinal = pacExistente?.id_paciente;

        if (!idPacienteFinal) {
            const { data: newPac, error: errP } = await supabase
                .from('pacientes')
                .insert([{ 
                    id_usuario: userId, 
                    telefono: paciente.telefono 
                }])
                .select('id_paciente')
                .single();
            
            if (errP) throw errP;
            idPacienteFinal = newPac.id_paciente;
        }

        // 3. Guardar la cita
        const nuevaCita: Cita = { 
            id_medico: medico!.id_medico, 
            id_paciente: idPacienteFinal, 
            fecha, 
            hora, 
            motivo: esOtrosActivo ? `Otros: ${motivoOtros}` : motivosSeleccionados.join(", "), 
            tipo_atencion: tipoAtencion, 
            estado: 'Programada'
        };
        
        await onGuardar(nuevaCita);
        toast.success("Cita registrada correctamente");
        navigate(userRole === 'medico' ? '/medico/mis-registros' : '/paciente/mis-registros');
        
    } catch (error: any) {
        console.error("Error en el proceso:", error);
        toast.error("Error: " + (error.message || "No se pudo completar el registro"));
    }
};
    return (
        <div className="contenedor-formulario">
            <h1>Agendamiento Médico</h1>
            {paso === 1 && <PasoFiltroMedico esp={esp} setEsp={setEsp} ciu={ciu} setCiu={setCiu} hosp={hosp} setHosp={setHosp} medico={medico} setMedico={setMedico} medicosDisponibles={medicos} onContinuar={() => setPaso(2)} />}
            
            {paso === 2 && (
                <PasoDetallesCita 
                    medico={medico} fecha={fecha} setFecha={setFecha} hora={hora} setHora={setHora} 
                    motivosSeleccionados={motivosSeleccionados} setMotivosSeleccionados={setMotivosSeleccionados} 
                    esOtrosActivo={esOtrosActivo} setEsOtrosActivo={setEsOtrosActivo} motivoOtros={motivoOtros} 
                    setMotivoOtros={setMotivoOtros} tipoAtencion={tipoAtencion} setTipoAtencion={setTipoAtencion}
                    horariosDisponibles={horarios} horasFiltradas={fecha ? obtenerHorasParaDia(fecha) : []}
                    esDiaValido={esDiaValido} onAtras={() => setPaso(1)} onContinuar={() => setPaso(3)} 
                />
            )}
            
            {paso === 3 && (
                <PasoDatosPaciente 
                    paciente={paciente} setPaciente={setPaciente} onBuscarPaciente={buscarPacienteExterno} 
                    onAtras={() => setPaso(2)} onGuardar={handleGuardar} 
                />
            )}
        </div>
    );
};