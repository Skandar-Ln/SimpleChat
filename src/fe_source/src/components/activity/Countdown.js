import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import './Countdown.css';

const endTime = '2018-03-01 18:40';

export default class Countdown extends Component {
    state = {
        countdownStr: ''
    }

    // componentWillMount = () => {
    //     this.interval = setInterval(this.tick, 1000);
    //     this.tick();
    // }

    // componentWillUnmount = () => {
    //     clearInterval(this.interval);
    // }

    tick = () => {
        const time = moment(endTime) - moment();
        const hour = Math.floor(time / 1000 / 60 / 60);
        const minute = Math.floor(time / 1000 / 60 % 60);
        const second = Math.floor(time / 1000 % 60);
        this.setState({
            countdownStr: `${hour} 时 ${minute} 分 ${second} 秒`
        })
    }

    render() {
        return (
            <div className="Countdown">
                Welcome home
            </div>
        );
    }
}
