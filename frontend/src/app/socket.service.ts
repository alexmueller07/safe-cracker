import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket;

    constructor() {
        this.socket = io('http://localhost:5000', {
            transports: ['websocket', 'polling']
        });
    }

    crackSafeRealtime(actualCombination: string, speedMultiplier: number = 1) {
        this.socket.emit('crack_safe_realtime', {
            actual_combination: actualCombination,
            speed_multiplier: speedMultiplier
        });
    }

    onProgress(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('progress', (data) => {
                observer.next(data);
            });
        });
    }


    onComplete(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('complete', (data) => {
                observer.next(data);
            });
        });
    }

    onError(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('error', (error) => {
                observer.next(error);
            });
        });
    }


    disconnect() {
        this.socket.disconnect();
    }
}

