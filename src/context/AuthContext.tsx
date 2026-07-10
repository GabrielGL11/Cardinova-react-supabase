import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

/**
 * Define la estructura de los datos del usuario para mantener la consistencia.
 * Se añadió el campo 'id' para poder filtrar las citas por usuario.
 */
export interface UserData {
    id: string; // ID único generado por Supabase
    nombre: string;
    rol: 'paciente' | 'medico';
    idPaciente?: string;
    cedula: string;
    idMedico?: string;
}

/**
 * AuthContextType: Define qué funciones y estados están disponibles globalmente.
 */
export interface AuthContextType {
    isLoggedIn: boolean;
    userRole: 'paciente' | 'medico' | null;
    userData: UserData | null;
    login: (userData: UserData, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    userRole: null,
    userData: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Inicialización del estado: intenta recuperar el usuario y el token de localStorage
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('supabase_token'));
    const [userRole, setUserRole] = useState<'paciente' | 'medico' | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);

    // Efecto para restaurar el estado si el usuario refresca la página
    useEffect(() => {
        const storedUser = localStorage.getItem('usuarioLogueado');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);
            setUserRole(parsedUser.rol);
        }
    }, []);

    // login: Actualiza el estado global y persiste tanto el usuario como el token de Supabase
    const login = useCallback((userData: UserData, token: string) => {
        localStorage.setItem('supabase_token', token); // Guardamos el token para peticiones futuras
        localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
        
        setIsLoggedIn(true);
        setUserRole(userData.rol);
        setUserData(userData);
    }, []);

    // logout: Limpia los estados, el almacenamiento local y destruye la referencia de sesión
    const logout = useCallback(() => {
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('usuarioLogueado');
        
        setIsLoggedIn(false);
        setUserRole(null);
        setUserData(null);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, userData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para consumir el contexto de forma segura y tipada.
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    }
    return context;
};