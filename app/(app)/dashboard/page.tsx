import { SummaryHeader } from "@/components/dashboard/summary-header"
import { BudgetCard } from "@/components/dashboard/budget-card"
import { mockBudgetCategories } from "@/lib/mock-data"

export default function DashboardPage() {
  const totalBudget = mockBudgetCategories.reduce(
    (sum, cat) => sum + cat.budget,
    0
  )
  const totalSpent = mockBudgetCategories.reduce(
    (sum, cat) => sum + cat.spent,
    0
  )

  const currentMonth = new Date().toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Mis Apartados</h1>
        <p className="mt-0.5 text-sm capitalize text-muted-foreground">
          {currentMonth}
        </p>
      </div>

      {/* Summary */}
      <SummaryHeader totalBudget={totalBudget} totalSpent={totalSpent} />

      {/* Category cards */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Categorias
        </h2>
        {mockBudgetCategories.map((category) => (
          <BudgetCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
