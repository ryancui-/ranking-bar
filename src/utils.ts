const isPlainObject = o => !!o && o.constructor === Object

// Just deal with types exist in Options
function deepMerge(target: Object, source: Object): Object {
  const result = {}

  Object.keys(target).filter(_ => target.hasOwnProperty(_)).forEach(targetKey => {
    if (isPlainObject(target[targetKey])) {
      result[targetKey] = deepMerge(target[targetKey], source && source[targetKey])
    } else {
      result[targetKey] = (source && source[targetKey]) || target[targetKey]
    }
  })

  return result
}

export {
  deepMerge
}
