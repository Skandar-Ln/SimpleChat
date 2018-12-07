import React, { Component } from 'react';
import {Grid} from 'antd-mobile';

import ImageUploader from './ImageUploader';
import FileUploader from './FileUploader.js';
import CreateNewRoom from './CreateNewRoom.js';

const components = [ImageUploader, FileUploader, CreateNewRoom];

class ToolBox extends Component {
    constructor(props) {
        super(props);
        this.state = {  };
        this.boxDom = React.createRef();
    }

    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.isVisible == this.props.isVisible) {
            return false;
        }
        return true;
    }

    componentDidUpdate() {
        console.log('boxDom', this.boxDom)
        const initPadding = 42;
        const { isVisible, updateBottomPadding } = this.props;
        const  offsetHeight = Number(this.boxDom.current.offsetHeight);
        if (isVisible) {
            updateBottomPadding(offsetHeight + initPadding);
        }
        if (!isVisible) {
            updateBottomPadding(initPadding);
        }
    }

    render() {
        const isVisible = this.props.isVisible;

        return (
            <div 
                ref={this.boxDom}
                style={{
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
