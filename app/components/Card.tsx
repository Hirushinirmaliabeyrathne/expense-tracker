interface CardProps {
  title: string
  value: string
  desc: string
}

export default function Card({ title, value, desc }: CardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  )
}
