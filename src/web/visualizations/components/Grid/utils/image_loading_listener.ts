/**
 * Invokes callback once all passed images are either loaded or errored out while loading
 */
export const imageLoadingListener = (
  imageElements: HTMLImageElement[],
  callback: () => void
) => {
  if (callback && imageElements && imageElements.length) {
    const countTotal = imageElements.length
    let countCompleted = 0
    const onComplete = () => {
      if (++countCompleted === countTotal) {
        imageElements.forEach(image => {
          image.removeEventListener('load', onComplete)
          image.removeEventListener('error', onComplete)
        })

        callback()
      }
    }
    imageElements.forEach(image => {
      image.addEventListener('load', onComplete)
      image.addEventListener('error', onComplete)
    })
  }
}
