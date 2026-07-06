/**
 * Subida de imágenes a Cloudinary usando un "unsigned upload preset".
 *
 * Por qué así y no subiendo el archivo a nuestro backend:
 * - No necesitamos guardar la API secret de Cloudinary en ningún sitio del
 *   backend ni del frontend — el preset "unsigned" solo permite subir con
 *   restricciones ya configuradas en el dashboard de Cloudinary (tamaño
 *   máximo, formatos permitidos, carpeta destino), nunca acceso total a la
 *   cuenta.
 * - La moderación de contenido (rechazar imágenes inapropiadas) se activa
 *   en el propio preset de Cloudinary, no en este código — ver el bloque
 *   de instrucciones más abajo.
 *
 * CONFIGURACIÓN NECESARIA (una sola vez, en el dashboard de Cloudinary):
 * 1. Crear cuenta gratuita en https://cloudinary.com si no existe ya.
 * 2. Settings → Upload → Upload presets → "Add upload preset":
 *    - Signing mode: Unsigned
 *    - Folder: littleneighbors/families (para tenerlo organizado)
 *    - Allowed formats: jpg, png, webp
 *    - Max file size: 5 MB
 *    - Moderation: activar "Manual moderation" (revisión desde el
 *      dashboard antes de que la URL se sirva públicamente) o, si el plan
 *      lo permite, un add-on de moderación automática (p.ej. WebPurify /
 *      AWS Rekognition) para bloquear contenido inapropiado sin revisión
 *      manual.
 * 3. Copiar el "Cloud name" y el nombre del preset a las variables de
 *    entorno del frontend:
 *      VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
 *      VITE_CLOUDINARY_UPLOAD_PRESET=tu-preset-unsigned
 *
 * Si estas variables no están configuradas, uploadFamilyPhoto lanza un
 * error claro en vez de fallar en silencio.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
  | string
  | undefined
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
  | string
  | undefined

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export class ImageUploadError extends Error {}

export function isImageUploadConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET)
}

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageUploadError(
      'Formato no admitido. Usa una imagen JPG, PNG o WEBP.',
    )
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ImageUploadError('La imagen no puede superar los 5 MB.')
  }
}

/**
 * Sube una imagen y devuelve la URL https:// segura de Cloudinary.
 * Lanza ImageUploadError con un mensaje apto para mostrar al usuario.
 */
export async function uploadFamilyPhoto(file: File): Promise<string> {
  if (!isImageUploadConfigured()) {
    throw new ImageUploadError(
      'La subida de fotos no está configurada todavía en este entorno.',
    )
  }

  validateFile(file)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET as string)

  let response: Response
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData },
    )
  } catch {
    throw new ImageUploadError(
      'No se pudo conectar con el servicio de imágenes. Inténtalo de nuevo.',
    )
  }

  if (!response.ok) {
    throw new ImageUploadError(
      'No se pudo subir la imagen. Inténtalo de nuevo en unos minutos.',
    )
  }

  const data = await response.json()

  if (!data.secure_url) {
    throw new ImageUploadError('Respuesta inesperada al subir la imagen.')
  }

  return data.secure_url as string
}
