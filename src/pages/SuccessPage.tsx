import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  return (
    <section className="section-shell section-surface relative flex min-h-[72vh] items-center overflow-hidden bg-app-bg text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgb(var(--primary)/0.14)] via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[340px] w-[680px] -translate-x-1/2 rounded-full bg-[rgb(var(--accent)/0.2)] blur-[120px]"
      />

      <div className="content-container relative z-10">
        <div className="glass-panel card mx-auto max-w-3xl px-6 py-10 text-center sm:px-10 sm:py-12">
          <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-6" />
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Anfrage erfolgreich übermittelt!</h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
            Vielen Dank für dein Vertrauen. Wir haben deine Daten erhalten und prüfen die Verfügbarkeit. In der Regel
            erhältst du innerhalb von 24 Stunden eine Rückmeldung von uns.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/" className="btn-primary focus-ring tap-target interactive">
              Zurück zur Startseite
            </a>
            <a href="/mietshop" className="btn-secondary focus-ring tap-target interactive">
              Weiter im Mietshop stöbern
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
