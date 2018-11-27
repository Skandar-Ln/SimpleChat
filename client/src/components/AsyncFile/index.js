import React, { Component } from 'react';
import request from 'axios';
import {Icon} from 'antd-mobile';

class AsyncFile extends Component {
    constructor(props) {
        super(props);
        this.state = {  };

        const fileName = props.fileName;

        request.post('/api/service/oss/get', {
            fileName,
            type: 'file'
        }).then(res => {
            const url = res.data.url;
            this.setState({url});
        })
    }

    render() {
        const url = this.state.url;
        // const fileName = this.props.fileName || '';

        return (
            url ? <a href={url}>[收到一份文件，点击下载]</a>
                : <Icon type="loading" />
        );
    }
}

export default AsyncFile;
