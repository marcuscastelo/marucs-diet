// @refresh reload
import { Routes } from '@solidjs/router'
import { type JSXElement, Suspense } from 'solid-js'
import { Body, FileRoutes, Head, Html, Meta, Scripts, Title } from 'solid-start'
import { ErrorBoundary } from 'solid-start/error-boundary'
import '~/assets/styles/globals.css'
import { ConfirmModal } from '~/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '~/sections/common/context/ConfirmModalContext'
import { Congratulate } from '~/sections/congratulate/components/Congratulate'

export default function Root() {
  return (
    <Html lang="en" class="dark">
      <Head>
        <Title>SolidStart - With Vitest</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Providers>
          <Congratulate />
          <Suspense>
            <ErrorBoundary>
              <Routes>
                <FileRoutes />
              </Routes>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </Providers>
      </Body>
    </Html>
  )
}

function Providers(props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      {props.children}
    </ConfirmModalProvider>
  )
}
