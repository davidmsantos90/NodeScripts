import { bold, magenta, cyan, yellow, red, green } from 'chalk'

export const TAGS = {
  arrow: (extra = '') => `>${extra}`,
  time: () => {
    const isoDate = new Date().toISOString()
    const timestamp = isoDate.replace(/T/, ' ').replace(/\..+/, '')

    return `${TAGS.arrow(' ' + timestamp)} - `
  }
}

const noColor = (text = '') => text

export default (type = 'arrow') => {
  const { [type]: tag = TAGS.arrow } = TAGS

  return {
    log: {
      tag: tag(), color: noColor
    },
    debug: {
      tag: bold(tag()), color: magenta
    },
    info: {
      tag: bold(tag()), color: cyan
    },
    warn: {
      tag: bold(tag()), color: yellow
    },
    error: {
      tag: bold(tag()), color: red
    },
    done: {
      tag: bold(tag()), color: green
    }
  }
}
