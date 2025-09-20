import Card from "../components/Card";


export default function DashboardPage() {
  const cards = [
    { title: "Users", value: "1,230", desc: "Total registered users" },
    { title: "Revenue", value: "$8,540", desc: "Monthly revenue" },
    { title: "Expenses", value: "$3,200", desc: "Monthly expenses" },
    { title: "Growth", value: "12%", desc: "Compared to last month" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
         <Card
            key={card.title}
            title={card.title}
            value={card.value}
            desc={card.desc}
          />
        ))}
      </div>
    </div>
  );
}
