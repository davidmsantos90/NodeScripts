## Download, extract and costumize your Pentaho build!

You must define the **path** option for this script to run.
This can be done by passing the **-p** option when running 'setup-builds' or
by adding the file **local.config.json** with that option defined.

#### 1 Options:
  - -h, --help: Help                                                  
  - -d, --debug: Debug mode, only logs information                     
  - -e, --execution: Which execution to run: [server, pdi]                 
  - -t, --type: Build type to setup: [snapshot, qat, release]         
  - -v, --version: Build version to setup: [8.2.0.0, 9.0.0.0, ...]       
  - -b, --build: Build number to setup: [1, 2, ..., 30, ...]           
  - -p, --path: Full path to the directory where to setup all builds.
  - -l, --link: Base url to download builds to setup.

#### 2. Installing
  - Run `npm install` and `npm link` on the repository root folder

#### 3. Execute
  - From any location type `setup-utils [options]`
