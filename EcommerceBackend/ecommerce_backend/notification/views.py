from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class UpdateFCMTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        fcm_token = request.data.get("fcm_token")

        if not fcm_token:
            return Response({"detail": "FCM token is required."}, status=status.HTTP_400_BAD_REQUEST)

        user.fcm_token = fcm_token
        user.save()

        return Response({"detail": "FCM token updated successfully."}, status=status.HTTP_200_OK)
