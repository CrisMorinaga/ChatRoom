import random
from string import ascii_uppercase
from datetime import datetime

from dotenv import load_dotenv
import os

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room, send

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship


# Load variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# Secondary Association Table
user_room_association = db.Table(
    'user_room_association',
    db.Column('user_id', db.Integer, db.ForeignKey('Users.id')),
    db.Column('room_id', db.String(4), db.ForeignKey('Rooms.id')),
)


class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(250), nullable=False, unique=True)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)

    messages = relationship("Message", back_populates="user")
    rooms = relationship("Room", secondary=user_room_association, back_populates="users")


class Room(db.Model):
    __tablename__ = 'Rooms'
    id = db.Column(db.String(4), primary_key=True)
    number_of_users = db.Column(db.Integer, nullable=True)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)

    messages = relationship("Message", back_populates="room")
    users = relationship("User", secondary=user_room_association, back_populates="rooms")


class Message(db.Model):
    __tablename__ = 'Messages'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("Users.id"))
    room_id = db.Column(db.String(4), db.ForeignKey("Rooms.id"))
    message = db.Column(db.String(50), nullable=False)
    date_added = db.Column(db.DateTime, default=datetime.now)

    room = relationship("Room", back_populates="messages", foreign_keys=[room_id])
    user = relationship("User", back_populates="messages")


def generate_unique_code(length):
    while True:
        code = ""
        code_in_rooms = Room.query.filter_by(id=code).first()
        for _ in range(length):
            code += random.choice(ascii_uppercase)
        if not code_in_rooms:
            break
    return code


connected_users = {}


@app.route('/', methods=['POST'])
def home():
    name = request.json.get('name')
    code = request.json.get('code')
    join = request.json.get('join')
    room_exists = Room.query.filter_by(id=code).first()

    user = User.query.filter_by(username=name.lower()).first()
    if not user:
        user = User(username=name.lower())
        db.session.add(user)
        db.session.commit()

    room = code
    if not join:
        room = generate_unique_code(4)
        create_room = Room(id=room)
        db.session.add(create_room)
        create_room.number_of_users = 0
        db.session.commit()
    elif not room_exists:
        return {"message": "That room does not exist."}, 409

    print('connecting: ', connected_users)
    if room not in connected_users:
        connected_users[room] = [name]
    else:
        if name in connected_users[room]:
            return {"message": "Username already in use."}, 409
        connected_users[room].append(name)
    print('connected: ', connected_users)

    response = {
        "username": name,
        "room": room
    }
    print(f"Session created for user: {name}, room: {room}.")
    return jsonify(response), 200


@socketio.on('client_connect')
def client_connect(data):
    try:
        name = data['username']
        room = data['room']
        user_socket_id = request.sid
        user = User.query.filter_by(username=name.lower()).first()
        rooms = Room.query.filter_by(id=room).first()
        messages = Message.query.filter_by(room_id=room).all()
    except KeyError as error:
        print(error)
        return
    else:
        if not rooms:
            leave_room(room)
            return
        join_room(room)
        if not user.rooms:
            user.rooms.append(rooms)
            rooms.number_of_users += 1
            db.session.commit()
        else:
            rooms_objects_id = [room.id for room in user.rooms]
            if room not in rooms_objects_id:
                user.rooms.append(rooms)
                rooms.number_of_users += 1
                db.session.commit()

        if messages:
            for msg in messages:
                user_name = User.query.filter_by(id=msg.user_id).first()
                content = {
                    "name": user_name.username.title(),
                    "message": msg.message,
                    "date": msg.date_added.strftime("%H:%M")
                }
                send(content, to=user_socket_id)
        send({"name": name, "message": "has entered the room.", "date": datetime.now().strftime("%H:%M"),
              "enter_or_leave_message": True}, to=room, skip_sid=user_socket_id)
        print(f"{name} joined the {room}.")


@socketio.on("message")
def message(data):
    msg = data['message']
    name = data['username']
    room = data['room']
    rooms = Room.query.filter_by(id=room).first()
    user = User.query.filter_by(username=name.lower()).first()
    if not rooms:
        return

    new_message = Message(room=rooms, user=user, message=msg)
    db.session.add(new_message)
    db.session.commit()

    content = {
        "name": name,
        "message": msg,
        "date": new_message.date_added.strftime("%H:%M")
    }
    send(content, to=room)
    print(f'{name} said: {msg}')


@socketio.on('clean_dict')
def clean_room_dict(data):
    print('cleaning: ', connected_users)
    try:
        name = data['username']
        room = data['room']
        if room in connected_users and name in connected_users[room]:
            del connected_users[room][connected_users[room].index(name)]
        print('cleaned', connected_users)
    except AttributeError as error:
        print(error)
        return


@socketio.on('client_disconnect')
def client_disconnect(data):
    try:
        name = data["username"]
        room = data["room"]
        rooms = Room.query.filter_by(id=room).first()
        user = User.query.filter_by(username=name.lower()).first()
    except KeyError:
        return
    else:
        leave_room(room)
        user.rooms.remove(rooms)
        rooms.number_of_users -= 1
        db.session.commit()
        if rooms.number_of_users >= 1:
            send({"name": name, "message": "has left the room.", "enter_or_leave_message": True,
                  "date": datetime.now().strftime("%H:%M")}, to=room)
        print(f"{name} has left the {room}.")


if __name__ == '__main__':
    socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
