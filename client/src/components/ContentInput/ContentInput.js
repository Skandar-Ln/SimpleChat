import React, { Component } from 'react';
import request from 'axios';
import { Toast, Modal, Icon } from 'antd-mobile';
import uploadFile from '../../util/uploadFile';
import ToolBox from '../ToolBox/ToolBox';
import isEmpty from 'lodash/isEmpty';

class ContentInput extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            input: '',
            loadingImgUrl: '',
            isToolBoxVisible: false,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({
            'input': e.target.value
        })
    }

    handlePaste = e => {
        const item = e.clipboardData.items[0];
        // const chatId = this.props.chatId || '';

        if (item.kind === 'file') {
            const file = item.getAsFile();

            this.handleImgUploading(URL.createObjectURL(file));

            uploadFile(file).then(res => {
                this.handleImgUploading('');
            });
        }
    }

    handleImgUploading(loadingImgUrl) {
        this.setState({
            loadingImgUrl,
        });
    }

    handleToolBoxVisibleToggle = () => {
        this.setState({
            isToolBoxVisible: !this.state.isToolBoxVisible
        });
    }

    handleSubmit = event => {
        event.preventDefault();
        const { user, isPhoneNotice, chatId, resetPhoneNotice } = this.props;
        const { input } = this.state;

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

        this.setState({input: ''});
        resetPhoneNotice();
    }

    inputUserNameAlert() {
        const { chatId, updateLoginedState } = this.props;

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
                                updateLoginedState(user);
                                resolve();
                                Toast.info('设置成功', 1);

                                // 昵称设置成功并马上发送之前输入的消息
                                const { input } = this.state;
                                if (!isEmpty(input)) {
                                    // const to = user === 'personA' ? 'personB' : 'personA';
                                    request.post('/api/message/create', {
                                        from: user,
                                        chatId,
                                        content: input
                                    }).then(({data} = {}) => {
                                        if (data.success === false) {
                                            document.write(data.message);
                                            window.location.reload();
                                        }
                                    });
                                    this.setState({ input: '' });
                                }
                            }
                            reject();                            
                        });
                    }),
                },
            ], 'default', null, ['请输入昵称'])
    }

    render() {
        const { loadingImgUrl, isToolBoxVisible, input } = this.state;
        const { updateBottomPadding } = this.props;
        const inputWrapStyle = {position: 'absolute', bottom: '1rem', left: '0', width: '100%', boxSizing: 'border-box', padding: '0 10px'};
        const loadingImgWrapStyle = { width: "5rem", position: "absolute", minHeight: '23px', right: "0", bottom: "2rem" };
        const loadingCoverStyle = { backgroundColor: "rgba(51, 47, 47, 0.63)", position: "absolute", height: "100%", width: "100%", left: "0", top: "0" };
        const loadingIconWrapStyle = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
        return (
            <div style={inputWrapStyle}>
                <form onSubmit={this.handleSubmit}>
                    <div style={{position: 'relative'}}>
                      {!!loadingImgUrl  ? (<div style={loadingImgWrapStyle}>
                                <img alt='' style={{ width: "100%" }} src={loadingImgUrl} />
                                <div style={loadingCoverStyle}>
                                    <div style={loadingIconWrapStyle}>
                                        <Icon type="loading" size="md" color="#047" />
                                    </div>
                                </div>
                        </div>) : null}
                        <div style={{paddingRight: '2rem'}}>
                             <input value={input} onPaste={this.handlePaste} type="text" onChange={this.handleChange} className="Chat-input" />
                        </div>
                        <div onClick={this.handleToolBoxVisibleToggle} style={{position: 'absolute', right: 0, top: 0}}>
                            <i style={{fontSize: '1.6rem'}} className={`${isToolBoxVisible ? 'icon-minus' : 'icon-add'} iconfont`}></i>
                        </div>
                    </div>
                    <ToolBox ref={this.boxDom} isVisible={isToolBoxVisible} onImgUploading={this.handleImgUploading} updateBottomPadding={updateBottomPadding} />                
                </form>
           </div>
        )
    }
}

export default ContentInput;
