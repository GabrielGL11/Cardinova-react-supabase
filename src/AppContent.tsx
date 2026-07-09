import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner'; 
import { CitasContext } from './context/CitasContext'; 
import { useAuth } from './context/AuthContext';
import { FormularioCita } from './components/FormularioCita';
import { MisRegistros } from './components/MisRegistros'; 
import DetalleCita from './components/DetalleCita';
import { type CitaCompleta, type PacienteConUsuario } from './lib/tipos';
import { Home } from './layout/Home';
import { Login } from './layout/Login';
import { RegistroPaciente } from './layout/RegistroPaciente';

export function AppContent() {
    const context = useContext(CitasContext);
    const { isLoggedIn, userData } = useAuth();
    
    if (!context) return null;
    const { citas, agregarCita, actualizarCita, citaEditando, setCitaEditando } = context;

    // Forzamos el tipado de la cita que se está editando para que incluya la relación 'medicos'
    const citaEnEdicion = citaEditando as CitaCompleta | null;

    const buscarPaciente = async (_cedula: string): Promise<PacienteConUsuario | null> => {
        return null;
    };

    const esDiaValido = (fechaSeleccionada: string, cita: CitaCompleta) => {
        if (!cita.medicos) return false;
        const [year, month, day] = fechaSeleccionada.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day);
        const dia = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
        const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        return cita.medicos.dias_disponibles?.some((d: string) => normalizar(d) === normalizar(dia)) || false;
    };

    const getHorariosDisponibles = (cita: CitaCompleta) => {
        if (!cita.medicos || !cita.medicos.horarios) return [];
        return cita.medicos.horarios.filter((h: string) => 
            !citas.some(c => 
                c.id_medico === cita.id_medico && 
                c.fecha === cita.fecha && 
                c.hora === h && 
                c.id_cita !== cita.id_cita &&
                (c.estado === 'Programada' || c.estado === 'Completada')
            )
        );
    };

    const guardarEdicion = () => {
        if (citaEnEdicion) {
            actualizarCita(citaEnEdicion);
            setCitaEditando(null);
            toast.success("Éxito", { description: "Cita actualizada." });
        }
    };

    return (
        <>
            <Toaster richColors position="top-right" />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<RegistroPaciente />} />
                <Route path="/paciente/agendamiento" element={isLoggedIn && userData?.rol === 'paciente' ? <FormularioCita onGuardar={agregarCita} citas={citas} usuarioActual={userData} buscarPacienteExterno={buscarPaciente} /> : <Navigate to="/login" />} />
                <Route path="/paciente/mis-registros" element={isLoggedIn && userData?.rol === 'paciente' ? <MisRegistros /> : <Navigate to="/login" />} />
                <Route path="/paciente/mis-registros/:id" element={isLoggedIn && userData?.rol === 'paciente' ? <DetalleCita /> : <Navigate to="/login" />} />
                <Route path="/medico/mis-registros" element={isLoggedIn && userData?.rol === 'medico' ? <MisRegistros /> : <Navigate to="/login" />} />
                <Route path="/medico/mis-registros/:id" element={isLoggedIn && userData?.rol === 'medico' ? <DetalleCita /> : <Navigate to="/login" />} />
            </Routes>
            
            {citaEnEdicion && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h3>Editar Cita</h3>
                        <p>El médico atiende: <strong>{citaEnEdicion.medicos?.dias_disponibles?.join(", ")}</strong></p>

                        <div className="grupo-selector">
                            <label htmlFor="fechaCita">Fecha:</label>
                            <input id="fechaCita" type="date" value={citaEnEdicion.fecha} onChange={(e) => {
                                const nuevaFecha = e.target.value;
                                if (esDiaValido(nuevaFecha, citaEnEdicion)) {
                                    setCitaEditando({...citaEnEdicion, fecha: nuevaFecha, hora: ''});
                                }
                            }} />
                        </div>

                        <div className="grupo-selector">
                            <label htmlFor="horaCita">Hora:</label>
                            <select id="horaCita" value={citaEnEdicion.hora} onChange={(e) => setCitaEditando({...citaEnEdicion, hora: e.target.value})}>
                                <option value="">Seleccione hora</option>
                                {getHorariosDisponibles(citaEnEdicion).map((h: string) => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>

                        <button type="button" onClick={guardarEdicion}>Guardar Cambios</button>
                    </div>
                </div>
            )}
        </>
    );
}