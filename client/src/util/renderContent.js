import React from 'react';
import AsyncImg from '../components/AsyncImg';

export default function({content = '', type}) {
    if (type === 'img') {
        return <AsyncImg fileName={content} />
    }

    return content;
}
