
function _test(a, b = {}) {
  const finalB = {x: 1, ...b}
  console.log(`a = ${JSON.stringify(a)}`)
  console.log(`b = ${JSON.stringify(b)}`)
  console.log(`finalB = ${JSON.stringify(finalB)}`)

  // const c = {}
  // const {x = 1, y = 2} = c
  // console.log(`x = ${x}, y = ${y}`)
}

_test({a: 1})
_test({a: 1}, null)
_test({a: 1}, undefined)
