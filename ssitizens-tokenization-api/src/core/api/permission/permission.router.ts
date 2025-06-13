import {Application} from 'express';
import {autoInjectable, singleton} from 'tsyringe';
import {BaseRouter} from '../../../shared/interfaces/api.interface.js';
import ApiUtils from '../../../shared/utils/api.utils.js';
import PermissionApi from './permission.api.js';

@singleton()
@autoInjectable()
export default class PermissionRouter extends BaseRouter {
  constructor(
    private apiUtils: ApiUtils,
    private permissionApi: PermissionApi,
  ) {
    super(apiUtils, "");
    this.path = "/api/permissions"
  }

  async loadRoutes(app: Application): Promise<void> {
    this.router.route("/:address").get(this.executeHandler(this.permissionApi.getPermissions));
    app.use(this.path, this.router);
  }
}
