### 通用筛选查询组件

配合`usePagination`使用，参考下面例子

```// index.page.ts
import { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import store from './store'
import TableFilter from '@/common/components/table_filter'
import TablePagination from '@/common/components/table_pagination'
// import { Model_Type } from 'gm_api/src/common'

// 筛选查询的表单配置，参考example.fields.ts
import fields from './example.fields.ts'

export default () => {
  const paginationResult = usePagination<any>(store.fetchList, {
    paginationKey: 'view_sku',
    defaultPaging: {
      need_count: true,
      limit: 50,
    },
  })

  useEffect(() => {
    store.setDoRequest(paginationResult.run)
    return () => store.clear()
  }, [])

  return (
    <div>
      <TableFilter
        paginationResult={paginationResult}
        fields={fields.fields}
        immediate
        // 不使用“云字段”功能忽略下面
        // model_type={Model_Type.TYPE_ORDER_ORDER}
        // mixins={fields.mixins}
      />
      <XXXTable />
      <TablePagination
        paginationResult={paginationResult}
        left={
          <>
            <TablePagination.InfoField
              label='商品总数'
              value={paginationResult.pagination.paging.count}
            />
          </>
        }
      />
    </div>
  )
}
```

// 动态控制
const filter = TableFilter.get('view_sku')
filter.xxx