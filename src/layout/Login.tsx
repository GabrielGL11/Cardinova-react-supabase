import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import '../styles/Layout.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Construimos la URL usando parámetros de consulta estándar de PostgREST
            // Buscamos específicamente el usuario donde el correo y contraseña coincidan
            const url = `${SUPABASE_URL}/rest/v1/usuarios?correo=eq.${encodeURIComponent(email)}&contrasena=eq.${encodeURIComponent(password)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
            });

            if (!response.ok) {
                throw new Error('Error en la conexión con el servidor');
            }

            const data = await response.json();

            // Si data es un array y tiene elementos, el usuario existe
            if (Array.isArray(data) && data.length > 0) {
                const usuarioEncontrado = data[0];

                // Guardamos la sesión en el contexto global
                login(
                    { 
                        id: usuarioEncontrado.id_usuario, 
                        nombre: usuarioEncontrado.nombre, 
                        rol: usuarioEncontrado.rol, 
                        cedula: usuarioEncontrado.cedula 
                    },
                    "sesion-activa" // Token de sesión simulado
                );
                
                // Redirección dinámica basada en el rol
                if (usuarioEncontrado.rol === 'paciente') {
                    navigate('/paciente/agendamiento');
                } else {
                    navigate('/medico/mis-registros');
                }
            } else {
                setError('Correo o contraseña incorrectos');
            }
        } catch (err) {
            console.error('Error durante el login:', err);
            setError('No se pudo conectar al sistema. Inténtalo más tarde.');
        }
    };

    return (
        <section className="producto1">
            <div className="etiqueta">
                <span><i className="fa-solid fa-user"></i> INICIAR SESIÓN</span>
            </div>
            <h2>Accede a tu cuenta</h2>

            <form className="formulario1 centrado" onSubmit={handleLogin}>
                <fieldset>
                    <legend>Iniciar sesión</legend>
                    
                    {error && <p className="mensaje-error" style={{color: 'red'}}>{error}</p>}

                    <label htmlFor="email">Correo electrónico:</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />

                    <label htmlFor="password">Contraseña:</label>
                    <div className="input-password">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button 
                            type="button" 
                            className="toggle-password" 
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>

                    <button type="submit" className="boton-ingresar">Ingresar</button>
                    
                    <p className="texto-centro">
                        ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
                    </p>
                </fieldset>
            </form>
        </section>
    );
}