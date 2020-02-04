export const generateGUID = () => {
  const p8 = (s = false) => {
    const p = (Math.random().toString(16) + '000000000').substr(2, 8)
    if (s) {
      return '-' + p.substr(0, 4) + '-' + p.substr(4, 4)
    } else {
      return p
    }
  }
  return p8() + p8(true) + p8(true) + p8()
}
