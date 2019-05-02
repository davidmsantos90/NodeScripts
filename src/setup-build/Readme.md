## Setup a `pentaho-server-ee` or `pdi-client-ee` build.

### Command line options
| *Option*  | *Alias* | *Type*  | Default Option | *Description*                                                      |
|-----------|---------|---------|----------------|--------------------------------------------------------------------|
| link      | l       | string  | No             | Builds base download url.                                          |
| path      | p       | string  | No             | Base path where to setup all builds.<br>(must be an absolute path) |
| execution | e       | string  | Yes            | Select which build to setup:<br>-server, pdi                       |
| type      | t       | string  | No             | Select build type:<br>- snapshot, qat, release                     |
| build     | b       | string  | No             | Select build number:<br>(1, 2, ..., 30, ...)                       |
| version   | v       | string  | No             | Select build version:<br>(8.2.0.0, 9.0.0.0, ...)                   |
| help      | h       | boolean | No             | Shows help information.                                            |
| debug     | d       | boolean | No             | Enables debug logging.                                             |

### Local `setup-build` configuration

To avoid always having to declare the same `setup-build` option or simply to define option's default values:
 - Create a file named **local.config.json** in this folder.
   <br>(Do this before running `npm link`)
 - Each property must match this script options.
   <br>(the rest will be ignored)

 - **Note:** `path` option is always required by `setup-build`
 - **Note:** create the folder `./src/libs` and copy `org.apache.karaf.jaas.modules-3.0.9.jar` inside
             in order to complete the setup of a `pentaho-server-ee` build

   ```
    Example:
     {
       ...

       "path": "/home/user/builds",
       "link": "http://build.pentaho.com/hosted",

       "version": "8.3.0.0",
       "type": "snapshot"

       ...
     }
   ```
