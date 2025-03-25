from firebase_admin import messaging

def send_notification(token, title, body, data=None):
    """
    Sends a push notification to the device associated with the given FCM token.
    
    :param token: The FCM token of the target device.
    :param title: Title of the notification.
    :param body: Body text of the notification.
    :param data: Optional dictionary containing additional data.
    :return: The response from Firebase messaging.
    """
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        token=token,
        data=data or {}  
    )
    
    # This sends the notification to the specified device.
    response = messaging.send(message)
    return response