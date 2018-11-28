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
        this.handleImgUploading = this.handleImgUploading.bind(this);
    }

    state = {
        user: '',
        messages: null, // 数据类型应为数据， 初始值设为null用以判断是否返回数据
        input: '',
        pageCount: 1,
        isPhoneNotice: false,
        loadingImgUrl: '',
        isToolBoxVisible: false
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
     
    handleImgUploading(loadingImgUrl) {
        this.setState({
            loadingImgUrl,
        });
    }

    handleContentLoad = () => {
        this.scrollToBottom();
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
                                const user =  res.data.result.user;
                                this.setState({
                                    isLogin: true,
                                    user,
                                })

                                resolve();
                                Toast.info('设置成功', 1);

                                // 昵称设置成功并马上发送之前输入的消息
                                const {input, isPhoneNotice} = this.state;

                                if (!isEmpty(input)) {
                                    // const to = user === 'personA' ? 'personB' : 'personA';
                                    request.post('/api/message/create', {
                                        from: user,
                                        chatId,
                                        isPhoneNotice,
                                        content: input
                                    }).then(({data} = {}) => {
                                        if (data.success === false) {
                                            document.write(data.message);
                                            window.location.reload();
                                        }
                                    });
                                    this.setState({input: '', isPhoneNotice: false});
                                }
                            }
                            reject();                            
                        });
                    }),
                },
            ], 'default', null, ['请输入昵称'])
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

    handleSubmit = event => {
        event.preventDefault();
        const {user, input, isPhoneNotice} = this.state;
        const chatId = this.chatId;

        if (!user) {
            return this.inputUserNameAlert();
        }

        if (isEmpty(input)) {
            return;
        }

        // const to = user === 'personA' ? 'personB' : 'personA';
        request.post('/api/message/create', {
            from: user,
            chatId,
            isPhoneNotice,
            content: input
        }).then(({data} = {}) => {
            if (data.success === false) {
                document.write(data.message);
                window.location.reload();
            }
        });

        this.setState({input: '', isPhoneNotice: false});
    }

    // handleSeeMore = () => {
    //     this.setState({pageCount: this.state.pageCount + 1}, this.getMessages);
    // }

    handechange(key, value) {
        this.setState({
            [key]: value
        })
    }

    handleToolBoxVisibleToggle = () => {
        this.setState({
            isToolBoxVisible: !this.state.isToolBoxVisible
        });
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
        const {user, messages, isToolBoxVisible, roomName} = this.state;
        const chatId = this.chatId;
        const chatWrapStyle = { height: '100%', padding: '0 10px' };
        const msgWrapStyle = { height: '100%', paddingTop: roomName ? '2.5rem' : '1rem', paddingBottom: isToolBoxVisible ? '9rem' : '3rem', boxSizing: 'border-box' };
        return (
            <div style={chatWrapStyle}>
                <div style={msgWrapStyle}>
                <div ref={this.conentScrollBoxRef} style={{overflow: 'auto', height: '100%', padding: '0'}}>
                    <MessageContainer onContentLoad={this.handleContentLoad} chatId={chatId} user={user} messages={messages} />
                </div>
                </div>
                {this.renderInput()}
                {roomName ? <div className="chat-room-name">房间名：{roomName}</div> : null}
            </div>
        );
    }

    renderInput() {
        const isToolBoxVisible = this.state.isToolBoxVisible;
        const inputWrapStyle = {position: 'absolute', bottom: '1rem', left: '0', width: '100%', boxSizing: 'border-box', padding: '0 10px'};
        const loadingImgWrapStyle = { width: "5rem", position: "absolute", minHeight: '23px', right: "0", bottom: "2rem" };
        const loadingCoverStyle = { backgroundColor: "rgba(51, 47, 47, 0.63)", position: "absolute", height: "100%", width: "100%", left: "0", top: "0" };
        const loadingIconWrapStyle = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
        return (
            <div style={inputWrapStyle}>
                <form onSubmit={this.handleSubmit}>
                    <div style={{position: 'relative'}}>
                      {!!this.state.loadingImgUrl  ? (<div style={loadingImgWrapStyle}>
                                <img alt='' style={{ width: "100%" }} src={this.state.loadingImgUrl} />
                                <div style={loadingCoverStyle}>
                                    <div style={loadingIconWrapStyle}>
                                        <Icon type="loading" size="md" color="#047" />
                                    </div>
                                </div>
                        </div>) : null}
                        <div style={{paddingRight: '2rem'}}>
                            <ContentInput value={this.state.input} onChange={(e) => this.handechange('input', e.target.value)} onImgUploading={this.handleImgUploading}/>
                        </div>
                        <div onClick={this.handleToolBoxVisibleToggle} style={{position: 'absolute', right: 0, top: 0}}>
                            <i style={{fontSize: '1.6rem'}} className={`${isToolBoxVisible ? 'icon-minus' : 'icon-add'} iconfont`}></i>
                        </div>
                    </div>
                    <ToolBox isVisible={isToolBoxVisible} onImgUploading={this.handleImgUploading} createNewRoomAlert={this.createNewRoomAlert}/>                
                </form>
           </div>
        )
    }

    render() {
        return this.state.isLogin ?  this.renderChat() : this.renderLogin();
    }
}
