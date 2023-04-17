import { createContext } from 'react'
import TableFilterStore from './form.store'

const TableFilterContext = createContext<TableFilterStore>(
  new TableFilterStore(),
)

export default TableFilterContext
