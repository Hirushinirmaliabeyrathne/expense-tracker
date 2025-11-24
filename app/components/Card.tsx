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


  // const cards = [
  //   { 
  //     title: "Account Name", 
  //     value: user.firstName ? `${user.firstName} ${user.lastName}` : "Guest User", 
  //     desc: "Active Profile" 
  //   },
  //   { 
  //     title: "Email Address", 
  //     // Note: If email is very long, it might wrap. Consider truncating if needed.
  //     value: user.email || "No Email", 
  //     desc: "Registered Contact" 
  //   },
  //   {
  //     title: "Total Spent",
  //     value: `$${totalExpenses.toFixed(2)}`,
  //     desc: "Lifetime expenses",
  //   },
  //   { 
  //     title: "Transactions", 
  //     value: expenses.length.toString(), 
  //     desc: "Total recorded items" 
  //   },
  // ]