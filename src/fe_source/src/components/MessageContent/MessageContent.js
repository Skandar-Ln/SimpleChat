import _ from 'lodash';
import React, { Component } from 'react';
import AsyncImg from '../AsyncImg';

export default function({content = '', type}) {
    if (type === 'img') {
        return <AsyncImg fileName={content} />
    }

    return <span style={{wordBreak: 'break-word'}}>{content}</span>;
}