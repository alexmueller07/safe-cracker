import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';
import { trigger, transition, style, animate } from '@angular/animations';


interface CrackResult {
    attempts: number;
    time_taken: number;
    found_combination?: string;
}


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.5s ease', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('slideUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(30px)' }),
                animate('0.5s ease', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('shake', [
            transition(':enter', [
                style({ transform: 'translateX(0)' }),
                animate('0.1s', style({ transform: 'translateX(-10px)' })),
                animate('0.1s', style({ transform: 'translateX(10px)' })),
                animate('0.1s', style({ transform: 'translateX(-10px)' })),
                animate('0.1s', style({ transform: 'translateX(10px)' })),
                animate('0.1s', style({ transform: 'translateX(0)' }))
            ])
        ])
    ]
})

export class AppComponent {
    actualCombination: string = '';
    result: CrackResult | null = null;
    error: string = '';
    loading: boolean = false;

    // real time tracking
    currentAttempts: number = 0;
    currentGuess: string = '0000000000';
    previousGuess: string = '0000000000';
    isCracking: boolean = false;
    progressPercentage: number = 0;
    estimatedTimeRemaining: number = 0;
    attemptsPerSecond: number = 0;
    lastUpdateTime: number = Date.now();

    // tracking algorithm setup
    completedPositions: number = 0;
    currentPositionAttempts: number = 0;
    positionStartAttempt: number = 1;
    lockedPositions: boolean[] = [false, false, false, false, false, false, false, false, false, false];
    lastCurrentPosition: number = -1;

    // speed control
    speedMultiplier: number = 1;
    speedOptions = [
        { label: '1x', value: 1 },
        { label: '0.25x', value: 0.25 },
        { label: '0.1x', value: 0.1 }
    ];

    constructor(
        private http: HttpClient,
        private socketService: SocketService
    ) {
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socketService.onProgress().subscribe((data: any) => {
            const now = Date.now();
            const timeDiff = (now - this.lastUpdateTime) / 1000;
            if (timeDiff > 0) {
                const attemptsDiff = data.attempts - this.currentAttempts;
                this.attemptsPerSecond = attemptsDiff / timeDiff;
            }
            this.lastUpdateTime = now;

            this.currentAttempts = data.attempts;
            const newGuess = data.current_guess;

            // tracking progress algorithm
            let currentPos = -1;
            for (let i = 0; i < 10; i++) {
                if (!this.lockedPositions[i]) {
                    currentPos = i;
                    break;
                }
            }

            if (currentPos >= 0) {
                const currentDigit = newGuess[currentPos];
                if (this.lastCurrentPosition >= 0 && currentPos > this.lastCurrentPosition) {
                    this.lockedPositions[this.lastCurrentPosition] = true;
                }

                if (this.lastCurrentPosition === currentPos &&
                    this.previousGuess[currentPos] !== '0' &&
                    this.previousGuess[currentPos] === currentDigit &&
                    !this.lockedPositions[currentPos]) {
                    this.lockedPositions[currentPos] = true;
                }

                if (currentDigit === '0') {
                    this.currentPositionAttempts = 0;
                } else {
                    const digitValue = parseInt(currentDigit);
                    this.currentPositionAttempts = digitValue;
                }

                this.lastCurrentPosition = currentPos;
            }
            let actualCompleted = 0;
            for (let i = 0; i < 10; i++) {
                if (this.lockedPositions[i]) {
                    actualCompleted = i + 1;
                } else {
                    break;
                }
            }
            this.completedPositions = actualCompleted;

            // calculate progress percentage algorithm
            let baseProgress = this.completedPositions * 10;

            if (this.completedPositions < 10 && currentPos >= 0) {
                const currentDigit = newGuess[currentPos];
                if (currentDigit !== '0') {
                    const digitValue = parseInt(currentDigit);
                    const positionProgress = Math.min(1, digitValue / 9);
                    baseProgress += positionProgress * 10;
                }
            }

            this.progressPercentage = Math.min(100, baseProgress);
            this.currentGuess = newGuess;
            this.previousGuess = newGuess;
        });


        this.socketService.onComplete().subscribe((data: any) => {
            this.result = {
                attempts: data.attempts,
                time_taken: data.time_taken,
                found_combination: data.found_combination
            };
            this.isCracking = false;
            this.loading = false;
            this.progressPercentage = 100;
            this.attemptsPerSecond = 0;
        });

        this.socketService.onError().subscribe((error: any) => {
            this.error = error.message;
            this.isCracking = false;
            this.loading = false;
            this.attemptsPerSecond = 0;
        });
    }

    onKeypadClick(digit: string) {
        if (this.isCracking) return;

        if (this.actualCombination.length < 10) {
            this.actualCombination += digit;
            this.error = '';
        }
    }


    onClear() {
        if (this.isCracking) return;
        this.actualCombination = '';
        this.error = '';
    }

    onBackspace() {
        if (this.isCracking) return;
        if (this.actualCombination.length > 0) {
            this.actualCombination = this.actualCombination.slice(0, -1);
            this.error = '';
        }
    }

    onSubmit() {
        if (!this.actualCombination || this.actualCombination.length !== 10 || !/^\d+$/.test(this.actualCombination)) {
            this.error = 'Please enter a valid 10-digit combination';
            return;
        }

        this.error = '';
        this.result = null;
        this.currentAttempts = 0;
        this.currentGuess = '0000000000';
        this.previousGuess = '0000000000';
        this.progressPercentage = 0;
        this.attemptsPerSecond = 0;
        this.lastUpdateTime = Date.now();

        this.completedPositions = 0;
        this.currentPositionAttempts = 0;
        this.positionStartAttempt = 1;
        this.lockedPositions = [false, false, false, false, false, false, false, false, false, false];
        this.lastCurrentPosition = -1;


        this.crackWithRealtime();
    }

    crackWithRealtime() {
        this.isCracking = true;
        this.loading = true;
        this.socketService.crackSafeRealtime(this.actualCombination, this.speedMultiplier);
    }

    onSpeedChange(speed: number) {
        if (!this.isCracking) {
            this.speedMultiplier = speed;
        }
    }
}






