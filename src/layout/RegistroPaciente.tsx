import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Layout.css';

export function RegistroPaciente() {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        cedula: '',
        correo: '',
        password: '',
        confirmar: ''
    });

    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmar) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            // El ID ya no se genera aquí, Supabase lo hará automáticamente en la BD
            const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    nombre: formData.nombres.trim(),
                    apellido: formData.apellidos.trim(),
                    cedula: formData.cedula.trim(),
                    correo: formData.correo.trim().toLowerCase(),
                    contrasena: formData.password.trim(), 
                    rol: 'paciente'
                    // id_usuario se omite para que la BD use gen_random_uuid()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Detalle del error de Supabase:", errorData);
                throw new Error(errorData.message || 'Error al registrar usuario');
            }

            alert('Cuenta creada exitosamente');
            navigate('/login');

        } catch (err: any) {
            console.error("Error capturado:", err);
            setError(`Error: ${err.message || 'Verifica que no exista el correo/cédula'}`);
        }
    };

    return (
        <section className="producto1">
            <div className="etiqueta">
                <span><i className="fa-solid fa-user-plus"></i> REGISTRO DE PACIENTE</span>
            </div>
            <h2>Crea tu cuenta</h2>

            <form className="formulario1 centrado" onSubmit={handleRegistro}>
                <fieldset>
                    <legend>Datos Personales</legend>
                    {error && <p className="mensaje-error" style={{color: 'red'}}>{error}</p>}

                    <div className="grid-container">
                        <div>
                            <label htmlFor="nombres">Nombres:</label>
                            <input type="text" id="nombres" required 
                                value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} />
                        </div>
                        <div>
                            <label htmlFor="apellidos">Apellidos:</label>
                            <input type="text" id="apellidos" required 
                                value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} />
                        </div>
                    </div>

                    <label htmlFor="cedula">Cédula de identidad:</label>
                    <input type="text" id="cedula" maxLength={10} required 
                        value={formData.cedula} onChange={(e) => setFormData({...formData, cedula: e.target.value})} />

                    <label htmlFor="correo">Correo electrónico:</label>
                    <input type="email" id="correo" required 
                        value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} />

                    <label htmlFor="password">Contraseña:</label>
                    <div className="input-password">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            id="password" 
                            required 
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />
                        <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>

                    <label htmlFor="confirmar">Confirmar contraseña:</label>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        id="confirmar" 
                        required 
                        value={formData.confirmar} 
                        onChange={(e) => setFormData({...formData, confirmar: e.target.value})} 
                    />

                    <button type="submit" className="botones boton-registro boton-completo">Crear cuenta</button>
                    <p className="texto-centro">¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
                </fieldset>
            </form>
        </section>
    );
}