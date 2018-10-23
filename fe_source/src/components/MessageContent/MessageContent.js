import React, { Component } from 'react';
import startsWith from 'lodash/startsWith';

import AsyncImg from '../AsyncImg';
import AsyncFile from '../AsyncFile';

const urlRegex = /\b\S+\.(com|wang|net|me|cn|fun|org|io|im)([\/\?]\S*)?\b/g;

const renderContent = content => {
    if (!urlRegex.test(content)) {
        return content;
    }

    const urledContnet = content.replace(urlRegex, function(match) {
        const a = document.createElement('a');
        const href = startsWith(match, 'http') ? match : `//${match}`;
        a.setAttribute('href', href);
        a.setAttribute('target', '_blank');
        a.innerText = match;

        return a.outerHTML;
    });

    return (
        <div dangerouslySetInnerHTML={{__html:urledContnet}}></div>  
    );
}

export default function({content = '', type, onImgLoad}) {
    if (!type) {
        return <span style={{
            wordBreak: 'break-word',
            fontSize: 16
        }}>{renderContent(content)}</span>;
    }

    if (type === 'img') {
        return <AsyncImg onLoad={onImgLoad} fileName={content} />
    }

    return <AsyncFile fileName={content} />
}
