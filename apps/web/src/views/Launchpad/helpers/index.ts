import BigNumber from "bignumber.js";
import { DefaultTheme } from "styled-components/dist/types";
import { ILaunchpadItem } from "../types/LaunchpadType";

export const LAUNCHPAD_STATUS = {
	UPCOMING: 'UPCOMING',
	CANCELLED: 'CANCELLED',
	CLAIMABLE: 'CLAIMABLE',
	ENDED: 'ENDED',
	ON_GOING: 'ON_GOING'
}

export const COUNTDOWN_TYPE = {
	ARRAY: 1,
	STRING: 2
}

export const convertTierInfo = (args) => {
  return {
    end: args[0],
    endAddWhiteList: args[1],
    endCancel: args[2],
    maxBuyPerUser: args[3],
    maxCommitAmount: args[4],
    maxStake: args[5],
    minStake: args[6],
    start: args[7],
    startAddWhiteList: args[8],
    startCancel: args[9],
		typeRound: args[9]
  }
}

export const capitalize = (s: string) => {
  return s[0].toUpperCase() + s.slice(1);
}

const formatTime = (_time: number) => {
	if(_time < 10) {
		return `0${_time}`
	}
	return _time
}

export const countdownDate = (countDownDate: number, cb: (_time: any ) => void, type?: number) => {
	const x = setInterval(() => {
		// Get today's date and time
		const now = new Date().getTime();
		// Find the distance between now and the count down date
		const distance = countDownDate - now;
	
		// Time calculations for days, hours, minutes and seconds
		const days = formatTime(Math.floor(distance / (1000 * 60 * 60 * 24)));
		const hours = formatTime(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
		const minutes = formatTime(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
		const seconds = formatTime(Math.floor((distance % (1000 * 60)) / 1000));
		
		// Display the result in the element with id="demo"
		const _time = `${days}d : ${  hours  }h : ${
			minutes  }m : ${  seconds  }s `;
		if(cb) {
			cb(type ? [days, hours, minutes, seconds] : _time);
		}
		// If the count down is finished, write some text
		if (distance < 0) {
			clearInterval(x);
			cb(type ? ['00', '00', '00', '00'] : 0 );
		}

	}, 1000);
	return x
}

export const getStatusNameLaunchpad = (_type: string) => {
	return _type === LAUNCHPAD_STATUS.UPCOMING ? 'Upcoming'
	: _type === LAUNCHPAD_STATUS.CANCELLED ? 'Cancelled'
	: _type === LAUNCHPAD_STATUS.CLAIMABLE ? 'Claimable'
	: _type === LAUNCHPAD_STATUS.ENDED ? 'Ended'
	: 'On Going'
}

export const getStatusNameByTime = (item: ILaunchpadItem, totalCommitByUser?: number, totalCommit?: number) => {
	const _now = Date.now()
	if(item.saleEnd && item.saleEnd < _now) {
		if(totalCommit && BigNumber(totalCommit).lt(item?.softCap)) {
			return 'Cancelled'
		} 
		if(totalCommitByUser && BigNumber(totalCommitByUser).gt(0)) {
			return 'Claimable'
		}
		return 'Ended'
	}
	return getStatusNameLaunchpad(item.status)
}

export const getColorLaunchpadByStatus = (_status: string, theme: DefaultTheme) => {
	return  _status === 'Upcoming' ? theme.colors.yellow
	: _status === 'Cancelled' ? theme.colors.orange
	: _status ===  'Claimable'  ? theme.colors.cyan
	: _status === 'Ended' ? theme.colors.textSubtle
	: theme.colors.primary
}


export const PHASES_TYPE = {
	COMMUNITY: "COMMUNITY",
	WHITELIST: "WHITELIST",
	NONE: "NONE",
	TIER: "TIER",
	APPLY_WHITELIST: "APPLY_WHITELIST",
	IDO_START: 'IDO_START',
	FINISH: 'FINISH',
	UPCOMING: 'UPCOMING'
}
export const PHASES_NONE = [PHASES_TYPE.NONE, PHASES_TYPE.APPLY_WHITELIST, PHASES_TYPE.IDO_START, PHASES_TYPE.FINISH, PHASES_TYPE.UPCOMING]
