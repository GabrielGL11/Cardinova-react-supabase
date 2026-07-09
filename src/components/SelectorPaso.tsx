import '../styles/FormularioCita.css';

interface PropsSelector {
    label: string;
    // Usamos string[] porque es el formato estándar para desplegables
    opciones: string[];
    valor: string;
    onChange: (valor: string) => void;
    placeholder?: string;
    disabled?: boolean; 
}

/**
 * -- COMPONENTE SELECTORPASO --
 * Renderiza un menú desplegable personalizado y reutilizable.
 * Es un componente presentacional que recibe el estado y el disparador (handler) desde el componente padre.
 */
export const SelectorPaso = ({ 
    label, 
    opciones, 
    valor, 
    onChange, 
    placeholder = "Seleccione...",
    disabled = false 
}: PropsSelector) => {
    
    // Genera un ID único basado en el texto del label para mejorar la accesibilidad (A11y)
    const idUnico = label.replace(/\s+/g, '-').toLowerCase();

    return (
        <div className="contenedor-selector">
            <label className="label-selector" htmlFor={idUnico}>{label}</label>
            
            {/* 
                El select utiliza la propiedad 'disabled' nativa de HTML
                y aplica una clase CSS condicional para efectos visuales.
            */}
            <select 
                id={idUnico} 
                className={`select-estilo ${disabled ? 'disabled' : ''}`} 
                value={valor} 
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled} 
            >
                <option value="">{placeholder}</option>
                
                {/* 
                    Mapeo de opciones. 
                    Nota: Se asume que las opciones son valores únicos.
                */}
                {opciones.map(op => (
                    <option key={op} value={op}>{op}</option>
                ))}
            </select>
        </div>
    );
};