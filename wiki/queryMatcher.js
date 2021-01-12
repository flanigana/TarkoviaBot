const {closest} = require('fastest-levenshtein');

function refineListByMatchingWords(list, search) {
    search = search.replace("[^a-zA-Z0-9']+", " ");
    const searchPieces = search.toLowerCase().split(/(\d+\w+d*)/g);
    let bestMatches = [];
    let highestMatch = 0;
    for (const entry of list) {
        let matchCount = 0;
        for (const piece of searchPieces) {
            if (piece == '') {
                continue;
            }
            if (entry.toLowerCase().includes(piece)) {
                ++matchCount;
            }
        }
        if (matchCount == highestMatch) {
            bestMatches.push(entry);
        } else if (matchCount > highestMatch) {
            highestMatch = matchCount;
            bestMatches = [];
            bestMatches.push(entry);
        }
    }
    return bestMatches.length != 0 ? bestMatches : list;
}

function getCategory(pagesByCategory, subCommand) {
    subCommand = subCommand.replace('_', ' ');
    subCommand = subCommand.toLowerCase() == 'ammo' ? 'rounds' : subCommand;
    let categoryList = Object.keys(pagesByCategory);
    categoryList = refineListByMatchingWords(categoryList, subCommand);
    return closest(subCommand, categoryList);
}

function findBestPageFromQuery(pages, query) {
    pages = refineListByMatchingWords(pages, query);
    return closest(query, pages);
}

function filterListByCategory(catList, resList) {
    const filtered = resList.filter(page => {
        return catList.includes(page);
    });
    return filtered.length > 0 ? filtered : resList;
}

function getQueryFromFullMessage(msg) {
    const command = msg.slice(1).split(' ')[0];
    return msg.slice(command.length+2);
}

module.exports = {
    getCategory,
    findBestPageFromQuery,
    filterListByCategory,
    getQueryFromFullMessage
};