import { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CitasContext } from '../context/CitasContext'; 
import { useAuth } from '../context/AuthContext';
import { type CitaCompleta } from '../lib/tipos';

// -- COMPONENTE DETALLECITA --
// Renderiza la vista de detalle específico de una cita, extrayendo el ID desde la URL
// y accediendo al estado global gestionado por CitasContext (conectado a Supabase).
const DetalleCita = () => {
    // Extracción del parámetro dinámico 'id' (corresponde a 'id_cita')
    const { id } = useParams();
    const navigate = useNavigate();
    const { userRole } = useAuth();

    // Accedemos al contexto y forzamos el tipo CitaCompleta para acceder a relaciones
    const context = useContext(CitasContext);
    
    if (!context) {
        throw new Error("DetalleCita debe ser utilizado dentro de un CitasProvider");
    }

    const { citas } = context as { citas: CitaCompleta[] };

    // Lógica de búsqueda: Filtra la cita coincidente por su ID único de base de datos
    const cita = citas.find(c => c.id_cita === id);

    // Función para manejar el retorno dinámico al listado del usuario logueado
    const volverAtras = () => {
        navigate(`/${userRole}/mis-registros`);
    };

    // Renderizado condicional si no se encuentra la cita
    if (!cita) {
        return (
            <div className="detalle-container">
                <h2>Cita no encontrada</h2>
                <p>No pudimos encontrar el registro con ID: {id}</p>
                <button type="button" className="boton-volver" onClick={volverAtras}>← Volver a Mis Registros</button>
            </div>
        );
    }

    // Renderizado de información detallada con acceso seguro a propiedades anidadas
    return (
        <div className="detalle-container">
            <h1>Detalle de la Cita</h1>
            <div className="tarjeta-detalle">
                <p><strong>ID Cita:</strong> {cita.id_cita}</p>
                <p><strong>Fecha:</strong> {cita.fecha}</p>
                <p><strong>Hora:</strong> {cita.hora}</p>
                
                {/* Acceso a las relaciones pobladas por el JOIN en Supabase */}
                <p>
                    <strong>Paciente:</strong> {cita.pacientes?.usuarios 
                        ? `${cita.pacientes.usuarios.nombre} ${cita.pacientes.usuarios.apellido}` 
                        : 'Desconocido'}
                </p>
                
                <p>
                    <strong>Médico:</strong> {cita.medicos?.usuarios 
                        ? cita.medicos.usuarios.nombre 
                        : 'No asignado'}
                </p>
                
                <p><strong>Especialidad:</strong> {cita.medicos?.especialidad || 'N/A'}</p>
                <p><strong>Motivo:</strong> {cita.motivo}</p>
                <p><strong>Estado:</strong> {cita.estado}</p>
                
                <button type="button" className="boton-volver" onClick={volverAtras}>
                    ← Volver a Mis Registros
                </button>
            </div>
        </div>
    );
};

export default DetalleCita;