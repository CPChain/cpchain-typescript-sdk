import utils from '../src/utils'
import { expect } from 'chai'
import { describe, it } from 'mocha'

describe('Utils', () => {
  it('formatCPC', () => {
    const result = utils.formatCPC(1)
    expect(result).to.be.a('string')
  })

  it('parseCPC', () => {
    const result = utils.parseCPC('1')
    expect(result).to.be.a('object')
  })
})
