import { Message } from 'discord.js';
import Command from '../interfaces/Command';

const help: Command = {
    execute: async ({ message }: { message: Message }) => {
        message.channel.send(
            `NZ Covid Bot provides updates about new locations of interest, and enables searching through them.\nTo list commands, type \`covid list\`\nTo get more help on a particular command, type \`covid help <command>\``
        );
    },
    help: async () => {},
};

export default help;
