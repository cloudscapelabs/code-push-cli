﻿import yargs from 'yargs';
import * as cli from './definitions/cli';
import chalk from 'chalk';
// Disabled as latest update requires esm modules to be enabled
// import updateNotifier from 'update-notifier';
import parseDuration from 'parse-duration';

import backslash = require('backslash');

var packageJson = require('../package.json');
const ROLLOUT_PERCENTAGE_REGEX: RegExp = /^(100|[1-9][0-9]|[1-9])%?$/;
const USAGE_PREFIX = 'Usage: code-push';

// Command categories are:  access-key, app, release, deployment, deployment-key, login, logout, register
var isValidCommandCategory = false;
// Commands are the verb following the command category (e.g.:  "add" in "app add").
var isValidCommand = false;
var wasHelpShown = false;

export function showHelp(showRootDescription?: boolean): void {
    if (!wasHelpShown) {
        if (showRootDescription) {
            console.log(chalk.cyan('  _____        __  ' + chalk.green('  ___           __ ')));
            console.log(chalk.cyan(' / ___/__  ___/ /__' + chalk.green(' / _ \\__ _____ / / ')));
            console.log(chalk.cyan('/ /__/ _ \\/ _  / -_)' + chalk.green(' ___/ // (_-</ _ \\')));
            console.log(
                chalk.cyan('\\___/\\___/\\_,_/\\__/' + chalk.green('_/   \\_,_/___/_//_/')) +
                    '    CLI v' +
                    packageJson.version,
            );
            console.log(chalk.cyan('======================================'));
            console.log('');
            console.log(
                "Mobile Center CodePush is a service that enables you to deploy mobile app updates directly to your users' devices.\n",
            );
            updateCheck();
        }

        yargs.showHelp();
        wasHelpShown = true;
    }
}

function updateCheck(): void {
    // var notifier: updateNotifier.IResult = updateNotifier({ pkg: packageJson });
    // if (notifier.update) {
    //     notifier.notify();
    // }
}

function accessKeyAdd(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' access-key ' + commandName + ' <accessKeyName>')
        .demand(/*count*/ 1, /*max*/ 1) // Require exactly one non-option arguments
        .example(
            'access-key ' + commandName + ' "VSTS Integration"',
            'Creates a new access key with the name "VSTS Integration"',
        );
    //.example("access-key " + commandName + " \"One time key\" --ttl 5m", "Creates a new access key with the name \"One time key\", which expires in 5 minutes")
    //.option("ttl", { default: "60d", demand: false, description: "Duration string which specifies the amount of time that the access key should remain valid for (e.g 5m, 60d, 1y)", type: "string" });

    addCommonConfiguration(yargs);
}

function accessKeyPatch(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' access-key ' + commandName + ' <accessKeyName>')
        .demand(/*count*/ 1, /*max*/ 1) // Require exactly one non-option arguments
        .example(
            'access-key ' + commandName + ' "Key for build server" --name "Key for CI machine"',
            'Renames the access key named "Key for build server" to "Key for CI machine"',
        )
        .example(
            'access-key ' + commandName + ' "Key for build server" --ttl 7d',
            'Updates the access key named "Key for build server" to expire in 7 days',
        )
        .option('name', {
            default: null,
            demand: false,
            description: 'Display name for the access key',
            type: 'string',
        })
        .option('ttl', {
            default: null,
            demand: false,
            description:
                'Duration string which specifies the amount of time that the access key should remain valid for (e.g 5m, 60d, 1y)',
            type: 'string',
        });
    addCommonConfiguration(yargs);
}

function accessKeyList(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' access-key ' + commandName + ' [options]')
        .demand(/*count*/ 0, /*max*/ 0)
        .example('access-key ' + commandName, 'Lists your access keys in tabular format')
        .example(
            'access-key ' + commandName + ' --format json',
            'Lists your access keys in JSON format',
        )
        .option('format', {
            default: 'table',
            demand: false,
            description: 'Output format to display your access keys with ("json" or "table")',
            type: 'string',
        });

    addCommonConfiguration(yargs);
}

function accessKeyRemove(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' access-key ' + commandName + ' <accessKeyName>')
        .demand(/*count*/ 1, /*max*/ 1) // Require exactly one non-option arguments
        .example(
            'access-key ' + commandName + ' "VSTS Integration"',
            'Removes the "VSTS Integration" access key',
        );

    addCommonConfiguration(yargs);
}

function addCommonConfiguration(yargs: yargs.Argv): void {
    yargs
        .wrap(/*columnLimit*/ null)
        .string('_') // Interpret non-hyphenated arguments as strings (e.g. an app version of '1.10').
        // TODO: fix this
        // .strict() // Validate hyphenated (named) arguments.
        .fail((msg: string) => showHelp()); // Suppress the default error message.
}

function appList(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' app ' + commandName + ' [options]')
        .demand(/*count*/ 0, /*max*/ 0)
        .example('app ' + commandName, 'List your apps in tabular format')
        .example('app ' + commandName + ' --format json', 'List your apps in JSON format')
        .option('format', {
            default: 'table',
            demand: false,
            description: 'Output format to display your apps with ("json" or "table")',
            type: 'string',
        });

    addCommonConfiguration(yargs);
}

function appRemove(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' app ' + commandName + ' <appName>')
        .demand(/*count*/ 1, /*max*/ 1) // Require exactly one non-option arguments
        .example('app ' + commandName + ' MyApp', 'Removes app "MyApp"');

    addCommonConfiguration(yargs);
}

function listCollaborators(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' collaborator ' + commandName + ' <appName> [options]')
        .demand(/*count*/ 1, /*max*/ 1) // Require exactly one non-option arguments
        .example(
            'collaborator ' + commandName + ' MyApp',
            'Lists the collaborators for app "MyApp" in tabular format',
        )
        .example(
            'collaborator ' + commandName + ' MyApp --format json',
            'Lists the collaborators for app "MyApp" in JSON format',
        )
        .option('format', {
            default: 'table',
            demand: false,
            description: 'Output format to display collaborators with ("json" or "table")',
            type: 'string',
        });

    addCommonConfiguration(yargs);
}

function removeCollaborator(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' collaborator ' + commandName + ' <appName> <email>')
        .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
        .example(
            'collaborator ' + commandName + ' MyApp foo@bar.com',
            'Removes foo@bar.com as a collaborator from app "MyApp"',
        );

    addCommonConfiguration(yargs);
}

function deploymentHistoryClear(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' deployment ' + commandName + ' <appName> <deploymentName>')
        .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
        .example(
            'deployment ' + commandName + ' MyApp MyDeployment',
            'Clears the release history associated with deployment "MyDeployment" from app "MyApp"',
        );

    addCommonConfiguration(yargs);
}

