import { Message, MessageEmbed } from 'discord.js';
import Command from '../../interfaces/Command';
import LocationsManager from '../../modules/locationsManager.module';

const possibleUses: {
    [index: string]: string;
} = {
    'covid query': 'Searches locations added today',
    'covid query 13hrs': 'Searches locations added 13 hours ago or later',
    'covid query id <id>': 'Searches locations by ID',
    'covid query Auckland': 'Search locations in Auckland',
    'covid query yesterday': 'Searches locations added yesterday or later',
    'covid query auckland university': 'Searches locations related to Auckland AND university',
};

const query: Command = {
    execute: async ({ message, args, locations }: { message: Message; args: string[]; locations: LocationsManager }) => {
        let key: string, fields: string | string[];

        if (args.length < 1) {
            // no args specified = today
            key = 'Added';
            fields = 'today';
        } else if (args.length === 1) {
            if (LocationsManager.addedKeywords.includes(args[0].toLowerCase()) || args[0].endsWith('hrs')) {
                // args[0] matches date format
                key = 'Added';
                fields = args[0];
            } else {
                // 1 arg specified = must be All
                key = 'All';
                fields = args[0];
            }
        } else {
            // 2+ args specified = args[0] could be searchField, args[1]+ are searchTerms to AND
            if (LocationsManager.addedKeywords.includes(args[0].toLowerCase())) {
                // args[0] matches date format
                key = 'Added';
                fields = args.slice(1);
            } else if (LocationsManager.validSearchFields.map((e) => e.toLowerCase()).includes(args[0].toLowerCase())) {
                // args[0] matches a search type
                key = args[0];
                fields = args.slice(1);
            } else {
                // otherwise args[0] must be a search term
                key = 'All';
                fields = args;
            }
        }

        // console.log(key, fields);

        const results = await locations.queryLocations(key, fields);

        if (typeof results === 'string') {
            message.channel.send(results);
            return;
        }
        if (results.length < 1) {
            message.channel.send(
                `No results found for keywords "${(typeof fields === 'string' ? fields : fields.join('", "')).replace(
                    '@',
                    ''
                )}" and search type "${key.toLowerCase()}".`
            );
            return;
        }

        if (results.length <= 3) {
            const embeds: MessageEmbed[] = results.map((e) => LocationsManager.makeLocationEmbed(e));
            message.channel.send({ embeds });
        } else {
            const embed: MessageEmbed = LocationsManager.makeMassLocationEmbed(results.slice(0, 10), results.length);
            message.channel.send({ embeds: [embed] });
        }
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Search locations of interest. Usage:\n${Object.keys(possibleUses)
                .map((e) => `\`${e}\` - ${possibleUses[e]}`)
                .join('\n')}`
        );
    },
};

export default query;
