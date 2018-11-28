import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import {Modal, Toast} from 'antd-mobile';
import request from 'axios';

class CreateNewRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomName: '',
            key: '',
            showNewRoomAdressAlert: false
        };
        this.createNewRoomAlert = this.createNewRoomAlert.bind(this);
        this.handleNewRoomInfoSet = this.handleNewRoomInfoSet.bind(this);
        this.renderNewRoomAdress = this.renderNewRoomAdress.bind(this);
    }

    handleNewRoomInfoSet(key, e) {
        const value = e.currentTarget.value;
        console.log(key, value)
        this.setState({
            [key]: value
        })
    }

    renderNewRoomAdress() {
        const newRoomAddress = `${window.location.origin}/${this.state.chatId}`;
        return  (<Modal
        visible={this.state.showNewRoomAdressAlert}
        transparent
        maskClosable={false}

        title="创建新聊天房间成功"
        footer={[{ text: '确定', onPress: () => this.setState({showNewRoomAdressAlert: false})}]}
      >
        <div>
            长按复制 或 点击后在新窗口打开
        </div>
        <div>
            <a href={newRoomAddress} target='_blank' rel="noopener noreferrer" style={{wordBreak: 'break-all'}}>{newRoomAddress}</a>
        </div>
      </Modal>)
    }

    createNewRoomAlert() {
        const that = this;
        // 新建聊天页弹窗
        return Modal.alert('创建新的聊天房间',
                <div className="am-modal-input-container" style={{padding: '0 10px'}}>
                    <div className="am-modal-input">
                        <label><input type="text" onChange={(e) => that.handleNewRoomInfoSet('roomName', e)} placeholder="房间名称 (必填)" /></label>
                    </div>
                    <div className="am-modal-input">
                         <label><input type="text" onChange={(e) => that.handleNewRoomInfoSet('key', e)} placeholder="暗号 (私密房间，非必填)" /></label>
                     </div>
                </div>
                ,
            [
                {
                    text: '取消',
                    onPress: value => {
                        console.log('取消创建新聊天房间')
                    },
                },
                {
                    text: '创建',
                    onPress: v => {
                        return new Promise((resolve, reject) => {
                            const { roomName, key } = this.state;
                            if (isEmpty(roomName)) {
                                Toast.info('房间名必填', 1);
                                return reject();
                            };
                            const path = isEmpty(key) ? 'public' : 'secret';// 已填写房间名, 且未填写暗号，创建公共聊天窗口, 否则，创建私有房间
                            request.post(`/api/chat/${path}/create`, {
                                            roomName,
                                            key,
                                        }).then(res => {
                                            if (res && (res.status == 200) && res.data.chatId) {
                                                resolve();
                                                console.log('关闭')
                                                this.setState({
                                                    chatId: res.data.chatId,
                                                    key: '',
                                                    roomName: '',
                                                    showNewRoomAdressAlert: true
                                                });
                                            }
                                        })
                        })
                    }
                }
            ])
    }

    render() {
        const wrapStyle = {position: 'relative', width: '100%', height: '100%'};
        const innerWrapStyle = {position: 'relative', width: '100%', height: '100%'};
        const iconWrapStyle = {width: '100%', position: 'absolute', top: '50%', transform: 'translateY(-50%)'};
        return (
            <div style={wrapStyle}>
                <div style={innerWrapStyle} onClick={this.createNewRoomAlert}>
                    <div style={iconWrapStyle}>
                        <i style={{fontSize: '2.6rem', display: 'block'}} className="iconfont icon-chat-1"></i>
                        新的会话
                    </div>
                </div>
                    {this.renderNewRoomAdress()}
            </div>
        );
    }
}

export default CreateNewRoom;