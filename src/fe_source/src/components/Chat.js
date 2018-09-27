import React, { Component } from 'react';
import {List, InputItem, WhiteSpace, WingBlank, Button, Modal, Toast} from 'antd-mobile';
import request from 'axios';
import moment from 'moment';
import _ from 'lodash';

import ContentInput from './ContentInput';
import MessageContent from './MessageContent';
import './Chat.css';
import personA from '../images/personA.png';
import personB from '../images/personB.png';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const config = {
    images: {
        personA,
        personB
    }
};

// const store = JSON.parse(localStorage.getItem('chatStore')) || {};

export default class Chat extends Component {
    constructor(props) {
        super(props);

        const chatId = _.last(window.location.pathname.split('/'));
        this.chatId = chatId;

        // if (store[chatId]) {
        //     this.state.user = store[chatId].user;
        //     this.state.key = store[chatId].key;
        // }

        this.isPermitNotification = false;
    }

    state = {
        user: '',
        messages: [],
        input: '',
        pageCount: 1,
        isPhoneNotice: false
    }

    componentWillUnmount = () => {
        clearInterval(this.interval);
    }

    componentDidMount = () => {
        const chatId = this.chatId;

        // 滚到底
        // this.scrollToBottom();

        // 滚动事件
        // window.addEventListener('scroll', this.handleScroll);

        // 初始
        request.post('/api/chat/auth', {
            chatId
        }).then(res => {
            if (res.data.success) {
                this.setState({
                    isLogin: true,
                    user: res.data.result.user
                })
                this.start();
            }
        });
    
        // 通知
        const callback = res => {
            if (res === 'granted') {
                this.isPermitNotification = true;
            }
        };
        window.Notification && Notification.requestPermission(callback).then(callback);
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    start() {
        this.getMessages(true);
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.getMessages();
            }, 1000);
        }
    }

    stop() {
        clearInterval(this.interval);
    }

    inputUserNameAlert() {
        const chatId = this.chatId;
        Modal.prompt(null, null,
            [
                {
                    text: '取消',
                    onPress: value => new Promise((resolve) => {
                        resolve();
                    }),
                },
                {
                    text: '确定',
                    onPress: value => new Promise((resolve, reject) => {
                        request.post('/api/chat/auth', {
                            chatId,
                            user: value
                        }).then(res => {
                            if (res.data.success) {
                                this.setState({
                                    isLogin: true,
                                    user: res.data.result.user
                                })
                                this.start();
                                resolve();
                                Toast.info('设置成功', 1);
                            }
                            reject();                            
                        });
                    }),
                },
            ], 'default', null, ['请输入昵称'])
    }

    scrollToBottom = () => {
        this.input && this.input.scrollIntoView({block: 'end'});
    }

    getMessages(isFirst) {
        const chatId = this.chatId;
        // const key = this.state.key;

        request.post('/api/message/list', {
            size: 10 * this.state.pageCount,
            chatId
        }).then(({data} = {}) => {
            if (data.success === false) {
                document.write(data.message);
                this.stop();
                return;
            }

            const messages = data.result;
            const lastNew = _.last(messages) || {};
            const last = _.last(this.state.messages) || {};

            if (lastNew.updatedAt === last.updatedAt && messages.length === this.state.messages.length) {
                return;
            }

            this.setState({messages});
            if (this.isPermitNotification && lastNew.createdAt !== last.createdAt && this.state.user !== lastNew.from) {
                new Notification(`来自${lastNew.from}的消息`, {
                    // body: lastNew.content,
                    icon: config.images[lastNew.from]
                });
            }

            // if (isFirst) {
            //     const {user, key} = this.state;
            //     store[chatId] = {
            //         user,
            //         key
            //     }
            //     localStorage.setItem('chatStore', JSON.stringify(store));
            // }
        });
    }

    handleLogin = () => {
        const chatId = this.chatId;
        const {inputKey, inputUser} = this.state;

        request.post('/api/chat/auth', {
            user: inputUser,
            key: inputKey,
            chatId
        }).then(res => {
            if (res.data.success) {
                this.setState({
                    isLogin: true,
                    user: res.data.result.user
                })
                this.start();
            }
            else {
                document.write(res.data.message);
                this.stop();
            }
        });
    }

    handleSubmit = event => {
        event.preventDefault();
        const {user, input, isPhoneNotice} = this.state;
        const chatId = this.chatId;

        if (!user) {
            return this.inputUserNameAlert();
        }

        if (_.isEmpty(input)) {
            return;
        }

        // const to = user === 'personA' ? 'personB' : 'personA';
        request.post('/api/message/create', {
            from: user,
            chatId,
            isPhoneNotice,
            content: input
        }).then(res => {
            this.getMessages();
        });
        this.setState({input: '', isPhoneNotice: false});
    }

    handleChange = event => {
        this.setState({input: event.target.value});
    }

    handleChangePhone = event => {
        this.setState({isPhoneNotice: event.target.checked});
    }

    handleSeeMore = () => {
        this.setState({pageCount: this.state.pageCount + 1}, this.getMessages);
    }

    handleWithdraw = id => {
        request.post('/api/message/withdraw', {id}).then(res => {
            if (!res.data.success) {
                alert(res.data.message);
            }
            this.getMessages();
        });
    }
    handleUserChange = e => {

        this.setState({
            inputUser: e
        });
    }

    handleKeyChange = e => {
        this.setState({
            inputKey: e
        });
    }

    renderActivity() {
        return (
            null
        );
    }

    renderLogin() {
        return (
            <div style={{marginTop: "10%"}}>
                <WingBlank>
                    <InputItem onChange={this.handleUserChange}>昵称</InputItem>
                    <WhiteSpace />
                    <WhiteSpace />
                    
                    <InputItem onChange={this.handleKeyChange}>暗号</InputItem>
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <WhiteSpace />
                    <Button onClick={this.handleLogin} type="primary">登录</Button>
                </WingBlank>
            </div>
            
        )
    }

    renderChat() {
        const {user, messages = []} = this.state;
        const  TimeSpan = 3 * 60 * 1000;
        let time1 = null;
        let time2 = null;
        let showTime = true;
        return (
            <div>
                {this.renderActivity()}
                <p onClick={this.handleSeeMore} style={{color: '#aaa'}}>查看更多记录</p>
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
                                        <div className={`Chat-message${isSelf ? ' self' : ''}`}>
                                            { isSelf && item.withDraw ? <div className="Chat-withdraw" onClick={ () => this.handleWithdraw(item.id)}>撤回</div> :null}
                                            <MessageContent content={item.content} type={item.type} />
                                        </div>
                                        {!isSelf || <div className="Chat-sender self">{item.from}</div>}
                                  </div>
                                }
                            </li>
                        );
                    })
                }
                <br />
                {this.renderInput()}
            </div>
        );
    }

    renderInput() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div style={{position: 'relative'}}>
                    <ContentInput onChange={this.handleChange} />
                    {/* <div style={{textAlign: 'right'}}>
                        短信通知<input checked={this.state.isPhoneNotice} onChange={this.handleChangePhone} type="checkbox" />
                    </div> */}
                </div>
            </form>
        )
    }

    render() {
        return this.state.isLogin ?  this.renderChat() : this.renderLogin();
    }
}
