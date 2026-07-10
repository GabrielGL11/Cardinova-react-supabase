import { createContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { type Cita } from '../lib/tipos';

interface CitasContextType {
    citas: Cita[];
    agregarCita: (nuevaCita: Cita) => Promise<void>;
    actualizarCita: (citaActualizada: Cita) => Promise<void>;
    citaEditando: Cita | null;
    setCitaEditando: (cita: Cita | null) => void;
}

export const CitasContext = createContext<CitasContextType | undefined>(undefined);

export const CitasProvider = ({ children }: { children: ReactNode }) => {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [citaEditando, setCitaEditando] = useState<Cita | null>(null);

    const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
    const API_KEY = import.meta.env.VITE_SUPABASE_KEY;

    const fetchCitas = useCallback(async () => {
        try {
            const response = await fetch(
                `${URL_BASE}/rest/v1/citas?select=*,pacientes(id_paciente,usuarios(nombre,apellido)),medicos(id_medico,usuarios(nombre,apellido),especialidad)`, 
                {
                    headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setCitas(data);
            }
        } catch (error) {
            console.error("Error al cargar citas:", error);
        }
    }, [URL_BASE, API_KEY]);

    useEffect(() => { fetchCitas(); }, [fetchCitas]);

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

    const actualizarCita = async (citaActualizada: Cita) => {
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