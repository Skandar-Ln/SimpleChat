import React, { Component } from 'react';

class CreateNewRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {  };
        this.createNewRoomAlert = this.createNewRoomAlert.bind(this);
    }

    createNewRoomAlert() {
        this.props.createNewRoomAlert();
    }

    render() {
        return (
            <div style={{position: 'relative', width: '100%', height: '100%'}} onClick={this.createNewRoomAlert}>
                <div style={{
                    width: '100%',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}>
                    <i style={{fontSize: '2.6rem', display: 'block'}} className="iconfont icon-chat-1"></i>
                    新的会话
                </div>
            </div>
        );
    }
}

export default CreateNewRoom;