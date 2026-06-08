// src/paginas/PaginaLogin/PaginaLogin.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/imagenes/logo-rw.png';
import './PaginaLogin.css';

// Iconos de ojo (mostrar / ocultar contraseña)
const EyeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19M1 1l22 22" />
  </svg>
);

type TipoAlerta = 'error' | 'exito';
interface Alerta {
  mensaje: string;
  tipo: TipoAlerta;
}

export function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [alerta, setAlerta] = useState<Alerta>({ mensaje: '', tipo: 'error' });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Muestra una alerta flotante temporal (se borra sola a los 4s)
  function mostrarAlerta(mensaje: string, tipo: TipoAlerta = 'error') {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta({ mensaje: '', tipo: 'error' }), 4000);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      // Toda la validación la hace el backend. Si las credenciales son
      // correctas, login() guarda el token y setea el usuario en el contexto.
      await login(email.trim(), contrasena);
      mostrarAlerta('¡Bienvenido!', 'exito');
      setTimeout(() => navigate('/registradores'), 1000);
    } catch (error: any) {
      // El backend devuelve 401 si las credenciales no son válidas
      const mensaje =
        error?.response?.status === 401
          ? 'Credenciales inválidas'
          : 'No se pudo iniciar sesión. Intentá de nuevo.';
      mostrarAlerta(mensaje, 'error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="container">
        <div className="izquierda">
          <img src={logo} alt="logoApp" className="logo" />
        </div>

        <div className="derecha">
          <div className="login">
            <h3 className="usuario">EMAIL</h3>
            <input
              className="input"
              type="email"
              placeholder="Ingrese su email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />

            <h3 className="usuario">CONTRASEÑA</h3>
            <div className="input-contraseña">
              <input
                className="input"
                type={mostrar ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
              />
              <span onClick={() => setMostrar(!mostrar)} className="ojito">
                {mostrar ? <EyeIcon /> : <EyeOffIcon />}
              </span>
            </div>

            <div className="acciones">
              <button type="submit" className="boton">
                Iniciar sesión
              </button>

              <Link to="/registro" className="registrarse">
                ¿No tienes cuenta? registrate
              </Link>
            </div>
          </div>
        </div>
      </div>

      {alerta.mensaje && (
        <div className={`alerta alerta-${alerta.tipo}`}>{alerta.mensaje}</div>
      )}
    </form>
  );
}
