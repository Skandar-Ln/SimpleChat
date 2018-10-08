import React, { Component } from 'react';
import {Grid} from 'antd-mobile';

import ImageUploader from './ImageUploader';

const components = [ImageUploader];

class ToolBox extends Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }

    render() {
        const isVisible = this.props.isVisible;

        return (
            <div style={{
                transition: 'height 0.3s',
                paddingTop: '0.5rem',
                boxSizing: 'border-box',
                display: isVisible ? 'block' : 'none',
                overflow: 'hidden',
                backgroundColor: 'white'
            }}>
                <Grid
                    data={components}
                    // columnNum={4}
                    renderItem={ToolComponent => (
                        <ToolComponent {...this.props} />
                    )}
                />
            </div>
        );
    }
}

export default ToolBox;
