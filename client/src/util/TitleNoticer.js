import last from 'lodash/last';

export default class TitleNoticer {
    constructor() {
        this.isUseTitleNotice = true;
    }
 
    emit(user, data) {
        // 使用title来提醒收到新消息， data为收到或发送的消息， 数组类型
        if(this.isUseTitleNotice && document.hidden && user && data && (user !== last(data).from) && (document.title !== '新消息')) {
            // 收到对方的消息, 且页面未显示
            document.title = '新消息';
            setTimeout(()=> document.title = '\u200E', 500);
            setTimeout(()=> document.title = '新消息', 1000);
            setTimeout(()=> document.title = '\u200E', 1500);
            setTimeout(()=> document.title = '新消息', 2000);
         };
    }

    initTitle() {
        // 页面可见时重置
        if (!document.hidden && (document.title === '新消息')) {
            document.title = 'SimpleChat';
        }
    }

    init() {
        document.addEventListener('visibilitychange', this.initTitle);
    }

    cancel() {
        this.isUseTitleNotice = false;
        document.removeEventListener('visibilitychange', this.initTitle);
    }
}
