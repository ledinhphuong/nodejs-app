import sinon from 'sinon'
import Kobiton from '../../src/kobiton.js'

describe('/src/session/kobiton.js', () => {
  before('', () => {})

  // Verify a static method
  describe('.isIos()', () => {})

  // Verify instance method
  describe('#findDevice()', () => {})

  // Verify a instance property
  describe('#deviceList', () => {})

  after(() => {})
})

//                                                                                           col100
describe('/scr/session/kobiton.js', () => {
  // BAD
  it('should find devices', () => {})

  // GOOD
  it('find devices', () => {})

  // BAD
  sinon.assert(Kobiton.devices, 'Kobiton has an `devices` property')

  // GOOD
  sinon.assert(Kobiton.devices, 'Expected Kobiton to have an `devices` property')
})

//                                                                                           col100