import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner'; 
import { CitasContext } from './context/CitasContext'; 
import { useAuth } from './context/AuthContext';
import { FormularioCita } from './components/FormularioCita';
import { MisRegistros } from './components/MisRegistros'; 
import DetalleCita from './components/DetalleCita';
import { type CitaCompleta } from './lib/tipos';
import { Home } from './layout/Home';
import { Login } from './layout/Login';
import { RegistroPaciente } from './layout/RegistroPaciente';

export function AppContent() {
    const context = useContext(CitasContext);
    const { isLoggedIn, userData } = useAuth();
    
    if (!context) return null;
    const { citas, agregarCita, actualizarCita, citaEditando, setCitaEditando } = context;

    const citaEnEdicion = citaEditando as CitaCompleta | null;

    // Función auxiliar para normalizar texto (quita tildes y pasa a minúsculas)
    const normalizar = (texto: string) => 
        texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    /**
     * LÓGICA CORREGIDA: Ahora lee de 'medicos.horarios_medico'
     */
    const esDiaValido = (fechaSeleccionada: string, cita: CitaCompleta) => {
        // Obtenemos los horarios desde la relación
        const horarios = cita.medicos?.horarios_medico || [];
        if (horarios.length === 0) return false;
        
        const fechaObj = new Date(fechaSeleccionada.replace(/-/g, '/'));
        const diaNombre = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
        
        return horarios.some((h: any) => normalizar(h.dia) === normalizar(diaNombre));
    };

    /**
     * LÓGICA CORREGIDA: Filtra horarios disponibles por día de la semana
     */
    const getHorariosDisponibles = (cita: CitaCompleta) => {
        const horarios = cita.medicos?.horarios_medico || [];
        const fechaObj = new Date(cita.fecha.replace(/-/g, '/'));
        const diaNombre = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });

        return horarios
            .filter((h: any) => normalizar(h.dia) === normalizar(diaNombre))
            .map((h: any) => h.hora)
            .filter((hora: string) => 
                !citas.some(c => 
                    c.id_medico === cita.id_medico && 
                    c.fecha === cita.fecha && 
                    c.hora === hora && 
                    c.id_cita !== cita.id_cita && 
                    (c.estado === 'Programada' || c.estado === 'Completada')
                )
            );
    };

    const guardarEdicion = async () => {
        if (citaEnEdicion) {
            if (!citaEnEdicion.fecha || !citaEnEdicion.hora) {
                toast.error("Error", { description: "Seleccione fecha y hora válidas." });
                return;
            }
            await actualizarCita(citaEnEdicion);
            toast.success("Éxito", { description: "Cita actualizada correctamente." });
        }
    };

    return (
        <>
            <Toaster richColors position="top-right" />
            
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<RegistroPaciente />} />
                <Route path="/paciente/agendamiento" element={isLoggedIn && userData?.rol === 'paciente' ? <FormularioCita onGuardar={agregarCita} citas={citas} usuarioActual={userData} buscarPacienteExterno={async() => null} /> : <Navigate to="/login" />} />
                <Route path="/paciente/mis-registros" element={isLoggedIn && userData?.rol === 'paciente' ? <MisRegistros /> : <Navigate to="/login" />} />
                <Route path="/paciente/mis-registros/:id" element={isLoggedIn && userData?.rol === 'paciente' ? <DetalleCita /> : <Navigate to="/login" />} />
                <Route path="/medico/mis-registros" element={isLoggedIn && userData?.rol === 'medico' ? <MisRegistros /> : <Navigate to="/login" />} />
                <Route path="/medico/mis-registros/:id" element={isLoggedIn && userData?.rol === 'medico' ? <DetalleCita /> : <Navigate to="/login" />} />
            </Routes>
            
            {citaEnEdicion && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h3>Editar Cita</h3>

                        <div className="grupo-selector">
                            <label htmlFor="fechaCita">Fecha:</label>
                            <input 
                                id="fechaCita" 
                                type="date" 
                                value={citaEnEdicion.fecha} 
                                onChange={(e) => {
                                    if (esDiaValido(e.target.value, citaEnEdicion)) {
                                        setCitaEditando({...citaEnEdicion, fecha: e.target.value, hora: ''});
                                    } else {
                                        toast.error("Día no disponible", { description: "El médico no atiende este día." });
                                    }
                                }} 
                            />
                        </div>

                        <div className="grupo-selector">
                            <label htmlFor="horaCita">Hora:</label>
                            <select 
                                id="horaCita" 
                                value={citaEnEdicion.hora} 
                                onChange={(e) => setCitaEditando({...citaEnEdicion, hora: e.target.value})}
                                disabled={!citaEnEdicion.fecha || !esDiaValido(citaEnEdicion.fecha, citaEnEdicion)}
                            >
                                <option value="">Seleccione hora</option>
                                {getHorariosDisponibles(citaEnEdicion).map((h: string) => (
                                    <option key={h} value={h}>{h.substring(0, 5)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="acciones-modal">
                            <button type="button" onClick={guardarEdicion}>Guardar Cambios</button>
                            <button type="button" onClick={() => setCitaEditando(null)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}