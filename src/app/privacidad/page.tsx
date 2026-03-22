import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de Radar Electoral. Conoce cómo protegemos tus datos en el sondeo ciudadano de candidatos en Latacunga y Ecuador.",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-5 py-10">
      <Link
        href="/"
        className="mb-8 text-sm text-white/40 hover:text-white/60"
      >
        ← Volver al inicio
      </Link>

      <h1 className="text-2xl font-semibold text-white">
        Política de Privacidad
      </h1>
      <p className="mt-2 text-sm text-white/40">
        Última actualización: 22 de marzo de 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/65">
        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            1. Responsable del tratamiento
          </h2>
          <p>
            Radar Electoral (en adelante, &ldquo;la Plataforma&rdquo;) es
            operada de forma independiente con fines informativos ciudadanos.
            La Plataforma se compromete a proteger la privacidad de sus
            usuarios de conformidad con la Ley Orgánica de Protección de Datos
            Personales del Ecuador (LOPDP) y demás normativa aplicable.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            2. Datos que recopilamos
          </h2>
          <p>La Plataforma recopila los siguientes datos de forma automática:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Huella digital del navegador (fingerprint):</strong> un
              identificador técnico anónimo generado a partir de
              características del navegador. Se almacena como un hash
              irreversible y se utiliza exclusivamente para evitar votos
              duplicados.
            </li>
            <li>
              <strong>Dirección IP:</strong> se almacena como un hash
              irreversible (no se guarda la IP real) con el fin de prevenir
              abuso y limitar solicitudes excesivas.
            </li>
            <li>
              <strong>Ubicación aproximada:</strong> ciudad y provincia
              derivadas de la IP o de la geolocalización del navegador (si el
              usuario lo autoriza). Las coordenadas se redondean para no
              permitir la identificación precisa. Se utiliza únicamente para
              mostrar estadísticas geográficas agregadas.
            </li>
            <li>
              <strong>Agente de usuario (User-Agent):</strong> información
              técnica del navegador utilizada para detectar y prevenir acceso
              automatizado.
            </li>
          </ul>
          <p className="mt-3">
            Cuando un usuario envía una solicitud de candidato, se recopila
            voluntariamente: nombre, correo electrónico o WhatsApp, nombre del
            candidato propuesto, partido y notas adicionales.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            3. Datos que NO recopilamos
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>No recopilamos nombres reales de los votantes.</li>
            <li>No recopilamos números de cédula ni documentos de identidad.</li>
            <li>No recopilamos correos electrónicos de los votantes.</li>
            <li>No utilizamos cookies de seguimiento ni publicidad.</li>
            <li>
              No vinculamos los votos con la identidad real de ninguna persona.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            4. Finalidad del tratamiento
          </h2>
          <p>Los datos se utilizan exclusivamente para:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Registrar opiniones ciudadanas de forma anónima.</li>
            <li>Prevenir votos duplicados y abuso de la Plataforma.</li>
            <li>Generar estadísticas agregadas por región.</li>
            <li>Gestionar solicitudes de candidatos propuestos por usuarios.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            5. Almacenamiento y seguridad
          </h2>
          <p>
            Los datos se almacenan en servidores de Google Cloud Platform
            (Firebase/Firestore) ubicados en Estados Unidos. Las direcciones IP
            y huellas digitales se transforman mediante funciones hash
            criptográficas irreversibles antes de ser almacenadas, lo que
            impide su recuperación o uso para identificar al usuario. La
            comunicación entre el usuario y la Plataforma se realiza mediante
            conexiones cifradas (HTTPS/TLS).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            6. Compartición de datos
          </h2>
          <p>
            La Plataforma <strong>no vende, alquila ni comparte</strong> datos
            personales con terceros. Los datos no se transfieren a ninguna
            entidad externa salvo los proveedores de infraestructura técnica
            (Google Cloud Platform) necesarios para el funcionamiento del
            servicio, quienes actúan bajo sus propias políticas de privacidad
            y protección de datos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            7. Retención de datos
          </h2>
          <p>
            Los datos de votos (hashes anónimos y estadísticas) se conservan
            mientras la encuesta permanezca activa y por un período razonable
            posterior para fines de archivo. Los datos de solicitudes de
            candidatos se conservan mientras sean necesarios para su gestión.
            El usuario puede solicitar la eliminación de sus datos de contacto
            proporcionados en solicitudes de candidatos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            8. Derechos del usuario
          </h2>
          <p>
            De conformidad con la LOPDP, los usuarios tienen derecho a acceder,
            rectificar, eliminar, oponerse y solicitar la portabilidad de sus
            datos personales. Dado que los votos son anónimos (almacenados como
            hashes irreversibles), no es posible identificar ni eliminar un
            voto individual. Para ejercer derechos sobre datos de contacto
            proporcionados voluntariamente, el usuario puede comunicarse a
            través de los canales disponibles en la Plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            9. Menores de edad
          </h2>
          <p>
            La Plataforma no está dirigida a menores de 16 años. No recopilamos
            intencionalmente datos de menores. Si un padre o tutor considera
            que un menor ha proporcionado datos personales, puede solicitar su
            eliminación.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            10. Cambios a esta política
          </h2>
          <p>
            Esta Política de Privacidad puede ser actualizada en cualquier
            momento. Los cambios serán publicados en esta misma página con la
            fecha de última actualización. El uso continuado de la Plataforma
            tras cualquier modificación constituye aceptación de la política
            vigente.
          </p>
        </section>
      </div>

      <footer className="mt-12 border-t border-white/10 pt-6">
        <div className="flex flex-wrap gap-4 text-xs text-white/30">
          <Link href="/terminos" className="hover:text-white/50">
            Términos y Condiciones
          </Link>
          <Link href="/" className="hover:text-white/50">
            Volver al inicio
          </Link>
        </div>
      </footer>
    </main>
  );
}
