import {autoInjectable, singleton} from 'tsyringe';
import {Request, Response} from 'express';
import Logger from '@/shared/classes/logger.js';
import BalanceService from '@/services/balance/balance.service.js';


@singleton()
@autoInjectable()
export default class BalanceApi {
  constructor(
    private logger: Logger,
    private balanceService: BalanceService,
  ) {}

  getEthersBalance = async (req: Request, res: Response) => {
    const address = req.params.address;
    const response = await this.balanceService.getEthers(address);
    return res.status(200).json(response);
  };
  getTokensBalance = async (req: Request, res: Response) => {
    const address = req.params.address;
    const response = await this.balanceService.getTokens(address);
    return res.status(200).json(response);
  };

  getBalances = async (req: Request, res: Response) => {
    const address = req.params.address;
    const response = await this.balanceService.getBalances(address);
    return res.status(200).json(response);
  };

}
