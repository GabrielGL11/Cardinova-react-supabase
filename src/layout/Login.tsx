import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import '../styles/Layout.css';

export function Login() {
    // Estados para controlar los inputs del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { login } = useAuth(); 

    // Variables de entorno para la conexión con Supabase
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

    // Función que maneja el envío del formulario
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Limpiamos errores previos

        try {
            // Llamamos a la función SQL 'validar_usuario' creada en Supabase
            const url = `${SUPABASE_URL}/rest/v1/rpc/validar_usuario`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                // Usamos .trim() para evitar errores por espacios accidentales al escribir
                body: JSON.stringify({ 
                    p_correo: email.trim(), 
                    p_contrasena: password.trim() 
                }),
            });

            if (!response.ok) {
                throw new Error('Error en la conexión con el servidor');
            }

            const data = await response.json();

            // Si el array 'data' no está vacío, significa que el usuario y contraseña son correctos
            if (Array.isArray(data) && data.length > 0) {
                const usuarioEncontrado = data[0];

                // Guardamos la sesión usando tu contexto de autenticación
                login({ 
                    id: usuarioEncontrado.id_usuario, 
                    nombre: usuarioEncontrado.nombre, 
                    rol: usuarioEncontrado.rol, 
                    cedula: usuarioEncontrado.cedula 
                }, "sesion-activa");
                
                // Redirección dinámica basada en el rol definido en la base de datos
                if (usuarioEncontrado.rol === 'paciente') {
                    navigate('/paciente/agendamiento');
                } else {
                    navigate('/medico/mis-registros');
                }
            } else {
                // Si 'data' está vacío, las credenciales no coinciden
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
                    
                    {/* Visualización de mensajes de error */}
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
                        {/* Botón para alternar visibilidad de contraseña */}
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