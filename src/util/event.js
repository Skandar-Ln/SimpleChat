module.exports = {
    eventPool: {

    },
    one(chatId, type, callback) {
        this.eventPool[chatId] = this.eventPool[chatId] || {};
        this.eventPool[chatId][type] = this.eventPool[chatId][type] || [];

        this.eventPool[chatId][type].push(callback);
    },
    dispatch(chatId, type, data) {
        if (!this.eventPool[chatId] || !this.eventPool[chatId][type]) {
            return;
        }

        const events = this.eventPool[chatId][type] || [];
        events.forEach(item => {
            console.log(item)
            item(data);
        });

        this.eventPool[chatId][type] = [];
    }
}
