import {
  EXPLORER_DATEPICKER_HELPERS,
  genQueryParams,
  getDefaultHelper,
} from 'components/interfaces/Settings/Logs'
import { Dispatch, SetStateAction, useState } from 'react'
import { LogsEndpointParams, Logs, LogData } from 'components/interfaces/Settings/Logs/Logs.types'
import { API_URL } from 'lib/constants'
import useSWR from 'swr'
import { get } from 'lib/common/fetch'
interface Data {
  params: LogsEndpointParams
  isLoading: boolean
  logData: LogData[]
  error: string | Object | null
}
interface Handlers {
  changeQuery: (newQuery?: string) => void
  runQuery: () => void
  setParams: Dispatch<SetStateAction<LogsEndpointParams>>
}

const useLogsQuery = (
  projectRef: string,
  initialParams: Partial<LogsEndpointParams> = {}
): [Data, Handlers] => {
  const defaultHelper = getDefaultHelper(EXPLORER_DATEPICKER_HELPERS)
  const [params, setParams] = useState<LogsEndpointParams>({
    project: projectRef,
    sql: '',
    iso_timestamp_start: defaultHelper.calcFrom(),
    iso_timestamp_end: defaultHelper.calcTo(),
    ...initialParams,
  })

  const queryParams = genQueryParams(params as any)
  const {
    data,
    error: swrError,
    isValidating: isLoading,
    mutate,
  } = useSWR<Logs>(
    params.sql
      ? `${API_URL}/projects/${projectRef}/analytics/endpoints/logs.all?${queryParams}`
      : null,
    get,
    { revalidateOnFocus: false }
  )
  let error: null | string | object = swrError ? swrError.message : null

  if (!error && data?.error) {
    error = data?.error
  }
  const changeQuery = (newQuery = '') => {
    setParams((prev) => ({ ...prev, sql: newQuery }))
  }

  return [
    { params, isLoading, logData: data?.result ? data?.result : [], error },
    { changeQuery, runQuery: () => mutate(), setParams },
  ]
}
export default useLogsQuery
