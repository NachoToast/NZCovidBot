import { Message, Permissions, MessageEmbed } from 'discord.js';
import Command from '../interfaces/Command';

const help: Command = {
    execute: async ({ message, myPerms }: { message: Message; myPerms: Permissions }) => {
        if (!myPerms.has(Permissions.FLAGS.EMBED_LINKS)) {
            message.channel.send(
                `NZ Covid bot provides updates about new locations of interest and enables searching through them.\nList Commands: \`covid list\`\nCommand-Specific Help: \`covid help <command>\`\nGive me \`Embed Messages\` permissions for a more detailed help menu.`
            );
            return;
        }

        const embed = new MessageEmbed()
            .setColor('#ffcc00')
            .setTitle('Help Command')
            .setDescription(
                `NZ Covid Bot provides updates about new locations of interest and enables searching through them.
                You can use \`covid help <command>\` to get command-specific help.
                For more information on searching locations, use \`covid help query\`
                For more information on posting new locations of interest, use \`covid help set\``
            )
            .addField(`Usage`, 'covid help <command?>', true)
            .addField('Aliases', 'h, ?', true)
            .addField(`Examples`, `covid help query\ncovid help set\ncovid help list`, true)
            .addField('Related Commands', 'list, query, config', true);
        message.channel.send({ embeds: [embed] });
    },
    help: async () => {},
};

export default help;
