import React, { Component } from 'react';
import request from 'axios';
import Zmage from 'react-zmage'
import { SingleImgView } from 'react-imageview'
import 'react-imageview/dist/react-imageview.min.css'

class AsyncImg extends Component {
    constructor(props) {
        super(props);
        this.state = {  };

        const fileName = props.fileName;

        request.post('/api/service/oss/get', {
            fileName
        }).then(res => {
            this.setState({url: res.data.url});
        })
    }

    handleClick = e => {
        const url = this.state.url;

        const imagelist = [url]

        // 仅创建一个ImageView实例
        SingleImgView.show({ 
            imagelist, 
            close: () => { SingleImgView.hide() } 
        });
    }

    render() {
        const url = this.state.url;

        return (
            <img onClick={this.handleClick} style={{maxWidth: '100%'}} src={url} />
        );
    }
}

export default AsyncImg;
