// data/constants.ts

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]

export const daysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};