function deploymentList(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' deployment ' + commandName + ' <appName> [options]')
        .demand(/*count*/ 1, /*max*/ 1) // Require exactly one non-option arguments
        .example(
            'deployment ' + commandName + ' MyApp',
            'Lists the deployments for app "MyApp" in tabular format',
        )
        .example(
            'deployment ' + commandName + ' MyApp --format json',
            'Lists the deployments for app "MyApp" in JSON format',
        )
        .option('format', {
            default: 'table',
            demand: false,
            description: 'Output format to display your deployments with ("json" or "table")',
            type: 'string',
        })
        .option('displayKeys', {
            alias: 'k',
            default: false,
            demand: false,
            description: 'Specifies whether to display the deployment keys',
            type: 'boolean',
        });
    addCommonConfiguration(yargs);
}

function deploymentRemove(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(USAGE_PREFIX + ' deployment ' + commandName + ' <appName> <deploymentName>')
        .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
        .example(
            'deployment ' + commandName + ' MyApp MyDeployment',
            'Removes deployment "MyDeployment" from app "MyApp"',
        );

    addCommonConfiguration(yargs);
}

function deploymentHistory(commandName: string, yargs: yargs.Argv): void {
    isValidCommand = true;
    yargs
        .usage(
            USAGE_PREFIX + ' deployment ' + commandName + ' <appName> <deploymentName> [options]',
        )
        .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
        .example(
            'deployment ' + commandName + ' MyApp MyDeployment',
            'Displays the release history for deployment "MyDeployment" from app "MyApp" in tabular format',
        )
        .example(
            'deployment ' + commandName + ' MyApp MyDeployment --format json',
            'Displays the release history for deployment "MyDeployment" from app "MyApp" in JSON format',
        )
        .option('format', {
            default: 'table',
            demand: false,
            description: 'Output format to display the release history with ("json" or "table")',
            type: 'string',
        })
        .option('displayAuthor', {
            alias: 'a',
            default: false,
            demand: false,
            description: 'Specifies whether to display the release author',
            type: 'boolean',
        });

    addCommonConfiguration(yargs);
}

