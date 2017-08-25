#! /usr/bin/env node

// Lib dependencies
const fileSys          = require( 'fs' );
const pathUtil         = require( 'path' );
const shell            = require( 'shelljs' );

// Resources
const karafPackages    = require( './karafPackages' );
const cmdLineArguments = require( './cmdArguments' );

const log = ( message ) => {
	console.log( message );
}

// activate vs deactivate
const CleanKaraf = () => {
  const options = cmdLineArguments.options;

  const rootPath = options.root || shell.pwd().toString();
  const karafPath = pathUtil.join( rootPath, 'system/karaf/system/' );
  const outputPath = pathUtil.join( karafPath, options.output );
  const cachePath = pathUtil.join( karafPath, '../caches/' );

  return {
  	__packagesInfo: karafPackages,

  	_options: options,
  	get options() { return this._options; },

  	_help: cmdLineArguments.help,
  	get help() { return this._help; },

    _karafPath: karafPath,
    get karafPath() { return this._karafPath; },

    _outputPath: outputPath,
    get outputPath() { return this._outputPath; },

    _cachePath: cachePath,
    get cachePath() { return this._cachePath; },

    _packages: null,
    set packages( _ = [] ) { this._packages = _; },
    get packages() { return this._packages; },

  	get isStoreMode() { return this.options.mode === "store"; },

    get isRestoreMode() { return this.options.mode !== "store"; },

    // ----

    getPackage( id ) {
      const { [id]: package = {} } = this.__packagesInfo;
      return package;
    },

    getPackagePath( id ) {
      const { path: packagePath } = this.getPackage( id );
      return packagePath;
    },

    getPackageKarafPath( id ) {
      const { path: packagePath } = this.getPackage( id );
      if ( packagePath == null ) return "";

      return pathUtil.join( this.karafPath, packagePath );
    },

    getPackageOutputPath( id ) {
      const { path: packagePath } = this.getPackage( id );
      if ( packagePath == null ) return "";

      return pathUtil.join( this.outputPath, packagePath );
    },

    isPackageActive( id ) {
      const packageKarafPath = this.getPackageKarafPath( id );
      return fileSys.existsSync( packageKarafPath );
    },

  	isPackageStored( id ) {
      const packageOutputPath = this.getPackageOutputPath( id );
  		return fileSys.existsSync( packageOutputPath );
  	},

  	clearCache() {
  		if ( fileSys.existsSync( this.cachePath ) ) {
  			shell.rm( '-rf', this.cachePath );
  			log( `Cache was deleted!` );
  		} else {
  			log( `No cache to deleted!` );
  		}
  	},

    restoreSelectedPackages() {
      log( `Preparing to restore packages:` );

      const storedPackages = this.packages.filter( package => {
        const isStored = this.isPackageStored( package );
        if ( !isStored ) log( ` - '${package}' can not be restored!` );
        return isStored;
      });

      for ( let packageID of storedPackages )
        this.restorePackage( packageID );

      return storedPackages;
    },

    restorePackage( id ) {
      if ( this.isPackageActive( id ) )
        return log( ` - '${id}' already activated!` )

      let origin = this.getPackageOutputPath( id );
      let dest = pathUtil.join( this.getPackageKarafPath( id ), '../' );
      
      shell.mkdir( '-p', dest );
      shell.mv( origin, dest );

      log( ` - '${id}' was restored!`);
    },

  	storeSelectedPackages() {
      log( `Preparing to store packages:` );

      const activePackages = this.packages.filter( package => {
        const isActive = this.isPackageActive( package );
        if ( !isActive ) log( ` - '${package}' can not be stored!` );
        return isActive;
      });

  		for ( let packageID of activePackages )
  			this.storePackage( packageID );

      return activePackages;
  	},

    storePackage( id ) {
      if ( this.isPackageStored( id ) )
        return log( ` - '${id}' already stored!` )

      let origin = this.getPackageKarafPath( id );
      let dest = pathUtil.join( this.getPackageOutputPath( id ), '../' );

      shell.mkdir( '-p', dest );
      shell.mv( origin, dest );

      log( ` - '${id}' was stored!`);
    },
 
    // main
  	execute() {
  		if ( this.options.help )
  			return log( this.help );

      if ( options.all ) this.packages = Object.keys( karafPackages );
      else packages = this.packages = options.packages;

      this.clearCache();

      if ( !this.packages.length ) return;

  		if ( this.isStoreMode )
  			this.storeSelectedPackages();

      if ( this.isRestoreMode )
        this.restoreSelectedPackages();
  	}

	};

} // End of CleanKaraf


// -----

const karafCleaner = CleanKaraf();
karafCleaner.execute();
