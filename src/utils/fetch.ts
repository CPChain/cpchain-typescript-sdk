import { isNode, isDeno, isJsDom } from 'browser-or-node'
import crossFetch from 'cross-fetch'

export const xfetch = (() => {
  if (isNode || isDeno || isJsDom) {
    return crossFetch
  }
  return fetch
})()
