import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage, Prose } from '@/components/shared/content-page';

export const metadata: Metadata = {
  title: 'Guía de tallas',
  description: 'Tablas de tallas y cómo tomar tus medidas para acertar con tu compra en Átelier.',
};

interface SizeTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

const tables: SizeTable[] = [
  {
    caption: 'Mujer — parte superior',
    columns: ['Talla', 'Busto (cm)', 'Cintura (cm)', 'Cadera (cm)'],
    rows: [
      ['XS', '78–82', '60–64', '86–90'],
      ['S', '83–87', '65–69', '91–95'],
      ['M', '88–93', '70–75', '96–101'],
      ['L', '94–99', '76–81', '102–107'],
      ['XL', '100–106', '82–88', '108–114'],
    ],
  },
  {
    caption: 'Hombre — parte superior',
    columns: ['Talla', 'Pecho (cm)', 'Cintura (cm)', 'Cuello (cm)'],
    rows: [
      ['XS', '86–90', '72–76', '35–36'],
      ['S', '91–96', '77–82', '37–38'],
      ['M', '97–102', '83–88', '39–40'],
      ['L', '103–108', '89–94', '41–42'],
      ['XL', '109–115', '95–101', '43–44'],
    ],
  },
  {
    caption: 'Pantalones — equivalencia',
    columns: ['Talla', 'Cintura (cm)', 'Colombia', 'EE. UU.'],
    rows: [
      ['XS', '60–64', '6', '26'],
      ['S', '65–69', '8', '28'],
      ['M', '70–75', '10', '30'],
      ['L', '76–81', '12', '32'],
      ['XL', '82–88', '14', '34'],
    ],
  },
];

function SizeTableBlock({ table }: { table: SizeTable }) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold tracking-wide text-foreground uppercase">
        {table.caption}
      </h3>

      {/* Móvil: cada talla como bloque apilado. */}
      <ul className="space-y-3 md:hidden">
        {table.rows.map((row) => (
          <li key={row[0]} className="border p-4">
            <p className="font-display text-lg font-bold uppercase">{row[0]}</p>
            <dl className="mt-2 space-y-1 text-sm">
              {table.columns.slice(1).map((col, i) => (
                <div key={col} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{col}</dt>
                  <dd className="font-medium text-foreground">{row[i + 1]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla completa. */}
      <div className="hidden overflow-x-auto border md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{table.caption}</caption>
          <thead className="bg-muted">
            <tr>
              {table.columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-4 py-3 text-left font-display text-xs font-bold tracking-wide uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row[0]} className="border-t">
                {row.map((cell, i) => (
                  <td
                    key={table.columns[i]}
                    className={i === 0 ? 'px-4 py-3 font-semibold' : 'px-4 py-3 text-muted-foreground'}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function TallasPage() {
  return (
    <ContentPage
      kicker="Ayuda"
      title="Guía de tallas"
      intro="Mide sobre el cuerpo, sin ropa gruesa y con la cinta métrica ajustada pero sin apretar."
    >
      <Prose>
        <h2>Cómo tomar tus medidas</h2>
        <ul>
          <li>
            <strong>Busto o pecho:</strong> rodea la parte más ancha, pasando la cinta por debajo
            de las axilas y manteniéndola paralela al suelo.
          </li>
          <li>
            <strong>Cintura:</strong> mide en la parte más estrecha del torso, justo encima del
            ombligo.
          </li>
          <li>
            <strong>Cadera:</strong> rodea la parte más ancha, unos 20 cm por debajo de la cintura.
          </li>
          <li>
            <strong>Cuello:</strong> mide la base del cuello dejando un dedo de holgura.
          </li>
        </ul>
        <p>
          Si una medida cae entre dos tallas, elige la mayor. Y si buscas un corte holgado, sube
          una talla respecto a la que te corresponde.
        </p>
      </Prose>

      <div className="mt-12 space-y-10">
        {tables.map((table) => (
          <SizeTableBlock key={table.caption} table={table} />
        ))}
      </div>

      <Prose className="mt-12">
        <h2>¿Sigues con dudas?</h2>
        <p>
          Las medidas son orientativas y pueden variar según el corte y el tejido de cada prenda.
          Si no estás seguro, pregúntale al asistente de la tienda o escríbenos desde{' '}
          <Link href="/contacto">Contacto</Link>: te ayudamos a elegir. Y si al final no acierta,
          puedes <Link href="/ayuda/devoluciones">devolverla</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
