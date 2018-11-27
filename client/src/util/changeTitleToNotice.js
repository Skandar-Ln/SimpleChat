import last from 'lodash/last';

export default function(isUseTitleNotice = false, user, data) {
    // 使用title来提醒收到新消息， data为收到或发送的消息， 数组类型
    if(isUseTitleNotice && document.hidden && user && data && (user !== last(data).from) && (document.title !== '新消息')) {
        // 收到对方的消息, 且页面未显示
        document.title = '新消息';
        setTimeout(()=> document.title = '\u200E', 500);
        setTimeout(()=> document.title = '新消息', 1000);
        setTimeout(()=> document.title = '\u200E', 1500);
        setTimeout(()=> document.title = '新消息', 2000);
     };
     if(isUseTitleNotice && !document.hidden && user && data && (document.title === '新消息')) {
        // 发送或收到消息， 且页面页面显示
        document.title = 'SimpleChat'
     }
}