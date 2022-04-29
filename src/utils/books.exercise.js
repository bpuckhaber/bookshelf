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
    queryFn: () =>
      client(`books/${bookId}`, {token: user.token}).then(data => data.book),
  })
  const book = data ?? loadingBook

  return {book}
}

function getBookSearchConfig(user, query) {
  return {
    queryKey: ['bookSearch', {query}],
    queryFn: () =>
      client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
    config: {
      onSuccess(books) {
        for (const book of books) {
          setQueryDataForBook(book)
        }
      },
    },
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

export async function setQueryDataForBook(book) {
  queryCache.setQueryData(['book', {bookId: book.id}], book)
}
