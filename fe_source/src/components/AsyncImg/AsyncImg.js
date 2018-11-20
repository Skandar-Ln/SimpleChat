import React, { Component } from 'react';
import request from 'axios';
// import Zmage from 'react-zmage'
import { SingleImgView } from 'react-imageview';
import {Icon} from 'antd-mobile';
import 'react-imageview/dist/react-imageview.min.css';

let comboCount = 0;

document.addEventListener('click', e => {
    const className = e.target.className;

    if (className === 'imagelist-item-img' || className === 'imagelist-item') {
        const thisCombo = ++comboCount;

        setTimeout(() => {
            if (comboCount < 2) {
                SingleImgView.hide();
            }

            if (thisCombo === comboCount) {
                comboCount = 0;
            }
        }, 200);
    }
});

class AsyncImg extends Component {
    constructor(props) {
        super(props);
        this.state = {  };

        const fileName = props.fileName;

        request.post('/api/service/oss/get', {
            fileName
        }).then(res => {
            const url = res.data.url;
            const img = new Image();
            img.src = url;

            img.onload = () => {
                // this.props.onLoad && this.props.onLoad(url);
                this.setState({url});
            };
        })
    }

    handleClose = e => {
        SingleImgView.hide();
    }

    handleClick = e => {
        const url = this.state.url;

        const imagelist = [url]

        // 仅创建一个ImageView实例
        SingleImgView.show({ 
            imagelist, 
            close: this.handleClose
        });
    }

    render() {
        const url = this.state.url;

        return (
            url ? <img onLoad={this.props.onLoad} onClick={this.handleClick} style={{maxWidth: '100%', maxHeight: '12rem'}} src={url} />
                : <Icon type="loading" />
        );
    }
}

export default AsyncImg;
