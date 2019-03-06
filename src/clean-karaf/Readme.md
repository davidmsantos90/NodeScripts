## Activate or store `karaf bundles` from a `pentaho-server` or `pdi-client` build.

### Command line options
| *Option* | *Alias* | *Type*   | Default Option | *Description*                                                                      |
|----------|---------|----------|----------------|------------------------------------------------------------------------------------|
| bundles  | b       | [string] | Yes            | List of karaf bundles to: <br>- activate, store.                                   |
| root     | r       | string   | No             | Define a different root path for script.<br>(can be relative to current directory) |
| output   | o       | string   | No             | Location to store karaf bundles.                                                   |
| activate | a       | boolean  | No             | Switch execution to activate instead of storing bundles.                           |
| help     | h       | boolean  | No             | Shows help information.                                                            |
| debug    | d       | boolean  | No             | Enables debug logging.                                                             |

### Local `clean-karaf` configuration

To avoid always having to declare the same `clean-karaf` option or simply to define option's default values:
 - Create a file named **local.config.json** in this folder.
   <br>(Do this before running `npm link`)
 - Each property must match this script options.
   <br>(the rest will be ignored)

 - **Note:** Must define `karafBundles` property to configure your bundles locations
   ```
    Example:
     {
       ...
       "karafBundles": {
         ...
         "common-ui": {
           "folders": [ // folders relative to 'karaf/system/'
             "pentaho/common-ui/",
             "org/pentaho/common-ui-client-config/",
             "org/pentaho/common-ui-impl-client-config-folder-enabler/"
           ]
         }
         ...
       }
       ...
     }
   ```
