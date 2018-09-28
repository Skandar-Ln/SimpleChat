import React, { Component } from 'react';
import uploadFile from '../../util/uploadFile';

class ImageUploader extends Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }

    onFileChange = e => {
        const fileSelectorEl = this.fileSelectorInput
        if (fileSelectorEl && fileSelectorEl.files && fileSelectorEl.files.length) {
            const file = fileSelectorEl.files[0];

            uploadFile(file).then(res => {
                fileSelectorEl.value = '';
            });
        }
    }

    render() {
        return (
            <input
              ref={(input) => { if (input) { this.fileSelectorInput = input; } }}
              type="file"
              accept="image/*"
              onChange={this.onFileChange}
            />
        );
    }
}

export default ImageUploader;