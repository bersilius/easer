import cli from './cli'
import pdms from 'npac-pdms-hemera-adapter'
import { wsServer, wsPdmsGw } from 'npac-wsgw-adapters'
import webServer from 'npac-webserver-adapter/'
import { addLogger, makeConfig, mergeConfig, start as npacStart } from 'npac'
import _ from 'lodash'
import appDefaults from './config'
import { defaultApi } from './defaultApi'

export const startApp = (argv = process.argv, cb = null) => {
    const defaults = _.merge({}, appDefaults, webServer.defaults, pdms.defaults, wsServer.defaults, wsPdmsGw.defaults)

    // Use CLI to gain additional parameters, and command to execute
    const { cliConfig /*, command*/ } = cli.parse(defaults, argv)

    // Create the final configuration parameter set
    const config = makeConfig(defaults, cliConfig, 'configFileName')

    console.log('CONFIG: ', JSON.stringify(config, null, 2))
    console.log('CWD: ', process.cwd())
    if (process.cwd() === config.webServer.restApiPath) {
        // The given restApiPath is the current working directory, so use the default-api instead
        config.webServer.restApiPath = defaultApi
    }

    // Define the adapters, executives and terminators to add to the container
    let appAdapters = []
    let appTerminators = []
    if (config.webServer.usePdms) {
        appAdapters = [
            mergeConfig(config),
            addLogger,
            pdms.startup,
            webServer.startup,
            wsServer.startup,
            wsPdmsGw.startup
        ]

        appTerminators = [wsPdmsGw.shutdown, wsServer.shutdown, webServer.shutdown, pdms.shutdown]
    } else {
        appAdapters = [mergeConfig(config), addLogger, webServer.startup, wsServer.startup]
        appTerminators = [wsServer.shutdown, webServer.shutdown]
    }

    // Define the jobs to execute: hand over the command got by the CLI.
    const jobs = []

    //Start the container
    npacStart(appAdapters, jobs, appTerminators, cb)
}
