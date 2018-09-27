import React, { Component } from 'react';
import uploadFile from '../../util/uploadFile';

class ContentInput extends Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }

    handlePaste = e => {
        const item = e.clipboardData.items[0];
        const chatId = this.props.chatId || '';

        if (item.kind === 'file') {
            const file = item.getAsFile();
            uploadFile(chatId, file);
        }
    }

    render() {
        return (
            <input onPaste={this.handlePaste} type="text" value={this.state.input} onChange={this.props.onChange} className="Chat-input" />
        );
    }
}

export default ContentInput;
