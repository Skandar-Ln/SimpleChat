import React, { Component } from 'react';
import {List, InputItem, WhiteSpace, WingBlank, Button, Modal, Toast, Icon} from 'antd-mobile';
import request from 'axios';
import moment from 'moment';
import last from 'lodash/last';
import isEmpty from 'lodash/isEmpty';

import ContentInput from './ContentInput';
import MessageContainer from './MessageContainer';
import ToolBox from './ToolBox';
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

        const chatId = last(window.location.pathname.split('/'));
        this.chatId = chatId;

        // if (store[chatId]) {
        //     this.state.user = store[chatId].user;
        //     this.state.key = store[chatId].key;
        // }

        this.conentScrollBoxRef = React.createRef();
        this.isPermitNotification = false;
        this.handleImgUploading = this.handleImgUploading.bind(this);
    }

    state = {
        user: '',
        messages: [],
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
     
    handleImgUploading(loadingImgUrl) {
        this.setState({
            loadingImgUrl,
        });
    }

    handleImgLoad = () => {
        this.scrollToBottom();
    }

    // 初始事件
    start() {
        // this.getMessages(true);
        // if (!this.interval) {
        //     this.interval = setInterval(() => {
        //         this.getMessages();
        //     }, 1000);
        // }

        const evtSource = new EventSource('/api/message/events');

        evtSource.onerror = () => {
            this.setState({messages: []});
            console.log("EventSource failed.");
        };

        evtSource.onmessage = evt => {
             let data = JSON.parse(evt.data);
             if (!Array.isArray(data)) {
                data = [data];
             }

             this.setState({
                 messages: [
                     ...this.state.messages,
                     ...data
                 ]
             })
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
        const conentScrollBox = this.conentScrollBoxRef.current;

        if (!conentScrollBox) {
            return;
        }

        conentScrollBox.scrollTop = conentScrollBox.scrollHeight;
    }

    getMessages(isFirst) {
        const chatId = this.chatId;
        // const key = this.state.key;

        return request.post('/api/message/list', {
            size: 10 * this.state.pageCount,
            chatId
        }).then(({data} = {}) => {
            if (data.success === false) {
                document.write(data.message);
                this.stop();
                return;
            }

            const messages = data.result;
            const lastNew = last(messages) || {};
            const lastOld = last(this.state.messages) || {};

            if (lastNew.updatedAt === lastOld.updatedAt && messages.length === this.state.messages.length) {
                return;
            }

            this.setState({messages});

            if (this.isPermitNotification && lastNew.createdAt !== lastOld.createdAt && this.state.user !== lastNew.from) {
                new Notification(`You've got a notification`, {
                    // body: lastNew.content,
                    icon: config.images[lastNew.from]
                });
            }
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

        if (isEmpty(input)) {
            return;
        }

        // const to = user === 'personA' ? 'personB' : 'personA';
        request.post('/api/message/create', {
            from: user,
            chatId,
            isPhoneNotice,
            content: input
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

    handleToolBoxVisibleToggle = () => {
        this.setState({
            isToolBoxVisible: !this.state.isToolBoxVisible
        });
    }

    renderActivity() {
        return (
            null
        );
    }

    renderLogin() {
        return (
            <div style={{paddingTop: "10%"}}>
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
        const {user, messages = [], isToolBoxVisible} = this.state;

        const chatWrapStyle = {height: '100%'};
        const msgWrapStyle = {height: '100%', paddingTop: '1rem', paddingBottom: isToolBoxVisible ? '9.5rem' : '3rem', boxSizing: 'border-box'};
        return (
            <div style={chatWrapStyle}>
                <div style={msgWrapStyle}>
                <div ref={this.conentScrollBoxRef} style={{overflow: 'auto', height: '100%', padding: '0 0.5rem'}}>
                    <MessageContainer user={user} messages={messages} />
                </div>
                </div>
                {this.renderInput()}
            </div>
        );
    }

    renderInput() {
        const isToolBoxVisible = this.state.isToolBoxVisible;
        const inputWrapStyle = {position: 'absolute', bottom: '1rem', width: '100%'}
        return (
            <div style={inputWrapStyle}>
            {!!this.state.loadingImgUrl ? (<div style={{ width: "5rem", position: "absolute", right: "0", bottom: "2rem" }}>
                <img style={{ width: "100%" }} src={this.state.loadingImgUrl} />
                <div style={{ backgroundColor: "rgba(51, 47, 47, 0.63)", position: "absolute", height: "100%", width: "100%", left: "0", top: "0" }}></div>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                    <Icon type="loading" size="lg" color="#047" />
                </div>
            </div>) : null}
            <form onSubmit={this.handleSubmit}>
                <div style={{position: 'relative'}}>
                    <div style={{paddingRight: '1.9rem'}}>
                        <ContentInput value={this.state.input} onChange={this.handleChange} onImgUploading={this.handleImgUploading}/>
                    </div>
                    <div onClick={this.handleToolBoxVisibleToggle} style={{position: 'absolute', right: 0, top: 0}}>
                        <i style={{fontSize: '1.6rem'}} className={`${isToolBoxVisible ? 'icon-minus' : 'icon-add'} iconfont`}></i>
                    </div>
                </div>
                <ToolBox isVisible={isToolBoxVisible} onImgUploading={this.handleImgUploading} />                
            </form>
        </div>
        )
    }

    render() {
        return this.state.isLogin ?  this.renderChat() : this.renderLogin();
    }
}
