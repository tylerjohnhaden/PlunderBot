import json
import os

from gitterpy.client import GitterClient


def lambda_handler(event, context):
    token = os.environ['GITTER_API_TOKEN']
    room = os.environ['GITTER_FAUCET_ROOM_NAME']
    address = os.environ['KOVAN_ADDRESS']

    try:

        # create a Gitter API client
        gitter = GitterClient(token)

        # always assume we aren't in the room yet, idempotent call
        gitter.rooms.join(room)

        # send a valid Ethereum/Kovan address
        gitter.messages.send(room, address)

    except Exception as e:

        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }

    return {
        'statusCode': 200,
        'body': json.dumps('Success, I guess')
    }
