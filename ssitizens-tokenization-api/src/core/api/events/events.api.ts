import {autoInjectable, singleton} from 'tsyringe';
import {Request, Response} from 'express';
import Logger from '@/shared/classes/logger.js';
import EventsService from '@/services/events/events.service.js';

@singleton()
@autoInjectable()
export default class EventsApi {
  constructor(
    private logger: Logger,
    private eventsService: EventsService,
  ) {}

  getEvents = async (req: Request, res: Response) => {
    try {
      const index = parseInt(req.query.index as string) || 0;
      const size = parseInt(req.query.size as string) || 10;

      const events = await this.eventsService.getEvents(index, size);
      return res.status(200).json(events);
    } catch (error: any) {
      if (error.message.includes("índice") || error.message.includes("tamaño")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  getEventsByTxHash = async (req: Request, res: Response) => {
    try {
      const txHash = req.params.tx_hash;
      if (!txHash) {
        return res.status(400).json({ error: "El hash de la transacción es requerido" });
      }

      const events = await this.eventsService.getEventsByTxHash(txHash);
      return res.status(200).json(events);
    } catch (error: any) {
      if (error.message.includes("No se encontraron eventos")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}
