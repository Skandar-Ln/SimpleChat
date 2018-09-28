import React, { Component } from 'react';
import request from 'axios';
import Zmage from 'react-zmage'

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

//     handleClick = e => {
//         const url = this.state.url;

//         var imgElem = new Image();
//         imgElem.src = url;
//         // document.body.appendChild(imgElem);
// debugger
//         // zoom.setup(imgElem);
//     }

    render() {
        const url = this.state.url;

        return (
            <Zmage style={{maxWidth: '100%'}} src={url} />
        );
    }
}

export default AsyncImg;
