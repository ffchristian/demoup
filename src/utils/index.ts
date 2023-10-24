export const populateObj = (src: any, toPopulate: any): void => {
  if (src !== undefined && src !== null) {
    for (const key of Object.keys(src)) {
      (toPopulate)[key] = src[key]
    }
  }
}
