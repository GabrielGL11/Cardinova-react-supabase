const URL_BASE = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`;
const CLAVE = import.meta.env.VITE_SUPABASE_KEY;

// Función genérica para obtener datos de cualquier tabla
export const obtenerDatos = async (tabla: string) => {
    try {
    const response = await fetch(`${URL_BASE}/${tabla}?select=*`, {
        headers: {
        'apikey': CLAVE,
        'Authorization': `Bearer ${CLAVE}`,
        'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error al obtener datos de ${tabla}: ${response.statusText}`);
    }

    return await response.json();
    } catch (error) {
    console.error(error);
    return [];
    }
};