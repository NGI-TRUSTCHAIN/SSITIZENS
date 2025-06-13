import {autoInjectable, singleton} from 'tsyringe';
import {Request, Response} from 'express';
import {HealthState} from '../../../shared/interfaces/health.interface.js';

@singleton()
@autoInjectable()
export default class HealthApi {
  health = async (req: Request, res: Response) => {
    const healthState: HealthState = {
      ok: true,
    };
    return res.status(200).json(healthState);
  };
}
