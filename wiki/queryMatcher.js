const {closest} = require('fastest-levenshtein');

refineListByMatchingWords = (list, search) => {
    const wordList = search.toLowerCase().split("[^a-zA-Z0-9']+");
    let bestMatches = [];
    let highestMatch = 0;
    for (let cat of list) {
        lowerCat = cat.toLowerCase();
        let matchCount = 0;
        for (const word of wordList) {
            if (lowerCat.includes(word)) {
                ++matchCount;
            }
        }
        if (matchCount == highestMatch) {
            bestMatches.push(cat);
        } else if (matchCount > highestMatch) {
            highestMatch = matchCount;
            bestMatches = [];
            bestMatches.push(cat);
        }
    }
    return bestMatches.length != 0 ? bestMatches : list;
};

module.exports.getCategory = (pagesByCategory, subCommand) => {
    subCommand = subCommand.replace('_', ' ');
    let categoryList = Object.keys(pagesByCategory);
    categoryList = refineListByMatchingWords(categoryList, subCommand);
    return closest(subCommand, categoryList);
};

module.exports.findBestPageFromQuery = (pages, query) => {
    pages = refineListByMatchingWords(pages, query);
    return closest(query, pages);
};

module.exports.filterListByCategory = (catList, resList) => {
    const filtered = resList.filter(page => {
        return catList.includes(page);
    });
    return filtered.length > 0 ? filtered : resList;
};

module.exports.getQueryFromFullMessage = msg => {
    const command = msg.slice(1).split(' ')[0];
    return msg.slice(command.length+2);
};