import axios, { AxiosError } from 'axios'
import { NextRouter } from 'next/router'
import { Dispatch, SetStateAction } from 'react'
import { toast } from 'react-toastify'

const handleGetFlowError = <S>(
  router: NextRouter,
  flowType: 'login' | 'registration' | 'settings' | 'recovery' | 'verification',
  resetFlow: Dispatch<SetStateAction<S | undefined>>,
) => {
  return async (err: Error | AxiosError) => {
    if (axios.isAxiosError(err)) {
      switch (err.response?.data.error?.id) {
        case 'session_inactive':
          await router.push('/signin?return_to=' + window.location.href)
          return
        case 'session_aal2_required':
          if (err.response?.data.redirect_browser_to) {
            const redirectTo = new URL(err.response?.data.redirect_browser_to)
            if (flowType === 'settings') {
              redirectTo.searchParams.set('return_to', window.location.href)
            }
            window.location.href = redirectTo.toString()
            return
          }
          await router.push('/signin?aal=aal2&return_to=' + window.location.href)
          return
        case 'session_already_available':
          await router.push('/')
          return
        case 'session_refresh_required':
          window.location.href = err.response?.data.redirect_browser_to
          return
        case 'self_service_flow_return_to_forbidden':
          toast.error('The return_to address is not allowed.')
          resetFlow(undefined)
          await router.push('/' + flowType === 'login' ? 'signin' : flowType === 'registration' ? 'signup' : flowType)
          return
        case 'self_service_flow_expired':
          toast.error('Your interaction expired, please fill out the form again.')
          resetFlow(undefined)
          await router.push('/' + flowType === 'login' ? 'signin' : flowType === 'registration' ? 'signup' : flowType)
          return
        case 'security_csrf_violation':
          toast.error('A security violation was detected, please fill out the form again.')
          resetFlow(undefined)
          await router.push('/' + flowType === 'login' ? 'signin' : flowType === 'registration' ? 'signup' : flowType)
          return
        case 'security_identity_mismatch':
          resetFlow(undefined)
          await router.push('/' + flowType === 'login' ? 'signin' : flowType === 'registration' ? 'signup' : flowType)
          return
        case 'browser_location_change_required':
          window.location.href = err.response.data.redirect_browser_to
          return
      }

      switch (err.response?.status) {
        case 410:
          resetFlow(undefined)
          await router.push('/' + flowType === 'login' ? 'signin' : flowType === 'registration' ? 'signup' : flowType)
          return
      }
    }
    return Promise.reject(err)
  }
}

export default handleGetFlowError
