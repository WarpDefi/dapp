import { Address } from "viem"

export interface ITierInfo {
  minStake: number
	maxStake: number
  maxBuyPerUser: number | string
  start: number 
  end: number
	startAddWhiteList: number
	endAddWhiteList: number
  maxCommitAmount: number | string
  startCancel: number
  endCancel: number
  typeRound: string,
	name?: string,
	percentCancel?: number,
	img?: string

}

export interface IUserWhiteListInfo {
  isWhiteList: boolean,
	giveBackAmount: number,
  u2uCommitted: number
}

export interface ILaunchpadItem {
	contractAddress: Address,
	priceToken: number,
	projectImageThumbnail: string,
	projectName: string,
	saleEnd: number,
	saleStart: number,
	shortDescription: string,
	status: string,
	tokenLogo: string,
	tokenName: string,
	totalRaise: number
	tokenSymbol: string
	softCap: number
}

export interface IPagination {
	totalPages: number,
	totalRecords: number,
	page: number,
	size: number
}

export interface ISocial {
	type: string,
	link: string
}

export interface IPhase {
	name: string,
	startTime: number,
	endTime: number,
	isActive: boolean,
	imageUrl: string | null,
	contractAddress: Address,
	type: string
	minStake: number
	maxStake: number
	endSaleTime: number
	maxAmountCommitPerUser: number
}

export interface ITokenomics {
	color: string,
	value: string,
	label: string,
}

export interface ILaunchpadDetail {
	tokenName: string,
	tokenSymbol: string,
	tokenDecimals: number,
	totalSupply: number,
	tokenAddress: string,
	tokenLogo: string,
	projectName: string,
	description: string,
	shortDescription: string,
	projectImageThumbnail: string,
	contractAddress: Address,
	priceToken: number,
	totalRaise: number,
	totalSale: number,
	softCap: number,
	snapshotTime: number,
	saleStart: number,
	saleEnd: number,
	status: string,
	socials: ISocial[],
	phases: IPhase[],
	tokenomics: ITokenomics[],
}

export interface IUserCommit {
	u2uCommitted: number,
	giveBackAmount: number,
	isWhiteList: boolean
}

export interface ITimeOfPhase {
	startTime: number
	endTime: number
}

export interface ICommittedItem {
	id: string
	u2uAmount: string
	roundType: string
	roundAddress: Address
	startCancel: number
	endCancel: number
	isClaimed: boolean
}

export interface IHistoryTransaction {
	hash: string
	u2uAmount: any
	roundType: string
	processTime: number
	transactionType: string
	tokenAmount: any
	roundAddress: string
}