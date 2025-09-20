interface CardProps {
  title: string;
  value: string | number;
  desc: string;
}

export default function Card({ title, value, desc }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <h2 className="text-sm text-gray-600">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
      <span className="text-xs text-gray-500">{desc}</span>
    </div>
  );
}
