import { access, constants } from 'fs'

import { bold, italic, blue } from 'chalk'

import {
  Download, Extract, Cleanup
} from '../actions/index'

import {
  ProgressBar, Text
} from '../components/index'

import SetupModel from './model/index'
import SetupView from './view'

export default class SetupController {
  constructor ({ logger }) {
    this._logger = logger

    this._model = new SetupModel()
    this._view = new SetupView()
  }

  get view () {
    return this._view
  }

  get model () {
    return this._model
  }

  get logger () {
    return this._logger
  }

  exists (path = '') {
    return new Promise((resolve) => {
      access(path, constants.F_OK, (error) => {
        const exists = error == null

        return resolve(exists)
      })
    })
  }

  isValid (date = '') {
    return !this.model.config.isSnapshot || this.model.isLatestBuild(date)
  }

  async execute () {
    this.logger.info('\n### setup-build finished executing ###\n')

    try {
      await this._download()
      await this._extract()
      await this._cleanup()
    } catch (ex) {
      this.logger.error(ex.message)
    }

    this.dispose()
  }

  dispose () {
    this.logger.info('\n### setup-build finished executing ###\n')

    this.view.dispose()
    this.logger.dispose()
    process.exit()
  }

  async _download () {
    this.logger.info('\n\nStarting setup-build download!')

    return this.__executeAll({
      Action: Download,
      title: blue(bold(`1. Downloading to ${italic(this.model.caption)}`)),

      Component: ProgressBar
    })
  }

  async _extract () {
    this.logger.info('\n\nStarting setup-build extract!')

    this.view.register(new Text({ id: 'white-space-1', text: '' }))

    return this.__executeAll({
      Action: Extract,
      title: blue(bold(`2. Extracting to ${italic(this.model.caption)}`)),

      Component: Text
    })
  }

  async _cleanup () {
    this.logger.info('\n\nStarting setup-build cleanup!')

    this.view.register(new Text({ id: 'white-space-2', text: '' }))

    return this.__executeAll({
      Action: Cleanup,
      title: blue(bold(`3. Cleaning up ${italic(this.model.caption)}`)),

      Component: Text,
      filter: ({ isPlugin }) => !isPlugin
    })
  }

  async __executeAll ({
    Action, filter = (i) => i, ...props
  }) {
    const artifactList = this.model.artifactList.filter(filter)

    if (!artifactList.length) throw new Error('empty artifact list!')

    const sectionId = this.__registerSection({ ...props, Action, artifactList })

    const actionList = artifactList.map((artifact) => {
      const action = new Action(artifact, this)

      action.on('update', (data = {}) => action.component.update(data))
      action.on('cancel', (data = {}) => action.component.cancel(data))
      action.on('error', (data = {}) => action.component.reject(data))
      action.on('done', (data = {}) => action.component.done(data))

      return action
    })

    const section = this.view.get(sectionId)

    try {
      section.init({})

      /* const results = */await Promise.all(actionList.map((action) => action.act()))

      // for (const { error } of results) {
      //   if (error != null) throw error
      // }

      section.done()
    } catch (exception) {
      section.reject(exception)
    }
  }

  __registerSection ({ Action, Component, title, artifactList }) {
    const section = new Text({
      id: `${Action._type()}-section`,
      text: title,
      autoStyle: false
    })
    this.view.register(section)

    for (const artifact of artifactList) {
      const component = new Component({
        ...artifact, id: `${Action._type()}-${artifact.id}`
      })

      this.view.register(component)
    }

    return section.id
  }
}
