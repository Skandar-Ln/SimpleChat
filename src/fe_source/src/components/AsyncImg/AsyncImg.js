import React, { Component } from 'react';
import request from 'axios';

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

    render() {
        const url = this.state.url;

        return (
            <a href={url}><img style={{maxWidth: '100%'}} src={url} /></a>
        );
    }
}

export default AsyncImg;