var argv = yargs
    .usage(USAGE_PREFIX + ' <command>')
    .demand(/*count*/ 1, /*max*/ 1) // Require exactly one non-option argument.
    .command(
        'access-key',
        'View and manage the access keys associated with your account',
        (yargs: yargs.Argv) => {
            isValidCommandCategory = true;
            yargs
                .usage(USAGE_PREFIX + ' access-key <command>')
                .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments.
                .command(
                    'add',
                    'Create a new access key associated with your account',
                    (yargs: yargs.Argv) => accessKeyAdd('add', yargs),
                )
                // Mobile Center doesn't support renaming access keys or changing their TTL (which never expire), so we no longer support patch
                /*
            .command("patch", "Update the name and/or TTL of an existing access key", (yargs: yargs.Argv) => accessKeyPatch("patch", yargs))
            */
                .command('remove', 'Remove an existing access key', (yargs: yargs.Argv) =>
                    accessKeyRemove('remove', yargs),
                )
                .command('rm', 'Remove an existing access key', (yargs: yargs.Argv) =>
                    accessKeyRemove('rm', yargs),
                )
                .command(
                    'list',
                    'List the access keys associated with your account',
                    (yargs: yargs.Argv) => accessKeyList('list', yargs),
                )
                .command(
                    'ls',
                    'List the access keys associated with your account',
                    (yargs: yargs.Argv) => accessKeyList('ls', yargs),
                )
                .check((argv: any, aliases: { [aliases: string]: string }): any => isValidCommand); // Report unrecognized, non-hyphenated command category.

            addCommonConfiguration(yargs);
        },
    )
    .command('app', 'View and manage your CodePush apps', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        yargs
            .usage(USAGE_PREFIX + ' app <command>')
            .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments.
            .command('add', 'Add a new app to your account', (yargs: yargs.Argv): void => {
                isValidCommand = true;
                yargs
                    .usage(USAGE_PREFIX + ' app add <appName> <os> <platform>')
                    .demand(/*count*/ 3, /*max*/ 3) // Require exactly three non-option arguments
                    .example(
                        'app add MyApp ios react-native',
                        'Adds app "MyApp", indicating that it\'s an iOS React Native app',
                    )
                    .example(
                        'app add MyApp windows react-native',
                        'Adds app "MyApp", indicating that it\'s a Windows React Native app',
                    )
                    .example(
                        'app add MyApp android cordova',
                        'Adds app "MyApp", indicating that it\'s an Android Cordova app',
                    );

                addCommonConfiguration(yargs);
            })
            .command('remove', 'Remove an app from your account', (yargs: yargs.Argv) =>
                appRemove('remove', yargs),
            )
            .command('rm', 'Remove an app from your account', (yargs: yargs.Argv) =>
                appRemove('rm', yargs),
            )
            .command('rename', 'Rename an existing app', (yargs: yargs.Argv) => {
                isValidCommand = true;
                yargs
                    .usage(USAGE_PREFIX + ' app rename <currentAppName> <newAppName>')
                    .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
                    .example(
                        'app rename CurrentName NewName',
                        'Renames app "CurrentName" to "NewName"',
                    );

                addCommonConfiguration(yargs);
            })
            .command('list', 'Lists the apps associated with your account', (yargs: yargs.Argv) =>
                appList('list', yargs),
            )
            .command('ls', 'Lists the apps associated with your account', (yargs: yargs.Argv) =>
                appList('ls', yargs),
            )
            /*
            .command("transfer", "Transfer the ownership of an app to another account", (yargs: yargs.Argv) => {
                yargs.usage(USAGE_PREFIX + " app transfer <appName> <email>")
                    .demand(2, 2)  // Require exactly two non-option arguments
                    .example("app transfer MyApp foo@bar.com", "Transfers the ownership of app \"MyApp\" to an account with email \"foo@bar.com\"");

                addCommonConfiguration(yargs);
            })
            */
            .check((argv: any, aliases: { [aliases: string]: string }): any => isValidCommand); // Report unrecognized, non-hyphenated command category.

        addCommonConfiguration(yargs);
    })
    .command('collaborator', 'View and manage app collaborators', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        yargs
            .usage(USAGE_PREFIX + ' collaborator <command>')
            .demand(2, 2) // Require exactly two non-option arguments.
            .command('add', 'Add a new collaborator to an app', (yargs: yargs.Argv): void => {
                isValidCommand = true;
                yargs
                    .usage(USAGE_PREFIX + ' collaborator add <appName> <email>')
                    .demand(2, 2) // Require exactly two non-option arguments
                    .example(
                        'collaborator add MyApp foo@bar.com',
                        'Adds foo@bar.com as a collaborator to app "MyApp"',
                    );

                addCommonConfiguration(yargs);
            })
            .command('remove', 'Remove a collaborator from an app', (yargs: yargs.Argv) =>
                removeCollaborator('remove', yargs),
            )
            .command('rm', 'Remove a collaborator from an app', (yargs: yargs.Argv) =>
                removeCollaborator('rm', yargs),
            )
            .command('list', 'List the collaborators for an app', (yargs: yargs.Argv) =>
                listCollaborators('list', yargs),
            )
            .command('ls', 'List the collaborators for an app', (yargs: yargs.Argv) =>
                listCollaborators('ls', yargs),
            )
            .check((argv: any, aliases: { [aliases: string]: string }): any => isValidCommand); // Report unrecognized, non-hyphenated command category.

        addCommonConfiguration(yargs);
    })
    .command('debug', 'View the CodePush debug logs for a running app', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        isValidCommand = true;
        yargs
            .usage(USAGE_PREFIX + ' debug <platform>')
            .demand(/*count*/ 1, /*max*/ 1) // Require exactly one non-option arguments
            .example(
                'debug android',
                'View the CodePush debug logs for an Android emulator or device',
            )
            .example('debug ios', 'View the CodePush debug logs for the iOS simulator');

        addCommonConfiguration(yargs);
    })
    .command('deployment', 'View and manage your app deployments', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        yargs
            .usage(USAGE_PREFIX + ' deployment <command>')
            .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments.
            .command('add', 'Add a new deployment to an app', (yargs: yargs.Argv): void => {
                isValidCommand = true;
                yargs
                    .usage(USAGE_PREFIX + ' deployment add <appName> [deploymentName]')
                    .demand(/*count*/ 1, /*max*/ 2) // Require the app name, with deploymentName optional (either deploymentName or --default needs to be specified)
                    .option('default', {
                        alias: 'd',
                        demand: false,
                        description: 'Add the default "Staging" and "Production" deployments',
                        type: 'boolean',
                    })
                    .example(
                        'deployment add MyApp --default',
                        'Adds default "Staging" and "Production" deployments to app "MyApp"',
                    )
                    .example(
                        'deployment add MyApp MyDeployment',
                        'Adds deployment "MyDeployment" to app "MyApp"',
                    );

                addCommonConfiguration(yargs);
            })
            .command(
                'clear',
                'Clear the release history associated with a deployment',
                (yargs: yargs.Argv) => deploymentHistoryClear('clear', yargs),
            )
            .command('remove', 'Remove a deployment from an app', (yargs: yargs.Argv) =>
                deploymentRemove('remove', yargs),
            )
            .command('rm', 'Remove a deployment from an app', (yargs: yargs.Argv) =>
                deploymentRemove('rm', yargs),
            )
            .command('rename', 'Rename an existing deployment', (yargs: yargs.Argv) => {
                isValidCommand = true;
                yargs
                    .usage(
                        USAGE_PREFIX +
                            ' deployment rename <appName> <currentDeploymentName> <newDeploymentName>',
                    )
                    .demand(/*count*/ 3, /*max*/ 3) // Require exactly three non-option arguments
                    .example(
                        'deployment rename MyApp CurrentDeploymentName NewDeploymentName',
                        'Renames deployment "CurrentDeploymentName" to "NewDeploymentName"',
                    );

                addCommonConfiguration(yargs);
            })
            .command('list', 'List the deployments associated with an app', (yargs: yargs.Argv) =>
                deploymentList('list', yargs),
            )
            .command('ls', 'List the deployments associated with an app', (yargs: yargs.Argv) =>
                deploymentList('ls', yargs),
            )
            .command(
                'history',
                'Display the release history for a deployment',
                (yargs: yargs.Argv) => deploymentHistory('history', yargs),
            )
            .command('h', 'Display the release history for a deployment', (yargs: yargs.Argv) =>
                deploymentHistory('h', yargs),
            )
            .check((argv: any, aliases: { [aliases: string]: string }): any => isValidCommand); // Report unrecognized, non-hyphenated command category.

        addCommonConfiguration(yargs);
    })
    .command(
        'link',
        'Link an additional authentication provider (e.g. GitHub) to an existing Mobile Center account',
        (yargs: yargs.Argv) => {
            isValidCommandCategory = true;
            isValidCommand = true;
            yargs
                .usage(USAGE_PREFIX + ' link')
                .demand(/*count*/ 0, /*max*/ 1) //set 'max' to one to allow usage of serverUrl undocument parameter for testing
                .example('link', 'Links an account on the Mobile Center server')
                .check((argv: any, aliases: { [aliases: string]: string }): any => isValidCommand); // Report unrecognized, non-hyphenated command category.

            addCommonConfiguration(yargs);
        },
    )
    .command('login', 'Authenticate in order to begin managing your apps', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        isValidCommand = true;
        yargs
            .usage(USAGE_PREFIX + ' login <serverUrl> [options]')
            .demand(/*count*/ 1, /*max*/ 1)
            .example('login', 'Logs in to the Mobile Center server')
            .example(
                'login https://codepushserver --accessKey mykey',
                'Logs in on behalf of the user who owns and created the access key "mykey"',
            )
            .example(
                'login https://codepushserver --proxy http://someproxy.com:455',
                'Logs in with the specified proxy url',
            )
            .option('accessKey', {
                alias: 'key',
                default: null,
                demand: false,
                description:
                    'Access key to authenticate against the Mobile Center server with, instead of providing your username and password credentials',
                type: 'string',
            })
            .option('proxy', {
                default: null,
                demand: false,
                description: 'URL of the proxy server to use',
                type: 'string',
            })
            .option('noProxy', {
                default: false,
                demand: false,
                description: 'Bypass the system-wide proxy settings',
                type: 'boolean',
            })
            .check((argv: any, aliases: { [aliases: string]: string }): any => isValidCommand); // Report unrecognized, non-hyphenated command category.

        addCommonConfiguration(yargs);
    })
    .command('logout', 'Log out of the current session', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        isValidCommand = true;
        yargs
            .usage(USAGE_PREFIX + ' logout')
            .demand(/*count*/ 0, /*max*/ 0)
            .example('logout', 'Logs out and ends your current session');
        addCommonConfiguration(yargs);
    })
    .command('patch', 'Update the metadata for an existing release', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        isValidCommand = true;
        yargs
            .usage(USAGE_PREFIX + ' patch <appName> <deploymentName> [options]')
            .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
            .example(
                'patch MyApp Production --des "Updated description" -r 50%',
                'Updates the description of the latest release for "MyApp" app\'s "Production" deployment and updates the rollout value to 50%',
            )
            .example(
                'patch MyApp Production -l v3 --des "Updated description for v3"',
                'Updates the description of the release with label v3 for "MyApp" app\'s "Production" deployment',
            )
            .option('label', {
                alias: 'l',
                default: null,
                demand: false,
                description:
                    'Label of the release to update. Defaults to the latest release within the specified deployment',
                type: 'string',
            })
            .option('description', {
                alias: 'des',
                default: null,
                demand: false,
                description: 'Description of the changes made to the app with this release',
                type: 'string',
            })
            .option('disabled', {
                alias: 'x',
                default: null,
                demand: false,
                description: 'Specifies whether this release should be immediately downloadable',
                type: 'boolean',
            })
            .option('mandatory', {
                alias: 'm',
                default: null,
                demand: false,
                description: 'Specifies whether this release should be considered mandatory',
                type: 'boolean',
            })
            .option('rollout', {
                alias: 'r',
                default: null,
                demand: false,
                description:
                    'Percentage of users this release should be immediately available to. This attribute can only be increased from the current value.',
                type: 'string',
            })
            .option('targetBinaryVersion', {
                alias: 't',
                default: null,
                demand: false,
                description:
                    'Semver expression that specifies the binary app version(s) this release is targeting (e.g. 1.1.0, ~1.2.3).',
                type: 'string',
            })
            .check((argv: any, aliases: { [aliases: string]: string }): any => {
                return isValidRollout(argv);
            });

        addCommonConfiguration(yargs);
    })
    .command(
        'promote',
        'Promote the latest release from one app deployment to another',
        (yargs: yargs.Argv) => {
            isValidCommandCategory = true;
            isValidCommand = true;
            yargs
                .usage(
                    USAGE_PREFIX +
                        ' promote <appName> <sourceDeploymentName> <destDeploymentName> [options]',
                )
                .demand(/*count*/ 3, /*max*/ 3) // Require exactly three non-option arguments
                .example(
                    'promote MyApp Staging Production',
                    'Promotes the latest release within the "Staging" deployment of "MyApp" to "Production"',
                )
                .example(
                    'promote MyApp Staging Production --des "Production rollout" -r 25',
                    'Promotes the latest release within the "Staging" deployment of "MyApp" to "Production", with an updated description, and targeting only 25% of the users',
                )
                .option('description', {
                    alias: 'des',
                    default: null,
                    demand: false,
                    description:
                        'Description of the changes made to the app with this release. If omitted, the description from the release being promoted will be used.',
                    type: 'string',
                })
                .option('label', {
                    alias: 'l',
                    default: null,
                    demand: false,
                    description:
                        'Label of the source release that will be taken. If omitted, the latest release being promoted will be used.',
                    type: 'string',
                })
                .option('disabled', {
                    alias: 'x',
                    default: null,
                    demand: false,
                    description:
                        'Specifies whether this release should be immediately downloadable. If omitted, the disabled attribute from the release being promoted will be used.',
                    type: 'boolean',
                })
                .option('mandatory', {
                    alias: 'm',
                    default: null,
                    demand: false,
                    description:
                        'Specifies whether this release should be considered mandatory. If omitted, the mandatory property from the release being promoted will be used.',
                    type: 'boolean',
                })
                .option('noDuplicateReleaseError', {
                    default: false,
                    demand: false,
                    description:
                        'When this flag is set, promoting a package that is identical to the latest release on the target deployment will produce a warning instead of an error',
                    type: 'boolean',
                })
                .option('rollout', {
                    alias: 'r',
                    default: '100%',
                    demand: false,
                    description:
                        'Percentage of users this update should be immediately available to',
                    type: 'string',
                })
                .option('targetBinaryVersion', {
                    alias: 't',
                    default: null,
                    demand: false,
                    description:
                        'Semver expression that specifies the binary app version(s) this release is targeting (e.g. 1.1.0, ~1.2.3). If omitted, the target binary version property from the release being promoted will be used.',
                    type: 'string',
                })
                .check((argv: any, aliases: { [aliases: string]: string }): any => {
                    return isValidRollout(argv);
                });

            addCommonConfiguration(yargs);
        },
    )
    .command('register', 'Register a new Mobile Center account', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        isValidCommand = true;
        yargs
            .usage(USAGE_PREFIX + ' register <serverUrl>')
            .demand(/*count*/ 1, /*max*/ 1)
            .example('register', 'Registers a new Mobile Center account')
            .example(
                'register https://codepushserver --proxy http://someproxy.com:455',
                'Registers with the specified proxy url',
            )
            .option('proxy', {
                default: null,
                demand: false,
                description: 'URL of the proxy server to use',
                type: 'string',
            })
            .option('noProxy', {
                default: false,
                demand: false,
                description: 'Bypass the system-wide proxy settings',
                type: 'boolean',
            })
            .check((argv: any, aliases: { [aliases: string]: string }): any => isValidCommand); // Report unrecognized, non-hyphenated command category.

        addCommonConfiguration(yargs);
    })
    .command('release', 'Release an update to an app deployment', (yargs: yargs.Argv) => {
        isValidCommandCategory = true;
        isValidCommand = true;
        yargs
            .usage(
                USAGE_PREFIX +
                    ' release <appName> <updateContentsPath> <targetBinaryVersion> [options]',
            )
            .demand(/*count*/ 3, /*max*/ 3) // Require exactly three non-option arguments.
            .example(
                'release MyApp app.js "*"',
                'Releases the "app.js" file to the "MyApp" app\'s "Staging" deployment, targeting any binary version using the "*" wildcard range syntax.',
            )
            .example(
                'release MyApp ./platforms/ios/www 1.0.3 -d Production -k ~/.ssh/codepush_rsa',
                'Releases the "./platforms/ios/www" folder and all its contents to the "MyApp" app\'s "Production" deployment, targeting only the 1.0.3 binary version and signed with the "codepush_rsa" private key',
            )
            .example(
                'release MyApp ./platforms/ios/www 1.0.3 -d Production -r 20',
                'Releases the "./platforms/ios/www" folder and all its contents to the "MyApp" app\'s "Production" deployment, targeting the 1.0.3 binary version and rolling out to about 20% of the users',
            )
            .option('deploymentName', {
                alias: 'd',
                default: 'Staging',
                demand: false,
                description: 'Deployment to release the update to',
                type: 'string',
            })
            .option('description', {
                alias: 'des',
                default: null,
                demand: false,
                description: 'Description of the changes made to the app in this release',
                type: 'string',
            })
            .option('disabled', {
                alias: 'x',
                default: false,
                demand: false,
                description: 'Specifies whether this release should be immediately downloadable',
                type: 'boolean',
            })
            .option('mandatory', {
                alias: 'm',
                default: false,
                demand: false,
                description: 'Specifies whether this release should be considered mandatory',
                type: 'boolean',
            })
            .option('privateKeyPath', {
                alias: 'k',
                default: false,
                demand: false,
                description: 'Specifies the location of a RSA private key to sign the release with',
                type: 'string',
            })
            .option('noDuplicateReleaseError', {
                default: false,
                demand: false,
                description:
                    'When this flag is set, releasing a package that is identical to the latest release will produce a warning instead of an error',
                type: 'boolean',
            })
            .option('rollout', {
                alias: 'r',
                default: '100%',
                demand: false,
                description: 'Percentage of users this release should be available to',
                type: 'string',
            })
            .check((argv: any, aliases: { [aliases: string]: string }): any => {
                return checkValidReleaseOptions(argv);
            });

        addCommonConfiguration(yargs);
    })
    .command(
        'release-cordova',
        'Release a Cordova update to an app deployment',
        (yargs: yargs.Argv) => {
            isValidCommandCategory = true;
            isValidCommand = true;
            yargs
                .usage(USAGE_PREFIX + ' release-cordova <appName> <platform> [options]')
                .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
                .example(
                    'release-cordova MyApp ios',
                    'Releases the Cordova iOS project in the current working directory to the "MyApp" app\'s "Staging" deployment',
                )
                .example(
                    'release-cordova MyApp android -d Production',
                    'Releases the Cordova Android project in the current working directory to the "MyApp" app\'s "Production" deployment',
                )
                .option('build', {
                    alias: 'b',
                    default: false,
                    demand: false,
                    description: 'Invoke "cordova build" instead of "cordova prepare"',
                    type: 'boolean',
                })
                .option('isReleaseBuildType', {
                    alias: 'rb',
                    default: false,
                    demand: false,
                    description:
                        'If "build" option is true specifies whether perform a release build',
                    type: 'boolean',
                })
                .option('deploymentName', {
                    alias: 'd',
                    default: 'Staging',
                    demand: false,
                    description: 'Deployment to release the update to',
                    type: 'string',
                })
                .option('description', {
                    alias: 'des',
                    default: null,
                    demand: false,
                    description: 'Description of the changes made to the app in this release',
                    type: 'string',
                })
                .option('disabled', {
                    alias: 'x',
                    default: false,
                    demand: false,
                    description:
                        'Specifies whether this release should be immediately downloadable',
                    type: 'boolean',
                })
                .option('mandatory', {
                    alias: 'm',
                    default: false,
                    demand: false,
                    description: 'Specifies whether this release should be considered mandatory',
                    type: 'boolean',
                })
                .option('privateKeyPath', {
                    alias: 'k',
                    default: false,
                    demand: false,
                    description:
                        'Specifies the location of a RSA private key to sign the release with',
                    type: 'string',
                })
                .option('noDuplicateReleaseError', {
                    default: false,
                    demand: false,
                    description:
                        'When this flag is set, releasing a package that is identical to the latest release will produce a warning instead of an error',
                    type: 'boolean',
                })
                .option('rollout', {
                    alias: 'r',
                    default: '100%',
                    demand: false,
                    description:
                        'Percentage of users this release should be immediately available to',
                    type: 'string',
                })
                .option('targetBinaryVersion', {
                    alias: 't',
                    default: null,
                    demand: false,
                    description:
                        'Semver expression that specifies the binary app version(s) this release is targeting (e.g. 1.1.0, ~1.2.3). If omitted, the release will target the exact version specified in the config.xml file.',
                    type: 'string',
                })
                .check((argv: any, aliases: { [aliases: string]: string }): any => {
                    return checkValidReleaseOptions(argv);
                });

            addCommonConfiguration(yargs);
        },
    )
    .command(
        'release-react',
        'Release a React Native update to an app deployment',
        (yargs: yargs.Argv) => {
            isValidCommandCategory = true;
            isValidCommand = true;
            yargs
                .usage(USAGE_PREFIX + ' release-react <appName> <platform> [options]')
                .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
                .example(
                    'release-react MyApp ios',
                    'Releases the React Native iOS project in the current working directory to the "MyApp" app\'s "Staging" deployment',
                )
                .example(
                    'release-react MyApp android -d Production -k ~/.ssh/codepush_rsa',
                    'Releases the React Native Android project in the current working directory to the "MyApp" app\'s "Production" deployment, signed with the "codepush_rsa" private key',
                )
                .example(
                    'release-react MyApp windows --dev',
                    'Releases the development bundle of the React Native Windows project in the current working directory to the "MyApp" app\'s "Staging" deployment',
                )
                .option('bundleName', {
                    alias: 'b',
                    default: null,
                    demand: false,
                    description:
                        'Name of the generated JS bundle file. If unspecified, the standard bundle name will be used, depending on the specified platform: "main.jsbundle" (iOS), "index.android.bundle" (Android) or "index.windows.bundle" (Windows)',
                    type: 'string',
                })
                .option('deploymentName', {
                    alias: 'd',
                    default: 'Staging',
                    demand: false,
                    description: 'Deployment to release the update to',
                    type: 'string',
                })
                .option('description', {
                    alias: 'des',
                    default: null,
                    demand: false,
                    description: 'Description of the changes made to the app with this release',
                    type: 'string',
                })
                .option('development', {
                    alias: 'dev',
                    default: false,
                    demand: false,
                    description: 'Specifies whether to generate a dev or release build',
                    type: 'boolean',
                })
                .option('disabled', {
                    alias: 'x',
                    default: false,
                    demand: false,
                    description:
                        'Specifies whether this release should be immediately downloadable',
                    type: 'boolean',
                })
                .option('entryFile', {
                    alias: 'e',
                    default: null,
                    demand: false,
                    description:
                        'Path to the app\'s entry Javascript file. If omitted, "index.<platform>.js" and then "index.js" will be used (if they exist)',
                    type: 'string',
                })
                .option('gradleFile', {
                    alias: 'g',
                    default: null,
                    demand: false,
                    description:
                        'Path to the gradle file which specifies the binary version you want to target this release at (android only).',
                })
                .option('podFile', {
                    alias: 'pf',
                    default: null,
                    demand: false,
                    description: 'Path to the cocopods config file (iOS only).',
                })
                .option('mandatory', {
                    alias: 'm',
                    default: false,
                    demand: false,
                    description: 'Specifies whether this release should be considered mandatory',
                    type: 'boolean',
                })
                .option('noDuplicateReleaseError', {
                    default: false,
                    demand: false,
                    description:
                        'When this flag is set, releasing a package that is identical to the latest release will produce a warning instead of an error',
                    type: 'boolean',
                })
                .option('plistFile', {
                    alias: 'p',
                    default: null,
                    demand: false,
                    description:
                        'Path to the plist file which specifies the binary version you want to target this release at (iOS only).',
                })
                .option('plistFilePrefix', {
                    alias: 'pre',
                    default: null,
                    demand: false,
                    description:
                        "Prefix to append to the file name when attempting to find your app's Info.plist file (iOS only).",
                })
                .option('rollout', {
                    alias: 'r',
                    default: '100%',
                    demand: false,
                    description:
                        'Percentage of users this release should be immediately available to',
                    type: 'string',
                })
                .option('privateKeyPath', {
                    alias: 'k',
                    default: false,
                    demand: false,
                    description:
                        'Specifies the location of a RSA private key to sign the release with',
                    type: 'string',
                })
                .option('sourcemapOutput', {
                    alias: 's',
                    default: null,
                    demand: false,
                    description:
                        'Path to where the sourcemap for the resulting bundle should be written. If omitted, a sourcemap will not be generated.',
                    type: 'string',
                })
                .option('sourcemapOutputDir', {
                    default: null,
                    demand: false,
                    description:
                        'Path to folder where the sourcemap for the resulting bundle should be written. Name of sourcemap file will be generated automatically. This argument will be ignored if "sourcemap-output" argument is provided. If omitted, a sourcemap will not be generated.',
                    type: 'string',
                })
                .option('targetBinaryVersion', {
                    alias: 't',
                    default: null,
                    demand: false,
                    description:
                        'Semver expression that specifies the binary app version(s) this release is targeting (e.g. 1.1.0, ~1.2.3). If omitted, the release will target the exact version specified in the "Info.plist" (iOS), "build.gradle" (Android) or "Package.appxmanifest" (Windows) files.',
                    type: 'string',
                })
                .option('outputDir', {
                    alias: 'o',
                    default: null,
                    demand: false,
                    description:
                        'Path to where the bundle and sourcemap should be written. If omitted, a bundle and sourcemap will not be written.',
                    type: 'string',
                })
                .option('config', {
                    alias: 'c',
                    default: null,
                    demand: false,
                    description: 'Path to the React Native CLI configuration file',
                    type: 'string',
                })
                .option('extraBundlerOptions', {
                    default: [],
                    demand: false,
                    description:
                        'Option that gets passed to react-native bundler. Can be specified multiple times',
                    type: 'array',
                })
                .option('extraHermesFlags', {
                    default: [],
                    demand: false,
                    description:
                        'Flag that gets passed to Hermes, JavaScript to bytecode compiler. Can be specified multiple times',
                    type: 'array',
                })
                .check((argv: any, aliases: { [aliases: string]: string }): any => {
                    return checkValidReleaseOptions(argv);
                });

            addCommonConfiguration(yargs);
        },
    )
    .command(
        'rollback',
        'Rollback the latest release for an app deployment',
        (yargs: yargs.Argv) => {
            isValidCommandCategory = true;
            isValidCommand = true;
            yargs
                .usage(USAGE_PREFIX + ' rollback <appName> <deploymentName> [options]')
                .demand(/*count*/ 2, /*max*/ 2) // Require exactly two non-option arguments
                .example(
                    'rollback MyApp Production',
                    'Performs a rollback on the "Production" deployment of "MyApp"',
                )
                .example(
                    'rollback MyApp Production --targetRelease v4',
                    'Performs a rollback on the "Production" deployment of "MyApp" to the v4 release',
                )
                .option('targetRelease', {
                    alias: 'r',
                    default: null,
                    demand: false,
                    description:
                        'Label of the release to roll the specified deployment back to (e.g. v4). If omitted, the deployment will roll back to the previous release.',
                    type: 'string',
                });

            addCommonConfiguration(yargs);
        },
    )
    .command(
        'whoami',
        'Display the account info for the current login session',
        (yargs: yargs.Argv) => {
            isValidCommandCategory = true;
            isValidCommand = true;
            yargs
                .usage(USAGE_PREFIX + ' whoami')
                .demand(/*count*/ 0, /*max*/ 0)
                .example('whoami', 'Display the account info for the current login session');
            addCommonConfiguration(yargs);
        },
    )
    .alias('v', 'version')
    .version(packageJson.version)
    .wrap(/*columnLimit*/ null)
    // TODO: fix this
    // .strict() // Validate hyphenated (named) arguments.
    .check((argv: any, aliases: { [aliases: string]: string }): any => isValidCommandCategory) // Report unrecognized, non-hyphenated command category.
    .fail((msg: string) => showHelp(/*showRootDescription*/ true))
    .parseSync(); // Suppress the default error message.

