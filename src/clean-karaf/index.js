#! /usr/bin/env node

import { existsSync } from 'fs'
import { join } from 'path'

import { rm, mv, mkdir, pwd } from 'shelljs'

import { options, help } from './karaf.arguments'
import karafServicesInfo from './karaf.services'

const log = (message) => {
  console.log(message)
}

const CleanKaraf = () => {
  const rootPath = options.root || pwd().toString()
  const karafPath = join(rootPath, 'system/karaf/system/')
  const outputPath = join(karafPath, options.output)
  const cachePath = join(karafPath, '../caches/')

  return {
  	__servicesInfo: karafServicesInfo,

  	_options: options,
  	get options () {
      return this._options
    },

  	_help: help,
  	get help () {
      return this._help
    },

    _karafPath: karafPath,
    get karafPath () {
      return this._karafPath
    },

    _outputPath: outputPath,
    get outputPath () {
      return this._outputPath
    },

    _cachePath: cachePath,
    get cachePath () {
      return this._cachePath
    },

    _services: null,
    set services (value = []) {
      this._services = value
    },
    get services () {
      return this._services
    },

  	get isStoreMode () {
      return this.options.mode === 'store'
    },

    get isRestoreMode () {
      return !this.isStoreMode
    },

    // ----

    getService (id) {
      const { [id]: service = {} } = this.__servicesInfo

      return service
    },

    getServicePath (id) {
      const { path: servicePath } = this.getService(id)

      return servicePath
    },

    getServiceKarafPath (id) {
      const { path: servicePath } = this.getService(id)
      if (servicePath == null) {
        return ''
      }

      return join(this.karafPath, servicePath)
    },

    getServiceOutputPath (id) {
      const { path: servicePath } = this.getService(id)
      if (servicePath == null) {
        return ''
      }

      return join(this.outputPath, servicePath)
    },

    isServiceActive (id) {
      const serviceKarafPath = this.getServiceKarafPath(id)

      return existsSync(serviceKarafPath)
    },

  	isServiceStored (id) {
      const serviceOutputPath = this.getServiceOutputPath(id)

      return existsSync(serviceOutputPath)
  	},

  	clearCache () {
  		if (existsSync(this.cachePath)) {
  			rm('-rf', this.cachePath)
  			log(`Cache was deleted!`)
  		} else {
  			log(`No cache to deleted!`)
  		}
  	},

    restoreSelectedServices () {
      log(`Preparing to restore services:`)

      const storedServices = this.services.filter((service) => {
        const isStored = this.isServiceStored(service)
        if (!isStored) {
          log(` - '${service}' can not be restored!`)
        }

        return isStored
      })

      for (let serviceID of storedServices) {
        this.restoreService(serviceID)
      }

      return storedServices
    },

    restoreService (id) {
      if (this.isServiceActive(id)) {
        return log(` - '${id}' already activated!`)
      }

      let origin = this.getServiceOutputPath(id)
      let dest = join(this.getServiceKarafPath(id), '../')

      mkdir('-p', dest)
      mv(origin, dest)

      log(` - '${id}' was restored!`)
    },

  	storeSelectedServices () {
      log(`Preparing to store services:`)

      const activeServices = this.services.filter((service) => {
        const isActive = this.isServiceActive(service)
        if (!isActive) {
          log(` - '${service}' can not be stored!`)
        }

        return isActive
      })

  		for (let serviceID of activeServices) {
        this.storeService(serviceID)
      }

      return activeServices
  	},

    storeService (id) {
      if (this.isServiceStored(id)) {
        return log(` - '${id}' already stored!`)
      }

      let origin = this.getServiceKarafPath(id)
      let dest = join(this.getServiceOutputPath(id), '../')

      mkdir('-p', dest)
      mv(origin, dest)

      log(` - '${id}' was stored!`)
    },

    // main
  	execute () {
  		if (this.options.help) {
        return log(this.help)
      }

      const isAllServicesOption = options.all
      if (isAllServicesOption) {
        this.services = Object.keys(this.__servicesInfo)
      } else {
        this.services = options.services
      }

      this.clearCache()

      if (!this.services.length) {
        return
      }

  		if (this.isStoreMode) {
        this.storeSelectedServices()
      }

      if (this.isRestoreMode) {
        this.restoreSelectedServices()
      }
  	}

  }
}

// -----

const karafCleaner = CleanKaraf()
karafCleaner.execute()
