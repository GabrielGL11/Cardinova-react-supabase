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
            // CORRECCIÓN: Solicitamos la tabla relacionada 'horarios_medico'
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
                setCitas(data || []);
            } else {
                console.error("Error en Supabase:", await response.text());
            }
        } catch (error) {
            console.error("Error al cargar citas:", error);
        }
    }, [URL_BASE, API_KEY]);

    useEffect(() => {
        if (userData) {
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
        // Excluimos las relaciones antes de enviar el patch
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