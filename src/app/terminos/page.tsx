import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de Radar Electoral, sondeo ciudadano informativo sobre candidatos en Latacunga y Ecuador. No constituye encuesta oficial.",
};

export default function TerminosPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-5 py-10">
      <Link
        href="/"
        className="mb-8 text-sm text-white/40 hover:text-white/60"
      >
        ← Volver al inicio
      </Link>

      <h1 className="text-2xl font-semibold text-white">
        Términos y Condiciones de Uso
      </h1>
      <p className="mt-2 text-sm text-white/40">
        Última actualización: 22 de marzo de 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/65">
        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            1. Naturaleza de la plataforma
          </h2>
          <p>
            Radar Electoral (en adelante, &ldquo;la Plataforma&rdquo;) es una
            herramienta informativa de carácter ciudadano que permite recopilar
            opiniones de los usuarios sobre candidatos a cargos de elección
            popular. La Plataforma <strong>no constituye una encuesta oficial,
            sondeo certificado ni proceso electoral</strong> reconocido por
            ninguna autoridad pública del Ecuador ni de ningún otro país.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            2. Sin valor electoral ni estadístico
          </h2>
          <p>
            Los resultados presentados en la Plataforma son de carácter
            meramente referencial y no poseen validez electoral, jurídica ni
            estadística. No representan proyecciones, predicciones ni resultados
            oficiales de ningún proceso electoral. Los datos recopilados no
            cumplen con los estándares metodológicos de una encuesta formal y
            no deben interpretarse como tales.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            3. Exclusión de responsabilidad
          </h2>
          <p>
            El operador de la Plataforma <strong>se exime de toda
            responsabilidad</strong> por:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Decisiones que los usuarios tomen con base en la información
              mostrada en la Plataforma.
            </li>
            <li>
              Daños directos, indirectos, incidentales, consecuentes o
              especiales derivados del uso o imposibilidad de uso de la
              Plataforma.
            </li>
            <li>
              La exactitud, veracidad, integridad o actualidad de los datos,
              nombres, imágenes o información de candidatos presentada.
            </li>
            <li>
              Uso indebido, manipulación o interpretación errónea de los
              resultados por parte de terceros.
            </li>
            <li>
              Interrupciones, errores técnicos, pérdida de datos o fallos en
              el servicio.
            </li>
            <li>
              Contenido generado o propuesto por los usuarios, incluyendo
              solicitudes de candidatos.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            4. Uso aceptable
          </h2>
          <p>El usuario se compromete a:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              No utilizar la Plataforma para difundir información falsa,
              engañosa o difamatoria.
            </li>
            <li>
              No manipular, automatizar ni alterar los resultados mediante bots,
              scripts u otros mecanismos.
            </li>
            <li>
              No presentar los resultados de la Plataforma como encuestas
              oficiales, sondeos certificados o proyecciones electorales.
            </li>
            <li>
              No utilizar la Plataforma con fines que contravengan la
              legislación ecuatoriana vigente.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            5. Propiedad intelectual
          </h2>
          <p>
            Las imágenes de los candidatos son de dominio público o han sido
            proporcionadas por terceros. La Plataforma no reclama propiedad
            sobre dichas imágenes. Los nombres y datos de candidatos son
            información pública. El diseño, código y marca de la Plataforma
            son propiedad de su operador.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            6. Modificaciones
          </h2>
          <p>
            El operador se reserva el derecho de modificar, suspender o
            descontinuar la Plataforma en cualquier momento y sin previo aviso.
            Asimismo, estos términos pueden ser actualizados en cualquier
            momento. El uso continuado de la Plataforma tras cualquier
            modificación constituye aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            7. Legislación aplicable
          </h2>
          <p>
            Estos términos se rigen por las leyes de la República del Ecuador.
            Cualquier controversia derivada del uso de la Plataforma se
            someterá a la jurisdicción de los tribunales competentes de la
            ciudad de Quito, Ecuador.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-white/80">
            8. Aceptación
          </h2>
          <p>
            Al acceder y utilizar la Plataforma, el usuario declara haber leído,
            comprendido y aceptado estos Términos y Condiciones en su
            totalidad. Si no está de acuerdo con alguno de estos términos,
            debe abstenerse de utilizar la Plataforma.
          </p>
        </section>
      </div>

      <footer className="mt-12 border-t border-white/10 pt-6">
        <div className="flex flex-wrap gap-4 text-xs text-white/30">
          <Link href="/privacidad" className="hover:text-white/50">
            Política de Privacidad
          </Link>
          <Link href="/" className="hover:text-white/50">
            Volver al inicio
          </Link>
        </div>
      </footer>
    </main>
  );
}
