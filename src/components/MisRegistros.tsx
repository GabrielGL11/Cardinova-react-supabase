import { useState, useContext } from 'react';
import { TablaCitas } from './TablaCitas';
import { CitasContext } from '../context/CitasContext'; 
import { useAuth } from '../context/AuthContext'; 
import '../styles/TablaCitas.css';
import { type CitaCompleta } from '../lib/tipos';

// -- COMPONENTE MISREGISTROS --
// Gestiona el historial de citas, filtrando por datos relacionales obtenidos desde Supabase.
export const MisRegistros = () => {
    const context = useContext(CitasContext);
    const { userData, userRole } = useAuth(); 

    if (!context) return null;
    
    // FORZAMOS EL TIPADO AQUÍ: Decimos explícitamente que 'citas' es un array de CitaCompleta
    const { citas, actualizarCita, setCitaEditando } = context as { 
        citas: CitaCompleta[], 
        actualizarCita: (c: CitaCompleta) => void, 
        setCitaEditando: (c: CitaCompleta | null) => void 
    };

    const [filtroEspecialidad, setFiltroEspecialidad] = useState("Todos");
    const [filtroDia, setFiltroDia] = useState("Todos");

    // Lógica de filtrado de acceso:
    const citasUsuario = citas.filter((cita: CitaCompleta) => {
        if (!userData) return false;

        if (userRole === 'medico') {
            // Ahora TypeScript reconocerá 'medicos' porque cita es CitaCompleta
            return cita.medicos?.id_usuario === userData.id;
        }
        
        if (userRole === 'paciente') {
            // Ahora TypeScript reconocerá 'pacientes' porque cita es CitaCompleta
            return cita.pacientes?.id_usuario === userData.id;
        }
        
        return false;
    });

    // Lógica de filtrado avanzado:
    const citasFiltradas = citasUsuario.filter((c: CitaCompleta) => {
        if (userRole === 'paciente') {
            return filtroEspecialidad === "Todos" || c.medicos?.especialidad === filtroEspecialidad;
        }
        if (userRole === 'medico' && filtroDia !== "Todos") {
            const fechaObj = new Date(c.fecha);
            const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            return dias[fechaObj.getUTCDay()] === filtroDia.toLowerCase();
        }
        return true;
    });

    // -- ORDENAMIENTO CRONOLÓGICO --
    const citasOrdenadas = [...citasFiltradas].sort((a, b) => {
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });

    // Extracción dinámica de especialidades únicas
    const especialidades = [
        "Todos", 
        ...Array.from(new Set(citasUsuario.map(c => c.medicos?.especialidad).filter(Boolean)))
    ];

    // Handler para actualizar el estado en Supabase
    const handleCambiarEstado = (id: string, nuevoEstado: 'Programada' | 'Cancelada' | 'Completada') => {
        const cita = citas.find(c => c.id_cita === id);
        if (cita) actualizarCita({ ...cita, estado: nuevoEstado });
    };

    return (
        <div className="contenedor-registros">
            <h2>Mis Registros</h2>
            
            <div className="filtro-container">
                {userRole === 'medico' ? (
                    <>
                        <label htmlFor="filtroDia">Filtrar por día: </label>
                        <select id="filtroDia" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)}>
                            <option value="Todos">Todos</option>
                            {['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'].map(dia => (
                                <option key={dia} value={dia}>{dia}</option>
                            ))}
                        </select>
                    </>
                ) : (
                    <>
                        <label htmlFor="filtroEspecialidad">Filtrar por Especialidad: </label>
                        <select id="filtroEspecialidad" value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}>
                            {especialidades.map(esp => (<option key={esp} value={esp}>{esp}</option>))}
                        </select>
                    </>
                )}
            </div>

            <TablaCitas 
                citas={citasOrdenadas} 
                onCambiarEstado={handleCambiarEstado}
                onEditar={(cita: CitaCompleta) => setCitaEditando(cita)}
                onVerDetalles={(cita: CitaCompleta) => console.log(cita)}            
            />
        </div>
    );
};