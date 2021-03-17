import {methodReturnValue, methodReturnBoolean} from '../../src/utils'

describe('../../src/utils', () => {
  test('methodReturnValue', () => {
    expect(methodReturnValue(1)).toEqual(1)
  })

  test('methodReturnBoolean', () => {
    expect(methodReturnBoolean()).not.toBeTruthy()
  })
})
