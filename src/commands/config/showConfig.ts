import Command from '../../interfaces/Command';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import GuildConfigManager from '../../modules/guildConfigManager.module';

const showConfig: Command = {
    execute: async ({ message, settings, myPerms }: { settings: GuildConfigManager; message: Message; myPerms: Permissions }) => {
        if (message.guildId === null) return;
        if (!myPerms.has(Permissions.FLAGS.EMBED_LINKS)) {
            const channel = settings.getChannel(message.guildId);
            const prefixes = settings.getPrefixes(message.guildId);
            message.channel.send(
                `**Server Configuration:**\n${
                    channel === false ? 'Not announcing new locations' : `Announcing new locations in <#${channel}>`
                }\nBot Prefixes: \`covid\`, \`${prefixes.join(
                    '`, `'
                )}\`\nGive me \`Embed Messages\` permissions for a more detailed menu.`
            );
            return;
        }

        const outputEmbed = new MessageEmbed().setColor('#ffcc00').setTitle('Server Configuration');
        let output = '';

        const channel = settings.getChannel(message.guildId);
        const prefixes = settings.getPrefixes(message.guildId);

        outputEmbed.addField('Bot Prefixes', `covid, ${prefixes.join(', ')}`);
        output += `\n${channel !== false ? `Announcing new locations in <#${channel}>` : 'Not announcing new locations.'}`;

        outputEmbed.setDescription(output);

        message.channel.send({ embeds: [outputEmbed] });
    },
    help: async ({ message, myPerms }: { message: Message; myPerms: Permissions }) => {
        // message.channel.send(`Lists server-specific config, usage: \`covid config\`\nAdmin use only.`);

        if (!myPerms.has(Permissions.FLAGS.EMBED_LINKS)) {
            message.channel.send(
                `Lists server-specific config.\nUsage: \`covid config\`\nGive me \`Embed Messages\` permissions for a more detailed help menu.`
            );
            return;
        }

        const embed = new MessageEmbed()
            .setColor('#ffcc00')
            .setTitle('List Config Command')
            .setDescription('Lists server-specific config.')
            .addField(`Usage`, 'covid config', true)
            .addField('Aliases', 'conf', true)
            .addField('Related Commands', 'prefix, set', true);
        message.channel.send({ embeds: [embed] });
    },
};

export default showConfig;
