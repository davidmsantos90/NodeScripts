## Start, stop and restart a `pentaho-server` build.

### Command line options
| *Option* | *Alias* | *Type*   | Default Option | *Description*                                             |
|----------|---------|----------|----------------|-----------------------------------------------------------|
| action   | a       | string   | Yes            | Select an `action` to execute:<br>- start, stop, restart. |
| tail     | t       | boolean  | No             | Tail `cataliga.out` log file.                             |
| help     | h       | boolean  | No             | Shows help information.                                   |
| debug    | d       | boolean  | No             | Enables debug logging.                                    |

### Local `pentaho-server` configuration

To avoid always having to declare the same `pentaho-server` option or simply to define option's default values:
 - Create a file named **local.config.json** in this folder.
   <br>(Do this before running `npm link`)
 - Each property must match this script options.
   <br>(the rest will be ignored)

```
Example:
 {
   ...

   "action": "restart"

   ...
 }
```
