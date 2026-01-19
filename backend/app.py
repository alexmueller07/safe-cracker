from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

def crack_safe(actual_combination: str, callback=None, speed_multiplier=1):
    #Slightly updated version of algorithm for part 1. 
    def sound_feedback(guess: str, actual: str) -> int:
        return sum(x == y for x, y in zip(guess, actual))

    timer = time.time()
    guess = ["0"] * 10
    attempts = 1
    base = sound_feedback("".join(guess), actual_combination)
    base_delay = 0.005 
    delay = base_delay / speed_multiplier if speed_multiplier > 0 else 0
    
    if callback:
        callback(attempts, "".join(guess))
        if delay > 0 and speed_multiplier < 1:
            time.sleep(delay)


    for i in range(10):
        original = guess[i]
        found = False
        
        for j in "0123456789":
            if j == original:
                continue

            old = guess[i]
            guess[i] = j
            attempts += 1
            
            if callback:
                callback(attempts, "".join(guess))
                if delay > 0 and speed_multiplier < 1:
                    time.sleep(delay)

            new_score = sound_feedback("".join(guess), actual_combination)

            if new_score > base:
                base = new_score
                found = True
                break
            else:
                guess[i] = old

    output = "".join(guess)

    return output, attempts, (time.time() - timer)

#Required Post api endpoint to /api/crack_safe
@app.route('/api/crack_safe/', methods=['POST'])
def crack_safe_endpoint():
    data = request.get_json()
    actual_combination = data.get('actual_combination', '')
    
    if not actual_combination or len(actual_combination) != 10 or not actual_combination.isdigit():
        return jsonify({'error': 'invalid combination'}), 400
    
    found_combination, attempts, time_taken = crack_safe(actual_combination)
    
    return jsonify({
        'attempts': attempts,
        'time_taken': round(time_taken, 2),
        'found_combination': found_combination
    })


#To allow cracking speed to be adjusted and show real time progress
@socketio.on('crack_safe_realtime')
def handle_crack_safe_realtime(data):
    actual_combination = data.get('actual_combination', '')
    speed_multiplier = data.get('speed_multiplier', 1)
    
    if not actual_combination or len(actual_combination) != 10 or not actual_combination.isdigit():
        emit('error', {'message': 'invalid combination'})
        return
    
    if speed_multiplier <= 0:
        speed_multiplier = 1
    


    session_id = request.sid if hasattr(request, 'sid') else None
    
    def progress_callback(attempts, current_guess):
        if session_id:
            socketio.emit('progress', {
                'attempts': attempts,
                'current_guess': current_guess
            }, room=session_id)
        else:
            emit('progress', {
                'attempts': attempts,
                'current_guess': current_guess
            })
    
    found_combination, attempts, time_taken = crack_safe(actual_combination, progress_callback, speed_multiplier)
    
    emit('complete', {
        'attempts': attempts,
        'time_taken': round(time_taken, 2),
        'found_combination': found_combination
    })

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)















