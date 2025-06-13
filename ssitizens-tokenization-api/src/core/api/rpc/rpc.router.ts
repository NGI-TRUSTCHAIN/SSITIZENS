import {Application} from 'express';
import {autoInjectable, singleton} from 'tsyringe';
import {BaseRouter} from '../../../shared/interfaces/api.interface.js';
import ApiUtils from '../../../shared/utils/api.utils.js';
import RpcApi from './rpc.api.js';

@singleton()
@autoInjectable()
export default class RpcRouter extends BaseRouter {
  constructor(
    private apiUtils: ApiUtils,
    private rpcApi: RpcApi,
  ) {
    super(apiUtils, '');
    this.path = "/rpc"
  }

  async loadRoutes(app: Application): Promise<void> {
    await this.rpcApi.init();
    this.router
      .route("")
      .post(this.executeHandler(this.rpcApi.rpcHandlerApi));
    app.use(this.path, this.router);
  }
}
