export default function KPISection({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <c.component
          key={i}
          title={c.title}
          value={c.value}
          icon={c.icon}
          subtitle={c.subtitle}
        />
      ))}
    </div>
  );
}
