import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

/**
 * Componente UserInfo: Gestiona la visualización de la sesión del usuario.
 * Ahora consulta el estado global del AuthContext, eliminando la dependencia 
 * de la API externa de autenticación de Supabase para mayor agilidad.
 */
export function UserInfo() {
    const navigate = useNavigate();
    // Accedemos al estado del usuario y la función de logout desde el contexto global
    const { userData, logout } = useAuth();
    /**
     * Manejador para cerrar sesión: limpia el almacenamiento local,
     * invoca la función de limpieza del contexto y redirige a la vista de login.
     */
    const cerrarSesion = () => {
        try {
            // Limpiamos los rastros de la sesión en el almacenamiento local
            localStorage.removeItem('usuario_sesion');
        } catch (error) {
            console.error("Error al limpiar almacenamiento local:", error);
        } finally {
            // Ejecutamos el cierre de sesión del contexto y redirigimos
            logout(); 
            navigate('/login');
        }
    };

    // Renderizado condicional: si no hay un usuario activo en el contexto, el componente se oculta
    if (!userData) return null;

    return (
        <div className="user-info-nav">
            <span>
                Usuario: <strong>{userData.nombre}</strong> | Rol: <strong>{userData.rol}</strong>
            </span>
            <button onClick={cerrarSesion} className="btn-cerrar-sesion">
                Cerrar Sesión
            </button>
        </div>
    );
}