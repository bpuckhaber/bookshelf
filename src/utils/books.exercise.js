import {useQuery, queryCache} from 'react-query'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'
import {client} from 'utils/api-client'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

export function useBook(user, bookId) {
  const {data} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: (key, {bookId}) => client(`books/${bookId}`, {token: user.token}),
  })
  const book = data?.book ?? loadingBook

  return {book}
}

function getBookSearchConfig(user, query) {
  return {
    queryKey: ['bookSearch', {query}],
    queryFn: () =>
      client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
  }
}

export function useBookSearch(user, query) {
  const {data, isLoading, isSuccess, isError, error} = useQuery(
    getBookSearchConfig(user, query),
  )

  const books = data ?? loadingBooks

  return {books, isLoading, isSuccess, isError, error}
}

export async function refetchBookSearchQuery(user) {
  queryCache.removeQueries('bookSearch')
  await queryCache.prefetchQuery(getBookSearchConfig(user, ''))
}
