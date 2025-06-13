import { useAuthStore } from '@/store'
import { useEffect } from 'react'
import { toast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const baseURL = import.meta.env.VITE_API_URL

export function useSseListener(
  sessionId: string,
  type: 'citizen' | 'commerce'
) {
  const navigate = useNavigate()
  const { setIsAuthenticated, setUserType } = useAuthStore()
  const { t } = useTranslation()

  useEffect(() => {
    if (!sessionId) return

    const sseUrl = `${baseURL}/events/${sessionId}`
    const eventSource = new EventSource(sseUrl)

    eventSource.onopen = () => console.info('SSE Connection Opened')

    eventSource.onerror = (error) => {
      console.error('SSE Connection Error:', error)
      eventSource.close()
    }

    eventSource.addEventListener('unknown_id', (event) => {
      console.error('unknown_id recibido:', (event as MessageEvent).data)
      eventSource.close()
    })

    eventSource.addEventListener('did_received', (event) => {
      const eventData = (event as MessageEvent).data
      sessionStorage.setItem('session_id', eventData)
      setUserType(type)
      setIsAuthenticated(true)
      eventSource.close()

      toast({
        description: t('login.success.title'),
        variant: 'success',
      })

      const toRoute =
        type === 'citizen' ? '/citizen-dashboard' : '/commerce-dashboard'

      navigate(toRoute, { replace: true })
    })

    return () => {
      eventSource.close()
      console.info('SSE Connection Closed')
    }
  }, [sessionId, type])
}
