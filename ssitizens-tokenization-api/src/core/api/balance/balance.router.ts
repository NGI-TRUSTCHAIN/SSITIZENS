import {Application} from 'express';
import {autoInjectable, singleton} from 'tsyringe';
import {BaseRouter} from '../../../shared/interfaces/api.interface.js';
import ApiUtils from '../../../shared/utils/api.utils.js';
import BalanceApi from './balance.api.js';

@singleton()
@autoInjectable()
export default class BalanceRouter extends BaseRouter {
  constructor(
    private apiUtils: ApiUtils,
    private balanceApi: BalanceApi,
  ) {
    super(apiUtils, "");
    this.path = "/api/balance"
  }

  async loadRoutes(app: Application): Promise<void> {
    this.router.route("/tokens/:address").get(this.executeHandler(this.balanceApi.getTokensBalance));
    this.router.route("/ethers/:address").get(this.executeHandler(this.balanceApi.getEthersBalance));
    this.router.route("/all/:address").get(this.executeHandler(this.balanceApi.getBalances));
    app.use(this.path, this.router);
  }
}
