exports.errorHandler = function(error, ctx, message) {
    ctx.body = {message: message || error, success: false};
}

exports.rejectHandler = function(ctx, message) {
    ctx.body = {message, success: false};
}

exports.successHandler = function(ctx, message) {
    ctx.body = {message, success: true};
}

exports.redirectHandler = function(ctx, path) {
    if (ctx.path !== path) {
        ctx.redirect(path);
    }
}

exports.setSession = function(ctx, params) {
    Object.assign(ctx.session, params);
}

module.exports = exports;
