import { type MedicoConUsuario } from '../../lib/tipos';
import { SelectorPaso } from '../SelectorPaso';
import { TarjetaMedico } from '../TarjetaMedico';
import { obtenerEspecialidades, obtenerCiudades, obtenerHospitales } from '../../lib/utilidades';

interface PropsPasoFiltro {
    esp: string; setEsp: (v: string) => void;
    ciu: string; setCiu: (v: string) => void;
    hosp: string; setHosp: (v: string) => void;
    medico: MedicoConUsuario | null;
    setMedico: (m: MedicoConUsuario | null) => void;
    medicosDisponibles: MedicoConUsuario[]; 
    onContinuar: () => void;
}

export const PasoFiltroMedico = ({ esp, setEsp, ciu, setCiu, hosp, setHosp, medico, setMedico, medicosDisponibles, onContinuar }: PropsPasoFiltro) => {

    const medicosFiltrados = medicosDisponibles.filter(m => 
        (esp ? m.especialidad === esp : true) && (ciu ? m.ciudad === ciu : true) && (hosp ? m.hospital === hosp : true)
    );

    return (
        <div className="paso-filtro-container">
            <SelectorPaso label="Especialidad" opciones={obtenerEspecialidades(medicosDisponibles)} valor={esp} onChange={(v) => { setEsp(v); setCiu(''); setHosp(''); setMedico(null); }} />
            
            {esp && <SelectorPaso label="Ciudad" opciones={obtenerCiudades(medicosDisponibles, esp)} valor={ciu} onChange={(v) => { setCiu(v); setHosp(''); setMedico(null); }} />}
            
            {ciu && <SelectorPaso label="Hospital" opciones={obtenerHospitales(medicosDisponibles, esp, ciu)} valor={hosp} onChange={(v) => { setHosp(v); setMedico(null); }} />}
            
            {hosp && (
                <SelectorPaso 
                    label="Médico" 
                    opciones={medicosFiltrados.map(m => `${m.usuarios?.nombre || ''} ${m.usuarios?.apellido || ''}`)} 
                    valor={medico ? `${medico.usuarios?.nombre || ''} ${medico.usuarios?.apellido || ''}` : ''} 
                    onChange={(seleccion) => {
                        const encontrado = medicosFiltrados.find(m => `${m.usuarios?.nombre || ''} ${m.usuarios?.apellido || ''}` === seleccion);
                        setMedico(encontrado || null);
                    }} 
                />
            )}
            
            {medico && (
                <div className="tarjeta-medico">
                    <TarjetaMedico medico={medico} />
                    <button type="button" className="boton-continuar-paso1" onClick={onContinuar}>Continuar</button>
                </div>
            )}
        </div>
    );
};