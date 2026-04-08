from rest_framework.decorators import api_view
from rest_framework.response import Response
import datetime

@api_view(['GET'])
def test(request):
    return Response({
        "status": "ok",
        "message": "Django fonctionne !",
        "heure": datetime.datetime.now().strftime("%H:%M:%S"),
    })