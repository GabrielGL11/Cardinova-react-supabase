import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // IMPORTANTE: useNavigate para navegación SPA
import { UserInfo } from './UserInfo';
import { useAuth } from '../context/AuthContext'; 
import '../styles/Layout.css';

/**
 * Navbar principal.
 * Muestra enlaces dinámicamente según el estado de autenticación y el rol del usuario.
 */
export const Navbar = () => {
    const { isLoggedIn, userRole } = useAuth();
    const navigate = useNavigate(); // Hook para navegación interna sin recargar
    
    // Estado para gestionar el mensaje de aviso centralizado (modal)
    const [mensajeAviso, setMensajeAviso] = useState<string | null>(null);

    return (
        <header>
            {/* CAPA DE AVISO (MODAL CENTRAL) */}
            {mensajeAviso && (
                <div className="overlay-aviso" onClick={() => setMensajeAviso(null)}>
                    <div className="caja-aviso">
                        <h2>⚠️ Atención</h2>
                        <p>{mensajeAviso}</p>
                        <button onClick={() => setMensajeAviso(null)}>Aceptar</button>
                    </div>
                </div>
            )}

            <nav className="navbar" aria-label="Navegación principal">
                <Link to="/" className="nav-logo">Cardinova</Link>
                
                {/* El componente de perfil de usuario solo se monta si la sesión está activa */}
                {isLoggedIn && <UserInfo />}

                <div className="nav-links">
                    <ul>
                        {/* 1. SECCIÓN PÚBLICA GENERAL */}
                        <li><Link to="/">Inicio</Link></li>
                        
                        {!isLoggedIn && <li><Link to="/login">Iniciar Sesión</Link></li>}

                        {/* 2. MÓDULO PACIENTE: Navegación fluida con validación de rol */}
                        <li>
                            <Link to="#" onClick={(e) => {
                                e.preventDefault();
                                if (!isLoggedIn) {
                                    setMensajeAviso("Acceso denegado: Primero debe iniciar sesión.");
                                } else if (userRole === 'medico') {
                                    setMensajeAviso("Esta pestaña es solo para pacientes.");
                                } else {
                                    navigate("/paciente/agendamiento"); // CAMBIO: Navegación interna (React Router)
                                }
                            }}>Agendar Cita</Link>
                        </li>

                        {userRole !== 'medico' && (
                            <li>
                                <Link to="#" onClick={(e) => {
                                    e.preventDefault();
                                    if (!isLoggedIn) {
                                        setMensajeAviso("No hay registros. Por favor, inicie sesión para ver sus registros.");
                                    } else {
                                        navigate("/paciente/mis-registros"); // CAMBIO: Navegación interna (React Router)
                                    }
                                }}>Mis Registros</Link>
                            </li>
                        )}

                        {/* 3. MÓDULO MÉDICO: Visible solo para médicos autenticados */}
                        {isLoggedIn && userRole === 'medico' && (
                            <li><Link to="/medico/mis-registros">Mis Pacientes</Link></li>
                        )}

                        {/* 4. RECURSOS Y AYUDA */}
                        <li><Link to="/cita">Cita Médica</Link></li>
                        <li><Link to="/recomendacion">Recomendaciones</Link></li>
                        <li><Link to="/sugerencias">Sugerencias</Link></li>
                        <li><Link to="/administracion">Panel Administrativo</Link></li>
                        <li><Link to="/equipo">Equipo</Link></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};