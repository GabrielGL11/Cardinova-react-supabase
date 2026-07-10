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

export const CitasContext = createContext<CitasContextType | undefined>(undefined);

export const CitasProvider = ({ children }: { children: ReactNode }) => {
    const [citas, setCitas] = useState<CitaCompleta[]>([]);
    const [citaEditando, setCitaEditando] = useState<CitaCompleta | null>(null);
    
    const { userData } = useAuth(); 

    const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
    const API_KEY = import.meta.env.VITE_SUPABASE_KEY;

    const fetchCitas = useCallback(async () => {
        try {
            // Usamos URLSearchParams para garantizar que la consulta llegue bien a Supabase
            const params = new URLSearchParams({
                select: "*,pacientes(id_paciente,id_usuario,usuarios(nombre,apellido)),medicos(id_medico,id_usuario,especialidad,usuarios(nombre,apellido))"
            });

            const response = await fetch(`${URL_BASE}/rest/v1/citas?${params.toString()}`, {
                headers: { 
                    'apikey': API_KEY, 
                    'Authorization': `Bearer ${API_KEY}`,
                    'Prefer': 'return=representation'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log("Datos cargados correctamente:", data);
                setCitas(data || []);
            } else {
                console.error("Error en Supabase:", data);
            }
        } catch (error) {
            console.error("Error crítico al cargar citas:", error);
        }
    }, [URL_BASE, API_KEY]);

    useEffect(() => {
        if (userData?.id) {
            console.log("Iniciando carga de citas para:", userData.id);
            fetchCitas(); 
        }
    }, [fetchCitas, userData]);

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
        if (response.ok) await fetchCitas();
    };

    const actualizarCita = async (citaActualizada: CitaCompleta) => {
        const { medicos, pacientes, ...citaPura } = citaActualizada;
        
        const response = await fetch(`${URL_BASE}/rest/v1/citas?id_cita=eq.${citaPura.id_cita}`, {
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
            await fetchCitas();
            setCitaEditando(null);
        }
    };

    return (
        <CitasContext.Provider value={{ citas, agregarCita, actualizarCita, citaEditando, setCitaEditando }}>
            {children}
        </CitasContext.Provider>
    );
};