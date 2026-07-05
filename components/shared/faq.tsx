import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: '¿Cuánto tarda el envío?',
    a: 'Los envíos nacionales tardan entre 2 y 5 días hábiles. El envío es gratis en compras superiores a $200.000.',
  },
  {
    q: '¿Puedo cambiar o devolver una prenda?',
    a: 'Sí. Tienes 30 días desde la recepción para cambios o devoluciones, siempre que la prenda conserve sus etiquetas y esté sin usar.',
  },
  {
    q: '¿Cómo sé mi talla?',
    a: 'Cada producto incluye una guía de tallas. Ante la duda, nuestro asistente puede ayudarte a elegir según tus medidas.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'La estructura está lista para tarjetas, PSE y billeteras digitales. La pasarela de pago se habilitará próximamente.',
  },
  {
    q: '¿Los productos son originales?',
    a: 'Todas nuestras prendas son originales y provienen directamente de las marcas y talleres con los que trabajamos.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <p className="kicker text-muted-foreground">Ayuda</p>
        <h2 className="mt-2 text-4xl md:text-6xl">Preguntas frecuentes</h2>
      </div>
      <Accordion type="single" collapsible className="border-t-2 border-border">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
