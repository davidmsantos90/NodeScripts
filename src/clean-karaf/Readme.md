# Clean Karaf Packages Script

### 1. Options:
  - **--mode**(*alias -m*): Choose between moving or restoring packages.
    - Default: 'stored'. Values: ['store', 'restore']

  - **--packages**(*alias -p*):  Select karaf packages to manipulate.
    - **Script default option**. Values: check 'karafPackages.json'

  - **--all**(*alias -A*):       Select all available karaf packages.

  - **--root**(*alias -r*):      Define different root path for script.

  - **--output**(*alias -o*):    Where packages will be stored.
    - Default: *current folder*

  - **--help**(*alias -h*):      Displays the help documentation

### 2. Installing
  - Run `npm install` and `npm link` on the repository root folder

### 3. Execute
  - From any location type `clean-karaf [options]`


