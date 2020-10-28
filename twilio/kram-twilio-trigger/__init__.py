import logging

import os
from twilio.rest import Client
import azure.functions as func
import json


def main(req: func.HttpRequest) -> func.HttpResponse:
  logging.info('Python HTTP trigger function processed a request.')
  # Your Account Sid and Auth Token from twilio.com/console
  # and set the environment variables. See http://twil.io/secure
  account_sid = os.environ['TWILIO_ACCOUNT_SID']
  auth_token = os.environ['TWILIO_AUTH_TOKEN']
  client = Client(account_sid, auth_token)

  token = client.tokens.create()

  logging.info(f"Token request complete")

  if token:
    # token_ice_servers = [
    #   {
    #     "username": s.username if s.username else "",
    #     "credential": s.credential if s.credential else "",
    #     "url": s.url
    #   } for s in token.ice_servers
    # ]
    token_jsonable = {
      "username": token.username,
      "ice_servers": token.ice_servers
    }
    logging.info(f"Token: {token_jsonable}")
    return func.HttpResponse(json.dumps(token_jsonable))
  else:
    return func.HttpResponse(
       "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
       status_code=200
    )
