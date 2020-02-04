export const urlForDocsLink = (path: string = '') => {
  const url = new URL(`https://looker.com/docs/${path}`)
  const globals = window as any

  if (globals.slipstream && globals.slipstream.appState) {
    url.searchParams.set(
      'version',
      globals.slipstream.appState.versionForDocumentation
    )
  }

  return url.href
}
