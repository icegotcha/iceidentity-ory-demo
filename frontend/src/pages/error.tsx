import { FlowError } from '@ory/client'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import oryKratos from '@/utils/sdk/ory-kratos'

const ErrorPage = () => {
  const [error, setError] = useState<FlowError | string>()

  // Get ?id=... from the URL
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    // If the router is not ready yet, or we already have an error, do nothing.
    if (!router.isReady || error) {
      return
    }

    oryKratos
      .getFlowError({ id: String(id) })
      .then(({ data }) => {
        setError(data)
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 404:
          // The error id could not be found. Let's just redirect home!
          case 403:
          // The error id could not be fetched due to e.g. a CSRF issue. Let's just redirect home!
          case 410:
            // The error id expired. Let's just redirect home!
            return router.push('/')
        }

        return Promise.reject(err)
      })
  }, [id, router, router.isReady, error])

  if (!error) {
    return <></>
  }

  return (
    <>
      <p>An error occurred</p>
      <p>{JSON.stringify(error, null, 2)}</p>
    </>
  )
}

export default ErrorPage
