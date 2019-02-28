import { options, help } from './arguments'

const PentahoServerUtils = ({
  help: _isHelp, debug: _isDebugMode, tail: _isTailMode, action: _action
}) => ({
  get isDebugMode () {
    return _isDebugMode
  },

  get isHelp () {
    return _isHelp
  },

  get help () {
    return help
  },

  get isTailMode () {
    return _isTailMode
  },

  get isRestart () {
    return _action === 'restart'
  },

  get isStop () {
    return _action === 'stop'
  },

  get isStart () {
    return _action === 'start'
  }
})

export default PentahoServerUtils(options)
