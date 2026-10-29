import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * Define la estructura de los datos del usuario para mantener la consistencia.
 */
export interface UserData {
    id: string; // ID único generado por Supabase
    nombre: string;
    rol: 'paciente' | 'medico';
    idPaciente?: string;
    cedula: string;
    idMedico?: string;
}

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

// Recupera el usuario guardado (si el usuario refresca la página)
const leerUsuarioGuardado = (): UserData | null => {
    try {
        const guardado = localStorage.getItem('usuarioLogueado');
        return guardado ? JSON.parse(guardado) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('supabase_token'));
    const [userData, setUserData] = useState<UserData | null>(leerUsuarioGuardado);

    // El rol se deriva de userData, no necesita estado propio
    const userRole = userData?.rol ?? null;

    const login = useCallback((datos: UserData, token: string) => {
        localStorage.setItem('supabase_token', token);
        localStorage.setItem('usuarioLogueado', JSON.stringify(datos));
        setIsLoggedIn(true);
        setUserData(datos);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('usuarioLogueado');
        setIsLoggedIn(false);
        setUserData(null);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, userData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para consumir el contexto de forma segura y tipada.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    }
    return context;
};