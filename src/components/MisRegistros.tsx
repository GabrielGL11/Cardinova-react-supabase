import { useState, useContext, useMemo } from 'react';
import { TablaCitas } from './TablaCitas';
import { CitasContext } from '../context/CitasContext'; 
import { useAuth } from '../context/AuthContext'; 
import '../styles/TablaCitas.css';
import { type CitaCompleta } from '../lib/tipos';

export const MisRegistros = () => {
    const context = useContext(CitasContext);
    const { userData, userRole } = useAuth(); 

    if (!context) return null;
    
    const { citas, actualizarCita, setCitaEditando } = context;

    const [filtroEspecialidad, setFiltroEspecialidad] = useState("Todos");
    const [filtroDia, setFiltroDia] = useState("Todos");

    // 1. Filtrado de acceso por usuario
    const citasUsuario = useMemo(() => {
        if (!citas || !userData?.id) return [];
        return citas.filter((cita: CitaCompleta) => {
            if (userRole === 'medico') return String(cita.medicos?.id_usuario) === String(userData.id);
            if (userRole === 'paciente') return String(cita.pacientes?.id_usuario) === String(userData.id);
            return false;
        });
    }, [citas, userData, userRole]);

    // 2. Cálculo dinámico de días donde el médico tiene citas
    const diasDisponibles = useMemo(() => {
        if (userRole !== 'medico') return [];
        const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        
        // Mapeamos las citas del usuario para obtener los nombres de los días presentes
        const listaDias = citasUsuario.map(c => nombresDias[new Date(c.fecha).getUTCDay()]);
        
        // Retornamos "Todos" + días únicos encontrados
        return ["Todos", ...Array.from(new Set(listaDias))];
    }, [citasUsuario, userRole]);

    // 3. Filtrado avanzado
    const citasFiltradas = useMemo(() => {
        return citasUsuario.filter((c: CitaCompleta) => {
            if (userRole === 'paciente') {
                return filtroEspecialidad === "Todos" || c.medicos?.especialidad === filtroEspecialidad;
            }
            if (userRole === 'medico' && filtroDia !== "Todos") {
                const fechaObj = new Date(c.fecha);
                const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
                return dias[fechaObj.getUTCDay()] === filtroDia;
            }
            return true;
        });
    }, [citasUsuario, userRole, filtroEspecialidad, filtroDia]);

    // 4. Ordenamiento
    const citasOrdenadas = useMemo(() => {
        return [...citasFiltradas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }, [citasFiltradas]);

    const templatesFiltro = useMemo(() => {
        const lista = citasUsuario.map((c) => c.medicos?.especialidad).filter(Boolean);
        return ["Todos", ...Array.from(new Set(lista))];
    }, [citasUsuario]);

    const handleCambiarEstado = (id: string, nuevoEstado: 'Programada' | 'Cancelada' | 'Completada') => {
        const cita = citas.find(c => c.id_cita === id);
        if (cita) actualizarCita({ ...cita, estado: nuevoEstado });
    };

    return (
        <div className="contenedor-registros">
            <h2>Mis Registros ({citasOrdenadas.length} citas encontradas)</h2>
            
            <div className="filtro-container">
                {userRole === 'medico' ? (
                    <>
                        <label htmlFor="filtroDia">Filtrar por día: </label>
                        <select id="filtroDia" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)}>
                            {diasDisponibles.map(dia => (
                                <option key={dia} value={dia}>{dia}</option>
                            ))}
                        </select>
                    </>
                ) : (
                    <>
                        <label htmlFor="filtroEspecialidad">Filtrar por Especialidad: </label>
                        <select id="filtroEspecialidad" value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}>
                            {templatesFiltro.map(esp => (<option key={esp} value={esp}>{esp}</option>))}
                        </select>
                    </>
                )}
            </div>

            <TablaCitas 
                citas={citasOrdenadas} 
                onCambiarEstado={handleCambiarEstado}
                onEditar={(cita: CitaCompleta) => setCitaEditando(cita)}
                onVerDetalles={(cita: CitaCompleta) => console.log("Detalles:", cita)}            
            />
        </div>
    );
};