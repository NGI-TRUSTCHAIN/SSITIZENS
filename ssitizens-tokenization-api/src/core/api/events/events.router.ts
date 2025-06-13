import {Application} from 'express';
import {autoInjectable, singleton} from 'tsyringe';
import {BaseRouter} from '../../../shared/interfaces/api.interface.js';
import ApiUtils from '../../../shared/utils/api.utils.js';
import EventsApi from './events.api.js';

@singleton()
@autoInjectable()
export default class EventsRouter extends BaseRouter {
  constructor(
    private apiUtils: ApiUtils,
    private eventsApi: EventsApi,
  ) {
    super(apiUtils, "");
    this.path = "/api"
  }

  async loadRoutes(app: Application): Promise<void> {
    this.router
      .route("/events")
      .get(this.executeHandler(this.eventsApi.getEvents));
    
    this.router
      .route("/events/:tx_hash")
      .get(this.executeHandler(this.eventsApi.getEventsByTxHash));
    
    app.use(this.path, this.router);
  }
}
