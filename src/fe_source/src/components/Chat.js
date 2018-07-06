import React, { Component } from 'react';
import request from 'axios';
import moment from 'moment';
import _ from 'lodash';

import './Chat.css';
import hcl from '../images/hcl.png';
import ztx from '../images/ztx.png';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const config = {
    images: {
        hcl,
        ztx
    }
};

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.isPermitNotification = false;
    }

    state = {
        user: localStorage.getItem('user') || '',
        messages: [],
        input: '',
        pageCount: 1,
        isPhoneNotice: false
    }

    componentWillMount = () => {
        this.getMessages();
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.getMessages();
            }, 1000);
        }
    }

    componentWillUnmount = () => {
      clearInterval(this.interval);
    }

    componentDidMount = () => {
        // 滚到底
        this.scrollToBottom();

        // 滚动事件
        // window.addEventListener('scroll', this.handleScroll);
    
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

    scrollToBottom = () => {
        // this.input.scrollIntoView({block: 'end'});
    }

    getMessages() {
        request.post('/api/message/list', {
            size: 10 * this.state.pageCount
        }).then(res => {
            const messages = res.data.result;
            const lastNew = _.last(messages) || {};
            const last = _.last(this.state.messages) || {};

            this.setState({messages});
            if (this.isPermitNotification && lastNew.createdAt !== last.createdAt && this.state.user !== lastNew.from) {
                new Notification(`来自${lastNew.from}的消息`, {
                    // body: lastNew.content,
                    icon: config.images[lastNew.from]
                });
            }
        });
    }

    handleScroll() {

    }

    handleLogin(user) {
        this.setState({user});
        localStorage.setItem('user', user);
    }

    handleSubmit = event => {
        event.preventDefault();
        const {user, input, isPhoneNotice} = this.state;
        if (_.isEmpty(input)) {
            return;
        }
        const to = user === 'hcl' ? 'ztx' : 'hcl';
        request.post('/api/message/create', {
            from: user,
            to,
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

    renderActivity() {
        return (
            null
        );
    }

    renderLogin() {
        return (
            <div>
                <p>选择用户</p>
                <button style={{marginRight: 20, fontSize: 30}} onClick={() => this.handleLogin('hcl')}>hcl</button>
                <button style={{fontSize: 30}} onClick={() => this.handleLogin('ztx')}>ztx</button>
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
                                   <div  className="Chat-withdraw-reminder" >{isSelf ? "你已撤回一条消息" : `你亲爱的${item.from}已撤回一条消息`}</div> 
                                                 : 
                                   <div>
                                        <div className={`Chat-message${isSelf ? ' self' : ''}`}>
                                            { isSelf && item.withDraw ? <div className="Chat-withdraw" onClick={ () => this.handleWithdraw(item.id)}>撤回</div> :null}
                                            {item.content}
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
                    <input type="text" value={this.state.input} onChange={this.handleChange} className="Chat-input" ref={el => {this.input = el}} />
                    <div style={{textAlign: 'right'}}>
                        短信通知<input checked={this.state.isPhoneNotice} onChange={this.handleChangePhone} type="checkbox" />
                    </div>
                </div>
            </form>
        )
    }

    render() {
        return this.state.user ?  this.renderChat() : this.renderLogin();
    }
}
