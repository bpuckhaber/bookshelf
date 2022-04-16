import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from 'utils/api-client'

export function useListItems(user) {
  const {data: listItems} = useQuery({
    queryKey: ['list-items'],
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => data.listItems),
  })

  return {listItems}
}

export function useListItem(user, bookId) {
  const {listItems} = useListItems(user)
  const listItem = listItems?.find(item => item.bookId === bookId) ?? null
  return {listItem}
}

export function useUpdateListItem(user) {
  return useMutation(
    data =>
      client(`list-items/${data.id}`, {
        method: 'PUT',
        data,
        token: user.token,
      }),
    {onSettled: () => queryCache.invalidateQueries('list-items')},
  )
}

export function useRemoveListItem(user) {
  return useMutation(
    data =>
      client(`list-items/${data.id}`, {
        method: 'DELETE',
        token: user.token,
      }),
    {onSettled: () => queryCache.invalidateQueries('list-items')},
  )
}

export function useCreateListItem(user) {
  return useMutation(data => client(`list-items`, {data, token: user.token}), {
    onSettled: () => queryCache.invalidateQueries('list-items'),
  })
}
