export interface Finance {
  id: string
  title: string
  amount: number
  type: "income" | "outcome"
  date: Date
}
