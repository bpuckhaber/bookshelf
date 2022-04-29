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
  onError: (err, variables, recover) =>
    typeof recover === 'function' ? recover() : null,
  onSettled: () => {
    queryCache.invalidateQueries('list-items')
  },
}

export function useUpdateListItem(user, options) {
  return useMutation(
    data =>
      client(`list-items/${data.id}`, {
        method: 'PUT',
        data,
        token: user.token,
      }),
    {
      onMutate(newItem) {
        const previousItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.map(item => {
            return item.id === newItem.id ? {...item, ...newItem} : item
          })
        })

        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions,
      ...options,
    },
  )
}

export function useRemoveListItem(user, options) {
  return useMutation(
    data =>
      client(`list-items/${data.id}`, {
        method: 'DELETE',
        token: user.token,
      }),
    {
      onMutate(removedItem) {
        const previousItems = queryCache.getQueryData('list-items')

        queryCache.setQueryData('list-items', old => {
          return old.filter(item => item.id !== removedItem.id)
        })

        return () => queryCache.setQueryData('list-items', previousItems)
      },
      ...defaultMutationOptions,
      ...options,
    },
  )
}

export function useCreateListItem(user, options) {
  return useMutation(data => client(`list-items`, {data, token: user.token}), {
    ...defaultMutationOptions,
    ...options,
  })
}
