"use client"
import { useState } from "react"
import { Search, Edit, Delete } from "@mui/icons-material"
import { useExpenses } from "../../hooks/use-expenses"
import { useCategories } from "../../hooks/use-categories"

interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  date: string
  emoji: string
}

export default function ExpensesPage() {
  const { expenses, isLoading, updateExpense, deleteExpense } = useExpenses()
  const { categories } = useCategories()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [dateRange, setDateRange] = useState("All Time")
  const [sortBy, setSortBy] = useState("Date (Newest)")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editForm, setEditForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  })

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || expense.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setEditForm({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: new Date(expense.date).toISOString().split("T")[0],
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateExpense = async () => {
    if (editingExpense) {
      await updateExpense(editingExpense._id, {
        amount: Number.parseFloat(editForm.amount),
        category: editForm.category,
        description: editForm.description,
        date: editForm.date,
        emoji: editingExpense.emoji,
      })
      setIsEditModalOpen(false)
      setEditingExpense(null)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await deleteExpense(id)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All")
    setDateRange("All Time")
    setSortBy("Date (Newest)")
  }

  const uniqueCategories = ["All", ...Array.from(new Set(categories.map((cat) => cat.name)))]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">All Expenses</h1>
            <p className="text-gray-600">View and manage all your expenses</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Time">All Time</option>
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Date (Newest)">Date (Newest)</option>
                <option value="Date (Oldest)">Date (Oldest)</option>
                <option value="Amount (High)">Amount (High)</option>
                <option value="Amount (Low)">Amount (Low)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Actions</label>
              <div
                onClick={handleClearFilters}
                className="w-full px-3 py-2 text-center border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Clear Filters
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💰</span>
            <span className="text-sm font-medium">Total Amount</span>
          </div>
          <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-500">{filteredExpenses.length} expenses</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium">Average Amount</span>
          </div>
          <div className="text-2xl font-bold">${averageAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Per expense</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📅</span>
            <span className="text-sm font-medium">Date Range</span>
          </div>
          <div className="text-2xl font-bold">{dateRange}</div>
          <div className="text-sm text-gray-500">Filter applied</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Expenses ({filteredExpenses.length})</h3>
          <p className="text-sm text-gray-500">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </p>
        </div>
        <div className="p-6">
          {isLoading ? ( // Fix: Use isLoading here
            <div className="text-center text-gray-500 py-8">Loading expenses...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No expenses found. Try adjusting your filters.</div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{expense.emoji}</span>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {expense.category}
                        </span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">${expense.amount.toFixed(2)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        onClick={() => handleEditExpense(expense)}
                        className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </div>
                      <div
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors text-red-600 hover:text-red-700"
                      >
                        <Delete className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Edit Expense</h3>
                  <p className="text-sm text-gray-500">Update the details of your expense.</p>
                </div>
                <div onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                  <span className="text-xl">&times;</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <div
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Cancel
                </div>
                <div
                  onClick={handleUpdateExpense}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Update Expense
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}