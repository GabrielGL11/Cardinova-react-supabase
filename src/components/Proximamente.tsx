type Props = { titulo: string };

export default function Proximamente({ titulo }: Props) {
  return (
    <section style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h2>{titulo}</h2>
      <p>🚧 Próximamente: esta sección está en construcción.</p>
    </section>
  );
}