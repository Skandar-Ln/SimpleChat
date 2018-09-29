exports.syncTable = (table, force) => {
    if (typeof force === 'boolean') {
        return table.sync({force});
    }
    // if (process.env.NODE_ENV === 'development') {
    //     table.sync({force: true});
    // }
    else {
        table.sync();
    }
}
