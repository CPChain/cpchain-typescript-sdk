
export type ListResults<T> = {
  count: number
  limit: number
  page: number
  results: Array<T>
}
