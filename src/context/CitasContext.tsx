import { createContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { type Cita, type CitaCompleta } from '../lib/tipos'; 
import { useAuth } from './AuthContext';

interface CitasContextType {
    citas: CitaCompleta[];
    agregarCita: (nuevaCita: Cita) => Promise<void>;
    actualizarCita: (citaActualizada: CitaCompleta) => Promise<void>;
    citaEditando: CitaCompleta | null;
    setCitaEditando: (cita: CitaCompleta | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CitasContext = createContext<CitasContextType | undefined>(undefined);

export const CitasProvider = ({ children }: { children: ReactNode }) => {
    const [citas, setCitas] = useState<CitaCompleta[]>([]);
    const [citaEditando, setCitaEditando] = useState<CitaCompleta | null>(null);
    
    const { userData } = useAuth(); 

    const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
    const API_KEY = import.meta.env.VITE_SUPABASE_KEY;

    // Solo pide las citas y las devuelve (null si algo falla)
    const obtenerCitas = useCallback(async (): Promise<CitaCompleta[] | null> => {
        try {
            const selectQuery = "*,pacientes(id_paciente,id_usuario,usuarios(nombre,apellido)),medicos(id_medico,id_usuario,especialidad,horarios_medico(dia,hora),usuarios(nombre,apellido))";
            
            const response = await fetch(
                `${URL_BASE}/rest/v1/citas?select=${selectQuery}`, 
                {
                    headers: { 
                        'apikey': API_KEY, 
                        'Authorization': `Bearer ${API_KEY}`,
                        'Prefer': 'return=representation'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                return data || [];
            }
            console.error("Error en Supabase:", await response.text());
        } catch (error) {
            console.error("Error al cargar citas:", error);
        }
        return null;
    }, [URL_BASE, API_KEY]);

    // Recarga manual (después de agregar o actualizar)
    const recargarCitas = async () => {
        const data = await obtenerCitas();
        if (data) setCitas(data);
    };

    // Carga inicial cuando hay un usuario logueado
    useEffect(() => {
        if (!userData) return;
        let activo = true;
        obtenerCitas().then(data => {
            if (activo && data) setCitas(data);
        });
        return () => { activo = false; };
    }, [obtenerCitas, userData]);

    const agregarCita = async (nuevaCita: Cita) => {
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
        if (response.ok) await recargarCitas();
    };

    const actualizarCita = async (citaActualizada: CitaCompleta) => {
        // Quitamos las relaciones antes de enviar el PATCH
        const citaPura: Record<string, unknown> = { ...citaActualizada };
        delete citaPura.medicos;
        delete citaPura.pacientes;
        
        const response = await fetch(`${URL_BASE}/rest/v1/citas?id_cita=eq.${citaActualizada.id_cita}`, {
            method: 'PATCH',
            headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(citaPura)
        });
        
        if (response.ok) {
            await recargarCitas();
            setCitaEditando(null);
        }
    };

    return (
        <CitasContext.Provider value={{ citas, agregarCita, actualizarCita, citaEditando, setCitaEditando }}>
            {children}
        </CitasContext.Provider>
    );
};