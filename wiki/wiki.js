const queryMatcher = require('./queryMatcher');
const embedBuilder = require('./wikiEmbedBuilder');

module.exports.search = async (wiki, msg) => {
    let query = queryMatcher.getQueryFromFullMessage(msg);
    return wiki.search(query).then(res => {
        return embedBuilder.buildEmbedFromSearch(res.results);
    }).catch(console.error);
};

module.exports.searchInCategory = async (wiki, pagesByCategory, subCommand, msg) => {
    let query = queryMatcher.getQueryFromFullMessage(msg);
    cat = queryMatcher.getCategory(pagesByCategory, subCommand);
    if (query == '') {
        return embedBuilder.buildEmbedFromSearch(pagesByCategory[cat], cat);
    } else {
        query = queryMatcher.findBestPageFromQuery(pagesByCategory[cat], query);
        return wiki.search(query).then(res => {
            res = queryMatcher.filterListByCategory(pagesByCategory[cat], res.results);
            return embedBuilder.buildEmbedFromSearch(res, cat);
        }).catch(console.error);
    }
};

module.exports.findPage = async (wiki, pageList, msg) => {
    let query = queryMatcher.getQueryFromFullMessage(msg);
    query = queryMatcher.findBestPageFromQuery(pageList, query);
    return wiki.page(query).then(res => {
        return embedBuilder.buildEmbedFromPage(res);
    }).catch(console.error);
};

module.exports.findPageInCategory = async (wiki, pagesByCategory, subCommand, msg) => {
    let query = queryMatcher.getQueryFromFullMessage(msg);
    cat = queryMatcher.getCategory(pagesByCategory, subCommand);
    query = queryMatcher.findBestPageFromQuery(pagesByCategory[cat], query);
    return wiki.page(query).then(res => {
        return embedBuilder.buildEmbedFromPage(res);
    }).catch(console.error);
};