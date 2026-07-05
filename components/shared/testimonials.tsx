import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      'La calidad de las prendas superó mis expectativas. El corte es impecable y la tela se siente premium.',
    author: 'Valentina R.',
    role: 'Cliente verificada',
  },
  {
    quote:
      'Envío rapidísimo y el empaque es una experiencia en sí misma. Ya es mi tienda de cabecera.',
    author: 'Mateo G.',
    role: 'Cliente verificado',
  },
  {
    quote:
      'Me encanta el estilo minimalista y atemporal. Todo combina con todo. Volveré sin duda.',
    author: 'Camila S.',
    role: 'Cliente verificada',
  },
];

export function Testimonials() {
  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <p className="kicker text-muted-foreground">Lo que dicen</p>
          <h2 className="mt-2 text-4xl md:text-6xl">Miles de historias</h2>
        </div>
        <div className="grid gap-1 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="flex flex-col justify-between gap-6 border-2 border-foreground bg-background p-8"
            >
              <div>
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-foreground text-foreground" />
                  ))}
                </div>
                <blockquote className="font-display text-lg leading-snug">
                  “{t.quote}”
                </blockquote>
              </div>
              <figcaption>
                <p className="font-bold uppercase">{t.author}</p>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
