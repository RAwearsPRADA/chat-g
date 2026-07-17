import { renderHook, act } from '@testing-library/react'
import { useNotification } from '../../features/notification/useNotification'

// Мокаем Audio конструктор
const mockPlay = jest.fn().mockResolvedValue(undefined)
const mockPause = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  
  global.Audio = jest.fn().mockImplementation(() => ({
    play: mockPlay,
    pause: mockPause,
    volume: 0.3,
    preload: 'auto',
    currentTime: 0
  }))
})

describe('useNotification', () => {
  test('возвращает play и isUnlocked', () => {
    const { result } = renderHook(() => useNotification())
    
    expect(result.current.play).toBeDefined()
    expect(result.current.isUnlocked).toBe(false)
  })

  test('play() не играет, если не разблокировано', () => {
    const { result } = renderHook(() => useNotification())
    
    act(() => {
      result.current.play()
    })
    
    expect(mockPlay).not.toHaveBeenCalled()
  })

  test('play() играет после разблокировки', async () => {
    const { result } = renderHook(() => useNotification())
    
    // Симулируем клик для разблокировки
    await act(async () => {
      window.dispatchEvent(new MouseEvent('click'))
      // Даём времени на async unlock
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    
    // Теперь играем
    act(() => {
      result.current.play()
    })
    
    expect(mockPlay).toHaveBeenCalled()
  })

  test('play() не играет, если enabled = false', () => {
    const { result } = renderHook(() => useNotification(false))
    
    act(() => {
      result.current.play()
    })
    
    expect(mockPlay).not.toHaveBeenCalled()
  })

  test('разблокировка происходит по клику', async () => {
    const { result } = renderHook(() => useNotification())
    
    // До клика — заблокировано
    expect(result.current.isUnlocked).toBe(false)
    
    // Клик
    await act(async () => {
      window.dispatchEvent(new MouseEvent('click'))
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    
    // После клика — разблокировано
    expect(result.current.isUnlocked).toBe(true)
  })

  test('разблокировка происходит по нажатию клавиши', async () => {
    const { result } = renderHook(() => useNotification())
    
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    
    expect(result.current.isUnlocked).toBe(true)
  })
})