import { createContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { type Cita } from '../lib/tipos';

interface CitasContextType {
    citas: Cita[];
    agregarCita: (nuevaCita: Cita) => void;
    actualizarCita: (citaActualizada: Cita) => void;
    citaEditando: Cita | null;
    setCitaEditando: (cita: Cita | null) => void;
}

export const CitasContext = createContext<CitasContextType | undefined>(undefined);

// -- COMPONENTE CITASPROVIDER --
// Gestiona el estado global de las citas, sincronizándose con la tabla 'citas' en Supabase mediante peticiones HTTP.
export const CitasProvider = ({ children }: { children: ReactNode }) => {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [citaEditando, setCitaEditando] = useState<Cita | null>(null);

    const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
    const API_KEY = import.meta.env.VITE_SUPABASE_KEY;

    // Obtiene todas las citas desde Supabase al montar el componente
    const fetchCitas = useCallback(async () => {
        try {
            const response = await fetch(`${URL_BASE}/rest/v1/citas?select=*`, {
                headers: {
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCitas(data);
            }
        } catch (error) {
            console.error("Error al cargar citas de Supabase:", error);
        }
    }, [URL_BASE, API_KEY]);

    useEffect(() => {
        fetchCitas();
    }, [fetchCitas]);

    // Registra una nueva cita en Supabase mediante POST y actualiza el estado local
    const agregarCita = async (nuevaCita: Cita) => {
        try {
            const response = await fetch(`${URL_BASE}/rest/v1/citas`, {
                method: 'POST',
                headers: {
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(nuevaCita)
            });
            if (response.ok) {
                fetchCitas(); // Refrescamos la lista tras insertar
            }
        } catch (error) {
            console.error("Error al insertar cita:", error);
        }
    };
    
    // Actualiza una cita existente en Supabase mediante PATCH usando el ID como filtro
    const actualizarCita = async (citaActualizada: Cita) => {
        try {
            const response = await fetch(`${URL_BASE}/rest/v1/citas?id_cita=eq.${citaActualizada.id_cita}`, {
                method: 'PATCH',
                headers: {
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(citaActualizada)
            });
            if (response.ok) {
                fetchCitas(); // Refrescamos la lista tras actualizar
            }
        } catch (error) {
            console.error("Error al actualizar cita:", error);
        }
    };

    return (
        <CitasContext.Provider value={{ citas, agregarCita, actualizarCita, citaEditando, setCitaEditando }}>
            {children}
        </CitasContext.Provider>
    );
};