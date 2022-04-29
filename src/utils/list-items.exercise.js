import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from 'utils/api-client'
import {setQueryDataForBook} from 'utils/books'

export function useListItems(user) {
  const {data: listItems = []} = useQuery({
    queryKey: ['list-items'],
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => data.listItems),
    config: {
      onSuccess(listItems) {
        for (const listItem of listItems) {
          setQueryDataForBook(listItem.book)
        }
      },
    },
  })

  return {listItems}
}

export function useListItem(user, bookId) {
  const {listItems} = useListItems(user)
  const listItem = listItems?.find(item => item.bookId === bookId) ?? null
  return {listItem}
}

const defaultMutationOptions = {
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

export function useUpdateListItem(user, options) {
  return useMutation(
    data =>
      client(`list-items/${data.id}`, {
        method: 'PUT',
        data,
        token: user.token,
      }),
    {...defaultMutationOptions, ...options},
  )
}

export function useRemoveListItem(user, options) {
  return useMutation(
    data =>
      client(`list-items/${data.id}`, {
        method: 'DELETE',
        token: user.token,
      }),
    {...defaultMutationOptions, ...options},
  )
}

export function useCreateListItem(user, options) {
  return useMutation(data => client(`list-items`, {data, token: user.token}), {
    ...defaultMutationOptions,
    ...options,
  })
}
