const SNAPSHOT = 'snapshot'
const RELEASE = 'release'
const QAT = 'qat'

const isEqual = (type = '', actual = '') => actual.toLowerCase() === type

export const isSnapshot = (type) => isEqual(SNAPSHOT, type)
export const isRelease = (type) => isEqual(RELEASE, type)
export const isQat = (type) => isEqual(QAT, type)
