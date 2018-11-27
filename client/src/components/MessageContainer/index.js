import React, { Component } from 'react';
import MessageContent from '../MessageContent';
import request from 'axios';
import moment from 'moment';
import {Icon} from 'antd-mobile';
import _ from 'lodash';

class MessageContainer extends Component {
    state = {}

    handleWithdraw = id => {
        const chatId = this.props.chatId;

        request.post('/api/message/withdraw', {id, chatId}).then(res => {
            if (!res.data.success) {
                alert(res.data.message);
            }
        });
    }

    render() {
        const {user, messages , onContentLoad} = this.props;

        let time1 = null;
        let time2 = null;
        let showTime = true;

        if (!Array.isArray(messages) && !messages) {
            return (<div>
                    <Icon type="loading" />
                </div>)
        }

        return (
            <div>
                {
                    messages.map((item, index) => {
                        const isSelf = user === item.from;
                        moment().subtract(2, 'minutes').isBefore(item.createdAt) ? item.withDraw = true : item.withDraw = false;
                        if(index > 0) {
                            time1 = item.createdAt;
                            time2 = messages[index - 1].createdAt;
                            moment(time1).subtract(3, 'minutes').isBefore(time2) ? (showTime = false) : (showTime = true);
                        };
                        return (
                            <li
                                style={{
                                    textAlign: isSelf ? 'right' : 'left',
                                    marginBottom: 12,
                                    position:'relative'
                                }}
                                key={item.id}
                            >  
                            { showTime ? 
                                <div style={{textAlign:'center'}}>
                                    <div className="Chat-time-remindner">
                                        {[moment(item.createdAt).calendar()]}
                                    </div>
                                </div> : null }
                            {isSelf || (item.isWithDraw || <div className="Chat-sender">{item.from}</div>)}
                                {item.isWithDraw ? 
                                <div  className="Chat-withdraw-reminder" >{isSelf ? "你已撤回一条消息" : `${item.from}已撤回一条消息`}</div> 
                                                : 
                                <div>
                                        <div className={`Chat-message${isSelf ? ' self' : ''}`} style={{backgroundColor: item.type === 'img' ? 'transparent' : (isSelf ? '#0176ff' : '#f8f8f8')}}>
                                            { isSelf && item.withDraw ? <div className="Chat-withdraw" onClick={ () => this.handleWithdraw(item.id)}>撤回</div> :null}
                                            <MessageContent onContentLoad={onContentLoad} content={item.content} type={item.type} />
                                        </div>
                                        {!isSelf || <div className="Chat-sender self">{item.from}</div>}
                                </div>
                                }
                            </li>
                        );
                    })
                }
            </div>
        );
    }
}

export default MessageContainer;