import { createContext } from 'react'
import TableFilterStore from './form.store'

const TableFilterContext = createContext<TableFilterStore>(
  new TableFilterStore(),
)

const SearchBarContext = createContext<{
  onSearch?: (values: any) => void
} | null>(null)

export default TableFilterContext
export { SearchBarContext }