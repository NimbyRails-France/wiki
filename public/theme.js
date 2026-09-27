// Runs before first paint. Storage is optional (private browsing, blocked storage).
;(() => {
  let theme = 'dark'
  try {
    const saved = localStorage.getItem('nrf-wiki-theme')
    if (saved === 'light' || saved === 'dark') theme = saved
  } catch {}
  document.documentElement.dataset.theme = theme
})()
