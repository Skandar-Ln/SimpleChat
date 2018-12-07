import React, { Component } from 'react';
import {InputItem, WhiteSpace, WingBlank, Button, Toast, Modal, Icon} from 'antd-mobile';
import request from 'axios';
import moment from 'moment';
import last from 'lodash/last';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';

import ContentInput from './ContentInput';
import MessageContainer from './MessageContainer';
import ToolBox from './ToolBox';
import './Chat.css';
import personA from '../images/personA.png';
import personB from '../images/personB.png';
import TitleNoticer from '../util/TitleNoticer';

import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const config = {
    images: {
        personA,
        personB
    }
};
// title消息提醒
const titleNoticer = new TitleNoticer();
titleNoticer.init();

// const store = JSON.parse(localStorage.getItem('chatStore')) || {};
const EventSource = NativeEventSource || EventSourcePolyfill;

export default class Chat extends Component {
    constructor(props) {
        super(props);

        const chatId = last(window.location.pathname.split('/'));
        this.chatId = chatId;

        // if (store[chatId]) {
        //     this.state.user = store[chatId].user;
        //     this.state.key = store[chatId].key;
        // }

        this.conentScrollBoxRef = React.createRef();
        this.resetPhoneNotice = this.resetPhoneNotice.bind(this);
        this.updateLoginedState = this.updateLoginedState.bind(this); // 聊天界面输入昵称后调用
        this.updateBottomPadding = this.updateBottomPadding.bind(this); // input中toolbox显示状态改变后调用
    }

    state = {
        user: '',
        messages: null, // 数据类型应为数据， 初始值设为null用以判断是否返回数据
        input: '',
        pageCount: 1,
        isPhoneNotice: false,
        loadingImgUrl: '',
        contentBottomPadding: 42, // toolBox显示与隐藏时动态设置聊天内容的bottomPadding
    }

    componentWillUnmount = () => {
        clearInterval(this.interval);
    }

    componentDidMount = () => {
        const chatId = this.chatId;

        // 滚到底
        this.scrollToBottom();

        // 滚动事件
        // window.addEventListener('scroll', this.handleScroll);

        // const evtSource = new EventSource('/api/stream');

        // evtSource.addEventListener('message', function (event) {
        //     const data = event.data;
        //      console.log(data);
        //   }, false);

        // 初始
        request.post('/api/chat/auth', {
            chatId
        }).then(res => {
            if (res.data.success) {
                const result = res.data.result || {};

                this.setState({
                    isLogin: true,
                    user: result.user,
                    roomName: get(result, 'chatData.roomName')
                })
                this.start();
            }
        });
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }
     
    handleContentLoad = () => {
        this.scrollToBottom();
    }

    resetPhoneNotice() {
        this.setState({
            isPhoneNotice: false
        })
    }

    updateLoginedState(user) {
        this.setState({
            isLogin: true,
            user,
        })
    }

    updateBottomPadding(padding) {
        if (this.state.contentBottomPadding !== padding) {
            this.setState({
                contentBottomPadding: padding
            })
        }
    }

    // 初始事件
    start() {
        const chatId = this.chatId;

        // this.getMessages(true);
        // if (!this.interval) {
        //     this.interval = setInterval(() => {
        //         this.getMessages();
        //     }, 1000);
        // }

        const evtSource = new EventSource(`/api/message/events?chatId=${chatId}`);
        console.log("EventSource start." + new Date());

        evtSource.onerror = () => {
            this.setState({messages: []});
            console.log("EventSource failed." + new Date());
        };

        evtSource.onmessage = evt => {
             let data = JSON.parse(evt.data);
             if (!Array.isArray(data)) {
                data = [data];
             }
             const messages = this.state.messages ? this.state.messages : [];
             this.setState({
                 messages: [
                     ...messages,
                     ...data
                 ]
             });

            // 使用title来提醒收到新消息
            titleNoticer.emit(this.state.user, data);
        };

        evtSource.addEventListener('withdraw', evt => {
            let {id} = JSON.parse(evt.data);

            const messages = this.state.messages.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        isWithDraw: true
                    };
                }
                return item;
            })
            this.setState({
                messages
            })
       });
    }

    stop() {
        clearInterval(this.interval);
    }


    scrollToBottom = () => {
        const conentScrollBox = this.conentScrollBoxRef.current;

        if (!conentScrollBox) {
            return;
        }

        conentScrollBox.scrollTop = conentScrollBox.scrollHeight;
    }

    // getMessages(isFirst) {
    //     const chatId = this.chatId;
    //     // const key = this.state.key;

    //     return request.post('/api/message/list', {
    //         size: 10 * this.state.pageCount,
    //         chatId
    //     }).then(({data} = {}) => {
    //         if (data.success === false) {
    //             document.write(data.message);
    //             this.stop();
    //             return;
    //         }

    //         const messages = data.result;
    //         const lastNew = last(messages) || {};
    //         const lastOld = last(this.state.messages) || {};

    //         if (lastNew.updatedAt === lastOld.updatedAt && messages.length === this.state.messages.length) {
    //             return;
    //         }

    //         this.setState({messages}); 
    //     });
    // }

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

  
    // handleSeeMore = () => {
    //     this.setState({pageCount: this.state.pageCount + 1}, this.getMessages);
    // }

    handechange(key, value) {
        this.setState({
            [key]: value
        })
    }

    renderLogin() {
        return (
            <div style={{paddingTop: "10%"}}>
                <WingBlank>
                    <InputItem onChange={(e) => this.handechange('inputUser', e)}>昵称</InputItem>
                    <WhiteSpace />
                    <WhiteSpace />
                    
                    <InputItem onChange={(e) => this.handechange('inputKey', e)}>暗号</InputItem>
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
        const {user, messages, roomName, isPhoneNotice, contentBottomPadding } = this.state;
        const chatId = this.chatId;
        const chatWrapStyle = { height: '100%', padding: '0 10px' };
        const msgWrapStyle = { height: '100%', paddingTop: roomName ? '2.5rem' : '1rem', paddingBottom: contentBottomPadding + 'px', boxSizing: 'border-box' };
        return (
            <div style={chatWrapStyle}>
                <div style={msgWrapStyle}>
                    <div ref={this.conentScrollBoxRef} style={{overflow: 'auto', height: '100%', padding: '0'}}>
                        <MessageContainer onContentLoad={this.handleContentLoad} chatId={chatId} user={user} messages={messages} />
                    </div>
                </div>
                <ContentInput 
                   user={user} 
                   chatId={chatId}
                   updateLoginedState={this.updateLoginedState}
                   updateBottomPadding={this.updateBottomPadding}
                   isPhoneNotice={isPhoneNotice}
                   resetPhoneNotice={this.resetPhoneNotice}
                   />
                {roomName ? <div className="chat-room-name">房间名：{roomName}</div> : null}
            </div>
        );
    }


    render() {
        return this.state.isLogin ?  this.renderChat() : this.renderLogin();
    }
}
