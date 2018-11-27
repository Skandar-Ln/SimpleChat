import React, { Component } from 'react';
import uploadFile from '../../util/uploadFile';

class ContentInput extends Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }

    handlePaste = e => {
        const item = e.clipboardData.items[0];
        // const chatId = this.props.chatId || '';

        if (item.kind === 'file') {
            const file = item.getAsFile();

            this.props.onImgUploading(URL.createObjectURL(file));

            uploadFile(file).then(res => {
                this.props.onImgUploading('');
            });
        }
    }

    render() {
        const {value} = this.props;

        return (
            <input value={value} onPaste={this.handlePaste} type="text" onChange={this.props.onChange} className="Chat-input" />
        );
    }
}

export default ContentInput;
