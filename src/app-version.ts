// @ts-expect-error Cannot find module '~/src/app-version.json' or its corresponding type declarations
import appVersionJson from '~/src/app-version.json'

export const APP_VERSION = appVersionJson.version
