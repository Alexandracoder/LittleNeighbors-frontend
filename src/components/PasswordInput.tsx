import { useState, InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Color del icono del ojo, para que combine con el estilo de cada
  // formulario (Login, Register, ResetPassword usan paletas distintas).
  eyeColorClassName?: string
}

// Se usa DENTRO de un contenedor con className="relative" ya existente en
// cada formulario (para el icono de candado a la izquierda, o simplemente
// para posicionar el ojo a la derecha). Por eso este componente no añade
// su propio wrapper: renderiza el <input> y el botón del ojo como
// hermanos, tal como estaba el <input type="password"> original.
export const PasswordInput = ({
  className = '',
  eyeColorClassName = 'text-gray-400',
  ...props
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <input type={visible ? 'text' : 'password'} className={className} {...props} />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        tabIndex={-1}
        className={`absolute right-4 top-1/2 -translate-y-1/2 ${eyeColorClassName} hover:opacity-70 transition-opacity`}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </>
  )
}
