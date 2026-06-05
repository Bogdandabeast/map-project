import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, mock } from 'bun:test'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  it('renders with the correct placeholder', () => {
    const placeholder = 'Search projects...'
    render(<SearchBar value="" onChange={() => {}} placeholder={placeholder} />)

    const input = screen.getByPlaceholderText(placeholder)
    expect(input).toBeInTheDocument()
  })

  it('calls onChange when the input value changes', () => {
    const onChange = mock()
    const { container } = render(<SearchBar value="" onChange={onChange} />)

    const searchbar = container.querySelector('ion-searchbar')

    // IonSearchbar emits 'ionInput' event
    fireEvent(searchbar!, new CustomEvent('ionInput', {
      detail: { value: 'test search' },
    }))

    expect(onChange).toHaveBeenCalledWith('test search')
  })

  it('displays the current value', () => {
    const value = 'existing search'
    const { container } = render(<SearchBar value={value} onChange={() => {}} />)

    const searchbar = container.querySelector('ion-searchbar')
    expect(searchbar).toHaveAttribute('value', value)
  })
})
