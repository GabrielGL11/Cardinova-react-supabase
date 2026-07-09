import { Link } from 'react-router-dom';
import { type CitaCompleta } from '../lib/tipos'; // Usamos la interfaz extendida
import '../styles/TablaCitas.css';
import { useAuth } from '../context/AuthContext';

interface Props {
    citas: CitaCompleta[]; // Usamos la versión con relaciones
    onCambiarEstado: (id: string, nuevoEstado: 'Programada' | 'Cancelada' | 'Completada') => void;
    onEditar: (cita: CitaCompleta) => void;
    onVerDetalles: (cita: CitaCompleta) => void;
}

/**
 * TablaCitas: Renderiza el listado de citas obtenidas desde Supabase.
 * Accede a los datos relacionados de médico y paciente mediante las relaciones 
 * definidas en las interfaces extendidas.
 */
export const TablaCitas = ({ citas, onCambiarEstado, onEditar, onVerDetalles }: Props) => {
    const { userRole } = useAuth();

    return (
        <table className="tabla-citas">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {citas.map((cita) => (
                    // Usamos id_cita como clave única, tal como está en tu tabla SQL
                    <tr key={cita.id_cita}>
                        <td>{cita.fecha}</td>
                        <td>{cita.hora}</td>
                        {/* Acceso a datos relacionados mediante las tablas unidas */}
                        <td>{cita.pacientes?.usuarios?.nombre} {cita.pacientes?.usuarios?.apellido}</td>
                        <td>{cita.medicos?.usuarios?.nombre}</td>
                        <td>{cita.tipo_atencion}</td>
                        <td>
                            <span className={`badge-estado ${cita.estado?.toLowerCase()}`}>
                                {cita.estado}
                            </span>
                        </td>
                        <td>
                            <div className="contenedor-acciones">
                                <Link 
                                    to={`/${userRole}/mis-registros/${cita.id_cita}`}
                                    className="btn-accion" 
                                    title="Ver detalles"
                                    onClick={() => onVerDetalles(cita)}
                                >
                                    👁️
                                </Link>
                                
                                {cita.estado === 'Programada' ? (
                                    <>
                                        {userRole === 'medico' && (
                                            <button type="button" className="btn-accion" onClick={() => onCambiarEstado(cita.id_cita!, 'Completada')} title="Completar">✅</button>
                                        )}

                                        {userRole === 'paciente' && (
                                            <button type="button" className="btn-accion" onClick={() => onEditar(cita)} title="Editar">✏️</button>
                                        )}

                                        <button type="button" className="btn-accion" onClick={() => onCambiarEstado(cita.id_cita!, 'Cancelada')} title="Cancelar">❌</button>
                                    </>
                                ) : (
                                    <span className="estado-finalizado">Finalizado</span>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};