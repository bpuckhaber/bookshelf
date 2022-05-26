import {formatDate} from '../misc'

test('formatDate formats the date to look nice', () => {
  expect(formatDate(new Date([2022, 5, 1]))).toBe('May 22')
})
