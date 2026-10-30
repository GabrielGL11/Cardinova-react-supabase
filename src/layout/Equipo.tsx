import '../styles/Layout.css';

const MIEMBROS = [
    { nombre: 'Tyrone Anchundia', github: 'https://github.com/tyronealan' },
    { nombre: 'Anthony Guaman', github: 'https://github.com/GabrielGL11' },
    { nombre: 'Adonis Mero', github: 'https://github.com/AdonisMer' },
];

export function SeccionEquipo() {
    return (
        <section id="equipo">
            <h2>Equipo</h2>
            <div className="miembros">
                {MIEMBROS.map((m) => (
                    <figure key={m.nombre}>
                        <img src={`https://picsum.photos/seed/${encodeURIComponent(m.nombre)}/200`} alt={m.nombre} />
                        <figcaption>
                            {m.nombre}
                            <a href={m.github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub de ${m.nombre}`}>
                                <i className="fa-brands fa-github"></i>
                            </a>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}

export function Equipo() {
    return <SeccionEquipo />;
}