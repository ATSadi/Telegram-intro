from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import errorcode
import os
from dotenv import load_dotenv
import asyncio
from pytonconnect import TonConnect

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)

# Database configuration using environment variables
db_config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT')),
    'ssl_ca': os.getenv('SSL_CA')  # Path to CA certificate
}

# Establish a database connection
def get_db_connection():
    try:
        cnx = mysql.connector.connect(**db_config)
        return cnx
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
    return None

@app.route('/user/<user_id>', methods=['GET'])
def get_user_score(user_id):
    cnx = get_db_connection()
    if not cnx:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT score FROM users WHERE userId = %s", (user_id,))
    result = cursor.fetchone()
    cursor.close()
    cnx.close()
    if result:
        return jsonify({'score': result['score']})
    else:
        return jsonify({'score': 0})

@app.route('/update-score', methods=['POST'])
def update_user_score():
    data = request.get_json()
    user_id = data['userId']
    score = data['score']
    cnx = get_db_connection()
    if not cnx:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = cnx.cursor()
    cursor.execute("UPDATE users SET score = %s WHERE userId = %s", (score, user_id))
    cnx.commit()
    cursor.close()
    cnx.close()
    return jsonify({'message': 'Score updated successfully'})

@app.route('/create-user', methods=['POST'])
def create_user():
    data = request.get_json()
    user_id = data['userId']
    invite_link = f"https://teleintro.netlify.app/?token={user_id}"
    cnx = get_db_connection()
    if not cnx:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = cnx.cursor()
    cursor.execute("INSERT INTO users (userId, score) VALUES (%s, 0) ON DUPLICATE KEY UPDATE userId=userId", (user_id,))
    cnx.commit()
    cursor.close()
    cnx.close()
    return jsonify({'link': invite_link})

# TON Connect integration
async def main():
    connector = TonConnect(
        manifest_url='https://teleintro.netlify.app/tonconnect-manifest.json',
    )
    is_connected = await connector.restore_connection()
    print('is_connected:', is_connected)

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
    app.run(debug=True)
