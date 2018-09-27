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
        return (
            <img src={this.state.url} />
        );
    }
}

export default AsyncImg;
