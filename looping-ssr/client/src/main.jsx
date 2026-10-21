import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'

const el = document.getElementById('app')
let page = null

if (el && el.dataset && el.dataset.page) {
  try {
    page = JSON.parse(el.dataset.page)
  } catch (e) {
    console.error('Failed to parse data-page attribute:', e)
  }
}

if (!page) {
  page = {
    component: 'Home',
    props: {
      meta: {
        title: 'Welcome to Looping',
        description: 'A fast, SEO-optimized Inertia setup.'
      }
    },
    url: window.location.pathname || '/',
    version: null
  }
}

createInertiaApp({
  page,
  resolve: name => {
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true })
    return pages[`./pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    if (el.hasChildNodes()) {
      hydrateRoot(el, <App {...props} />)
    } else {
      createRoot(el).render(<App {...props} />)
    }
  },
})
