import { EventEmitter } from "events";

class EventEmitterEx extends EventEmitter
{

    /**
     * Subscribes the listener to the given event and returns a
     * callback to unsubscribe from the event
     */
    onOff(event: string | symbol, listener: (...args: any[]) => void): ()=>void
    {
        this.on(event,listener);
        return ()=>this.off(event,listener);

    }

    /**
     * Same as onOff but the listener function is called before subscribing to the event.
     */
    onOffInit(event: string | symbol, listener: (...args: any[]) => void): ()=>void
    {
        listener();
        return this.onOff(event,listener);

    }

    emitProperty<T, K extends keyof T>(self:T,propertyName:K)
    {
        this.emit(propertyName as string);
    }

}

export default EventEmitterEx;