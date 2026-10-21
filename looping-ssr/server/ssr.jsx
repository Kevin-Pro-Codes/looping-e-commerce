import { createInertiaApp } from '@inertiajs/react'
import { renderToString } from 'react-dom/server'
import React from 'react'

export default function render(page) {
  return createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => {
      // In a real app, you'd use Vite's import.meta.glob here.
      // For this setup to work in Node directly, we'd need to transpile.
      // However, for demonstration, we'll point to the Home component.
      // In a production build, this would point to the bundled pages.
      return import(`../client/src/pages/${name}.jsx`)
    },
    setup: ({ App, props }) => <App {...props} />,
  })
}
