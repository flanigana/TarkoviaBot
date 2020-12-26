module.exports.getCommand = msg => {
    let command = msg.slice(1).split(' ')[0];
    if (command.includes(':')) {
        command = command.split(':')[0];
    }
    return command;
};

module.exports.getSubCommand = msg => {
    const command = msg.slice(1).split(' ')[0];
    if (command.includes(':')) {
        return command.split(':')[1];
    } else {
        return undefined;
    }
};

module.exports.getArgs = (msg, startPos = 0) => {
    return msg.slice(1).split(' ').slice(startPos);
};