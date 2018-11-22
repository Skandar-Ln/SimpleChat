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

            this.props.onImgUploading(URL.createObjectURL(file));

            uploadFile(file).then(res => {
                fileSelectorEl.value = '';
                this.props.onImgUploading('')
            });
        }
    }

    render() {
        return (
            <div style={{position: 'relative', width: '100%', height: '100%'}}>
                <div style={{
                    width: '100%',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}>
                    <i style={{fontSize: '2.6rem', display: 'block'}} className="iconfont icon-image"></i>
                    发送图片
                </div>
                <input
                  ref={(input) => { if (input) { this.fileSelectorInput = input; } }}
                  type="file"
                  accept="image/*"
                  onChange={this.onFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    opacity: 0,
                  }}
                />
            </div>
        );
    }
}

export default ImageUploader;