function createCommand(): cli.ICommand {
    var cmd: cli.ICommand;

    if (!wasHelpShown && argv._ && argv._.length > 0) {
        // Create a command object
        var arg0: any = argv._[0];
        var arg1: any = argv._[1];
        var arg2: any = argv._[2];
        var arg3: any = argv._[3];
        var arg4: any = argv._[4];

        switch (arg0) {
            case 'access-key':
                switch (arg1) {
                    case 'add':
                        if (arg2) {
                            cmd = { type: cli.CommandType.accessKeyAdd };
                            var accessKeyAddCmd = <cli.IAccessKeyAddCommand>cmd;
                            accessKeyAddCmd.name = arg2;
                            /*
                            var ttlOption: string = argv["ttl"];
                            if (isDefined(ttlOption)) {
                                accessKeyAddCmd.ttl = parseDurationMilliseconds(ttlOption);
                            }
                            */
                            // Mobile Center access keys never expire, so this setting doesn't matter (it just needs to be something)
                            accessKeyAddCmd.ttl = parseDurationMilliseconds('60d');
                        }
                        break;

                    case 'patch':
                        if (arg2) {
                            cmd = { type: cli.CommandType.accessKeyPatch };
                            var accessKeyPatchCmd = <cli.IAccessKeyPatchCommand>cmd;
                            accessKeyPatchCmd.oldName = arg2;

                            var newNameOption = argv['name'] as string;
                            var ttlOption = argv['ttl'] as string;
                            if (isDefined(newNameOption)) {
                                accessKeyPatchCmd.newName = newNameOption;
                            }

                            if (isDefined(ttlOption)) {
                                accessKeyPatchCmd.ttl = parseDurationMilliseconds(ttlOption);
                            }
                        }
                        break;

                    case 'list':
                    case 'ls':
                        cmd = { type: cli.CommandType.accessKeyList };

                        (<cli.IAccessKeyListCommand>cmd).format = argv['format'] as string;
                        break;

                    case 'remove':
                    case 'rm':
                        if (arg2) {
                            cmd = { type: cli.CommandType.accessKeyRemove };

                            (<cli.IAccessKeyRemoveCommand>cmd).accessKey = arg2;
                        }
                        break;
                }
                break;

            case 'app':
                switch (arg1) {
                    case 'add':
                        if (arg2) {
                            cmd = { type: cli.CommandType.appAdd };

                            var appAddCommand = <cli.IAppAddCommand>cmd;

                            appAddCommand.appName = arg2;
                            appAddCommand.os = arg3;
                            appAddCommand.platform = arg4;
                        }
                        break;

                    case 'list':
                    case 'ls':
                        cmd = { type: cli.CommandType.appList };

                        (<cli.IAppListCommand>cmd).format = argv['format'] as string;
                        break;

                    case 'remove':
                    case 'rm':
                        if (arg2) {
                            cmd = { type: cli.CommandType.appRemove };

                            (<cli.IAppRemoveCommand>cmd).appName = arg2;
                        }
                        break;

                    case 'rename':
                        if (arg2 && arg3) {
                            cmd = { type: cli.CommandType.appRename };

                            var appRenameCommand = <cli.IAppRenameCommand>cmd;

                            appRenameCommand.currentAppName = arg2;
                            appRenameCommand.newAppName = arg3;
                        }
                        break;

                    case 'transfer':
                        if (arg2 && arg3) {
                            cmd = { type: cli.CommandType.appTransfer };

                            var appTransferCommand = <cli.IAppTransferCommand>cmd;

                            appTransferCommand.appName = arg2;
                            appTransferCommand.email = arg3;
                        }
                        break;
                }
                break;

            case 'collaborator':
                switch (arg1) {
                    case 'add':
                        if (arg2 && arg3) {
                            cmd = { type: cli.CommandType.collaboratorAdd };

                            (<cli.ICollaboratorAddCommand>cmd).appName = arg2;
                            (<cli.ICollaboratorAddCommand>cmd).email = arg3;
                        }
                        break;

                    case 'list':
                    case 'ls':
                        if (arg2) {
                            cmd = { type: cli.CommandType.collaboratorList };

                            (<cli.ICollaboratorListCommand>cmd).appName = arg2;
                            (<cli.ICollaboratorListCommand>cmd).format = argv['format'] as string;
                        }
                        break;

                    case 'remove':
                    case 'rm':
                        if (arg2 && arg3) {
                            cmd = { type: cli.CommandType.collaboratorRemove };

                            (<cli.ICollaboratorRemoveCommand>cmd).appName = arg2;
                            (<cli.ICollaboratorAddCommand>cmd).email = arg3;
                        }
                        break;
                }
                break;

            case 'debug':
                cmd = <cli.IDebugCommand>{
                    type: cli.CommandType.debug,
                    platform: arg1,
                };

                break;

            case 'deployment':
                switch (arg1) {
                    case 'add':
                        if (arg2 && (arg3 || argv['default'])) {
                            cmd = { type: cli.CommandType.deploymentAdd };

                            var deploymentAddCommand = <cli.IDeploymentAddCommand>cmd;

                            deploymentAddCommand.appName = arg2;
                            deploymentAddCommand.deploymentName = arg3;
                            deploymentAddCommand.default = argv['default'] as boolean;
                        }
                        break;

                    case 'clear':
                        if (arg2 && arg3) {
                            cmd = {
                                type: cli.CommandType.deploymentHistoryClear,
                            };

                            var deploymentHistoryClearCommand = <
                                cli.IDeploymentHistoryClearCommand
                            >cmd;

                            deploymentHistoryClearCommand.appName = arg2;
                            deploymentHistoryClearCommand.deploymentName = arg3;
                        }
                        break;

                    case 'list':
                    case 'ls':
                        if (arg2) {
                            cmd = { type: cli.CommandType.deploymentList };

                            var deploymentListCommand = <cli.IDeploymentListCommand>cmd;

                            deploymentListCommand.appName = arg2;
                            deploymentListCommand.format = argv['format'] as string;
                            deploymentListCommand.displayKeys = argv['displayKeys'] as boolean;
                        }
                        break;

                    case 'remove':
                    case 'rm':
                        if (arg2 && arg3) {
                            cmd = { type: cli.CommandType.deploymentRemove };

                            var deploymentRemoveCommand = <cli.IDeploymentRemoveCommand>cmd;

                            deploymentRemoveCommand.appName = arg2;
                            deploymentRemoveCommand.deploymentName = arg3;
                        }
                        break;

                    case 'rename':
                        if (arg2 && arg3 && arg4) {
                            cmd = { type: cli.CommandType.deploymentRename };

                            var deploymentRenameCommand = <cli.IDeploymentRenameCommand>cmd;

                            deploymentRenameCommand.appName = arg2;
                            deploymentRenameCommand.currentDeploymentName = arg3;
                            deploymentRenameCommand.newDeploymentName = arg4;
                        }
                        break;

                    case 'history':
                    case 'h':
                        if (arg2 && arg3) {
                            cmd = { type: cli.CommandType.deploymentHistory };

                            var deploymentHistoryCommand = <cli.IDeploymentHistoryCommand>cmd;

                            deploymentHistoryCommand.appName = arg2;
                            deploymentHistoryCommand.deploymentName = arg3;
                            deploymentHistoryCommand.format = argv['format'] as string;
                            deploymentHistoryCommand.displayAuthor = argv[
                                'displayAuthor'
                            ] as boolean;
                        }
                        break;
                }
                break;

            case 'link':
                cmd = <cli.ILinkCommand>{
                    type: cli.CommandType.link,
                    serverUrl: getServerUrl(arg1),
                };
                break;

            case 'login':
                cmd = { type: cli.CommandType.login };

                var loginCommand = <cli.ILoginCommand>cmd;

                loginCommand.serverUrl = getServerUrl(arg1);
                loginCommand.accessKey = argv['accessKey'] as string;
                loginCommand.proxy = argv['proxy'] as string;
                loginCommand.noProxy = argv['noProxy'] as boolean;
                break;

            case 'logout':
                cmd = { type: cli.CommandType.logout };
                break;

            case 'patch':
                if (arg1 && arg2) {
                    cmd = { type: cli.CommandType.patch };

                    var patchCommand = <cli.IPatchCommand>cmd;

                    patchCommand.appName = arg1;
                    patchCommand.deploymentName = arg2;
                    patchCommand.label = argv['label'] as string;
                    // Description must be set to null to indicate that it is not being patched.
                    patchCommand.description = argv['description']
                        ? backslash(argv['description'] as string)
                        : null;
                    patchCommand.disabled = argv['disabled'] as boolean;
                    patchCommand.mandatory = argv['mandatory'] as boolean;
                    patchCommand.rollout = getRolloutValue(argv['rollout'] as string);
                    patchCommand.appStoreVersion = argv['targetBinaryVersion'] as string;
                }
                break;

            case 'promote':
                if (arg1 && arg2 && arg3) {
                    cmd = { type: cli.CommandType.promote };

                    var deploymentPromoteCommand = <cli.IPromoteCommand>cmd;

                    deploymentPromoteCommand.appName = arg1;
                    deploymentPromoteCommand.sourceDeploymentName = arg2;
                    deploymentPromoteCommand.destDeploymentName = arg3;
                    deploymentPromoteCommand.description = argv['description']
                        ? backslash(argv['description'] as string)
                        : '';
                    deploymentPromoteCommand.label = argv['label'] as string;
                    deploymentPromoteCommand.disabled = argv['disabled'] as boolean;
                    deploymentPromoteCommand.mandatory = argv['mandatory'] as boolean;
                    deploymentPromoteCommand.noDuplicateReleaseError = argv[
                        'noDuplicateReleaseError'
                    ] as boolean;
                    deploymentPromoteCommand.rollout = getRolloutValue(argv['rollout'] as string);
                    deploymentPromoteCommand.appStoreVersion = argv[
                        'targetBinaryVersion'
                    ] as string;
                }
                break;

            case 'register':
                cmd = { type: cli.CommandType.register };

                var registerCommand = <cli.IRegisterCommand>cmd;

                registerCommand.serverUrl = getServerUrl(arg1);
                registerCommand.proxy = argv['proxy'] as string;
                registerCommand.noProxy = argv['noProxy'] as boolean;
                break;

            case 'release':
                if (arg1 && arg2 && arg3) {
                    cmd = { type: cli.CommandType.release };

                    var releaseCommand = <cli.IReleaseCommand>cmd;

                    releaseCommand.appName = arg1;
                    releaseCommand.package = arg2;
                    releaseCommand.appStoreVersion = arg3;
                    releaseCommand.deploymentName = argv['deploymentName'] as string;
                    releaseCommand.description = argv['description']
                        ? backslash(argv['description'] as string)
                        : '';
                    releaseCommand.disabled = argv['disabled'] as boolean;
                    releaseCommand.mandatory = argv['mandatory'] as boolean;
                    releaseCommand.noDuplicateReleaseError = argv[
                        'noDuplicateReleaseError'
                    ] as boolean;
                    releaseCommand.rollout = getRolloutValue(argv['rollout'] as string);
                    releaseCommand.privateKeyPath = argv['privateKeyPath'] as string;
                }
                break;

            case 'release-cordova':
                if (arg1 && arg2) {
                    cmd = { type: cli.CommandType.releaseCordova };

                    var releaseCordovaCommand = <cli.IReleaseCordovaCommand>cmd;

                    releaseCordovaCommand.appName = arg1;
                    releaseCordovaCommand.platform = arg2;

                    releaseCordovaCommand.build = argv['build'] as boolean;
                    releaseCordovaCommand.deploymentName = argv['deploymentName'] as string;
                    releaseCordovaCommand.description = argv['description']
                        ? backslash(argv['description'] as string)
                        : '';
                    releaseCordovaCommand.disabled = argv['disabled'] as boolean;
                    releaseCordovaCommand.mandatory = argv['mandatory'] as boolean;
                    releaseCordovaCommand.noDuplicateReleaseError = argv[
                        'noDuplicateReleaseError'
                    ] as boolean;
                    releaseCordovaCommand.rollout = getRolloutValue(argv['rollout'] as string);
                    releaseCordovaCommand.appStoreVersion = argv['targetBinaryVersion'] as string;
                    releaseCordovaCommand.isReleaseBuildType = argv[
                        'isReleaseBuildType'
                    ] as boolean;
                    releaseCordovaCommand.privateKeyPath = argv['privateKeyPath'] as string;
                }
                break;

            case 'release-react':
                if (arg1 && arg2) {
                    cmd = { type: cli.CommandType.releaseReact };

                    var releaseReactCommand = <cli.IReleaseReactCommand>cmd;

                    releaseReactCommand.appName = arg1;
                    releaseReactCommand.platform = arg2;

                    releaseReactCommand.appStoreVersion = argv['targetBinaryVersion'] as string;
                    releaseReactCommand.bundleName = argv['bundleName'] as string;
                    releaseReactCommand.deploymentName = argv['deploymentName'] as string;
                    releaseReactCommand.disabled = argv['disabled'] as boolean;
                    releaseReactCommand.description = argv['description']
                        ? backslash(argv['description'] as string)
                        : '';
                    releaseReactCommand.development = argv['development'] as boolean;
                    releaseReactCommand.entryFile = argv['entryFile'] as string;
                    releaseReactCommand.gradleFile = argv['gradleFile'] as string;
                    releaseReactCommand.podFile = argv['podFile'] as string;
                    releaseReactCommand.mandatory = argv['mandatory'] as boolean;
                    releaseReactCommand.noDuplicateReleaseError = argv[
                        'noDuplicateReleaseError'
                    ] as boolean;
                    releaseReactCommand.plistFile = argv['plistFile'] as string;
                    releaseReactCommand.plistFilePrefix = argv['plistFilePrefix'] as string;
                    releaseReactCommand.rollout = getRolloutValue(argv['rollout'] as string);
                    releaseReactCommand.privateKeyPath = argv['privateKeyPath'] as string;
                    releaseReactCommand.sourcemapOutput = argv['sourcemapOutput'] as string;
                    releaseReactCommand.sourcemapOutputDir = argv['sourcemapOutputDir'] as string;
                    releaseReactCommand.outputDir = argv['outputDir'] as string;
                    releaseReactCommand.config = argv['config'] as string;
                    releaseReactCommand.extraBundlerOptions = argv[
                        'extraBundlerOptions'
                    ] as string[];
                    releaseReactCommand.extraHermesFlags = argv['extraHermesFlags'] as string[];
                }
                break;

            case 'rollback':
                if (arg1 && arg2) {
                    cmd = { type: cli.CommandType.rollback };

                    var rollbackCommand = <cli.IRollbackCommand>cmd;

                    rollbackCommand.appName = arg1;
                    rollbackCommand.deploymentName = arg2;
                    rollbackCommand.targetRelease = argv['targetRelease'] as string;
                }
                break;

            case 'whoami':
                cmd = { type: cli.CommandType.whoami };
                break;
        }

        return cmd;
    }
}

function isValidRollout(args: any): boolean {
    var rollout: string = args['rollout'];
    if (rollout && !ROLLOUT_PERCENTAGE_REGEX.test(rollout)) {
        return false;
    }

    return true;
}

function checkValidReleaseOptions(args: any): boolean {
    return isValidRollout(args) && !!args['deploymentName'];
}

function getRolloutValue(input: string): number {
    return input ? parseInt(input.replace('%', '')) : null;
}

function getServerUrl(url: string): string {
    if (!url) return null;

    // Trim whitespace and a trailing slash (/) character.
    url = url.trim();
    if (url[url.length - 1] === '/') {
        url = url.substring(0, url.length - 1);
    }

    url = url.replace(/^(https?):\\/, '$1://'); // Replace 'http(s):\' with 'http(s)://' for Windows Git Bash

    return url;
}

function isDefined(object: any): boolean {
    return object !== undefined && object !== null;
}

function parseDurationMilliseconds(durationString: string): number {
    return Math.floor(parseDuration(durationString));
}

export var command = createCommand();
