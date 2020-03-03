const SERVER = 'server'
const PDI = 'pdi'
const ALL = 'all'

const COMMUNITY = '-ce'

const communityExec = (exec = ALL) => exec + COMMUNITY
const isEqual = (exec = '', actual = '') => actual.toLowerCase() === exec
const isExecution = (exec, actual) => isEqual(exec, actual) || isEqual(communityExec(exec), actual)

export const isServer = (exec) => isExecution(ALL, exec) || isExecution(SERVER, exec)
export const isPdi = (exec) => isExecution(ALL, exec) || isExecution(PDI, exec)

export const isEnterprise = (exec = '') => !exec.endsWith(COMMUNITY)
