import _ from 'lodash'
import DecimalJS from 'decimal.js'

export let Decimal = DecimalJS.clone({ precision: 80 })

export function getTruffleArgsFromOptions(argNames, opts) {
    opts = opts || {}

    return argNames.map((argName) => {
        if(!_.has(opts, argName)) {
            throw new Error(`missing argument ${argName}`)
        }
        let arg = opts[argName]
        if(_.has(arg, 'address')) {
            arg = arg.address
        }
        return arg
    })
}

export function requireEventFromTXResult(result, eventName) {
    let matchingLogs = _.filter(result.logs, (l) => l.event === eventName)

    if(matchingLogs.length < 1) {
        throw new Error(`could not find any logs in result ${result} corresponding to event ${eventName}`)
    } else if(matchingLogs.length > 1) {
        throw new Error(`found too many logs in result ${result} corresponding to event ${eventName}`)
    }

    return matchingLogs[0]
}

export async function sendTransactionAndGetResult(opts) {
    opts = opts || {}

    let factory = opts.factoryContract
    if(_.has(factory, 'deployed')) {
        factory = await factory.deployed()
    }

    let result = await factory[opts.methodName](...opts.methodArgs)
    let matchingLog = requireEventFromTXResult(result, opts.eventName)

    return await opts.resultContract.at(matchingLog.args[opts.eventArgName])
}