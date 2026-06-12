// src/paginas/PaginaRegistro/PaginaRegistro.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import { Spinner } from '@/components/Spinner/Spinner';
import { ModalConfirmacion } from '@/components/ModalConfirmacion/ModalConfirmacion';
import logo from '@/assets/imagenes/logo-rw.png';
import '../PaginaLogin/PaginaLogin.css'; // layout base (lo comparte con el login)
import './PaginaRegistro.css'; // ajustes visuales propios del registro

// Los campos que validamos (tipado fuerte: no se puede usar uno que no exista)
type Campo = 'nombre' | 'apellido' | 'email' | 'contrasena' | 'confirmar';
// Objeto de errores: cada campo puede tener (o no) un mensaje
type Errores = Partial<Record<Campo, string>>;

// Alerta flotante (éxito o error), igual que en el login
type TipoAlerta = 'error' | 'exito';
interface Alerta {
  mensaje: string;
  tipo: TipoAlerta;
}

export function PaginaRegistro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [alerta, setAlerta] = useState<Alerta>({ mensaje: '', tipo: 'error' });
  const [exitoAbierto, setExitoAbierto] = useState(false);

  const navigate = useNavigate();

  // Muestra una alerta flotante temporal (se borra sola a los 4s)
  function mostrarAlerta(mensaje: string, tipo: TipoAlerta = 'error') {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta({ mensaje: '', tipo: 'error' }), 4000);
  }

  // Valida un campo, actualiza el estado de errores y devuelve el mensaje
  function validarCampo(campo: Campo): string {
    let mensaje = '';
    switch (campo) {
      case 'nombre':
        if (!nombre.trim()) mensaje = 'El nombre es obligatorio.';
        else if (nombre.trim().length < 3)
          mensaje = 'El nombre debe tener al menos 3 caracteres.';
        break;
      case 'apellido':
        if (!apellido.trim()) mensaje = 'El apellido es obligatorio.';
        else if (apellido.trim().length < 2)
          mensaje = 'El apellido debe tener al menos 2 caracteres.';
        break;
      case 'email':
        if (!email.trim()) mensaje = 'El email es obligatorio.';
        else if (!/^\S+@\S+\.\S+$/.test(email))
          mensaje = 'El formato de email no es válido.';
        break;
      case 'contrasena':
        if (!contrasena) mensaje = 'La contraseña es obligatoria.';
        else if (contrasena.length < 8)
          mensaje = 'La contraseña debe tener al menos 8 caracteres.';
        break;
      case 'confirmar':
        if (!confirmar) mensaje = 'Debes confirmar la contraseña.';
        else if (confirmar !== contrasena)
          mensaje = 'Las contraseñas no coinciden.';
        break;
    }

    setErrores((prev) => {
      const next = { ...prev };
      if (mensaje) next[campo] = mensaje;
      else delete next[campo];
      return next;
    });

    return mensaje;
  }

  // Valida todos los campos; true si no hay ningún error
  function validarTodo(): boolean {
    const campos: Campo[] = ['nombre', 'apellido', 'email', 'contrasena', 'confirmar'];
    return campos.map((c) => validarCampo(c)).every((m) => m === '');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (enviando) return;
    if (!validarTodo()) return;

    setEnviando(true);
    try {
      // El backend crea el usuario. Si el email ya existe, devuelve 409.
      await api.post('/auth/register', {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        password: contrasena,
      });

      setExitoAbierto(true); // modal de éxito con botón "Iniciar sesión"
    } catch (error: any) {
      if (error?.response?.status === 409) {
        // Email duplicado → marcamos el campo email
        setErrores((prev) => ({ ...prev, email: 'Ese email ya está registrado.' }));
      } else {
        mostrarAlerta('No se pudo crear la cuenta. Intentá de nuevo.', 'error');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form registro-page">
      <div className="container">
        <div className="izquierda">
          <img src={logo} alt="logoApp" className="logo" />
        </div>

        <div className="derecha">
          <div className="login">
            <button
              type="button"
              className="btn-volver"
              onClick={() => navigate('/login')}
            >
              ← Volver
            </button>

            <h2 className="titulo-registro">REGISTRO</h2>

            <h3 className="label-registro">Nombre</h3>
            <input
              className={`input ${errores.nombre ? 'input-error' : ''}`}
              type="text"
              placeholder="Ingrese su nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={() => validarCampo('nombre')}
            />
            {errores.nombre && <p className="error-text">{errores.nombre}</p>}

            <h3 className="label-registro">Apellido</h3>
            <input
              className={`input ${errores.apellido ? 'input-error' : ''}`}
              type="text"
              placeholder="Ingrese su apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              onBlur={() => validarCampo('apellido')}
            />
            {errores.apellido && <p className="error-text">{errores.apellido}</p>}

            <h3 className="label-registro">Email</h3>
            <input
              className={`input ${errores.email ? 'input-error' : ''}`}
              type="email"
              placeholder="Ingrese su email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validarCampo('email')}
            />
            {errores.email && <p className="error-text">{errores.email}</p>}

            <h3 className="label-registro">Contraseña</h3>
            <input
              className={`input ${errores.contrasena ? 'input-error' : ''}`}
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              onBlur={() => validarCampo('contrasena')}
            />
            {errores.contrasena && <p className="error-text">{errores.contrasena}</p>}

            <h3 className="label-registro">Confirmar contraseña</h3>
            <input
              className={`input ${errores.confirmar ? 'input-error' : ''}`}
              type="password"
              placeholder="Repita su contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              onBlur={() => validarCampo('confirmar')}
            />
            {errores.confirmar && <p className="error-text">{errores.confirmar}</p>}

            <div className="acciones">
              <button type="submit" className="boton" disabled={enviando}>
                {enviando ? (
                  <span className="spinner-fila">
                    <Spinner tamanio={16} />
                    Creando cuenta…
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {alerta.mensaje && (
        <div className={`alerta alerta-${alerta.tipo}`}>{alerta.mensaje}</div>
      )}

      <ModalConfirmacion
        abierto={exitoAbierto}
        soloConfirmar
        titulo="¡Cuenta creada!"
        mensaje="Tu cuenta se creó con éxito. Ya podés iniciar sesión."
        textoConfirmar="Iniciar sesión"
        onConfirmar={() => navigate('/login')}
      />
    </form>
  );
}
