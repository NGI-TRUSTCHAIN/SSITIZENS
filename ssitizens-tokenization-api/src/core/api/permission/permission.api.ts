import {autoInjectable, singleton} from 'tsyringe';
import {Request, Response} from 'express';
import Logger from '@/shared/classes/logger.js';
import PermissionService from '@/services/permission/permission.service.js';


@singleton()
@autoInjectable()
export default class BalanceApi {
  constructor(
    private logger: Logger,
    private permissionService: PermissionService,
  ) {}

  getPermissions = async (req: Request, res: Response) => {
    const address = req.params.address;
    const response = await this.permissionService.permissions(address);
    return res.status(200).json(response);
  };

}
